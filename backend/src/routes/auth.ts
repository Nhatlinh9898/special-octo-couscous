import { Router } from 'express';
const { body, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { generateToken, generateRefreshToken } from '@/utils/jwt';
import { prisma } from '@/config/database';
import { hash, compare } from '@/utils/bcrypt';

const router = Router();

// Register validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('role').isIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).withMessage('Invalid role'),
  body('schoolId').optional().isNumeric().withMessage('School ID must be a number'),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register endpoint
router.post('/register', registerValidation, asyncHandler(async (req: any, res: any) => {
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

  const { email, password, fullName, role, schoolId, phone, address } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        message: 'User already exists with this email',
      },
    });
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role,
      schoolId: schoolId || 1, // Default school
      phone,
      address,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      schoolId: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const token = generateToken(user.id, user.email, user.role, user.schoolId);
  const refreshToken = generateRefreshToken(user.id);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
      refreshToken,
      expiresIn: '15m',
    },
    message: 'User registered successfully',
  });
}));

// Login endpoint
router.post('/login', loginValidation, asyncHandler(async (req: any, res: any) => {
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

  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    });
  }

  // Check password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Account is deactivated',
      },
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const token = generateToken(user.id, user.email, user.role, user.schoolId);
  const refreshToken = generateRefreshToken(user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        address: user.address,
      },
      token,
      refreshToken,
      expiresIn: '15m',
    },
    message: 'Login successful',
  });
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req: any, res: any) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Refresh token is required',
      },
    });
  }

  // Verify refresh token (implementation needed)
  try {
    // TODO: Implement refresh token verification
    const decoded = { userId: 1, email: 'test@example.com' }; // Placeholder
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        schoolId: true,
        avatarUrl: true,
        phone: true,
        address: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }

    const newToken = generateToken(user.id, user.email, user.role, user.schoolId);

    res.status(200).json({
      success: true,
      data: {
        user,
        token: newToken,
        expiresIn: '15m',
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token',
      },
    });
  }
}));

// Logout endpoint
router.post('/logout', asyncHandler(async (_req: any, res: any) => {
  // TODO: Implement token blacklisting
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}));

export default router;
