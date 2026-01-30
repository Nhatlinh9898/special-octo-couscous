import React, { useState, useEffect } from 'react';
import { HeartHandshake, Calendar, User, FileText, Clock, Plus, BookOpen, Brain, Loader2 } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { CounselingSession, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const CounselingView = () => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  // AI
  const [isScreening, setIsScreening] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getSessions().then(setSessions);
  }, []);

  const handleAIScreen = async () => {
    setIsScreening(true);
    try {
      const res = await aiService.counseling.screenRisks();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsScreening(false); }
  };

  const getStudentName = (id: number) => MOCK_STUDENTS.find(s => s.id === id)?.fullName || "Unknown";

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tư vấn Tâm lý & Hướng nghiệp</h2>
           <p className="text-gray-500">Hỗ trợ sức khỏe tinh thần và định hướng tương lai</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
             onClick={handleAIScreen}
             disabled={isScreening}
           >
             {isScreening ? <Loader2 size={18} className="animate-spin"/> : <Brain size={18}/>}
             {isScreening ? 'AI Đang sàng lọc...' : 'AI Sàng lọc Tâm lý'}
           </Button>
           <Button><Plus size={20}/> Đặt lịch Tư vấn</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Upcoming Sessions */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={20} className="text-indigo-600"/> Lịch hẹn sắp tới</h3>
            <div className="space-y-4">
               {sessions.map(sess => (
                  <div key={sess.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
                     <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-white shadow-sm ${
                        sess.type === 'Psychological' ? 'bg-rose-500' : 'bg-blue-500'
                     }`}>
                        <span className="text-xs uppercase opacity-80">{sess.type === 'Psychological' ? 'Tâm lý' : 'Hướng nghiệp'}</span>
                        <span className="text-lg">{sess.time}</span>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-800 text-lg">Học sinh: {getStudentName(sess.studentId)}</h4>
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                              sess.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 
                              sess.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                           }`}>
                              {sess.status === 'Scheduled' ? 'Sắp tới' : sess.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                           <User size={14}/> Chuyên gia: {sess.counselorName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                           <Clock size={14}/> Ngày: {sess.date} • Phòng: {sess.room}
                        </p>
                        {sess.notes && (
                           <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                              " {sess.notes} "
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Resources Sidebar */}
         <div className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><HeartHandshake size={20}/> Cần hỗ trợ ngay?</h3>
                <p className="text-indigo-100 text-sm mb-4">Đừng ngần ngại chia sẻ. Mọi thông tin đều được bảo mật tuyệt đối.</p>
                <div className="space-y-2">
                   <div className="bg-white/10 p-2 rounded flex items-center gap-2">
                      <span className="font-bold">Hotline:</span> 1900 1234
                   </div>
                   <div className="bg-white/10 p-2 rounded flex items-center gap-2">
                      <span className="font-bold">Email:</span> tuvan@school.edu.vn
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={20}/> Tài nguyên</h3>
                <ul className="space-y-3">
                   <li>
                      <a href="#" className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition"><FileText size={16}/></div>
                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">Trắc nghiệm tính cách MBTI</span>
                      </a>
                   </li>
                   <li>
                      <a href="#" className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition"><FileText size={16}/></div>
                         <span className="text-sm font-medium text-gray-700 group-hover:text-rose-600 transition">Bài viết: Đối phó với áp lực thi cử</span>
                      </a>
                   </li>
                   <li>
                      <a href="#" className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition"><FileText size={16}/></div>
                         <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition">Cẩm nang chọn ngành nghề 2024</span>
                      </a>
                   </li>
                </ul>
             </div>
         </div>
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Sàng lọc Tâm lý (Counseling AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-bold text-purple-800 mb-2">{aiResult.title}</h4>
                  <p className="text-purple-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-red-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Biện pháp hỗ trợ:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {aiResult.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
               </div>
               <div className="flex justify-end pt-2"><Button onClick={() => setShowAIModal(false)}>Đóng</Button></div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default CounselingView;
