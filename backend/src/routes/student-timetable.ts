import { Router } from 'express';
const { query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get student's complete timetable (class + courses + clubs)
router.get('/',
  authenticate,
  authorize('STUDENT', 'PARENT', 'TEACHER', 'ADMIN'),
  [
    query('studentId').optional().isInt().withMessage('Student ID must be an integer'),
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

    const { studentId, semester, academicYear, weekStart } = req.query;
    
    // Determine which student's timetable to view
    let targetStudentId: number;
    
    if (req.user.role === 'STUDENT') {
      // Students can only view their own timetable
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { id: true },
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Student not found',
          },
        });
      }
      
      targetStudentId = student.id;
    } else if (req.user.role === 'PARENT') {
      // Parents can only view their children's timetables
      const student = await prisma.student.findFirst({
        where: { parentId: req.user.userId },
        select: { id: true },
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'No student found for this parent',
          },
        });
      }
      
      targetStudentId = student.id;
    } else {
      // Teachers and Admins can view any student's timetable if studentId is provided
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Student ID is required for teachers and admins',
          },
        });
      }
      
      targetStudentId = parseInt(studentId as string);
      
      // Teachers can only view students from their school
      if (req.user.role === 'TEACHER') {
        const student = await prisma.student.findUnique({
          where: { id: targetStudentId },
          select: { schoolId: true },
        });
        
        if (!student || student.schoolId !== req.user.schoolId) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Access denied',
            },
          });
        }
      }
    }

    // Get student information
    const student = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
            schoolId: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
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
    ] = await Promise.all([
      // Class schedules
      student.classId ? prisma.schedule.findMany({
        where: {
          classId: student.classId,
          semester: currentSemester,
          academicYear: currentAcademicYear,
        },
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
      }) : [],

      // Course schedules
      prisma.courseEnrollment.findMany({
        where: {
          studentId: targetStudentId,
          status: 'ACTIVE',
        },
        include: {
          course: {
            include: {
              schedules: {
                where: {
                  semester: currentSemester,
                  academicYear: currentAcademicYear,
                },
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
              },
            },
          },
        },
      }),

      // Club schedules
      prisma.clubMember.findMany({
        where: {
          studentId: targetStudentId,
        },
        include: {
          club: {
            include: {
              schedules: {
                where: {
                  semester: currentSemester,
                  academicYear: currentAcademicYear,
                },
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
                  { startTime: 'asc' },
                ],
              },
            },
          },
        },
      }),
    ]);

    // Format the response
    const formattedTimetable = {
      student: {
        id: student.id,
        fullName: student.fullName,
        code: student.code,
        class: student.class,
        school: student.school,
      },
      semester: currentSemester,
      academicYear: currentAcademicYear,
      schedules: {
        class: classSchedules.map(schedule => ({
          id: schedule.id,
          type: 'CLASS',
          dayOfWeek: schedule.dayOfWeek,
          period: schedule.period,
          room: schedule.room,
          subject: schedule.subject,
          teacher: schedule.teacher,
        })),
        courses: courseSchedules.flatMap(enrollment => 
          enrollment.course.schedules.map(schedule => ({
            id: schedule.id,
            type: 'COURSE',
            dayOfWeek: schedule.dayOfWeek,
            period: schedule.period,
            room: schedule.room,
            course: {
              id: enrollment.course.id,
              name: enrollment.course.name,
              code: enrollment.course.code,
              type: enrollment.course.type,
            },
            teacher: schedule.teacher,
          }))
        ),
        clubs: clubSchedules.flatMap(membership =>
          membership.club.schedules.map(schedule => ({
            id: schedule.id,
            type: 'CLUB',
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room,
            club: {
              id: membership.club.id,
              name: membership.club.name,
              category: membership.club.category,
            },
            teacher: schedule.teacher,
          }))
        ),
      },
    };

    res.status(200).json({
      success: true,
      data: formattedTimetable,
    });
  })
);

// Get student's weekly timetable view
router.get('/weekly',
  authenticate,
  authorize('STUDENT', 'PARENT', 'TEACHER', 'ADMIN'),
  [
    query('studentId').optional().isInt().withMessage('Student ID must be an integer'),
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

    const { studentId, weekStart, semester, academicYear } = req.query;
    
    if (!weekStart) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Week start date is required',
        },
      });
    }

    // Determine target student (same logic as above)
    let targetStudentId: number;
    
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { id: true },
      });
      targetStudentId = student!.id;
    } else if (req.user.role === 'PARENT') {
      const student = await prisma.student.findFirst({
        where: { parentId: req.user.userId },
        select: { id: true },
      });
      targetStudentId = student!.id;
    } else {
      targetStudentId = parseInt(studentId as string);
    }

    const weekStartDate = new Date(weekStart as string);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Get the complete timetable first
    const timetableResponse = await req.app.get('router')(
      { ...req, query: { ...req.query, weekStart: undefined } },
      res
    );

    // For now, return the same data structure
    // In a real implementation, you would format this for weekly view
    res.status(200).json({
      success: true,
      data: {
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
        message: 'Weekly view formatting to be implemented',
      },
    });
  })
);

// Get student's schedule conflicts
router.get('/conflicts',
  authenticate,
  authorize('STUDENT', 'PARENT', 'TEACHER', 'ADMIN'),
  [
    query('studentId').optional().isInt().withMessage('Student ID must be an integer'),
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

    // Get student's complete timetable
    const timetableData = await (async () => {
      const tempReq = { ...req, query: { ...req.query, weekStart: undefined } };
      const tempRes = { json: (data: any) => data, status: (code: number) => ({ json: tempRes.json }) };
      
      // This is a simplified approach - in production, you'd refactor the common logic
      return null; // Placeholder
    })();

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

// Get student's available time slots
router.get('/available-slots',
  authenticate,
  authorize('STUDENT', 'PARENT', 'TEACHER', 'ADMIN'),
  [
    query('studentId').optional().isInt().withMessage('Student ID must be an integer'),
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

export default router;
