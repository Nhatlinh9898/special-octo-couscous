import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { QuestionType } from '@prisma/client';

const router = Router();

// Get all exams (with pagination and filtering)
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('classId').optional().isInt().withMessage('Class ID must be an integer'),
    query('subjectId').optional().isInt().withMessage('Subject ID must be an integer'),
    query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED']).withMessage('Invalid status'),
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
    const { classId, subjectId, status, search } = req.query;

    const where: any = {};

    // Students can only see exams for their class
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { classId: true },
      });
      
      if (student) {
        where.classId = student.classId;
      }
    } else if (classId) {
      where.classId = parseInt(classId);
    }

    if (subjectId) {
      where.subjectId = parseInt(subjectId);
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          subject: true,
          teacher: true,
        } as any,
        orderBy: [
          { createdAt: 'desc' },
        ],
      }),
      prisma.exam.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        exams,
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

// Get exam by ID
router.get('/:id',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'STUDENT'),
  asyncHandler(async (req: any, res: any) => {
    const examId = parseInt(req.params.id);

    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid exam ID',
        },
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      } as any,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Exam not found',
        },
      });
    }

    // Check access permissions
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { classId: true },
      });
      
      if (!student || !(exam as any).class || student.classId !== (exam as any).class.id) {
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
      data: exam,
    });
  })
);

// Create new exam
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('classId').isInt().withMessage('Class ID must be an integer'),
    body('subjectId').isInt().withMessage('Subject ID must be an integer'),
    body('title').notEmpty().withMessage('Exam title is required'),
    body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('duration').isInt({ min: 5, max: 300 }).withMessage('Duration must be between 5 and 300 minutes'),
    body('startTime').isISO8601().withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().withMessage('End time must be a valid date'),
    body('maxAttempts').optional().isInt({ min: 1, max: 10 }).withMessage('Max attempts must be between 1 and 10'),
    body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
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
      subjectId,
      title,
      description,
      duration,
      startTime,
      endTime,
      maxAttempts = 1,
      passingScore = 50,
    } = req.body;

    // Check if teacher has access to this class
    if (req.user.role === 'TEACHER') {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: { schoolId: true },
      });

      if (!classData || classData.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    const exam = await prisma.exam.create({
      data: {
        schoolId: req.user.schoolId,
        classId: parseInt(classId),
        subjectId: parseInt(subjectId),
        teacherId: req.user.userId,
        title,
        description,
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxAttempts,
        passingScore,
        status: 'DRAFT',
      },
      include: {
        class: {
          select: {
            name: true,
            gradeLevel: true,
          },
        } as any,
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Exam created successfully',
    });
  })
);

// Generate exam questions using AI
router.post('/:id/generate-questions',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('questionCount').isInt({ min: 1, max: 50 }).withMessage('Question count must be between 1 and 50'),
    body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD', 'MIXED']).withMessage('Invalid difficulty level'),
    body('questionTypes').optional().isArray().withMessage('Question types must be an array'),
    body('topics').optional().isArray().withMessage('Topics must be an array'),
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

    const examId = parseInt(req.params.id);
    const {
      questionCount,
      difficulty = 'MIXED',
      questionTypes = ['MULTIPLE_CHOICE'],
      topics = [],
    } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      } as any,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Exam not found',
        },
      });
    }

    // Check permissions
    if (req.user.role === 'TEACHER' && (exam as any).teacher?.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    try {
      // Generate questions using AI service
      const generatedQuestions = await generateAIQuestions({
        subject: (exam as any).subject?.name || '',
        topics,
        questionCount,
        difficulty,
        questionTypes,
      });

      // Clear existing questions
      await prisma.question.deleteMany({
        where: { examId },
      });

      // Create new questions
      const createdQuestions = await Promise.all(
        generatedQuestions.map(async (q, index) => {
          const question = await prisma.question.create({
            data: {
              examId,
              type: q.type,
              content: q.content,
              points: q.points || 1,
              order: index + 1,
              explanation: q.explanation,
            },
          });

          // Create options for multiple choice questions
          if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
            await Promise.all(
              q.options.map((option: any) =>
                prisma.questionOption.create({
                  data: {
                    questionId: question.id,
                    content: option.content,
                    isCorrect: option.isCorrect,
                  },
                })
              )
            );
          }

          return question;
        })
      );

      res.status(201).json({
        success: true,
        data: {
          questions: createdQuestions,
          count: createdQuestions.length,
        },
        message: 'Questions generated successfully',
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate questions',
          details: errorMessage,
        },
      });
    }
  })
);

// Start exam for student
router.post('/:id/start',
  authenticate,
  authorize('STUDENT'),
  asyncHandler(async (req: any, res: any) => {
    const examId = parseInt(req.params.id);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        class: {
          select: {
            id: true,
          },
        },
      } as any,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Exam not found',
        },
      });
    }

    // Check if student has access to this exam
    const student = await prisma.student.findFirst({
      where: { email: req.user.email },
      select: { id: true, classId: true },
    });

    if (!student || student.classId !== (exam as any).classId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    }

    // Check if exam is available
    const now = new Date();
    if ((exam as any).startTime && now < (exam as any).startTime) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Exam has not started yet',
        },
      });
    }
    
    if ((exam as any).endTime && now > (exam as any).endTime) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Exam has already ended',
        },
      });
    }

    // Check attempts
    const existingSubmissions = await prisma.examSubmission.count({
      where: {
        examId,
        studentId: student.id,
      },
    });

    if (existingSubmissions >= ((exam as any).maxAttempts || 1)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Maximum attempts reached',
        },
      });
    }

    // Create new submission
    const submission = await prisma.examSubmission.create({
      data: {
        examId,
        studentId: student.id,
        startTime: new Date(),
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        submission,
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          questions: (exam as any).questions || [],
        },
      },
      message: 'Exam started successfully',
    });
  })
);

// Submit exam answer
router.post('/submissions/:submissionId/answer',
  authenticate,
  authorize('STUDENT'),
  [
    body('questionId').isInt().withMessage('Question ID must be an integer'),
    body('answer').notEmpty().withMessage('Answer is required'),
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

    const submissionId = parseInt(req.params.submissionId);
    const { questionId, answer } = req.body;

    // Verify submission belongs to student
    const submission = await prisma.examSubmission.findFirst({
      where: {
        id: submissionId,
        student: {
          email: req.user.email,
        },
        status: 'IN_PROGRESS',
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Submission not found or not accessible',
        },
      });
    }

    // Save or update answer
    const answerData = {
      submissionId,
      questionId,
      answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
    };

    const submissionAnswer = await prisma.submissionAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId,
        },
      },
      update: {
        answer: answerData.answer,
      },
      create: answerData,
    });

    res.status(200).json({
      success: true,
      data: submissionAnswer,
      message: 'Answer saved successfully',
    });
  })
);

// Submit exam
router.post('/submissions/:submissionId/submit',
  authenticate,
  authorize('STUDENT'),
  asyncHandler(async (req: any, res: any) => {
    const submissionId = parseInt(req.params.submissionId);

    const submission = await prisma.examSubmission.findFirst({
      where: {
        id: submissionId,
        student: {
          email: req.user.email,
        },
        status: 'IN_PROGRESS',
      },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Submission not found or not accessible',
        },
      });
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    for (const question of submission.exam.questions) {
      maxScore += question.points;
      const studentAnswer = submission.answers.find(a => a.questionId === question.id);

      if (studentAnswer) {
        const isCorrect = await checkAnswer(question, studentAnswer.answer);
        if (isCorrect) {
          totalScore += question.points;
        }
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= submission.exam.passingScore;

    // Update submission
    const updatedSubmission = await prisma.examSubmission.update({
      where: { id: submissionId },
      data: {
        endTime: new Date(),
        status: 'SUBMITTED',
        score: totalScore,
        percentage,
        passed,
      },
    });

    // Update student's grade
    await updateStudentGrade(
      submission.studentId,
      submission.exam.subjectId,
      submission.exam.classId,
      totalScore,
      maxScore,
      percentage
    );

    res.status(200).json({
      success: true,
      data: {
        submission: updatedSubmission,
        results: {
          score: totalScore,
          maxScore,
          percentage,
          passed,
        },
      },
      message: 'Exam submitted successfully',
    });
  })
);

// Get student's exam history
router.get('/students/:studentId/history',
  authenticate,
  authorize('STUDENT', 'TEACHER', 'ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const studentId = parseInt(req.params.studentId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check permissions
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { id: true },
      });
      
      if (!student || student.id !== studentId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.examSubmission.findMany({
        where: { studentId },
        skip,
        take: limit,
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
              maxScore: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.examSubmission.count({ where: { studentId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        submissions,
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

// Get submission details with answers
router.get('/submissions/:submissionId',
  authenticate,
  authorize('STUDENT', 'TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const submissionId = parseInt(req.params.submissionId);

    const submission = await prisma.examSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            code: true,
          },
        },
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Submission not found',
        },
      });
    }

    // Check permissions
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { email: req.user.email },
        select: { id: true },
      });
      
      if (!student || student.id !== submission.studentId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }
    }

    // Don't allow editing if exam is submitted
    if (submission.status === 'SUBMITTED') {
      // Mark answers as read-only
      submission.answers.forEach(answer => {
        (answer as any).readOnly = true;
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  })
);

// Helper functions
async function generateAIQuestions(params: {
  subject: string;
  topics: string[];
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
}) {
  // This would integrate with an AI service
  // For now, return mock questions
  const questions = [];
  
  for (let i = 0; i < params.questionCount; i++) {
      const question = {
      type: QuestionType.MULTIPLE_CHOICE,
      content: `Question ${i + 1} about ${params.subject}`,
      points: 1,
      explanation: `Explanation for question ${i + 1}`,
      options: [
        { content: 'Option A', isCorrect: false },
        { content: 'Option B', isCorrect: true },
        { content: 'Option C', isCorrect: false },
        { content: 'Option D', isCorrect: false },
      ],
    };
    questions.push(question);
  }
  
  return questions;
}

async function checkAnswer(question: any, studentAnswer: string) {
  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    const correctOption = question.options.find((opt: any) => opt.isCorrect);
    return correctOption?.content === studentAnswer;
  }
  
  // Add more question type checking logic here
  return false;
}

async function updateStudentGrade(
  studentId: number,
  subjectId: number,
  classId: number,
  score: number,
  maxScore: number,
  percentage: number,
  semester: string = 'Current',
  academicYear: string = '2024-2025'
) {
  // Update or create grade record
  await prisma.grade.upsert({
    where: {
      studentId_subjectId_classId_semester_academicYear: {
        studentId,
        subjectId,
        classId,
        semester,
        academicYear,
      },
    },
    update: {
      examScore: score,
      examMaxScore: maxScore,
      examPercentage: percentage,
      updatedAt: new Date(),
    },
    create: {
      studentId,
      subjectId,
      classId,
      type: 'FINAL',
      score,
      maxScore,
      percentage,
      examScore: score,
      examMaxScore: maxScore,
      examPercentage: percentage,
      semester,
      academicYear,
    },
  });
}

export default router;
