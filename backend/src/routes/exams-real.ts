import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all exams
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('schoolId').optional().isInt(),
    query('subjectId').optional().isInt(),
    query('classId').optional().isInt(),
    query('type').optional().isIn(['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT']),
    query('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
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
    const { schoolId, subjectId, classId, type, status, search } = req.query;

    const where: any = {};
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (classId) where.classId = parseInt(classId);
    if (type) where.type = type;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where, skip, take: limit,
        include: {
          subject: { select: { id: true, name: true, code: true, color: true } },
          createdBy: { select: { id: true, fullName: true, email: true } },
          _count: { select: { grades: true } },
        },
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.exam.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: { exams, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  })
);

// Get exam by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const examId = parseInt(req.params.id);
    if (isNaN(examId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid exam ID' } });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        grades: {
          include: {
            student: { select: { id: true, fullName: true, code: true } },
            grader: { select: { id: true, fullName: true } },
          },
          orderBy: { gradedAt: 'desc' },
        },
        _count: { select: { grades: true } },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && exam.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    res.status(200).json({ success: true, data: exam });
  })
);

// Create new exam
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('schoolId').isInt(),
    body('subjectId').isInt(),
    body('title').notEmpty(),
    body('description').optional().isLength({ min: 10 }),
    body('type').isIn(['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT']),
    body('maxScore').isFloat({ min: 1, max: 100 }),
    body('duration').isInt({ min: 1 }),
    body('scheduledAt').isISO8601(),
    body('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
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
      schoolId, subjectId, title, description, type, maxScore, duration, scheduledAt, status,
    } = req.body;

    // Permission check
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const exam = await prisma.exam.create({
      data: {
        schoolId,
        subjectId,
        title,
        description,
        type,
        maxScore: parseFloat(maxScore),
        duration,
        scheduledAt: new Date(scheduledAt),
        status: status || 'UPCOMING',
        createdBy: req.user.userId,
      },
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Exam created successfully',
    });
  })
);

// Update exam
router.put('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('title').optional().notEmpty(),
    body('description').optional().isLength({ min: 10 }),
    body('type').optional().isIn(['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT']),
    body('maxScore').optional().isFloat({ min: 1, max: 100 }),
    body('duration').optional().isInt({ min: 1 }),
    body('scheduledAt').optional().isISO8601(),
    body('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const examId = parseInt(req.params.id);
    const { title, description, type, maxScore, duration, scheduledAt, status } = req.body;

    if (isNaN(examId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid exam ID' } });
    }

    const existingExam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!existingExam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && existingExam.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (maxScore) updateData.maxScore = parseFloat(maxScore);
    if (duration) updateData.duration = duration;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (status) updateData.status = status;

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
      include: {
        subject: { select: { id: true, name: true, code: true, color: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedExam,
      message: 'Exam updated successfully',
    });
  })
);

// Delete exam
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const examId = parseInt(req.params.id);
    if (isNaN(examId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid exam ID' } });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { grades: true } } },
    });

    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }

    if (exam._count.grades > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete exam with existing grades' },
      });
    }

    await prisma.exam.delete({ where: { id: examId } });

    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  })
);

// Get exam statistics
router.get('/statistics/overview',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = req.user.role === 'TEACHER' ? req.user.schoolId : parseInt(req.query.schoolId);

    const [totalExams, examsByType, examsByStatus, examsBySubject, recentExams] = await Promise.all([
      prisma.exam.count({ where: { schoolId } }),
      prisma.exam.groupBy({ by: ['type'], where: { schoolId }, _count: true }),
      prisma.exam.groupBy({ by: ['status'], where: { schoolId }, _count: true }),
      prisma.exam.groupBy({ by: ['subjectId'], where: { schoolId }, _count: true }),
      prisma.exam.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          subject: { select: { name: true, code: true } },
          _count: { select: { grades: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { total: totalExams },
        byType: examsByType.map((item: any) => ({ type: item.type, count: item._count })),
        byStatus: examsByStatus.map((item: any) => ({ status: item.status, count: item._count })),
        bySubject: examsBySubject.map((item: any) => ({ subjectId: item.subjectId, count: item._count })),
        recentExams,
      },
    });
  })
);

// Get exams for a specific subject
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

    const exams = await prisma.exam.findMany({
      where: { subjectId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { grades: true } },
      },
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
    });

    res.status(200).json({
      success: true,
      data: { subject: { id: subject.id, name: subject.name, code: subject.code }, exams },
    });
  })
);

export default router;
