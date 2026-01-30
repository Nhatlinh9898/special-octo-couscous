import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// Get all grades (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('studentId').optional().isInt().withMessage('Student ID must be an integer'),
    query('subjectId').optional().isInt().withMessage('Subject ID must be an integer'),
    query('classId').optional().isInt().withMessage('Class ID must be an integer'),
    query('teacherId').optional().isInt().withMessage('Teacher ID must be an integer'),
    query('schoolId').optional().isInt().withMessage('School ID must be an integer'),
    query('gradeType').optional().isIn(['ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PARTICIPATION']).withMessage('Invalid grade type'),
    query('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    query('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
    query('minScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Min score must be between 0 and 100'),
    query('maxScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Max score must be between 0 and 100'),
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
      studentId,
      subjectId,
      classId,
      teacherId,
      schoolId,
      gradeType,
      semester,
      academicYear,
      minScore,
      maxScore,
      search,
    } = req.query;

    const where: any = {};

    // Teachers can only view grades from their school
    if (req.user.role === 'TEACHER') {
      where.schoolId = req.user.schoolId;
    } else if (schoolId) {
      where.schoolId = parseInt(schoolId);
    }

    if (studentId) {
      where.studentId = parseInt(studentId);
    }

    if (subjectId) {
      where.subjectId = parseInt(subjectId);
    }

    if (classId) {
      where.student = {
        classId: parseInt(classId),
      };
    }

    if (teacherId) {
      where.teacherId = parseInt(teacherId);
    }

    if (gradeType) {
      where.gradeType = gradeType;
    }

    if (semester) {
      where.semester = semester;
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) {
        where.score.gte = parseFloat(minScore);
      }
      if (maxScore !== undefined) {
        where.score.lte = parseFloat(maxScore);
      }
    }

    if (search) {
      where.OR = [
        { student: { fullName: { contains: search, mode: 'insensitive' } } },
        { student: { code: { contains: search, mode: 'insensitive' } } },
        { subject: { name: { contains: search, mode: 'insensitive' } } },
        { gradeType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip,
        take: limit,
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
                  code: true,
                  gradeLevel: true,
                },
              },
              parent: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true,
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
            },
          },
          grader: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          exam: {
            select: {
              id: true,
              title: true,
              type: true,
              maxScore: true,
              scheduledAt: true,
              status: true,
            },
          },
          assignment: {
            select: {
              id: true,
              material: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: [
          { gradedAt: 'desc' },
          { student: { fullName: 'asc' } },
        ],
      }),
      prisma.grade.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        grades,
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

// Get grade by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
    const gradeId = parseInt(req.params.id);

    if (isNaN(gradeId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid grade ID',
        },
      });
    }

    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
            email: true,
            dateOfBirth: true,
            gender: true,
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
                phone: true,
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
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            scheduledAt: true,
            status: true,
          },
        },
        assignment: {
          select: {
            id: true,
            material: {
              select: {
                title: true,
                description: true,
                deadline: true,
              },
            },
          },
        },
      },
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && grade.studentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Students and parents can only view their own grades
    if (req.user.role === 'STUDENT' || req.user.role === 'PARENT') {
      const studentGrade = await prisma.grade.findFirst({
        where: {
          studentId: req.user.userId,
        },
      });

      if (!studentGrade) {
        // For parents, check if they are the parent of the student
        const parentStudent = await prisma.student.findFirst({
          where: {
            parentId: req.user.userId,
            id: grade.studentId,
          },
        });

        if (!parentStudent) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Access denied',
            },
          });
        }
      }

      if (req.user.role === 'STUDENT' && grade.studentId !== req.user.userId) {
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
      data: grade,
    });
  })
);

// Create new grade
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('studentId').isInt().withMessage('Student ID must be an integer'),
    body('subjectId').isInt().withMessage('Subject ID must be an integer'),
    body('examId').optional().isInt().withMessage('Exam ID must be an integer'),
    body('assignmentId').optional().isInt().withMessage('Assignment ID must be an integer'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('maxScore').isFloat({ min: 1, max: 100 }).withMessage('Max score must be between 1 and 100'),
    body('gradeType').isIn(['ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PARTICIPATION']).withMessage('Invalid grade type'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('gradedBy').isInt().withMessage('Graded by ID must be an integer'),
    body('gradedAt').optional().isISO8601().withMessage('Invalid date format'),
    body('feedback').optional().isLength({ min: 5 }).withMessage('Feedback must be at least 5 characters'),
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
      studentId,
      subjectId,
      examId,
      assignmentId,
      score,
      maxScore,
      gradeType,
      semester,
      academicYear,
      gradedBy,
      gradedAt,
    } = req.body;

    // Teachers can only create grades in their school
    if (req.user.role === 'TEACHER') {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
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

    // Verify student exists
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

    // Verify subject exists and belongs to the school
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        schoolId: student.schoolId,
      },
    });

    if (!subject) {
      return res(400).json({
        success: false,
        error: {
          message: 'Subject not found or does not belong to the school',
        },
      });
    }

    // Verify exam if provided
    if (examId) {
      const exam = await prisma.exam.findFirst({
        where: {
          id: examId,
          schoolId: student.schoolId,
        },
      });

      if (!exam) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Exam not found or does not belong to the school',
          },
        });
      }
    }

    // Verify assignment if provided
    if (assignmentId) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          studentId,
        },
        include: {
          material: {
            select: {
              schoolId: true,
              subjectId: true,
              postedBy: true,
            },
          },
        },
      });

      if (!assignment) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Assignment not found or does not belong to the student',
          },
        });
      }
    }

    // Verify grader exists and belongs to the school
    const grader = await prisma.user.findFirst({
      where: {
        id: gradedBy,
        role: 'TEACHER',
        schoolId: student.schoolId,
      },
    });

    if (!grader) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Grader not found or does not belong to the school',
        },
      });
    }

    // Validate score against max score
    if (score > maxScore) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Score cannot be greater than max score',
        },
      });
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        examId,
        assignmentId,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        gradeType,
        semester,
        academicYear,
        gradedBy,
        gradedAt: gradedAt ? new Date(gradedAt) : new Date(),
        },
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
                code: true,
                gradeLevel: true,
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
          },
        },
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            scheduledAt: true,
          },
        },
        assignment: {
          select: {
            id: true,
            material: {
              select: {
                title: true,
                description: true,
                deadline: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: grade,
      message: 'Grade created successfully',
    });
  })
);

// Update grade
router.put('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('maxScore').optional().isFloat({ min: 1, max: 100 }).withMessage('Max score must be between 1 and 100'),
    body('gradeType').optional().isIn(['ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PARTICIPATION']).withMessage('Invalid grade type'),
    body('semester').optional().isLength({ min: 1 }).withMessage('Semester is required'),
    body('academicYear').optional().isLength({ min: 4 }).withMessage('Academic year must be at least 4 characters'),
    body('gradedBy').optional().isInt().withMessage('Graded by ID must be an integer'),
    body('gradedAt').optional().isISO8601().withMessage('Invalid date format'),
    body('feedback').optional().isLength({ min: 5 }).withMessage('Feedback must be at least 5 characters'),
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

    const gradeId = parseInt(req.params.id);
    const {
      score,
      maxScore,
      gradeType,
      semester,
      academicYear,
      gradedBy,
      gradedAt,
      feedback,
    } = req.body;

    if (isNaN(gradeId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid grade ID',
        },
      });
    }

    // Get existing grade
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: {
          select: {
            id: true,
            schoolId: true,
          },
        },
      },
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'TEACHER' && existingGrade.student.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    const updateData: any = {};

    if (score !== undefined) {
      updateData.score = parseFloat(score);
    }

    if (maxScore !== undefined) {
      updateData.maxScore = parseFloat(maxScore);
    }

    if (gradeType) updateData.gradeType = gradeType;
    if (semester) updateData.semester = semester;
    if (academicYear) updateData.academicYear = academicYear;
    if (gradedBy) updateData.gradedBy = gradedBy;
    if (gradedAt) updateData.gradedAt = new Date(gradedAt);
    if (feedback) updateData.feedback = feedback;

    // Validate score against max score
    if (maxScore !== undefined && score !== undefined && parseFloat(score) > parseFloat(maxScore)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Score cannot be greater than max score',
        },
      });
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: updateData,
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
                code: true,
                gradeLevel: true,
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
          },
        },
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            scheduledAt: true,
            status: true,
          },
        },
        assignment: {
          select: {
            id: true,
            material: {
              select: {
                title: true,
                description: true,
                deadline: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedGrade,
      message: 'Grade updated successfully',
    });
  })
);

// Delete grade
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const gradeId = parseInt(req.params.id);

    if (isNaN(gradeId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid grade ID',
        },
      });
    }

    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Grade not found',
        },
      });
    }

    await prisma.grade.delete({
      where: { id: gradeId },
    });

    res.status(200).json({
      success: true,
      message: 'Grade deleted successfully',
    });
  })
);

// Get grade statistics
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
    totalGrades,
    gradesByType,
    gradesBySubject,
    gradesByStudent,
    gradesByTeacher,
    recentGrades,
    gradesByScore,
  ] = await Promise.all([
    prisma.grade.count({ where: { student: { schoolId } } }),
    prisma.grade.groupBy({
      by: ['gradeType'],
      where: { student: { schoolId } },
      _count: true,
    }),
    prisma.grade.groupBy({
      by: ['subjectId'],
      where: { student: { schoolId } },
      _count: true,
    }),
    prisma.grade.groupBy({
      by: ['studentId'],
      where: { student: { schoolId } },
      _count: true,
    }),
    prisma.grade.groupBy({
      by: ['gradedBy'],
      where: { student: { schoolId } },
      _count: true,
    }),
    prisma.grade.findMany({
      where: { student: { schoolId } },
      orderBy: { gradedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        score: true,
        maxScore: true,
        gradeType: true,
        student: {
          select: {
            fullName: true,
            code: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        gradedAt: true,
      },
    }),
    prisma.grade.findMany({
      where: { student: { schoolId } },
      select: {
        score: true,
        maxScore: true,
      },
    }),
  ]);

  const averageScore = gradesByScore.reduce((sum: number, grade: { score: any }) => sum + Number(grade.score), 0) / gradesByScore.length;

  const statistics = {
    overview: {
      total: totalGrades,
      averageScore: averageScore.toFixed(2),
    },
    byType: gradesByType.map((item: { gradeType: string; _count: number }) => ({
      gradeType: item.gradeType,
      count: item._count,
    })),
    bySubject: gradesBySubject.map((item: { subjectId: number; _count: number }) => ({
      subjectId: item.subjectId,
      count: item._count,
    })),
    byStudent: gradesByStudent.map((item: { studentId: number; _count: number }) => ({
      studentId: item.studentId,
      count: item._count,
    })),
    byTeacher: gradesByTeacher.map((item: { gradedBy: number; _count: number }) => ({
      teacherId: item.gradedBy,
      count: item._count,
    })),
    recentGrades,
    gradeDistribution: {
      excellent: gradesByScore.filter((g: { score: any }) => Number(g.score) >= 90).length,
      good: gradesByScore.filter((g: { score: any }) => Number(g.score) >= 80 && Number(g.score) < 90).length,
      average: gradesByScore.filter((g: { score: any }) => Number(g.score) >= 70 && Number(g.score) < 80).length,
      belowAverage: gradesByScore.filter((g: { score: any }) => Number(g.score) < 70).length,
    },
  };

  res.status(200).json({
    success: true,
    data: statistics,
  });
  })
);

// Get grades for a specific student
router.get('/student/:studentId',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
  const studentId = parseInt(req.params.studentId);

  if (isNaN(studentId)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid student ID',
      },
    });
  }

  // Get student and check permissions
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

  // Check access permissions
  if (req.user.role === 'TEACHER' && student.schoolId !== req.user.schoolId) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied',
      },
    });
  }

  // Students and parents can only view their own grades
  if (req.user.role === 'STUDENT') {
    if (studentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }
  }

  if (req.user.role === 'PARENT') {
    const parentStudent = await prisma.student.findFirst({
      where: {
        parentId: req.user.userId,
        id: studentId,
      },
    });

    if (!parentStudent) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }
  }

  const grades = await prisma.grade.findMany({
    where: { studentId },
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
      grader: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          maxScore: true,
          scheduledAt: true,
          status: true,
        },
      },
      assignment: {
        select: {
          id: true,
          material: {
            select: {
              title: true,
              description: true,
              deadline: true,
            },
          },
        },
      },
    },
    orderBy: [
      { gradedAt: 'desc' },
      { subject: { name: 'asc' } },
    ],
  });

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student.id,
        fullName: student.fullName,
        code: student.code,
        class: student.class,
        parent: student.parentId ? null : null,
      },
      grades,
    },
  });
  })
);

// Get grades for a specific subject
router.get('/subject/:subjectId',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'),
  asyncHandler(async (req: any, res: any) => {
  const subjectId = parseInt(req.params.subjectId);

  if (isNaN(subjectId)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid subject ID',
      },
    });
  }

  // Get subject and check permissions
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!subject) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Subject not found',
      },
    });
  }

  // Check access permissions
  if (req.user.role === 'TEACHER' && subject.schoolId !== req.user.schoolId) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied',
      },
    });
  }

  const grades = await prisma.grade.findMany({
    where: { subjectId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          code: true,
        },
      },
      grader: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          maxScore: true,
          scheduledAt: true,
          status: true,
        },
      },
      assignment: {
        select: {
          id: true,
          material: {
            select: {
              title: true,
              description: true,
              deadline: true,
            },
          },
        },
      },
    },
    orderBy: [
      { gradedAt: 'desc' },
      { student: { fullName: 'asc' } },
    ],
  });

  res.status(200).json({
    success: true,
    data: {
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      grades,
    },
  });
  })
);

// Get grades for a specific class
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
          code: true,
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

  // Students and parents can only view their own class grades
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

  const grades = await prisma.grade.findMany({
    where: {
      student: {
        classId,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          code: true,
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
      grader: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          maxScore: true,
          scheduledAt: true,
          status: true,
        },
      },
      assignment: {
        select: {
          id: true,
          material: {
            select: {
              title: true,
              description: true,
              deadline: true,
            },
          },
        },
      },
    },
    orderBy: [
      { gradedAt: 'desc' },
      { student: { fullName: 'asc' } },
      { subject: { name: 'asc' } },
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
      },
      grades,
    },
  });
  })
);

// Get grades for a specific teacher
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

  // Teachers can only view their own grades
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

  const grades = await prisma.grade.findMany({
    where: { gradedBy: teacherId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          code: true,
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true,
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
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          maxScore: true,
          scheduledAt: true,
          status: true,
        },
      },
      assignment: {
        select: {
          id: true,
          material: {
            select: {
              title: true,
              description: true,
              deadline: true,
            },
          },
        },
      },
    },
    orderBy: [
      { gradedAt: 'desc' },
      { student: { fullName: 'asc' } },
    ],
  });

  res.status(200).json({
    success: true,
    data: {
      teacher,
      grades,
    },
  });
  })
);

export default router;
