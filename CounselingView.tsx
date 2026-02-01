import React, { useState, useEffect } from 'react';
import { HeartHandshake, Calendar, User, FileText, Clock, Plus, BookOpen, Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { CounselingSession, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

// Counselor interface
interface Counselor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specializations: ('Psychological' | 'Career')[];
  workingSchedule: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  maxSessionsPerDay: number;
  currentSessions: number;
  status: 'Available' | 'Busy' | 'Unavailable';
}

// Mock counselors data
const MOCK_COUNSELORS: Counselor[] = [
  {
    id: 1,
    name: "Ts. Nguyễn Thị An",
    email: "annta@school.edu.vn",
    phone: "0901234567",
    specializations: ['Psychological', 'Career'],
    workingSchedule: {
      monday: { start: '08:00', end: '17:00', available: true },
      tuesday: { start: '08:00', end: '17:00', available: true },
      wednesday: { start: '08:00', end: '17:00', available: true },
      thursday: { start: '08:00', end: '17:00', available: true },
      friday: { start: '08:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '12:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    maxSessionsPerDay: 6,
    currentSessions: 3,
    status: 'Available'
  },
  {
    id: 2,
    name: "Ths. Trần Văn Bình",
    email: "bintv@school.edu.vn",
    phone: "0909876543",
    specializations: ['Career'],
    workingSchedule: {
      monday: { start: '09:00', end: '18:00', available: true },
      tuesday: { start: '09:00', end: '18:00', available: true },
      wednesday: { start: '09:00', end: '18:00', available: true },
      thursday: { start: '09:00', end: '18:00', available: true },
      friday: { start: '09:00', end: '18:00', available: true },
      saturday: { start: '00:00', end: '00:00', available: false },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    maxSessionsPerDay: 8,
    currentSessions: 5,
    status: 'Available'
  },
  {
    id: 3,
    name: "Chuyên gia tâm lý Lê Thị Cúc",
    email: "cuclt@school.edu.vn",
    phone: "0912345678",
    specializations: ['Psychological'],
    workingSchedule: {
      monday: { start: '13:00', end: '20:00', available: true },
      tuesday: { start: '13:00', end: '20:00', available: true },
      wednesday: { start: '13:00', end: '20:00', available: true },
      thursday: { start: '13:00', end: '20:00', available: true },
      friday: { start: '13:00', end: '20:00', available: true },
      saturday: { start: '10:00', end: '16:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    maxSessionsPerDay: 5,
    currentSessions: 2,
    status: 'Available'
  }
];

const CounselingView = () => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showArticleDetailModal, setShowArticleDetailModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  // AI
  const [isScreening, setIsScreening] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Auto-scheduling state
  const [availableCounselors, setAvailableCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<{date: string; time: string; counselor: Counselor}[]>([]);
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    studentId: '',
    type: 'Psychological' as 'Psychological' | 'Career',
    counselorName: '',
    date: '',
    time: '',
    room: '',
    notes: '',
    preferredDate: '',
    preferredTime: ''
  });

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

  const handleBooking = () => {
    console.log('Booking button clicked');
    setBookingForm({
      studentId: '',
      type: 'Psychological',
      counselorName: '',
      date: '',
      time: '',
      room: '',
      notes: '',
      preferredDate: '',
      preferredTime: ''
    });
    
    // Filter counselors by specialization
    const filteredCounselors = MOCK_COUNSELORS.filter(counselor => 
      counselor.specializations.includes('Psychological') && counselor.status === 'Available'
    );
    setAvailableCounselors(filteredCounselors);
    
    // Generate suggested slots
    generateSuggestedSlots(filteredCounselors);
    
    setShowBookingModal(true);
  };

  const generateSuggestedSlots = (counselors: Counselor[]) => {
    const slots: {date: string; time: string; counselor: Counselor}[] = [];
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Generate slots for next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      counselors.forEach(counselor => {
        const schedule = counselor.workingSchedule[dayName as keyof typeof counselor.workingSchedule];
        
        if (schedule.available && counselor.currentSessions < counselor.maxSessionsPerDay) {
          // Generate hourly slots
          const startHour = parseInt(schedule.start.split(':')[0]);
          const endHour = parseInt(schedule.end.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            slots.push({
              date: dateStr,
              time: timeStr,
              counselor: counselor
            });
          }
        }
      });
    }
    
    // Sort by date and time, then by counselor availability
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    // Return top 10 suggestions
    setSuggestedSlots(slots.slice(0, 10));
  };

  const selectCounselor = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setBookingForm(prev => ({
      ...prev,
      counselorName: counselor.name,
      room: `Phòng tư vấn ${counselor.id}`
    }));
  };

  const selectTimeSlot = (slot: {date: string; time: string; counselor: Counselor}) => {
    selectCounselor(slot.counselor);
    setBookingForm(prev => ({
      ...prev,
      date: slot.date,
      time: slot.time
    }));
  };

  const handleSaveBooking = () => {
    if (!bookingForm.studentId || !bookingForm.counselorName || !bookingForm.date || !bookingForm.time) {
      alert('Vui lòng điền các thông tin bắt buộc!');
      return;
    }

    // Update counselor sessions count
    const counselor = MOCK_COUNSELORS.find(c => c.name === bookingForm.counselorName);
    if (counselor) {
      counselor.currentSessions++;
      if (counselor.currentSessions >= counselor.maxSessionsPerDay) {
        counselor.status = 'Busy';
      }
    }

    const newSession: CounselingSession = {
      id: Date.now(),
      studentId: parseInt(bookingForm.studentId),
      type: bookingForm.type,
      counselorName: bookingForm.counselorName,
      date: bookingForm.date,
      time: bookingForm.time,
      room: bookingForm.room || 'Phòng tư vấn 1',
      status: 'Scheduled',
      notes: bookingForm.notes
    };

    setSessions(prev => [...prev, newSession]);
    setShowBookingModal(false);
    alert(`Đã đặt lịch tư vấn thành công với ${bookingForm.counselorName} vào ${bookingForm.date} lúc ${bookingForm.time}!`);
  };

  const handleArticles = () => {
    console.log('Articles button clicked');
    setShowArticlesModal(true);
  };

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article.title);
    setSelectedArticle(article);
    setShowArticleDetailModal(true);
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
           <Button onClick={handleBooking}>
             <Plus size={20}/> Đặt lịch Tư vấn
           </Button>
           <Button 
             variant="secondary" 
             onClick={handleArticles}
           >
             <BookOpen size={20}/> Bài viết
           </Button>
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Đặt lịch Tư vấn</h3>
              <button 
                onClick={() => setShowBookingModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 80px)'}}>
              <div className="space-y-6">
                {/* Auto-scheduling toggle */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                        <Calendar size={16} />
                        Đặt lịch tự động
                      </h4>
                      <p className="text-blue-600 text-sm mt-1">
                        Hệ thống sẽ tự động tìm chuyên gia và thời gian phù hợp nhất
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoScheduleEnabled(!autoScheduleEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoScheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoScheduleEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Student selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học sinh *</label>
                  <select
                    value={bookingForm.studentId}
                    onChange={(e) => setBookingForm({...bookingForm, studentId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Chọn học sinh</option>
                    {MOCK_STUDENTS.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} - Lớp {student.classId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Counseling type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại tư vấn *</label>
                  <select
                    value={bookingForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as 'Psychological' | 'Career';
                      setBookingForm({...bookingForm, type: newType});
                      
                      // Re-filter counselors when type changes
                      const filteredCounselors = MOCK_COUNSELORS.filter(counselor => 
                        counselor.specializations.includes(newType) && counselor.status === 'Available'
                      );
                      setAvailableCounselors(filteredCounselors);
                      generateSuggestedSlots(filteredCounselors);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Psychological">Tư vấn tâm lý</option>
                    <option value="Career">Tư vấn hướng nghiệp</option>
                  </select>
                </div>

                {/* Auto-scheduling suggestions */}
                {autoScheduleEnabled && suggestedSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle size={16} className="inline mr-1" />
                      Thời gian gợi ý (chọn để đặt lịch)
                    </label>
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {suggestedSlots.map((slot, index) => (
                        <div
                          key={index}
                          onClick={() => selectTimeSlot(slot)}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800">
                                {slot.date} lúc {slot.time}
                              </div>
                              <div className="text-sm text-gray-600">
                                {slot.counselor.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                slot.counselor.status === 'Available' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {slot.counselor.status === 'Available' ? 'Rảnh' : 'Bận'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {slot.counselor.currentSessions}/{slot.counselor.maxSessionsPerDay} buổi
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual counselor selection */}
                {!autoScheduleEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên gia tư vấn *</label>
                    <div className="grid gap-3">
                      {availableCounselors.map(counselor => (
                        <div
                          key={counselor.id}
                          onClick={() => selectCounselor(counselor)}
                          className={`border rounded-lg p-3 cursor-pointer transition ${
                            selectedCounselor?.id === counselor.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800">{counselor.name}</div>
                              <div className="text-sm text-gray-600">
                                {counselor.specializations.join(', ')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {counselor.email} • {counselor.phone}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                counselor.status === 'Available' 
                                  ? 'bg-green-100 text-green-700' 
                                  : counselor.status === 'Busy'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {counselor.status === 'Available' ? 'Rảnh' : 
                                 counselor.status === 'Busy' ? 'Bận' : 'Không có mặt'}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {counselor.currentSessions}/{counselor.maxSessionsPerDay} buổi
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual date/time selection */}
                {!autoScheduleEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
                      <input
                        type="time"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                {/* Selected info display */}
                {selectedCounselor && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Thông tin đặt lịch
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div><strong>Chuyên gia:</strong> {selectedCounselor.name}</div>
                      <div><strong>Ngày:</strong> {bookingForm.date || 'Chưa chọn'}</div>
                      <div><strong>Giờ:</strong> {bookingForm.time || 'Chưa chọn'}</div>
                      <div><strong>Phòng:</strong> {bookingForm.room || 'Chưa phân bổ'}</div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Mô tả vấn đề cần tư vấn..."
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveBooking} disabled={!selectedCounselor || !bookingForm.date || !bookingForm.time}>
                    <Plus size={16} className="mr-1" /> Đặt lịch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Modal */}
      {showArticlesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Tài nguyên & Bài viết Tư vấn</h3>
              <button 
                onClick={() => setShowArticlesModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 80px)'}}>
              <div className="space-y-6">
                {/* Introduction */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <HeartHandshake size={20} />
                    Chào mừng đến với Trung tâm Tư vấn Tâm lý & Hướng nghiệp
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Trung tâm chúng tôi cung cấp các dịch vụ tư vấn chuyên nghiệp giúp học sinh giải quyết các vấn đề tâm lý, 
                    giảm stress, và định hướng nghề nghiệp phù hợp. Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng lắng nghe 
                    và hỗ trợ bạn trên hành trình phát triển bản thân.
                  </p>
                </div>

                {/* Articles */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-lg">Bài viết hữu ích</h4>
                  
                  <div 
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleArticleClick({
                      id: 1,
                      title: "Quản lý stress trong mùa thi cử",
                      content: `# Quản lý stress trong mùa thi cử

## Nhận diện dấu hiệu stress

Stress trong mùa thi cử là một hiện tượng tâm lý bình thường, nhưng nếu không được quản lý tốt có thể ảnh hưởng tiêu cực đến kết quả học tập và sức khỏe.

### Dấu hiệu nhận biết:
- **Về thể chất:** Đau đầu, mệt mỏi, mất ngủ, tim đập nhanh
- **Về cảm xúc:** Lo lắng, cáu kỉnh, buồn bã, dễ khóc
- **Về hành vi:** Trốn tránh học tập, trì hoãn, ăn uống thất thường
- **Về nhận thức:** Khó tập trung, trí nhớ suy giảm, tư duy tiêu cực

## Kỹ thuật thư giãn hiệu quả

### 1. Kỹ thuật hít thở sâu (4-7-8)
1. Hít vào bằng mũi đếm 4 giây
2. Giữ hơi thở đếm 7 giây  
3. Thở ra từ từ bằng miệng đếm 8 giây
4. Lặp lại 5-10 lần

### 2. Thư giãn cơ bản tiến
- Nằm ngửa, nhắm mắt
- Từng nhóm cơ căng trong 5 giây rồi thả lỏng
- Bắt đầu từ chân, đi lên dần đến đầu

### 3. Tư duy tích cực
- Thay đổi suy nghĩ tiêu cực thành tích cực
- Tập trung vào giải pháp thay vì vấn đề
- Nhắc nhở bản thân về những thành công đã đạt được

## Lịch trình học tập hiệu quả

### Nguyên tắc Pomodoro:
- Học tập tập trung 25 phút
- Nghỉ ngơi 5 phút
- Sau 4 Pomodoro, nghỉ dài 15-30 phút

### Môi trường học tập:
- Không gian yên tĩnh, đủ ánh sáng
- Để điện thoại ở phòng khác
- Có nước lọc và đồ ăn nhẹ lành mạnh

## Chăm sóc sức khỏe

### Dinh dưỡng:
- Ăn đủ 3 bữa, không bỏ bữa
- Tăng cường rau xanh, trái cây
- Hạn chế cà phê, nước ngọt có ga

### Vận động:
- Tập thể dục nhẹ nhàng 30 phút mỗi ngày
- Đi bộ, yoga, hoặc các môn thể thao yêu thích
- Vận động giúp giải tỏa stress hiệu quả

## Khi nào cần tìm kiếm sự giúp đỡ?

Hãy tìm đến chuyên gia tâm lý khi:
- Stress kéo dài hơn 2 tuần
- Ảnh hưởng nghiêm trọng đến cuộc sống hàng ngày
- Có dấu hiệu trầm cảm (mất hứng thú, thay đổi cân nặng)
- Có suy nghĩ tiêu cực về bản thân

## Lời khuyên cuối cùng

Hãy nhớ rằng stress không hoàn toàn xấu - nó có thể là động lực để bạn cố gắng hơn. Điều quan trọng là học cách quản lý stress một cách hiệu quả.

Chúc các bạn vượt qua mùa thi thành công!`,
                      author: "Ts. Nguyễn Thị An",
                      date: "15/10/2024",
                      category: "Tâm lý học đường"
                    })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Brain size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-2">Quản lý stress trong mùa thi cử</h5>
                        <p className="text-gray-600 text-sm mb-3">
                          Học cách nhận diện các dấu hiệu stress và áp dụng các kỹ thuật thư giãn hiệu quả để giữ tinh thần thoải mái 
                          trong giai đoạn quan trọng này.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} /> Ts. Nguyễn Thị An
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> 15/10/2024
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">Tâm lý học đường</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-2">Cẩm nang chọn ngành nghề 2024</h5>
                        <p className="text-gray-600 text-sm mb-3">
                          Hướng dẫn chi tiết cách khám phá sở thích, năng lực và thị trường lao động để chọn được ngành nghề 
                          phù hợp nhất với bản thân.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} /> Ths. Trần Văn Bình
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> 20/09/2024
                          </span>
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded">Hướng nghiệp</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <HeartHandshake size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-2">Xây dựng mối quan hệ bạn bè lành mạnh</h5>
                        <p className="text-gray-600 text-sm mb-3">
                          Kỹ năng giao tiếp và giải quyết xung đột giúp bạn xây dựng những mối quan hệ bạn bè tích cực, 
                          hỗ trợ cho sự phát triển cá nhân.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} /> Chuyên gia tâm lý Lê Thị Cúc
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> 05/10/2024
                          </span>
                          <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded">Kỹ năng sống</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-2">Trắc nghiệm tính cách MBTI và ứng dụng</h5>
                        <p className="text-gray-600 text-sm mb-3">
                          Khám phá loại hình tính cách của bạn qua trắc nghiệm MBTI và tìm hiểu cách áp dụng vào học tập 
                          và lựa chọn nghề nghiệp.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={12} /> Ts. Phạm Văn Dũng
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> 10/09/2024
                          </span>
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded">Tự khám phá</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-lg">Tài nguyên hỗ trợ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <h5 className="font-semibold text-blue-800 mb-2">Hotline hỗ trợ</h5>
                      <p className="text-blue-700 text-sm">1900 1234 - 24/7</p>
                      <p className="text-blue-600 text-xs mt-1">Hỗ trợ khẩn cấp mọi lúc</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                      <h5 className="font-semibold text-green-800 mb-2">Email tư vấn</h5>
                      <p className="text-green-700 text-sm">tuvan@school.edu.vn</p>
                      <p className="text-green-600 text-xs mt-1">Phản hồi trong 24 giờ</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setShowArticlesModal(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {showArticleDetailModal && selectedArticle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedArticle.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User size={12} /> {selectedArticle.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {selectedArticle.date}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">{selectedArticle.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowArticleDetailModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 80px)'}}>
              <div className="prose prose-sm max-w-none">
                {selectedArticle.content.split('\n').map((paragraph: string, index: number) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold text-gray-800 mb-4 mt-6">{paragraph.substring(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold text-gray-800 mb-3 mt-5">{paragraph.substring(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-semibold text-gray-800 mb-2 mt-4">{paragraph.substring(4)}</h3>;
                  } else if (paragraph.startsWith('- ')) {
                    return <li key={index} className="text-gray-700 mb-1 ml-4">{paragraph.substring(2)}</li>;
                  } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={index} className="font-semibold text-gray-800 mb-2">{paragraph}</p>;
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="text-gray-700 mb-3 leading-relaxed">{paragraph}</p>;
                  }
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>Bài viết này hữu ích cho bạn?</p>
                    <p className="mt-1">Chia sẻ để bạn bè cùng đọc nhé!</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <HeartHandshake size={14} className="mr-1" /> Thích
                    </Button>
                    <Button variant="secondary" size="sm">
                      <FileText size={14} className="mr-1" /> Lưu
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
