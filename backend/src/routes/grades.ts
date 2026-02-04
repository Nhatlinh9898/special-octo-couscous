import { Router } from 'express';
const { body, query, validationResult } = require('express-validator') as any;
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../config/database';
import { Grade } from '../types/grades';

const router = Router();

// Get grades for a class and subject
router.get('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('classId').isInt().withMessage('Class ID must be an integer'),
    query('subjectId').isInt().withMessage('Subject ID must be an integer'),
    query('semester').optional().isString().withMessage('Semester must be a string'),
    query('academicYear').optional().isString().withMessage('Academic year must be a string'),
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

    const { classId, subjectId, semester, academicYear } = req.query;
    
    try {
      const grades = await prisma.grade.findMany({
        where: {
          classId: parseInt(classId as string),
          subjectId: parseInt(subjectId as string),
          ...(semester && { semester }),
          ...(academicYear && { academicYear }),
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
            },
          },
        },
        orderBy: {
          student: {
            fullName: 'asc',
          },
        },
      });

      res.status(200).json({
        success: true,
        data: grades,
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch grades',
        },
      });
    }
  })
);

// Get grades for a specific student
router.get('/student/:studentId',
  authenticate,
  authorize('TEACHER', 'ADMIN', 'PARENT', 'STUDENT'),
  [
    query('semester').optional().isString().withMessage('Semester must be a string'),
    query('academicYear').optional().isString().withMessage('Academic year must be a string'),
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

    const { studentId } = req.params;
    const { semester, academicYear } = req.query;
    
    try {
      // Check permissions
      if (req.user.role === 'STUDENT' && parseInt(studentId) !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }

      if (req.user.role === 'PARENT') {
        const student = await prisma.student.findUnique({
          where: { id: parseInt(studentId) },
          select: { parentId: true },
        });
        
        if (!student || student.parentId !== req.user.userId) {
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
          studentId: parseInt(studentId),
          ...(semester && { semester }),
          ...(academicYear && { academicYear }),
        },
        include: {
          subject: {
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
            },
          },
        },
        orderBy: [
          { academicYear: 'desc' },
          { semester: 'desc' },
          { subject: { name: 'asc' } },
        ],
      });

      res.status(200).json({
        success: true,
        data: grades,
      });
    } catch (error) {
      console.error('Error fetching student grades:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch student grades',
        },
      });
    }
  })
);

// Create or update grade
router.post('/',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    body('studentId').isInt().withMessage('Student ID must be an integer'),
    body('subjectId').isInt().withMessage('Subject ID must be an integer'),
    body('classId').isInt().withMessage('Class ID must be an integer'),
    body('semester').isString().withMessage('Semester is required'),
    body('academicYear').isString().withMessage('Academic year is required'),
    body('gradeType').isIn(['oral', 'quiz1', 'quiz2', 'oneHour', 'midterm', 'final']).withMessage('Invalid grade type'),
    body('value').isFloat({ min: 0, max: 10 }).withMessage('Grade value must be between 0 and 10'),
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
      classId,
      semester,
      academicYear,
      gradeType,
      value,
      type = 'ASSIGNMENT'
    } = req.body;

    try {
      // Check if teacher has access to this class
      if (req.user.role === 'TEACHER') {
        const classInfo = await prisma.class.findUnique({
          where: { id: classId },
          select: { schoolId: true },
        });

        if (!classInfo || classInfo.schoolId !== req.user.schoolId) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Access denied',
            },
          });
        }
      }

      // Check if grade record exists
      const existingGrade = await prisma.grade.findFirst({
        where: {
          studentId,
          subjectId,
          classId,
          semester,
          academicYear,
        },
      });

      let grade;
      
      if (existingGrade) {
        // Update existing grade
        const updateData: any = {
          [gradeType]: value,
          gradedBy: req.user.userId,
          updatedAt: new Date(),
        };

        // Recalculate average
        const gradeValues = [
          (existingGrade as any).oral,
          (existingGrade as any).quiz1,
          (existingGrade as any).quiz2,
          (existingGrade as any).oneHour,
          (existingGrade as any).midterm,
          (existingGrade as any).final,
        ];
        
        gradeValues[gradeType === 'oral' ? 0 : 
                    gradeType === 'quiz1' ? 1 : 
                    gradeType === 'quiz2' ? 2 : 
                    gradeType === 'oneHour' ? 3 : 
                    gradeType === 'midterm' ? 4 : 5] = value;

        const validGrades = gradeValues.filter(g => g !== null && g !== undefined);
        const average = validGrades.length > 0 
          ? validGrades.reduce((sum: number, g: any) => sum + parseFloat(g), 0) / validGrades.length 
          : 0;

        updateData.average = average;
        updateData.percentage = (average / 10) * 100;

        // Calculate letter grade
        let letterGrade = '';
        if (average >= 9.5) letterGrade = 'A+';
        else if (average >= 8.5) letterGrade = 'A';
        else if (average >= 7.5) letterGrade = 'B+';
        else if (average >= 6.5) letterGrade = 'B';
        else if (average >= 5.5) letterGrade = 'C+';
        else if (average >= 4.5) letterGrade = 'C';
        else if (average >= 3.5) letterGrade = 'D';
        else letterGrade = 'F';

        updateData.letterGrade = letterGrade;

        grade = await prisma.grade.update({
          where: { id: existingGrade.id },
          data: updateData,
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
              },
            },
          },
        });
      } else {
        // Create new grade record
        const gradeData: any = {
          studentId,
          subjectId,
          classId,
          semester,
          academicYear,
          type,
          gradedBy: req.user.userId,
          average: value,
          percentage: (value / 10) * 100,
        };

        // Set the specific grade type
        gradeData[gradeType] = value;

        // Calculate letter grade
        let letterGrade = '';
        if (value >= 9.5) letterGrade = 'A+';
        else if (value >= 8.5) letterGrade = 'A';
        else if (value >= 7.5) letterGrade = 'B+';
        else if (value >= 6.5) letterGrade = 'B';
        else if (value >= 5.5) letterGrade = 'C+';
        else if (value >= 4.5) letterGrade = 'C';
        else if (value >= 3.5) letterGrade = 'D';
        else letterGrade = 'F';

        gradeData.letterGrade = letterGrade;

        grade = await prisma.grade.create({
          data: gradeData,
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
              },
            },
          },
        });
      }

      res.status(200).json({
        success: true,
        data: grade,
        message: 'Grade saved successfully',
      });
    } catch (error) {
      console.error('Error saving grade:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to save grade',
        },
      });
    }
  })
);

// Delete grade
router.delete('/:gradeId',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  asyncHandler(async (req: any, res: any) => {
    const { gradeId } = req.params;

    try {
      // Check if grade exists and user has permission
      const grade = await prisma.grade.findUnique({
        where: { id: parseInt(gradeId) },
        include: {
          class: {
            select: {
              schoolId: true,
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

      if (req.user.role === 'TEACHER' && grade.class?.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
          },
        });
      }

      await prisma.grade.delete({
        where: { id: parseInt(gradeId) },
      });

      res.status(200).json({
        success: true,
        message: 'Grade deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting grade:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete grade',
        },
      });
    }
  })
);

// Get class statistics
router.get('/statistics/class/:classId',
  authenticate,
  authorize('TEACHER', 'ADMIN'),
  [
    query('subjectId').optional().isInt().withMessage('Subject ID must be an integer'),
    query('semester').optional().isString().withMessage('Semester must be a string'),
    query('academicYear').optional().isString().withMessage('Academic year must be a string'),
  ],
  asyncHandler(async (req: any, res: any) => {
    const { classId } = req.params;
    const { subjectId, semester, academicYear } = req.query;

    try {
      const where: any = { classId: parseInt(classId) };
      if (subjectId) where.subjectId = parseInt(subjectId as string);
      if (semester) where.semester = semester;
      if (academicYear) where.academicYear = academicYear;

      const grades = await prisma.grade.findMany({
        where,
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
            },
          },
        },
      });

      // Calculate statistics
      const totalStudents = grades.length;
      const averageGrade = totalStudents > 0 
        ? grades.reduce((sum, g) => sum + parseFloat(g.average.toString()), 0) / totalStudents 
        : 0;
      
      const gradeDistribution = {
        A: grades.filter(g => g.letterGrade === 'A' || g.letterGrade === 'A+').length,
        B: grades.filter(g => g.letterGrade === 'B' || g.letterGrade === 'B+').length,
        C: grades.filter(g => g.letterGrade === 'C' || g.letterGrade === 'C+').length,
        D: grades.filter(g => g.letterGrade === 'D').length,
        F: grades.filter(g => g.letterGrade === 'F').length,
      };

      res.status(200).json({
        success: true,
        data: {
          totalStudents,
          averageGrade: Math.round(averageGrade * 100) / 100,
          gradeDistribution,
          grades: grades.map(g => ({
            ...g,
            average: (g as any).average || 0
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching class statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch class statistics',
        },
      });
    }
  })
);

export default router;
