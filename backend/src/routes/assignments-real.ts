import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all assignments
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('materialId').optional().isInt(),
    query('studentId').optional().isInt(),
    query('status').optional().isIn(['PENDING', 'SUBMITTED', 'GRADED', 'RETURNED']),
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
    const { materialId, studentId, status, search } = req.query;

    const where: any = {};
    if (materialId) where.materialId = parseInt(materialId);
    if (studentId) where.studentId = parseInt(studentId);
    if (status) where.status = status;

    // Teachers can only view assignments from their school
    if (req.user.role === 'TEACHER') {
      where.material = {
        schoolId: req.user.schoolId,
      };
    }

    if (search) {
      where.OR = [
        { material: { title: { contains: search, mode: 'insensitive' } } },
        { student: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where, skip, take: limit,
        include: {
          material: {
            select: {
              id: true,
              title: true,
              type: true,
              subject: {
                select: { id: true, name: true, code: true, color: true },
              },
            },
          },
          student: {
            select: {
              id: true,
              fullName: true,
              code: true,
              email: true,
              class: {
                select: { name: true, code: true, gradeLevel: true },
              },
            },
          },
          grades: {
            select: {
              id: true,
              score: true,
              maxScore: true,
              gradedAt: true,
            },
          },
        },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.assignment.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: { assignments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  })
);

// Get assignment by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const assignmentId = parseInt(req.params.id);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid assignment ID' } });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            fileUrl: true,
            deadline: true,
            schoolId: true,
            subject: {
              select: { id: true, name: true, code: true, color: true },
            },
            postedByUser: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
            email: true,
            class: {
              select: { name: true, code: true, gradeLevel: true },
            },
            parent: {
              select: { fullName: true, email: true, phone: true },
            },
          },
        },
        grades: {
          include: {
            grader: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && assignment.material.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    // Students and parents can only view their own assignments
    if (req.user.role === 'STUDENT' && assignment.studentId !== req.user.userId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    if (req.user.role === 'PARENT') {
      const parentStudent = await prisma.student.findFirst({
        where: {
          parentId: req.user.userId,
          id: assignment.studentId,
        },
      });

      if (!parentStudent) {
        return res.status(403).json({ success: false, error: { message: 'Access denied' } });
      }
    }

    res.status(200).json({ success: true, data: assignment });
  })
);

// Create assignment
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('materialId').isInt(),
    body('studentId').isInt(),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const { materialId, studentId } = req.body;

    // Get material and check permissions
    const material = await prisma.lMSMaterial.findUnique({
      where: { id: materialId },
      select: { schoolId: true, subjectId: true },
    });

    if (!material) {
      return res.status(400).json({ success: false, error: { message: 'Material not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && material.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(400).json({ success: false, error: { message: 'Student not found' } });
    }

    // Check for existing assignment
    const existingAssignment = await prisma.assignment.findFirst({
      where: { materialId, studentId },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: { message: 'Assignment already exists for this student and material' },
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        materialId,
        studentId,
        status: 'PENDING',
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            deadline: true,
            subject: {
              select: { name: true, code: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
            class: {
              select: { name: true, code: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created successfully',
    });
  })
);

// Submit assignment
router.post('/:id/submit',
  authenticate,
  authorize('STUDENT'),
  [
    body('content').notEmpty(),
    body('fileUrl').optional().isURL(),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const assignmentId = parseInt(req.params.id);
    const { content, fileUrl } = req.body;

    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid assignment ID' } });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        material: { select: { deadline: true } },
      },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }

    // Students can only submit their own assignments
    if (assignment.studentId !== req.user.userId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    if (assignment.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: { message: 'Assignment has already been submitted' },
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        content,
        submissionUrl: fileUrl || undefined,
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            subject: {
              select: { name: true, code: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment submitted successfully',
    });
  })
);

// Grade assignment
router.post('/:id/grade',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('score').isFloat({ min: 0, max: 100 }),
    body('maxScore').isFloat({ min: 1, max: 100 }),
    body('feedback').optional().isLength({ min: 5 }),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const assignmentId = parseInt(req.params.id);
    const { score, maxScore, feedback, semester, academicYear } = req.body;

    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid assignment ID' } });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        material: { select: { schoolId: true, subjectId: true } },
      },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }

    // Permission check
    if (req.user.role === 'TEACHER' && assignment.material.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    if (assignment.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Assignment must be submitted before grading' },
      });
    }

    // Validate score
    if (score > maxScore) {
      return res.status(400).json({
        success: false,
        error: { message: 'Score cannot be greater than max score' },
      });
    }

    // Update assignment status
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'GRADED',
        gradedAt: new Date(),
        feedback,
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            subject: {
              select: { name: true, code: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
          },
        },
      },
    });

    // Create grade record
    const grade = await prisma.grade.create({
      data: {
        studentId: assignment.studentId,
        subjectId: assignment.material.subjectId,
        assignmentId,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        gradeType: 'ASSIGNMENT',
        semester,
        academicYear,
        gradedBy: req.user.userId,
        gradedAt: new Date(),
      },
      include: {
        student: { select: { fullName: true, code: true } },
        subject: { select: { name: true, code: true } },
        grader: { select: { fullName: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: { assignment: updatedAssignment, grade },
      message: 'Assignment graded successfully',
    });
  })
);

// Get assignment statistics
router.get('/statistics/overview',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = req.user.role === 'TEACHER' ? req.user.schoolId : parseInt(req.query.schoolId);

    const [totalAssignments, assignmentsByStatus, recentAssignments] = await Promise.all([
      prisma.assignment.count({
        where: { material: { schoolId } },
      }),
      prisma.assignment.groupBy({
        by: ['status'],
        where: { material: { schoolId } },
        _count: true,
      }),
      prisma.assignment.findMany({
        where: { material: { schoolId } },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        include: {
          material: {
            select: {
              title: true,
              subject: { select: { name: true, code: true } },
            },
          },
          student: { select: { fullName: true, code: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { total: totalAssignments },
        byStatus: assignmentsByStatus.map((item: { status: string; _count: number }) => ({ status: item.status, count: item._count })),
        recentAssignments,
      },
    });
  })
);

export default router;
