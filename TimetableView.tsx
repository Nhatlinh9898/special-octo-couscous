import React, { useState, useEffect } from 'react';
import { Download, Clock, Users, MapPin, Calendar, Loader2, Filter, User, BookOpen, Trophy, Play } from 'lucide-react';
import { api, MOCK_SUBJECTS, MOCK_TEACHERS } from './data';
import { ScheduleItem, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import AutoTimetableView from './AutoTimetableView';

const TimetableView = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [viewType, setViewType] = useState<'class' | 'student' | 'teacher' | 'club' | 'course'>('class');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [entities, setEntities] = useState<any[]>([]);
  // AI States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAutoTimetable, setShowAutoTimetable] = useState(false);
  
  useEffect(() => {
    loadEntities();
    if (viewType === 'class') {
      api.getSchedule().then(setSchedule);
    }
  }, [viewType]);

  const loadEntities = async () => {
    try {
      let response;
      switch (viewType) {
        case 'class':
          // Load classes
          response = await fetch('/api/classes');
          const classesData = await response.json();
          setEntities(classesData.data?.classes || []);
          break;
        case 'student':
          // Load students
          response = await fetch('/api/students');
          const studentsData = await response.json();
          setEntities(studentsData.data?.students || []);
          break;
        case 'teacher':
          // Load teachers
          response = await fetch('/api/users?role=TEACHER');
          const teachersData = await response.json();
          setEntities(teachersData.data?.users || []);
          break;
        case 'club':
          // Load clubs
          response = await fetch('/api/clubs');
          const clubsData = await response.json();
          setEntities(clubsData.data?.clubs || []);
          break;
        case 'course':
          // Load courses
          response = await fetch('/api/courses');
          const coursesData = await response.json();
          setEntities(coursesData.data?.courses || []);
          break;
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    }
  };

  const loadSchedule = async () => {
    if (!selectedEntity) return;
    
    try {
      let response;
      switch (viewType) {
        case 'class':
          response = await fetch(`/api/classes/${selectedEntity}/schedule`);
          break;
        case 'student':
          response = await fetch(`/api/student-timetable?studentId=${selectedEntity}`);
          break;
        case 'teacher':
          response = await fetch(`/api/teacher-timetable?teacherId=${selectedEntity}`);
          break;
        case 'club':
          response = await fetch(`/api/clubs/${selectedEntity}/schedule`);
          break;
        case 'course':
          response = await fetch(`/api/courses/${selectedEntity}/schedule`);
          break;
      }
      
      const data = await response.json();
      if (data.success) {
        // Transform data based on view type
        if (viewType === 'student' || viewType === 'teacher') {
          // Combine all schedule types
          const allSchedules = [
            ...(data.data.schedules?.class || []),
            ...(data.data.schedules?.courses || []),
            ...(data.data.schedules?.clubs || [])
          ];
          setSchedule(allSchedules);
        } else {
          setSchedule(data.data.schedules || []);
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedEntity, viewType]);

  const handleAIOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await aiService.timetable.optimizeSchedule();
      setResult(res);
      setShowModal(true);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  const days = [
    { num: 2, name: 'Thứ 2' },
    { num: 3, name: 'Thứ 3' },
    { num: 4, name: 'Thứ 4' },
    { num: 5, name: 'Thứ 5' },
    { num: 6, name: 'Thứ 6' },
    { num: 7, name: 'Thứ 7' },
  ];
  const periods = [1, 2, 3, 4, 5];

  const getSubject = (id: number) => MOCK_SUBJECTS.find(s => s.id === id);
  const getTeacher = (id: number) => MOCK_TEACHERS.find(t => t.id === id);

  const getViewIcon = () => {
    switch (viewType) {
      case 'class': return <Users size={18} />;
      case 'student': return <User size={18} />;
      case 'teacher': return <BookOpen size={18} />;
      case 'club': return <Trophy size={18} />;
      case 'course': return <BookOpen size={18} />;
      default: return <Calendar size={18} />;
    }
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'class': return 'Thời Khóa Biểu Lớp Học';
      case 'student': return 'Thời Khóa Biểu Học Sinh';
      case 'teacher': return 'Thời Khóa Biểu Giáo Viên';
      case 'club': return 'Thời Khóa Biểu Câu Lạc Bộ';
      case 'course': return 'Thời Khóa Biểu Khóa Học';
      default: return 'Thời Khóa Biểu';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             {getViewIcon()}
             {getViewTitle()}
           </h2>
           <p className="text-gray-500">
             {viewType === 'class' && (selectedEntity ? entities.find(e => e.id === parseInt(selectedEntity))?.name || 'Lớp 10A1' : 'Chọn lớp để xem')}
             {viewType === 'student' && (selectedEntity ? entities.find(e => e.id === parseInt(selectedEntity))?.fullName || 'Học sinh' : 'Chọn học sinh để xem')}
             {viewType === 'teacher' && (selectedEntity ? entities.find(e => e.id === parseInt(selectedEntity))?.fullName || 'Giáo viên' : 'Chọn giáo viên để xem')}
             {viewType === 'club' && (selectedEntity ? entities.find(e => e.id === parseInt(selectedEntity))?.name || 'Câu lạc bộ' : 'Chọn câu lạc bộ để xem')}
             {viewType === 'course' && (selectedEntity ? entities.find(e => e.id === parseInt(selectedEntity))?.name || 'Khóa học' : 'Chọn khóa học để xem')}
           </p>
        </div>
        <div className="flex gap-2">
           <div className="flex gap-1">
             <Button 
               variant={viewType === 'class' ? 'primary' : 'secondary'}
               onClick={() => setViewType('class')}
               className="text-xs"
             >
               <Users size={14}/> Lớp
             </Button>
             <Button 
               variant={viewType === 'student' ? 'primary' : 'secondary'}
               onClick={() => setViewType('student')}
               className="text-xs"
             >
               <User size={14}/> Học sinh
             </Button>
             <Button 
               variant={viewType === 'teacher' ? 'primary' : 'secondary'}
               onClick={() => setViewType('teacher')}
               className="text-xs"
             >
               <BookOpen size={14}/> Giáo viên
             </Button>
             <Button 
               variant={viewType === 'club' ? 'primary' : 'secondary'}
               onClick={() => setViewType('club')}
               className="text-xs"
             >
               <Trophy size={14}/> CLB
             </Button>
             <Button 
               variant={viewType === 'course' ? 'primary' : 'secondary'}
               onClick={() => setViewType('course')}
               className="text-xs"
             >
               <BookOpen size={14}/> Khóa học
             </Button>
           </div>
           <select
             value={selectedEntity}
             onChange={(e) => setSelectedEntity(e.target.value)}
             className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="">Chọn {viewType === 'class' ? 'lớp' : viewType === 'student' ? 'học sinh' : viewType === 'teacher' ? 'giáo viên' : viewType === 'club' ? 'CLB' : 'khóa học'}</option>
             {entities.map(entity => (
               <option key={entity.id} value={entity.id}>
                 {entity.name || entity.fullName || entity.code}
               </option>
             ))}
           </select>
           <Button 
             variant="secondary" 
             className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
             onClick={handleAIOptimize}
             disabled={isOptimizing}
           >
             {isOptimizing ? <Loader2 size={18} className="animate-spin"/> : <Calendar size={18}/>}
             {isOptimizing ? 'AI Đang xếp lịch...' : 'AI Tối ưu Lịch'}
           </Button>
           <Button 
             variant="secondary" 
             className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
             onClick={() => setShowAutoTimetable(true)}
           >
             <Play size={18} className="mr-2"/>
             Tự Động Tạo
           </Button>
           <Button variant="secondary"><Download size={18}/> Xuất PDF</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-gray-200">
             <div className="p-4 bg-gray-50 font-semibold text-gray-600 border-r text-center">Tiết / Ngày</div>
             {days.map(d => (
               <div key={d.num} className="p-4 bg-gray-50 font-semibold text-gray-800 text-center border-r last:border-0">
                 {d.name}
               </div>
             ))}
          </div>
          {periods.map(p => (
            <div key={p} className="grid grid-cols-7 border-b border-gray-100 last:border-0 h-32">
               <div className="p-4 border-r bg-gray-50 flex flex-col items-center justify-center">
                 <span className="font-bold text-xl text-gray-700">{p}</span>
                 <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10}/> 45'</span>
               </div>
               {days.map(d => {
                 const item = schedule.find(s => s.day === d.num && s.period === p);
                 if (!item) return <div key={d.num} className="border-r last:border-0"></div>;
                 
                 let content, bgColor, textColor;
                 
                 if (item.type === 'CLASS') {
                   const subject = getSubject(item.subjectId);
                   const teacher = getTeacher(item.teacherId);
                   bgColor = subject?.color || 'bg-blue-100';
                   textColor = 'text-blue-800';
                   content = (
                     <>
                       <div>
                         <span className="text-xs font-bold uppercase opacity-75">{subject?.code}</span>
                         <h4 className="font-bold text-sm leading-tight mt-1">{subject?.name}</h4>
                       </div>
                       <div className="mt-2 text-xs opacity-90">
                         <div className="flex items-center gap-1 mb-1"><Users size={12}/> {teacher?.fullName}</div>
                         <div className="flex items-center gap-1"><MapPin size={12}/> {item.room || 'P.201'}</div>
                       </div>
                     </>
                   );
                 } else if (item.type === 'COURSE') {
                   bgColor = 'bg-green-100';
                   textColor = 'text-green-800';
                   content = (
                     <>
                       <div>
                         <span className="text-xs font-bold uppercase opacity-75">{item.course?.code}</span>
                         <h4 className="font-bold text-sm leading-tight mt-1">{item.course?.name}</h4>
                       </div>
                       <div className="mt-2 text-xs opacity-90">
                         <div className="flex items-center gap-1 mb-1"><Users size={12}/> {item.teacher?.fullName}</div>
                         <div className="flex items-center gap-1"><MapPin size={12}/> {item.room || 'P.301'}</div>
                       </div>
                     </>
                   );
                 } else if (item.type === 'CLUB') {
                   bgColor = 'bg-purple-100';
                   textColor = 'text-purple-800';
                   content = (
                     <>
                       <div>
                         <span className="text-xs font-bold uppercase opacity-75">CLB</span>
                         <h4 className="font-bold text-sm leading-tight mt-1">{item.club?.name}</h4>
                       </div>
                       <div className="mt-2 text-xs opacity-90">
                         <div className="flex items-center gap-1 mb-1"><Users size={12}/> {item.teacher?.fullName || 'Tự quản'}</div>
                         <div className="flex items-center gap-1"><MapPin size={12}/> {item.room || 'Hội trường'}</div>
                       </div>
                     </>
                   );
                 } else {
                   // Fallback for original format
                   const subject = getSubject(item.subjectId);
                   const teacher = getTeacher(item.teacherId);
                   bgColor = subject?.color || 'bg-gray-100';
                   textColor = 'text-gray-800';
                   content = (
                     <>
                       <div>
                         <span className="text-xs font-bold uppercase opacity-75">{subject?.code}</span>
                         <h4 className="font-bold text-sm leading-tight mt-1">{subject?.name}</h4>
                       </div>
                       <div className="mt-2 text-xs opacity-90">
                         <div className="flex items-center gap-1 mb-1"><Users size={12}/> {teacher?.fullName}</div>
                         <div className="flex items-center gap-1"><MapPin size={12}/> {item.room || 'P.201'}</div>
                       </div>
                     </>
                   );
                 }
                 
                 return (
                   <div key={d.num} className="p-2 border-r last:border-0">
                     <div className={`h-full rounded-lg p-3 border ${bgColor} ${textColor} flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer shadow-sm`}>
                       {content}
                     </div>
                   </div>
                 );
               })}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="AI Xếp Lịch (Timetable AI)">
         {result && (
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2">{result.title}</h4>
                  <p className="text-indigo-700 text-sm">{result.summary}</p>
               </div>
               {result.dataPoints && (
                  <div className="text-center py-4 grid grid-cols-2 gap-4">
                     {result.dataPoints.map((dp, idx) => (
                        <div key={idx} className="bg-white border p-2 rounded">
                           <div className="text-gray-500 text-xs">{dp.label}</div>
                           <div className="text-lg font-bold text-indigo-600">{dp.value}</div>
                        </div>
                     ))}
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">Đề xuất điều chỉnh:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {result.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
               </div>
               <div className="flex justify-end pt-2"><Button onClick={() => setShowModal(false)}>Đóng</Button></div>
            </div>
         )}
      </Modal>

      <Modal 
        isOpen={showAutoTimetable} 
        onClose={() => setShowAutoTimetable(false)} 
        title="Tạo Thời Khóa Biểu Tự Động"
        size="full"
      >
        <AutoTimetableView />
      </Modal>
    </div>
  );
};

export default TimetableView;
