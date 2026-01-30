import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all schedules (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('classId').optional().isInt().withMessage('Class ID must be an integer'),
    query('subjectId').optional().isInt().withMessage('Subject ID must be an integer'),
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('dayOfWeek').optional().isInt({ min: 1, max: 7 }).withMessage('Day of week must be between 1 and 7'),
    query('period').optional().isInt({ min: 1, max: 8 }).withMessage('Period must be between 1 and 8'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
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
    const {
      classId,
      subjectId,
      teacherId,
      schoolId,
      dayOfWeek,
      period,
      semester,
      academicYear,
      search,
    } = req.query;

    const where: any = {};

    // Teachers can only view schedules from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (classId) {
      where.classId = parseInt(classId);
    }

    if (subjectId) {
      where.subjectId = parseInt(subjectId);
    }

    if (teacherId) {
      where.teacherId = parseInt(teacherId);
    }

    if (dayOfWeek) {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    if (period) {
      where.period = parseInt(period);
    }

    if (semester) {
      where.semester = semester;
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (search) {
      where.OR = [
        { room: { contains: search, mode: 'insensitive' } },
        { class: { name: { contains: search, mode: 'insensitive' } } },
        { subject: { name: { contains: search, mode: 'insensitive' } } },
        { teacher: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
            },
          },
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
          { class: { gradeLevel: 'asc' } },
          { class: { name: 'asc' } },
        ],
      }),
      prisma.schedule.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        schedules,
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

// Get schedule by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const scheduleId = parseInt(req.params.id);

    if (isNaN(scheduleId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid schedule ID',
        },
      });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
            academicYear: true,
            schoolId: true,
            homeroomTeacher: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            credits: true,
            description: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Schedule not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && schedule.class.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Students and parents can only view their own class schedules
    if (req.user.role === 'STUDENT' || req.user.role === 'PARENT') {
      const studentClass = await prisma.student.findFirst({
        where: {
          OR: [
            { email: req.user.email },
            { parent: { email: req.user.email } },
          ],
          classId: schedule.classId,
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
      data: schedule,
    });
  })
);

// Create new schedule
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('classId').isInt().withMessage('Class ID must be an integer'),
    body('subjectId').isInt().withMessage('Subject ID must be an integer'),
    body('teacherId').isInt().withMessage('Teacher ID must be an integer'),
    body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Day of week must be between 1 and 7'),
    body('period').isInt({ min: 1, max: 8 }).withMessage('Period must be between 1 and 8'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('room').optional().isLength({ min: 1 }).withMessage('Room cannot be empty'),
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
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      period,
      semester,
      academicYear,
      room,
    } = req.body;

    // Teachers can only create schedules in their school
    if (req.user.role === 'TEACHER') {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: { schoolId: true },
      });

      if (!classData || classData.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Class not found',
        },
      });
    }

    // Verify subject exists and belongs to the school
    const subjectExists = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        schoolId: classExists.schoolId,
      },
    });

    if (!subjectExists) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Subject not found or does not belong to the school',
        },
      });
    }

    // Verify teacher exists and belongs to the school
    const teacherExists = await prisma.user.findFirst({
      where: {
        id: teacherId,
        role: 'TEACHER',
        schoolId: classExists.schoolId,
      },
    });

    if (!teacherExists) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Teacher not found or does not belong to the school',
        },
      });
    }

    // Check for schedule conflicts
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        classId,
        dayOfWeek,
        period,
        semester,
        academicYear,
      },
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Schedule conflict: Class already has a subject at this time',
          existingSchedule: {
            subject: existingSchedule.subjectId,
            teacher: existingSchedule.teacherId,
          },
        },
      });
    }

    // Check teacher availability
    const teacherSchedule = await prisma.schedule.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        period,
        semester,
        academicYear,
      },
    });

    if (teacherSchedule) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Teacher is already scheduled at this time',
          existingSchedule: {
            class: teacherSchedule.classId,
            subject: teacherSchedule.subjectId,
          },
        },
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        period,
        semester,
        academicYear,
        room,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
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
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
    });
  })
);

// Update schedule
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('subjectId').optional().isInt().withMessage('Subject ID must be an integer'),
    body('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    body('dayOfWeek').optional().isInt({ min: 1, max: 7 }).withMessage('Day of week must be between 1 and 7'),
    body('period').optional().isInt({ min: 1, max: 8 }).withMessage('Period must be between 1 and 8'),
    body('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    body('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
    body('room').optional().isLength({ min: 1 }).withMessage('Room cannot be empty'),
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

    const scheduleId = parseInt(req.params.id);
    const {
      subjectId,
      teacherId,
      dayOfWeek,
      period,
      semester,
      academicYear,
      room,
    } = req.body;

    if (isNaN(scheduleId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid schedule ID',
        },
      });
    }

    // Get existing schedule
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        class: {
          select: {
            schoolId: true,
          },
        },
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Schedule not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingSchedule.class.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (subjectId && subjectId !== existingSchedule.subjectId) {
      // Verify new subject exists and belongs to the school
      const subjectExists = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId: existingSchedule.class.schoolId,
        },
      });

      if (!subjectExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Subject not found or does not belong to the school',
          },
        });
      }

      updateData.subjectId = subjectId;
    }

    if (teacherId && teacherId !== existingSchedule.teacherId) {
      // Verify new teacher exists and belongs to the school
      const teacherExists = await prisma.user.findFirst({
        where: {
          id: teacherId,
          role: 'TEACHER',
          schoolId: existingSchedule.class.schoolId,
        },
      });

      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Teacher not found or does not belong to the school',
          },
        });
      }

      updateData.teacherId = teacherId;
    }

    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek;
    if (period) updateData.period = period;
    if (semester) updateData.semester = semester;
    if (academicYear) updateData.academicYear = academicYear;
    if (room) updateData.room = room;

    // Check for conflicts if changing time slot
    if (dayOfWeek || period) {
      const newDayOfWeek = dayOfWeek || existingSchedule.dayOfWeek;
      const newPeriod = period || existingSchedule.period;

      const conflictSchedule = await prisma.schedule.findFirst({
        where: {
          classId: existingSchedule.classId,
          dayOfWeek: newDayOfWeek,
          period: newPeriod,
          semester: semester || existingSchedule.semester,
          academicYear: academicYear || existingSchedule.academicYear,
          id: { not: scheduleId },
        },
      });

      if (conflictSchedule) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Schedule conflict: Class already has a subject at this time',
            conflictSchedule: {
              subject: conflictSchedule.subjectId,
              teacher: conflictSchedule.teacherId,
            },
          },
        });
      }

      // Check teacher availability if changing teacher
      if (teacherId && teacherId !== existingSchedule.teacherId) {
        const teacherConflict = await prisma.schedule.findFirst({
          where: {
            teacherId,
            dayOfWeek: newDayOfWeek,
            period: newPeriod,
            semester: semester || existingSchedule.semester,
            academicYear: academicYear || existingSchedule.academicYear,
            id: { not: scheduleId },
          },
        });

        if (teacherConflict) {
          return res.status(409).json({
            success: false,
            error: {
              message: 'Teacher is already scheduled at this time',
              conflictSchedule: {
                class: teacherConflict.classId,
                subject: teacherConflict.subjectId,
              },
            },
          });
        }
      }
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
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
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully',
    });
  })
);

// Delete schedule
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const scheduleId = parseInt(req.params.id);

    if (isNaN(scheduleId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid schedule ID',
        },
      });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Schedule not found',
        },
      });
    }

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  })
);

// Get schedule for a specific class
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

    // Students and parents can only view their own class schedules
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

    const schedules = await prisma.schedule.findMany({
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
        schedules,
      },
    });
  })
);

// Get schedule for a specific teacher
router.get('/teacher/:teacherId',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const teacherId = parseInt(req.params.teacherId);

    if (isNaN(teacherId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid teacher ID',
        },
      });
    }

    // Teachers can only view their own schedules
    if (req.user.role === 'TEACHER' && teacherId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        schoolId: true,
      },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Teacher not found',
        },
      });
    }

    const schedules = await prisma.schedule.findMany({
      where: { teacherId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            credits: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { period: 'asc' },
        { class: { gradeLevel: 'asc' } },
        { class: { name: 'asc' } },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        teacher,
        schedules,
      },
    });
  })
);

// Get schedule statistics
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
      totalSchedules,
      schedulesByDay,
      schedulesByPeriod,
      schedulesByTeacher,
      schedulesBySubject,
      busyTimeSlots,
      recentSchedules,
    ] = await Promise.all([
      prisma.schedule.count({ where: { class: { schoolId } } }),
      prisma.schedule.groupBy({
        by: ['dayOfWeek'],
        where: { class: { schoolId } },
        _count: true,
      }),
      prisma.schedule.groupBy({
        by: ['period'],
        where: { class: { schoolId } },
        _count: true,
      }),
      prisma.schedule.groupBy({
        by: ['teacherId'],
        where: { class: { schoolId } },
        _count: true,
      }),
      prisma.schedule.groupBy({
        by: ['subjectId'],
        where: { class: { schoolId } },
        _count: true,
      }),
      prisma.schedule.findMany({
        where: {
          class: { schoolId },
          dayOfWeek: { gte: 1, lte: 5 },
          period: { gte: 1, lte: 8 },
        },
        select: {
          dayOfWeek: true,
          period: true,
        },
        distinct: ['dayOfWeek', 'period'],
      }),
      prisma.schedule.findMany({
        where: { class: { schoolId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true,
            },
          },
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
      }),
    ]);

    const statistics = {
      overview: {
        total: totalSchedules,
      },
      byDay: schedulesByDay.map((item: any) => ({
        dayOfWeek: item.dayOfWeek,
        count: item._count,
      })),
      byPeriod: schedulesByPeriod.map((item: any) => ({
        period: item.period,
        count: item._count,
      })),
      byTeacher: schedulesByTeacher.map((item: any) => ({
        teacherId: item.teacherId,
        count: item._count,
      })),
      bySubject: schedulesBySubject.map((item: any) => ({
        subjectId: item.subjectId,
        count: item._count,
      })),
      busyTimeSlots: busyTimeSlots.length,
      recentSchedules,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

// Get available time slots for scheduling
router.get('/available-slots',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const {
      classId,
      dayOfWeek,
      period,
      semester,
      academicYear,
    } = req.query;

    if (!classId || !dayOfWeek || !period || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Class ID, day of week, period, semester, and academic year are required',
        },
      });
    }

    // Teachers can only view their own school's schedules
    const where: any = {
      classId: parseInt(classId),
      dayOfWeek: parseInt(dayOfWeek),
      period: parseInt(period),
      semester,
      academicYear,
    };

    if (req.user.role === 'TEACHER') {
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
        select: { schoolId: true },
      });

      if (!classData || classData.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }

      where.schoolId = classData.schoolId;
    } else {
      where.schoolId = parseInt(req.query.schoolId as string);
    }

    const existingSchedules = await prisma.schedule.findMany({
      where,
      select: {
        dayOfWeek: true,
        period: true,
        teacherId: true,
      },
    });

    const occupiedSlots = new Set(
      existingSchedules.map((s: { dayOfWeek: number; period: number; teacherId: number }) => `${s.dayOfWeek}-${s.period}-${s.teacherId}`)
    );

    // Generate all possible time slots (1-7 for days, 1-8 for periods)
    const availableSlots = [];
    for (let day = 1; day <= 7; day++) {
      for (let period = 1; period <= 8; period++) {
        if (!occupiedSlots.has(`${day}-${period}`)) {
          availableSlots.push({
            dayOfWeek: day,
            period,
            available: true,
          });
        }
      }
    }

    // Get available teachers for each slot
    const availableSlotsWithTeachers = await Promise.all(
      availableSlots.map(async (slot) => {
        const availableTeachers = await prisma.user.findMany({
          where: {
            role: 'TEACHER',
            schoolId: where.schoolId,
            schedules: {
              none: {
                dayOfWeek: slot.dayOfWeek,
                period: slot.period,
                semester,
                academicYear,
              },
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        });

        return {
          ...slot,
          availableTeachers,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        parameters: {
          classId,
          dayOfWeek,
          period,
          semester,
          academicYear,
        },
        availableSlots: availableSlotsWithTeachers,
      },
    });
  })
);

export default router;
