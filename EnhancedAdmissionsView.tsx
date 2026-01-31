import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  UserPlus, Filter, Calendar, Plus, BrainCircuit, Loader2, Upload, Download, 
  FileSpreadsheet, Share2, Facebook, Twitter, Linkedin, Mail, Phone, MapPin, 
  GraduationCap, Award, Users, Building, BookOpen, Target, TrendingUp,
  CheckCircle, XCircle, Clock, AlertCircle, Edit, Trash2, Eye, Send, MessageCircle,
  ExternalLink, Settings
} from 'lucide-react';
import { api } from './data';
import { aiService } from './aiService';
import { Applicant, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { AppContext } from './context';

interface SchoolInfo {
  name: string;
  slogan: string;
  established: string;
  type: string;
  principal: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface AcademicStandard {
  id: number;
  name: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface SocialPost {
  id: number;
  platform: 'facebook' | 'twitter' | 'linkedin';
  content: string;
  imageUrl?: string;
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'posted';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

const EnhancedAdmissionsView = () => {
  const { setActiveTab: setGlobalActiveTab } = useContext(AppContext);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [draggedApplicant, setDraggedApplicant] = useState<Applicant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [showSchoolInfoModal, setShowSchoolInfoModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [activeTab, setActiveLocalTab] = useState<'applicants' | 'school' | 'standards' | 'social'>('applicants');
  
  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // School Info
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: 'Trường THPT ABC',
    slogan: 'Nâng tầm tri thức - vươn ra thế giới',
    established: '2005',
    type: 'Công lập',
    principal: 'PGS.TS. Nguyễn Văn A',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phone: '(028) 1234 5678',
    email: 'tuyensinh@thptabc.edu.vn',
    website: 'www.thptabc.edu.vn'
  });

  // Academic Standards
  const [standards, setStandards] = useState<AcademicStandard[]>([
    {
      id: 1,
      name: 'Tiêu chuẩn tuyển sinh Lớp 10',
      description: 'Các yêu cầu tối thiểu để đăng ký vào lớp 10',
      requirements: [
        'Tốt nghiệp THCS',
        'Điểm trung bình học tập từ 7.0 trở lên',
        'Hạnh kiểm từ Khá trở lên',
        'Không bị kỷ luật mức trở lên'
      ],
      benefits: [
        'Chương trình học tiên tiến',
        'Hoạt động ngoại khóa phong phú',
        'Học bổng ưu đãi',
        'Định hướng du học'
      ]
    },
    {
      id: 2,
      name: 'Tiêu chuẩn tuyển sinh Lớp 6',
      description: 'Các yêu cầu tối thiểu để đăng ký vào lớp 6',
      requirements: [
        'Tốt nghiệp Tiểu học',
        'Điểm kiểm tra đầu vào từ 6.5 trở lên',
        'Phụ huynh cam kết đồng hành',
        'Sức khỏe phù hợp học tập'
      ],
      benefits: [
        'Lộ trình học cá nhân hóa',
        'Phát triển kỹ năng mềm',
        'Hoạt động thể chất đa dạng',
        'Tư vấn hướng nghiệp sớm'
      ]
    }
  ]);

  // Social Media Posts
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    {
      id: 1,
      platform: 'facebook',
      content: '🎓 ĐĂNG KÝ TUYỂN SINH 2024-2025\n\nTrường THPT ABC chính thức mở cổng đăng ký tuyển sinh cho năm học 2024-2025.\n\n📅 Hạn chót: 30/06/2024\n🔗 Link đăng ký: http://localhost:3000/admissions\n\n#TuyenSinh #THPTABC #TuyenSinh2024',
      status: 'draft',
      scheduledDate: '2024-05-15T09:00:00'
    }
  ]);

  // Social Post Creation State
  const [newSocialPost, setNewSocialPost] = useState({
    platform: 'facebook' as 'facebook' | 'twitter' | 'linkedin',
    content: '',
    scheduledDate: '',
    imageUrl: ''
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBatchImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate Excel file processing
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Parse CSV/Excel data and create applicants
        const lines = text.split('\n');
        const newApplicants: Applicant[] = [];
        
        lines.slice(1).forEach((line, index) => {
          if (line.trim()) {
            const [fullName, dob, email, phone, grade] = line.split(',');
            newApplicants.push({
              id: Date.now() + index,
              code: `TS${(Date.now() + index).toString().slice(-4)}`,
              fullName: fullName?.trim() || '',
              dob: dob?.trim() || '',
              email: email?.trim() || '',
              phone: phone?.trim() || '',
              gradeApplying: parseInt(grade) || 10,
              status: 'New',
              applicationDate: new Date().toISOString().split('T')[0]
            });
          }
        });
        
        setApplicants([...applicants, ...newApplicants]);
        setShowBatchImportModal(false);
      };
      reader.readAsText(file);
    }
  };

  const handleExportTemplate = () => {
    const csvContent = 'Họ và tên,Ngày sinh,Email,SĐT,Lớp đăng ký\nNguyễn Văn A,01/01/2008,email@example.com,0123456789,10\nNguyễn Thị B,15/06/2008,email2@example.com,0987654321,10';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_tuyen_sinh.csv';
    link.click();
  };

  const handleSocialPost = (post: SocialPost) => {
    // Simulate posting to social media
    setSocialPosts(prev => prev.map(p => 
      p.id === post.id 
        ? { ...p, status: 'posted', engagement: { likes: 45, shares: 12, comments: 8 } }
        : p
    ));
  };

  const handleCreateSocialPost = () => {
    if (newSocialPost.content.trim()) {
      const post: SocialPost = {
        id: Date.now(),
        platform: newSocialPost.platform,
        content: newSocialPost.content,
        imageUrl: newSocialPost.imageUrl || undefined,
        scheduledDate: newSocialPost.scheduledDate || undefined,
        status: newSocialPost.scheduledDate ? 'scheduled' : 'draft'
      };
      setSocialPosts([...socialPosts, post]);
      setNewSocialPost({
        platform: 'facebook',
        content: '',
        scheduledDate: '',
        imageUrl: ''
      });
      setShowSocialModal(false);
    }
  };

  const handlePreviewPost = () => {
    if (newSocialPost.content.trim()) {
      setShowPreviewModal(true);
    }
  };

  const handleViewExistingPost = (post: SocialPost) => {
    setNewSocialPost({
      platform: post.platform,
      content: post.content,
      scheduledDate: post.scheduledDate || '',
      imageUrl: post.imageUrl || ''
    });
    setShowPreviewModal(true);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tuyển sinh Nâng cao</h2>
           <p className="text-gray-500">Quản lý tuyển sinh, thông tin trường và mạng xã hội</p>
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
           <Button variant="secondary" onClick={() => setShowBatchImportModal(true)}>
             <Upload size={18}/> Nhập Excel
           </Button>
           <Button onClick={() => setShowAddModal(true)}>
             <Plus size={20}/> Thêm Hồ sơ
           </Button>
           <Button 
             variant="secondary"
             onClick={() => setGlobalActiveTab('admissions_landing')}
             className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
           >
             <ExternalLink size={18}/> Xem trang tuyển sinh
           </Button>
           <Button 
             variant="secondary"
             onClick={() => setGlobalActiveTab('admissions_admin')}
             className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
           >
             <Settings size={18}/> Quản lý nội dung
           </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveLocalTab('applicants')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'applicants' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users size={18} className="mr-2 inline"/> Hồ sơ ứng viên
        </button>
        <button
          onClick={() => setActiveLocalTab('school')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'school' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building size={18} className="mr-2 inline"/> Thông tin trường
        </button>
        <button
          onClick={() => setActiveLocalTab('standards')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'standards' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Target size={18} className="mr-2 inline"/> Tiêu chuẩn
        </button>
        <button
          onClick={() => setActiveLocalTab('social')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'social' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Share2 size={18} className="mr-2 inline"/> Mạng xã hội
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'applicants' && (
          <div className="h-full overflow-x-auto">
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
        )}

        {activeTab === 'school' && (
          <div className="p-6 bg-white rounded-lg border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Thông tin giới thiệu trường</h3>
              <Button onClick={() => setShowSchoolInfoModal(true)}>
                <Edit size={18}/> Chỉnh sửa
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-xl text-gray-800">{schoolInfo.name}</h4>
                  <p className="text-gray-600 italic">{schoolInfo.slogan}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-gray-400" size={20}/>
                    <div>
                      <div className="text-sm text-gray-500">Loại hình</div>
                      <div className="font-medium">{schoolInfo.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20}/>
                    <div>
                      <div className="text-sm text-gray-500">Năm thành lập</div>
                      <div className="font-medium">{schoolInfo.established}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="text-gray-400" size={20}/>
                    <div>
                      <div className="text-sm text-gray-500">Hiệu trưởng</div>
                      <div className="font-medium">{schoolInfo.principal}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-400" size={20}/>
                  <div>
                    <div className="text-sm text-gray-500">Địa chỉ</div>
                    <div className="font-medium">{schoolInfo.address}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20}/>
                  <div>
                    <div className="text-sm text-gray-500">Điện thoại</div>
                    <div className="font-medium">{schoolInfo.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20}/>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{schoolInfo.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="text-gray-400" size={20}/>
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <div className="font-medium text-blue-600">{schoolInfo.website}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'standards' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tiêu chuẩn & Chỉ tiêu tuyển sinh</h3>
              <Button onClick={() => setShowStandardsModal(true)}>
                <Plus size={18}/> Thêm tiêu chuẩn
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standards.map(standard => (
                <div key={standard.id} className="bg-white p-6 rounded-lg border">
                  <h4 className="font-bold text-lg mb-2">{standard.name}</h4>
                  <p className="text-gray-600 mb-4">{standard.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2">Yêu cầu:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {standard.requirements.map((req, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2">Lợi ích:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {standard.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Quản lý đăng tải mạng xã hội</h3>
              <Button onClick={() => setShowSocialModal(true)}>
                <Plus size={18}/> Tạo bài viết
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPosts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {post.platform === 'facebook' && <Facebook size={18} className="text-blue-600"/>}
                      {post.platform === 'twitter' && <Twitter size={18} className="text-sky-500"/>}
                      {post.platform === 'linkedin' && <Linkedin size={18} className="text-blue-700"/>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'posted' ? 'bg-green-100 text-green-700' :
                      post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status === 'posted' ? 'Đã đăng' : 
                       post.status === 'scheduled' ? 'Lên lịch' : 'Bản nháp'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>
                  
                  {post.scheduledDate && (
                    <div className="text-xs text-gray-500 mb-3">
                      <Clock size={12} className="inline mr-1"/>
                      {new Date(post.scheduledDate).toLocaleString('vi-VN')}
                    </div>
                  )}
                  
                  {post.engagement && (
                    <div className="flex gap-3 text-xs text-gray-500 mb-3">
                      <span><TrendingUp size={12} className="inline mr-1"/> {post.engagement.likes} likes</span>
                      <span><Share2 size={12} className="inline mr-1"/> {post.engagement.shares} shares</span>
                      <span><MessageCircle size={12} className="inline mr-1"/> {post.engagement.comments} comments</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {post.status !== 'posted' && (
                      <Button size="sm" onClick={() => handleSocialPost(post)}>
                        <Send size={14}/> Đăng
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => handleViewExistingPost(post)}>
                      <Eye size={14}/> Xem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Batch Import Modal */}
      <Modal isOpen={showBatchImportModal} onClose={() => setShowBatchImportModal(false)} title="Nhập hồ sơ hàng loạt từ Excel">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn nhập liệu:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Tải file mẫu để biết định dạng yêu cầu</li>
              <li>File Excel/CSV cần có các cột: Họ và tên, Ngày sinh, Email, SĐT, Lớp đăng ký</li>
              <li>Ngày sinh định dạng DD/MM/YYYY</li>
              <li>Lớp đăng ký: 1, 6, hoặc 10</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportTemplate}>
              <Download size={18}/> Tải file mẫu
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18}/> Chọn file Excel
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleBatchImport}
            className="hidden"
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowBatchImportModal(false)}>
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* School Info Modal */}
      <Modal isOpen={showSchoolInfoModal} onClose={() => setShowSchoolInfoModal(false)} title="Chỉnh sửa thông tin trường">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên trường</label>
              <input
                type="text"
                value={schoolInfo.name}
                onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slogan</label>
              <input
                type="text"
                value={schoolInfo.slogan}
                onChange={(e) => setSchoolInfo({...schoolInfo, slogan: e.target.value})}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại hình</label>
              <select
                value={schoolInfo.type}
                onChange={(e) => setSchoolInfo({...schoolInfo, type: e.target.value})}
                className="w-full border rounded-lg p-2"
              >
                <option value="Công lập">Công lập</option>
                <option value="Tư thục">Tư thục</option>
                <option value="Quốc tế">Quốc tế</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm thành lập</label>
              <input
                type="text"
                value={schoolInfo.established}
                onChange={(e) => setSchoolInfo({...schoolInfo, established: e.target.value})}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowSchoolInfoModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => setShowSchoolInfoModal(false)}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Social Post Modal */}
      <Modal isOpen={showSocialModal} onClose={() => setShowSocialModal(false)} title="Tạo bài viết mạng xã hội">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nền tảng</label>
            <select 
              value={newSocialPost.platform}
              onChange={(e) => setNewSocialPost({...newSocialPost, platform: e.target.value as 'facebook' | 'twitter' | 'linkedin'})}
              className="w-full border rounded-lg p-2"
            >
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung bài viết</label>
            <textarea
              value={newSocialPost.content}
              onChange={(e) => setNewSocialPost({...newSocialPost, content: e.target.value})}
              className="w-full border rounded-lg p-2"
              rows={6}
              placeholder="Nhập nội dung bài viết..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hình ảnh (URL)</label>
            <input
              type="text"
              value={newSocialPost.imageUrl}
              onChange={(e) => setNewSocialPost({...newSocialPost, imageUrl: e.target.value})}
              className="w-full border rounded-lg p-2"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Lên lịch đăng</label>
            <input
              type="datetime-local"
              value={newSocialPost.scheduledDate}
              onChange={(e) => setNewSocialPost({...newSocialPost, scheduledDate: e.target.value})}
              className="w-full border rounded-lg p-2"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowSocialModal(false)}>
              Hủy
            </Button>
            <Button variant="secondary" onClick={handlePreviewPost} disabled={!newSocialPost.content.trim()}>
              <Eye size={18}/> Xem trước
            </Button>
            <Button onClick={handleCreateSocialPost} disabled={!newSocialPost.content.trim()}>
              Lưu bản nháp
            </Button>
          </div>
        </div>
      </Modal>

      {/* Social Post Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Xem trước bài viết">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              {newSocialPost.platform === 'facebook' && <Facebook size={24} className="text-blue-600"/>}
              {newSocialPost.platform === 'twitter' && <Twitter size={24} className="text-sky-500"/>}
              {newSocialPost.platform === 'linkedin' && <Linkedin size={24} className="text-blue-700"/>}
              <div>
                <div className="font-semibold">{schoolInfo.name}</div>
                <div className="text-sm text-gray-500">
                  {newSocialPost.platform === 'facebook' && 'Facebook'}
                  {newSocialPost.platform === 'twitter' && 'Twitter'}
                  {newSocialPost.platform === 'linkedin' && 'LinkedIn'}
                </div>
              </div>
            </div>
            
            {newSocialPost.imageUrl && (
              <div className="mb-3">
                <img 
                  src={newSocialPost.imageUrl} 
                  alt="Preview" 
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Image+Not+Found';
                  }}
                />
              </div>
            )}
            
            <div className="whitespace-pre-wrap text-gray-800">
              {newSocialPost.content}
            </div>
            
            {newSocialPost.scheduledDate && (
              <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                <Clock size={12} className="inline mr-1"/>
                Lên lịch: {new Date(newSocialPost.scheduledDate).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Gợi ý tối ưu:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {newSocialPost.platform === 'facebook' && (
                <>
                  <li>• Facebook cho phép tối đa 63,206 ký tự</li>
                  <li>• Kích thước ảnh đề xuất: 1200x630 pixels</li>
                  <li>• Thời gian đăng tốt nhất: 9:00 - 15:00</li>
                </>
              )}
              {newSocialPost.platform === 'twitter' && (
                <>
                  <li>• Twitter giới hạn 280 ký tự</li>
                  <li>• Kích thước ảnh đề xuất: 1200x675 pixels</li>
                  <li>• Hashtag giúp tăng tương tác</li>
                </>
              )}
              {newSocialPost.platform === 'linkedin' && (
                <>
                  <li>• LinkedIn phù hợp nội dung chuyên nghiệp</li>
                  <li>• Kích thước ảnh đề xuất: 1200x627 pixels</li>
                  <li>• Nội dung nên tập trung vào giá trị giáo dục</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setShowPreviewModal(false);
              handleCreateSocialPost();
            }}>
              <Send size={18}/> Đăng bài
            </Button>
          </div>
        </div>
      </Modal>

      {/* Existing Modals */}
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

export default EnhancedAdmissionsView;
