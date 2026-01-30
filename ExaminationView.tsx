import React, { useState, useEffect, useContext } from 'react';
import { Plus, ClipboardList, Calendar, Clock, AlertCircle, Timer, Loader2, BarChart2 } from 'lucide-react';
import { api, MOCK_SUBJECTS } from './data';
import { Exam, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { AppContext } from './context';
import { aiService } from './aiService';

const ExaminationView = () => {
  const { user } = useContext(AppContext);
  const [exams, setExams] = useState<Exam[]>([]);
  const [testModal, setTestModal] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [examResult, setExamResult] = useState<AIAnalysisResult | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examDuration, setExamDuration] = useState(60);
  const [examQuestions, setExamQuestions] = useState(20);
  const [examType, setExamType] = useState('QUIZ');
  const [examStartTime, setExamStartTime] = useState('');
  const [examEndTime, setExamEndTime] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(50);

  useEffect(() => {
    api.getExams().then(setExams);
    api.getClasses().then(setClasses);
    api.getSubjects().then(setSubjects);
  }, []);

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setTestModal(true);
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.exam.analyzeExamDifficulty();
      setExamResult(result);
      setShowExamModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Thi Cử & Kiểm Tra</h2>
           <p className="text-gray-500">Quản lý lịch thi và làm bài trực tuyến</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
             onClick={handleAIAnalyze}
             disabled={isAnalyzing}
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <BarChart2 size={18}/>}
             {isAnalyzing ? 'Đang phân tích...' : 'AI Phân tích Đề thi'}
           </Button>
           {user?.role !== 'STUDENT' && <Button onClick={() => setShowCreateExamModal(true)}><Plus size={20}/> Tạo Kỳ Thi</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => {
           const subject = MOCK_SUBJECTS.find(s => s.id === exam.subjectId);
           return (
             <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className={`p-3 rounded-lg ${subject?.color || 'bg-gray-100'} bg-opacity-20`}>
                      <ClipboardList size={24} className="text-gray-700"/>
                   </div>
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                      exam.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 
                      exam.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                   }`}>
                      {exam.status === 'ONGOING' ? 'Đang diễn ra' : exam.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                   </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{exam.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{subject?.name}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                   <div className="flex items-center gap-2"><Calendar size={16}/> {exam.date}</div>
                   <div className="flex items-center gap-2"><Clock size={16}/> {exam.duration} phút</div>
                   <div className="flex items-center gap-2"><AlertCircle size={16}/> {exam.totalQuestions} câu hỏi</div>
                </div>

                <Button 
                   className="w-full" 
                   variant={exam.status === 'ONGOING' ? 'primary' : 'secondary'}
                   disabled={exam.status !== 'ONGOING'}
                   onClick={() => handleStartExam(exam)}
                >
                   {exam.status === 'ONGOING' ? 'Làm bài ngay' : 'Chưa mở'}
                </Button>
             </div>
           )
        })}
      </div>

      {/* Online Test Simulation Modal */}
      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title={activeExam?.title || "Bài thi"} maxWidth="max-w-4xl">
         <div className="flex flex-col h-[60vh]">
            <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Timer size={20}/>
                  <span>Thời gian còn lại: 45:00</span>
               </div>
               <div className="text-sm text-gray-600">Câu hỏi 1 / {activeExam?.totalQuestions}</div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
               <h4 className="font-semibold text-lg mb-4">Câu 1: Tập xác định của hàm số y = √(x-1) là:</h4>
               <div className="space-y-3">
                  {['A. D = [1; +∞)', 'B. D = (1; +∞)', 'C. D = R \\ {1}', 'D. D = (-∞; 1]'].map((opt, idx) => (
                     <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="q1" className="w-4 h-4 text-indigo-600"/>
                        <span>{opt}</span>
                     </label>
                  ))}
               </div>
               
               <div className="mt-8">
                  <h4 className="font-semibold text-lg mb-4">Câu 2: Cho tam giác ABC vuông tại A...</h4>
                  <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">Nội dung câu hỏi tiếp theo...</div>
               </div>
            </div>

            <div className="flex justify-between border-t pt-4">
               <Button variant="secondary">Câu trước</Button>
               <div className="flex gap-2">
                  <Button variant="secondary">Lưu nháp</Button>
                  <Button onClick={() => { setTestModal(false); alert("Nộp bài thành công!"); }}>Nộp bài</Button>
               </div>
            </div>
         </div>
      </Modal>

      <Modal isOpen={showExamModal} onClose={() => setShowExamModal(false)} title="AI Phân tích Chất lượng Đề thi (Exam AI)">
         {examResult && (
            <div className="space-y-4">
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2">{examResult.title}</h4>
                  <p className="text-blue-700 text-sm">{examResult.summary}</p>
               </div>
               
               {examResult.dataPoints && (
                  <div className="grid grid-cols-2 gap-4">
                     {examResult.dataPoints.map((dp, idx) => (
                        <div key={idx} className="bg-white border rounded p-3 text-center">
                           <div className="text-gray-500 text-xs">{dp.label}</div>
                           <div className="font-bold text-lg">{dp.value}</div>
                        </div>
                     ))}
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><BarChart2 size={16}/> Đánh giá ma trận đề:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {examResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowExamModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Create Exam Modal */}
      <Modal isOpen={showCreateExamModal} onClose={() => setShowCreateExamModal(false)} title="Tạo Kỳ Thi Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ thi</label>
               <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên kỳ thi"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Loại kỳ thi</label>
               <select 
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option value="QUIZ">Bài kiểm tra</option>
                  <option value="MIDTERM">Giữa kỳ</option>
                  <option value="FINAL">Cuối kỳ</option>
                  <option value="ASSIGNMENT">Bài tập</option>
               </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
                  <select 
                     value={selectedClass?.id || ''}
                     onChange={(e) => {
                        const classId = parseInt(e.target.value);
                        const selected = classes.find(c => c.id === classId);
                        setSelectedClass(selected);
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn lớp</option>
                     {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                           {cls.name} - {cls.gradeLevel}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                  <select 
                     value={selectedSubject?.id || ''}
                     onChange={(e) => {
                        const subjectId = parseInt(e.target.value);
                        const selected = subjects.find(s => s.id === subjectId);
                        setSelectedSubject(selected);
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn môn</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                  <select 
                     value={examDuration}
                     onChange={(e) => setExamDuration(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value={15}>15 phút</option>
                     <option value={30}>30 phút</option>
                     <option value={45}>45 phút</option>
                     <option value={60}>60 phút</option>
                     <option value={90}>90 phút</option>
                     <option value={120}>120 phút</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số câu hỏi</label>
                  <select 
                     value={examQuestions}
                     onChange={(e) => setExamQuestions(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value={10}>10 câu</option>
                     <option value={20}>20 câu</option>
                     <option value={30}>30 câu</option>
                     <option value={40}>40 câu</option>
                     <option value={50}>50 câu</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                  <input
                     type="datetime-local"
                     value={examStartTime}
                     onChange={(e) => setExamStartTime(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                  <input
                     type="datetime-local"
                     value={examEndTime}
                     onChange={(e) => setExamEndTime(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lần làm tối đa</label>
                  <select 
                     value={maxAttempts}
                     onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value={1}>1 lần</option>
                     <option value={2}>2 lần</option>
                     <option value={3}>3 lần</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt (%)</label>
                  <select 
                     value={passingScore}
                     onChange={(e) => setPassingScore(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value={30}>30%</option>
                     <option value={40}>40%</option>
                     <option value={50}>50%</option>
                     <option value={60}>60%</option>
                     <option value={70}>70%</option>
                     <option value={80}>80%</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea
                  rows={3}
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về kỳ thi..."
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowCreateExamModal(false)}>
                  Hủy
               </Button>
               <Button 
                  onClick={async () => {
                     if (!examTitle || !selectedClass?.id || !selectedSubject?.id) {
                        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                        return;
                     }
                     
                     try {
                        const response = await fetch('/api/exams', {
                           method: 'POST',
                           headers: {
                              'Content-Type': 'application/json',
                           },
                           body: JSON.stringify({
                              classId: selectedClass.id,
                              subjectId: selectedSubject.id,
                              title: examTitle,
                              description: examDescription,
                              duration: examDuration,
                              startTime: examStartTime,
                              endTime: examEndTime,
                              maxAttempts,
                              passingScore,
                           }),
                        });
                        
                        if (response.ok) {
                           alert('Tạo kỳ thi thành công!');
                           setShowCreateExamModal(false);
                           // Reset form
                           setExamTitle('');
                           setExamDescription('');
                           setSelectedClass(null);
                           setSelectedSubject(null);
                           setExamDuration(60);
                           setExamQuestions(20);
                           setExamType('QUIZ');
                           setExamStartTime('');
                           setExamEndTime('');
                           setMaxAttempts(1);
                           setPassingScore(50);
                           // Reload exams
                           api.getExams().then(setExams);
                        } else {
                           alert('Tạo kỳ thi thất bại!');
                        }
                     } catch (error) {
                        console.error('Error creating exam:', error);
                        alert('Có lỗi xảy ra, vui lòng thử lại!');
                     }
                  }}
                  disabled={!examTitle || !selectedClass?.id || !selectedSubject?.id}
                  className={!examTitle || !selectedClass?.id || !selectedSubject?.id ? 'opacity-50 cursor-not-allowed' : ''}
               >
                  Tạo kỳ thi
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default ExaminationView;
