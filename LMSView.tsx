import React, { useState, useEffect, useContext } from 'react';
import { Upload, PlayCircle, FileText, User as UserIcon, Calendar, Clock, Download, Video, BrainCircuit, Loader2, BookOpen, FileCheck, PenTool, Presentation, FileQuestion, Sparkles, Plus } from 'lucide-react';
import { api, MOCK_SUBJECTS } from './data';
import { LMSMaterial, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { AppContext } from './context';
import { aiService } from './aiService';

const LMSView = () => {
  const { user } = useContext(AppContext);
  const [materials, setMaterials] = useState<LMSMaterial[]>([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LMSMaterial | null>(null);

  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // New Content Creation States
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Form States
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentData, setContentData] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    api.getLMSMaterials().then(setMaterials);
    api.getSubjects().then(setSubjects);
  }, []);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.lms.analyzeLearningPatterns();
      setAnalysisResult(result);
      setShowAnalysisModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIGenerate = async (type: string) => {
    setIsGeneratingAI(true);
    try {
      let prompt = '';
      switch (type) {
        case 'curriculum':
          prompt = `Tạo giáo trình chi tiết cho môn ${selectedSubject?.name || 'chưa chọn'} với tiêu đề "${contentTitle}". Bao gồm các chương, mục tiêu học tập, và nội dung chính.`;
          break;
        case 'lessonPlan':
          prompt = `Tạo giáo án chi tiết cho bài giảng "${contentTitle}" môn ${selectedSubject?.name || 'chưa chọn'}. Bao gồm mục tiêu, chuẩn bị, hoạt động dạy học, và đánh giá.`;
          break;
        case 'lecture':
          prompt = `Tạo nội dung bài giảng chi tiết cho chủ đề "${contentTitle}" môn ${selectedSubject?.name || 'chưa chọn'}. Bao gồm lý thuyết, ví dụ, và bài tập minh họa.`;
          break;
        case 'assignment':
          prompt = `Tạo bài tập đa dạng cho chủ đề "${contentTitle}" môn ${selectedSubject?.name || 'chưa chọn'}. Bao gồm trắc nghiệm, tự luận, và bài tập vận dụng.`;
          break;
        case 'presentation':
          prompt = `Tạo nội dung trình chiếu cho chủ đề "${contentTitle}" môn ${selectedSubject?.name || 'chưa chọn'}. Bao gồm các slide chính, điểm nhấn, và ghi chú trình bày.`;
          break;
        case 'theory':
          prompt = `Tạo tài liệu lý thuyết chi tiết cho chủ đề "${contentTitle}" môn ${selectedSubject?.name || 'chưa chọn'}. Bao gồm định nghĩa, công thức, và ví dụ minh họa.`;
          break;
      }
      
      // Simulate AI generation
      setTimeout(() => {
        const generatedContent = `Nội dung được tạo bởi AI cho ${type}:\n\n${prompt}\n\nĐây là nội dung mẫu được tạo tự động...`;
        setContentData(generatedContent);
        setIsGeneratingAI(false);
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsGeneratingAI(false);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: LMSMaterial = {
      id: Date.now(),
      title: "Bài giảng mới: Hình học không gian",
      type: "VIDEO",
      subjectId: 1,
      postedBy: user?.fullName || "User",
      date: new Date().toLocaleDateString('vi-VN'),
      description: "Mô tả bài giảng mới"
    };
    setMaterials([newMaterial, ...materials]);
    setUploadModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Hệ thống Học tập (LMS)</h2>
           <p className="text-gray-500">Bài giảng video và bài tập về nhà</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
             onClick={handleAIAnalyze}
             disabled={isAnalyzing}
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <BrainCircuit size={18}/>}
             {isAnalyzing ? 'Đang phân tích...' : 'AI Phân tích Học tập'}
           </Button>
           
           {user?.role === 'TEACHER' && (
             <div className="relative">
               <Button 
                 onClick={() => setShowCreateMenu(!showCreateMenu)}
                 className="bg-green-600 hover:bg-green-700"
               >
                 <Plus size={18} /> Tạo Nội Dung
               </Button>
               
               {showCreateMenu && (
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                   <div className="p-2">
                     <button
                       onClick={() => {setShowCurriculumModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <BookOpen size={16} className="text-blue-600" /> Tạo Giáo trình
                     </button>
                     <button
                       onClick={() => {setShowLessonPlanModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <FileCheck size={16} className="text-green-600" /> Tạo Giáo án
                     </button>
                     <button
                       onClick={() => {setShowLectureModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <PenTool size={16} className="text-purple-600" /> Tạo Bài giảng
                     </button>
                     <button
                       onClick={() => {setShowAssignmentModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <FileQuestion size={16} className="text-orange-600" /> Tạo Bài tập
                     </button>
                     <button
                       onClick={() => {setShowPresentationModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <Presentation size={16} className="text-red-600" /> Tạo Trình chiếu
                     </button>
                     <button
                       onClick={() => {setShowTheoryModal(true); setShowCreateMenu(false);}}
                       className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                     >
                       <FileText size={16} className="text-indigo-600" /> Tạo Lý thuyết
                     </button>
                   </div>
                 </div>
               )}
             </div>
           )}
           
           {user?.role === 'TEACHER' && (
             <Button onClick={() => setUploadModal(true)}>
                <Upload size={18} /> Tải lên Tài liệu
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className={`h-40 flex items-center justify-center relative ${item.type === 'VIDEO' ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
               {item.type === 'VIDEO' ? <Video size={48} className="text-red-500" /> : <FileText size={48} className="text-blue-500" />}
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  {item.type === 'VIDEO' && <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />}
               </div>
            </div>
            <div className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <span className={`text-xs font-semibold px-2 py-1 rounded ${item.type === 'VIDEO' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                   {item.type === 'VIDEO' ? 'VIDEO BÀI GIẢNG' : 'BÀI TẬP'}
                 </span>
                 <span className="text-xs text-gray-400">{item.date}</span>
               </div>
               <h3 className="font-bold text-gray-800 mb-2 truncate" title={item.title}>{item.title}</h3>
               <p className="text-sm text-gray-500 mb-4">Đăng bởi: {item.postedBy}</p>
               
               <Button variant="secondary" className="w-full text-sm" onClick={() => setSelectedMaterial(item)}>
                   {item.type === 'VIDEO' ? 'Xem ngay' : 'Chi tiết'}
               </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Tải lên Tài liệu mới">
         <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input type="text" className="w-full border rounded-lg p-2" required placeholder="Nhập tiêu đề..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select className="w-full border rounded-lg p-2">
                <option value="VIDEO">Video bài giảng</option>
                <option value="ASSIGNMENT">Bài tập về nhà</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea className="w-full border rounded-lg p-2" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đường dẫn / File</label>
              <input type="file" className="w-full border rounded-lg p-2" />
            </div>
            <Button type="submit" className="w-full">Đăng tải</Button>
         </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedMaterial} onClose={() => setSelectedMaterial(null)} title={selectedMaterial?.title || ''}>
          <div className="space-y-4">
              <div className="text-sm text-gray-500 flex justify-between">
                  <span>Môn: {MOCK_SUBJECTS.find(s => s.id === selectedMaterial?.subjectId)?.name}</span>
                  <span>Ngày: {selectedMaterial?.date}</span>
              </div>
              
              {selectedMaterial?.type === 'VIDEO' ? (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white">Video Player Simulation</span>
                  </div>
              ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                          <Download size={20} className="text-blue-600"/>
                          <span className="font-medium text-blue-600 underline cursor-pointer">tai_lieu_bai_tap.pdf</span>
                      </div>
                      <p className="text-sm text-gray-500">Hạn nộp: {selectedMaterial?.deadline}</p>
                  </div>
              )}

              <div>
                  <h4 className="font-semibold mb-2">Mô tả:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedMaterial?.description || "Không có mô tả chi tiết."}
                  </p>
              </div>

              <div className="flex justify-end pt-2">
                  <Button onClick={() => setSelectedMaterial(null)}>Đóng</Button>
              </div>
          </div>
      </Modal>

      {/* AI Analysis Modal */}
      <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} title="AI Phân tích Học tập (LMS AI)">
         {analysisResult && (
            <div className="space-y-4">
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2">{analysisResult.title}</h4>
                  <p className="text-blue-700 text-sm">{analysisResult.summary}</p>
               </div>
               
               {analysisResult.dataPoints && (
                  <div className="grid grid-cols-2 gap-4">
                     {analysisResult.dataPoints.map((dp, idx) => (
                        <div key={idx} className="bg-white border rounded p-3 text-center">
                           <div className="text-gray-500 text-xs">{dp.label}</div>
                           <div className="font-bold text-lg">{dp.value}</div>
                        </div>
                     ))}
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit size={16}/> Khuyến nghị cá nhân hóa:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {analysisResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowAnalysisModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Curriculum Modal */}
      <Modal isOpen={showCurriculumModal} onClose={() => setShowCurriculumModal(false)} title="Tạo Giáo trình Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên giáo trình</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên giáo trình"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả giáo trình..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung giáo trình</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung giáo trình hoặc sử dụng AI để tạo..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('curriculum')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo nội dung'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowCurriculumModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu giáo trình thành công!');
                     setShowCurriculumModal(false);
                     setContentTitle('');
                     setContentDescription('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu giáo trình
                  </Button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Lesson Plan Modal */}
      <Modal isOpen={showLessonPlanModal} onClose={() => setShowLessonPlanModal(false)} title="Tạo Giáo án Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên giáo án</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên giáo án"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung giáo án</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung giáo án (mục tiêu, chuẩn bị, hoạt động dạy học, đánh giá)..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('lessonPlan')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo giáo án'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowLessonPlanModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu giáo án thành công!');
                     setShowLessonPlanModal(false);
                     setContentTitle('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu giáo án
                  </Button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Lecture Modal */}
      <Modal isOpen={showLectureModal} onClose={() => setShowLectureModal(false)} title="Tạo Bài giảng Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài giảng</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên bài giảng"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài giảng</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung bài giảng (lý thuyết, ví dụ, bài tập minh họa)..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('lecture')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo bài giảng'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowLectureModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu bài giảng thành công!');
                     setShowLectureModal(false);
                     setContentTitle('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu bài giảng
                  </Button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal isOpen={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title="Tạo Bài tập Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài tập</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên bài tập"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài tập</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung bài tập (trắc nghiệm, tự luận, bài tập vận dụng)..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('assignment')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo bài tập'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu bài tập thành công!');
                     setShowAssignmentModal(false);
                     setContentTitle('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu bài tập
                  </Button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Presentation Modal */}
      <Modal isOpen={showPresentationModal} onClose={() => setShowPresentationModal(false)} title="Tạo Trình chiếu Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên trình chiếu</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên trình chiếu"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung trình chiếu</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung trình chiếu (các slide chính, điểm nhấn, ghi chú trình bày)..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('presentation')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo trình chiếu'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowPresentationModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu trình chiếu thành công!');
                     setShowPresentationModal(false);
                     setContentTitle('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu trình chiếu
                  </Button>
               </div>
            </div>
         </div>
      </Modal>

      {/* Theory Modal */}
      <Modal isOpen={showTheoryModal} onClose={() => setShowTheoryModal(false)} title="Tạo Tài liệu Lý thuyết Mới" maxWidth="max-w-4xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài liệu</label>
                  <input
                     type="text"
                     value={contentTitle}
                     onChange={(e) => setContentTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên tài liệu lý thuyết"
                  />
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
                     <option value="">Chọn môn học</option>
                     {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                           {subject.name}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung lý thuyết</label>
               <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="Nhập nội dung lý thuyết (định nghĩa, công thức, ví dụ minh họa)..."
               />
            </div>

            <div className="flex justify-between gap-2">
               <Button 
                  variant="secondary" 
                  onClick={() => handleAIGenerate('theory')}
                  disabled={isGeneratingAI || !contentTitle || !selectedSubject?.id}
                  className="flex items-center gap-2"
               >
                  {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingAI ? 'Đang tạo...' : 'AI Tạo lý thuyết'}
               </Button>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowTheoryModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={() => {
                     alert('Lưu tài liệu lý thuyết thành công!');
                     setShowTheoryModal(false);
                     setContentTitle('');
                     setContentData('');
                     setSelectedSubject(null);
                  }}>
                     Lưu tài liệu
                  </Button>
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default LMSView;
