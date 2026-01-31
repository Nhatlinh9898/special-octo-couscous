import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, FileText, CheckCircle2, Circle, Clock, Plus, BarChart2, Loader2, Microscope,
  Upload, Download, Eye, Edit, Trash2, Calendar, Target, TrendingUp, Users, DollarSign,
  FilePlus, FolderOpen, FileCheck, AlertCircle, ChevronRight, Search, Filter
} from 'lucide-react';
import { api } from './data';
import { ResearchProject, ResearchProgress, ResearchFile, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const ResearchView = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'files' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Progress modal state
  const [progressForm, setProgressForm] = useState({
    progressPercentage: 0,
    description: '',
    achievements: [''],
    challenges: [''],
    nextSteps: ['']
  });
  
  // File upload state
  const [fileForm, setFileForm] = useState({
    fileName: '',
    fileType: 'document' as ResearchFile['fileType'],
    description: '',
    isPublic: true
  });
  
  // AI
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  // Handler functions
  const handleViewProject = (project: ResearchProject) => {
    console.log('View project button clicked for project:', project.id);
    setSelectedProject(project);
    setShowProjectDetail(true);
    setActiveTab('overview');
  };

  const handleUpdateProgress = () => {
    if (!selectedProject) return;
    
    const newProgress: ResearchProgress = {
      id: Date.now(),
      projectId: selectedProject.id,
      date: new Date().toISOString().split('T')[0],
      progressPercentage: progressForm.progressPercentage,
      description: progressForm.description,
      achievements: progressForm.achievements.filter(a => a.trim()),
      challenges: progressForm.challenges.filter(c => c.trim()),
      nextSteps: progressForm.nextSteps.filter(n => n.trim()),
      updatedBy: 'Người dùng hiện tại',
      files: []
    };

    // Update project progress and history
    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          progress: progressForm.progressPercentage,
          progressHistory: [...p.progressHistory, newProgress],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject({
      ...selectedProject,
      progress: progressForm.progressPercentage,
      progressHistory: [...selectedProject.progressHistory, newProgress],
      updatedAt: new Date().toISOString()
    });

    setShowProgressModal(false);
    alert('Đã cập nhật tiến trình đề tài!');
  };

  const handleUploadFile = () => {
    if (!selectedProject) return;
    
    const newFile: ResearchFile = {
      id: Date.now(),
      projectId: selectedProject.id,
      fileName: fileForm.fileName,
      fileType: fileForm.fileType,
      fileSize: Math.floor(Math.random() * 10000000), // Mock file size
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Người dùng hiện tại',
      description: fileForm.description,
      downloadUrl: `/files/${fileForm.fileName}`,
      isPublic: fileForm.isPublic
    };

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        const updatedFiles = [...p.files, newFile];
        return {
          ...p,
          files: updatedFiles,
          [fileForm.fileType === 'report' ? 'reports' : 'finalFiles']: 
            fileForm.fileType === 'report' ? [...p.reports, newFile] : 
            fileForm.fileType === 'article' ? [...p.finalFiles, newFile] : updatedFiles,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setShowFileUploadModal(false);
    alert('Đã tải lên file thành công!');
  };

  const handleDeleteFile = (fileId: number) => {
    if (!selectedProject) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          files: p.files.filter(f => f.id !== fileId),
          reports: p.reports.filter(f => f.id !== fileId),
          finalFiles: p.finalFiles.filter(f => f.id !== fileId),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject({
      ...selectedProject,
      files: selectedProject.files.filter(f => f.id !== fileId),
      reports: selectedProject.reports.filter(f => f.id !== fileId),
      finalFiles: selectedProject.finalFiles.filter(f => f.id !== fileId),
      updatedAt: new Date().toISOString()
    });

    alert('Đã xóa file thành công!');
  };

  const handleAIScan = async () => {
    setIsScanning(true);
    try {
      const res = await aiService.research.identifyTrends();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsScanning(false); }
  };

  const getStatusColor = (status: ResearchProject['status']) => {
     switch(status) {
        case 'Proposal': return 'text-purple-600 bg-purple-100';
        case 'Approved': return 'text-blue-600 bg-blue-100';
        case 'Ongoing': return 'text-orange-600 bg-orange-100';
        case 'Completed': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
     }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: ResearchFile['fileType']) => {
    switch(fileType) {
      case 'document': return <FileText size={16} className="text-blue-500" />;
      case 'report': return <FileCheck size={16} className="text-green-500" />;
      case 'article': return <FileText size={16} className="text-purple-500" />;
      case 'presentation': return <FileText size={16} className="text-orange-500" />;
      case 'data': return <FileText size={16} className="text-gray-500" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const addArrayItem = (field: 'achievements' | 'challenges' | 'nextSteps') => {
    setProgressForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'achievements' | 'challenges' | 'nextSteps', index: number) => {
    setProgressForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'achievements' | 'challenges' | 'nextSteps', index: number, value: string) => {
    setProgressForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Nghiên cứu Khoa học</h2>
           <p className="text-gray-500">Quản lý dự án STEM và đề tài nghiên cứu</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100"
             onClick={handleAIScan}
             disabled={isScanning}
           >
             {isScanning ? <Loader2 size={18} className="animate-spin"/> : <Microscope size={18}/>}
             {isScanning ? 'AI Đang quét...' : 'AI Xu hướng STEM'}
           </Button>
           <Button><Plus size={20}/> Đăng ký Đề tài</Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đề tài, chủ nhiệm, lĩnh vực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Proposal">Đề xuất</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Ongoing">Đang thực hiện</option>
            <option value="Completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {filteredProjects.map(proj => (
            <div key={proj.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(proj.status)}`}>
                     {proj.status === 'Proposal' ? 'Đề xuất' : proj.status === 'Approved' ? 'Đã duyệt' : proj.status === 'Ongoing' ? 'Đang thực hiện' : 'Hoàn thành'}
                  </span>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                     <Clock size={14}/> {proj.startDate}
                  </div>
               </div>
               
               <h3 className="text-lg font-bold text-gray-800 mb-2">{proj.title}</h3>
               <p className="text-sm text-gray-600 mb-4">Lĩnh vực: <span className="font-medium text-indigo-600">{proj.field}</span></p>
               
               <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Chủ nhiệm:</span>
                     <span className="font-medium text-gray-800">{proj.leaderName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Thành viên:</span>
                     <span className="font-medium text-gray-800">{proj.members} người</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Ngân sách:</span>
                     <span className="font-bold text-gray-800">{formatCurrency(proj.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Files:</span>
                     <span className="font-medium text-gray-800">{proj.files.length} file</span>
                  </div>
               </div>

               <div className="mb-4">
                  <div className="flex justify-between items-end mb-1">
                     <span className="text-xs font-semibold text-gray-500">Tiến độ</span>
                     <span className="text-xs font-bold text-indigo-600">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                     <div 
                        className={`h-2 rounded-full transition-all duration-500 ${proj.status === 'Completed' ? 'bg-green-500' : 'bg-indigo-500'}`} 
                        style={{width: `${proj.progress}%`}}
                     ></div>
                  </div>
               </div>

               <div className="mt-auto flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => handleViewProject(proj)}
                    className="flex-1"
                  >
                    <Eye size={14} className="mr-1" /> Xem chi tiết
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      console.log('Update progress button clicked for project:', proj.id);
                      setSelectedProject(proj);
                      setShowProgressModal(true);
                      setProgressForm({
                        progressPercentage: proj.progress,
                        description: '',
                        achievements: [''],
                        challenges: [''],
                        nextSteps: ['']
                      });
                    }}
                  >
                    <TrendingUp size={14} className="mr-1" /> Cập nhật
                  </Button>
               </div>
            </div>
         ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy đề tài nào</h3>
          <p className="text-gray-500">Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {/* Progress Update Modal */}
      {console.log('Progress modal render check - showProgressModal:', showProgressModal, 'selectedProject:', selectedProject?.id)}
      {showProgressModal && selectedProject && (
        <Modal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} title="Cập nhật tiến trình đề tài">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedProject.title}</h4>
              <p className="text-sm text-gray-600">Tiến độ hiện tại: {selectedProject.progress}%</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiến độ (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progressForm.progressPercentage}
                onChange={(e) => setProgressForm({...progressForm, progressPercentage: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tiến trình</label>
              <textarea
                value={progressForm.description}
                onChange={(e) => setProgressForm({...progressForm, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                placeholder="Mô tả chi tiết về tiến trình hiện tại..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target size={16} className="inline mr-1" /> Thành tựu đạt được
              </label>
              {progressForm.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nhập thành tựu..."
                  />
                  {progressForm.achievements.length > 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeArrayItem('achievements', index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => addArrayItem('achievements')}
                className="w-full"
              >
                <Plus size={14} className="mr-1" /> Thêm thành tựu
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle size={16} className="inline mr-1" /> Thách thức gặp phải
              </label>
              {progressForm.challenges.map((challenge, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={challenge}
                    onChange={(e) => updateArrayItem('challenges', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nhập thách thức..."
                  />
                  {progressForm.challenges.length > 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeArrayItem('challenges', index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => addArrayItem('challenges')}
                className="w-full"
              >
                <Plus size={14} className="mr-1" /> Thêm thách thức
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ChevronRight size={16} className="inline mr-1" /> Kế hoạch tiếp theo
              </label>
              {progressForm.nextSteps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateArrayItem('nextSteps', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nhập kế hoạch..."
                  />
                  {progressForm.nextSteps.length > 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeArrayItem('nextSteps', index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => addArrayItem('nextSteps')}
                className="w-full"
              >
                <Plus size={14} className="mr-1" /> Thêm kế hoạch
              </Button>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowProgressModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateProgress}>
                <TrendingUp size={16} className="mr-1" /> Cập nhật tiến trình
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* File Upload Modal */}
      {console.log('File upload modal render check - showFileUploadModal:', showFileUploadModal, 'selectedProject:', selectedProject?.id)}
      {showFileUploadModal && selectedProject && (
        <Modal isOpen={showFileUploadModal} onClose={() => setShowFileUploadModal(false)} title="Tải lên file nghiên cứu">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedProject.title}</h4>
              <p className="text-sm text-gray-600">Tải lên file cho đề tài này</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên file *</label>
              <input
                type="text"
                value={fileForm.fileName}
                onChange={(e) => setFileForm({...fileForm, fileName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nhập tên file..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại file</label>
              <select
                value={fileForm.fileType}
                onChange={(e) => setFileForm({...fileForm, fileType: e.target.value as ResearchFile['fileType']})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="document">Tài liệu</option>
                <option value="report">Báo cáo</option>
                <option value="article">Bài viết khoa học</option>
                <option value="presentation">Trình chiếu</option>
                <option value="data">Dữ liệu nghiên cứu</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={fileForm.description}
                onChange={(e) => setFileForm({...fileForm, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                placeholder="Mô tả nội dung file..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={fileForm.isPublic}
                onChange={(e) => setFileForm({...fileForm, isPublic: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Cho phép mọi người xem file này
              </label>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Kéo và thả file vào đây hoặc click để chọn</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 10MB)</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowFileUploadModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleUploadFile} disabled={!fileForm.fileName}>
                <Upload size={16} className="mr-1" /> Tải lên
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Project Detail Modal */}
      {console.log('Project detail modal render check - showProjectDetail:', showProjectDetail, 'selectedProject:', selectedProject?.id)}
      {showProjectDetail && selectedProject && (
        <Modal 
          isOpen={showProjectDetail} 
          onClose={() => setShowProjectDetail(false)} 
          title={selectedProject.title}
          size="large"
        >
          <div className="space-y-6">
            {/* Project Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status === 'Proposal' ? 'Đề xuất' : selectedProject.status === 'Approved' ? 'Đã duyệt' : selectedProject.status === 'Ongoing' ? 'Đang thực hiện' : 'Hoàn thành'}
                </span>
                <div className="text-sm text-gray-500">
                  <Calendar size={14} className="inline mr-1" />
                  {selectedProject.startDate} {selectedProject.endDate && `- ${selectedProject.endDate}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Chủ nhiệm:</span>
                  <span className="font-medium text-gray-800 ml-2">{selectedProject.leaderName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Lĩnh vực:</span>
                  <span className="font-medium text-indigo-600 ml-2">{selectedProject.field}</span>
                </div>
                <div>
                  <span className="text-gray-500">Thành viên:</span>
                  <span className="font-medium text-gray-800 ml-2">{selectedProject.members} người</span>
                </div>
                <div>
                  <span className="text-gray-500">Ngân sách:</span>
                  <span className="font-bold text-gray-800 ml-2">{formatCurrency(selectedProject.budget)}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: <FlaskConical size={16} /> },
                  { id: 'progress', label: 'Tiến trình', icon: <TrendingUp size={16} /> },
                  { id: 'files', label: 'Tài liệu', icon: <FolderOpen size={16} /> },
                  { id: 'reports', label: 'Báo cáo', icon: <FileCheck size={16} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Mô tả đề tài</h4>
                    <p className="text-gray-600">{selectedProject.description || 'Chưa có mô tả chi tiết.'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Mục tiêu nghiên cứu</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedProject.objectives?.length > 0 ? 
                        selectedProject.objectives.map((obj, idx) => <li key={idx}>{obj}</li>) :
                        <li>Chưa có mục tiêu cụ thể.</li>
                      }
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Phương pháp luận</h4>
                    <p className="text-gray-600">{selectedProject.methodology || 'Chưa có phương pháp luận chi tiết.'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Kết quả dự kiến</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedProject.expectedOutcomes?.length > 0 ? 
                        selectedProject.expectedOutcomes.map((outcome, idx) => <li key={idx}>{outcome}</li>) :
                        <li>Chưa có kết quả dự kiến.</li>
                      }
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">Lịch sử cập nhật tiến trình</h4>
                    <Button 
                      size="sm"
                      onClick={() => {
                        console.log('Update progress button clicked in modal');
                        setShowProgressModal(true);
                        setProgressForm({
                          progressPercentage: selectedProject.progress,
                          description: '',
                          achievements: [''],
                          challenges: [''],
                          nextSteps: ['']
                        });
                      }}
                    >
                      <Plus size={14} className="mr-1" /> Cập nhật tiến trình
                    </Button>
                  </div>
                  
                  {selectedProject.progressHistory?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedProject.progressHistory.map((progress, idx) => (
                        <div key={progress.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800">{progress.progressPercentage}%</span>
                                <span className="text-sm text-gray-500">{progress.date}</span>
                              </div>
                              <p className="text-sm text-gray-600">{progress.description}</p>
                            </div>
                            <span className="text-xs text-gray-500">Cập nhật bởi: {progress.updatedBy}</span>
                          </div>
                          
                          {progress.achievements.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Thành tựu:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {progress.achievements.map((achievement, i) => (
                                  <li key={i}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {progress.challenges.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Thách thức:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {progress.challenges.map((challenge, i) => (
                                  <li key={i}>{challenge}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {progress.nextSteps.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Kế hoạch tiếp theo:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {progress.nextSteps.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Chưa có cập nhật tiến trình nào.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">Tài liệu nghiên cứu</h4>
                    <Button 
                      size="sm"
                      onClick={() => {
                        console.log('Upload file button clicked');
                        setShowFileUploadModal(true);
                      }}
                    >
                      <Upload size={14} className="mr-1" /> Tải lên file
                    </Button>
                  </div>
                  
                  {selectedProject.files?.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedProject.files.map((file) => (
                        <div key={file.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.fileType)}
                            <div>
                              <h5 className="font-medium text-gray-800">{file.fileName}</h5>
                              <p className="text-sm text-gray-500">{file.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span>{file.uploadDate}</span>
                                <span>Tải lên bởi: {file.uploadedBy}</span>
                                {file.isPublic && <span className="text-green-600">Công khai</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary">
                              <Download size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Chưa có tài liệu nào.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">Báo cáo và bài viết</h4>
                    <Button 
                      size="sm"
                      onClick={() => {
                        console.log('Add report button clicked');
                        setShowFileUploadModal(true);
                        setFileForm({...fileForm, fileType: 'report'});
                      }}
                    >
                      <FilePlus size={14} className="mr-1" /> Thêm báo cáo
                    </Button>
                  </div>
                  
                  {selectedProject.reports?.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedProject.reports.map((report) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileCheck size={16} className="text-green-500" />
                              <div>
                                <h5 className="font-medium text-gray-800">{report.fileName}</h5>
                                <p className="text-sm text-gray-500">{report.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                  <span>{formatFileSize(report.fileSize)}</span>
                                  <span>{report.uploadDate}</span>
                                  <span>Tải lên bởi: {report.uploadedBy}</span>
                                  {report.isPublic && <span className="text-green-600">Công khai</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="secondary">
                                <Eye size={14} />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Download size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleDeleteFile(report.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Chưa có báo cáo nào.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Xu hướng Nghiên cứu (Research AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <h4 className="font-bold text-teal-800 mb-2">{aiResult.title}</h4>
                  <p className="text-teal-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-teal-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Định hướng đề tài:</h5>
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

export default ResearchView;
