import React, { useState, useEffect } from 'react';
import { Plus, Users, Loader2, Edit, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
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
  
  // Event management states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'ACTIVITY',
    location: '',
    time: '',
    maxParticipants: 0
  });

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

  // Event management handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      type: 'ACTIVITY',
      location: '',
      time: '',
      maxParticipants: 0
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: SchoolEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      type: event.type,
      location: event.location || '',
      time: event.time || '',
      maxParticipants: event.maxParticipants || 0
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date) {
      alert('Vui lòng nhập tên và ngày sự kiện!');
      return;
    }

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(evt => 
        evt.id === editingEvent.id 
          ? { 
              ...evt, 
              title: eventForm.title,
              description: eventForm.description,
              date: eventForm.date,
              type: eventForm.type,
              location: eventForm.location,
              time: eventForm.time,
              maxParticipants: eventForm.maxParticipants
            }
          : evt
      ));
      alert('Cập nhật sự kiện thành công!');
    } else {
      // Add new event
      const newEvent: SchoolEvent = {
        id: Date.now(),
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        type: eventForm.type,
        location: eventForm.location,
        time: eventForm.time,
        maxParticipants: eventForm.maxParticipants
      };
      setEvents([...events, newEvent]);
      alert('Thêm sự kiện thành công!');
    }

    setShowEventModal(false);
    setEventForm({
      title: '',
      description: '',
      date: '',
      type: 'ACTIVITY',
      location: '',
      time: '',
      maxParticipants: 0
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      setEvents(events.filter(evt => evt.id !== eventId));
      alert('Xóa sự kiện thành công!');
    }
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
           <Button onClick={handleAddEvent}><Plus size={20}/> Thêm Sự Kiện</Button>
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
                 {evt.location && (
                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                     <MapPin size={12} />
                     <span>{evt.location}</span>
                   </div>
                 )}
                 {evt.time && (
                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                     <Clock size={12} />
                     <span>{evt.time}</span>
                   </div>
                 )}
                 {evt.maxParticipants && evt.maxParticipants > 0 && (
                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                     <Users size={12} />
                     <span>Tối đa {evt.maxParticipants} người</span>
                   </div>
                 )}
                 <div className="flex gap-2 mt-3">
                   <Button 
                     variant="secondary" 
                     size="sm"
                     onClick={() => handleEditEvent(evt)}
                   >
                     <Edit size={14} /> Sửa
                   </Button>
                   <Button 
                     variant="secondary" 
                     size="sm"
                     className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                     onClick={() => handleDeleteEvent(evt.id)}
                   >
                     <Trash2 size={14} /> Xóa
                   </Button>
                 </div>
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

      {/* Event Modal */}
      {showEventModal && (
        <Modal 
          isOpen={showEventModal} 
          onClose={() => setShowEventModal(false)} 
          title={editingEvent ? 'Chỉnh sửa Sự Kiện' : 'Thêm Sự Kiện Mới'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                placeholder="Nhập tên sự kiện..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                <input 
                  type="time" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại sự kiện</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value as 'ACADEMIC' | 'HOLIDAY' | 'ACTIVITY'})}
                >
                  <option value="ACTIVITY">Hoạt động</option>
                  <option value="ACADEMIC">Học thuật</option>
                  <option value="HOLIDAY">Nghỉ lễ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số người tối đa</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({...eventForm, maxParticipants: parseInt(e.target.value) || 0})}
                  placeholder="0 = không giới hạn"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                placeholder="Hội trường A, Giảng đường B..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Mô tả chi tiết về sự kiện..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowEventModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? 'Cập nhật' : 'Thêm sự kiện'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsView;
