import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// Get all subjects (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('search').optional().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { schoolId, search } = req.query;

    const where: any = {};

    // Teachers can only view subjects from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          school: {
            select: {
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              schedules: true,
              exams: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        subjects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get subject by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const subjectId = parseInt(req.params.id);

    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid subject ID',
        },
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        schedules: {
          include: {
            class: {
              select: {
                name: true,
                code: true,
                gradeLevel: true,
              },
            },
            teacher: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: [
            { class: { gradeLevel: 'asc' } },
            { dayOfWeek: 'asc' },
            { period: 'asc' },
          ],
        },
        exams: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            scheduledAt: true,
            status: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        grades: {
          select: {
            id: true,
            score: true,
            maxScore: true,
            gradeType: true,
            semester: true,
            academicYear: true,
            student: {
              select: {
                fullName: true,
                code: true,
              },
            },
          },
          orderBy: { gradedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            schedules: true,
            exams: true,
            grades: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Subject not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && subject.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  })
);

// Create new subject
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('code').notEmpty().withMessage('Subject code is required'),
    body('name').notEmpty().withMessage('Subject name is required'),
    body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const {
      schoolId,
      code,
      name,
      description,
      credits,
      color,
    } = req.body;

    // Teachers can only create subjects in their school
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if subject code already exists in the school
    const existingSubject = await prisma.subject.findFirst({
      where: {
        schoolId,
        code,
      },
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Subject with this code already exists in the school',
        },
      });
    }

    const subject = await prisma.subject.create({
      data: {
        schoolId,
        code,
        name,
        description,
        credits: credits || 1,
        color: color || '#3B82F6',
      },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
  })
);

// Update subject
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('code').optional().notEmpty().withMessage('Subject code cannot be empty'),
    body('name').optional().notEmpty().withMessage('Subject name cannot be empty'),
    body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const subjectId = parseInt(req.params.id);
    const {
      code,
      name,
      description,
      credits,
      color,
    } = req.body;

    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid subject ID',
        },
      });
    }

    // Get existing subject
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Subject not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingSubject.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (code && code !== existingSubject.code) {
      // Check if new code already exists in the school
      const duplicateSubject = await prisma.subject.findFirst({
        where: {
          schoolId: existingSubject.schoolId,
          code,
        },
      });

      if (duplicateSubject) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Subject with this code already exists in the school',
          },
        });
      }

      updateData.code = code;
    }

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (credits) updateData.credits = credits;
    if (color) updateData.color = color;

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: updateData,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            exams: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedSubject,
      message: 'Subject updated successfully',
    });
  })
);

// Delete subject
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const subjectId = parseInt(req.params.id);

    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid subject ID',
        },
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        _count: {
          select: {
            schedules: true,
            exams: true,
            grades: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Subject not found',
        },
      });
    }

    // Check if subject has associated data
    if (
      subject._count.schedules > 0 ||
      subject._count.exams > 0 ||
      subject._count.grades > 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete subject with associated schedules, exams, or grades',
        },
      });
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  })
);

// Get subject statistics
router.get('/statistics/overview',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = req.user.role === 'TEACHER' ? req.user.schoolId : parseInt(req.query.schoolId as string);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'School ID is required',
        },
      });
    }

    const [
      totalSubjects,
      subjectsByCredits,
      subjectsWithMostClasses,
      subjectsWithMostSchedules,
      recentSubjects,
    ] = await Promise.all([
      prisma.subject.count({ where: { schoolId } }),
      prisma.subject.groupBy({
        by: ['credits'],
        where: { schoolId },
        _count: true,
      }),
      prisma.subject.findMany({
        where: { schoolId },
        orderBy: {
          schedules: {
            _count: 'desc',
          },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          credits: true,
          color: true,
          _count: {
            select: {
              schedules: true,
            },
          },
        },
      }),
      prisma.subject.findMany({
        where: { schoolId },
        orderBy: {
          schedules: {
            _count: 'desc',
          },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          credits: true,
          color: true,
          _count: {
            select: {
              schedules: true,
            },
          },
        },
      }),
      prisma.subject.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          credits: true,
          color: true,
          createdAt: true,
        },
      }),
    ]);

    const statistics = {
      overview: {
        total: totalSubjects,
      },
      byCredits: subjectsByCredits.map((item: { credits: number; _count: number }) => ({
        credits: item.credits,
        count: item._count,
      })),
      topClasses: subjectsWithMostClasses,
      topSchedules: subjectsWithMostSchedules,
      recentSubjects,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

// Get subjects for a specific class
router.get('/class/:classId',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.classId);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

    // Get class and check permissions
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && classData.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Students and parents can only view their own class subjects
    if (req.user.role === 'STUDENT' || req.user.role === 'PARENT') {
      const studentClass = await prisma.student.findFirst({
        where: {
          OR: [
            { email: req.user.email },
            { parent: { email: req.user.email } },
          ],
          classId,
        },
      });

      if (!studentClass) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schedules: {
          some: {
            classId,
          },
        },
      },
      include: {
        schedules: {
          where: { classId },
          select: {
            dayOfWeek: true,
            period: true,
            room: true,
            teacher: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            schedules: {
              where: { classId },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: {
        class: {
          id: classData.id,
          name: classData.name,
          code: classData.code,
          gradeLevel: classData.gradeLevel,
        },
        subjects,
      },
    });
  })
);

export default router;
