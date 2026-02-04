import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './context';
import { gradesService, GradeData } from './gradesService';
import { 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  FileText, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Users,
  GraduationCap,
  Star,
  Activity,
  ChevronLeft
} from 'lucide-react';

interface StudentDetail {
  id: number;
  fullName: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  status: string;
  class: {
    name: string;
    gradeLevel: number;
    homeroomTeacher: string;
  };
  school: {
    name: string;
    code: string;
  };
  parent: {
    fullName: string;
    email: string;
    phone: string;
  };
  avatar?: string;
  enrollmentDate: string;
  gpa: number;
  rank: number;
  totalStudents: number;
}

interface Analytics {
  overallGPA: number;
  attendanceRate: number;
  behaviorScore: number;
  participationScore: number;
  improvementTrend: number;
  subjectPerformance: {
    subject: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  monthlyProgress: {
    month: string;
    gpa: number;
    attendance: number;
  }[];
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  period: number;
  subject: string;
  notes?: string;
  teacher: string;
}

const StudentDetailView: React.FC = () => {
  const { selectedStudentId, setShowStudentDetail } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedSemester, setSelectedSemester] = useState('2024-1');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockStudent: StudentDetail = {
        id: selectedStudentId || 1,
        fullName: "Nguyễn Văn An",
        code: "HS001",
        email: "an.nguyen@school.edu.vn",
        phone: "0912345678",
        address: "123 Nguyễn Huệ, Q.1, TP.HCM",
        dateOfBirth: "2008-03-15",
        gender: "MALE",
        status: "ACTIVE",
        class: {
          name: "10A1",
          gradeLevel: 10,
          homeroomTeacher: "Trần Thị Bình"
        },
        school: {
          name: "Trường THPT Chuyên ABC",
          code: "ABC"
        },
        parent: {
          fullName: "Nguyễn Văn Father",
          email: "father.nguyen@email.com",
          phone: "0912345679"
        },
        enrollmentDate: "2023-09-01",
        gpa: 8.5,
        rank: 5,
        totalStudents: 120
      };

      // Get grades from service
      const studentGrades = gradesService.getStudentGrades(selectedStudentId || 1, selectedSemester, selectedYear);

      const mockAttendance: AttendanceRecord[] = [
        {
          id: 1,
          date: "2024-03-25",
          status: "PRESENT",
          period: 1,
          subject: "Toán",
          teacher: "Thầy Nguyễn Văn Toán"
        },
        {
          id: 2,
          date: "2024-03-25",
          status: "PRESENT",
          period: 2,
          subject: "Vật Lý",
          teacher: "Thầy Trần Thị Lý"
        },
        {
          id: 3,
          date: "2024-03-24",
          status: "ABSENT",
          period: 3,
          subject: "Hóa Học",
          notes: "Ốm",
          teacher: "Cô Lê Văn Hóa"
        },
        {
          id: 4,
          date: "2024-03-24",
          status: "LATE",
          period: 1,
          subject: "Ngữ Văn",
          notes: "Đi muộn 10 phút",
          teacher: "Cô Phạm Thị Văn"
        }
      ];

      const mockAnalytics: Analytics = {
        overallGPA: 8.5,
        attendanceRate: 95.5,
        behaviorScore: 8.8,
        participationScore: 9.2,
        improvementTrend: 2.3,
        subjectPerformance: [
          { subject: "Toán", average: 8.5, trend: "up" },
          { subject: "Vật Lý", average: 9.0, trend: "stable" },
          { subject: "Hóa Học", average: 7.5, trend: "down" },
          { subject: "Ngữ Văn", average: 8.0, trend: "up" }
        ],
        monthlyProgress: [
          { month: "T1", gpa: 8.2, attendance: 98 },
          { month: "T2", gpa: 8.4, attendance: 96 },
          { month: "T3", gpa: 8.5, attendance: 95.5 }
        ]
      };

      setStudent(mockStudent);
      setGrades(studentGrades);
      setAttendance(mockAttendance);
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [selectedStudentId, selectedSemester, selectedYear]);

  // Subscribe to grade changes
  useEffect(() => {
    const unsubscribe = gradesService.subscribe(() => {
      if (selectedStudentId) {
        const updatedGrades = gradesService.getStudentGrades(selectedStudentId, selectedSemester, selectedYear);
        setGrades(updatedGrades);
      }
    });

    return unsubscribe;
  }, [selectedStudentId, selectedSemester, selectedYear]);

  const tabs = [
    { id: 'info', label: 'Thông tin chi tiết', icon: User },
    { id: 'grades', label: 'Học bạ', icon: BookOpen },
    { id: 'attendance', label: 'Điểm danh', icon: Calendar },
    { id: 'analytics', label: 'Phân tích & Đánh giá', icon: BarChart3 },
    { id: 'activities', label: 'Hoạt động', icon: Activity }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ABSENT': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'LATE': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'EXCUSED': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy thông tin học sinh</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowStudentDetail(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Quay lại"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{student.fullName}</h1>
              <p className="text-gray-500">Mã học sinh: {student.code}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">Lớp: {student.class.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {student.status === 'ACTIVE' ? 'Đang học' : 'Không hoạt động'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Xem chế độ riêng tư
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{student.gpa}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">GPA Trung bình</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{analytics?.attendanceRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Tỷ lệ chuyên cần</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Award className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">#{student.rank}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Xếp hạng lớp</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Star className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{analytics?.behaviorScore}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Điểm hạnh kiểm</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-medium">{student.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày sinh</p>
                        <p className="font-medium">{student.dateOfBirth}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-medium">{student.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Giới tính</p>
                        <p className="font-medium">{student.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày nhập học</p>
                        <p className="font-medium">{student.enrollmentDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin lớp học</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Lớp</p>
                        <p className="font-medium">{student.class.name} - Khối {student.class.gradeLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">GVCN</p>
                        <p className="font-medium">{student.class.homeroomTeacher}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Trường</p>
                        <p className="font-medium">{student.school.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Xếp hạng</p>
                        <p className="font-medium">#{student.rank}/{student.totalStudents}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin phụ huynh</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Họ tên phụ huynh</p>
                      <p className="font-medium">{student.parent.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email phụ huynh</p>
                      <p className="font-medium">{student.parent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">SĐT phụ huynh</p>
                      <p className="font-medium">{student.parent.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="2024">Năm học 2024-2025</option>
                  <option value="2023">Năm học 2023-2024</option>
                  <option value="2022">Năm học 2022-2023</option>
                </select>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="2024-1">Học kỳ 1</option>
                  <option value="2024-2">Học kỳ 2</option>
                  <option value="2024-summer">Hè</option>
                </select>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px] border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="p-4 sticky left-0 bg-gray-50 border-r">Môn học</th>
                      <th className="p-4 text-center">Miệng</th>
                      <th className="p-4 text-center">15 phút (1)</th>
                      <th className="p-4 text-center">15 phút (2)</th>
                      <th className="p-4 text-center">1 tiết</th>
                      <th className="p-4 text-center">Giữa kỳ</th>
                      <th className="p-4 text-center">Cuối kỳ</th>
                      <th className="p-4 text-center font-bold">TB Môn</th>
                      <th className="p-4 text-left">Giáo viên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grades.map(grade => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium sticky left-0 bg-white border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div>
                            <p className="font-medium">{grade.subject}</p>
                            <p className="text-sm text-gray-500">{grade.subjectCode}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.oral >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.oral >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.oral || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.quiz1 >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.quiz1 >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.quiz1 || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.quiz2 >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.quiz2 >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.quiz2 || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.oneHour >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.oneHour >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.oneHour || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.midterm >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.midterm >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.midterm || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.final >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.final >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.final || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-indigo-600">
                          <span className={`inline-block w-12 h-8 leading-8 text-center border rounded ${
                            grade.average >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                            grade.average >= 6.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {grade.average}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <p>{grade.teacher}</p>
                          <p className="text-xs text-gray-400">{grade.gradedAt}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Điểm trung bình học kỳ</h4>
                  <p className="text-2xl font-bold text-blue-600">{student.gpa}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Số môn học</h4>
                  <p className="text-2xl font-bold text-green-600">{grades.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Xếp hạng</h4>
                  <p className="text-2xl font-bold text-purple-600">#{student.rank}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Attendance Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Có mặt</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {attendance.filter(a => a.status === 'PRESENT').length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Vắng mặt</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {attendance.filter(a => a.status === 'ABSENT').length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Đi muộn</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendance.filter(a => a.status === 'LATE').length}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Nghỉ có phép</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {attendance.filter(a => a.status === 'EXCUSED').length}
                  </p>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border border-gray-200">Ngày</th>
                      <th className="text-left p-3 border border-gray-200">Tiết</th>
                      <th className="text-left p-3 border border-gray-200">Môn học</th>
                      <th className="text-center p-3 border border-gray-200">Trạng thái</th>
                      <th className="text-left p-3 border border-gray-200">Giáo viên</th>
                      <th className="text-left p-3 border border-gray-200">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="p-3 border border-gray-200">{record.date}</td>
                        <td className="p-3 border border-gray-200">{record.period}</td>
                        <td className="p-3 border border-gray-200">{record.subject}</td>
                        <td className="p-3 border border-gray-200">
                          <div className="flex items-center gap-2 justify-center">
                            {getAttendanceIcon(record.status)}
                            <span className="text-sm">
                              {record.status === 'PRESENT' ? 'Có mặt' :
                               record.status === 'ABSENT' ? 'Vắng mặt' :
                               record.status === 'LATE' ? 'Đi muộn' : 'Nghỉ có phép'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 border border-gray-200">{record.teacher}</td>
                        <td className="p-3 border border-gray-200 text-sm text-gray-600">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan học tập</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GPA Trung bình</span>
                      <span className="text-2xl font-bold text-indigo-600">{analytics?.overallGPA}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tỷ lệ chuyên cần</span>
                      <span className="text-xl font-semibold text-green-600">{analytics?.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Điểm hạnh kiểm</span>
                      <span className="text-xl font-semibold text-purple-600">{analytics?.behaviorScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Điểm tham gia</span>
                      <span className="text-xl font-semibold text-orange-600">{analytics?.participationScore}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Xu hướng cải thiện</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600">Cải thiện GPA</span>
                      <span className="text-lg font-semibold text-green-600">+{analytics?.improvementTrend}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-sm text-gray-600">Học sinh đang cho thấy sự tiến bộ rõ rệt trong học tập</p>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Hiệu suất theo môn học</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analytics?.subjectPerformance.map((subject, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{subject.subject}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(subject.trend)}
                          <span className="font-semibold">{subject.average}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            subject.average >= 8 ? 'bg-green-500' :
                            subject.average >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{width: `${subject.average * 10}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tiến độ hàng tháng</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-4">
                    {analytics?.monthlyProgress.map((month, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-12 font-medium">{month.month}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">GPA:</span>
                            <span className="font-semibold">{month.gpa}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{width: `${month.gpa * 10}%`}}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Chuyên cần:</span>
                            <span className="font-semibold">{month.attendance}%</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{width: `${month.attendance}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hoạt động ngoại khóa</h3>
                <p className="text-gray-600">Chức năng đang được phát triển</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
