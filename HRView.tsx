import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, Briefcase, User as UserIcon, Phone, Mail, Activity, Loader2, FileText, Calendar, Users, Home, Heart, Award, GraduationCap, Building, Clock, Edit, Eye, Download, Upload, Shield, BookOpen, DollarSign } from 'lucide-react';
import { api } from './data';
import { aiService } from './aiService';
import { Staff, LeaveRequest, AIAnalysisResult } from './types';
import { Button, Modal } from './components';

const HRView = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'leave' | 'contracts' | 'profile' | 'family' | 'templates'>('staff');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    salary: '',
    hireDate: '',
    status: 'Active'
  });

  // Contract States
  const [contracts, setContracts] = useState<any[]>([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    staffId: '',
    contractType: 'PERMANENT',
    startDate: '',
    endDate: '',
    position: '',
    salary: '',
    benefits: '',
    terms: '',
    status: 'ACTIVE'
  });

  // Payroll States
  const [payrolls, setPayrolls] = useState<any[]>([]);

  // Contract Templates States
  const [contractTemplates, setContractTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAdvancedContractModal, setShowAdvancedContractModal] = useState(false);
  const [contractPages, setContractPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [templateForm, setTemplateForm] = useState({
    templateType: 'LABOR',
    contractSubType: 'PERMANENT', // PERMANENT, PROBATION, PART_TIME, SALARY_INCREASE
    staffId: '',
    position: '',
    salary: '',
    startDate: '',
    endDate: '',
    benefits: '',
    specialTerms: '',
    workHours: '8',
    workDays: '5',
    probationPeriod: '3',
    salaryIncrease: '0',
    salaryIncreaseDate: '',
    workLocation: '',
    companyInfo: {
      name: 'CÔNG TY TNHH [Tên công ty]',
      address: '[Địa chỉ công ty]',
      phone: '[Số điện thoại]',
      email: '[Email]',
      taxCode: '[Mã số thuế]',
      representative: '[Tên đại diện]',
      position: '[Chức vụ đại diện]'
    },
    employeeInfo: {
      idCard: '',
      issueDate: '',
      issuePlace: '',
      address: '',
      bankAccount: '',
      bankName: ''
    },
    payrollDetails: {
      baseSalary: 0,
      allowances: {
        lunch: 0,
        phone: 0,
        transport: 0,
        housing: 0,
        other: 0
      },
      bonuses: {
        performance: 0,
        attendance: 0,
        other: 0
      },
      deductions: {
        socialInsurance: 8,
        healthInsurance: 1.5,
        unemploymentInsurance: 1,
        incomeTax: 0
      }
    }
  });

  // Profile States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [profileForm, setProfileForm] = useState({
    id: 0,
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    salary: 0,
    hireDate: '',
    status: 'Active' as 'Active' | 'On Leave',
    education: '',
    experience: '',
    skills: '',
    certifications: '',
    address: '',
    emergencyContact: '',
    bankAccount: ''
  });

  // Family States
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    staffId: 0,
    name: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    emergencyContact: false
  });

  // AI States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<AIAnalysisResult | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  useEffect(() => {
    api.getStaff().then(setStaffList);
    api.getLeaveRequests().then(setLeaveRequests);
    
    // Mock contracts data
    setContracts([
      {
        id: 1,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguyễn Văn A',
        contractType: 'PERMANENT',
        startDate: '2023-01-15',
        endDate: '2026-01-14',
        position: 'Giáo viên Toán',
        salary: 15000000,
        benefits: 'Bảo hiểm y tế, phụ cấp ăn trưa, thưởng hiệu suất',
        terms: 'Hợp đồng lao động theo quy định pháp luật Việt Nam',
        status: 'ACTIVE',
        createdAt: '2023-01-15'
      },
      {
        id: 2,
        staffId: staffList[1]?.id || 2,
        staffName: staffList[1]?.fullName || 'Trần Thị B',
        contractType: 'TEMPORARY',
        startDate: '2023-03-01',
        endDate: '2023-12-31',
        position: 'Giáo viên Văn',
        salary: 12000000,
        benefits: 'Bảo hiểm xã hội, phụ cấp đi lại',
        terms: 'Hợp đồng thời vụ 10 tháng',
        status: 'ACTIVE',
        createdAt: '2023-03-01'
      }
    ]);

    // Mock family members data
    setFamilyMembers([
      {
        id: 1,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguyễn Văn A',
        name: 'Nguyễn Văn B',
        relationship: 'Vợ',
        phone: '0901234568',
        email: 'nguyenvanb@email.com',
        occupation: 'Giáo viên',
        address: 'Hà Nội',
        emergencyContact: true
      },
      {
        id: 2,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguyễn Văn A',
        name: 'Nguyễn Văn C',
        relationship: 'Con',
        phone: '0901234569',
        email: '',
        occupation: 'Học sinh',
        address: 'Hà Nội',
        emergencyContact: false
      }
    ]);

    // Mock payroll data
    setPayrolls([
      {
        id: 1,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguyễn Văn A',
        baseSalary: 15000000,
        allowances: 2800000,
        bonuses: 1700000,
        deductions: 3075000,
        grossSalary: 19500000,
        netSalary: 14750000,
        payPeriod: '2023-11',
        paymentDate: '2023-11-30',
        status: 'PAID'
      },
      {
        id: 2,
        staffId: staffList[1]?.id || 2,
        staffName: staffList[1]?.fullName || 'Trần Thị B',
        baseSalary: 14000000,
        allowances: 2300000,
        bonuses: 1150000,
        deductions: 2470000,
        grossSalary: 18250000,
        netSalary: 13950000,
        payPeriod: '2023-11',
        paymentDate: '2023-11-30',
        status: 'PAID'
      },
      {
        id: 3,
        staffId: staffList[2]?.id || 3,
        staffName: staffList[2]?.fullName || 'Lê Văn C',
        baseSalary: 8000000,
        allowances: 900000,
        bonuses: 600000,
        deductions: 800000,
        grossSalary: 10200000,
        netSalary: 8220000,
        payPeriod: '2023-11',
        paymentDate: '2023-11-30',
        status: 'PAID'
      }
    ]);

    // Mock contract templates data
    setContractTemplates([
      {
        id: 1,
        name: 'Hợp đồng Lao động',
        type: 'LABOR',
        description: 'Hợp đồng lao động theo Bộ luật Lao động Việt Nam',
        icon: '📄',
        color: 'blue',
        content: {
          title: 'HỢP ĐỒNG LAO ĐỘNG',
          parties: {
            employer: 'BÊN A - CÔNG TY [Tên công ty]',
            employee: 'BÊN B - NGƯỜI LAO ĐỘNG'
          },
          articles: [
            {
              article: 'Điều 1: Nội dung công việc',
              content: 'Bên B đồng ý làm việc theo vị trí [Chức vụ] với các nội dung công việc cụ thể như đã thỏa thuận trong bản mô tả công việc.'
            },
            {
              article: 'Điều 2: Thời hạn hợp đồng',
              content: 'Hợp đồng này được ký kết từ ngày [Ngày bắt đầu] đến ngày [Ngày kết thúc]. Thời gian thử việc là [Số tháng] tháng.'
            },
            {
              article: 'Điều 3: Địa điểm làm việc',
              content: 'Bên B làm việc tại [Địa điểm làm việc].'
            },
            {
              article: 'Điều 4: Chế độ tiền lương',
              content: 'Mức lương cơ bản: [Lương] VNĐ/tháng. Bên A trả lương cho Bên B hằng tháng vào ngày [Ngày trả lương].'
            },
            {
              article: 'Điều 5: Thời gian làm việc',
              content: 'Thời gian làm việc: [Số giờ] giờ/tuần. Thời gian nghỉ ngơi: [Số giờ] giờ/tuần.'
            },
            {
              article: 'Điều 6: Nghĩa vụ của Bên B',
              content: '- Thực hiện công việc theo đúng yêu cầu\n- Tuân thủ nội quy, quy chế của công ty\n- Bảo vệ tài sản của công ty'
            },
            {
              article: 'Điều 7: Quyền lợi của Bên B',
              content: '- Được hưởng đầy đủ quyền lợi theo luật định\n- Được đào tạo, nâng cao trình độ chuyên môn\n- Được tham gia bảo hiểm xã hội, y tế, thất nghiệp'
            },
            {
              article: 'Điều 8: Nghĩa vụ của Bên A',
              content: '- Trả lương đúng hạn\n- Cung cấp điều kiện làm việc an toàn\n- Tôn trọng nhân phẩm, danh dự của người lao động'
            },
            {
              article: 'Điều 9: Chế độ bảo hiểm',
              content: 'Bên A có trách nhiệm đóng bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp cho Bên B theo quy định của pháp luật.'
            },
            {
              article: 'Điều 10: Giải quyết tranh chấp',
              content: 'Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải. Nếu không giải quyết được, sẽ đưa ra Tòa án nhân dân có thẩm quyền.'
            }
          ]
        }
      },
      {
        id: 2,
        name: 'Hợp đồng Mua bán',
        type: 'SALE',
        description: 'Hợp đồng mua bán tài sản theo Bộ luật Dân sự',
        icon: '🛒',
        color: 'green',
        content: {
          title: 'HỢP ĐỒNG MUA BÁN',
          parties: {
            seller: 'BÊN BÁN - [Tên người bán]',
            buyer: 'BÊN MUA - [Tên người mua]'
          },
          articles: [
            {
              article: 'Điều 1: Đối tượng hợp đồng',
              content: 'Bên Bán đồng ý bán và Bên Mua đồng ý mua tài sản sau: [Mô tả tài sản]'
            },
            {
              article: 'Điều 2: Giá trị hợp đồng',
              content: 'Giá trị tài sản là: [Giá] VNĐ. Phương thức thanh toán: [Phương thức thanh toán]'
            },
            {
              article: 'Điều 3: Chuyển giao tài sản',
              content: 'Bên Bán giao tài sản cho Bên Mua vào ngày [Ngày giao]. Bên Mua kiểm tra và xác nhận tình trạng tài sản.'
            },
            {
              article: 'Điều 4: Quyền và nghĩa vụ của Bên Bán',
              content: '- Đảm bảo quyền sở hữu hợp pháp\n- Giao tài sản đúng thời hạn, đúng chất lượng\n- Cung cấp đầy đủ giấy tờ pháp lý'
            },
            {
              article: 'Điều 5: Quyền và nghĩa vụ của Bên Mua',
              content: '- Thanh toán đủ giá trị tài sản\n- Nhận tài sản và kiểm tra tình trạng\n- Đăng ký quyền sở hữu (nếu có)'
            },
            {
              article: 'Điều 6: Cam kết',
              content: 'Cả hai bên cam kết thực hiện đúng các nghĩa vụ trong hợp đồng.'
            },
            {
              article: 'Điều 7: Trách nhiệm vi phạm',
              content: 'Bên nào vi phạm sẽ chịu trách nhiệm bồi thường thiệt hại theo quy định pháp luật.'
            }
          ]
        }
      },
      {
        id: 3,
        name: 'Hợp đồng Hợp tác',
        type: 'COOPERATION',
        description: 'Hợp đồng hợp tác kinh doanh',
        icon: '🤝',
        color: 'purple',
        content: {
          title: 'HỢP ĐỒNG HỢP TÁC KINH DOANH',
          parties: {
            partyA: 'BÊN A - [Tên bên A]',
            partyB: 'BÊN B - [Tên bên B]'
          },
          articles: [
            {
              article: 'Điều 1: Mục tiêu hợp tác',
              content: 'Cả hai bên cùng nhau hợp tác trong lĩnh vực [Lĩnh vực hợp tác] nhằm mục tiêu [Mục tiêu].'
            },
            {
              article: 'Điều 2: Phạm vi hợp tác',
              content: 'Phạm vi hợp tác bao gồm: [Chi tiết phạm vi hợp tác]'
            },
            {
              article: 'Điều 3: Thời hạn hợp tác',
              content: 'Hợp đồng có hiệu lực từ ngày [Ngày bắt đầu] đến ngày [Ngày kết thúc].'
            },
            {
              article: 'Điều 4: Trách nhiệm của Bên A',
              content: '[Trách nhiệm cụ thể của Bên A]'
            },
            {
              article: 'Điều 5: Trách nhiệm của Bên B',
              content: '[Trách nhiệm cụ thể của Bên B]'
            },
            {
              article: 'Điều 6: Phân chia lợi nhuận',
              content: 'Lợi nhuận được phân chia theo tỷ lệ: [Tỷ lệ phân chia]'
            },
            {
              article: 'Điều 7: Bảo mật thông tin',
              content: 'Cả hai bên cam kết bảo mật thông tin trong suốt quá trình hợp tác.'
            }
          ]
        }
      },
      {
        id: 4,
        name: 'Biên bản Ghi nhớ',
        type: 'MEMORANDUM',
        description: 'Biên bản ghi nhớ thỏa thuận',
        icon: '📝',
        color: 'orange',
        content: {
          title: 'BIÊN BẢN GHI NHỚ',
          parties: {
            party1: 'BÊN 1 - [Tên bên 1]',
            party2: 'BÊN 2 - [Tên bên 2]'
          },
          articles: [
            {
              article: '1. Nội dung thỏa thuận',
              content: '[Nội dung chính của thỏa thuận]'
            },
            {
              article: '2. Thời gian thực hiện',
              content: 'Thỏa thuận có hiệu lực từ ngày [Ngày] và được thực hiện trong thời gian [Thời gian].'
            },
            {
              article: '3. Trách nhiệm thực hiện',
              content: 'Cả hai bên cùng chịu trách nhiệm thực hiện các nội dung đã thỏa thuận.'
            },
            {
              article: '4. Hiệu lực pháp lý',
              content: 'Biên bản này có giá trị pháp lý và là cơ sở cho các thỏa thuận sau này.'
            }
          ]
        }
      }
    ]);
  }, [staffList.length]);

  const handleAIEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const result = await aiService.hr.evaluateStaffPerformance();
      setEvalResult(result);
      setShowEvalModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddStaff = () => {
    const newStaff: Staff = {
      id: Date.now(),
      fullName: newStaffForm.fullName,
      email: newStaffForm.email,
      phone: newStaffForm.phone,
      role: newStaffForm.role,
      department: newStaffForm.department,
      salary: parseFloat(newStaffForm.salary),
      status: newStaffForm.status as 'Active' | 'On Leave'
    };

    setStaffList([...staffList, newStaff]);

    // Tự động tạo hợp đồng cho nhân viên mới
    const newContract = {
      id: Date.now() + 1,
      staffId: newStaff.id,
      staffName: newStaff.fullName,
      contractType: 'PROBATION',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 tháng thử việc
      position: newStaffForm.role,
      salary: newStaffForm.salary,
      benefits: 'Bảo hiểm xã hội, bảo hiểm y tế, phụ cấp ăn trưa',
      terms: 'Hợp đồng thử việc 3 tháng theo quy định pháp luật Việt Nam',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setContracts([...contracts, newContract]);

    // Tạo bảng lương cho nhân viên mới
    const newPayroll = {
      id: Date.now() + 2,
      staffId: newStaff.id,
      staffName: newStaff.fullName,
      baseSalary: parseFloat(newStaffForm.salary),
      allowances: Math.floor(parseFloat(newStaffForm.salary) * 0.15), // 15% lương cơ bản
      bonuses: 0,
      deductions: Math.floor(parseFloat(newStaffForm.salary) * 0.105), // 10.5% (8% BHXH + 1.5% BHYT + 1% BHTN)
      grossSalary: 0,
      netSalary: 0,
      payPeriod: new Date().toISOString().slice(0, 7), // Tháng hiện tại
      paymentDate: '',
      status: 'PENDING'
    };
    
    newPayroll.grossSalary = newPayroll.baseSalary + newPayroll.allowances + newPayroll.bonuses;
    newPayroll.netSalary = newPayroll.grossSalary - newPayroll.deductions;

    setPayrolls([...payrolls, newPayroll]);

    setShowAddStaffModal(false);
    setNewStaffForm({
      fullName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      salary: '',
      hireDate: '',
      status: 'Active'
    });
    alert('Đã thêm nhân viên và tạo hợp đồng thành công!');
  };

  const handleAddContract = () => {
    const newContract = {
      id: Date.now(),
      ...contractForm,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setContracts([...contracts, newContract]);
    setShowContractModal(false);
    setContractForm({
      staffId: '',
      contractType: 'PERMANENT',
      startDate: '',
      endDate: '',
      position: '',
      salary: '',
      benefits: '',
      terms: '',
      status: 'ACTIVE'
    });
    alert('Đã tạo hợp đồng thành công!');
  };

  const handleViewProfile = (staff: Staff) => {
    setSelectedStaff(staff);
    setProfileForm({
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      salary: staff.salary,
      hireDate: '',
      status: staff.status,
      education: 'Đại học Sư phạm Hà Nội',
      experience: '5 năm giảng dạy',
      skills: 'Toán, Lý, Hóa',
      certifications: 'Giáo viên giỏi',
      address: '123 Nguyễn Chí Thanh, Hà Nội',
      emergencyContact: 'Nguyễn Văn B - 0901234568',
      bankAccount: 'VCB 1234567890'
    });
    setShowProfileModal(true);
  };

  const handleViewContractDetail = (contract: any) => {
    // Mở modal chi tiết hợp đồng
    alert(`Chi tiết hợp đồng #${contract.id}\n\nNhân viên: ${contract.staffName}\nLoại hợp đồng: ${contract.contractType === 'PERMANENT' ? 'Vĩnh viễn' : 'Thời vụ'}\nChức vụ: ${contract.position}\nLương: ${formatCurrency(contract.salary)}\nThời gian: ${contract.startDate} - ${contract.endDate}\nPhúc lợi: ${contract.benefits}\nĐiều khoản: ${contract.terms}\nTrạng thái: ${contract.status === 'ACTIVE' ? 'Hiệu lực' : 'Hết hạn'}\nNgày tạo: ${contract.createdAt}`);
  };

  const handleUpdateProfile = () => {
    if (selectedStaff) {
      setStaffList(staffList.map(s => 
        s.id === selectedStaff.id ? {...s, ...profileForm} : s
      ));
      setShowProfileModal(false);
      alert('Đã cập nhật thông tin nhân viên thành công!');
    }
  };

  const handleAddFamilyMember = () => {
    const newMember = {
      id: Date.now(),
      ...familyForm,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setFamilyMembers([...familyMembers, newMember]);
    setShowFamilyModal(false);
    setFamilyForm({
      staffId: 0,
      name: '',
      relationship: '',
      phone: '',
      email: '',
      occupation: '',
      address: '',
      emergencyContact: false
    });
    alert('Đã thêm thành viên gia đình thành công!');
  };

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm(prev => ({
      ...prev,
      templateType: template.type,
      staffId: '',
      position: '',
      salary: '',
      startDate: '',
      endDate: '',
      benefits: '',
      specialTerms: ''
    }));
    setShowAdvancedContractModal(true);
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleGenerateContract = () => {
    if (!selectedTemplate || !templateForm.staffId) {
      alert('Vui lòng chọn nhân viên!');
      return;
    }

    const staff = staffList.find(s => s.id === parseInt(templateForm.staffId));
    if (!staff) return;

    // Tạo các trang hợp đồng
    const pages = generateContractPages(selectedTemplate, templateForm, staff);
    setContractPages(pages);
    setCurrentPage(0);

    // Tạo hợp đồng từ mẫu
    const newContract = {
      id: Date.now(),
      staffId: staff.id,
      staffName: staff.fullName,
      contractType: templateForm.contractSubType,
      startDate: templateForm.startDate,
      endDate: templateForm.endDate,
      position: templateForm.position,
      salary: parseFloat(templateForm.salary),
      benefits: templateForm.benefits,
      terms: templateForm.specialTerms || selectedTemplate.content.articles.map(a => a.content).join('\n'),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      templateId: selectedTemplate.id,
      qrCode: generateQRCode(Date.now().toString()),
      pages: pages.length,
      companyInfo: templateForm.companyInfo,
      employeeInfo: templateForm.employeeInfo,
      payrollDetails: templateForm.payrollDetails
    };

    setContracts([...contracts, newContract]);
    setShowAdvancedContractModal(false);
    alert(`Đã tạo hợp đồng ${selectedTemplate.name} cho ${staff.fullName} thành công!`);
  };

  const generateContractPages = (template: any, form: any, staff: Staff) => {
    const pages = [];
    const qrCode = generateQRCode(Date.now().toString());
    
    // Trang 1: Trang bìa và thông tin cơ bản
    pages.push({
      id: 1,
      title: 'TRANG BÌA',
      content: {
        header: {
          title: template.content.title,
          subtitle: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
          subtitle2: 'Độc lập - Tự do - Hạnh phúc',
          qrCode: qrCode,
          contractCode: `HĐ${Date.now().toString().slice(-6)}`
        },
        parties: {
          company: form.companyInfo,
          employee: {
            ...staff,
            ...form.employeeInfo
          }
        }
      }
    });

    // Trang 2: Thông tin doanh nghiệp
    pages.push({
      id: 2,
      title: 'THÔNG TIN DOANH NGHIỆP',
      content: {
        company: {
          ...form.companyInfo,
          businessLicense: '[Giấy phép kinh doanh số]',
          capital: '[Vốn điều lệ]',
          bankAccount: '[Tài khoản ngân hàng công ty]'
        },
        qrCode: qrCode,
        pageNumber: 2
      }
    });

    // Trang 3: Thông tin người lao động
    pages.push({
      id: 3,
      title: 'THÔNG TIN NGƯỜI LAO ĐỘNG',
      content: {
        employee: {
          ...staff,
          ...form.employeeInfo,
          education: '[Trình độ học vấn]',
          experience: '[Kinh nghiệm làm việc]',
          skills: '[Kỹ năng chuyên môn]'
        },
        qrCode: qrCode,
        pageNumber: 3
      }
    });

    // Trang 4: Nội dung công việc và điều khoản
    pages.push({
      id: 4,
      title: 'NỘI DUNG CÔNG VIỆC',
      content: {
        jobDescription: {
          position: form.position,
          workLocation: form.workLocation,
          workHours: form.workHours,
          workDays: form.workDays,
          duties: '[Mô tả chi tiết công việc]'
        },
        articles: template.content.articles,
        qrCode: qrCode,
        pageNumber: 4
      }
    });

    // Trang 5: Bảng lương chi tiết
    pages.push({
      id: 5,
      title: 'BẢNG LƯƠNG CHI TIẾT',
      content: {
        payroll: {
          baseSalary: parseFloat(form.salary),
          allowances: form.payrollDetails.allowances,
          bonuses: form.payrollDetails.bonuses,
          deductions: form.payrollDetails.deductions,
          grossSalary: 0,
          netSalary: 0
        },
        qrCode: qrCode,
        pageNumber: 5
      }
    });

    // Tính toán lương
    const payrollPage = pages[4].content.payroll;
    payrollPage.grossSalary = payrollPage.baseSalary + 
      Object.values(payrollPage.allowances).reduce((a: number, b: number) => a + b, 0) +
      Object.values(payrollPage.bonuses).reduce((a: number, b: number) => a + b, 0);
    
    const totalDeductions = (payrollPage.baseSalary * (payrollPage.deductions.socialInsurance + payrollPage.deductions.healthInsurance + payrollPage.deductions.unemploymentInsurance) / 100) + payrollPage.deductions.incomeTax;
    payrollPage.netSalary = payrollPage.grossSalary - totalDeductions;

    // Trang 6: Phụ lục và chữ ký
    pages.push({
      id: 6,
      title: 'PHỤ LỤC VÀ CHỮ KÝ',
      content: {
        appendix: {
          specialTerms: form.specialTerms,
          probationPeriod: form.probationPeriod,
          salaryIncrease: form.salaryIncrease,
          salaryIncreaseDate: form.salaryIncreaseDate
        },
        signatures: {
          company: {
            representative: form.companyInfo.representive,
            position: form.companyInfo.position,
            date: '[Ngày ký]'
          },
          employee: {
            name: staff.fullName,
            position: form.position,
            date: '[Ngày ký]'
          }
        },
        qrCode: qrCode,
        pageNumber: 6
      }
    });

    return pages;
  };

  const generateQRCode = (data: string) => {
    // Tạo mã QR đơn giản (trong thực tế sẽ dùng thư viện QR)
    return `QR-${data}-${Date.now().toString().slice(-4)}`;
  };

  const filteredStaff = staffList.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản trị Nhân sự</h2>
           <p className="text-gray-500">Quản lý hồ sơ nhân viên và nghỉ phép</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('staff')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'staff' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Users size={18} className="mr-2"/> Danh sách NV
           </button>
           <button 
             onClick={() => setActiveTab('contracts')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'contracts' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <FileText size={18} className="mr-2"/> Hợp đồng
           </button>
           <button 
             onClick={() => setActiveTab('templates')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Upload size={18} className="mr-2"/> Mẫu HĐ
           </button>
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <UserIcon size={18} className="mr-2"/> Thông tin
           </button>
           <button 
             onClick={() => setActiveTab('family')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'family' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Home size={18} className="mr-2"/> Gia đình
           </button>
           <button 
             onClick={() => setActiveTab('leave')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'leave' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Calendar size={18} className="mr-2"/> Duyệt Phép
           </button>
        </div>
      </div>

      {activeTab === 'staff' && (
        <>
          <div className="flex justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhân viên, phòng ban..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex gap-2">
                <Button 
                   variant="secondary"
                   className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
                   onClick={handleAIEvaluation}
                   disabled={isEvaluating}
                >
                   {isEvaluating ? <Loader2 size={18} className="animate-spin"/> : <Activity size={18}/>}
                   {isEvaluating ? 'Đang đánh giá...' : 'AI Đánh giá'}
                </Button>
                <Button onClick={() => setShowAddStaffModal(true)}><Plus size={20}/> Thêm Nhân viên</Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredStaff.map(s => (
               <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                  {/* ... Existing Staff Card Content ... */}
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                           {s.fullName.charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-800">{s.fullName}</h3>
                           <p className="text-sm text-indigo-600 font-medium">{s.role}</p>
                        </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {s.status === 'Active' ? 'Đang làm' : 'Nghỉ phép'}
                     </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1">
                     <div className="flex items-center gap-2"><Briefcase size={16}/> {s.department}</div>
                     <div className="flex items-center gap-2"><Mail size={16}/> {s.email}</div>
                     <div className="flex items-center gap-2"><Phone size={16}/> {s.phone}</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                     <span className="text-xs text-gray-500">Lương cơ bản</span>
                     <span className="font-bold text-gray-800">{formatCurrency(s.salary)}</span>
                  </div>
               </div>
             ))}
          </div>
        </>
      )}

      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Hợp đồng Lao động</h3>
            <Button onClick={() => setShowContractModal(true)}>
              <Plus size={18} /> Tạo Hợp đồng
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Mã HĐ</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Loại HĐ</th>
                  <th className="p-4">Chức vụ</th>
                  <th className="p-4 text-right">Lương</th>
                  <th className="p-4">Ngày bắt đầu</th>
                  <th className="p-4">Ngày kết thúc</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map(contract => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{contract.id}</td>
                    <td className="p-4 font-medium">{contract.staffName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contract.contractType === 'PERMANENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {contract.contractType === 'PERMANENT' ? 'Vĩnh viễn' : 'Thời vụ'}
                      </span>
                    </td>
                    <td className="p-4">{contract.position}</td>
                    <td className="p-4 text-right font-bold">{formatCurrency(contract.salary)}</td>
                    <td className="p-4 text-sm">{contract.startDate}</td>
                    <td className="p-4 text-sm">{contract.endDate}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {contract.status === 'ACTIVE' ? 'Hiệu lực' : 'Hết hạn'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleViewContractDetail(contract)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:underline text-sm font-medium">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Thông tin Chi tiết Nhân viên</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map(staff => (
              <div key={staff.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {staff.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{staff.fullName}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{staff.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewProfile(staff)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Xem gia đình"
                    >
                      <Home size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1">
                  <div className="flex items-center gap-2"><Briefcase size={16}/> {staff.department}</div>
                  <div className="flex items-center gap-2"><Mail size={16}/> {staff.email}</div>
                  <div className="flex items-center gap-2"><Phone size={16}/> {staff.phone}</div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Lương cơ bản</span>
                  <span className="font-bold text-gray-800">{formatCurrency(staff.salary)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Thông tin Gia đình</h3>
            <Button onClick={() => setShowFamilyModal(true)}>
              <Plus size={18} /> Thêm Thành viên
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staffList.map(staff => (
              <div key={staff.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      <Home size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{staff.fullName}</h4>
                      <p className="text-sm text-gray-500">{staff.department}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setFamilyForm({...familyForm, staffId: staff.id});
                      setShowFamilyModal(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50 rounded-lg p-2"
                    title="Thêm thành viên gia đình"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {familyMembers
                    .filter(member => member.staffId === staff.id)
                    .map(member => (
                      <div key={member.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.relationship}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.emergencyContact && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <Shield size={12} className="mr-1" />
                                Liên hệ khẩn cấp
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>📞 {member.phone}</div>
                          {member.email && <div>✉ {member.email}</div>}
                          <div>💼 {member.occupation}</div>
                          <div>📍 {member.address}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mẫu Hợp đồng Chuẩn</h3>
            <div className="text-sm text-gray-500">
              Chọn mẫu hợp đồng và nhân viên để tạo hợp đồng nhanh chóng
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractTemplates.map(template => (
              <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      template.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      template.color === 'green' ? 'bg-green-100 text-green-600' :
                      template.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    template.color === 'green' ? 'bg-green-100 text-green-700' :
                    template.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {template.type === 'LABOR' ? 'Lao động' :
                     template.type === 'SALE' ? 'Mua bán' :
                     template.type === 'COOPERATION' ? 'Hợp tác' : 'Ghi nhớ'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800 mb-1">Nội dung chính:</div>
                    <ul className="space-y-1">
                      {template.content.articles.slice(0, 3).map((article: any, idx: number) => (
                        <li key={idx} className="text-xs">
                          <span className="font-medium">{article.article.split(':')[0]}:</span> {article.content.substring(0, 50)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {template.content.articles.length} điều khoản
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Sử dụng mẫu
                    </button>
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Xem trước
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
               <tr>
                 <th className="p-4">Nhân viên</th>
                 <th className="p-4">Loại nghỉ</th>
                 <th className="p-4">Thời gian</th>
                 <th className="p-4">Lý do</th>
                 <th className="p-4 text-center">Trạng thái</th>
                 <th className="p-4 text-right">Hành động</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {leaveRequests.map(req => {
                 const staff = staffList.find(s => s.id === req.staffId);
                 return (
                   <tr key={req.id} className="hover:bg-gray-50">
                     <td className="p-4 font-medium">{staff?.fullName} <span className="text-xs text-gray-400 block">{staff?.department}</span></td>
                     <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.type}</span></td>
                     <td className="p-4 text-sm">
                        <div className="font-medium">{req.startDate}</div>
                        <div className="text-gray-500">đến {req.endDate}</div>
                     </td>
                     <td className="p-4 text-gray-600 italic">{req.reason}</td>
                     <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                           req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                           req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                           {req.status === 'Approved' ? 'Đã duyệt' : req.status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        {req.status === 'Pending' && (
                           <div className="flex justify-end gap-2">
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={20}/></button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={20}/></button>
                           </div>
                        )}
                     </td>
                   </tr>
                 )
               })}
             </tbody>
           </table>
        </div>
      )}

      <Modal isOpen={showEvalModal} onClose={() => setShowEvalModal(false)} title="Đánh giá Hiệu suất Nhân sự (AI)">
         {evalResult && (
            <div className="space-y-4">
               <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2">{evalResult.title}</h4>
                  <p className="text-orange-700 text-sm">{evalResult.summary}</p>
               </div>
               
               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Activity size={16}/> Đề xuất cải thiện:</h5>
                  <ul className="space-y-1">
                     {evalResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                           <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
                           <span>{rec}</span>
                        </li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowEvalModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={showAddStaffModal} onClose={() => setShowAddStaffModal(false)} title="Thêm Nhân viên Mới">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                     type="text"
                     value={newStaffForm.fullName}
                     onChange={(e) => setNewStaffForm({...newStaffForm, fullName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập họ và tên"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                     type="email"
                     value={newStaffForm.email}
                     onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập email"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                     type="tel"
                     value={newStaffForm.phone}
                     onChange={(e) => setNewStaffForm({...newStaffForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập số điện thoại"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <input
                     type="text"
                     value={newStaffForm.role}
                     onChange={(e) => setNewStaffForm({...newStaffForm, role: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập chức vụ"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                  <select
                     value={newStaffForm.department}
                     onChange={(e) => setNewStaffForm({...newStaffForm, department: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Chọn phòng ban</option>
                     <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                     <option value="Khoa Toán - Lý - Hóa">Khoa Toán - Lý - Hóa</option>
                     <option value="Khoa Ngữ Văn - Lịch Sử">Khoa Ngữ Văn - Lịch Sử</option>
                     <option value="Khoa Tiếng Anh">Khoa Tiếng Anh</option>
                     <option value="Khoa Sinh học - Hóa học">Khoa Sinh học - Hóa học</option>
                     <option value="Phòng Kế toán">Phòng Kế toán</option>
                     <option value="Phòng Hành chính">Phòng Hành chính</option>
                     <option value="Phòng IT">Phòng IT</option>
                     <option value="Thư viện">Thư viện</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản</label>
                  <input
                     type="number"
                     value={newStaffForm.salary}
                     onChange={(e) => setNewStaffForm({...newStaffForm, salary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập lương cơ bản"
                     min="0"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tuyển dụng</label>
                  <input
                     type="date"
                     value={newStaffForm.hireDate}
                     onChange={(e) => setNewStaffForm({...newStaffForm, hireDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                     value={newStaffForm.status}
                     onChange={(e) => setNewStaffForm({...newStaffForm, status: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="Active">Đang làm</option>
                     <option value="On Leave">Nghỉ phép</option>
                  </select>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddStaffModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleAddStaff} disabled={!newStaffForm.fullName || !newStaffForm.email || !newStaffForm.role || !newStaffForm.department || !newStaffForm.salary}>
                  Thêm nhân viên
               </Button>
            </div>
         </div>
      </Modal>

      {/* Contract Modal */}
      <Modal isOpen={showContractModal} onClose={() => setShowContractModal(false)} title="Tạo Hợp đồng Lao động">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                  <select
                     value={contractForm.staffId}
                     onChange={(e) => setContractForm({...contractForm, staffId: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Chọn nhân viên</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng</label>
                  <select
                     value={contractForm.contractType}
                     onChange={(e) => setContractForm({...contractForm, contractType: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="PERMANENT">Vĩnh viễn</option>
                     <option value="TEMPORARY">Thời vụ</option>
                     <option value="PROBATION">Thử việc</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <input
                     type="text"
                     value={contractForm.position}
                     onChange={(e) => setContractForm({...contractForm, position: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập chức vụ"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lương</label>
                  <input
                     type="number"
                     value={contractForm.salary}
                     onChange={(e) => setContractForm({...contractForm, salary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập lương"
                     min="0"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                     type="date"
                     value={contractForm.startDate}
                     onChange={(e) => setContractForm({...contractForm, startDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                     type="date"
                     value={contractForm.endDate}
                     onChange={(e) => setContractForm({...contractForm, endDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Phúc lợi</label>
               <textarea
                  value={contractForm.benefits}
                  onChange={(e) => setContractForm({...contractForm, benefits: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nhập các phúc lợi (bảo hiểm, phụ cấp, thưởng...)"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản hợp đồng</label>
               <textarea
                  value={contractForm.terms}
                  onChange={(e) => setContractForm({...contractForm, terms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nhập điều khoản hợp đồng"
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowContractModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleAddContract} disabled={!contractForm.staffId || !contractForm.position || !contractForm.salary}>
                  Tạo hợp đồng
               </Button>
            </div>
         </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Thông tin Chi tiết Nhân viên" maxWidth="max-w-2xl">
         {selectedStaff && (
            <div className="space-y-6">
               {/* Basic Info */}
               <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                     <UserIcon size={20} className="text-blue-600" />
                     Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                           type="text"
                           value={profileForm.fullName}
                           onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                           type="email"
                           value={profileForm.email}
                           onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                           type="tel"
                           value={profileForm.phone}
                           onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                        <input
                           type="text"
                           value={profileForm.role}
                           onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                        <input
                           type="text"
                           value={profileForm.department}
                           onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lương</label>
                        <input
                           type="number"
                           value={profileForm.salary}
                           onChange={(e) => setProfileForm({...profileForm, salary: parseFloat(e.target.value)})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           min="0"
                        />
                     </div>
                  </div>
               </div>

               {/* Education */}
               <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                     <GraduationCap size={20} className="text-green-600" />
                     Học vấn & Chứng chỉ
                  </h4>
                  <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Học vấn cao nhất</label>
                        <input
                           type="text"
                           value={profileForm.education}
                           onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ví dụ: Đại học Sư phạm Hà Nội"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chứng chỉ</label>
                        <input
                           type="text"
                           value={profileForm.certifications}
                           onChange={(e) => setProfileForm({...profileForm, certifications: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ví dụ: Giáo viên giỏi"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                        <input
                           type="text"
                           value={profileForm.experience}
                           onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ví dụ: 5 năm giảng dạy"
                        />
                     </div>
                  </div>
               </div>

               {/* Skills */}
               <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                     <Award size={20} className="text-purple-600" />
                     Kỹ năng & Chuyên môn
                  </h4>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng chuyên môn</label>
                     <textarea
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Ví dụ: Toán, Lý, Hóa, Tiếng Anh"
                     />
                  </div>
               </div>

               {/* Contact Info */}
               <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                     <Phone size={20} className="text-orange-600" />
                     Thông tin liên hệ
                  </h4>
                  <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                           type="text"
                           value={profileForm.address}
                           onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ví dụ: 123 Nguyễn Chí Thanh, Hà Nội"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Liên hệ khẩn cấp</label>
                        <input
                           type="text"
                           value={profileForm.emergencyContact}
                           onChange={(e) => setProfileForm({...profileForm, emergencyContact: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Tên - SĐT - SĐT"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản ngân hàng</label>
                        <input
                           type="text"
                           value={profileForm.bankAccount}
                           onChange={(e) => setProfileForm({...profileForm, bankAccount: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ngân hàng - Số tài khoản"
                        />
                     </div>
                  </div>
               </div>

               {/* Contracts Section */}
               <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                     <FileText size={20} className="text-indigo-600" />
                     Hợp đồng Lao động
                  </h4>
                  <div className="space-y-3">
                     {contracts
                       .filter(contract => contract.staffId === selectedStaff?.id)
                       .map(contract => (
                         <div key={contract.id} className="bg-white p-4 rounded-lg border border-indigo-200">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <div className="font-medium text-gray-800">Hợp đồng #{contract.id}</div>
                                 <div className="text-sm text-gray-500">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                       contract.contractType === 'PERMANENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                     }`}>
                                       {contract.contractType === 'PERMANENT' ? 'Vĩnh viễn' : 'Thời vụ'}
                                    </span>
                                    {' • '}
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                       {contract.status === 'ACTIVE' ? 'Hiệu lực' : 'Hết hạn'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button 
                                    onClick={() => handleViewContractDetail(contract)}
                                    className="text-blue-600 hover:bg-blue-50 rounded-lg p-2" 
                                    title="Xem chi tiết"
                                  >
                                    <Eye size={16} />
                                  </button>
                                 <button className="text-gray-600 hover:bg-gray-50 rounded-lg p-2" title="Tải về">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                 <span className="text-gray-500">Chức vụ:</span>
                                 <div className="font-medium">{contract.position}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Lương:</span>
                                 <div className="font-bold text-green-600">{formatCurrency(contract.salary)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Thời gian:</span>
                                 <div>{contract.startDate} - {contract.endDate}</div>
                              </div>
                           </div>
                           <div>
                              <span className="text-gray-500">Phúc lợi:</span>
                              <div className="text-sm text-gray-700 mt-1">{contract.benefits}</div>
                           </div>
                           <div>
                              <span className="text-gray-500">Điều khoản:</span>
                              <div className="text-sm text-gray-700 mt-1">{contract.terms}</div>
                           </div>
                         </div>
                       ))}
                     {contracts.filter(contract => contract.staffId === selectedStaff?.id).length === 0 && (
                       <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                          <p>Chưa có hợp đồng nào</p>
                       </div>
                     )}
                  </div>
               </div>

               {/* Payroll Section */}
               <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                     <DollarSign size={20} className="text-green-600" />
                     Bảng Lương Chi tiết
                  </h4>
                  <div className="space-y-3">
                     {/* Mock payroll data for the selected staff */}
                     {payrolls
                       .filter(payroll => payroll.staffId === selectedStaff?.id)
                       .map(payroll => (
                         <div key={payroll.id} className="bg-white p-4 rounded-lg border border-green-200">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <div className="font-medium text-gray-800">Kỳ lương: {payroll.payPeriod}</div>
                                 <div className="text-sm text-gray-500">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       payroll.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                       payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                     }`}>
                                       {payroll.status === 'PAID' ? 'Đã thanh toán' : 
                                        payroll.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button className="text-blue-600 hover:bg-blue-50 rounded-lg p-2" title="Xem chi tiết">
                                    <Eye size={16} />
                                 </button>
                                 <button className="text-gray-600 hover:bg-gray-50 rounded-lg p-2" title="In bảng lương">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                 <span className="text-gray-500">Lương cơ bản:</span>
                                 <div className="font-medium">{formatCurrency(payroll.baseSalary)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Phụ cấp:</span>
                                 <div className="font-medium text-blue-600">{formatCurrency(payroll.allowances || 0)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Thưởng:</span>
                                 <div className="font-medium text-green-600">{formatCurrency(payroll.bonuses || 0)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Khấu trừ:</span>
                                 <div className="font-medium text-red-600">{formatCurrency(payroll.deductions || 0)}</div>
                              </div>
                           </div>
                           <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-500 font-medium">Tổng thu nhập:</span>
                                 <span className="font-bold text-blue-600">{formatCurrency(payroll.grossSalary || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-500 font-medium">Thực lĩnh:</span>
                                 <span className="font-bold text-green-600 text-lg">{formatCurrency(payroll.netSalary || 0)}</span>
                              </div>
                           </div>
                           <div className="text-xs text-gray-500 mt-2">
                              Ngày thanh toán: {payroll.paymentDate || 'Chưa thanh toán'}
                           </div>
                         </div>
                       ))}
                     {payrolls.filter(payroll => payroll.staffId === selectedStaff?.id).length === 0 && (
                       <div className="text-center py-8 text-gray-500">
                          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                          <p>Chưa có bảng lương nào</p>
                       </div>
                     )}
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                     Đóng
                  </Button>
                  <Button onClick={handleUpdateProfile}>
                     Cập nhật
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Contract Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={`Tạo Hợp đồng từ Mẫu: ${selectedTemplate?.name}`} maxWidth="max-w-2xl">
         {selectedTemplate && (
            <div className="space-y-6">
               {/* Template Preview */}
               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Nội dung mẫu:</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                     <div><strong>Tiêu đề:</strong> {selectedTemplate.content.title}</div>
                     <div><strong>Số điều khoản:</strong> {selectedTemplate.content.articles.length}</div>
                     <div className="max-h-32 overflow-y-auto">
                        <strong>Điều khoản chính:</strong>
                        <ul className="mt-1 space-y-1">
                          {selectedTemplate.content.articles.map((article: any, idx: number) => (
                            <li key={idx} className="text-xs">{article.article}</li>
                          ))}
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Contract Form */}
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                        <select
                           value={templateForm.staffId}
                           onChange={(e) => setTemplateForm({...templateForm, staffId: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           <option value="">Chọn nhân viên</option>
                           {staffList.map(staff => (
                              <option key={staff.id} value={staff.id}>
                                 {staff.fullName} - {staff.department}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                        <input
                           type="text"
                           value={templateForm.position}
                           onChange={(e) => setTemplateForm({...templateForm, position: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Nhập chức vụ"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lương</label>
                        <input
                           type="number"
                           value={templateForm.salary}
                           onChange={(e) => setTemplateForm({...templateForm, salary: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Nhập lương"
                           min="0"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <input
                           type="date"
                           value={templateForm.startDate}
                           onChange={(e) => setTemplateForm({...templateForm, startDate: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                        <input
                           type="date"
                           value={templateForm.endDate}
                           onChange={(e) => setTemplateForm({...templateForm, endDate: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phúc lợi</label>
                        <input
                           type="text"
                           value={templateForm.benefits}
                           onChange={(e) => setTemplateForm({...templateForm, benefits: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Bảo hiểm, phụ cấp, thưởng..."
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản bổ sung</label>
                     <textarea
                        value={templateForm.specialTerms}
                        onChange={(e) => setTemplateForm({...templateForm, specialTerms: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Các điều khoản bổ sung theo yêu cầu..."
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleGenerateContract} disabled={!templateForm.staffId || !templateForm.position || !templateForm.salary}>
                     Tạo hợp đồng
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Family Modal */}
      <Modal isOpen={showFamilyModal} onClose={() => setShowFamilyModal(false)} title="Thêm Thành viên Gia đình">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                  <select
                     value={familyForm.staffId}
                     onChange={(e) => setFamilyForm({...familyForm, staffId: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Chọn nhân viên</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quan hệ</label>
                  <select
                     value={familyForm.relationship}
                     onChange={(e) => setFamilyForm({...familyForm, relationship: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Chọn quan hệ</option>
                     <option value="Vợ">Vợ</option>
                     <option value="Chồng">Chồng</option>
                     <option value="Con">Con</option>
                     <option value="Bố">Bố</option>
                     <option value="Mẹ">Mẹ</option>
                     <option value="Cha">Cha</option>
                     <option value="Em gái">Em gái</option>
                     <option value="Anh">Anh</option>
                     <option value="Chị">Chị</option>
                     <option value="Khác">Khác</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                     type="text"
                     value={familyForm.name}
                     onChange={(e) => setFamilyForm({...familyForm, name: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập họ và tên"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                     type="tel"
                     value={familyForm.phone}
                     onChange={(e) => setFamilyForm({...familyForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập số điện thoại"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                     type="email"
                     value={familyForm.email}
                     onChange={(e) => setFamilyForm({...familyForm, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập email (nếu có)"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
                  <input
                     type="text"
                     value={familyForm.occupation}
                     onChange={(e) => setFamilyForm({...familyForm, occupation: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập nghề nghiệp"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                     type="text"
                     value={familyForm.address}
                     onChange={(e) => setFamilyForm({...familyForm, address: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nhập địa chỉ"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liên hệ khẩn cấp</label>
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={familyForm.emergencyContact}
                        onChange={(e) => setFamilyForm({...familyForm, emergencyContact: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600"
                     />
                     <span className="text-sm text-gray-700">Đây là liên hệ khẩn cấp</span>
                  </label>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowFamilyModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleAddFamilyMember} disabled={!familyForm.name || !familyForm.relationship || !familyForm.staffId}>
                  Thêm thành viên
               </Button>
            </div>
      </Modal>

      {/* Advanced Contract Modal */}
      <Modal isOpen={showAdvancedContractModal} onClose={() => setShowAdvancedContractModal(false)} title={`Tạo Hợp đồng Nâng cao: ${selectedTemplate?.name}`} maxWidth="max-w-6xl">
         {selectedTemplate && (
            <div className="space-y-6">
               {/* Tab Navigation */}
               <div className="flex border-b">
                  {['basic', 'company', 'employee', 'job', 'payroll', 'terms'].map((tab, idx) => (
                     <button
                        key={tab}
                        onClick={() => setCurrentPage(idx)}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                           currentPage === idx 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                     >
                        {tab === 'basic' && 'Thông tin cơ bản'}
                        {tab === 'company' && 'Doanh nghiệp'}
                        {tab === 'employee' && 'Người lao động'}
                        {tab === 'job' && 'Công việc'}
                        {tab === 'payroll' && 'Lương & Phụ cấp'}
                        {tab === 'terms' && 'Điều khoản'}
                     </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[400px]">
                  {/* Tab 1: Thông tin cơ bản */}
                  {currentPage === 0 && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng</label>
                              <select
                                 value={templateForm.contractSubType}
                                 onChange={(e) => setTemplateForm({...templateForm, contractSubType: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option value="PERMANENT">Chính thức</option>
                                 <option value="PROBATION">Thử việc</option>
                                 <option value="PART_TIME">Bán thời gian</option>
                                 <option value="SALARY_INCREASE">Tăng lương</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                              <select
                                 value={templateForm.staffId}
                                 onChange={(e) => setTemplateForm({...templateForm, staffId: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option value="">Chọn nhân viên</option>
                                 {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                       {staff.fullName} - {staff.department}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                              <input
                                 type="text"
                                 value={templateForm.position}
                                 onChange={(e) => setTemplateForm({...templateForm, position: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 placeholder="Nhập chức vụ"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản</label>
                              <input
                                 type="number"
                                 value={templateForm.salary}
                                 onChange={(e) => setTemplateForm({...templateForm, salary: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 placeholder="Nhập lương"
                                 min="0"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                              <input
                                 type="date"
                                 value={templateForm.startDate}
                                 onChange={(e) => setTemplateForm({...templateForm, startDate: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                              <input
                                 type="date"
                                 value={templateForm.endDate}
                                 onChange={(e) => setTemplateForm({...templateForm, endDate: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm làm việc</label>
                           <input
                              type="text"
                              value={templateForm.workLocation}
                              onChange={(e) => setTemplateForm({...templateForm, workLocation: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Nhập địa điểm làm việc"
                           />
                        </div>
                     </div>
                  )}

                  {/* Tab 2: Thông tin doanh nghiệp */}
                  {currentPage === 1 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin Doanh nghiệp</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                              <input
                                 type="text"
                                 value={templateForm.companyInfo.name}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, name: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                              <input
                                 type="text"
                                 value={templateForm.companyInfo.taxCode}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, taxCode: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                              <input
                                 type="text"
                                 value={templateForm.companyInfo.address}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, address: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                              <input
                                 type="text"
                                 value={templateForm.companyInfo.phone}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, phone: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                 type="email"
                                 value={templateForm.companyInfo.email}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, email: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                              <input
                                 type="text"
                                 value={templateForm.companyInfo.representative}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    companyInfo: {...templateForm.companyInfo, representative: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Tab 3: Thông tin người lao động */}
                  {currentPage === 2 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin Người lao động</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD</label>
                              <input
                                 type="text"
                                 value={templateForm.employeeInfo.idCard}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, idCard: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                              <input
                                 type="date"
                                 value={templateForm.employeeInfo.issueDate}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, issueDate: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp</label>
                              <input
                                 type="text"
                                 value={templateForm.employeeInfo.issuePlace}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, issuePlace: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
                              <input
                                 type="text"
                                 value={templateForm.employeeInfo.address}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, address: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản ngân hàng</label>
                              <input
                                 type="text"
                                 value={templateForm.employeeInfo.bankAccount}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, bankAccount: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
                              <input
                                 type="text"
                                 value={templateForm.employeeInfo.bankName}
                                 onChange={(e) => setTemplateForm({
                                    ...templateForm, 
                                    employeeInfo: {...templateForm.employeeInfo, bankName: e.target.value}
                                 })}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Tab 4: Nội dung công việc */}
                  {currentPage === 3 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Nội dung Công việc</h3>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc chi tiết</label>
                           <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={6}
                              placeholder="Mô tả chi tiết công việc, trách nhiệm, quyền hạn..."
                           />
                        </div>

                        {templateForm.contractSubType === 'PROBATION' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thử việc (tháng)</label>
                                 <input
                                    type="number"
                                    value={templateForm.probationPeriod}
                                    onChange={(e) => setTemplateForm({...templateForm, probationPeriod: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    min="1"
                                    max="6"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Lương thử việc (%)</label>
                                 <input
                                    type="number"
                                    value="85"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    readOnly
                                 />
                              </div>
                           </div>
                        )}

                        {templateForm.contractSubType === 'SALARY_INCREASE' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">% Tăng lương</label>
                                 <input
                                    type="number"
                                    value={templateForm.salaryIncrease}
                                    onChange={(e) => setTemplateForm({...templateForm, salaryIncrease: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    min="0"
                                    max="100"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Ngày áp dụng tăng lương</label>
                                 <input
                                    type="date"
                                    value={templateForm.salaryIncreaseDate}
                                    onChange={(e) => setTemplateForm({...templateForm, salaryIncreaseDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Tab 5: Bảng lương chi tiết */}
                  {currentPage === 4 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Bảng Lương Chi tiết</h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                           <h4 className="font-medium text-gray-800 mb-3">Phụ cấp</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Ăn trưa</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.allowances.lunch}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          allowances: {...templateForm.payrollDetails.allowances, lunch: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.allowances.phone}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          allowances: {...templateForm.payrollDetails.allowances, phone: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <h4 className="font-medium text-gray-800 mb-3">Thưởng</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Hiệu suất</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.bonuses.performance}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          bonuses: {...templateForm.payrollDetails.bonuses, performance: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên cần</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.bonuses.attendance}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          bonuses: {...templateForm.payrollDetails.bonuses, attendance: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <h4 className="font-medium text-gray-800 mb-3">Khấu trừ (%)</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">BHXH (%)</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.deductions.socialInsurance}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          deductions: {...templateForm.payrollDetails.deductions, socialInsurance: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">BHYT (%)</label>
                                 <input
                                    type="number"
                                    value={templateForm.payrollDetails.deductions.healthInsurance}
                                    onChange={(e) => setTemplateForm({
                                       ...templateForm, 
                                       payrollDetails: {
                                          ...templateForm.payrollDetails, 
                                          deductions: {...templateForm.payrollDetails.deductions, healthInsurance: parseFloat(e.target.value) || 0}
                                       }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Tab 6: Điều khoản */}
                  {currentPage === 5 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Điều khoản và Phụ lục</h3>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản bổ sung</label>
                           <textarea
                              value={templateForm.specialTerms}
                              onChange={(e) => setTemplateForm({...templateForm, specialTerms: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={6}
                              placeholder="Các điều khoản bổ sung theo yêu cầu..."
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Phúc lợi</label>
                           <textarea
                              value={templateForm.benefits}
                              onChange={(e) => setTemplateForm({...templateForm, benefits: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={4}
                              placeholder="Bảo hiểm, phụ cấp, thưởng, đào tạo..."
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Navigation and Actions */}
               <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                     <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        ← Trước
                     </button>
                     <button
                        onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                        disabled={currentPage === 5}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Sau →
                     </button>
                  </div>
                  
                  <div className="flex gap-2">
                     <Button variant="secondary" onClick={() => setShowAdvancedContractModal(false)}>
                        Hủy
                     </Button>
                     <Button onClick={handleGenerateContract} disabled={!templateForm.staffId || !templateForm.position || !templateForm.salary}>
                        Tạo hợp đồng ({currentPage + 1}/6)
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </Modal>

      {/* Contract Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={`Xem trước: ${selectedTemplate?.name}`} maxWidth="max-w-4xl">
         {selectedTemplate && (
            <div className="space-y-6">
               {/* Header */}
               <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                     {selectedTemplate.content.title}
                  </h2>
                  <div className="text-sm text-gray-500">
                     Mẫu hợp đồng chuẩn theo pháp luật Việt Nam
                  </div>
               </div>

               {/* Parties */}
               <div className="grid grid-cols-2 gap-8">
                  <div className="border-l-4 border-blue-500 pl-4">
                     <h3 className="font-semibold text-gray-800 mb-2">Bên A</h3>
                     <p className="text-gray-700">{selectedTemplate.content.parties.employer}</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                     <h3 className="font-semibold text-gray-800 mb-2">Bên B</h3>
                     <p className="text-gray-700">{selectedTemplate.content.parties.employee}</p>
                  </div>
               </div>

               {/* Articles */}
               <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Nội dung hợp đồng</h3>
                  <div className="space-y-4">
                     {selectedTemplate.content.articles.map((article: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-gray-300 pl-4">
                           <h4 className="font-medium text-gray-800">{article.article}</h4>
                           <p className="text-gray-700 mt-1 leading-relaxed">{article.content}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t pt-4 mt-6">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <p className="text-sm text-gray-600">Đã ký kết tại</p>
                        <p className="text-sm text-gray-800 font-medium">[Địa điểm ký kết]</p>
                        <p className="text-sm text-gray-800 font-medium">Ngày [Ngày] tháng [Tháng] năm [Năm]</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm text-gray-600">Đã ký kết tại</p>
                        <p className="text-sm text-gray-800 font-medium">[Địa điểm ký kết]</p>
                        <p className="text-sm text-gray-800 font-medium">Ngày [Ngày] tháng [Tháng] năm [Năm]</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-8">
                     <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Đại diện Bên A</p>
                        <div className="border-b-2 border-gray-300 pb-2">
                           <p className="text-gray-800 font-medium">[Chức vụ]</p>
                           <p className="text-gray-800">[Họ và tên]</p>
                        </div>
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Đại diện Bên B</p>
                        <div className="border-b-2 border-gray-300 pb-2">
                           <p className="text-gray-800 font-medium">[Chức vụ]</p>
                           <p className="text-gray-800">[Họ và tên]</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                     Đóng
                  </Button>
                  <Button onClick={() => {
                     setShowPreviewModal(false);
                     handleUseTemplate(selectedTemplate);
                  }}>
                     Sử dụng mẫu này
                  </Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default HRView;