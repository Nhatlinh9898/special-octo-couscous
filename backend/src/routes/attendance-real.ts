import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all attendance sessions
router.get('/sessions',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('classId').optional().isInt(),
    query('schoolId').optional().isInt(),
    query('date').optional().isISO8601(),
    query('period').optional().isInt({ min: 1, max: 8 }),
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
    const { classId, schoolId, date, period } = req.query;

    const where: any = {};
    if (req.user.role === 'TEACHER') {
      where.class = { schoolId: req.user.schoolId };
    } else if (schoolId) {
      where.class = { schoolId: parseInt(schoolId) };
    }
    if (classId) where.classId = parseInt(classId);
    if (date) where.date = new Date(date);
    if (period) where.period = parseInt(period);

    const [sessions, total] = await Promise.all([
      prisma.attendanceSession.findMany({
        where, skip, take: limit,
        include: {
          class: { select: { id: true, name: true, code: true, gradeLevel: true } },
          _count: { select: { records: true } },
        },
        orderBy: [{ date: 'desc' }, { period: 'asc' }],
      }),
      prisma.attendanceSession.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: { sessions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  })
);

// Get attendance session by ID
router.get('/sessions/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid session ID' } });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { id: true, name: true, code: true, gradeLevel: true, schoolId: true } },
        records: {
          include: {
            student: { select: { id: true, fullName: true, code: true } },
            recorder: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, error: { message: 'Session not found' } });
    }

    // Permission checks
    if (req.user.role === 'TEACHER' && session.class.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    res.status(200).json({ success: true, data: session });
  })
);

// Create attendance session
router.post('/sessions',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('classId').isInt(),
    body('date').isISO8601(),
    body('period').isInt({ min: 1, max: 8 }),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const { classId, date, period, notes } = req.body;

    // Permission check
    if (req.user.role === 'TEACHER') {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: { schoolId: true },
      });
      if (!classData || classData.schoolId !== req.user.schoolId) {
        return res.status(403).json({ success: false, error: { message: 'Access denied' } });
      }
    }

    const session = await prisma.attendanceSession.create({
      data: {
        classId: parseInt(classId),
        date: new Date(date),
        period: parseInt(period),
        teacherId: req.user.userId,
        notes,
      },
      include: {
        class: { select: { id: true, name: true, code: true, gradeLevel: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Session created successfully',
    });
  })
);

// Create attendance record
router.post('/records',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('sessionId').isInt(),
    body('studentId').isInt(),
    body('status').isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() },
      });
    }

    const { sessionId, studentId, status, notes } = req.body;

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        status,
        recordedBy: req.user.userId,
        notes,
      },
      include: {
        student: { select: { id: true, fullName: true, code: true } },
        recorder: { select: { id: true, fullName: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: record,
      message: 'Record created successfully',
    });
  })
);

// Get attendance statistics
router.get('/statistics/overview',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = req.user.role === 'TEACHER' ? req.user.schoolId : parseInt(req.query.schoolId);

    const [totalSessions, totalRecords, recordsByStatus, recentSessions] = await Promise.all([
      prisma.attendanceSession.count({ where: { class: { schoolId } } }),
      prisma.attendanceRecord.count({
        where: { session: { class: { schoolId } } },
      }),
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { session: { class: { schoolId } } },
        _count: true,
      }),
      prisma.attendanceSession.findMany({
        where: { class: { schoolId } },
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          class: { select: { name: true, code: true } },
          _count: { select: { records: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { totalSessions, totalRecords },
        byStatus: recordsByStatus.map((item: { status: string; _count: number }) => ({ status: item.status, count: item._count })),
        recentSessions,
      },
    });
  })
);

export default router;
