import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all classes (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
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
    const { schoolId, gradeLevel, academicYear, search } = req.query;

    const where: any = {};

    // Teachers can only view classes from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (gradeLevel) {
      where.gradeLevel = parseInt(gradeLevel);
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
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
          homeroomTeacher: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: [
          { gradeLevel: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.class.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        classes,
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

// Get class by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        students: {
          select: {
            id: true,
            fullName: true,
            code: true,
            email: true,
            phone: true,
            status: true,
            parent: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { fullName: 'asc' },
        },
        schedules: {
          include: {
            subject: {
              select: {
                name: true,
                code: true,
                color: true,
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
            { dayOfWeek: 'asc' },
            { period: 'asc' },
          ],
        },
        _count: {
          select: {
            students: true,
            schedules: true,
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

    // Students and parents can only view their own class
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

    res.status(200).json({
      success: true,
      data: classData,
    });
  })
);

// Create new class
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('code').notEmpty().withMessage('Class code is required'),
    body('name').notEmpty().withMessage('Class name is required'),
    body('gradeLevel').isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('homeroomTeacherId').optional().isInt().withMessage('Homeroom teacher ID must be an integer'),
    body('room').optional().isLength({ min: 1 }).withMessage('Room cannot be empty'),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be between 1 and 100'),
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
      gradeLevel,
      academicYear,
      homeroomTeacherId,
      room,
      maxStudents,
    } = req.body;

    // Teachers can only create classes in their school
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if class code already exists in the school
    const existingClass = await prisma.class.findFirst({
      where: {
        schoolId,
        code,
      },
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Class with this code already exists in the school',
        },
      });
    }

    // Verify homeroom teacher exists and belongs to the school
    if (homeroomTeacherId) {
      const teacherExists = await prisma.user.findFirst({
        where: {
          id: homeroomTeacherId,
          role: 'TEACHER',
          schoolId,
        },
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Homeroom teacher not found or does not belong to the specified school',
          },
        });
      }
    }

    const classData = await prisma.class.create({
      data: {
        schoolId,
        code,
        name,
        gradeLevel,
        academicYear,
        homeroomTeacherId,
        room,
        maxStudents: maxStudents || 30,
      },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: classData,
      message: 'Class created successfully',
    });
  })
);

// Update class
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('code').optional().notEmpty().withMessage('Class code cannot be empty'),
    body('name').optional().notEmpty().withMessage('Class name cannot be empty'),
    body('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
    body('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty'),
    body('homeroomTeacherId').optional().isInt().withMessage('Homeroom teacher ID must be an integer'),
    body('room').optional().isLength({ min: 1 }).withMessage('Room cannot be empty'),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be between 1 and 100'),
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

    const classId = parseInt(req.params.id);
    const {
      code,
      name,
      gradeLevel,
      academicYear,
      homeroomTeacherId,
      room,
      maxStudents,
    } = req.body;

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

    // Get existing class
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingClass.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (code && code !== existingClass.code) {
      // Check if new code already exists in the school
      const duplicateClass = await prisma.class.findFirst({
        where: {
          schoolId: existingClass.schoolId,
          code,
        },
      });

      if (duplicateClass) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Class with this code already exists in the school',
          },
        });
      }

      updateData.code = code;
    }

    if (name) updateData.name = name;
    if (gradeLevel) updateData.gradeLevel = gradeLevel;
    if (academicYear) updateData.academicYear = academicYear;
    if (room) updateData.room = room;
    if (maxStudents) updateData.maxStudents = maxStudents;

    // Handle homeroom teacher change
    if (homeroomTeacherId !== undefined) {
      if (homeroomTeacherId === null) {
        updateData.homeroomTeacherId = null;
      } else {
        // Verify teacher exists and belongs to the school
        const teacherExists = await prisma.user.findFirst({
          where: {
            id: homeroomTeacherId,
            role: 'TEACHER',
            schoolId: existingClass.schoolId,
          },
        });

        if (!teacherExists) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Homeroom teacher not found or does not belong to the school',
            },
          });
        }

        updateData.homeroomTeacherId = homeroomTeacherId;
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: updateData,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: 'Class updated successfully',
    });
  })
);

// Delete class
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            students: true,
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

    // Check if class has students
    if (classData._count.students > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete class with existing students',
        },
      });
    }

    await prisma.class.delete({
      where: { id: classId },
    });

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  })
);

// Add student to class
router.post('/:id/students',
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

    const classId = parseInt(req.params.id);
    const { studentId } = req.body;

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
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && classData.schoolId !== req.user.schoolId) {
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
    if (student.schoolId !== classData.schoolId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Student does not belong to the same school',
        },
      });
    }

    // Check if class is at capacity
    if (classData.currentStudents >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Class is at maximum capacity',
        },
      });
    }

    // Update student's class
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { classId },
      include: {
        class: {
          select: {
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
      },
    });

    // Update class student count
    await prisma.class.update({
      where: { id: classId },
      data: {
        currentStudents: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student added to class successfully',
    });
  })
);

// Remove student from class
router.delete('/:id/students/:studentId',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    if (isNaN(classId) || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID or student ID',
        },
      });
    }

    // Get class and check permissions
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Class not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && classData.schoolId !== req.user.schoolId) {
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

    // Check if student is in the class
    if (student.classId !== classId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Student is not in this class',
        },
      });
    }

    // Remove student from class
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { classId: null },
    });

    // Update class student count
    await prisma.class.update({
      where: { id: classId },
      data: {
        currentStudents: {
          decrement: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student removed from class successfully',
    });
  })
);

// Get class schedule
router.get('/:id/schedule',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

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

    // Students and parents can only view their own class schedule
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

    const schedule = await prisma.schedule.findMany({
      where: { classId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            credits: true,
          },
        },
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
        class: {
          id: classData.id,
          name: classData.name,
          code: classData.code,
          gradeLevel: classData.gradeLevel,
          academicYear: classData.academicYear,
        },
        schedule,
      },
    });
  })
);

// Get class statistics
router.get('/:id/statistics',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const classId = parseInt(req.params.id);

    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid class ID',
        },
      });
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
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

    const [
      studentsByStatus,
      studentsByGender,
      recentGrades,
      attendanceStats,
    ] = await Promise.all([
      prisma.student.groupBy({
        by: ['status'],
        where: { classId },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['gender'],
        where: { classId },
        _count: true,
      }),
      prisma.grade.findMany({
        where: {
          student: { classId },
        },
        include: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
          student: {
            select: {
              fullName: true,
              code: true,
            },
          },
        },
        orderBy: { gradedAt: 'desc' },
        take: 10,
      }),
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: {
          student: { classId },
          session: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            },
          },
        },
        _count: true,
      }),
    ]);

    const statistics = {
      class: {
        id: classData.id,
        name: classData.name,
        code: classData.code,
        gradeLevel: classData.gradeLevel,
        academicYear: classData.academicYear,
        maxStudents: classData.maxStudents,
        currentStudents: classData._count.students,
        totalSchedules: classData._count.schedules,
      },
      students: {
        byStatus: studentsByStatus.map((item: any) => ({
          status: item.status,
          count: item._count,
        })),
        byGender: studentsByGender.map((item: any) => ({
          gender: item.gender,
          count: item._count,
        })),
      },
      academics: {
        recentGrades,
        attendance: attendanceStats.map((item: any) => ({
          status: item.status,
          count: item._count,
        })),
      },
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

export default router;
