import { Router } from 'express';
const { query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get teacher's complete timetable (class + courses + clubs)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
    query('weekStart').optional().isISO8601().withMessage('Week start must be a valid date'),
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

    const { teacherId, semester, academicYear } = req.query;
    
    // Determine which teacher's timetable to view
    let targetTeacherId: number;
    
    if (req.user.role === 'TEACHER') {
      // Teachers can only view their own timetable
      targetTeacherId = req.user.userId;
    } else {
      // Admins can view any teacher's timetable if teacherId is provided
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Teacher ID is required for admins',
          },
        });
      }
      
      targetTeacherId = parseInt(teacherId as string);
    }

    // Get teacher information
    const teacher = await prisma.user.findUnique({
      where: { 
        id: targetTeacherId,
        role: 'TEACHER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Teacher not found',
        },
      });
    }

    const currentSemester = semester || 'FALL';
    const currentAcademicYear = academicYear || '2024-2025';

    // Get all schedule types in parallel
    const [
      classSchedules,
      courseSchedules,
      clubSchedules,
      advisedClubs,
    ] = await Promise.all([
      // Class schedules (as subject teacher)
      prisma.schedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
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
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { period: 'asc' },
        ],
      }),

      // Course schedules
      prisma.courseSchedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { period: 'asc' },
        ],
      }),

      // Club schedules (as club advisor/supervisor)
      prisma.clubSchedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      }),

      // Clubs advised by this teacher
      prisma.club.findMany({
        where: {
          advisorId: targetTeacherId,
        },
        select: {
          id: true,
          name: true,
          category: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
    ]);

    // Format the response
    const formattedTimetable = {
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        school: teacher.school,
      },
      semester: currentSemester,
      academicYear: currentAcademicYear,
      schedules: {
        class: classSchedules.map((schedule: any) => ({
          id: schedule.id,
          type: 'CLASS',
          dayOfWeek: schedule.dayOfWeek,
          period: schedule.period,
          room: schedule.room,
          class: schedule.class,
          subject: schedule.subject,
        })),
        courses: courseSchedules.map((schedule: any) => ({
          id: schedule.id,
          type: 'COURSE',
          dayOfWeek: schedule.dayOfWeek,
          period: schedule.period,
          room: schedule.room,
          course: schedule.course,
        })),
        clubs: clubSchedules.map((schedule: any) => ({
          id: schedule.id,
          type: 'CLUB',
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          club: schedule.club,
        })),
      },
      advisedClubs,
    };

    res.status(200).json({
      success: true,
      data: formattedTimetable,
    });
  })
);

// Get teacher's weekly timetable view
router.get('/weekly',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('weekStart').isISO8601().withMessage('Week start must be a valid date'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
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

    const { teacherId, weekStart, semester, academicYear } = req.query;
    
    if (!weekStart) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Week start date is required',
        },
      });
    }

    // Determine target teacher
    let targetTeacherId: number;
    
    if (req.user.role === 'TEACHER') {
      targetTeacherId = req.user.userId;
    } else {
      targetTeacherId = parseInt(teacherId as string);
    }

    const weekStartDate = new Date(weekStart as string);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    res.status(200).json({
      success: true,
      data: {
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
        teacherId: targetTeacherId,
        message: 'Weekly view formatting to be implemented',
      },
    });
  })
);

// Get teacher's schedule conflicts
router.get('/conflicts',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
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

    // Determine target teacher
    let targetTeacherId: number;
    
    if (req.user.role === 'TEACHER') {
      targetTeacherId = req.user.userId;
    } else {
      targetTeacherId = parseInt(req.query.teacherId as string);
    }

    // For now, return empty conflicts
    // In a real implementation, you would analyze the timetable for conflicts
    res.status(200).json({
      success: true,
      data: {
        conflicts: [],
        message: 'Conflict detection to be implemented',
      },
    });
  })
);

// Get teacher's available time slots
router.get('/available-slots',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
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

    // Determine target teacher
    let targetTeacherId: number;
    
    if (req.user.role === 'TEACHER') {
      targetTeacherId = req.user.userId;
    } else {
      targetTeacherId = parseInt(req.query.teacherId as string);
    }

    // Generate available time slots (all slots that don't have scheduled activities)
    const availableSlots = [];
    
    for (let day = 1; day <= 7; day++) {
      for (let period = 1; period <= 8; period++) {
        availableSlots.push({
          dayOfWeek: day,
          period,
          available: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        availableSlots,
        message: 'Available slots calculation to be implemented with actual schedule data',
      },
    });
  })
);

// Get teacher's teaching load statistics
router.get('/statistics',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
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

    // Determine target teacher
    let targetTeacherId: number;
    
    if (req.user.role === 'TEACHER') {
      targetTeacherId = req.user.userId;
    } else {
      targetTeacherId = parseInt(req.query.teacherId as string);
    }

    const currentSemester = req.query.semester as string || 'FALL';
    const currentAcademicYear = req.query.academicYear as string || '2024-2025';

    // Get teaching statistics
    const [
      classScheduleCount,
      courseScheduleCount,
      clubScheduleCount,
      uniqueClasses,
      uniqueCourses,
      uniqueClubs,
    ] = await Promise.all([
      prisma.schedule.count({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
      }),
      prisma.courseSchedule.count({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
      }),
      prisma.clubSchedule.count({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
      }),
      prisma.schedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
        select: { classId: true },
        distinct: ['classId'],
      }),
      prisma.courseSchedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
        select: { courseId: true },
        distinct: ['courseId'],
      }),
      prisma.clubSchedule.findMany({
        where: {
          teacherId: targetTeacherId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
        select: { clubId: true },
        distinct: ['clubId'],
      }),
    ]);

    const statistics = {
      teachingLoad: {
        totalHours: classScheduleCount + courseScheduleCount,
        classHours: classScheduleCount,
        courseHours: courseScheduleCount,
        clubHours: clubScheduleCount,
      },
      diversity: {
        uniqueClasses: uniqueClasses.length,
        uniqueCourses: uniqueCourses.length,
        uniqueClubs: uniqueClubs.length,
      },
      semester: currentSemester,
      academicYear: currentAcademicYear,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

export default router;
