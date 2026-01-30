import React, { useState, useEffect } from 'react';
import { Plus, Users, Loader2 } from 'lucide-react';
import { api } from './data';
import { SchoolEvent, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const EventsView = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  // AI
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getEvents().then(setEvents);
  }, []);

  const handleAIPredict = async () => {
    setIsPredicting(true);
    try {
      const res = await aiService.event.predictEngagement();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsPredicting(false); }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'HOLIDAY': return 'bg-red-100 text-red-700 border-red-200';
      case 'ACADEMIC': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACTIVITY': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Sự Kiện & Lịch Hoạt Động</h2>
           <p className="text-gray-500">Các sự kiện sắp tới của nhà trường</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-pink-600 border-pink-200 bg-pink-50 hover:bg-pink-100"
             onClick={handleAIPredict}
             disabled={isPredicting}
           >
             {isPredicting ? <Loader2 size={18} className="animate-spin"/> : <Users size={18}/>}
             {isPredicting ? 'AI Đang dự báo...' : 'AI Dự báo Tham gia'}
           </Button>
           <Button><Plus size={20}/> Thêm Sự Kiện</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {events.map(evt => (
           <div key={evt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                 <span className="text-xs font-bold text-gray-500 uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                 <span className="text-2xl font-bold text-gray-800">{new Date(evt.date).getDate()}</span>
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeColor(evt.type)}`}>
                       {evt.type}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(evt.date).getFullYear()}</span>
                 </div>
                 <h3 className="font-bold text-lg text-gray-800">{evt.title}</h3>
                 <p className="text-sm text-gray-600 mt-1">{evt.description}</p>
              </div>
           </div>
         ))}
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Dự báo Sự kiện (Event AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <h4 className="font-bold text-pink-800 mb-2">{aiResult.title}</h4>
                  <p className="text-pink-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-pink-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Đề xuất tổ chức:</h5>
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

export default EventsView;
