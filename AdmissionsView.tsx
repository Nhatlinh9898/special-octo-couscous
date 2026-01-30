import React, { useState, useEffect } from 'react';
import { UserPlus, Filter, Calendar, Plus, BrainCircuit, Loader2 } from 'lucide-react';
import { api } from './data';
import { aiService } from './aiService';
import { Applicant, AIAnalysisResult } from './types';
import { Button, Modal } from './components';

const AdmissionsView = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [draggedApplicant, setDraggedApplicant] = useState<Applicant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    api.getApplicants().then(setApplicants);
  }, []);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.admissions.analyzeApplicants(applicants.length);
      setAnalysisResult(result);
      setShowAnalysisModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const columns: { id: Applicant['status'], title: string, color: string }[] = [
    { id: 'New', title: 'Hồ sơ mới', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { id: 'Reviewing', title: 'Đang xem xét', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { id: 'Interview', title: 'Phỏng vấn / Test', color: 'bg-purple-100 border-purple-200 text-purple-700' },
    { id: 'Accepted', title: 'Trúng tuyển', color: 'bg-green-100 border-green-200 text-green-700' },
    { id: 'Rejected', title: 'Từ chối', color: 'bg-gray-100 border-gray-200 text-gray-700' },
  ];

  const handleDragStart = (e: React.DragEvent, applicant: Applicant) => {
    setDraggedApplicant(applicant);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Applicant['status']) => {
    e.preventDefault();
    if (draggedApplicant && draggedApplicant.status !== status) {
       setApplicants(prev => prev.map(a => a.id === draggedApplicant.id ? { ...a, status } : a));
    }
    setDraggedApplicant(null);
  };

  const handleAddApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newApplicant: Applicant = {
       id: Date.now(),
       code: `TS${Date.now().toString().slice(-4)}`,
       fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
       dob: (form.elements.namedItem('dob') as HTMLInputElement).value,
       email: (form.elements.namedItem('email') as HTMLInputElement).value,
       phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
       gradeApplying: parseInt((form.elements.namedItem('grade') as HTMLSelectElement).value),
       status: 'New',
       applicationDate: new Date().toISOString().split('T')[0]
    };
    setApplicants([...applicants, newApplicant]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tuyển sinh Đầu cấp</h2>
           <p className="text-gray-500">Quản lý phễu tuyển sinh và hồ sơ ứng viên</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
             onClick={handleAIAnalyze}
             disabled={isAnalyzing}
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <BrainCircuit size={18}/>}
             {isAnalyzing ? 'Đang phân tích...' : 'AI Phân tích'}
           </Button>
           <Button variant="secondary"><Filter size={18}/> Lọc</Button>
           <Button onClick={() => setShowAddModal(true)}><Plus size={20}/> Thêm Hồ sơ</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
         <div className="flex gap-4 h-full min-w-[1000px] pb-4">
            {columns.map(col => (
               <div 
                  key={col.id}
                  className="flex-1 bg-gray-50 rounded-xl border border-gray-200 flex flex-col max-w-xs"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
               >
                  <div className={`p-3 rounded-t-xl border-b font-bold flex justify-between items-center ${col.color}`}>
                     {col.title}
                     <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded text-xs">
                        {applicants.filter(a => a.status === col.id).length}
                     </span>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                     {applicants.filter(a => a.status === col.id).map(app => (
                        <div 
                           key={app.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, app)}
                           className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition active:cursor-grabbing"
                        >
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-gray-400">#{app.code}</span>
                              <span className="text-xs font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">Lớp {app.gradeApplying}</span>
                           </div>
                           <h4 className="font-bold text-gray-800">{app.fullName}</h4>
                           <div className="text-xs text-gray-500 mt-1 mb-2 space-y-0.5">
                              <div>{app.email}</div>
                              <div>{app.phone}</div>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
                              <Calendar size={12}/> {app.applicationDate}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} title="Kết quả Phân tích từ Admissions AI">
         {analysisResult && (
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2">{analysisResult.title}</h4>
                  <p className="text-indigo-700 text-sm">{analysisResult.summary}</p>
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
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit size={16}/> Đề xuất hành động:</h5>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tiếp nhận Hồ sơ Mới">
         <form onSubmit={handleAddApplicant} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Họ và tên học sinh</label>
               <input name="fullName" className="w-full border rounded-lg p-2" required placeholder="Nguyễn Văn A" />
             </div>
             {/* ... (rest of the form remains the same) ... */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                   <input type="date" name="dob" className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Đăng ký vào lớp</label>
                   <select name="grade" className="w-full border rounded-lg p-2">
                      <option value="1">Lớp 1</option>
                      <option value="6">Lớp 6</option>
                      <option value="10">Lớp 10</option>
                   </select>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Email phụ huynh</label>
                   <input type="email" name="email" className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">SĐT phụ huynh</label>
                   <input type="tel" name="phone" className="w-full border rounded-lg p-2" required />
                </div>
             </div>
             <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
                <Button type="submit">Lưu hồ sơ</Button>
             </div>
         </form>
      </Modal>
    </div>
  );
};

export default AdmissionsView;