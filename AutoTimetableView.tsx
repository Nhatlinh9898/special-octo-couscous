import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, Trophy, Play, Eye, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button, Modal } from './components';
import StudentSelector from './components/StudentSelector';
import ClubSelector from './components/ClubSelector';
import CourseSelector from './components/CourseSelector';

interface Subject {
  id: number;
  name: string;
  code: string;
  sessionsPerWeek: number;
  credits: number;
}

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  subjectIds: number[];
}

interface Club {
  id: number;
  name: string;
  category: string;
  advisorId?: number;
  meetingsPerWeek: number;
}

interface Class {
  id: number;
  name: string;
  gradeLevel: number;
}

const AutoTimetableView = () => {
  const [activeTab, setActiveTab] = useState<'class' | 'club'>('class');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  
  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [semester, setSemester] = useState('FALL');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  // Process states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load classes
      const classesResponse = await fetch('/api/classes');
      const classesData = await classesResponse.json();
      if (classesData.success) {
        setClasses(classesData.data.classes || []);
      }

      // Load subjects
      const subjectsResponse = await fetch('/api/subjects');
      const subjectsData = await subjectsResponse.json();
      if (subjectsData.success) {
        setSubjects(subjectsData.data.subjects || []);
      }

      // Load teachers
      const teachersResponse = await fetch('/api/users?role=TEACHER');
      const teachersData = await teachersResponse.json();
      if (teachersData.success) {
        setTeachers(teachersData.data.users || []);
      }

      // Load clubs
      const clubsResponse = await fetch('/api/clubs');
      const clubsData = await clubsResponse.json();
      if (clubsData.success) {
        setClubs(clubsData.data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handlePreview = async () => {
    if (activeTab === 'class' && (!selectedClass || selectedSubjects.length === 0)) {
      alert('Vui lòng chọn lớp và ít nhất một môn học');
      return;
    }

    if (activeTab === 'club' && selectedClubs.length === 0) {
      alert('Vui lòng chọn ít nhất một câu lạc bộ');
      return;
    }

    if (activeTab === 'student' && !selectedStudent) {
      alert('Vui lòng chọn học sinh');
      return;
    }

    if (activeTab === 'course' && selectedCourses.length === 0) {
      alert('Vui lòng chọn ít nhất một khóa học');
      return;
    }

    setIsPreviewing(true);
    try {
      let payload;
      
      if (activeTab === 'class') {
        payload = {
          classId: parseInt(selectedClass),
          semester,
          academicYear,
          subjects: subjects.filter(s => selectedSubjects.includes(s.id)).map(s => ({
            id: s.id,
            name: s.name,
            code: s.code,
            sessionsPerWeek: s.sessionsPerWeek || 2,
            credits: s.credits,
          })),
          teachers: teachers.filter(t => selectedTeachers.includes(t.id)),
          constraints: {},
        };
      } else if (activeTab === 'club') {
        payload = {
          schoolId: 1,
          semester,
          academicYear,
          clubs: selectedClubs.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            advisorId: c.advisorId,
            meetingsPerWeek: c.meetingsPerWeek || 1,
          })),
        };
      } else if (activeTab === 'student') {
        payload = {
          studentId: selectedStudent.id,
          semester,
          academicYear,
        };
      } else if (activeTab === 'course') {
        payload = {
          courseIds: selectedCourses.map(c => c.id),
          semester,
          academicYear,
        };
      }

      const response = await fetch('/api/auto-timetable/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setPreview(data.data);
        setShowPreviewModal(true);
      } else {
        alert('Lỗi khi tạo preview: ' + data.error?.message);
      }
    } catch (error) {
      console.error('Error previewing timetable:', error);
      alert('Lỗi khi tạo preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!preview) {
      alert('Vui lòng xem preview trước khi tạo thời khóa biểu');
      return;
    }

    setIsGenerating(true);
    try {
      const endpoint = activeTab === 'class' ? '/api/auto-timetable/generate' : '/api/auto-timetable/generate-clubs';
      
      const payload = activeTab === 'class' ? {
        classId: parseInt(selectedClass),
        semester,
        academicYear,
        subjects: subjects.filter(s => selectedSubjects.includes(s.id)).map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          sessionsPerWeek: s.sessionsPerWeek || 2,
          credits: s.credits,
        })),
        teachers: teachers.filter(t => selectedTeachers.includes(t.id)),
        constraints: {},
      } : {
        schoolId: 1,
        semester,
        academicYear,
        clubs: selectedClubs.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          advisorId: c.advisorId,
          meetingsPerWeek: c.meetingsPerWeek || 1,
        })),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setShowResultModal(true);
        setShowPreviewModal(false);
      } else {
        alert('Lỗi khi tạo thời khóa biểu: ' + data.error?.message);
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Lỗi khi tạo thời khóa biểu');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['', 'Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek] || `Thứ ${dayOfWeek}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={28} className="text-blue-600" />
            Tạo Thời Khóa Biểu Tự Động
          </h2>
          <p className="text-gray-500">Hệ thống thông minh tạo lịch học và sinh hoạt tự động</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'class'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          Thời Khóa Biểu Lớp
        </button>
        <button
          onClick={() => setActiveTab('club')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'club'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trophy size={16} className="inline mr-2" />
          Lịch CLB
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'student'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users size={16} className="inline mr-2" />
          TKB Học Sinh
        </button>
        <button
          onClick={() => setActiveTab('course')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'course'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          TKB Khóa Học
        </button>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-gray-600" />
          Cấu Hình {activeTab === 'class' ? 'Lớp Học' : activeTab === 'club' ? 'Câu Lạc Bộ' : activeTab === 'student' ? 'Học Sinh' : 'Khóa Học'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học Kỳ
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm Học
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024-2025"
              />
            </div>

            {activeTab === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp Học
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Lớp {cls.gradeLevel}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Học Sinh
                </label>
                <StudentSelector
                  selectedStudentId={selectedStudent?.id}
                  onStudentSelect={setSelectedStudent}
                  placeholder="Chọn học sinh"
                />
              </div>
            )}
          </div>

          {/* Subject Selection */}
          {activeTab === 'class' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Môn Học
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {subjects.map(subject => (
                    <label key={subject.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject.id]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{subject.name}</div>
                        <div className="text-xs text-gray-500">{subject.code} • {subject.credits} tín chỉ</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo Viên
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeachers([...selectedTeachers, teacher.id]);
                          } else {
                            setSelectedTeachers(selectedTeachers.filter(id => id !== teacher.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{teacher.fullName}</div>
                        <div className="text-xs text-gray-500">{teacher.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Club Selection */}
          {activeTab === 'club' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Câu Lạc Bộ
                </label>
                <ClubSelector
                  selectedClubs={selectedClubs.map(c => c.id)}
                  onClubsSelect={setSelectedClubs}
                  placeholder="Chọn câu lạc bộ"
                  multiSelect={true}
                  showMemberCount={true}
                  showAdvisor={true}
                />
              </div>
            </div>
          )}

          {/* Course Selection */}
          {activeTab === 'course' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa Học
                </label>
                <CourseSelector
                  selectedCourses={selectedCourses.map(c => c.id)}
                  onCoursesSelect={setSelectedCourses}
                  placeholder="Chọn khóa học"
                  multiSelect={true}
                  showEnrollmentCount={true}
                  showCredits={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handlePreview}
            disabled={isPreviewing}
            className="flex items-center gap-2"
          >
            <Eye size={18} />
            {isPreviewing ? 'Đang tạo preview...' : 'Xem Preview'}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !preview}
            className="flex items-center gap-2"
          >
            <Play size={18} />
            {isGenerating ? 'Đang tạo...' : 'Tạo Thời Khóa Biểu'}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Thời Khóa Biểu"
        size="large"
      >
        {preview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={16} />
              <span>Preview tạo thành công!</span>
            </div>

            {preview.statistics && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{preview.statistics.totalSubjects}</div>
                  <div className="text-sm text-gray-600">Môn học</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{preview.statistics.totalPeriods}</div>
                  <div className="text-sm text-gray-600">Tiết học</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{preview.statistics.conflicts?.length || 0}</div>
                  <div className="text-sm text-gray-600">Xung đột</div>
                </div>
              </div>
            )}

            {preview.preview && preview.preview.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Thứ</th>
                      <th className="p-2 text-left">Tiết</th>
                      <th className="p-2 text-left">Môn học</th>
                      <th className="p-2 text-left">Giáo viên</th>
                      <th className="p-2 text-left">Phòng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((schedule: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{getDayName(schedule.dayOfWeek)}</td>
                        <td className="p-2">{schedule.period}</td>
                        <td className="p-2 font-medium">{schedule.subject?.name}</td>
                        <td className="p-2">{schedule.teacher?.fullName}</td>
                        <td className="p-2">{schedule.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                Đóng
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <Play size={16} className="mr-2" />
                {isGenerating ? 'Đang tạo...' : 'Xác Nhận Tạo'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Kết Quả Tạo Thời Khóa Biểu"
      >
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={16} />
              <span>Thời khóa biểu đã được tạo thành công!</span>
            </div>

            {result.statistics && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.statistics.totalSubjects}</div>
                  <div className="text-sm text-gray-600">Môn học</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.statistics.totalPeriods}</div>
                  <div className="text-sm text-gray-600">Tiết đã xếp</div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowResultModal(false)}>
                Hoàn Thành
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AutoTimetableView;
