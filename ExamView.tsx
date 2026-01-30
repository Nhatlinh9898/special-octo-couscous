import React, { useState, useEffect } from 'react';
import { FileText, Clock, Users, Play, Eye, Edit, Trash2, Plus, Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Modal } from './components';
import StudentSelector from './components/StudentSelector';
import ClassSelector from './components/ClassSelector';
import SubjectSelector from './components/SubjectSelector';

interface Exam {
  id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  duration: number;
  startTime: string;
  endTime: string;
  maxAttempts: number;
  passingScore: number;
  totalQuestions: number;
  maxScore: number;
  class?: {
    id: number;
    name: string;
    gradeLevel: number;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: number;
    fullName: string;
    email: string;
  };
  _count?: {
    submissions: number;
  };
}

interface Question {
  id: number;
  type: string;
  content: string;
  points: number;
  order: number;
  explanation?: string;
  options?: {
    id: number;
    content: string;
    isCorrect: boolean;
  }[];
}

interface ExamSubmission {
  id: number;
  examId: number;
  studentId: number;
  startTime: string;
  endTime?: string;
  status: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  attempt: number;
  exam?: {
    id: number;
    title: string;
    subject: {
      name: string;
      code: string;
    };
  };
  student?: {
    id: number;
    fullName: string;
    code: string;
  };
}

const ExamView = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'take' | 'history'>('list');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Form states
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTakeExamModal, setShowTakeExamModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      if (data.success) {
        setExams(data.data.exams || []);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExamQuestions = async (examId: number) => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions || []);
      }
    } catch (error) {
      console.error('Error loading exam questions:', error);
    }
  };

  const startExam = async (exam: Exam) => {
    try {
      const response = await fetch(`/api/exams/${exam.id}/start`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSubmission(data.data.submission);
        setQuestions(data.data.exam.questions);
        setTimeRemaining(data.data.exam.duration * 60); // Convert minutes to seconds
        setShowTakeExamModal(true);
        startTimer(data.data.exam.duration * 60);
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Không thể bắt đầu bài thi');
    }
  };

  const startTimer = (duration: number) => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const saveAnswer = async (questionId: number, answer: string) => {
    if (!currentSubmission) return;

    try {
      await fetch(`/api/exams/submissions/${currentSubmission.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, answer }),
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const submitExam = async () => {
    if (!currentSubmission) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exams/submissions/${currentSubmission.id}/submit`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSubmission(data.data.submission);
        setShowResultsModal(true);
        setShowTakeExamModal(false);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Không thể nộp bài thi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'PUBLISHED': 'bg-blue-100 text-blue-800',
      'ONGOING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Nháp',
      'PUBLISHED': 'Đã đăng',
      'ONGOING': 'Đang diễn ra',
      'COMPLETED': 'Đã kết thúc',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} className="text-blue-600" />
            Quản Lý Kỳ Thi
          </h2>
          <p className="text-gray-500">Tạo và quản lý các kỳ thi, bài kiểm tra</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'bg-blue-600 text-white' : ''}
          >
            <Eye size={18} className="mr-2" />
            Lịch Sử
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Tạo Kỳ Thi
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText size={16} className="inline mr-2" />
          Danh Sách Kỳ Thi
        </button>
        <button
          onClick={() => setActiveTab('take')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'take'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Play size={16} className="inline mr-2" />
          Làm Bài Thi
        </button>
      </div>

      {/* Exam List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có kỳ thi nào</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Tạo kỳ thi đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kỳ Thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn Học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời Gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt Thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{exam.title}</div>
                          {exam.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {exam.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {exam.class?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {exam.subject?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {exam.duration} phút
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(exam.startTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {getStatusLabel(exam.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {exam._count?.submissions || 0}/{exam.maxAttempts}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowGenerateModal(true);
                            }}
                            className="p-1"
                            title="Tạo câu hỏi AI"
                          >
                            <Brain size={14} />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedExam(exam);
                              loadExamQuestions(exam.id);
                            }}
                            className="p-1"
                            title="Xem câu hỏi"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startExam(exam)}
                            className="p-1"
                            title="Làm bài thi"
                          >
                            <Play size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Take Exam */}
      {activeTab === 'take' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Chọn bài thi để làm</h3>
          <StudentSelector
            selectedStudentId={selectedStudent?.id}
            onStudentSelect={setSelectedStudent}
            placeholder="Chọn học sinh"
          />
          
          {selectedStudent && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Các kỳ thi có sẵn:</h4>
              <div className="space-y-2">
                {exams
                  .filter(exam => exam.status === 'PUBLISHED' || exam.status === 'ONGOING')
                  .map(exam => (
                    <div key={exam.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">{exam.title}</div>
                        <div className="text-sm text-gray-500">
                          {exam.subject?.name} • {exam.duration} phút
                        </div>
                      </div>
                      <Button onClick={() => startExam(exam)}>
                        <Play size={16} className="mr-2" />
                        Bắt đầu
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo Kỳ Thi Mới"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên kỳ thi
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên kỳ thi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại kỳ thi
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="QUIZ">Bài kiểm tra</option>
                <option value="MIDTERM">Giữa kỳ</option>
                <option value="FINAL">Cuối kỳ</option>
                <option value="ASSIGNMENT">Bài tập</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học
              </label>
              <ClassSelector
                selectedClassId={selectedClass?.id}
                onClassSelect={setSelectedClass}
                placeholder="Chọn lớp học"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Môn học
              </label>
              <SubjectSelector
                selectedSubjectId={selectedSubject?.id}
                onSubjectSelect={setSelectedSubject}
                placeholder="Chọn môn học"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lần làm tối đa
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm đạt (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về kỳ thi..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button>Tạo kỳ thi</Button>
          </div>
        </div>
      </Modal>

      {/* Take Exam Modal */}
      <Modal
        isOpen={showTakeExamModal}
        onClose={() => {}}
        title="Làm Bài Thi"
        size="full"
        showCloseButton={false}
      >
        {currentSubmission && questions.length > 0 && (
          <div className="space-y-4">
            {/* Exam Header */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">{selectedExam?.title}</h3>
                <p className="text-sm text-gray-600">
                  Câu hỏi {currentQuestionIndex + 1}/{questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock size={16} />
                  {formatTime(timeRemaining)}
                </div>
                <Button
                  onClick={submitExam}
                  disabled={isSubmitting}
                  variant="secondary"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Đang nộp...
                  </>
                  ) : (
                    'Nộp bài'
                  )}
                </Button>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Câu {currentQuestionIndex + 1} ({questions[currentQuestionIndex].points} điểm)
                </span>
              </div>
              <div className="text-lg font-medium mb-4">
                {questions[currentQuestionIndex].content}
              </div>

              {questions[currentQuestionIndex].type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  {questions[currentQuestionIndex].options?.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`question-${questions[currentQuestionIndex].id}`}
                        value={option.content}
                        checked={answers[questions[currentQuestionIndex].id] === option.content}
                        onChange={(e) => {
                          const newAnswers = { ...answers };
                          newAnswers[questions[currentQuestionIndex].id] = e.target.value;
                          setAnswers(newAnswers);
                          saveAnswer(questions[currentQuestionIndex].id, e.target.value);
                        }}
                      />
                      <span>{option.content}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Câu trước
              </Button>
              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[questions[index].id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Câu tiếp
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title="Kết Quả Bài Thi"
      >
        {currentSubmission && (
          <div className="space-y-4">
            <div className="text-center">
              {currentSubmission.passed ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle size={24} />
                  <span className="text-xl font-semibold">Đạt</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <AlertCircle size={24} />
                  <span className="text-xl font-semibold">Không Đạt</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentSubmission.score}/{currentSubmission.exam?.maxScore || 0}
                </div>
                <div className="text-sm text-gray-600">Điểm số</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentSubmission.percentage}%
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowResultsModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamView;
