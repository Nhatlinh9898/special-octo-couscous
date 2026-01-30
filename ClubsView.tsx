import React, { useState, useEffect } from 'react';
import { Tent, Calendar, Users, ArrowRight, Loader2, Sparkles, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { api } from './data';
import { Club, ClubActivity, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import CreateClubForm from './CreateClubForm';
import ClubScheduleView from './ClubScheduleView';

const ClubsView = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  // AI States
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [clubResult, setClubResult] = useState<AIAnalysisResult | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClubs();
    loadActivities();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      const data = await response.json();
      if (data.success) {
        setClubs(data.data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
      // Fallback to mock data
      api.getClubs().then(setClubs);
    }
  };

  const loadActivities = async () => {
    try {
      // Load recent club schedules as activities
      const response = await fetch('/api/clubs');
      const data = await response.json();
      if (data.success && data.data.clubs) {
        const allSchedules = data.data.clubs.flatMap((club: any) => 
          (club.schedules || []).map((schedule: any) => ({
            ...schedule,
            clubId: club.id,
            clubName: club.name,
            title: `Sinh hoạt ${club.name}`,
            description: `${schedule.dayOfWeek} - ${schedule.startTime} đến ${schedule.endTime}`,
            date: new Date().toISOString(),
          }))
        );
        setActivities(allSchedules.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback to mock data
      api.getClubActivities().then(setActivities);
    }
  };

  const loadClubSchedule = async (clubId: number) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/schedule`);
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data.schedules || []);
      }
    } catch (error) {
      console.error('Error loading club schedule:', error);
    }
  };

  const handleCreateClub = async (clubData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubData),
      });
      const data = await response.json();
      if (data.success) {
        await loadClubs();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu lạc bộ này?')) return;
    
    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await loadClubs();
      }
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };

  const handleViewSchedule = (club: any) => {
    setSelectedClub(club);
    loadClubSchedule(club.id);
    setShowScheduleModal(true);
  };

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      const result = await aiService.club.suggestActivities();
      setClubResult(result);
      setShowClubModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Câu lạc bộ & Ngoại khóa</h2>
           <p className="text-gray-500">Sân chơi năng động cho học sinh</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
             onClick={handleAISuggest}
             disabled={isSuggesting}
           >
             {isSuggesting ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
             {isSuggesting ? 'AI Đang tìm...' : 'AI Gợi ý Hoạt động'}
           </Button>
           <Button onClick={() => setShowCreateModal(true)}><Plus size={20} className="mr-2"/> Tạo CLB mới</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {clubs.map(club => (
            <div key={club.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
               <div className="h-32 bg-gray-200 relative">
                  <img src={club.image || '/default-club.jpg'} alt={club.name} className="w-full h-full object-cover"/>
                  <span className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                     {club.category}
                  </span>
               </div>
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{club.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{club.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4 flex-1">
                     <div className="flex items-center gap-2">
                        <Users size={16}/> {club._count?.members || 0} thành viên
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar size={16}/> {club._count?.schedules || 0} lịch sinh hoạt
                     </div>
                     {club.meetingRoom && (
                       <div className="flex items-center gap-2">
                          <MapPin size={16}/> {club.meetingRoom}
                       </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                     <div className="text-xs">
                        <span className="text-gray-400">Cố vấn:</span>
                        <div className="font-medium text-gray-800">{club.advisor?.fullName || 'Chưa có'}</div>
                     </div>
                     <div className="flex gap-1">
                        <button 
                          onClick={() => handleViewSchedule(club)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                          title="Xem thời khóa biểu"
                        >
                           <Clock size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDeleteClub(club.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
                          title="Xóa CLB"
                        >
                           <Trash2 size={16}/>
                        </button>
                        <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition">
                           <ArrowRight size={18}/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600"/> Hoạt động sắp tới
         </h3>
         <div className="space-y-4">
            {activities.map(act => {
               const club = clubs.find(c => c.id === act.clubId);
               return (
                  <div key={act.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                     <div className="w-16 h-16 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        <span className="text-xs uppercase">{new Date(act.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xl">{new Date(act.date).getDate()}</span>
                     </div>
                     <div>
                        <div className="text-xs font-bold text-indigo-600 mb-1">{club?.name}</div>
                        <h4 className="font-bold text-gray-800">{act.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{act.description}</p>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      <Modal isOpen={showClubModal} onClose={() => setShowClubModal(false)} title="Ý tưởng từ AI Hoạt động (Club AI)">
         {clubResult && (
            <div className="space-y-4">
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-bold text-purple-800 mb-2">{clubResult.title}</h4>
                  <p className="text-purple-700 text-sm">{clubResult.summary}</p>
               </div>
               
               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Sparkles size={16}/> Đề xuất hoạt động:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {clubResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowClubModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo Câu lạc bộ mới">
         <CreateClubForm onSubmit={handleCreateClub} loading={loading} />
      </Modal>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={`Thời khóa biểu - ${selectedClub?.name}`}>
         {selectedClub && (
            <ClubScheduleView 
               club={selectedClub} 
               schedules={schedules} 
               onUpdate={() => loadClubSchedule(selectedClub.id)}
            />
         )}
      </Modal>
    </div>
  );
};

export default ClubsView;
