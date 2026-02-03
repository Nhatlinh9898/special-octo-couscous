import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Building2, Phone, Mail, Calendar, Users2, Loader2, Plus, MapPin, Clock, DollarSign, Award, UserPlus } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { Alumnus, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import PaymentModal from './PaymentModal';

const AlumniView = () => {
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // AI States
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<AIAnalysisResult | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showGenerateAlumniModal, setShowGenerateAlumniModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Form States
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'Reunion'
  });
  const [donationForm, setDonationForm] = useState({
    amount: '',
    purpose: 'General',
    message: '',
    anonymous: false
  });

  useEffect(() => {
    api.getAlumni().then(setAlumni);
    
    // Listen for payment modal events
    const handlePaymentEvent = (event: any) => {
      setPaymentData(event.detail);
      setShowPaymentModal(true);
    };
    
    window.addEventListener('openPaymentModal', handlePaymentEvent);
    
    return () => {
      window.removeEventListener('openPaymentModal', handlePaymentEvent);
    };
  }, []);

  const handleAIMatch = async () => {
    setIsMatching(true);
    try {
      const result = await aiService.alumni.matchMentors();
      setMatchResult(result);
      setShowMatchModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  const handleCreateEvent = () => {
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      attendees: 0,
      status: 'Upcoming'
    };
    
    // In a real app, this would save to backend
    console.log('New event created:', newEvent);
    setShowEventModal(false);
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      type: 'Reunion'
    });
    alert('Đã tạo sự kiện thành công!');
  };

  const handleDonation = () => {
    if (!donationForm.amount || parseFloat(donationForm.amount) < 10000) {
      alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 10,000 VNĐ)');
      return;
    }

    const donation = {
      id: Date.now(),
      ...donationForm,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      type: 'Donation',
      recipient: 'Quỹ trường',
      description: `Đóng góp ${donationForm.purpose === 'General' ? 'Quỹ chung' : 
                    donationForm.purpose === 'Infrastructure' ? 'Cơ sở vật chất' :
                    donationForm.purpose === 'Scholarship' ? 'Học bổng' :
                    donationForm.purpose === 'Library' ? 'Thư viện' : 'Thể thao'}`
    };
    
    // Lưu vào localStorage cho FinanceView
    const existingTransactions = JSON.parse(localStorage.getItem('financialTransactions') || '[]');
    const newTransaction = {
      id: donation.id,
      type: 'income',
      category: 'Donation',
      amount: parseFloat(donationForm.amount),
      description: donation.description,
      date: donation.date,
      status: 'Pending',
      paymentMethod: 'pending',
      recipient: donation.recipient,
      purpose: donation.purpose,
      message: donation.message,
      anonymous: donation.anonymous,
      donorName: donation.anonymous ? 'Ẩn danh' : 'Cựu học sinh'
    };
    
    existingTransactions.push(newTransaction);
    localStorage.setItem('financialTransactions', JSON.stringify(existingTransactions));
    
    // Đóng modal donation và mở modal thanh toán
    setShowDonationModal(false);
    
    // Trigger payment modal
    const paymentEvent = new CustomEvent('openPaymentModal', {
      detail: {
        type: 'Donation',
        amount: parseFloat(donationForm.amount),
        description: donation.description,
        recipient: 'Quỹ trường',
        transactionId: donation.id
      }
    });
    window.dispatchEvent(paymentEvent);
    
    // Reset form
    setDonationForm({
      amount: '',
      purpose: 'General',
      message: '',
      anonymous: false
    });
  };

  const handleGenerateAlumni = () => {
    // Generate mock alumni from students
    const mockAlumni = MOCK_STUDENTS.slice(0, 8).map((student, index) => {
      const graduationYear = 2020 + index; // Simulate different graduation years
      const currentYear = new Date().getFullYear();
      const yearsSinceGraduation = currentYear - graduationYear;
      
      // Mock career data based on student
      const careers = [
        { job: 'Software Engineer', company: 'Tech Corp Vietnam', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@techcorp.vn` },
        { job: 'Product Manager', company: 'FPT Software', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@fpt.com` },
        { job: 'Data Scientist', company: 'VNG Corporation', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@vng.com.vn` },
        { job: 'Business Analyst', company: 'TMA Solutions', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@tma.vn` },
        { job: 'Project Manager', company: 'KMS Technology', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@kms-technology.com` },
        { job: 'UX Designer', company: 'Coc Coc', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@coccoc.com` },
        { job: 'Marketing Manager', company: 'The Gioi Di Dong', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@tgdd.vn` },
        { job: 'Financial Analyst', company: 'VPBank', email: `${student.fullName.toLowerCase().replace(/\s/g, '.')}@vpbank.com` }
      ];
      
      const career = careers[index % careers.length];
      
      return {
        id: Date.now() + index,
        fullName: student.fullName,
        graduationYear: graduationYear.toString(),
        currentJob: career.job,
        company: career.company,
        email: career.email,
        phone: `09${Math.floor(Math.random() * 900000000) + 100000000}`,
        avatar: `https://picsum.photos/seed/${student.fullName}/100/100`,
        achievements: yearsSinceGraduation > 3 ? ['Best Employee 2022', 'Team Leader'] : ['Rising Star'],
        linkedIn: `https://linkedin.com/in/${student.fullName.toLowerCase().replace(/\s/g, '-')}`,
        bio: `Cựu học sinh niên khóa ${graduationYear}, hiện đang làm việc tại ${career.company} với vị trí ${career.job}.`
      };
    });
    
    setAlumni([...alumni, ...mockAlumni]);
    setShowGenerateAlumniModal(false);
    alert(`Đã tạo thành công ${mockAlumni.length} cựu học sinh từ danh sách học sinh!`);
  };

  const handleViewEventDetail = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const filteredAlumni = alumni.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Mạng lưới Cựu học sinh</h2>
           <p className="text-gray-500">Kết nối và theo dõi thành công của cựu học sinh</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
             onClick={handleAIMatch}
             disabled={isMatching}
           >
             {isMatching ? <Loader2 size={18} className="animate-spin"/> : <Users2 size={18}/>}
             {isMatching ? 'AI Đang tìm kiếm...' : 'AI Kết nối Mentor'}
           </Button>
           <Button 
             onClick={() => setShowGenerateAlumniModal(true)}
             variant="secondary"
             className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
           >
             <UserPlus size={18}/> Tạo Cựu HS tự động
           </Button>
           <Button onClick={() => setShowEventModal(true)}>
             <Calendar size={18}/> Tổ chức Sự kiện
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Alumni List */}
         <div className="flex-1 space-y-6">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
               <input 
                  type="text" 
                  placeholder="Tìm kiếm cựu học sinh, công ty..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {filteredAlumni.map(person => (
                  <div key={person.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
                     <img src={person.avatar} alt={person.fullName} className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover"/>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg">{person.fullName}</h3>
                        <p className="text-indigo-600 font-medium text-sm mb-2">Niên khóa {person.graduationYear}</p>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                           <div className="flex items-center gap-2 truncate" title={person.currentJob}>
                              <Building2 size={14} className="text-gray-400"/>
                              {person.currentJob} tại <span className="font-semibold">{person.company}</span>
                           </div>
                           <div className="flex items-center gap-2 truncate">
                              <Mail size={14} className="text-gray-400"/>
                              {person.email}
                           </div>
                           <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400"/>
                              {person.phone}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Events */}
         <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-600"/> Sự kiện sắp tới
               </h3>
               
               <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                     <div className="text-xs font-bold text-indigo-600 uppercase mb-1">15 Tháng 11, 2023</div>
                     <h4 className="font-bold text-gray-800 mb-1">Họp mặt Niên khóa 2010</h4>
                     <p className="text-sm text-gray-500">Tại Hội trường A, 18:00 - 21:00</p>
                     <button 
                       className="mt-2 text-sm text-indigo-600 hover:underline"
                       onClick={() => handleViewEventDetail({
                         id: 1,
                         title: 'Họp mặt Niên khóa 2010',
                         date: '15 Tháng 11, 2023',
                         time: '18:00 - 21:00',
                         location: 'Hội trường A',
                         description: 'Buổi họp mặt thân mật dành cho cựu học sinh niên khóa 2010.',
                         type: 'Reunion'
                       })}
                     >
                       Chi tiết
                     </button>
                  </div>
                  
                  <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                     <div className="text-xs font-bold text-indigo-600 uppercase mb-1">20 Tháng 12, 2023</div>
                     <h4 className="font-bold text-gray-800 mb-1">Career Talk: Định hướng tương lai</h4>
                     <p className="text-sm text-gray-500">Khách mời: CEO Tech Group</p>
                     <button 
                       className="mt-2 text-sm text-indigo-600 hover:underline"
                       onClick={() => handleViewEventDetail({
                         id: 2,
                         title: 'Career Talk: Định hướng tương lai',
                         date: '20 Tháng 12, 2023',
                         time: '14:00 - 16:00',
                         location: 'Phòng họp B',
                         description: 'Chia sẻ kinh nghiệm và định hướng nghề nghiệp cho các bạn học sinh.',
                         type: 'Career Talk'
                       })}
                     >
                       Chi tiết
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
               <h3 className="font-bold text-lg mb-2">Quyên góp Quỹ trường</h3>
               <p className="text-indigo-100 text-sm mb-4">Chung tay xây dựng cơ sở vật chất và học bổng cho thế hệ sau.</p>
               <Button 
                 className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none"
                 onClick={() => setShowDonationModal(true)}
               >
                 <DollarSign size={16}/> Đóng góp ngay
               </Button>
            </div>
         </div>
      </div>

      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="AI Kết nối Mentor (Alumni AI)">
         {matchResult && (
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2">{matchResult.title}</h4>
                  <p className="text-indigo-700 text-sm">{matchResult.summary}</p>
               </div>
               
               {matchResult.dataPoints && (
                  <div className="text-center py-4">
                     <div className="text-gray-500 text-sm">{matchResult.dataPoints[0].label}</div>
                     <div className="text-3xl font-bold text-indigo-600">{matchResult.dataPoints[0].value}</div>
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Users2 size={16}/> Đề xuất kết nối:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {matchResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowMatchModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Generate Alumni Modal */}
      <Modal isOpen={showGenerateAlumniModal} onClose={() => setShowGenerateAlumniModal(false)} title="Tạo Cựu Học Sinh Tự Động">
         <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <h4 className="font-bold text-blue-800 mb-2">Tự động tạo danh sách cựu học sinh</h4>
               <p className="text-blue-700 text-sm">
                  Hệ thống sẽ tự động tạo danh sách cựu học sinh từ danh sách học sinh hiện có, 
                  bao gồm thông tin về công việc, liên lạc và thành tựu.
               </p>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserPlus className="text-green-600" size={20}/>
                  <div>
                     <p className="font-medium text-gray-800">Tạo từ {MOCK_STUDENTS.length} học sinh</p>
                     <p className="text-sm text-gray-600">Chuyển đổi thành cựu học sinh với thông tin nghề nghiệp</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="text-blue-600" size={20}/>
                  <div>
                     <p className="font-medium text-gray-800">Gán công việc tự động</p>
                     <p className="text-sm text-gray-600">8 công ty công nghệ lớn tại Việt Nam</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="text-purple-600" size={20}/>
                  <div>
                     <p className="font-medium text-gray-800">Tạo thành tựa</p>
                     <p className="text-sm text-gray-600">Dựa trên số năm tốt nghiệp</p>
                  </div>
               </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg">
               <p className="text-sm text-amber-700">
                  <strong>Lưu ý:</strong> Đây là dữ liệu mẫu để demo. Trong thực tế, 
                  bạn sẽ cần nhập thông tin thật của cựu học sinh.
               </p>
            </div>
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => setShowGenerateAlumniModal(false)}>Hủy</Button>
               <Button onClick={handleGenerateAlumni}>
                  <UserPlus size={16}/> Tạo Cựu Học Sinh
               </Button>
            </div>
         </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Tổ Chức Sự Kiện Mới">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
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
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    placeholder="18:00 - 21:00"
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
                 placeholder="Hội trường A, Phòng họp B..."
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Loại sự kiện</label>
               <select 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={eventForm.type}
                 onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
               >
                 <option value="Reunion">Họp mặt niên khóa</option>
                 <option value="Career Talk">Career Talk</option>
                 <option value="Workshop">Workshop</option>
                 <option value="Networking">Kết nối mạng lưới</option>
                 <option value="Fundraising">Gây quỹ</option>
               </select>
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
               <Button variant="secondary" onClick={() => setShowEventModal(false)}>Hủy</Button>
               <Button onClick={handleCreateEvent}>
                  <Calendar size={16}/> Tạo Sự Kiện
               </Button>
            </div>
         </div>
      </Modal>

      {/* Event Detail Modal */}
      <Modal isOpen={showEventDetailModal} onClose={() => setShowEventDetailModal(false)} title={selectedEvent?.title}>
         {selectedEvent && (
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400"/>
                        <span className="font-medium">Ngày:</span>
                        <span>{selectedEvent.date}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400"/>
                        <span className="font-medium">Thời gian:</span>
                        <span>{selectedEvent.time}</span>
                     </div>
                     <div className="flex items-center gap-2 col-span-2">
                        <MapPin size={16} className="text-gray-400"/>
                        <span className="font-medium">Địa điểm:</span>
                        <span>{selectedEvent.location}</span>
                     </div>
                  </div>
               </div>
               
               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Mô tả sự kiện</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
               </div>
               
               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Loại sự kiện</h4>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                     {selectedEvent.type === 'Reunion' ? 'Họp mặt niên khóa' :
                      selectedEvent.type === 'Career Talk' ? 'Career Talk' :
                      selectedEvent.type === 'Workshop' ? 'Workshop' :
                      selectedEvent.type === 'Networking' ? 'Kết nối mạng lưới' : 'Gây quỹ'}
                  </span>
               </div>
               
               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowEventDetailModal(false)}>Đóng</Button>
                  <Button>Đăng ký tham gia</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Donation Modal */}
      <Modal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} title="Đóng Góp Quỹ Trường">
         <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
               <h4 className="font-bold text-blue-800 mb-2">Quyên góp cho sự phát triển của trường</h4>
               <p className="text-blue-700 text-sm">
                  Sự đóng góp của bạn sẽ được sử dụng cho việc cải thiện cơ sở vật chất 
                  và trao học bổng cho các học sinh có hoàn cảnh khó khăn.
               </p>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
               <input 
                 type="number" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={donationForm.amount}
                 onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                 placeholder="Nhập số tiền..."
                 min="10000"
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mục đích đóng góp</label>
               <select 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={donationForm.purpose}
                 onChange={(e) => setDonationForm({...donationForm, purpose: e.target.value})}
               >
                 <option value="General">Quỹ chung</option>
                 <option value="Infrastructure">Cơ sở vật chất</option>
                 <option value="Scholarship">Học bổng</option>
                 <option value="Library">Thư viện</option>
                 <option value="Sports">Thể thao</option>
               </select>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn (tùy chọn)</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={3}
                 value={donationForm.message}
                 onChange={(e) => setDonationForm({...donationForm, message: e.target.value})}
                 placeholder="Lời nhắn của bạn..."
               />
            </div>
            
            <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="anonymous"
                 checked={donationForm.anonymous}
                 onChange={(e) => setDonationForm({...donationForm, anonymous: e.target.checked})}
               />
               <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Đóng góp ẩn danh
               </label>
            </div>
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => setShowDonationModal(false)}>Hủy</Button>
               <Button onClick={handleDonation}>
                  <DollarSign size={16}/> Đóng Góp
               </Button>
            </div>
         </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentData={paymentData}
      />
    </div>
  );
};

export default AlumniView;
