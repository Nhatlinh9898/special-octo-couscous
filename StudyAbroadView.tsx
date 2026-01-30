import React, { useState, useEffect } from 'react';
import { Globe, Plane, GraduationCap, Clock, FileText, CheckCircle2, Loader2, Award } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { PartnerUniversity, ExchangeProgram, AbroadApplication, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const StudyAbroadView = () => {
  const [partners, setPartners] = useState<PartnerUniversity[]>([]);
  const [programs, setPrograms] = useState<ExchangeProgram[]>([]);
  const [applications, setApplications] = useState<AbroadApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'partners' | 'programs' | 'applications'>('partners');

  // AI
  const [isMatching, setIsMatching] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getPartners().then(setPartners);
    api.getPrograms().then(setPrograms);
    api.getAbroadApps().then(setApplications);
  }, []);

  const handleAIMatch = async () => {
    setIsMatching(true);
    try {
      const res = await aiService.studyAbroad.matchScholarships();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsMatching(false); }
  };

  const getStudentName = (id: number) => MOCK_STUDENTS.find(s => s.id === id)?.fullName || "Unknown";
  const getProgramTitle = (id: number) => programs.find(p => p.id === id)?.title || "Unknown";

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Du học & Hợp tác Quốc tế</h2>
           <p className="text-gray-500">Mở rộng cơ hội học tập toàn cầu</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
             onClick={handleAIMatch}
             disabled={isMatching}
           >
             {isMatching ? <Loader2 size={18} className="animate-spin"/> : <Award size={18}/>}
             {isMatching ? 'AI Đang tìm...' : 'AI Săn Học bổng'}
           </Button>
           <button onClick={() => setActiveTab('partners')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'partners' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Đối tác</button>
           <button onClick={() => setActiveTab('programs')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'programs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Chương trình</button>
           <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'applications' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Hồ sơ</button>
        </div>
      </div>

      {activeTab === 'partners' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map(p => (
               <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition">
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
                     <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                     <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">Rank #{p.ranking}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{p.country}</span>
                     </div>
                     <p className="text-sm text-gray-600 mb-4">{p.description}</p>
                     <a href={p.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline mt-auto flex items-center gap-1">
                        <Globe size={14}/> Website
                     </a>
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'programs' && (
         <div className="space-y-4">
            {programs.map(prog => (
               <div key={prog.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition">
                  <div className={`p-4 rounded-xl flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 ${
                     prog.type === 'Summer Camp' ? 'bg-orange-100 text-orange-600' :
                     prog.type === 'Scholarship' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                     <Plane size={32} className="mb-1"/>
                     <span className="text-[10px] font-bold text-center leading-tight">{prog.type}</span>
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-xl text-gray-800">{prog.title}</h3>
                     <p className="text-sm text-gray-500 mb-2">Đối tác: {partners.find(p => p.id === prog.partnerId)?.name}</p>
                     <div className="flex gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock size={16}/> {prog.duration}</span>
                        <span className="flex items-center gap-1"><GraduationCap size={16}/> {prog.slots} suất</span>
                        <span className="font-bold text-blue-600">{prog.cost === 0 ? 'Miễn phí' : `$${prog.cost}`}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-gray-500 mb-2">Hạn nộp: <span className="text-red-500 font-bold">{prog.deadline}</span></div>
                     <Button>Ứng tuyển</Button>
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'applications' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                     <th className="p-4">Học sinh</th>
                     <th className="p-4">Chương trình</th>
                     <th className="p-4">Ngày nộp</th>
                     <th className="p-4 text-center">Trạng thái</th>
                     <th className="p-4 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {applications.map(app => (
                     <tr key={app.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{getStudentName(app.studentId)}</td>
                        <td className="p-4 text-sm text-gray-600">{getProgramTitle(app.programId)}</td>
                        <td className="p-4 text-sm text-gray-500">{app.submissionDate}</td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                              app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                              app.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 
                              app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                           }`}>
                              {app.status === 'Under Review' ? 'Đang xét duyệt' : app.status === 'Accepted' ? 'Đã trúng tuyển' : app.status}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           <button className="text-blue-600 hover:underline text-sm font-medium"><FileText size={16}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Tìm kiếm Học bổng (Study Abroad AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2">{aiResult.title}</h4>
                  <p className="text-blue-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-green-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Chương trình gợi ý:</h5>
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

export default StudyAbroadView;
