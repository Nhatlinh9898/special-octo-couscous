import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all materials
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('schoolId').optional().isInt(),
    query('subjectId').optional().isInt(),
    query('type').optional().isIn(['VIDEO', 'DOCUMENT', 'ASSIGNMENT', 'QUIZ', 'LINK']),
    query('search').optional().isLength({ min: 2 }),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { schoolId, subjectId, type, search } = req.query;

    const where: any = {};
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [materials, total] = await Promise.all([
      prisma.lMSMaterial.findMany({
        where, skip, take: limit,
        include: {
          subject: { select: { id: true, name: true, code: true, color: true } },
          postedByUser: { select: { id: true, fullName: true, email: true } },
          _count: { select: { assignments: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
      }),
      prisma.lMSMaterial.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: { materials, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  })
);

// Get material by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const materialId = parseInt(req.params.id);
    if (isNaN(materialId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid material ID' } });
    }

    const material = await prisma.lMSMaterial.findUnique({
      where: { id: materialId },
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        postedByUser: { select: { id: true, fullName: true, email: true } },
        assignments: {
          include: {
            student: { select: { id: true, fullName: true, code: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        _count: { select: { assignments: true } },
      },
    });

    if (!material) {
      return res.status(404).json({ success: false, error: { message: 'Material not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && material.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    res.status(200).json({ success: true, data: material });
  })
);

// Create new material
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('schoolId').isInt(),
    body('subjectId').isInt(),
    body('title').notEmpty(),
    body('description').optional().isLength({ min: 10 }),
    body('type').isIn(['VIDEO', 'DOCUMENT', 'ASSIGNMENT', 'QUIZ', 'LINK']),
    body('fileUrl').optional().isURL(),
    body('dueDate').optional().isISO8601(),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const {
      schoolId, subjectId, title, description, type, fileUrl, dueDate,
    } = req.body;

    // Permission check
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const material = await prisma.lMSMaterial.create({
      data: {
        schoolId,
        subjectId,
        title,
        description,
        type,
        fileUrl,
        deadline: dueDate ? new Date(dueDate) : null,
        postedBy: req.user.userId,
      },
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        postedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: material,
      message: 'Material created successfully',
    });
  })
);

// Update material
router.put('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('title').optional().notEmpty(),
    body('description').optional().isLength({ min: 10 }),
    body('type').optional().isIn(['VIDEO', 'DOCUMENT', 'ASSIGNMENT', 'QUIZ', 'LINK']),
    body('fileUrl').optional().isURL(),
    body('dueDate').optional().isISO8601(),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const materialId = parseInt(req.params.id);
    const { title, description, type, fileUrl, dueDate } = req.body;

    if (isNaN(materialId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid material ID' } });
    }

    const existingMaterial = await prisma.lMSMaterial.findUnique({ where: { id: materialId } });
    if (!existingMaterial) {
      return res.status(404).json({ success: false, error: { message: 'Material not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && existingMaterial.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (dueDate) updateData.deadline = new Date(dueDate);

    const updatedMaterial = await prisma.lMSMaterial.update({
      where: { id: materialId },
      data: updateData,
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        postedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedMaterial,
      message: 'Material updated successfully',
    });
  })
);

// Delete material
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const materialId = parseInt(req.params.id);
    if (isNaN(materialId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid material ID' } });
    }

    const material = await prisma.lMSMaterial.findUnique({
      where: { id: materialId },
      include: { _count: { select: { assignments: true } } },
    });

    if (!material) {
      return res.status(404).json({ success: false, error: { message: 'Material not found' } });
    }

    if (material._count.assignments > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete material with existing assignments' },
      });
    }

    await prisma.lMSMaterial.delete({ where: { id: materialId } });

    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  })
);

// Get materials for a specific subject
router.get('/subject/:subjectId',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const subjectId = parseInt(req.params.subjectId);
    if (isNaN(subjectId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid subject ID' } });
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && subject.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const materials = await prisma.lMSMaterial.findMany({
      where: { subjectId },
      include: {
        postedByUser: { select: { id: true, fullName: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
    });

    res.status(200).json({
      success: true,
      data: { subject: { id: subject.id, name: subject.name, code: subject.code }, materials },
    });
  })
);

// Get material statistics
router.get('/statistics/overview',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = req.user.role === 'TEACHER' ? req.user.schoolId : parseInt(req.query.schoolId);

    const [totalMaterials, materialsByType, materialsBySubject, recentMaterials] = await Promise.all([
      prisma.lMSMaterial.count({ where: { schoolId } }),
      prisma.lMSMaterial.groupBy({ by: ['type'], where: { schoolId }, _count: true }),
      prisma.lMSMaterial.groupBy({ by: ['subjectId'], where: { schoolId }, _count: true }),
      prisma.lMSMaterial.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          subject: { select: { name: true, code: true } },
          postedByUser: { select: { fullName: true } },
          _count: { select: { assignments: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { total: totalMaterials },
        byType: materialsByType.map((item: { type: string; _count: number }) => ({ type: item.type, count: item._count })),
        bySubject: materialsBySubject.map((item: { subjectId: number; _count: number }) => ({ subjectId: item.subjectId, count: item._count })),
        recentMaterials,
      },
    });
  })
);

export default router;
