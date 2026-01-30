import React, { useContext } from 'react';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Bell, CheckCircle2, Video, CreditCard, Library, ClipboardList, Bus, Briefcase, Utensils, BedDouble, HeartPulse, UserPlus, Tent, FlaskConical, HeartHandshake, Globe, TrendingUp, Cpu, Bot, Server } from 'lucide-react';
import { AppContext } from './context';
import { MOCK_CLASSES, MOCK_STUDENTS, MOCK_TEACHERS, MOCK_SUBJECTS } from './data';
import { Card } from './components';

const DashboardView = () => {
  const { user, setActiveTab } = useContext(AppContext);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Xin chào, {user?.fullName}!</h2>
        <span className="text-gray-500">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Tổng số Lớp học" value={MOCK_CLASSES.length} icon={<LayoutDashboard size={24} />} color="bg-blue-500" />
        <Card title="Tổng số Học sinh" value={MOCK_STUDENTS.length} icon={<Users size={24} />} color="bg-green-500" />
        <Card title="Tổng số Giáo viên" value={MOCK_TEACHERS.length} icon={<GraduationCap size={24} />} color="bg-purple-500" />
        <Card title="Môn học đang dạy" value={MOCK_SUBJECTS.length} icon={<BookOpen size={24} />} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Năng lực Học tập Trung bình (Toàn trường)</h3>
            <div className="flex items-end space-x-4 h-64">
               {MOCK_SUBJECTS.map((sub, idx) => {
                  const heights = [75, 60, 85, 50, 65, 80]; // Mock data percentage
                  const h = heights[idx % heights.length];
                  return (
                     <div key={sub.id} className="flex-1 flex flex-col justify-end items-center group">
                        <div className="text-xs font-bold text-gray-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{h/10}</div>
                        <div className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 ${sub.color?.split(' ')[0]}`} style={{height: `${h}%`}}></div>
                        <div className="text-xs text-gray-500 mt-2 font-medium truncate w-full text-center">{sub.code}</div>
                     </div>
                  )
               })}
            </div>
         </div>

         {/* Activities */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-50">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full"><Bell size={16} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Bài tập mới môn Toán</p>
                  <p className="text-xs text-gray-500">Giáo viên đã đăng bài tập mới: Hàm số bậc hai</p>
                  <p className="text-xs text-gray-400 mt-1">30 phút trước</p>
                </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-50">
                <div className="p-2 bg-green-50 text-green-600 rounded-full"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Đã thu học phí</p>
                  <p className="text-xs text-gray-500">Nguyễn Văn B - Lớp 11A2</p>
                  <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                </div>
            </div>
            <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><Video size={16} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Video bài giảng mới</p>
                  <p className="text-xs text-gray-500">Môn Vật Lý: Định luật II Newton</p>
                  <p className="text-xs text-gray-400 mt-1">5 giờ trước</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Footer */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Truy cập nhanh</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-4">
            <button 
              onClick={() => setActiveTab('exam')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-red-500 mb-2 p-3 bg-red-50 rounded-full"><ClipboardList size={24} /></div>
                <h4 className="font-semibold text-gray-800">Thi cử</h4>
                <p className="text-xs text-gray-500 mt-1">Lịch thi</p>
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-purple-500 mb-2 p-3 bg-purple-50 rounded-full"><Library size={24} /></div>
                <h4 className="font-semibold text-gray-800">Thư viện</h4>
                <p className="text-xs text-gray-500 mt-1">Sách</p>
            </button>
            <button 
              onClick={() => setActiveTab('research')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-green-500 mb-2 p-3 bg-green-50 rounded-full"><FlaskConical size={24} /></div>
                <h4 className="font-semibold text-gray-800">Nghiên cứu</h4>
                <p className="text-xs text-gray-500 mt-1">Khoa học</p>
            </button>
            <button 
              onClick={() => setActiveTab('admissions')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-blue-500 mb-2 p-3 bg-blue-50 rounded-full"><UserPlus size={24} /></div>
                <h4 className="font-semibold text-gray-800">Tuyển sinh</h4>
                <p className="text-xs text-gray-500 mt-1">Hồ sơ</p>
            </button>
            <button 
              onClick={() => setActiveTab('hr')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-indigo-500 mb-2 p-3 bg-indigo-50 rounded-full"><Briefcase size={24} /></div>
                <h4 className="font-semibold text-gray-800">Nhân sự</h4>
                <p className="text-xs text-gray-500 mt-1">Hồ sơ NV</p>
            </button>
            <button 
              onClick={() => setActiveTab('health')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-rose-500 mb-2 p-3 bg-rose-50 rounded-full"><HeartPulse size={24} /></div>
                <h4 className="font-semibold text-gray-800">Y Tế</h4>
                <p className="text-xs text-gray-500 mt-1">Sức khỏe</p>
            </button>
            <button 
              onClick={() => setActiveTab('counseling')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-teal-500 mb-2 p-3 bg-teal-50 rounded-full"><HeartHandshake size={24} /></div>
                <h4 className="font-semibold text-gray-800">Tư vấn</h4>
                <p className="text-xs text-gray-500 mt-1">Tâm lý</p>
            </button>
            <button 
              onClick={() => setActiveTab('clubs')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-orange-500 mb-2 p-3 bg-orange-50 rounded-full"><Tent size={24} /></div>
                <h4 className="font-semibold text-gray-800">CLB</h4>
                <p className="text-xs text-gray-500 mt-1">Ngoại khóa</p>
            </button>
            {/* New Levels */}
             <button 
              onClick={() => setActiveTab('study_abroad')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-sky-500 mb-2 p-3 bg-sky-50 rounded-full"><Globe size={24} /></div>
                <h4 className="font-semibold text-gray-800">Du học</h4>
                <p className="text-xs text-gray-500 mt-1">Quốc tế</p>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-emerald-500 mb-2 p-3 bg-emerald-50 rounded-full"><TrendingUp size={24} /></div>
                <h4 className="font-semibold text-gray-800">Chiến lược</h4>
                <p className="text-xs text-gray-500 mt-1">Phân tích</p>
            </button>
            <button 
              onClick={() => setActiveTab('smart_campus')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-cyan-500 mb-2 p-3 bg-cyan-50 rounded-full"><Cpu size={24} /></div>
                <h4 className="font-semibold text-gray-800">IoT</h4>
                <p className="text-xs text-gray-500 mt-1">Smart Campus</p>
            </button>
            <button 
              onClick={() => setActiveTab('ai_assistant')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-violet-500 mb-2 p-3 bg-violet-50 rounded-full"><Bot size={24} /></div>
                <h4 className="font-semibold text-gray-800">EduBot</h4>
                <p className="text-xs text-gray-500 mt-1">Trợ lý AI</p>
            </button>
            <button 
              onClick={() => setActiveTab('server_monitor')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition flex flex-col items-center text-center"
            >
                <div className="text-slate-500 mb-2 p-3 bg-slate-200 rounded-full"><Server size={24} /></div>
                <h4 className="font-semibold text-gray-800">Monitor</h4>
                <p className="text-xs text-gray-500 mt-1">Hạ tầng</p>
            </button>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;
