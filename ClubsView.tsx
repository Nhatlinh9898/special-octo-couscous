import React, { useState, useEffect } from 'react';
import { Tent, Calendar, Users, ArrowRight, Loader2, Sparkles, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { api, MOCK_CLUB_ACTIVITIES } from './data';
import { Club, ClubActivity, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import CreateClubForm from './CreateClubForm';
import ClubScheduleView from './ClubScheduleView';
import ClubDetailView from './ClubDetailView';

const ClubsView = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClubDetail, setShowClubDetail] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  // AI States
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [clubResult, setClubResult] = useState<AIAnalysisResult | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Activity Management States
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    clubId: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    type: 'regular',
    maxParticipants: '',
    registrationDeadline: new Date().toISOString().split('T')[0],
    requirements: '',
    budget: '',
    status: 'upcoming'
  });

  const resetSystem = () => {
    // Clear all localStorage data
    localStorage.removeItem('clubs');
    localStorage.removeItem('club_activities');
    localStorage.removeItem('activityRegistrations');
    
    // Clear club-specific events
    for (let i = 1; i <= 5; i++) {
      localStorage.removeItem(`club_events_${i}`);
    }
    
    // Reset all states
    setClubs([]);
    setActivities([]);
    setSchedules([]);
    setSelectedClub(null);
    setShowActivityModal(false);
    setShowClubModal(false);
    setShowCreateModal(false);
    setShowScheduleModal(false);
    setEditingActivity(null);
    setActivityForm({
      title: '',
      description: '',
      clubId: 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      type: 'regular',
      maxParticipants: '',
      registrationDeadline: new Date().toISOString().split('T')[0],
      requirements: '',
      budget: '',
      status: 'upcoming'
    });
    
    console.log('System reset completed');
    alert('Hệ thống đã được khởi động lại!');
    
    // Reload data fresh
    setTimeout(() => {
      loadClubs();
      loadActivities();
    }, 100);
  };

  useEffect(() => {
    loadClubs();
    loadActivities();
  }, []);

  const loadClubs = async () => {
    try {
      console.log('Loading clubs...');
      
      // Try to load from localStorage first
      const savedClubs = JSON.parse(localStorage.getItem('clubs') || '[]');
      console.log('Saved clubs from localStorage:', savedClubs);
      
      if (savedClubs.length > 0) {
        setClubs(savedClubs);
        console.log('Clubs loaded from localStorage:', savedClubs.length);
        return;
      }

      console.log('No clubs in localStorage, trying API...');
      
      // Try API
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const apiClubs = data.data.clubs || [];
          setClubs(apiClubs);
          localStorage.setItem('clubs', JSON.stringify(apiClubs));
          console.log('Clubs loaded from API:', apiClubs.length);
          return;
        }
      }
      
      console.log('API failed, trying mock data...');
      
      // Fallback to mock data
      const mockClubs = await api.getClubs();
      setClubs(mockClubs);
      localStorage.setItem('clubs', JSON.stringify(mockClubs));
      console.log('Clubs loaded from mock data:', mockClubs.length);
    } catch (error) {
      console.error('Error loading clubs:', error);
      // Final fallback to mock data
      api.getClubs().then((mockClubs) => {
        setClubs(mockClubs);
        localStorage.setItem('clubs', JSON.stringify(mockClubs));
        console.log('Clubs loaded from mock data (fallback):', mockClubs.length);
      });
    }
  };

  const loadActivities = async () => {
    try {
      // Try to load from localStorage first
      const savedActivities = JSON.parse(localStorage.getItem('club_activities') || '[]');
      if (savedActivities.length > 0) {
        setActivities(savedActivities);
        return;
      }

      // Fallback to API
      const response = await fetch('/api/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.slice(0, 5));
      } else {
        // Fallback to mock data
        const allSchedules = MOCK_CLUB_ACTIVITIES.map((schedule: any) => ({
          ...schedule,
          date: new Date().toISOString(),
        }));
        setActivities(allSchedules.slice(0, 5));
        localStorage.setItem('club_activities', JSON.stringify(allSchedules.slice(0, 5)));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback to mock data
      api.getClubActivities().then((data: any) => {
        setActivities(data);
        localStorage.setItem('club_activities', JSON.stringify(data));
      });
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

  const handleViewClubDetail = (club: any) => {
    setSelectedClubId(club.id.toString());
    setShowClubDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowClubDetail(false);
    setSelectedClubId('');
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

  // Activity Management Functions
  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({
      title: '',
      description: '',
      clubId: 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      type: 'regular',
      maxParticipants: '',
      registrationDeadline: new Date().toISOString().split('T')[0],
      requirements: '',
      budget: '',
      status: 'upcoming'
    });
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      description: activity.description,
      clubId: activity.clubId,
      date: activity.date,
      time: activity.time || '09:00',
      location: activity.location || '',
      type: activity.type || 'regular',
      maxParticipants: activity.maxParticipants?.toString() || '',
      registrationDeadline: activity.registrationDeadline || activity.date,
      requirements: activity.requirements || '',
      budget: activity.budget?.toString() || '',
      status: activity.status || 'upcoming'
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    try {
      // Validation
      if (!activityForm.title || !activityForm.description || !activityForm.date || !activityForm.clubId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      const activityData = {
        ...activityForm,
        maxParticipants: activityForm.maxParticipants ? parseInt(activityForm.maxParticipants) : null,
        budget: activityForm.budget ? parseFloat(activityForm.budget) : null,
        id: editingActivity ? editingActivity.id : Date.now(),
        createdAt: editingActivity ? editingActivity.createdAt : new Date().toISOString()
      };

      if (editingActivity) {
        // Update existing activity
        setActivities(prev => prev.map(act => act.id === editingActivity.id ? activityData : act));
        
        // Update localStorage
        const allActivities = JSON.parse(localStorage.getItem('club_activities') || '[]');
        const updatedActivities = allActivities.map((act: any) => act.id === editingActivity.id ? activityData : act);
        localStorage.setItem('club_activities', JSON.stringify(updatedActivities));
        
        // Also update club-specific events for ClubDetailView
        try {
          updateClubEvents(activityData.clubId, activityData, editingActivity.id);
        } catch (syncError) {
          console.warn('Failed to sync with club detail view:', syncError);
        }
        
        alert('Cập nhật hoạt động thành công!');
      } else {
        // Create new activity
        setActivities(prev => [...prev, activityData]);
        
        // Save to localStorage
        const allActivities = JSON.parse(localStorage.getItem('club_activities') || '[]');
        localStorage.setItem('club_activities', JSON.stringify([...allActivities, activityData]));
        
        // Also add to club-specific events for ClubDetailView
        try {
          updateClubEvents(activityData.clubId, activityData);
        } catch (syncError) {
          console.warn('Failed to sync with club detail view:', syncError);
        }
        
        alert('Tạo hoạt động mới thành công!');
      }

      setShowActivityModal(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Có lỗi xảy ra khi lưu hoạt động!');
    }
  };

  const updateClubEvents = (clubId: number, activityData: any, existingId?: number) => {
    try {
      // Validation
      if (!clubId || !activityData || !activityData.id) {
        console.warn('Invalid data for updateClubEvents:', { clubId, activityData });
        return;
      }

      // Convert activity to event format for ClubDetailView
      const eventData = {
        id: existingId || activityData.id,
        title: activityData.title || 'Hoạt động mới',
        description: activityData.description || '',
        date: activityData.date,
        time: activityData.time || '09:00',
        location: activityData.location || 'Địa điểm TBD',
        maxParticipants: activityData.maxParticipants,
        currentParticipants: activityData.currentParticipants || 0,
        registrationDeadline: activityData.registrationDeadline || activityData.date,
        status: 'upcoming',
        clubId: clubId,
        createdAt: activityData.createdAt || new Date().toISOString()
      };

      // Get existing club events
      const clubEvents = JSON.parse(localStorage.getItem(`club_events_${clubId}`) || '[]');
      
      if (existingId) {
        // Update existing event
        const updatedEvents = clubEvents.map((e: any) => e.id === existingId ? eventData : e);
        localStorage.setItem(`club_events_${clubId}`, JSON.stringify(updatedEvents));
      } else {
        // Add new event
        localStorage.setItem(`club_events_${clubId}`, JSON.stringify([eventData, ...clubEvents]));
      }
    } catch (error) {
      console.error('Error in updateClubEvents:', error);
      throw error; // Re-throw to be caught by parent
    }
  };

  const handleDeleteActivity = (activityId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) return;
    
    const activityToDelete = activities.find(act => act.id === activityId);
    
    setActivities(prev => prev.filter(act => act.id !== activityId));
    
    // Update localStorage
    const allActivities = JSON.parse(localStorage.getItem('club_activities') || '[]');
    const updatedActivities = allActivities.filter((act: any) => act.id !== activityId);
    localStorage.setItem('club_activities', JSON.stringify(updatedActivities));
    
    // Also remove from club-specific events
    if (activityToDelete) {
      const clubEvents = JSON.parse(localStorage.getItem(`club_events_${activityToDelete.clubId}`) || '[]');
      const updatedClubEvents = clubEvents.filter((e: any) => e.id !== activityId);
      localStorage.setItem(`club_events_${activityToDelete.clubId}`, JSON.stringify(updatedClubEvents));
    }
    
    alert('Xóa hoạt động thành công!');
  };

  const handleRegisterActivity = (activityId: number) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const registration = {
      activityId,
      userId: currentUser.id || 1,
      userName: currentUser.fullName || 'Người dùng',
      registrationDate: new Date().toISOString(),
      status: 'registered'
    };

    // Store registration in localStorage
    const existingRegistrations = JSON.parse(localStorage.getItem('activityRegistrations') || '[]');
    existingRegistrations.push(registration);
    localStorage.setItem('activityRegistrations', JSON.stringify(existingRegistrations));

    alert('Đăng ký tham gia hoạt động thành công!');
  };

  const getActivityRegistrations = (activityId: number) => {
    const registrations = JSON.parse(localStorage.getItem('activityRegistrations') || '[]');
    return registrations.filter((reg: any) => reg.activityId === activityId);
  };

  return (
    <div className="space-y-6">
      {showClubDetail ? (
        <ClubDetailView clubId={selectedClubId} onBack={handleBackFromDetail} />
      ) : (
        <>
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Câu lạc bộ & Ngoại khóa</h2>
           <p className="text-gray-500">Sân chơi năng động cho học sinh</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             onClick={resetSystem}
             className="text-sm"
             title="Khởi động lại hệ thống"
           >
             🔄 Reset
           </Button>
           <Button 
             variant="secondary" 
             onClick={handleAISuggest}
             disabled={isSuggesting}
           >
             {isSuggesting ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
             {isSuggesting ? 'AI Đang tìm...' : 'AI Gợi ý Hoạt động'}
           </Button>
           <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="text-sm">
             <Plus size={16} className="mr-1"/> Tạo CLB mới
           </Button>
           <Button 
             variant="secondary" 
             className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
             onClick={handleAddActivity}
           >
             <Plus size={18} className="mr-2"/> Tạo Hoạt động mới
           </Button>
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
                          onClick={() => handleViewClubDetail(club)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
                          title="Xem chi tiết"
                        >
                           <ArrowRight size={18}/>
                        </button>
                        <button 
                          onClick={() => handleDeleteClub(club.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
                          title="Xóa CLB"
                        >
                           <Trash2 size={16}/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600"/> Hoạt động sắp tới
           </h3>
           <Button variant="secondary" onClick={handleAddActivity} className="text-sm">
             <Plus size={16} className="mr-1"/> Thêm hoạt động
           </Button>
         </div>
         <div className="space-y-4">
            {activities.map(act => {
               const club = clubs.find(c => c.id === act.clubId);
               const registrations = getActivityRegistrations(act.id);
               return (
                  <div key={act.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                     <div className="w-16 h-16 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        <span className="text-xs uppercase">{new Date(act.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xl">{new Date(act.date).getDate()}</span>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="text-xs font-bold text-indigo-600 mb-1">{club?.name}</div>
                              <h4 className="font-bold text-gray-800">{act.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{act.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                 <span className="flex items-center gap-1">
                                    <Clock size={12}/> {act.time || '09:00'}
                                 </span>
                                 <span className="flex items-center gap-1">
                                    <MapPin size={12}/> {act.location || 'Chưa có địa điểm'}
                                 </span>
                                 <span className="flex items-center gap-1">
                                    <Users size={12}/> {registrations.length} người đăng ký
                                 </span>
                                 {act.maxParticipants && (
                                    <span className="flex items-center gap-1">
                                       <Users size={12}/> Tối đa {act.maxParticipants}
                                    </span>
                                 )}
                              </div>
                           </div>
                           <div className="flex gap-1">
                              <button 
                                onClick={() => handleRegisterActivity(act.id)}
                                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition"
                                title="Đăng ký tham gia"
                              >
                                 <Users size={16}/>
                              </button>
                              <button 
                                onClick={() => handleEditActivity(act)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                                title="Chỉnh sửa"
                              >
                                 <Edit size={16}/>
                              </button>
                              <button 
                                onClick={() => handleDeleteActivity(act.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
                                title="Xóa hoạt động"
                              >
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )
            })}
            {activities.length === 0 && (
               <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-2 text-gray-300"/>
                  <p>Chưa có hoạt động nào</p>
                  <Button variant="secondary" onClick={handleAddActivity} className="mt-2">
                     <Plus size={16} className="mr-1"/> Tạo hoạt động đầu tiên
                  </Button>
               </div>
            )}
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

      {/* Activity Modal */}
      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title={editingActivity ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}>
         <div className="p-6">
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động *</label>
                     <input
                        type="text"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập tên hoạt động"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Câu lạc bộ *</label>
                     <select
                        value={activityForm.clubId}
                        onChange={(e) => setActivityForm({...activityForm, clubId: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                        <option value={0}>Chọn câu lạc bộ</option>
                        {clubs.map(club => (
                           <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                     </select>
                     {clubs.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Đang tải danh sách câu lạc bộ...</p>
                     )}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả hoạt động *</label>
                  <textarea
                     value={activityForm.description}
                     onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     rows={3}
                     placeholder="Mô tả chi tiết về hoạt động"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tổ chức *</label>
                     <input
                        type="date"
                        value={activityForm.date}
                        onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                     <input
                        type="time"
                        value={activityForm.time}
                        onChange={(e) => setActivityForm({...activityForm, time: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                     <input
                        type="text"
                        value={activityForm.location}
                        onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập địa điểm tổ chức"
                     />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Loại hoạt động</label>
                     <select
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                        <option value="regular">Sinh hoạt thường lệ</option>
                        <option value="event">Sự kiện đặc biệt</option>
                        <option value="competition">Cuộc thi</option>
                        <option value="workshop">Workshop</option>
                        <option value="volunteer">Tình nguyện</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Số người tối đa</label>
                     <input
                        type="number"
                        value={activityForm.maxParticipants}
                        onChange={(e) => setActivityForm({...activityForm, maxParticipants: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Không giới hạn"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Hạn đăng ký</label>
                     <input
                        type="date"
                        value={activityForm.registrationDeadline}
                        onChange={(e) => setActivityForm({...activityForm, registrationDeadline: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách (VNĐ)</label>
                     <input
                        type="number"
                        value={activityForm.budget}
                        onChange={(e) => setActivityForm({...activityForm, budget: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                     <select
                        value={activityForm.status}
                        onChange={(e) => setActivityForm({...activityForm, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra</option>
                        <option value="completed">Đã kết thúc</option>
                        <option value="cancelled">Đã hủy</option>
                     </select>
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu tham gia</label>
                  <textarea
                     value={activityForm.requirements}
                     onChange={(e) => setActivityForm({...activityForm, requirements: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     rows={2}
                     placeholder="Các yêu cầu để tham gia hoạt động (nếu có)"
                  />
               </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
               <Button
                  variant="secondary"
                  onClick={() => setShowActivityModal(false)}
               >
                  Hủy
               </Button>
               <Button
                  onClick={handleSaveActivity}
                  disabled={!activityForm.title || !activityForm.description || !activityForm.clubId || !activityForm.date}
               >
                  {editingActivity ? 'Cập nhật' : 'Lưu'}
               </Button>
            </div>
         </div>
      </Modal>
        </>
      )}
    </div>
  );
};

export default ClubsView;
