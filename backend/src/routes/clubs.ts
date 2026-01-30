import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all clubs (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('category').optional().isLength({ min: 1 }).withMessage('Category cannot be empty'),
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
    const { schoolId, category, search } = req.query;

    const where: any = {};

    // Teachers can only view clubs from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
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
          advisor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              members: true,
              schedules: true,
            },
          },
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.club.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        clubs,
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

// Get club by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const clubId = parseInt(req.params.id);

    if (isNaN(clubId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID',
        },
      });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        advisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        members: {
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
          orderBy: { joinedAt: 'desc' },
        },
        schedules: {
          include: {
            teacher: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
        _count: {
          select: {
            members: true,
            schedules: true,
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && club.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: club,
    });
  })
);

// Create new club
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('name').notEmpty().withMessage('Club name is required'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('advisorId').optional().isInt().withMessage('Advisor ID must be an integer'),
    body('maxMembers').optional().isInt({ min: 1, max: 200 }).withMessage('Max members must be between 1 and 200'),
    body('meetingRoom').optional().isLength({ min: 1 }).withMessage('Meeting room cannot be empty'),
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
      name,
      description,
      category,
      advisorId,
      maxMembers,
      meetingRoom,
    } = req.body;

    // Teachers can only create clubs in their school
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if club name already exists in the school
    const existingClub = await prisma.club.findFirst({
      where: {
        schoolId,
        name,
      },
    });

    if (existingClub) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Club with this name already exists in the school',
        },
      });
    }

    // Verify advisor exists and belongs to the school
    if (advisorId) {
      const advisorExists = await prisma.user.findFirst({
        where: {
          id: advisorId,
          role: 'TEACHER',
          schoolId,
        },
      });

      if (!advisorExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Advisor not found or does not belong to the specified school',
          },
        });
      }
    }

    const club = await prisma.club.create({
      data: {
        schoolId,
        name,
        description,
        category,
        advisorId,
        maxMembers: maxMembers || 50,
        meetingRoom,
      },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        advisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: club,
      message: 'Club created successfully',
    });
  })
);

// Update club
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('name').optional().notEmpty().withMessage('Club name cannot be empty'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('advisorId').optional().isInt().withMessage('Advisor ID must be an integer'),
    body('maxMembers').optional().isInt({ min: 1, max: 200 }).withMessage('Max members must be between 1 and 200'),
    body('meetingRoom').optional().isLength({ min: 1 }).withMessage('Meeting room cannot be empty'),
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

    const clubId = parseInt(req.params.id);
    const {
      name,
      description,
      category,
      advisorId,
      maxMembers,
      meetingRoom,
    } = req.body;

    if (isNaN(clubId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID',
        },
      });
    }

    // Get existing club
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!existingClub) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingClub.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (name && name !== existingClub.name) {
      // Check if new name already exists in the school
      const duplicateClub = await prisma.club.findFirst({
        where: {
          schoolId: existingClub.schoolId,
          name,
        },
      });

      if (duplicateClub) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Club with this name already exists in the school',
          },
        });
      }

      updateData.name = name;
    }

    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (meetingRoom) updateData.meetingRoom = meetingRoom;
    if (maxMembers) updateData.maxMembers = maxMembers;

    // Handle advisor change
    if (advisorId !== undefined) {
      if (advisorId === null) {
        updateData.advisorId = null;
      } else {
        // Verify advisor exists and belongs to the school
        const advisorExists = await prisma.user.findFirst({
          where: {
            id: advisorId,
            role: 'TEACHER',
            schoolId: existingClub.schoolId,
          },
        });

        if (!advisorExists) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Advisor not found or does not belong to the school',
            },
          });
        }

        updateData.advisorId = advisorId;
      }
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: updateData,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        advisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedClub,
      message: 'Club updated successfully',
    });
  })
);

// Delete club
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const clubId = parseInt(req.params.id);

    if (isNaN(clubId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID',
        },
      });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    // Check if club has members
    if (club._count.members > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete club with existing members',
        },
      });
    }

    await prisma.club.delete({
      where: { id: clubId },
    });

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully',
    });
  })
);

// Add student to club
router.post('/:id/members',
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

    const clubId = parseInt(req.params.id);
    const { studentId } = req.body;

    if (isNaN(clubId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID',
        },
      });
    }

    // Get club and check permissions
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && club.schoolId !== req.user.schoolId) {
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
    if (student.schoolId !== club.schoolId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Student does not belong to the same school',
        },
      });
    }

    // Check if student is already a member
    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        studentId_clubId: {
          studentId,
          clubId,
        },
      },
    });

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Student is already a member of this club',
        },
      });
    }

    // Check if club is at capacity
    const currentMembers = await prisma.clubMember.count({
      where: { clubId },
    });

    if (currentMembers >= club.maxMembers) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Club is at maximum capacity',
        },
      });
    }

    // Add student to club
    const membership = await prisma.clubMember.create({
      data: {
        studentId,
        clubId,
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
      data: membership,
      message: 'Student added to club successfully',
    });
  })
);

// Remove student from club
router.delete('/:id/members/:studentId',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  asyncHandler(async (req: any, res: any) => {
    const clubId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    if (isNaN(clubId) || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID or student ID',
        },
      });
    }

    // Get club and check permissions
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    if (req.user.role === 'TEACHER' && club.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if membership exists
    const membership = await prisma.clubMember.findUnique({
      where: {
        studentId_clubId: {
          studentId,
          clubId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student is not a member of this club',
        },
      });
    }

    // Remove student from club
    await prisma.clubMember.delete({
      where: {
        studentId_clubId: {
          studentId,
          clubId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Student removed from club successfully',
    });
  })
);

// Get club schedule
router.get('/:id/schedule',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const clubId = parseInt(req.params.id);

    if (isNaN(clubId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid club ID',
        },
      });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Club not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && club.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const schedules = await prisma.clubSchedule.findMany({
      where: { clubId },
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
    });

    res.status(200).json({
      success: true,
      data: {
        club: {
          id: club.id,
          name: club.name,
          category: club.category,
        },
        schedules,
      },
    });
  })
);

export default router;
