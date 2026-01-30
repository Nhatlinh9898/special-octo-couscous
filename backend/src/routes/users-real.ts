import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { hash } from '@/utils/bcrypt';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, asyncHandler(async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      schoolId: true,
      avatarUrl: true,
      phone: true,
      address: true,
      dateOfBirth: true,
      gender: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      school: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
}));

// Update user profile
router.put('/profile', 
  authenticate,
  [
    body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
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

    const { fullName, phone, address, dateOfBirth, gender } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  })
);

// Change password
router.put('/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    }

    // Verify current password (you'll need to import compare function)
    const { compare } = await import('@/utils/bcrypt');
    const isCurrentPasswordValid = await compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
        },
      });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

// Get all users (Admin only)
router.get('/',
  authenticate,
  authorize('ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).withMessage('Invalid role'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
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
    const { role, schoolId, search } = req.query;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          schoolId: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          school: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// Get user by ID (Admin/Teacher)
router.get('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  asyncHandler(async (req: any, res: any) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID',
        },
      });
    }

    // Teachers can only view students from their school
    if (req.user.role === 'TEACHER') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { schoolId: true },
      });

      if (!user || user.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        avatarUrl: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        school: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

// Update user (Admin only)
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('role').optional().isIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).withMessage('Invalid role'),
    body('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
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

    const userId = parseInt(req.params.id);
    const { fullName, role, schoolId, isActive, phone, address } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID',
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(schoolId && { schoolId: parseInt(schoolId) }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        phone: true,
        address: true,
        isActive: true,
        updatedAt: true,
        school: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  })
);

// Delete user (Admin only)
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID',
        },
      });
    }

    // Prevent self-deletion
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete your own account',
        },
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  })
);

export default router;
