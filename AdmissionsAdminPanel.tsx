import React, { useState, useEffect } from 'react';
import { 
  Edit, Save, X, Plus, Trash2, Upload, Image as ImageIcon, 
  FileText, Users, BookOpen, Award, GraduationCap, MessageCircle,
  Eye, Download, Copy, RefreshCw
} from 'lucide-react';
import { Button, Modal } from './components';

interface Program {
  id: number;
  name: string;
  grade: string;
  duration: string;
  tuition: string;
  features: string[];
  image: string;
  description: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  rating: number;
  students: number;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface SchoolInfo {
  name: string;
  slogan: string;
  description: string;
  heroImage: string;
  videoUrl: string;
  phone: string;
  email: string;
  address: string;
}

const AdmissionsAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programs' | 'courses' | 'testimonials' | 'school' | 'preview'>('programs');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');

  // Function to open admissions landing page
  const openAdmissionsPage = () => {
    // Debug: Check if admissions.html exists
    console.log('Opening admissions page...');
    
    // Try multiple approaches
    const urls = [
      'http://localhost:3000/admissions.html',
      'http://127.0.0.1:3000/admissions.html',
      '/admissions.html'
    ];
    
    let opened = false;
    
    for (const url of urls) {
      if (!opened) {
        try {
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            newWindow.focus();
            opened = true;
            console.log('Successfully opened:', url);
          }
        } catch (error) {
          console.log('Failed to open:', url, error);
        }
      }
    }
    
    if (!opened) {
      // Last resort: try the system route
      window.open('/admissions', '_blank');
      console.log('Fallback: opened system route');
    }
  };

  // Function to open system admissions page
  const openSystemAdmissionsPage = () => {
    window.open('http://localhost:3000/admissions', '_blank');
  };

  // State for different content types
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: 1,
      name: 'Chương trình Tú tài',
      grade: 'Lớp 10-12',
      duration: '3 năm',
      tuition: '15.000.000 VNĐ/năm',
      features: [
        'Chương trình chuẩn Bộ GD&ĐT',
        'Song ngữ Anh - Việt',
        'CLB học thuật quốc tế',
        'Học bổng du học'
      ],
      image: 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Chương+trình+Tú+tài',
      description: 'Chương trình đào tạo toàn diện chuẩn bị cho kỳ thi THPT Quốc gia và du học'
    },
    {
      id: 2,
      name: 'Chương trình Trung học',
      grade: 'Lớp 6-9',
      duration: '4 năm',
      tuition: '12.000.000 VNĐ/năm',
      features: [
        'Phát triển tư duy phản biện',
        'Kỹ năng mềm toàn diện',
        'Hoạt động thể chất đa dạng',
        'Tư vấn hướng nghiệp sớm'
      ],
      image: 'https://via.placeholder.com/400x250/10b981/ffffff?text=Chương+trình+Trung+học',
      description: 'Xây dựng nền tảng kiến thức vững chắc và phát triển kỹ năng thế kỷ 21'
    },
    {
      id: 3,
      name: 'Chương trình Tiểu học',
      grade: 'Lớp 1-5',
      duration: '5 năm',
      tuition: '10.000.000 VNĐ/năm',
      features: [
        'Phương pháp giáo dục hiện đại',
        'Lớp học tối đa 25 học sinh',
        'Ngoại khóa đa dạng',
        'Phát triển thể chất và nghệ thuật'
      ],
      image: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Chương+trình+Tiểu+học',
      description: 'Môi trường học tập thân thiện, khơi dậy niềm đam mê học tập từ sớm'
    }
  ]);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'Luyện thi THPT Quốc gia',
      category: 'Luyện thi',
      duration: '9 tháng',
      level: 'Nâng cao',
      price: '8.000.000 VNĐ',
      instructor: 'Thầy Nguyễn Văn A',
      rating: 4.8,
      students: 156
    },
    {
      id: 2,
      title: 'Tiếng Anh giao tiếp',
      category: 'Ngoại ngữ',
      duration: '3 tháng',
      level: 'Cơ bản - Nâng cao',
      price: '3.500.000 VNĐ',
      instructor: 'Cô Trần Thị B',
      rating: 4.9,
      students: 203
    },
    {
      id: 3,
      title: 'Lập trình Python',
      category: 'Công nghệ',
      duration: '6 tháng',
      level: 'Cơ bản',
      price: '5.000.000 VNĐ',
      instructor: 'Thầy Lê Văn C',
      rating: 4.7,
      students: 89
    }
  ]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: 'Nguyễn Thị Mai',
      role: 'Phụ huynh học sinh lớp 10',
      content: 'Con tôi đã tiến bộ vượt bậc sau khi chuyển sang trường. Môi trường giáo dục tuyệt vời!',
      rating: 5
    },
    {
      id: 2,
      name: 'Trần Minh Anh',
      role: 'Học sinh lớp 12',
      content: 'Nhờ sự hướng dẫn của thầy cô, em đã đỗ trường đại học mơ ước.',
      rating: 5
    },
    {
      id: 3,
      name: 'Lê Văn Hùng',
      role: 'Cựu học sinh',
      content: 'Nền tảng từ trường đã giúp em thành công trong sự nghiệp.',
      rating: 5
    }
  ]);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: 'Trường THPT ABC',
    slogan: 'Nâng tầm tri thức - Vươn ra thế giới',
    description: 'Trường THPT ABC là cơ sở giáo dục uy tín với hơn 15 năm kinh nghiệm trong việc đào tạo và phát triển thế hệ tương lai.',
    heroImage: 'https://via.placeholder.com/1200x600/6366f1/ffffff?text=Trường+THPT+ABC',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    phone: '(028) 1234 5678',
    email: 'tuyensinh@thptabc.edu.vn',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM'
  });

  const [statistics, setStatistics] = useState([
    { id: 1, label: 'Học sinh', value: '2,500+', icon: 'Users' },
    { id: 2, label: 'Tỷ lệ tốt nghiệp', value: '98%', icon: 'GraduationCap' },
    { id: 3, label: 'Giải thưởng', value: '150+', icon: 'Award' },
    { id: 4, label: 'Khóa học', value: '50+', icon: 'BookOpen' }
  ]);

  const handleAdd = (type: string) => {
    setModalType('add');
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any, type: string) => {
    setModalType('edit');
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: number, type: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      switch (type) {
        case 'programs':
          setPrograms(programs.filter(p => p.id !== id));
          break;
        case 'courses':
          setCourses(courses.filter(c => c.id !== id));
          break;
        case 'testimonials':
          setTestimonials(testimonials.filter(t => t.id !== id));
          break;
      }
    }
  };

  const handleSave = (data: any, type: string) => {
    switch (type) {
      case 'programs':
        if (modalType === 'add') {
          setPrograms([...programs, { ...data, id: Date.now() }]);
        } else {
          setPrograms(programs.map(p => p.id === data.id ? data : p));
        }
        break;
      case 'courses':
        if (modalType === 'add') {
          setCourses([...courses, { ...data, id: Date.now() }]);
        } else {
          setCourses(courses.map(c => c.id === data.id ? data : c));
        }
        break;
      case 'testimonials':
        if (modalType === 'add') {
          setTestimonials([...testimonials, { ...data, id: Date.now() }]);
        } else {
          setTestimonials(testimonials.map(t => t.id === data.id ? data : t));
        }
        break;
    }
    
    // Update data file
    updateDataFile();
    setShowModal(false);
    setEditingItem(null);
  };

  const updateDataFile = () => {
    const data = {
      school: schoolInfo,
      statistics,
      programs,
      courses,
      testimonials,
      contact: {
        phone: schoolInfo.phone,
        hotline: '1900-xxxx',
        email: schoolInfo.email,
        infoEmail: 'info@thptabc.edu.vn',
        address: schoolInfo.address,
        workingHours: 'Đón học sinh từ 7:00 - 17:00'
      },
      seo: {
        title: `Tuyển sinh 2024-2025 - ${schoolInfo.name}`,
        description: schoolInfo.description,
        keywords: 'tuyển sinh, trường thpt, giáo dục, học tập',
        ogImage: schoolInfo.heroImage
      }
    };

    // Create JavaScript content
    const jsContent = `// Admissions Data - Shared between React component and HTML page
window.ADMISSIONS_DATA = ${JSON.stringify(data, null, 2)};

// Helper functions for dynamic content loading
window.loadAdmissionsData = function() {
  return window.ADMISSIONS_DATA;
};

window.updateAdmissionsData = function(newData) {
  window.ADMISSIONS_DATA = { ...window.ADMISSIONS_DATA, ...newData };
  // Trigger update event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admissionsDataUpdated', { 
      detail: window.ADMISSIONS_DATA 
    }));
  }
};

// Initialize data on load
if (typeof window !== 'undefined') {
  // Data is already loaded via script tag
  console.log('Admissions data loaded successfully');
}`;

    // Create blob and download
    const blob = new Blob([jsContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admissions-data.js';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('File admissions-data.js đã được cập nhật! Vui lòng copy file này vào thư mục public/ để đồng bộ nội dung.');
  };

  const exportData = () => {
    const data = {
      programs,
      courses,
      testimonials,
      schoolInfo,
      statistics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admissions_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.programs) setPrograms(data.programs);
          if (data.courses) setCourses(data.courses);
          if (data.testimonials) setTestimonials(data.testimonials);
          if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
          if (data.statistics) setStatistics(data.statistics);
          alert('Import dữ liệu thành công!');
        } catch (error) {
          alert('Lỗi import dữ liệu!');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderModal = () => {
    if (!showModal) return null;

    const renderContent = () => {
      switch (activeTab) {
        case 'programs':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'add' ? 'Thêm chương trình mới' : 'Chỉnh sửa chương trình'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên chương trình</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.name || ''}
                    className="w-full border rounded-lg p-2"
                    id="programName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Khối lớp</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.grade || ''}
                    className="w-full border rounded-lg p-2"
                    id="programGrade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.duration || ''}
                    className="w-full border rounded-lg p-2"
                    id="programDuration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Học phí</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.tuition || ''}
                    className="w-full border rounded-lg p-2"
                    id="programTuition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  defaultValue={editingItem?.description || ''}
                  className="w-full border rounded-lg p-2"
                  rows={3}
                  id="programDescription"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL hình ảnh</label>
                <input
                  type="text"
                  defaultValue={editingItem?.image || ''}
                  className="w-full border rounded-lg p-2"
                  id="programImage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đặc điểm (mỗi dòng một)</label>
                <textarea
                  defaultValue={editingItem?.features?.join('\n') || ''}
                  className="w-full border rounded-lg p-2"
                  rows={4}
                  id="programFeatures"
                />
              </div>
            </div>
          );

        case 'courses':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'add' ? 'Thêm khóa học mới' : 'Chỉnh sửa khóa học'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên khóa học</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.title || ''}
                    className="w-full border rounded-lg p-2"
                    id="courseTitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.category || ''}
                    className="w-full border rounded-lg p-2"
                    id="courseCategory"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời lượng</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.duration || ''}
                    className="w-full border rounded-lg p-2"
                    id="courseDuration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trình độ</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.level || ''}
                    className="w-full border rounded-lg p-2"
                    id="courseLevel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.price || ''}
                    className="w-full border rounded-lg p-2"
                    id="coursePrice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảng viên</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.instructor || ''}
                    className="w-full border rounded-lg p-2"
                    id="courseInstructor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    defaultValue={editingItem?.rating || 5}
                    className="w-full border rounded-lg p-2"
                    id="courseRating"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số học viên</label>
                  <input
                    type="number"
                    defaultValue={editingItem?.students || 0}
                    className="w-full border rounded-lg p-2"
                    id="courseStudents"
                  />
                </div>
              </div>
            </div>
          );

        case 'testimonials':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'add' ? 'Thêm testimonial mới' : 'Chỉnh sửa testimonial'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.name || ''}
                    className="w-full border rounded-lg p-2"
                    id="testimonialName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.role || ''}
                    className="w-full border rounded-lg p-2"
                    id="testimonialRole"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nội dung</label>
                <textarea
                  defaultValue={editingItem?.content || ''}
                  className="w-full border rounded-lg p-2"
                  rows={4}
                  id="testimonialContent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingItem?.rating || 5}
                  className="w-full border rounded-lg p-2"
                  id="testimonialRating"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    const handleModalSave = () => {
      let data: any = {};

      switch (activeTab) {
        case 'programs':
          data = {
            id: editingItem?.id || Date.now(),
            name: (document.getElementById('programName') as HTMLInputElement)?.value,
            grade: (document.getElementById('programGrade') as HTMLInputElement)?.value,
            duration: (document.getElementById('programDuration') as HTMLInputElement)?.value,
            tuition: (document.getElementById('programTuition') as HTMLInputElement)?.value,
            description: (document.getElementById('programDescription') as HTMLTextAreaElement)?.value,
            image: (document.getElementById('programImage') as HTMLInputElement)?.value,
            features: (document.getElementById('programFeatures') as HTMLTextAreaElement)?.value.split('\n').filter(f => f.trim())
          };
          break;

        case 'courses':
          data = {
            id: editingItem?.id || Date.now(),
            title: (document.getElementById('courseTitle') as HTMLInputElement)?.value,
            category: (document.getElementById('courseCategory') as HTMLInputElement)?.value,
            duration: (document.getElementById('courseDuration') as HTMLInputElement)?.value,
            level: (document.getElementById('courseLevel') as HTMLInputElement)?.value,
            price: (document.getElementById('coursePrice') as HTMLInputElement)?.value,
            instructor: (document.getElementById('courseInstructor') as HTMLInputElement)?.value,
            rating: parseFloat((document.getElementById('courseRating') as HTMLInputElement)?.value || '5'),
            students: parseInt((document.getElementById('courseStudents') as HTMLInputElement)?.value || '0')
          };
          break;

        case 'testimonials':
          data = {
            id: editingItem?.id || Date.now(),
            name: (document.getElementById('testimonialName') as HTMLInputElement)?.value,
            role: (document.getElementById('testimonialRole') as HTMLInputElement)?.value,
            content: (document.getElementById('testimonialContent') as HTMLTextAreaElement)?.value,
            rating: parseInt((document.getElementById('testimonialRating') as HTMLInputElement)?.value || '5')
          };
          break;
      }

      handleSave(data, activeTab);
    };

    return (
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="" size="large">
        {renderContent()}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleModalSave}>
            <Save size={18} className="mr-2"/>
            Lưu
          </Button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý nội dung Tuyển sinh</h1>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={updateDataFile}>
                <RefreshCw size={18} className="mr-2"/>
                Đồng bộ dữ liệu
              </Button>
              <Button variant="secondary" onClick={exportData}>
                <Download size={18} className="mr-2"/>
                Export dữ liệu
              </Button>
              <label className="cursor-pointer">
                <Button variant="secondary" className="flex items-center">
                  <Upload size={18} className="mr-2"/>
                  Import dữ liệu
                </Button>
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
              <Button onClick={openAdmissionsPage} className="bg-green-600 text-white hover:bg-green-700">
                <Eye size={18} className="mr-2"/>
                Xem trang công khai
              </Button>
              <Button onClick={openSystemAdmissionsPage} className="bg-blue-600 text-white hover:bg-blue-700">
                <Users size={18} className="mr-2"/>
                Xem trang hệ thống
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'programs', label: 'Chương trình', icon: <GraduationCap size={18} /> },
                { id: 'courses', label: 'Khóa học', icon: <BookOpen size={18} /> },
                { id: 'testimonials', label: 'Testimonials', icon: <MessageCircle size={18} /> },
                { id: 'school', label: 'Thông tin trường', icon: <Users size={18} /> },
                { id: 'preview', label: 'Xem trước', icon: <Eye size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'programs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Chương trình đào tạo</h2>
                  <Button onClick={() => handleAdd('programs')}>
                    <Plus size={18} className="mr-2"/>
                    Thêm chương trình
                  </Button>
                </div>
                <div className="grid gap-4">
                  {programs.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          <p className="text-gray-600">{program.grade} • {program.duration}</p>
                          <p className="text-blue-600 font-medium">{program.tuition}</p>
                          <p className="text-sm text-gray-500 mt-2">{program.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(program, 'programs')}>
                            <Edit size={16}/>
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleDelete(program.id, 'programs')}>
                            <Trash2 size={16}/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Khóa học</h2>
                  <Button onClick={() => handleAdd('courses')}>
                    <Plus size={18} className="mr-2"/>
                    Thêm khóa học
                  </Button>
                </div>
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-gray-600">{course.category} • {course.level}</p>
                          <p className="text-blue-600 font-medium">{course.price}</p>
                          <p className="text-sm text-gray-500">Giảng viên: {course.instructor}</p>
                          <p className="text-sm text-gray-500">Rating: {course.rating} • {course.students} học viên</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(course, 'courses')}>
                            <Edit size={16}/>
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleDelete(course.id, 'courses')}>
                            <Trash2 size={16}/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Testimonials</h2>
                  <Button onClick={() => handleAdd('testimonials')}>
                    <Plus size={18} className="mr-2"/>
                    Thêm testimonial
                  </Button>
                </div>
                <div className="grid gap-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-gray-600">{testimonial.role}</p>
                          <p className="text-sm text-gray-500 mt-2">"{testimonial.content}"</p>
                          <div className="flex mt-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-500">★</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(testimonial, 'testimonials')}>
                            <Edit size={16}/>
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleDelete(testimonial.id, 'testimonials')}>
                            <Trash2 size={16}/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'school' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Thông tin trường</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên trường</label>
                    <input
                      type="text"
                      value={schoolInfo.name}
                      onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slogan</label>
                    <input
                      type="text"
                      value={schoolInfo.slogan}
                      onChange={(e) => setSchoolInfo({...schoolInfo, slogan: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Mô tả</label>
                    <textarea
                      value={schoolInfo.description}
                      onChange={(e) => setSchoolInfo({...schoolInfo, description: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                    <input
                      type="text"
                      value={schoolInfo.heroImage}
                      onChange={(e) => setSchoolInfo({...schoolInfo, heroImage: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Video URL</label>
                    <input
                      type="text"
                      value={schoolInfo.videoUrl}
                      onChange={(e) => setSchoolInfo({...schoolInfo, videoUrl: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Điện thoại</label>
                    <input
                      type="text"
                      value={schoolInfo.phone}
                      onChange={(e) => setSchoolInfo({...schoolInfo, phone: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={schoolInfo.email}
                      onChange={(e) => setSchoolInfo({...schoolInfo, email: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      value={schoolInfo.address}
                      onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="text-center py-12">
                <Eye size={48} className="mx-auto text-gray-400 mb-4"/>
                <h3 className="text-xl font-semibold mb-2">Xem trước trang tuyển sinh</h3>
                <p className="text-gray-600 mb-6">Chọn trang bạn muốn xem để kiểm tra nội dung đã cập nhật</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button onClick={openAdmissionsPage} className="bg-green-600 text-white hover:bg-green-700">
                    <Eye size={18} className="mr-2"/>
                    Mở trang công khai (HTML)
                  </Button>
                  <Button onClick={openSystemAdmissionsPage} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Users size={18} className="mr-2"/>
                    Mở trang hệ thống (React)
                  </Button>
                </div>
                <div className="mt-8 text-sm text-gray-500">
                  <p><strong>Trang công khai:</strong> Dành cho phụ huynh/học sinh, không cần đăng nhập</p>
                  <p><strong>Trang hệ thống:</strong> Trong hệ thống EduManager, cần đăng nhập</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default AdmissionsAdminPanel;
