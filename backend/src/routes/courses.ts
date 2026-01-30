import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all courses (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('type').optional().isLength({ min: 1 }).withMessage('Type cannot be empty'),
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
    const { schoolId, type, search } = req.query;

    const where: any = {};

    // Teachers can only view courses from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
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
              enrollments: true,
              schedules: true,
            },
          },
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses,
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

// Get course by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID',
        },
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
            teacher: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { period: 'asc' },
          ],
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                code: true,
                email: true,
                class: {
                  select: {
                    name: true,
                    gradeLevel: true,
                  },
                },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        _count: {
          select: {
            enrollments: true,
            schedules: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && course.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  })
);

// Create new course
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('code').notEmpty().withMessage('Course code is required'),
    body('name').notEmpty().withMessage('Course name is required'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('type').optional().isLength({ min: 1 }).withMessage('Type cannot be empty'),
    body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('maxStudents').optional().isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200'),
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
      type,
      credits,
      maxStudents,
    } = req.body;

    // Teachers can only create courses in their school
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if course code already exists in the school
    const existingCourse = await prisma.course.findFirst({
      where: {
        schoolId,
        code,
      },
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Course with this code already exists in the school',
        },
      });
    }

    const course = await prisma.course.create({
      data: {
        schoolId,
        code,
        name,
        description,
        type: type || 'REGULAR',
        credits: credits || 1,
        maxStudents: maxStudents || 30,
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
            enrollments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  })
);

// Update course
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('code').optional().notEmpty().withMessage('Course code cannot be empty'),
    body('name').optional().notEmpty().withMessage('Course name cannot be empty'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('type').optional().isLength({ min: 1 }).withMessage('Type cannot be empty'),
    body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('maxStudents').optional().isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200'),
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

    const courseId = parseInt(req.params.id);
    const {
      code,
      name,
      description,
      type,
      credits,
      maxStudents,
    } = req.body;

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID',
        },
      });
    }

    // Get existing course
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingCourse.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (code && code !== existingCourse.code) {
      // Check if new code already exists in the school
      const duplicateCourse = await prisma.course.findFirst({
        where: {
          schoolId: existingCourse.schoolId,
          code,
        },
      });

      if (duplicateCourse) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Course with this code already exists in the school',
          },
        });
      }

      updateData.code = code;
    }

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (credits) updateData.credits = credits;
    if (maxStudents) updateData.maxStudents = maxStudents;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
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
            enrollments: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully',
    });
  })
);

// Delete course
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID',
        },
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    // Check if course has enrollments
    if (course._count.enrollments > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete course with existing enrollments',
        },
      });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  })
);

// Enroll student in course
router.post('/:id/enrollments',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('studentId').isInt().withMessage('Student ID must be an integer'),
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

    const courseId = parseInt(req.params.id);
    const { studentId } = req.body;

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID',
        },
      });
    }

    // Get course and check permissions
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && course.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
        },
      });
    }

    // Check if student belongs to the same school
    if (student.schoolId !== course.schoolId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Student does not belong to the same school',
        },
      });
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Student is already enrolled in this course',
        },
      });
    }

    // Check if course is at capacity
    const currentEnrollments = await prisma.courseEnrollment.count({
      where: { courseId },
    });

    if (currentEnrollments >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Course is at maximum capacity',
        },
      });
    }

    // Enroll student in course
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
            class: {
              select: {
                name: true,
                gradeLevel: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Student enrolled in course successfully',
    });
  })
);

// Remove student from course
router.delete('/:id/enrollments/:studentId',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  asyncHandler(async (req: any, res: any) => {
    const courseId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    if (isNaN(courseId) || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID or student ID',
        },
      });
    }

    // Get course and check permissions
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && course.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if enrollment exists
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student is not enrolled in this course',
        },
      });
    }

    // Remove student from course
    await prisma.courseEnrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Student removed from course successfully',
    });
  })
);

// Get course schedule
router.get('/:id/schedule',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid course ID',
        },
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && course.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const schedules = await prisma.courseSchedule.findMany({
      where: { courseId },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { period: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          type: course.type,
        },
        schedules,
      },
    });
  })
);

export default router;
