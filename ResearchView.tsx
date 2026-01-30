import React, { useState, useEffect } from 'react';
import { FlaskConical, FileText, CheckCircle2, Circle, Clock, Plus, BarChart2, Loader2, Microscope } from 'lucide-react';
import { api } from './data';
import { ResearchProject, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const ResearchView = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  // AI
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  const handleAIScan = async () => {
    setIsScanning(true);
    try {
      const res = await aiService.research.identifyTrends();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsScanning(false); }
  };

  const getStatusColor = (status: ResearchProject['status']) => {
     switch(status) {
        case 'Proposal': return 'text-purple-600 bg-purple-100';
        case 'Approved': return 'text-blue-600 bg-blue-100';
        case 'Ongoing': return 'text-orange-600 bg-orange-100';
        case 'Completed': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
     }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Nghiên cứu Khoa học</h2>
           <p className="text-gray-500">Quản lý dự án STEM và đề tài nghiên cứu</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100"
             onClick={handleAIScan}
             disabled={isScanning}
           >
             {isScanning ? <Loader2 size={18} className="animate-spin"/> : <Microscope size={18}/>}
             {isScanning ? 'AI Đang quét...' : 'AI Xu hướng STEM'}
           </Button>
           <Button><Plus size={20}/> Đăng ký Đề tài</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {projects.map(proj => (
            <div key={proj.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(proj.status)}`}>
                     {proj.status === 'Proposal' ? 'Đề xuất' : proj.status === 'Approved' ? 'Đã duyệt' : proj.status === 'Ongoing' ? 'Đang thực hiện' : 'Hoàn thành'}
                  </span>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                     <Clock size={14}/> {proj.startDate}
                  </div>
               </div>
               
               <h3 className="text-lg font-bold text-gray-800 mb-2">{proj.title}</h3>
               <p className="text-sm text-gray-600 mb-4">Lĩnh vực: <span className="font-medium text-indigo-600">{proj.field}</span></p>
               
               <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Chủ nhiệm:</span>
                     <span className="font-medium text-gray-800">{proj.leaderName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Thành viên:</span>
                     <span className="font-medium text-gray-800">{proj.members} người</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Ngân sách:</span>
                     <span className="font-bold text-gray-800">{formatCurrency(proj.budget)}</span>
                  </div>
               </div>

               <div className="mt-auto">
                  <div className="flex justify-between items-end mb-1">
                     <span className="text-xs font-semibold text-gray-500">Tiến độ</span>
                     <span className="text-xs font-bold text-indigo-600">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                     <div 
                        className={`h-2 rounded-full transition-all duration-500 ${proj.status === 'Completed' ? 'bg-green-500' : 'bg-indigo-500'}`} 
                        style={{width: `${proj.progress}%`}}
                     ></div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Xu hướng Nghiên cứu (Research AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <h4 className="font-bold text-teal-800 mb-2">{aiResult.title}</h4>
                  <p className="text-teal-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-teal-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Định hướng đề tài:</h5>
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

export default ResearchView;
