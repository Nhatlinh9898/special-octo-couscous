// Grades Service - Đồng bộ dữ liệu điểm giữa sổ điểm và học bạ
export interface GradeData {
  studentId: number;
  subjectId: number;
  subject: string;
  subjectCode: string;
  oral: number;
  quiz1: number;
  quiz2: number;
  oneHour: number;
  midterm: number;
  final: number;
  average: number;
  semester: string;
  academicYear: string;
  teacher: string;
  gradedAt: string;
}

export interface GradeUpdate {
  studentId: number;
  subjectId: number;
  gradeType: 'oral' | 'quiz1' | 'quiz2' | 'oneHour' | 'midterm' | 'final';
  value: number;
  semester: string;
  academicYear: string;
}

class GradesService {
  private grades: GradeData[] = [];
  private listeners: (() => void)[] = [];

  // Mock data initialization
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    this.grades = [
      {
        studentId: 1,
        subjectId: 1,
        subject: "Toán",
        subjectCode: "MAT",
        oral: 8.0,
        quiz1: 7.5,
        quiz2: 8.5,
        oneHour: 9.0,
        midterm: 8.5,
        final: 9.0,
        average: 8.5,
        semester: "2024-1",
        academicYear: "2024",
        teacher: "Thầy Nguyễn Văn Toán",
        gradedAt: "2024-03-15"
      },
      {
        studentId: 1,
        subjectId: 2,
        subject: "Vật Lý",
        subjectCode: "PHY",
        oral: 9.0,
        quiz1: 8.5,
        quiz2: 9.0,
        oneHour: 9.5,
        midterm: 9.0,
        final: 9.0,
        average: 9.0,
        semester: "2024-1",
        academicYear: "2024",
        teacher: "Thầy Trần Thị Lý",
        gradedAt: "2024-03-20"
      },
      {
        studentId: 1,
        subjectId: 3,
        subject: "Hóa Học",
        subjectCode: "CHE",
        oral: 7.5,
        quiz1: 7.0,
        quiz2: 8.0,
        oneHour: 7.5,
        midterm: 7.5,
        final: 7.5,
        average: 7.5,
        semester: "2024-1",
        academicYear: "2024",
        teacher: "Cô Lê Văn Hóa",
        gradedAt: "2024-03-18"
      },
      {
        studentId: 1,
        subjectId: 4,
        subject: "Ngữ Văn",
        subjectCode: "LIT",
        oral: 8.0,
        quiz1: 7.5,
        quiz2: 8.0,
        oneHour: 8.0,
        midterm: 8.0,
        final: 8.0,
        average: 8.0,
        semester: "2024-1",
        academicYear: "2024",
        teacher: "Cô Phạm Thị Văn",
        gradedAt: "2024-03-22"
      }
    ];
  }

  // Subscribe to grade changes
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Get grades for a specific student
  getStudentGrades(studentId: number, semester?: string, academicYear?: string): GradeData[] {
    return this.grades.filter(grade => {
      const matchStudent = grade.studentId === studentId;
      const matchSemester = !semester || grade.semester === semester;
      const matchYear = !academicYear || grade.academicYear === academicYear;
      return matchStudent && matchSemester && matchYear;
    });
  }

  // Update a single grade
  updateGrade(update: GradeUpdate): void {
    const gradeIndex = this.grades.findIndex(g => 
      g.studentId === update.studentId && 
      g.subjectId === update.subjectId &&
      g.semester === update.semester &&
      g.academicYear === update.academicYear
    );

    if (gradeIndex !== -1) {
      // Update the specific grade type
      this.grades[gradeIndex] = {
        ...this.grades[gradeIndex],
        [update.gradeType]: update.value
      };

      // Recalculate average
      this.recalculateAverage(gradeIndex);
      
      // Notify listeners
      this.notify();
    }
  }

  // Calculate average grade
  private recalculateAverage(index: number): void {
    const grade = this.grades[index];
    const values = [
      grade.oral,
      grade.quiz1,
      grade.quiz2,
      grade.oneHour,
      grade.midterm,
      grade.final
    ].filter(v => v > 0); // Only include non-zero values

    if (values.length > 0) {
      grade.average = Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;
    }
  }

  // Get all grades for a class (for GradesView)
  getClassGrades(classId: number, subjectId: number, semester?: string): GradeData[] {
    // In a real app, this would filter by classId as well
    return this.grades.filter(grade => {
      const matchSubject = grade.subjectId === subjectId;
      const matchSemester = !semester || grade.semester === semester;
      return matchSubject && matchSemester;
    });
  }

  // Add new grade record
  addGrade(gradeData: Omit<GradeData, 'average' | 'gradedAt'>): void {
    const newGrade: GradeData = {
      ...gradeData,
      average: 0,
      gradedAt: new Date().toISOString().split('T')[0]
    };

    this.recalculateAverage(this.grades.length);
    this.grades.push(newGrade);
    this.notify();
  }

  // Delete grade record
  deleteGrade(studentId: number, subjectId: number, semester: string, academicYear: string): void {
    const index = this.grades.findIndex(g => 
      g.studentId === studentId && 
      g.subjectId === subjectId &&
      g.semester === semester &&
      g.academicYear === academicYear
    );

    if (index !== -1) {
      this.grades.splice(index, 1);
      this.notify();
    }
  }

  // Get GPA for student
  getStudentGPA(studentId: number, semester?: string, academicYear?: string): number {
    const grades = this.getStudentGrades(studentId, semester, academicYear);
    if (grades.length === 0) return 0;

    const totalAverage = grades.reduce((sum, grade) => sum + grade.average, 0);
    return Math.round((totalAverage / grades.length) * 10) / 10;
  }

  // Export grades to CSV (for both views)
  exportToCSV(studentId?: number, classId?: number, subjectId?: number): string {
    let gradesToExport = this.grades;

    if (studentId) {
      gradesToExport = gradesToExport.filter(g => g.studentId === studentId);
    }
    if (subjectId) {
      gradesToExport = gradesToExport.filter(g => g.subjectId === subjectId);
    }

    const headers = [
      'Student ID', 'Subject', 'Subject Code', 'Miệng', '15 phút (1)', '15 phút (2)', 
      '1 tiết', 'Giữa kỳ', 'Cuối kỳ', 'Trung bình', 'Học kỳ', 'Năm học', 'Giáo viên', 'Ngày chấm'
    ];

    const rows = gradesToExport.map(grade => [
      grade.studentId,
      grade.subject,
      grade.subjectCode,
      grade.oral || '-',
      grade.quiz1 || '-',
      grade.quiz2 || '-',
      grade.oneHour || '-',
      grade.midterm || '-',
      grade.final || '-',
      grade.average,
      grade.semester,
      grade.academicYear,
      grade.teacher,
      grade.gradedAt
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// Singleton instance
export const gradesService = new GradesService();
