import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';

const router = Router();

// Get all schools (Public)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
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
    const { search } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          phone: true,
          email: true,
          logoUrl: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              students: true,
              classes: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.school.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        schools,
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

// Get school by ID
router.get('/:id',
  asyncHandler(async (req: any, res: any) => {
    const schoolId = parseInt(req.params.id);

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid school ID',
        },
      });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: {
              where: { isActive: true },
            },
            students: {
              where: { status: 'ACTIVE' },
            },
            classes: true,
            subjects: true,
          },
        },
      },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'School not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: school,
    });
  })
);

// Create school (Admin only)
router.post('/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('School name is required'),
    body('code').notEmpty().withMessage('School code is required'),
    body('code').isLength({ min: 2, max: 50 }).withMessage('Code must be between 2 and 50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
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

    const { name, code, address, phone, email, logoUrl, settings } = req.body;

    // Check if school code already exists
    const existingSchool = await prisma.school.findUnique({
      where: { code },
    });

    if (existingSchool) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'School with this code already exists',
        },
      });
    }

    const school = await prisma.school.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        logoUrl,
        settings,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        settings: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: school,
      message: 'School created successfully',
    });
  })
);

// Update school (Admin only)
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').optional().notEmpty().withMessage('School name cannot be empty'),
    body('code').optional().isLength({ min: 2, max: 50 }).withMessage('Code must be between 2 and 50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
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

    const schoolId = parseInt(req.params.id);
    const { name, code, address, phone, email, logoUrl, settings } = req.body;

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid school ID',
        },
      });
    }

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!existingSchool) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'School not found',
        },
      });
    }

    // If code is being updated, check for duplicates
    if (code && code !== existingSchool.code) {
      const duplicateSchool = await prisma.school.findUnique({
        where: { code },
      });

      if (duplicateSchool) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'School with this code already exists',
          },
        });
      }
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(settings && { settings }),
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        settings: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedSchool,
      message: 'School updated successfully',
    });
  })
);

// Delete school (Admin only)
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = parseInt(req.params.id);

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid school ID',
        },
      });
    }

    // Check if school has users
    const userCount = await prisma.user.count({
      where: { schoolId },
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete school with existing users',
        },
      });
    }

    await prisma.school.delete({
      where: { id: schoolId },
    });

    res.status(200).json({
      success: true,
      message: 'School deleted successfully',
    });
  })
);

// Get school statistics (Admin/Teacher)
router.get('/:id/statistics',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  asyncHandler(async (req: any, res: any) => {
    const schoolId = parseInt(req.params.id);

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid school ID',
        },
      });
    }

    // Teachers can only view their own school statistics
    if (req.user.role === 'TEACHER' && req.user.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const [
      totalUsers,
      activeUsers,
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      totalSubjects,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { schoolId } }),
      prisma.user.count({ where: { schoolId, isActive: true } }),
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.user.count({ where: { schoolId, role: 'TEACHER' } }),
      prisma.user.count({ where: { schoolId, role: 'TEACHER', isActive: true } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } }),
      prisma.user.findMany({
        where: { schoolId },
        orderBy: { lastLoginAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          role: true,
          lastLoginAt: true,
        },
      }),
    ]);

    const statistics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: totalTeachers - activeTeachers,
      },
      academics: {
        totalClasses,
        totalSubjects,
      },
      recentActivity,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

export default router;
