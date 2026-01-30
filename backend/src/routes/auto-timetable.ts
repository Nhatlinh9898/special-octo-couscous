import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Auto-generate timetable for a class
router.post('/generate',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('classId').isInt().withMessage('Class ID must be an integer'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('subjects').isArray().withMessage('Subjects must be an array'),
    body('teachers').isArray().withMessage('Teachers must be an array'),
    body('constraints').optional().isObject().withMessage('Constraints must be an object'),
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
      semester,
      academicYear,
      subjects,
      teachers,
      constraints = {},
    } = req.body;

    // Get class information
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        school: {
          select: { id: true, name: true },
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

    // Check permissions
    if (req.user.role === 'TEACHER' && classData.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    try {
      // Generate timetable using algorithm
      const timetable = await generateClassTimetable({
        classId,
        semester,
        academicYear,
        subjects,
        teachers,
        constraints,
        schoolId: classData.schoolId,
      });

      // Clear existing schedules for this class
      await prisma.schedule.deleteMany({
        where: {
          classId,
          semester,
          academicYear,
        },
      });

      // Create new schedules
      const createdSchedules = await Promise.all(
        timetable.map(async (schedule) => {
          return await prisma.schedule.create({
            data: {
              classId,
              subjectId: schedule.subjectId,
              teacherId: schedule.teacherId,
              dayOfWeek: schedule.dayOfWeek,
              period: schedule.period,
              room: schedule.room,
              semester,
              academicYear,
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
                },
              },
            },
          });
        })
      );

      res.status(201).json({
        success: true,
        data: {
          class: {
            id: classData.id,
            name: classData.name,
            gradeLevel: classData.gradeLevel,
          },
          semester,
          academicYear,
          schedules: createdSchedules,
          statistics: {
            totalSubjects: subjects.length,
            totalPeriods: timetable.length,
            subjectsPerWeek: subjects.length,
          },
        },
        message: 'Timetable generated successfully',
      });
    } catch (error) {
      console.error('Error generating timetable:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate timetable',
          details: error.message,
        },
      });
    }
  })
);

// Auto-generate club schedules
router.post('/generate-clubs',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('clubs').isArray().withMessage('Clubs must be an array'),
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
      semester,
      academicYear,
      clubs,
    } = req.body;

    // Check permissions
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    try {
      // Generate club schedules
      const clubSchedules = await generateClubSchedules({
        schoolId,
        semester,
        academicYear,
        clubs,
      });

      // Clear existing club schedules
      await prisma.clubSchedule.deleteMany({
        where: {
          club: {
            schoolId,
          },
          semester,
          academicYear,
        },
      });

      // Create new club schedules
      const createdSchedules = await Promise.all(
        clubSchedules.map(async (schedule) => {
          return await prisma.clubSchedule.create({
            data: {
              clubId: schedule.clubId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              teacherId: schedule.teacherId,
              room: schedule.room,
              semester,
              academicYear,
            },
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  category: true,
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
        })
      );

      res.status(201).json({
        success: true,
        data: {
          schoolId,
          semester,
          academicYear,
          schedules: createdSchedules,
          statistics: {
            totalClubs: clubs.length,
            totalSchedules: clubSchedules.length,
          },
        },
        message: 'Club schedules generated successfully',
      });
    } catch (error) {
      console.error('Error generating club schedules:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate club schedules',
          details: error.message,
        },
      });
    }
  })
);

// Get timetable generation preview
router.post('/preview',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('classId').isInt().withMessage('Class ID must be an integer'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('subjects').isArray().withMessage('Subjects must be an array'),
    body('teachers').isArray().withMessage('Teachers must be an array'),
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
      semester,
      academicYear,
      subjects,
      teachers,
      constraints = {},
    } = req.body;

    try {
      // Generate preview without saving
      const timetable = await generateClassTimetable({
        classId,
        semester,
        academicYear,
        subjects,
        teachers,
        constraints,
        schoolId: req.user.schoolId || 1,
      });

      // Get subject and teacher details for preview
      const subjectIds = timetable.map(s => s.subjectId);
      const teacherIds = timetable.map(s => s.teacherId);

      const [subjectsData, teachersData] = await Promise.all([
        prisma.subject.findMany({
          where: { id: { in: subjectIds } },
          select: { id: true, name: true, code: true, color: true },
        }),
        prisma.user.findMany({
          where: { id: { in: teacherIds } },
          select: { id: true, fullName: true, email: true },
        }),
      ]);

      const enrichedTimetable = timetable.map(schedule => ({
        ...schedule,
        subject: subjectsData.find(s => s.id === schedule.subjectId),
        teacher: teachersData.find(t => t.id === schedule.teacherId),
      }));

      res.status(200).json({
        success: true,
        data: {
          preview: enrichedTimetable,
          statistics: {
            totalSubjects: subjects.length,
            totalPeriods: timetable.length,
            conflicts: checkConflicts(timetable),
          },
        },
        message: 'Timetable preview generated successfully',
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate preview',
          details: error.message,
        },
      });
    }
  })
);

// Algorithm functions
async function generateClassTimetable(params: {
  classId: number;
  semester: string;
  academicYear: string;
  subjects: any[];
  teachers: any[];
  constraints: any;
  schoolId: number;
}) {
  const { classId, semester, academicYear, subjects, teachers, constraints, schoolId } = params;
  
  // Define time slots (Monday-Friday, periods 1-8)
  const timeSlots = [];
  for (let day = 2; day <= 6; day++) { // Monday=2 to Friday=6
    for (let period = 1; period <= 8; period++) {
      timeSlots.push({ dayOfWeek: day, period });
    }
  }

  // Shuffle time slots for randomness
  const shuffledSlots = [...timeSlots].sort(() => Math.random() - 0.5);
  
  const timetable = [];
  const usedSlots = new Set();
  const teacherAvailability = new Map();

  // Initialize teacher availability
  teachers.forEach(teacher => {
    teacherAvailability.set(teacher.id, new Set());
  });

  // Assign subjects to time slots
  for (const subject of subjects) {
    const sessionsPerWeek = subject.sessionsPerWeek || 2; // Default 2 sessions per week
    
    for (let session = 0; session < sessionsPerWeek; session++) {
      let assigned = false;
      let attempts = 0;
      
      while (!assigned && attempts < shuffledSlots.length) {
        const slot = shuffledSlots[attempts];
        const slotKey = `${slot.dayOfWeek}-${slot.period}`;
        
        // Check if slot is already used
        if (usedSlots.has(slotKey)) {
          attempts++;
          continue;
        }

        // Find available teacher for this subject
        const availableTeachers = teachers.filter(
          t => t.subjectIds.includes(subject.id) && 
          !teacherAvailability.get(t.id)?.has(slotKey)
        );

        if (availableTeachers.length === 0) {
          attempts++;
          continue;
        }

        // Select teacher (prefer those with fewer assignments)
        const teacher = availableTeachers.reduce((best, current) => {
          const bestCount = teacherAvailability.get(best.id)?.size || 0;
          const currentCount = teacherAvailability.get(current.id)?.size || 0;
          return currentCount < bestCount ? current : best;
        });

        // Assign schedule
        const schedule = {
          classId,
          subjectId: subject.id,
          teacherId: teacher.id,
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          room: assignRoom(subject, slot.period),
        };

        timetable.push(schedule);
        usedSlots.add(slotKey);
        teacherAvailability.get(teacher.id).add(slotKey);
        assigned = true;
      }
      
      if (!assigned) {
        throw new Error(`Could not schedule subject ${subject.name} - no available slots`);
      }
    }
  }

  return timetable;
}

async function generateClubSchedules(params: {
  schoolId: number;
  semester: string;
  academicYear: string;
  clubs: any[];
}) {
  const { schoolId, semester, academicYear, clubs } = params;
  
  // Define preferred time slots for clubs (after school hours)
  const preferredSlots = [
    { dayOfWeek: 2, startTime: '16:00', endTime: '17:30' }, // Monday
    { dayOfWeek: 3, startTime: '16:00', endTime: '17:30' }, // Tuesday
    { dayOfWeek: 4, startTime: '16:00', endTime: '17:30' }, // Wednesday
    { dayOfWeek: 5, startTime: '16:00', endTime: '17:30' }, // Thursday
    { dayOfWeek: 6, startTime: '16:00', endTime: '17:30' }, // Friday
  ];

  const schedules = [];
  
  for (const club of clubs) {
    // Assign 1-2 sessions per week for each club
    const sessionsPerWeek = club.meetingsPerWeek || 1;
    
    for (let i = 0; i < sessionsPerWeek; i++) {
      const slot = preferredSlots[i % preferredSlots.length];
      
      const schedule = {
        clubId: club.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        teacherId: club.advisorId || null,
        room: assignClubRoom(club),
      };
      
      schedules.push(schedule);
    }
  }

  return schedules;
}

function assignRoom(subject: any, period: number) {
  // Simple room assignment logic
  const roomMap = {
    'MATH': ['P.101', 'P.102'],
    'PHYSICS': ['P.201', 'P.202'],
    'CHEMISTRY': ['P.301', 'P.302'],
    'BIOLOGY': ['P.401'],
    'COMPUTER_SCIENCE': ['LAB.101', 'LAB.102'],
    'ENGLISH': ['P.501', 'P.502'],
    'LITERATURE': ['P.601', 'P.602'],
    'HISTORY': ['P.701'],
    'GEOGRAPHY': ['P.702'],
  };

  const rooms = roomMap[subject.code] || ['P.801'];
  return rooms[Math.floor(Math.random() * rooms.length)];
}

function assignClubRoom(club: any) {
  // Assign rooms for clubs based on category
  const roomMap = {
    'SPORTS': ['Sân vận động', 'Phòng Gym'],
    'ARTS': ['Phòng Mỹ thuật', 'Phòng Nhảy'],
    'MUSIC': ['Phòng Âm nhạc'],
    'TECHNOLOGY': ['LAB.201', 'LAB.202'],
    'ACADEMIC': ['P.901', 'P.902'],
    'CULTURAL': ['Hội trường', 'Phòng Đa năng'],
  };

  const rooms = roomMap[club.category] || ['P.903'];
  return rooms[Math.floor(Math.random() * rooms.length)];
}

function checkConflicts(timetable: any[]) {
  const conflicts = [];
  const slotMap = new Map();

  for (const schedule of timetable) {
    const slotKey = `${schedule.dayOfWeek}-${schedule.period}`;
    
    if (slotMap.has(slotKey)) {
      conflicts.push({
        type: 'SLOT_CONFLICT',
        dayOfWeek: schedule.dayOfWeek,
        period: schedule.period,
        schedules: [slotMap.get(slotKey), schedule],
      });
    } else {
      slotMap.set(slotKey, schedule);
    }
  }

  return conflicts;
}

export default router;
