import React, { useState, useEffect } from 'react';
import { MessageSquare, BarChart, CheckCircle2, Clock, Plus, Loader2, Smile, X, Download, Copy, Mail, Users, Smartphone, QrCode } from 'lucide-react';
import { api } from './data';
import { Survey, FeedbackItem, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const FeedbackView = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  // AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Modal States
  const [showCreateSurveyModal, setShowCreateSurveyModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showAddFeedbackModal, setShowAddFeedbackModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    senderName: '',
    category: 'General',
    content: ''
  });
  const [replyContent, setReplyContent] = useState('');
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    deadline: '',
    targetParticipants: 100,
    type: 'General',
    questions: [
      { id: 1, question: '', type: 'text', required: true, options: [] }
    ]
  });

  useEffect(() => {
    api.getSurveys().then(setSurveys);
    api.getFeedbacks().then(setFeedbacks);
  }, []);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await aiService.sentiment.analyzeFeedback();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const handleCreateSurvey = () => {
    const survey: Survey = {
      id: Date.now(),
      title: newSurvey.title,
      deadline: newSurvey.deadline,
      participants: 0,
      totalTarget: newSurvey.targetParticipants,
      status: 'Active',
      type: newSurvey.type as any
    };
    
    setSurveys([...surveys, survey]);
    setShowCreateSurveyModal(false);
    setNewSurvey({
      title: '',
      description: '',
      deadline: '',
      targetParticipants: 100,
      type: 'General',
      questions: [
        { id: 1, question: '', type: 'text', required: true, options: [] }
      ]
    });
    alert('Đã tạo khảo sát mới thành công!');
  };

  const addQuestion = () => {
    const newQuestion = {
      id: newSurvey.questions.length + 1,
      question: '',
      type: 'text',
      required: true,
      options: []
    };
    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, newQuestion]
    });
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const removeQuestion = (id: number) => {
    if (newSurvey.questions.length > 1) {
      setNewSurvey({
        ...newSurvey,
        questions: newSurvey.questions.filter(q => q.id !== id)
      });
    }
  };

  const handleViewResults = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowResultsModal(true);
  };

  const handleShareSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const surveyLink = `https://school-management.com/survey/${selectedSurvey?.id}`;
    navigator.clipboard.writeText(surveyLink);
    alert('Đã sao chép link khảo sát!');
  };

  const handleDownloadResults = () => {
    // Mock data for results
    const results = [
      { question: "Bạn có hài lòng với chất lượng giảng dạy không?", responses: { "Rất hài lòng": 45, "Hài lòng": 30, "Bình thường": 15, "Không hài lòng": 10 } },
      { question: "Cơ sở vật chất có đáp ứng nhu cầu không?", responses: { "Rất tốt": 35, "Tốt": 40, "Trung bình": 20, "Kém": 5 } },
      { question: "Bạn có muốn đề xuất cải thiện gì không?", responses: { "Có": 60, "Không": 40 } }
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Câu hỏi,Phản hồi,Số lượng\n"
      + results.map(r => Object.entries(r.responses).map(([key, value]) => 
          `"${r.question}","${key}",${value}`
        ).join("\n")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `survey_${selectedSurvey?.id}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddFeedback = () => {
    const feedback: FeedbackItem = {
      id: Date.now(),
      senderName: newFeedback.senderName || 'Ẩn danh',
      category: newFeedback.category,
      content: newFeedback.content,
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };
    
    setFeedbacks([feedback, ...feedbacks]);
    setShowAddFeedbackModal(false);
    setNewFeedback({
      senderName: '',
      category: 'General',
      content: ''
    });
    alert('Đã gửi góp ý thành công!');
  };

  const handleReplyFeedback = () => {
    if (!selectedFeedback || !replyContent.trim()) return;
    
    // Update feedback status
    setFeedbacks(feedbacks.map(fb => 
      fb.id === selectedFeedback.id 
        ? { ...fb, status: 'Replied', reply: replyContent, replyDate: new Date().toISOString().split('T')[0] }
        : fb
    ));
    
    setShowReplyModal(false);
    setReplyContent('');
    setSelectedFeedback(null);
    alert('Đã phản hồi góp ý thành công!');
  };

  const handleReplyClick = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setReplyContent('');
    setShowReplyModal(true);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Khảo sát & Ý kiến</h2>
           <p className="text-gray-500">Lắng nghe ý kiến để nâng cao chất lượng</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
             onClick={handleAIAnalyze}
             disabled={isAnalyzing}
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <Smile size={18}/>}
             {isAnalyzing ? 'AI Đang đọc...' : 'AI Phân tích Cảm xúc'}
           </Button>
           <Button 
             onClick={() => setShowCreateSurveyModal(true)}
           >
             <Plus size={20}/> Tạo Khảo sát mới
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Surveys Section */}
         <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><BarChart size={20}/> Khảo sát đang diễn ra</h3>
            <div className="space-y-4">
               {surveys.map(survey => (
                  <div key={survey.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                           survey.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                           {survey.status === 'Active' ? 'Đang mở' : 'Đã đóng'}
                        </span>
                        <span className="text-xs text-gray-400">Hạn: {survey.deadline}</span>
                     </div>
                     <h4 className="font-bold text-gray-800 text-lg mb-4">{survey.title}</h4>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                           <span>Tiến độ</span>
                           <span className="font-medium">{survey.participants} / {survey.totalTarget}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                              style={{width: `${(survey.participants / survey.totalTarget) * 100}%`}}
                           ></div>
                        </div>
                     </div>
                     <div className="mt-4 flex gap-2">
                        <button 
                          className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                          onClick={() => handleViewResults(survey)}
                        >
                          Xem kết quả
                        </button>
                        <button 
                          className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
                          onClick={() => handleShareSurvey(survey)}
                        >
                          Chia sẻ
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Feedback Box Section */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-700 flex items-center gap-2"><MessageSquare size={20}/> Hòm thư góp ý</h3>
               <Button 
                 size="sm"
                 onClick={() => setShowAddFeedbackModal(true)}
               >
                 <Plus size={16}/> Thêm góp ý
               </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {feedbacks.map(fb => (
                     <div key={fb.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">?</div>
                              <div>
                                 <p className="font-bold text-sm text-gray-800">{fb.senderName}</p>
                                 <p className="text-xs text-gray-500">{fb.category}</p>
                              </div>
                           </div>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              fb.status === 'New' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'
                           }`}>
                              {fb.status === 'New' ? 'Mới' : 'Đã trả lời'}
                           </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">"{fb.content}"</p>
                        {fb.reply && (
                           <div className="bg-blue-50 p-3 rounded-lg mb-2 border-l-4 border-blue-400">
                              <p className="text-xs font-medium text-blue-600 mb-1">Phản hồi từ Ban Quản lý:</p>
                              <p className="text-sm text-gray-700">"{fb.reply}"</p>
                              <p className="text-xs text-gray-500 mt-1">{fb.replyDate}</p>
                           </div>
                        )}
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-400">{fb.date}</span>
                           <button 
                             className="text-xs font-medium text-indigo-600 hover:underline"
                             onClick={() => handleReplyClick(fb)}
                           >
                             {fb.status === 'Replied' ? 'Chỉnh sửa phản hồi' : 'Phản hồi'}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Button className="w-full">Xem tất cả góp ý</Button>
               </div>
            </div>
         </div>
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Phân tích Cảm xúc (Sentiment AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2">{aiResult.title}</h4>
                  <p className="text-indigo-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-red-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Giải pháp:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {aiResult.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
               </div>
               <div className="flex justify-end pt-2"><Button onClick={() => setShowAIModal(false)}>Đóng</Button></div>
            </div>
         )}
      </Modal>

      {/* Create Survey Modal */}
      <Modal isOpen={showCreateSurveyModal} onClose={() => setShowCreateSurveyModal(false)} title="Tạo Khảo sát Mới">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề khảo sát</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={newSurvey.title}
                 onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}
                 placeholder="Nhập tiêu đề khảo sát..."
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={3}
                 value={newSurvey.description}
                 onChange={(e) => setNewSurvey({...newSurvey, description: e.target.value})}
                 placeholder="Mô tả chi tiết về khảo sát..."
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={newSurvey.deadline}
                    onChange={(e) => setNewSurvey({...newSurvey, deadline: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số người mục tiêu</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={newSurvey.targetParticipants}
                    onChange={(e) => setNewSurvey({...newSurvey, targetParticipants: parseInt(e.target.value)})}
                    min="1"
                  />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Loại khảo sát</label>
               <select 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={newSurvey.type}
                 onChange={(e) => setNewSurvey({...newSurvey, type: e.target.value})}
               >
                 <option value="General">Khảo sát chung</option>
                 <option value="TeacherEval">Đánh giá giảng viên</option>
                 <option value="Facility">Cơ sở vật chất</option>
                 <option value="Service">Dịch vụ hỗ trợ</option>
               </select>
            </div>
            
            <div className="border-t pt-4">
               <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Câu hỏi khảo sát</h4>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={addQuestion}
                  >
                    <Plus size={16}/> Thêm câu hỏi
                  </Button>
               </div>
               
               <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newSurvey.questions.map((question, index) => (
                     <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-medium text-gray-600">Câu {index + 1}</span>
                           {newSurvey.questions.length > 1 && (
                              <button 
                                onClick={() => removeQuestion(question.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16}/>
                              </button>
                           )}
                        </div>
                        
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          placeholder="Nhập câu hỏi..."
                        />
                        
                        <div className="flex gap-2">
                           <select 
                             className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                             value={question.type}
                             onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                           >
                             <option value="text">Trả lời ngắn</option>
                             <option value="textarea">Trả lời dài</option>
                             <option value="radio">Chọn một đáp án</option>
                             <option value="checkbox">Chọn nhiều đáp án</option>
                             <option value="rating">Thang điểm (1-5)</option>
                           </select>
                           
                           <label className="flex items-center gap-1 text-sm">
                              <input 
                                type="checkbox" 
                                checked={question.required}
                                onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                              />
                              Bắt buộc
                           </label>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
               <Button variant="secondary" onClick={() => setShowCreateSurveyModal(false)}>Hủy</Button>
               <Button onClick={handleCreateSurvey}>Tạo Khảo sát</Button>
            </div>
         </div>
      </Modal>

      {/* Survey Results Modal */}
      <Modal isOpen={showResultsModal} onClose={() => setShowResultsModal(false)} title={`Kết quả khảo sát: ${selectedSurvey?.title}`}>
         {selectedSurvey && (
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                     <div className="text-2xl font-bold text-blue-600">{selectedSurvey.participants}</div>
                     <div className="text-sm text-gray-600">Người tham gia</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                     <div className="text-2xl font-bold text-green-600">{selectedSurvey.totalTarget}</div>
                     <div className="text-sm text-gray-600">Mục tiêu</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                     <div className="text-2xl font-bold text-purple-600">
                        {Math.round((selectedSurvey.participants / selectedSurvey.totalTarget) * 100)}%
                     </div>
                     <div className="text-sm text-gray-600">Hoàn thành</div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Phân tích phản hồi</h4>
                  
                  {/* Mock result data */}
                  <div className="space-y-4">
                     <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-3">Bạn có hài lòng với chất lượng giảng dạy không?</h5>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Rất hài lòng</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">45%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Hài lòng</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">30%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Bình thường</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">15%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Không hài lòng</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{width: '10%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">10%</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-3">Cơ sở vật chất có đáp ứng nhu cầu không?</h5>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Rất tốt</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">35%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Tốt</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">40%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Trung bình</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '20%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">20%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm">Kém</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{width: '5%'}}></div>
                                 </div>
                                 <span className="text-sm font-medium">5%</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Phản hồi văn bản</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                     <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">"Giảng viên rất tận tâm và giảng bài dễ hiểu. Rất hài lòng!"</p>
                        <p className="text-xs text-gray-500 mt-1">- Nguyễn Văn A, Lớp 12A1</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">"Phòng học cần được cải thiện thêm về ánh sáng và điều hòa."</p>
                        <p className="text-xs text-gray-500 mt-1">- Trần Thị B, Lớp 11B2</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">"Nhìn chung tốt, nhưng cần thêm nhiều hoạt động thực tế."</p>
                        <p className="text-xs text-gray-500 mt-1">- Lê Văn C, Lớp 10C3</p>
                     </div>
                  </div>
               </div>

               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleDownloadResults}>
                     <Download size={16}/> Tải xuống kết quả
                  </Button>
                  <Button onClick={() => setShowResultsModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Share Survey Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Chia sẻ khảo sát">
         {selectedSurvey && (
            <div className="space-y-4">
               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông tin khảo sát</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                     <p className="font-medium text-gray-800">{selectedSurvey.title}</p>
                     <p className="text-sm text-gray-600">Hạn chót: {selectedSurvey.deadline}</p>
                     <p className="text-sm text-gray-600">Mục tiêu: {selectedSurvey.totalTarget} người</p>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Link tham gia</h4>
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                       value={`https://school-management.com/survey/${selectedSurvey.id}`}
                       readOnly
                     />
                     <Button onClick={handleCopyLink}>
                        <Copy size={16}/> Sao chép
                     </Button>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Chia sẻ qua</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <Button variant="secondary" className="flex items-center justify-center gap-2">
                        <Mail size={16}/> Email
                     </Button>
                     <Button variant="secondary" className="flex items-center justify-center gap-2">
                        <MessageSquare size={16}/> Zalo
                     </Button>
                     <Button variant="secondary" className="flex items-center justify-center gap-2">
                        <Users size={16}/> Facebook
                     </Button>
                     <Button variant="secondary" className="flex items-center justify-center gap-2">
                        <Smartphone size={16}/> SMS
                     </Button>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Mã QR</h4>
                  <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                     <div className="w-32 h-32 bg-white rounded flex items-center justify-center text-gray-400">
                        <QrCode size={64}/>
                     </div>
                  </div>
               </div>

               <div className="flex justify-end">
                  <Button onClick={() => setShowShareModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Feedback Modal */}
      <Modal isOpen={showAddFeedbackModal} onClose={() => setShowAddFeedbackModal(false)} title="Gửi Góp Ý Mới">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tên của bạn</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={newFeedback.senderName}
                 onChange={(e) => setNewFeedback({...newFeedback, senderName: e.target.value})}
                 placeholder="Nhập tên của bạn (có thể để trống để ẩn danh)"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Loại góp ý</label>
               <select 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={newFeedback.category}
                 onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
               >
                 <option value="General">Góp ý chung</option>
                 <option value="Academic">Học tập & Giảng dạy</option>
                 <option value="Facility">Cơ sở vật chất</option>
                 <option value="Service">Dịch vụ hỗ trợ</option>
                 <option value="Safety">An toàn & An ninh</option>
                 <option value="Other">Khác</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung góp ý</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={5}
                 value={newFeedback.content}
                 onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
                 placeholder="Nhập nội dung góp ý của bạn..."
                 required
               />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
               <p className="text-sm text-blue-700">
                  <strong>Lưu ý:</strong> Góp ý của bạn sẽ được gửi đến Ban Quản lý và chúng tôi sẽ phản hồi sớm nhất có thể.
               </p>
            </div>
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => setShowAddFeedbackModal(false)}>Hủy</Button>
               <Button onClick={handleAddFeedback}>Gửi Góp Ý</Button>
            </div>
         </div>
      </Modal>

      {/* Reply Feedback Modal */}
      <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} title={`Phản hồi góp ý từ ${selectedFeedback?.senderName}`}>
         {selectedFeedback && (
            <div className="space-y-4">
               <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Nội dung gốc:</p>
                  <p className="text-sm text-gray-600">"{selectedFeedback.content}"</p>
                  <p className="text-xs text-gray-500 mt-2">{selectedFeedback.date} • {selectedFeedback.category}</p>
               </div>
               
               {selectedFeedback.reply && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                     <p className="text-sm font-medium text-blue-700 mb-1">Phản hồi hiện tại:</p>
                     <p className="text-sm text-blue-600">"{selectedFeedback.reply}"</p>
                     <p className="text-xs text-gray-500 mt-2">{selectedFeedback.replyDate}</p>
                  </div>
               )}
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     {selectedFeedback.reply ? 'Chỉnh sửa phản hồi:' : 'Nội dung phản hồi:'}
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={4}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    required
                  />
               </div>
               
               <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-amber-700">
                     <strong>Hướng dẫn:</strong> Phản hồi nên chuyên nghiệp, giải quyết được vấn đề và thể hiện sự quan tâm đến góp ý của người gửi.
                  </p>
               </div>
               
               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowReplyModal(false)}>Hủy</Button>
                  <Button onClick={handleReplyFeedback}>
                     {selectedFeedback.reply ? 'Cập nhật phản hồi' : 'Gửi Phản hồi'}
                  </Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default FeedbackView;
