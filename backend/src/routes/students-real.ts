import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// Get current student profile (for students)
router.get('/profile', 
  authenticate,
  authorize('STUDENT', 'PARENT', 'TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    let student;
    
    if (req.user.role === 'STUDENT') {
      // Students can only view their own profile
      student = await prisma.student.findFirst({
        where: { 
          email: req.user.email 
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
            },
          },
          parent: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    } else if (req.user.role === 'PARENT') {
      // Parents can view their children's profiles
      student = await prisma.student.findMany({
        where: { 
          parentId: req.user.userId 
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
            },
          },
        },
      });
    } else {
      // Teachers and Admins need to specify student ID
      const studentId = parseInt(req.query.studentId as string);
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Student ID is required for teachers and admins',
          },
        });
      }
      
      student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
              homeroomTeacher: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    }

    if (!student || (Array.isArray(student) && student.length === 0)) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  })
);

// Get all students (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('classId').optional().isInt().withMessage('Class ID must be an integer'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).withMessage('Invalid status'),
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
    const { classId, schoolId, status, search } = req.query;

    const where: any = {};

    // Teachers can only view students from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (classId) {
      where.classId = parseInt(classId);
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true,
            },
          },
          parent: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { fullName: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
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

// Get student by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid student ID',
        },
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            gradeLevel: true,
            homeroomTeacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        grades: {
          select: {
            id: true,
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            score: true,
            maxScore: true,
            type: true,
            semester: true,
            academicYear: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        attendanceRecords: {
          select: {
            id: true,
            status: true,
            notes: true,
            session: {
              select: {
                date: true,
                period: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
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

    // Check access permissions
    if (req.user.role === 'TEACHER' && student.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    if (req.user.role === 'PARENT' && student.parentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  })
);

// Create new student
router.post('/',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('schoolId').isInt().withMessage('School ID must be an integer'),
    body('classId').optional().isInt().withMessage('Class ID must be an integer'),
    body('code').notEmpty().withMessage('Student code is required'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('dateOfBirth').isISO8601().withMessage('Invalid date format'),
    body('gender').isIn(['MALE', 'FEMALE']).withMessage('Invalid gender'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
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
      classId,
      code,
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      parentId,
      avatarUrl,
      emergencyContact,
    } = req.body;

    // Teachers can only create students in their school
    if (req.user.role === 'TEACHER' && schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if student code already exists in the school
    const existingStudent = await prisma.student.findFirst({
      where: {
        schoolId,
        code,
      },
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Student with this code already exists in the school',
        },
      });
    }

    // Verify class exists and belongs to the school
    if (classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: classId,
          schoolId,
        },
      });

      if (!classExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Class not found or does not belong to the specified school',
          },
        });
      }
    }

    // Verify parent exists and belongs to the school
    if (parentId) {
      const parentExists = await prisma.user.findFirst({
        where: {
          id: parentId,
          role: 'PARENT',
          schoolId,
        },
      });

      if (!parentExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent not found or does not belong to the specified school',
          },
        });
      }
    }

    const student = await prisma.student.create({
      data: {
        schoolId,
        classId,
        code,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        email,
        phone,
        address,
        parentId,
        avatarUrl,
        emergencyContact,
      },
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
        parent: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update class student count
    if (classId) {
      await prisma.class.update({
        where: { id: classId },
        data: {
          currentStudents: {
            increment: 1,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully',
    });
  })
);

// Update student
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'TEACHER'),
  [
    body('classId').optional().isInt().withMessage('Class ID must be an integer'),
    body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Invalid gender'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).withMessage('Invalid status'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
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

    const studentId = parseInt(req.params.id);
    const {
      classId,
      fullName,
      dateOfBirth,
      gender,
      status,
      email,
      phone,
      address,
      parentId,
      avatarUrl,
      emergencyContact,
    } = req.body;

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid student ID',
        },
      });
    }

    // Get existing student
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingStudent.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {
      ...(fullName && { fullName }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender }),
      ...(status && { status }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(emergencyContact && { emergencyContact }),
    };

    // Handle class change
    if (classId !== undefined) {
      // Verify new class exists and belongs to the school
      const classExists = await prisma.class.findFirst({
        where: {
          id: classId,
          schoolId: existingStudent.schoolId,
        },
      });

      if (!classExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Class not found or does not belong to the school',
          },
        });
      }

      updateData.classId = classId;
    }

    // Handle parent change
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parentId = null;
      } else {
        // Verify parent exists and belongs to the school
        const parentExists = await prisma.user.findFirst({
          where: {
            id: parentId,
            role: 'PARENT',
            schoolId: existingStudent.schoolId,
          },
        });

        if (!parentExists) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Parent not found or does not belong to the school',
            },
          });
        }

        updateData.parentId = parentId;
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        school: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            name: true,
            code: true,
            gradeLevel: true,
          },
        },
        parent: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update class student counts if class changed
    if (classId !== undefined && classId !== existingStudent.classId) {
      // Decrement old class count
      if (existingStudent.classId) {
        await prisma.class.update({
          where: { id: existingStudent.classId },
          data: {
            currentStudents: {
              decrement: 1,
            },
          },
        });
      }

      // Increment new class count
      if (classId) {
        await prisma.class.update({
          where: { id: classId },
          data: {
            currentStudents: {
              increment: 1,
            },
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully',
    });
  })
);

// Delete student
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid student ID',
        },
      });
    }

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

    // Update class student count
    if (student.classId) {
      await prisma.class.update({
        where: { id: student.classId },
        data: {
          currentStudents: {
            decrement: 1,
          },
        },
      });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  })
);

// Get student statistics
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
      totalStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents,
      transferredStudents,
      studentsByClass,
      studentsByGender,
      recentEnrollments,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.student.count({ where: { schoolId, status: 'INACTIVE' } }),
      prisma.student.count({ where: { schoolId, status: 'GRADUATED' } }),
      prisma.student.count({ where: { schoolId, status: 'TRANSFERRED' } }),
      prisma.student.groupBy({
        by: ['classId'],
        where: { schoolId },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['gender'],
        where: { schoolId },
        _count: true,
      }),
      prisma.student.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          code: true,
          status: true,
          createdAt: true,
          class: {
            select: {
              name: true,
              gradeLevel: true,
            },
          },
        },
      }),
    ]);

    const statistics = {
      overview: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        graduated: graduatedStudents,
        transferred: transferredStudents,
      },
      byClass: studentsByClass.map((item: any) => ({
        classId: item.classId,
        count: item._count,
      })),
      byGender: studentsByGender.map((item: any) => ({
        gender: item.gender,
        count: item._count,
      })),
      recentEnrollments,
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  })
);

export default router;
