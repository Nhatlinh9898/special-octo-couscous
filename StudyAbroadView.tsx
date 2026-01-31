import React, { useState, useEffect, useContext } from 'react';
import { Globe, Plane, GraduationCap, Clock, FileText, CheckCircle2, Loader2, Award } from 'lucide-react';
import { api, MOCK_STUDENTS, MOCK_CLASSES, MOCK_STUDENT_ACTIVITIES } from './data';
import { PartnerUniversity, ExchangeProgram, AbroadApplication, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import { AppContext } from './context';

const StudyAbroadView = () => {
  const { user } = useContext(AppContext);
  const [partners, setPartners] = useState<PartnerUniversity[]>([]);
  const [programs, setPrograms] = useState<ExchangeProgram[]>([]);
  const [applications, setApplications] = useState<AbroadApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'partners' | 'programs' | 'applications'>('partners');

  // AI
  const [isMatching, setIsMatching] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Application Modal
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ExchangeProgram | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    studentId: 1001, // Default student
    programId: 0,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    currentSchool: '',
    grade: '',
    gpa: '',
    englishLevel: '',
    motivation: '',
    experience: '',
    achievements: '',
    additionalInfo: ''
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      const studentInfo = getStudentInfo(user.id);
      const analyzedData = analyzeStudentData(user.id);
      
      setApplicationForm(prev => ({
        ...prev,
        fullName: studentInfo.fullName,
        email: studentInfo.email,
        phone: studentInfo.phone,
        currentSchool: studentInfo.schoolName,
        grade: studentInfo.grade,
        gpa: analyzedData.gpa,
        englishLevel: analyzedData.englishLevel,
        motivation: analyzedData.motivation,
        experience: analyzedData.experience,
        achievements: analyzedData.achievements
      }));
    }
  }, [user]);

  useEffect(() => {
    console.log('Loading study abroad data...');
    api.getPartners().then(data => {
      console.log('Partners loaded:', data);
      setPartners(data);
    });
    api.getPrograms().then(data => {
      console.log('Programs loaded:', data);
      setPrograms(data);
    });
    api.getAbroadApps().then(data => {
      console.log('Applications loaded:', data);
      setApplications(data);
    });
  }, []);

  const handleAIMatch = async () => {
    setIsMatching(true);
    try {
      const res = await aiService.studyAbroad.matchScholarships();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsMatching(false); }
  };

  const handleApplyProgram = (program: ExchangeProgram) => {
    setSelectedProgram(program);
    
    // Get student information
    const studentInfo = getStudentInfo(user?.id || 1001);
    
    // Analyze student data for auto-generated content
    const analyzedData = analyzeStudentData(user?.id || 1001);
    
    setApplicationForm(prev => ({
      ...prev,
      programId: program.id,
      studentId: user?.id || 1001,
      fullName: studentInfo.fullName,
      email: studentInfo.email,
      phone: studentInfo.phone,
      currentSchool: studentInfo.schoolName,
      grade: studentInfo.grade,
      gpa: analyzedData.gpa,
      englishLevel: analyzedData.englishLevel,
      motivation: analyzedData.motivation,
      experience: analyzedData.experience,
      achievements: analyzedData.achievements
    }));
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new application
    const newApplication: AbroadApplication = {
      id: applications.length + 1,
      studentId: applicationForm.studentId,
      programId: applicationForm.programId,
      status: "Submitted",
      submissionDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('New application created:', newApplication);
    console.log('Current applications:', applications);
    
    // Add to applications list
    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    
    console.log('Updated applications:', updatedApplications);
    
    // Auto-switch to applications tab
    setActiveTab('applications');
    
    // Reset form and close modal
    setApplicationForm({
      studentId: 1001,
      programId: 0,
      fullName: '',
      email: '',
      phone: '',
      currentSchool: '',
      grade: '',
      gpa: '',
      englishLevel: '',
      motivation: '',
      experience: '',
      achievements: '',
      additionalInfo: ''
    });
    setShowApplicationModal(false);
    setSelectedProgram(null);
    
    alert('Hồ sơ ứng tuyển đã được gửi thành công!');
  };

  const getStudentName = (id: number) => {
  // First check if it's the current user
  if (user && id === user.id) {
    return user.fullName;
  }
  // Then check MOCK_STUDENTS
  return MOCK_STUDENTS.find(s => s.id === id)?.fullName || "Unknown";
};

const getStudentInfo = (userId: number) => {
  // First check if it's the current user
  if (user && userId === user.id) {
    // For admin user, return default info
    return {
      fullName: user.fullName,
      email: user.email,
      phone: '',
      className: 'Admin',
      schoolName: 'EduManager System',
      grade: 'Admin'
    };
  }
  
  // Then check MOCK_STUDENTS
  const student = MOCK_STUDENTS.find(s => s.id === userId);
  if (student) {
    const classInfo = MOCK_CLASSES.find(c => c.id === student.classId);
    return {
      fullName: student.fullName,
      email: student.email || '',
      phone: student.phone || '',
      className: classInfo?.name || 'Unknown Class',
      schoolName: 'Trường THPT EduManager',
      grade: `Lớp ${classInfo?.gradeLevel || 'Unknown'}`
    };
  }
  
  // Default fallback
  return {
    fullName: 'Unknown',
    email: '',
    phone: '',
    className: 'Unknown',
    schoolName: 'Unknown',
    grade: 'Unknown'
  };
};

const analyzeStudentData = (userId: number) => {
  // Get student activities data
  const studentActivityData = MOCK_STUDENT_ACTIVITIES.find(s => s.studentId === userId);
  
  if (!studentActivityData) {
    return {
      motivation: '',
      experience: '',
      achievements: '',
      gpa: '',
      englishLevel: 'Basic'
    };
  }

  // Generate motivation based on goals and strengths
  const motivation = `Với thành tích học tập xuất sắc (GPA: ${studentActivityData.academicPerformance.gpa}/4.0, xếp hạng ${studentActivityData.academicPerformance.rank}), tôi mong muốn tham gia chương trình du học để hiện thực hóa mục tiêu "${studentActivityData.goals[0]}". Các môn học mạnh của tôi là ${studentActivityData.academicPerformance.strongSubjects.join(', ')} sẽ là nền tảng vững chắc cho việc học tập tại môi trường quốc tế.`;

  // Generate experience from activities
  const experience = studentActivityData.activities.map(activity => 
    `- ${activity.name} (${activity.duration}): ${activity.role} - ${activity.achievements}`
  ).join('\n');

  // Generate achievements from activities and academic performance
  const achievements = `Học tập: ${studentActivityData.academicPerformance.rank} với GPA ${studentActivityData.academicPerformance.gpa}/4.0\n\nHoạt động ngoại khóa:\n${experience}\n\nMục tiêu tương lai: ${studentActivityData.goals.join(' và ')}`;

  // Determine English level based on activities and goals
  let englishLevel = 'Basic';
  if (studentActivityData.activities.some(a => a.name.includes('Tiếng Anh')) || 
      studentActivityData.goals.some(g => g.includes('Anh') || g.includes('Mỹ') || g.includes('Singapore'))) {
    englishLevel = 'IELTS 6.0-6.5';
  }
  if (studentActivityData.academicPerformance.strongSubjects.includes('Anh')) {
    englishLevel = 'IELTS 6.5+';
  }

  return {
    motivation,
    experience,
    achievements,
    gpa: studentActivityData.academicPerformance.gpa.toString(),
    englishLevel
  };
};

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
                     prog.type === 'Scholarship' ? 'bg-green-100 text-green-600' :
                     prog.type === 'Research' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
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
                     <Button onClick={() => handleApplyProgram(prog)}>Ứng tuyển</Button>
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'applications' && (
         <>
           {console.log('Rendering applications tab, applications:', applications)}
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
                              app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                              app.status === 'Interview' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                           }`}>
                              {app.status === 'Under Review' ? 'Đang xét duyệt' : 
                               app.status === 'Accepted' ? 'Đã trúng tuyển' : 
                               app.status === 'Interview' ? 'Phỏng vấn' :
                               app.status === 'Rejected' ? 'Bị từ chối' : app.status}
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
         </>
      )}

      {/* Application Modal */}
      <Modal 
        isOpen={showApplicationModal} 
        onClose={() => setShowApplicationModal(false)} 
        title={`Ứng tuyển: ${selectedProgram?.title}`}
        size="large"
      >
        {selectedProgram && (
          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">Thông tin chương trình</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Đối tác:</span>
                  <span className="ml-2 font-medium">{partners.find(p => p.id === selectedProgram.partnerId)?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Loại:</span>
                  <span className="ml-2 font-medium">{selectedProgram.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="ml-2 font-medium">{selectedProgram.duration}</span>
                </div>
                <div>
                  <span className="text-gray-600">Chi phí:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {selectedProgram.cost === 0 ? 'Miễn phí' : `$${selectedProgram.cost}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-bold text-green-800 mb-2">Thông tin học sinh (tự động điền)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Họ và tên:</span>
                  <span className="ml-2 font-medium">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Lớp:</span>
                  <span className="ml-2 font-medium">{getStudentInfo(user?.id || 1001).className}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trường:</span>
                  <span className="ml-2 font-medium">{getStudentInfo(user?.id || 1001).schoolName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vai trò:</span>
                  <span className="ml-2 font-medium">{user?.role}</span>
                </div>
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-2 font-medium">{user?.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên * 
                  <span className="text-xs text-green-600 ml-2">(đã điền sẵn)</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicationForm.fullName}
                  onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email * 
                  <span className="text-xs text-green-600 ml-2">(đã điền sẵn)</span>
                </label>
                <input
                  type="email"
                  required
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điện thoại * 
                  <span className="text-xs text-green-600 ml-2">(đã điền sẵn)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                  placeholder="09xxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp * 
                  <span className="text-xs text-green-600 ml-2">(đã điền sẵn)</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicationForm.grade}
                  onChange={(e) => setApplicationForm({...applicationForm, grade: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                  placeholder="Lớp 12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trường hiện tại * 
                <span className="text-xs text-green-600 ml-2">(đã điền sẵn)</span>
              </label>
              <input
                type="text"
                required
                value={applicationForm.currentSchool}
                onChange={(e) => setApplicationForm({...applicationForm, currentSchool: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                placeholder="Trường THPT ABC"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">Phân tích dữ liệu học sinh (tự động tạo)</h4>
              <div className="text-sm text-gray-700">
                <p className="mb-2">🤖 <strong>AI Analysis:</strong> Hệ thống đã phân tích dữ liệu học tập và hoạt động của học sinh để tự động tạo nội dung:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Động lực:</strong> Dựa trên mục tiêu du học và điểm mạnh học tập</li>
                  <li><strong>Kinh nghiệm:</strong> Tổng hợp từ hoạt động ngoại khóa và vai trò</li>
                  <li><strong>Thành tích:</strong> Kết hợp thành tích học tập và giải thưởng</li>
                  <li><strong>GPA:</strong> Lấy từ dữ liệu học tập chính xác</li>
                  <li><strong>Tiếng Anh:</strong> Phân tích dựa trên hoạt động và mục tiêu</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPA * 
                  <span className="text-xs text-blue-600 ml-2">(phân tích tự động)</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicationForm.gpa}
                  onChange={(e) => setApplicationForm({...applicationForm, gpa: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                  placeholder="3.5/4.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trình độ tiếng Anh * 
                  <span className="text-xs text-blue-600 ml-2">(phân tích tự động)</span>
                </label>
                <select
                  required
                  value={applicationForm.englishLevel}
                  onChange={(e) => setApplicationForm({...applicationForm, englishLevel: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                >
                  <option value="">Chọn trình độ</option>
                  <option value="IELTS 6.5+">IELTS 6.5+</option>
                  <option value="IELTS 6.0-6.5">IELTS 6.0-6.5</option>
                  <option value="IELTS 5.5-6.0">IELTS 5.5-6.0</option>
                  <option value="TOEFL 80+">TOEFL 80+</option>
                  <option value="TOEFL 60-80">TOEFL 60-80</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Động lực ứng tuyển * 
                <span className="text-xs text-blue-600 ml-2">(phân tích tự động)</span>
              </label>
              <textarea
                required
                value={applicationForm.motivation}
                onChange={(e) => setApplicationForm({...applicationForm, motivation: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                rows={4}
                placeholder="Tại sao bạn muốn tham gia chương trình này? Mục tiêu của bạn là gì?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kinh nghiệm và hoạt động ngoại khóa 
                <span className="text-xs text-blue-600 ml-2">(phân tích tự động)</span>
              </label>
              <textarea
                value={applicationForm.experience}
                onChange={(e) => setApplicationForm({...applicationForm, experience: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                rows={3}
                placeholder="Các hoạt động, cuộc thi, dự án bạn đã tham gia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thành tích và giải thưởng 
                <span className="text-xs text-blue-600 ml-2">(phân tích tự động)</span>
              </label>
              <textarea
                value={applicationForm.achievements}
                onChange={(e) => setApplicationForm({...applicationForm, achievements: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                rows={3}
                placeholder="Học sinh giỏi, giải thưởng các cuộc thi..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin bổ sung</label>
              <textarea
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm({...applicationForm, additionalInfo: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Bất kỳ thông tin nào khác bạn muốn chia sẻ..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowApplicationModal(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                Gửi hồ sơ ứng tuyển
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
