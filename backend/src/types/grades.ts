// Temporary types for grades to fix TypeScript errors
// This should be replaced by generated Prisma types after migration

export interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  classId: number;
  type: string;
  oral?: number;
  quiz1?: number;
  quiz2?: number;
  oneHour?: number;
  midterm?: number;
  final?: number;
  average: number;
  maxScore: number;
  percentage?: number;
  letterGrade?: string;
  gpa?: number;
  examScore?: number;
  examMaxScore?: number;
  examPercentage?: number;
  assignmentScore?: number;
  assignmentMaxScore?: number;
  assignmentPercentage?: number;
  participationScore?: number;
  participationMaxScore?: number;
  participationPercentage?: number;
  semester: string;
  academicYear: string;
  comments?: string;
  gradedBy?: number;
  assignmentId?: number;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: number;
    code: string;
    fullName: string;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  class?: {
    id: number;
    schoolId: number;
  };
}
