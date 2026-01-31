import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, Briefcase, User as UserIcon, Phone, Mail, Activity, Loader2, FileText, Calendar, Users, Home, Heart, Award, GraduationCap, Building, Clock, Edit, Eye, Download, Upload, Shield, BookOpen, DollarSign, TrendingUp, TrendingDown, Bell } from 'lucide-react';
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
  const [showPayrollDetailModal, setShowPayrollDetailModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<any>(null);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    staffId: 0,
    type: 'Ngh盻・phﾃｩp nﾄノ',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    contactInfo: ''
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
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
      name: 'Cﾃ年G TY TNHH [Tﾃｪn cﾃｴng ty]',
      address: '[ﾄ雪ｻ蟻 ch盻・cﾃｴng ty]',
      phone: '[S盻・ﾄ訴盻㌻ tho蘯｡i]',
      email: '[Email]',
      taxCode: '[Mﾃ｣ s盻・thu蘯ｿ]',
      representative: '[Tﾃｪn ﾄ黛ｺ｡i di盻㌻]',
      position: '[Ch盻ｩc v盻･ ﾄ黛ｺ｡i di盻㌻]'
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
        staffName: staffList[0]?.fullName || 'Nguy盻・ Vﾄハ A',
        contractType: 'PERMANENT',
        startDate: '2023-01-15',
        endDate: '2026-01-14',
        position: 'Giﾃ｡o viﾃｪn Toﾃ｡n',
        salary: 15000000,
        benefits: 'B蘯｣o hi盻ノ y t蘯ｿ, ph盻･ c蘯･p ﾄハ trﾆｰa, thﾆｰ盻殤g hi盻㎡ su蘯･t',
        terms: 'H盻｣p ﾄ黛ｻ渡g lao ﾄ黛ｻ冢g theo quy ﾄ黛ｻ杵h phﾃ｡p lu蘯ｭt Vi盻㏄ Nam',
        status: 'ACTIVE',
        createdAt: '2023-01-15'
      },
      {
        id: 2,
        staffId: staffList[1]?.id || 2,
        staffName: staffList[1]?.fullName || 'Tr蘯ｧn Th盻・B',
        contractType: 'TEMPORARY',
        startDate: '2023-03-01',
        endDate: '2023-12-31',
        position: 'Giﾃ｡o viﾃｪn Vﾄハ',
        salary: 12000000,
        benefits: 'B蘯｣o hi盻ノ xﾃ｣ h盻冓, ph盻･ c蘯･p ﾄ訴 l蘯｡i',
        terms: 'H盻｣p ﾄ黛ｻ渡g th盻拱 v盻･ 10 thﾃ｡ng',
        status: 'ACTIVE',
        createdAt: '2023-03-01'
      }
    ]);

    // Mock family members data
    setFamilyMembers([
      {
        id: 1,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguy盻・ Vﾄハ A',
        name: 'Nguy盻・ Vﾄハ B',
        relationship: 'V盻｣',
        phone: '0901234568',
        email: 'nguyenvanb@email.com',
        occupation: 'Giﾃ｡o viﾃｪn',
        address: 'Hﾃ N盻冓',
        emergencyContact: true
      },
      {
        id: 2,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguy盻・ Vﾄハ A',
        name: 'Nguy盻・ Vﾄハ C',
        relationship: 'Con',
        phone: '0901234569',
        email: '',
        occupation: 'H盻皇 sinh',
        address: 'Hﾃ N盻冓',
        emergencyContact: false
      }
    ]);

    // Mock payroll data
    setPayrolls([
      {
        id: 1,
        staffId: staffList[0]?.id || 1,
        staffName: staffList[0]?.fullName || 'Nguy盻・ Vﾄハ A',
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
        staffName: staffList[1]?.fullName || 'Tr蘯ｧn Th盻・B',
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
        staffName: staffList[2]?.fullName || 'Lﾃｪ Vﾄハ C',
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
        name: 'H盻｣p ﾄ黛ｻ渡g Lao ﾄ黛ｻ冢g',
        type: 'LABOR',
        description: 'H盻｣p ﾄ黛ｻ渡g lao ﾄ黛ｻ冢g theo B盻・lu蘯ｭt Lao ﾄ黛ｻ冢g Vi盻㏄ Nam',
        icon: '塘',
        color: 'blue',
        content: {
          title: 'H盻｢P ﾄ雪ｻ誰G LAO ﾄ雪ｻ朗G',
          parties: {
            employer: 'Bﾃ劾 A - Cﾃ年G TY [Tﾃｪn cﾃｴng ty]',
            employee: 'Bﾃ劾 B - NGﾆｯ盻廬 LAO ﾄ雪ｻ朗G'
          },
          articles: [
            {
              article: 'ﾄ進盻「 1: N盻冓 dung cﾃｴng vi盻㌘',
              content: 'Bﾃｪn B ﾄ黛ｻ渡g ﾃｽ lﾃm vi盻㌘ theo v盻・trﾃｭ [Ch盻ｩc v盻･] v盻嬖 cﾃ｡c n盻冓 dung cﾃｴng vi盻㌘ c盻･ th盻・nhﾆｰ ﾄ妥｣ th盻渋 thu蘯ｭn trong b蘯｣n mﾃｴ t蘯｣ cﾃｴng vi盻㌘.'
            },
            {
              article: 'ﾄ進盻「 2: Th盻拱 h蘯｡n h盻｣p ﾄ黛ｻ渡g',
              content: 'H盻｣p ﾄ黛ｻ渡g nﾃy ﾄ柁ｰ盻｣c kﾃｽ k蘯ｿt t盻ｫ ngﾃy [Ngﾃy b蘯ｯt ﾄ黛ｺｧu] ﾄ黛ｺｿn ngﾃy [Ngﾃy k蘯ｿt thﾃｺc]. Th盻拱 gian th盻ｭ vi盻㌘ lﾃ [S盻・thﾃ｡ng] thﾃ｡ng.'
            },
            {
              article: 'ﾄ進盻「 3: ﾄ雪ｻ蟻 ﾄ訴盻ノ lﾃm vi盻㌘',
              content: 'Bﾃｪn B lﾃm vi盻㌘ t蘯｡i [ﾄ雪ｻ蟻 ﾄ訴盻ノ lﾃm vi盻㌘].'
            },
            {
              article: 'ﾄ進盻「 4: Ch蘯ｿ ﾄ黛ｻ・ti盻］ lﾆｰﾆ｡ng',
              content: 'M盻ｩc lﾆｰﾆ｡ng cﾆ｡ b蘯｣n: [Lﾆｰﾆ｡ng] VNﾄ・thﾃ｡ng. Bﾃｪn A tr蘯｣ lﾆｰﾆ｡ng cho Bﾃｪn B h蘯ｱng thﾃ｡ng vﾃo ngﾃy [Ngﾃy tr蘯｣ lﾆｰﾆ｡ng].'
            },
            {
              article: 'ﾄ進盻「 5: Th盻拱 gian lﾃm vi盻㌘',
              content: 'Th盻拱 gian lﾃm vi盻㌘: [S盻・gi盻拆 gi盻・tu蘯ｧn. Th盻拱 gian ngh盻・ngﾆ｡i: [S盻・gi盻拆 gi盻・tu蘯ｧn.'
            },
            {
              article: 'ﾄ進盻「 6: Nghﾄｩa v盻･ c盻ｧa Bﾃｪn B',
              content: '- Th盻ｱc hi盻㌻ cﾃｴng vi盻㌘ theo ﾄ妥ｺng yﾃｪu c蘯ｧu\n- Tuﾃ｢n th盻ｧ n盻冓 quy, quy ch蘯ｿ c盻ｧa cﾃｴng ty\n- B蘯｣o v盻・tﾃi s蘯｣n c盻ｧa cﾃｴng ty'
            },
            {
              article: 'ﾄ進盻「 7: Quy盻］ l盻｣i c盻ｧa Bﾃｪn B',
              content: '- ﾄ脆ｰ盻｣c hﾆｰ盻殤g ﾄ黛ｺｧy ﾄ黛ｻｧ quy盻］ l盻｣i theo lu蘯ｭt ﾄ黛ｻ杵h\n- ﾄ脆ｰ盻｣c ﾄ妥o t蘯｡o, nﾃ｢ng cao trﾃｬnh ﾄ黛ｻ・chuyﾃｪn mﾃｴn\n- ﾄ脆ｰ盻｣c tham gia b蘯｣o hi盻ノ xﾃ｣ h盻冓, y t蘯ｿ, th蘯･t nghi盻㎝'
            },
            {
              article: 'ﾄ進盻「 8: Nghﾄｩa v盻･ c盻ｧa Bﾃｪn A',
              content: '- Tr蘯｣ lﾆｰﾆ｡ng ﾄ妥ｺng h蘯｡n\n- Cung c蘯･p ﾄ訴盻「 ki盻㌻ lﾃm vi盻㌘ an toﾃn\n- Tﾃｴn tr盻肱g nhﾃ｢n ph蘯ｩm, danh d盻ｱ c盻ｧa ngﾆｰ盻拱 lao ﾄ黛ｻ冢g'
            },
            {
              article: 'ﾄ進盻「 9: Ch蘯ｿ ﾄ黛ｻ・b蘯｣o hi盻ノ',
              content: 'Bﾃｪn A cﾃｳ trﾃ｡ch nhi盻㍊ ﾄ妥ｳng b蘯｣o hi盻ノ xﾃ｣ h盻冓, b蘯｣o hi盻ノ y t蘯ｿ, b蘯｣o hi盻ノ th蘯･t nghi盻㎝ cho Bﾃｪn B theo quy ﾄ黛ｻ杵h c盻ｧa phﾃ｡p lu蘯ｭt.'
            },
            {
              article: 'ﾄ進盻「 10: Gi蘯｣i quy蘯ｿt tranh ch蘯･p',
              content: 'M盻絞 tranh ch蘯･p phﾃ｡t sinh s蘯ｽ ﾄ柁ｰ盻｣c gi蘯｣i quy蘯ｿt thﾃｴng qua thﾆｰﾆ｡ng lﾆｰ盻｣ng, hﾃｲa gi蘯｣i. N蘯ｿu khﾃｴng gi蘯｣i quy蘯ｿt ﾄ柁ｰ盻｣c, s蘯ｽ ﾄ柁ｰa ra Tﾃｲa ﾃ｡n nhﾃ｢n dﾃ｢n cﾃｳ th蘯ｩm quy盻］.'
            }
          ]
        }
      },
      {
        id: 2,
        name: 'H盻｣p ﾄ黛ｻ渡g Mua bﾃ｡n',
        type: 'SALE',
        description: 'H盻｣p ﾄ黛ｻ渡g mua bﾃ｡n tﾃi s蘯｣n theo B盻・lu蘯ｭt Dﾃ｢n s盻ｱ',
        icon: '將',
        color: 'green',
        content: {
          title: 'H盻｢P ﾄ雪ｻ誰G MUA Bﾃ¨',
          parties: {
            seller: 'Bﾃ劾 Bﾃ¨ - [Tﾃｪn ngﾆｰ盻拱 bﾃ｡n]',
            buyer: 'Bﾃ劾 MUA - [Tﾃｪn ngﾆｰ盻拱 mua]'
          },
          articles: [
            {
              article: 'ﾄ進盻「 1: ﾄ雪ｻ訴 tﾆｰ盻｣ng h盻｣p ﾄ黛ｻ渡g',
              content: 'Bﾃｪn Bﾃ｡n ﾄ黛ｻ渡g ﾃｽ bﾃ｡n vﾃ Bﾃｪn Mua ﾄ黛ｻ渡g ﾃｽ mua tﾃi s蘯｣n sau: [Mﾃｴ t蘯｣ tﾃi s蘯｣n]'
            },
            {
              article: 'ﾄ進盻「 2: Giﾃ｡ tr盻・h盻｣p ﾄ黛ｻ渡g',
              content: 'Giﾃ｡ tr盻・tﾃi s蘯｣n lﾃ: [Giﾃ｡] VNﾄ・ Phﾆｰﾆ｡ng th盻ｩc thanh toﾃ｡n: [Phﾆｰﾆ｡ng th盻ｩc thanh toﾃ｡n]'
            },
            {
              article: 'ﾄ進盻「 3: Chuy盻ハ giao tﾃi s蘯｣n',
              content: 'Bﾃｪn Bﾃ｡n giao tﾃi s蘯｣n cho Bﾃｪn Mua vﾃo ngﾃy [Ngﾃy giao]. Bﾃｪn Mua ki盻ノ tra vﾃ xﾃ｡c nh蘯ｭn tﾃｬnh tr蘯｡ng tﾃi s蘯｣n.'
            },
            {
              article: 'ﾄ進盻「 4: Quy盻］ vﾃ nghﾄｩa v盻･ c盻ｧa Bﾃｪn Bﾃ｡n',
              content: '- ﾄ雪ｺ｣m b蘯｣o quy盻］ s盻・h盻ｯu h盻｣p phﾃ｡p\n- Giao tﾃi s蘯｣n ﾄ妥ｺng th盻拱 h蘯｡n, ﾄ妥ｺng ch蘯･t lﾆｰ盻｣ng\n- Cung c蘯･p ﾄ黛ｺｧy ﾄ黛ｻｧ gi蘯･y t盻・phﾃ｡p lﾃｽ'
            },
            {
              article: 'ﾄ進盻「 5: Quy盻］ vﾃ nghﾄｩa v盻･ c盻ｧa Bﾃｪn Mua',
              content: '- Thanh toﾃ｡n ﾄ黛ｻｧ giﾃ｡ tr盻・tﾃi s蘯｣n\n- Nh蘯ｭn tﾃi s蘯｣n vﾃ ki盻ノ tra tﾃｬnh tr蘯｡ng\n- ﾄ斉ハg kﾃｽ quy盻］ s盻・h盻ｯu (n蘯ｿu cﾃｳ)'
            },
            {
              article: 'ﾄ進盻「 6: Cam k蘯ｿt',
              content: 'C蘯｣ hai bﾃｪn cam k蘯ｿt th盻ｱc hi盻㌻ ﾄ妥ｺng cﾃ｡c nghﾄｩa v盻･ trong h盻｣p ﾄ黛ｻ渡g.'
            },
            {
              article: 'ﾄ進盻「 7: Trﾃ｡ch nhi盻㍊ vi ph蘯｡m',
              content: 'Bﾃｪn nﾃo vi ph蘯｡m s蘯ｽ ch盻丘 trﾃ｡ch nhi盻㍊ b盻妬 thﾆｰ盻拵g thi盻㏄ h蘯｡i theo quy ﾄ黛ｻ杵h phﾃ｡p lu蘯ｭt.'
            }
          ]
        }
      },
      {
        id: 3,
        name: 'H盻｣p ﾄ黛ｻ渡g H盻｣p tﾃ｡c',
        type: 'COOPERATION',
        description: 'H盻｣p ﾄ黛ｻ渡g h盻｣p tﾃ｡c kinh doanh',
        icon: '､・,
        color: 'purple',
        content: {
          title: 'H盻｢P ﾄ雪ｻ誰G H盻｢P Tﾃ， KINH DOANH',
          parties: {
            partyA: 'Bﾃ劾 A - [Tﾃｪn bﾃｪn A]',
            partyB: 'Bﾃ劾 B - [Tﾃｪn bﾃｪn B]'
          },
          articles: [
            {
              article: 'ﾄ進盻「 1: M盻･c tiﾃｪu h盻｣p tﾃ｡c',
              content: 'C蘯｣ hai bﾃｪn cﾃｹng nhau h盻｣p tﾃ｡c trong lﾄｩnh v盻ｱc [Lﾄｩnh v盻ｱc h盻｣p tﾃ｡c] nh蘯ｱm m盻･c tiﾃｪu [M盻･c tiﾃｪu].'
            },
            {
              article: 'ﾄ進盻「 2: Ph蘯｡m vi h盻｣p tﾃ｡c',
              content: 'Ph蘯｡m vi h盻｣p tﾃ｡c bao g盻杜: [Chi ti蘯ｿt ph蘯｡m vi h盻｣p tﾃ｡c]'
            },
            {
              article: 'ﾄ進盻「 3: Th盻拱 h蘯｡n h盻｣p tﾃ｡c',
              content: 'H盻｣p ﾄ黛ｻ渡g cﾃｳ hi盻㎡ l盻ｱc t盻ｫ ngﾃy [Ngﾃy b蘯ｯt ﾄ黛ｺｧu] ﾄ黛ｺｿn ngﾃy [Ngﾃy k蘯ｿt thﾃｺc].'
            },
            {
              article: 'ﾄ進盻「 4: Trﾃ｡ch nhi盻㍊ c盻ｧa Bﾃｪn A',
              content: '[Trﾃ｡ch nhi盻㍊ c盻･ th盻・c盻ｧa Bﾃｪn A]'
            },
            {
              article: 'ﾄ進盻「 5: Trﾃ｡ch nhi盻㍊ c盻ｧa Bﾃｪn B',
              content: '[Trﾃ｡ch nhi盻㍊ c盻･ th盻・c盻ｧa Bﾃｪn B]'
            },
            {
              article: 'ﾄ進盻「 6: Phﾃ｢n chia l盻｣i nhu蘯ｭn',
              content: 'L盻｣i nhu蘯ｭn ﾄ柁ｰ盻｣c phﾃ｢n chia theo t盻ｷ l盻・ [T盻ｷ l盻・phﾃ｢n chia]'
            },
            {
              article: 'ﾄ進盻「 7: B蘯｣o m蘯ｭt thﾃｴng tin',
              content: 'C蘯｣ hai bﾃｪn cam k蘯ｿt b蘯｣o m蘯ｭt thﾃｴng tin trong su盻奏 quﾃ｡ trﾃｬnh h盻｣p tﾃ｡c.'
            }
          ]
        }
      },
      {
        id: 4,
        name: 'Biﾃｪn b蘯｣n Ghi nh盻・,
        type: 'MEMORANDUM',
        description: 'Biﾃｪn b蘯｣n ghi nh盻・th盻渋 thu蘯ｭn',
        icon: '統',
        color: 'orange',
        content: {
          title: 'BIﾃ劾 B蘯｢N GHI NH盻・,
          parties: {
            party1: 'Bﾃ劾 1 - [Tﾃｪn bﾃｪn 1]',
            party2: 'Bﾃ劾 2 - [Tﾃｪn bﾃｪn 2]'
          },
          articles: [
            {
              article: '1. N盻冓 dung th盻渋 thu蘯ｭn',
              content: '[N盻冓 dung chﾃｭnh c盻ｧa th盻渋 thu蘯ｭn]'
            },
            {
              article: '2. Th盻拱 gian th盻ｱc hi盻㌻',
              content: 'Th盻渋 thu蘯ｭn cﾃｳ hi盻㎡ l盻ｱc t盻ｫ ngﾃy [Ngﾃy] vﾃ ﾄ柁ｰ盻｣c th盻ｱc hi盻㌻ trong th盻拱 gian [Th盻拱 gian].'
            },
            {
              article: '3. Trﾃ｡ch nhi盻㍊ th盻ｱc hi盻㌻',
              content: 'C蘯｣ hai bﾃｪn cﾃｹng ch盻丘 trﾃ｡ch nhi盻㍊ th盻ｱc hi盻㌻ cﾃ｡c n盻冓 dung ﾄ妥｣ th盻渋 thu蘯ｭn.'
            },
            {
              article: '4. Hi盻㎡ l盻ｱc phﾃ｡p lﾃｽ',
              content: 'Biﾃｪn b蘯｣n nﾃy cﾃｳ giﾃ｡ tr盻・phﾃ｡p lﾃｽ vﾃ lﾃ cﾆ｡ s盻・cho cﾃ｡c th盻渋 thu蘯ｭn sau nﾃy.'
            }
          ]
        }
      }
    ]);

    // T蘯｡o thﾃｴng bﾃ｡o m蘯ｫu ﾄ黛ｻ・test
    const sampleNotifications = [
      {
        id: Date.now() - 10000,
        type: 'leave_request',
        title: 'ﾄ脆｡n xin phﾃｩp m盻嬖',
        message: 'Nguy盻・ Vﾄハ A (Khoa Toﾃ｡n - Lﾃｽ - Hﾃｳa) xin ngh盻・phﾃｩp nﾄノ t盻ｫ ngﾃy 2024-02-01 ﾄ黛ｺｿn 2024-02-03. Lﾃｽ do: Vi盻㌘ gia ﾄ妥ｬnh',
        recipientId: 1, // Gi蘯｣ s盻ｭ ID 1 lﾃ qu蘯｣n lﾃｽ
        timestamp: new Date(Date.now() - 3600000), // 1 gi盻・trﾆｰ盻嫩
        read: false
      },
      {
        id: Date.now() - 5000,
        type: 'leave_approved',
        title: 'ﾄ脆｡n xin phﾃｩp ﾄ柁ｰ盻｣c duy盻㏄',
        message: 'ﾄ脆｡n xin ngh盻・phﾃｩp nﾄノ c盻ｧa b蘯｡n t盻ｫ ngﾃy 2024-01-25 ﾄ黛ｺｿn 2024-01-26 ﾄ妥｣ ﾄ柁ｰ盻｣c duy盻㏄. Chﾃｺc b蘯｡n cﾃｳ k盻ｳ ngh盻・vui v蘯ｻ!',
        recipientId: 2, // Gi蘯｣ s盻ｭ ID 2 lﾃ nhﾃ｢n viﾃｪn
        timestamp: new Date(Date.now() - 1800000), // 30 phﾃｺt trﾆｰ盻嫩
        read: false
      }
    ];
    
    setNotifications(sampleNotifications);
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

    // T盻ｱ ﾄ黛ｻ冢g t蘯｡o h盻｣p ﾄ黛ｻ渡g cho nhﾃ｢n viﾃｪn m盻嬖
    const newContract = {
      id: Date.now() + 1,
      staffId: newStaff.id,
      staffName: newStaff.fullName,
      contractType: 'PROBATION',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 thﾃ｡ng th盻ｭ vi盻㌘
      position: newStaffForm.role,
      salary: newStaffForm.salary,
      benefits: 'B蘯｣o hi盻ノ xﾃ｣ h盻冓, b蘯｣o hi盻ノ y t蘯ｿ, ph盻･ c蘯･p ﾄハ trﾆｰa',
      terms: 'H盻｣p ﾄ黛ｻ渡g th盻ｭ vi盻㌘ 3 thﾃ｡ng theo quy ﾄ黛ｻ杵h phﾃ｡p lu蘯ｭt Vi盻㏄ Nam',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setContracts([...contracts, newContract]);

    // T蘯｡o b蘯｣ng lﾆｰﾆ｡ng cho nhﾃ｢n viﾃｪn m盻嬖
    const newPayroll = {
      id: Date.now() + 2,
      staffId: newStaff.id,
      staffName: newStaff.fullName,
      baseSalary: parseFloat(newStaffForm.salary),
      allowances: Math.floor(parseFloat(newStaffForm.salary) * 0.15), // 15% lﾆｰﾆ｡ng cﾆ｡ b蘯｣n
      bonuses: 0,
      deductions: Math.floor(parseFloat(newStaffForm.salary) * 0.105), // 10.5% (8% BHXH + 1.5% BHYT + 1% BHTN)
      grossSalary: 0,
      netSalary: 0,
      payPeriod: new Date().toISOString().slice(0, 7), // Thﾃ｡ng hi盻㌻ t蘯｡i
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
    alert('ﾄ静｣ thﾃｪm nhﾃ｢n viﾃｪn vﾃ t蘯｡o h盻｣p ﾄ黛ｻ渡g thﾃnh cﾃｴng!');
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
    alert('ﾄ静｣ t蘯｡o h盻｣p ﾄ黛ｻ渡g thﾃnh cﾃｴng!');
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
      education: 'ﾄ雪ｺ｡i h盻皇 Sﾆｰ ph蘯｡m Hﾃ N盻冓',
      experience: '5 nﾄノ gi蘯｣ng d蘯｡y',
      skills: 'Toﾃ｡n, Lﾃｽ, Hﾃｳa',
      certifications: 'Giﾃ｡o viﾃｪn gi盻淑',
      address: '123 Nguy盻・ Chﾃｭ Thanh, Hﾃ N盻冓',
      emergencyContact: 'Nguy盻・ Vﾄハ B - 0901234568',
      bankAccount: 'VCB 1234567890'
    });
    setShowProfileModal(true);
  };

  const handleViewContractDetail = (contract: any) => {
    // M盻・modal chi ti蘯ｿt h盻｣p ﾄ黛ｻ渡g
    alert(`Chi ti蘯ｿt h盻｣p ﾄ黛ｻ渡g #${contract.id}\n\nNhﾃ｢n viﾃｪn: ${contract.staffName}\nLo蘯｡i h盻｣p ﾄ黛ｻ渡g: ${contract.contractType === 'PERMANENT' ? 'Vﾄｩnh vi盻・' : 'Th盻拱 v盻･'}\nCh盻ｩc v盻･: ${contract.position}\nLﾆｰﾆ｡ng: ${formatCurrency(contract.salary)}\nTh盻拱 gian: ${contract.startDate} - ${contract.endDate}\nPhﾃｺc l盻｣i: ${contract.benefits}\nﾄ進盻「 kho蘯｣n: ${contract.terms}\nTr蘯｡ng thﾃ｡i: ${contract.status === 'ACTIVE' ? 'Hi盻㎡ l盻ｱc' : 'H蘯ｿt h蘯｡n'}\nNgﾃy t蘯｡o: ${contract.createdAt}`);
  };

  const handleUpdateProfile = () => {
    if (selectedStaff) {
      setStaffList(staffList.map(s => 
        s.id === selectedStaff.id ? {...s, ...profileForm} : s
      ));
      setShowProfileModal(false);
      alert('ﾄ静｣ c蘯ｭp nh蘯ｭt thﾃｴng tin nhﾃ｢n viﾃｪn thﾃnh cﾃｴng!');
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
    alert('ﾄ静｣ thﾃｪm thﾃnh viﾃｪn gia ﾄ妥ｬnh thﾃnh cﾃｴng!');
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

  const handleViewPayrollDetail = (payroll: any) => {
    setSelectedPayroll(payroll);
    setShowPayrollDetailModal(true);
  };

  const handleEditFamilyMember = (member: any) => {
    setSelectedFamilyMember(member);
    setFamilyForm({
      staffId: member.staffId,
      name: member.name,
      relationship: member.relationship,
      phone: member.phone,
      email: member.email,
      occupation: member.occupation,
      address: member.address,
      emergencyContact: member.emergencyContact
    });
    setShowEditFamilyModal(true);
  };

  const handleUpdateFamilyMember = () => {
    if (!selectedFamilyMember) return;
    
    setFamilyMembers(familyMembers.map(member => 
      member.id === selectedFamilyMember.id 
        ? { ...member, ...familyForm }
        : member
    ));
    
    setShowEditFamilyModal(false);
    setSelectedFamilyMember(null);
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
  };

  const handleDeleteFamilyMember = (memberId: number) => {
    if (confirm('B蘯｡n cﾃｳ ch蘯ｯc ch蘯ｯn mu盻創 xﾃｳa thﾃnh viﾃｪn gia ﾄ妥ｬnh nﾃy?')) {
      setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setNewStaffForm({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      position: staff.position,
      salary: staff.salary,
      startDate: staff.startDate,
      status: staff.status
    });
    setShowEditStaffModal(true);
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    
    setStaffList(staffList.map(staff => 
      staff.id === editingStaff.id 
        ? { ...staff, ...newStaffForm }
        : staff
    ));
    
    setShowEditStaffModal(false);
    setEditingStaff(null);
    setNewStaffForm({
      fullName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      startDate: '',
      status: 'ACTIVE'
    });
  };

  const handleAddLeaveRequest = () => {
    if (!leaveForm.staffId || !leaveForm.startDate || !leaveForm.reason) {
      alert('Vui lﾃｲng ﾄ訴盻］ ﾄ黛ｺｧy ﾄ黛ｻｧ thﾃｴng tin b蘯ｯt bu盻冂!');
      return;
    }

    const newLeaveRequest = {
      id: Date.now(),
      staffId: leaveForm.staffId,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate || leaveForm.startDate,
      reason: leaveForm.reason,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      halfDay: leaveForm.halfDay,
      contactInfo: leaveForm.contactInfo
    };

    setLeaveRequests([...leaveRequests, newLeaveRequest]);
    
    const staff = staffList.find(s => s.id === leaveForm.staffId);
    
    // G盻ｭi thﾃｴng bﾃ｡o cho t蘯･t c蘯｣ qu蘯｣n lﾃｽ (Ban Giﾃ｡m hi盻㎡)
    const managers = staffList.filter(s => s.department === 'Ban Giﾃ｡m hi盻㎡');
    managers.forEach(manager => {
      addNotification({
        id: Date.now() + Math.random(),
        type: 'leave_request',
        title: 'ﾄ脆｡n xin phﾃｩp m盻嬖',
        message: `${staff?.fullName} (${staff?.department}) xin ngh盻・${leaveForm.type.toLowerCase()} t盻ｫ ngﾃy ${leaveForm.startDate} ﾄ黛ｺｿn ${leaveForm.endDate || leaveForm.startDate}. Lﾃｽ do: ${leaveForm.reason}`,
        recipientId: manager.id,
        timestamp: new Date(),
        read: false,
        leaveRequestId: newLeaveRequest.id
      });
    });
    
    // Reset form
    setLeaveForm({
      staffId: 0,
      type: 'Ngh盻・phﾃｩp nﾄノ',
      startDate: '',
      endDate: '',
      reason: '',
      halfDay: false,
      contactInfo: ''
    });
    
    setShowAddLeaveModal(false);
    alert('ﾄ静｣ g盻ｭi ﾄ柁｡n xin phﾃｩp thﾃnh cﾃｴng! Qu蘯｣n lﾃｽ s蘯ｽ xem xﾃｩt vﾃ ph蘯｣n h盻妬 s盻嬶.');
  };

  const handleApproveLeave = (leaveId: number) => {
    const leaveRequest = leaveRequests.find(req => req.id === leaveId);
    const staff = staffList.find(s => s.id === leaveRequest?.staffId);
    
    setLeaveRequests(leaveRequests.map(req => 
      req.id === leaveId ? { ...req, status: 'Approved' } : req
    ));
    
    // Thﾃｴng bﾃ｡o cho nhﾃ｢n viﾃｪn ﾄ柁ｰ盻｣c duy盻㏄
    addNotification({
      id: Date.now(),
      type: 'leave_approved',
      title: 'ﾄ脆｡n xin phﾃｩp ﾄ柁ｰ盻｣c duy盻㏄',
      message: `ﾄ脆｡n xin ngh盻・${leaveRequest?.type.toLowerCase()} c盻ｧa b蘯｡n t盻ｫ ngﾃy ${leaveRequest?.startDate} ﾄ黛ｺｿn ${leaveRequest?.endDate} ﾄ妥｣ ﾄ柁ｰ盻｣c duy盻㏄. Chﾃｺc b蘯｡n cﾃｳ k盻ｳ ngh盻・vui v蘯ｻ!`,
      recipientId: leaveRequest?.staffId,
      timestamp: new Date(),
      read: false
    });
    
    alert('ﾄ静｣ duy盻㏄ ﾄ柁｡n xin phﾃｩp!');
  };

  const handleRejectLeave = (leaveId: number) => {
    const leaveRequest = leaveRequests.find(req => req.id === leaveId);
    const staff = staffList.find(s => s.id === leaveRequest?.staffId);
    
    setLeaveRequests(leaveRequests.map(req => 
      req.id === leaveId ? { ...req, status: 'Rejected' } : req
    ));
    
    // Thﾃｴng bﾃ｡o cho nhﾃ｢n viﾃｪn b盻・t盻ｫ ch盻訴
    addNotification({
      id: Date.now(),
      type: 'leave_rejected',
      title: 'ﾄ脆｡n xin phﾃｩp b盻・t盻ｫ ch盻訴',
      message: `ﾄ脆｡n xin ngh盻・${leaveRequest?.type.toLowerCase()} c盻ｧa b蘯｡n t盻ｫ ngﾃy ${leaveRequest?.startDate} ﾄ妥｣ b盻・t盻ｫ ch盻訴.`,
      recipientId: leaveRequest?.staffId,
      timestamp: new Date(),
      read: false
    });
    
    alert('ﾄ静｣ t盻ｫ ch盻訴 ﾄ柁｡n xin phﾃｩp!');
  };

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read);
  };

  const getNotificationsForUser = (userId: number) => {
    return notifications.filter(notif => notif.recipientId === userId);
  };

  const handleGenerateContract = () => {
    if (!selectedTemplate || !templateForm.staffId) {
      alert('Vui lﾃｲng ch盻肱 nhﾃ｢n viﾃｪn!');
      return;
    }

    const staff = staffList.find(s => s.id === parseInt(templateForm.staffId));
    if (!staff) return;

    // T蘯｡o cﾃ｡c trang h盻｣p ﾄ黛ｻ渡g
    const pages = generateContractPages(selectedTemplate, templateForm, staff);
    setContractPages(pages);
    setCurrentPage(0);

    // T蘯｡o h盻｣p ﾄ黛ｻ渡g t盻ｫ m蘯ｫu
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
    alert(`ﾄ静｣ t蘯｡o h盻｣p ﾄ黛ｻ渡g ${selectedTemplate.name} cho ${staff.fullName} thﾃnh cﾃｴng!`);
  };

  const generateContractPages = (template: any, form: any, staff: Staff) => {
    const pages = [];
    const qrCode = generateQRCode(Date.now().toString());
    
    // Trang 1: Trang bﾃｬa vﾃ thﾃｴng tin cﾆ｡ b蘯｣n
    pages.push({
      id: 1,
      title: 'TRANG Bﾃ窟',
      content: {
        header: {
          title: template.content.title,
          subtitle: 'C盻朗G Hﾃ但 Xﾃ・H盻露 CH盻ｦ NGHﾄｨA VI盻・ NAM',
          subtitle2: 'ﾄ雪ｻ冂 l蘯ｭp - T盻ｱ do - H蘯｡nh phﾃｺc',
          qrCode: qrCode,
          contractCode: `Hﾄ・{Date.now().toString().slice(-6)}`
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

    // Trang 2: Thﾃｴng tin doanh nghi盻㎝
    pages.push({
      id: 2,
      title: 'THﾃ年G TIN DOANH NGHI盻・',
      content: {
        company: {
          ...form.companyInfo,
          businessLicense: '[Gi蘯･y phﾃｩp kinh doanh s盻曽',
          capital: '[V盻創 ﾄ訴盻「 l盻Ⅹ',
          bankAccount: '[Tﾃi kho蘯｣n ngﾃ｢n hﾃng cﾃｴng ty]'
        },
        qrCode: qrCode,
        pageNumber: 2
      }
    });

    // Trang 3: Thﾃｴng tin ngﾆｰ盻拱 lao ﾄ黛ｻ冢g
    pages.push({
      id: 3,
      title: 'THﾃ年G TIN NGﾆｯ盻廬 LAO ﾄ雪ｻ朗G',
      content: {
        employee: {
          ...staff,
          ...form.employeeInfo,
          education: '[Trﾃｬnh ﾄ黛ｻ・h盻皇 v蘯･n]',
          experience: '[Kinh nghi盻㍊ lﾃm vi盻㌘]',
          skills: '[K盻ｹ nﾄハg chuyﾃｪn mﾃｴn]'
        },
        qrCode: qrCode,
        pageNumber: 3
      }
    });

    // Trang 4: N盻冓 dung cﾃｴng vi盻㌘ vﾃ ﾄ訴盻「 kho蘯｣n
    pages.push({
      id: 4,
      title: 'N盻露 DUNG Cﾃ年G VI盻・',
      content: {
        jobDescription: {
          position: form.position,
          workLocation: form.workLocation,
          workHours: form.workHours,
          workDays: form.workDays,
          duties: '[Mﾃｴ t蘯｣ chi ti蘯ｿt cﾃｴng vi盻㌘]'
        },
        articles: template.content.articles,
        qrCode: qrCode,
        pageNumber: 4
      }
    });

    // Trang 5: B蘯｣ng lﾆｰﾆ｡ng chi ti蘯ｿt
    pages.push({
      id: 5,
      title: 'B蘯｢NG LﾆｯﾆNG CHI TI蘯ｾT',
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

    // Tﾃｭnh toﾃ｡n lﾆｰﾆ｡ng
    const payrollPage = pages[4].content.payroll;
    payrollPage.grossSalary = payrollPage.baseSalary + 
      Object.values(payrollPage.allowances).reduce((a: number, b: number) => a + b, 0) +
      Object.values(payrollPage.bonuses).reduce((a: number, b: number) => a + b, 0);
    
    const totalDeductions = (payrollPage.baseSalary * (payrollPage.deductions.socialInsurance + payrollPage.deductions.healthInsurance + payrollPage.deductions.unemploymentInsurance) / 100) + payrollPage.deductions.incomeTax;
    payrollPage.netSalary = payrollPage.grossSalary - totalDeductions;

    // Trang 6: Ph盻･ l盻･c vﾃ ch盻ｯ kﾃｽ
    pages.push({
      id: 6,
      title: 'PH盻､ L盻､C Vﾃ CH盻ｮ Kﾃ・,
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
            date: '[Ngﾃy kﾃｽ]'
          },
          employee: {
            name: staff.fullName,
            position: form.position,
            date: '[Ngﾃy kﾃｽ]'
          }
        },
        qrCode: qrCode,
        pageNumber: 6
      }
    });

    return pages;
  };

  const generateQRCode = (data: string) => {
    // T蘯｡o mﾃ｣ QR ﾄ柁｡n gi蘯｣n (trong th盻ｱc t蘯ｿ s蘯ｽ dﾃｹng thﾆｰ vi盻㌻ QR)
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
           <h2 className="text-2xl font-bold text-gray-800">Qu蘯｣n tr盻・Nhﾃ｢n s盻ｱ</h2>
           <p className="text-gray-500">Qu蘯｣n lﾃｽ h盻・sﾆ｡ nhﾃ｢n viﾃｪn vﾃ ngh盻・phﾃｩp</p>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            <Bell size={20} />
            {getUnreadNotifications().length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
            {getUnreadNotifications().length > 1 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getUnreadNotifications().length}
              </span>
            )}
          </button>
          
          {/* Notification Panel */}
          {showNotificationPanel && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Thﾃｴng bﾃ｡o</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Chﾆｰa cﾃｳ thﾃｴng bﾃ｡o nﾃo
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.type === 'leave_request' ? 'bg-yellow-500' :
                          notif.type === 'leave_approved' ? 'bg-green-500' :
                          notif.type === 'leave_rejected' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">{notif.title}</h4>
                          <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {new Date(notif.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('staff')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'staff' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Users size={18} className="mr-2"/> Danh sﾃ｡ch NV
           </button>
           <button 
             onClick={() => setActiveTab('contracts')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'contracts' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <FileText size={18} className="mr-2"/> H盻｣p ﾄ黛ｻ渡g
           </button>
           <button 
             onClick={() => setActiveTab('templates')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Upload size={18} className="mr-2"/> M蘯ｫu Hﾄ・           </button>
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <UserIcon size={18} className="mr-2"/> Thﾃｴng tin
           </button>
           <button 
             onClick={() => setActiveTab('family')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'family' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Home size={18} className="mr-2"/> Gia ﾄ妥ｬnh
           </button>
           <button 
             onClick={() => setActiveTab('leave')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'leave' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             <Calendar size={18} className="mr-2"/> Duy盻㏄ Phﾃｩp
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
                  placeholder="Tﾃｬm ki蘯ｿm nhﾃ｢n viﾃｪn, phﾃｲng ban..." 
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
                   {isEvaluating ? 'ﾄ紳ng ﾄ妥｡nh giﾃ｡...' : 'AI ﾄ静｡nh giﾃ｡'}
                </Button>
                <Button onClick={() => setShowAddStaffModal(true)}><Plus size={20}/> Thﾃｪm Nhﾃ｢n viﾃｪn</Button>
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
                        {s.status === 'Active' ? 'ﾄ紳ng lﾃm' : 'Ngh盻・phﾃｩp'}
                     </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1">
                     <div className="flex items-center gap-2"><Briefcase size={16}/> {s.department}</div>
                     <div className="flex items-center gap-2"><Mail size={16}/> {s.email}</div>
                     <div className="flex items-center gap-2"><Phone size={16}/> {s.phone}</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                     <span className="text-xs text-gray-500">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</span>
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
            <h3 className="text-lg font-semibold">Qu蘯｣n lﾃｽ H盻｣p ﾄ黛ｻ渡g Lao ﾄ黛ｻ冢g</h3>
            <Button onClick={() => setShowContractModal(true)}>
              <Plus size={18} /> T蘯｡o H盻｣p ﾄ黛ｻ渡g
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Mﾃ｣ Hﾄ・/th>
                  <th className="p-4">Nhﾃ｢n viﾃｪn</th>
                  <th className="p-4">Lo蘯｡i Hﾄ・/th>
                  <th className="p-4">Ch盻ｩc v盻･</th>
                  <th className="p-4 text-right">Lﾆｰﾆ｡ng</th>
                  <th className="p-4">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</th>
                  <th className="p-4">Ngﾃy k蘯ｿt thﾃｺc</th>
                  <th className="p-4 text-center">Tr蘯｡ng thﾃ｡i</th>
                  <th className="p-4 text-right">Hﾃnh ﾄ黛ｻ冢g</th>
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
                        {contract.contractType === 'PERMANENT' ? 'Vﾄｩnh vi盻・' : 'Th盻拱 v盻･'}
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
                        {contract.status === 'ACTIVE' ? 'Hi盻㎡ l盻ｱc' : 'H蘯ｿt h蘯｡n'}
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
            <h3 className="text-lg font-semibold">Thﾃｴng tin Chi ti蘯ｿt Nhﾃ｢n viﾃｪn</h3>
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
                      title="Xem chi ti蘯ｿt"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditStaff(staff)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                      title="Ch盻穎h s盻ｭa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Xem gia ﾄ妥ｬnh"
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
                  <span className="text-xs text-gray-500">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</span>
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
            <h3 className="text-lg font-semibold">Qu蘯｣n lﾃｽ Thﾃｴng tin Gia ﾄ妥ｬnh</h3>
            <Button onClick={() => setShowFamilyModal(true)}>
              <Plus size={18} /> Thﾃｪm Thﾃnh viﾃｪn
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
                    title="Thﾃｪm thﾃnh viﾃｪn gia ﾄ妥ｬnh"
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
                                Liﾃｪn h盻・kh蘯ｩn c蘯･p
                              </span>
                            )}
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditFamilyMember(member)}
                                className="text-blue-600 hover:bg-blue-50 rounded-lg p-1" 
                                title="Ch盻穎h s盻ｭa"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteFamilyMember(member.id)}
                                className="text-red-600 hover:bg-red-50 rounded-lg p-1" 
                                title="Xﾃｳa"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>到 {member.phone}</div>
                          {member.email && <div>笨・{member.email}</div>}
                          <div>直 {member.occupation}</div>
                          <div>桃 {member.address}</div>
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
            <h3 className="text-lg font-semibold">M蘯ｫu H盻｣p ﾄ黛ｻ渡g Chu蘯ｩn</h3>
            <div className="text-sm text-gray-500">
              Ch盻肱 m蘯ｫu h盻｣p ﾄ黛ｻ渡g vﾃ nhﾃ｢n viﾃｪn ﾄ黛ｻ・t蘯｡o h盻｣p ﾄ黛ｻ渡g nhanh chﾃｳng
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
                    {template.type === 'LABOR' ? 'Lao ﾄ黛ｻ冢g' :
                     template.type === 'SALE' ? 'Mua bﾃ｡n' :
                     template.type === 'COOPERATION' ? 'H盻｣p tﾃ｡c' : 'Ghi nh盻・}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800 mb-1">N盻冓 dung chﾃｭnh:</div>
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
                    {template.content.articles.length} ﾄ訴盻「 kho蘯｣n
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      S盻ｭ d盻･ng m蘯ｫu
                    </button>
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Xem trﾆｰ盻嫩
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Qu蘯｣n lﾃｽ ﾄ脆｡n Xin Phﾃｩp</h3>
            <button 
              onClick={() => setShowAddLeaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              T蘯｡o ﾄ柁｡n xin phﾃｩp
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                 <tr>
                   <th className="p-4">Nhﾃ｢n viﾃｪn</th>
                   <th className="p-4">Lo蘯｡i ngh盻・/th>
                   <th className="p-4">Th盻拱 gian</th>
                   <th className="p-4">Lﾃｽ do</th>
                   <th className="p-4 text-center">Tr蘯｡ng thﾃ｡i</th>
                   <th className="p-4 text-right">Hﾃnh ﾄ黛ｻ冢g</th>
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
                          <div className="text-gray-500">ﾄ黛ｺｿn {req.endDate}</div>
                       </td>
                       <td className="p-4 text-gray-600 italic">{req.reason}</td>
                       <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                             req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                             req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                             {req.status === 'Approved' ? 'ﾄ静｣ duy盻㏄' : req.status === 'Rejected' ? 'T盻ｫ ch盻訴' : 'Ch盻・duy盻㏄'}
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          {req.status === 'Pending' && (
                             <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApproveLeave(req.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded" 
                                  title="Duy盻㏄"
                                >
                                  <Check size={20}/>
                                </button>
                                <button 
                                  onClick={() => handleRejectLeave(req.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded" 
                                  title="T盻ｫ ch盻訴"
                                >
                                  <X size={20}/>
                                </button>
                             </div>
                          )}
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </div>
      )}

      <Modal isOpen={showEvalModal} onClose={() => setShowEvalModal(false)} title="ﾄ静｡nh giﾃ｡ Hi盻㎡ su蘯･t Nhﾃ｢n s盻ｱ (AI)">
         {evalResult && (
            <div className="space-y-4">
               <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2">{evalResult.title}</h4>
                  <p className="text-orange-700 text-sm">{evalResult.summary}</p>
               </div>
               
               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Activity size={16}/> ﾄ雪ｻ・xu蘯･t c蘯｣i thi盻㌻:</h5>
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
                  <Button onClick={() => setShowEvalModal(false)}>ﾄ静ｳng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={showAddStaffModal} onClose={() => setShowAddStaffModal(false)} title="Thﾃｪm Nhﾃ｢n viﾃｪn M盻嬖">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H盻・vﾃ tﾃｪn</label>
                  <input
                     type="text"
                     value={newStaffForm.fullName}
                     onChange={(e) => setNewStaffForm({...newStaffForm, fullName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp h盻・vﾃ tﾃｪn"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                     type="email"
                     value={newStaffForm.email}
                     onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp email"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">S盻・ﾄ訴盻㌻ tho蘯｡i</label>
                  <input
                     type="tel"
                     value={newStaffForm.phone}
                     onChange={(e) => setNewStaffForm({...newStaffForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp s盻・ﾄ訴盻㌻ tho蘯｡i"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                  <input
                     type="text"
                     value={newStaffForm.role}
                     onChange={(e) => setNewStaffForm({...newStaffForm, role: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ch盻ｩc v盻･"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｲng ban</label>
                  <select
                     value={newStaffForm.department}
                     onChange={(e) => setNewStaffForm({...newStaffForm, department: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 phﾃｲng ban</option>
                     <option value="Ban Giﾃ｡m hi盻㎡">Ban Giﾃ｡m hi盻㎡</option>
                     <option value="Khoa Toﾃ｡n - Lﾃｽ - Hﾃｳa">Khoa Toﾃ｡n - Lﾃｽ - Hﾃｳa</option>
                     <option value="Khoa Ng盻ｯ Vﾄハ - L盻議h S盻ｭ">Khoa Ng盻ｯ Vﾄハ - L盻議h S盻ｭ</option>
                     <option value="Khoa Ti蘯ｿng Anh">Khoa Ti蘯ｿng Anh</option>
                     <option value="Khoa Sinh h盻皇 - Hﾃｳa h盻皇">Khoa Sinh h盻皇 - Hﾃｳa h盻皇</option>
                     <option value="Phﾃｲng K蘯ｿ toﾃ｡n">Phﾃｲng K蘯ｿ toﾃ｡n</option>
                     <option value="Phﾃｲng Hﾃnh chﾃｭnh">Phﾃｲng Hﾃnh chﾃｭnh</option>
                     <option value="Phﾃｲng IT">Phﾃｲng IT</option>
                     <option value="Thﾆｰ vi盻㌻">Thﾆｰ vi盻㌻</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</label>
                  <input
                     type="number"
                     value={newStaffForm.salary}
                     onChange={(e) => setNewStaffForm({...newStaffForm, salary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp lﾆｰﾆ｡ng cﾆ｡ b蘯｣n"
                     min="0"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy tuy盻ハ d盻･ng</label>
                  <input
                     type="date"
                     value={newStaffForm.hireDate}
                     onChange={(e) => setNewStaffForm({...newStaffForm, hireDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tr蘯｡ng thﾃ｡i</label>
                  <select
                     value={newStaffForm.status}
                     onChange={(e) => setNewStaffForm({...newStaffForm, status: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="Active">ﾄ紳ng lﾃm</option>
                     <option value="On Leave">Ngh盻・phﾃｩp</option>
                  </select>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddStaffModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleAddStaff} disabled={!newStaffForm.fullName || !newStaffForm.email || !newStaffForm.role || !newStaffForm.department || !newStaffForm.salary}>
                  Thﾃｪm nhﾃ｢n viﾃｪn
               </Button>
            </div>
         </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={showEditStaffModal} onClose={() => setShowEditStaffModal(false)} title="Ch盻穎h s盻ｭa Thﾃｴng tin Nhﾃ｢n viﾃｪn">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H盻・vﾃ tﾃｪn</label>
                  <input
                     type="text"
                     value={newStaffForm.fullName}
                     onChange={(e) => setNewStaffForm({...newStaffForm, fullName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp h盻・vﾃ tﾃｪn"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                     type="email"
                     value={newStaffForm.email}
                     onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp email"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">S盻・ﾄ訴盻㌻ tho蘯｡i</label>
                  <input
                     type="tel"
                     value={newStaffForm.phone}
                     onChange={(e) => setNewStaffForm({...newStaffForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp s盻・ﾄ訴盻㌻ tho蘯｡i"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                  <input
                     type="text"
                     value={newStaffForm.position}
                     onChange={(e) => setNewStaffForm({...newStaffForm, position: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ch盻ｩc v盻･"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｲng ban</label>
                  <select
                     value={newStaffForm.department}
                     onChange={(e) => setNewStaffForm({...newStaffForm, department: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 phﾃｲng ban</option>
                     <option value="Ban Giﾃ｡m hi盻㎡">Ban Giﾃ｡m hi盻㎡</option>
                     <option value="Khoa Toﾃ｡n - Lﾃｽ - Hﾃｳa">Khoa Toﾃ｡n - Lﾃｽ - Hﾃｳa</option>
                     <option value="Khoa Ng盻ｯ Vﾄハ - L盻議h S盻ｭ">Khoa Ng盻ｯ Vﾄハ - L盻議h S盻ｭ</option>
                     <option value="Khoa Ti蘯ｿng Anh">Khoa Ti蘯ｿng Anh</option>
                     <option value="Khoa Sinh h盻皇 - Hﾃｳa h盻皇">Khoa Sinh h盻皇 - Hﾃｳa h盻皇</option>
                     <option value="Khoa Cﾃｴng ngh盻・thﾃｴng tin">Khoa Cﾃｴng ngh盻・thﾃｴng tin</option>
                     <option value="Khoa Kinh t蘯ｿ">Khoa Kinh t蘯ｿ</option>
                     <option value="Phﾃｲng T盻・ch盻ｩc - Hﾃnh chﾃｭnh">Phﾃｲng T盻・ch盻ｩc - Hﾃnh chﾃｭnh</option>
                     <option value="Phﾃｲng K蘯ｿ ho蘯｡ch - Tﾃi chﾃｭnh">Phﾃｲng K蘯ｿ ho蘯｡ch - Tﾃi chﾃｭnh</option>
                     <option value="Phﾃｲng ﾄ静o t蘯｡o">Phﾃｲng ﾄ静o t蘯｡o</option>
                     <option value="Phﾃｲng Cﾃｴng tﾃ｡c sinh viﾃｪn">Phﾃｲng Cﾃｴng tﾃ｡c sinh viﾃｪn</option>
                     <option value="Thﾆｰ vi盻㌻">Thﾆｰ vi盻㌻</option>
                     <option value="Trung tﾃ｢m Tin h盻皇">Trung tﾃ｢m Tin h盻皇</option>
                     <option value="Trung tﾃ｢m Ngo蘯｡i ng盻ｯ">Trung tﾃ｢m Ngo蘯｡i ng盻ｯ</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</label>
                  <input
                     type="number"
                     value={newStaffForm.salary}
                     onChange={(e) => setNewStaffForm({...newStaffForm, salary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp lﾆｰﾆ｡ng cﾆ｡ b蘯｣n"
                     min="0"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</label>
                  <input
                     type="date"
                     value={newStaffForm.startDate}
                     onChange={(e) => setNewStaffForm({...newStaffForm, startDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tr蘯｡ng thﾃ｡i</label>
                  <select
                     value={newStaffForm.status}
                     onChange={(e) => setNewStaffForm({...newStaffForm, status: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="ACTIVE">ﾄ紳ng lﾃm vi盻㌘</option>
                     <option value="INACTIVE">ﾄ静｣ ngh盻・vi盻㌘</option>
                     <option value="SUSPENDED">T蘯｡m ngh盻・/option>
                  </select>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowEditStaffModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleUpdateStaff} disabled={!newStaffForm.fullName || !newStaffForm.email || !newStaffForm.department || !newStaffForm.salary}>
                  C蘯ｭp nh蘯ｭt thﾃｴng tin
               </Button>
            </div>
         </div>
      </Modal>

      {/* Contract Modal */}
      <Modal isOpen={showContractModal} onClose={() => setShowContractModal(false)} title="T蘯｡o H盻｣p ﾄ黛ｻ渡g Lao ﾄ黛ｻ冢g">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                  <select
                     value={contractForm.staffId}
                     onChange={(e) => setContractForm({...contractForm, staffId: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lo蘯｡i h盻｣p ﾄ黛ｻ渡g</label>
                  <select
                     value={contractForm.contractType}
                     onChange={(e) => setContractForm({...contractForm, contractType: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="PERMANENT">Vﾄｩnh vi盻・</option>
                     <option value="TEMPORARY">Th盻拱 v盻･</option>
                     <option value="PROBATION">Th盻ｭ vi盻㌘</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                  <input
                     type="text"
                     value={contractForm.position}
                     onChange={(e) => setContractForm({...contractForm, position: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ch盻ｩc v盻･"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng</label>
                  <input
                     type="number"
                     value={contractForm.salary}
                     onChange={(e) => setContractForm({...contractForm, salary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp lﾆｰﾆ｡ng"
                     min="0"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</label>
                  <input
                     type="date"
                     value={contractForm.startDate}
                     onChange={(e) => setContractForm({...contractForm, startDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy k蘯ｿt thﾃｺc</label>
                  <input
                     type="date"
                     value={contractForm.endDate}
                     onChange={(e) => setContractForm({...contractForm, endDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｺc l盻｣i</label>
               <textarea
                  value={contractForm.benefits}
                  onChange={(e) => setContractForm({...contractForm, benefits: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nh蘯ｭp cﾃ｡c phﾃｺc l盻｣i (b蘯｣o hi盻ノ, ph盻･ c蘯･p, thﾆｰ盻殤g...)"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ進盻「 kho蘯｣n h盻｣p ﾄ黛ｻ渡g</label>
               <textarea
                  value={contractForm.terms}
                  onChange={(e) => setContractForm({...contractForm, terms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nh蘯ｭp ﾄ訴盻「 kho蘯｣n h盻｣p ﾄ黛ｻ渡g"
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowContractModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleAddContract} disabled={!contractForm.staffId || !contractForm.position || !contractForm.salary}>
                  T蘯｡o h盻｣p ﾄ黛ｻ渡g
               </Button>
            </div>
         </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Thﾃｴng tin Chi ti蘯ｿt Nhﾃ｢n viﾃｪn" maxWidth="max-w-2xl">
         {selectedStaff && (
            <div className="space-y-6">
               {/* Basic Info */}
               <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                     <UserIcon size={20} className="text-blue-600" />
                     Thﾃｴng tin cﾆ｡ b蘯｣n
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">H盻・vﾃ tﾃｪn</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">S盻・ﾄ訴盻㌻ tho蘯｡i</label>
                        <input
                           type="tel"
                           value={profileForm.phone}
                           onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                        <input
                           type="text"
                           value={profileForm.role}
                           onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｲng ban</label>
                        <input
                           type="text"
                           value={profileForm.department}
                           onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng</label>
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
                     H盻皇 v蘯･n & Ch盻ｩng ch盻・                  </h4>
                  <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">H盻皇 v蘯･n cao nh蘯･t</label>
                        <input
                           type="text"
                           value={profileForm.education}
                           onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Vﾃｭ d盻･: ﾄ雪ｺ｡i h盻皇 Sﾆｰ ph蘯｡m Hﾃ N盻冓"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩng ch盻・/label>
                        <input
                           type="text"
                           value={profileForm.certifications}
                           onChange={(e) => setProfileForm({...profileForm, certifications: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Vﾃｭ d盻･: Giﾃ｡o viﾃｪn gi盻淑"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghi盻㍊</label>
                        <input
                           type="text"
                           value={profileForm.experience}
                           onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Vﾃｭ d盻･: 5 nﾄノ gi蘯｣ng d蘯｡y"
                        />
                     </div>
                  </div>
               </div>

               {/* Skills */}
               <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                     <Award size={20} className="text-purple-600" />
                     K盻ｹ nﾄハg & Chuyﾃｪn mﾃｴn
                  </h4>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">K盻ｹ nﾄハg chuyﾃｪn mﾃｴn</label>
                     <textarea
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Vﾃｭ d盻･: Toﾃ｡n, Lﾃｽ, Hﾃｳa, Ti蘯ｿng Anh"
                     />
                  </div>
               </div>

               {/* Contact Info */}
               <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                     <Phone size={20} className="text-orange-600" />
                     Thﾃｴng tin liﾃｪn h盻・                  </h4>
                  <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ch盻・/label>
                        <input
                           type="text"
                           value={profileForm.address}
                           onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Vﾃｭ d盻･: 123 Nguy盻・ Chﾃｭ Thanh, Hﾃ N盻冓"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Liﾃｪn h盻・kh蘯ｩn c蘯･p</label>
                        <input
                           type="text"
                           value={profileForm.emergencyContact}
                           onChange={(e) => setProfileForm({...profileForm, emergencyContact: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Tﾃｪn - Sﾄ慎 - Sﾄ慎"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tﾃi kho蘯｣n ngﾃ｢n hﾃng</label>
                        <input
                           type="text"
                           value={profileForm.bankAccount}
                           onChange={(e) => setProfileForm({...profileForm, bankAccount: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ngﾃ｢n hﾃng - S盻・tﾃi kho蘯｣n"
                        />
                     </div>
                  </div>
               </div>

               {/* Contracts Section */}
               <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                     <FileText size={20} className="text-indigo-600" />
                     H盻｣p ﾄ黛ｻ渡g Lao ﾄ黛ｻ冢g
                  </h4>
                  <div className="space-y-3">
                     {contracts
                       .filter(contract => contract.staffId === selectedStaff?.id)
                       .map(contract => (
                         <div key={contract.id} className="bg-white p-4 rounded-lg border border-indigo-200">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <div className="font-medium text-gray-800">H盻｣p ﾄ黛ｻ渡g #{contract.id}</div>
                                 <div className="text-sm text-gray-500">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                       contract.contractType === 'PERMANENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                     }`}>
                                       {contract.contractType === 'PERMANENT' ? 'Vﾄｩnh vi盻・' : 'Th盻拱 v盻･'}
                                    </span>
                                    {' 窶｢ '}
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                       {contract.status === 'ACTIVE' ? 'Hi盻㎡ l盻ｱc' : 'H蘯ｿt h蘯｡n'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button 
                                    onClick={() => handleViewContractDetail(contract)}
                                    className="text-blue-600 hover:bg-blue-50 rounded-lg p-2" 
                                    title="Xem chi ti蘯ｿt"
                                  >
                                    <Eye size={16} />
                                  </button>
                                 <button className="text-gray-600 hover:bg-gray-50 rounded-lg p-2" title="T蘯｣i v盻・>
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                 <span className="text-gray-500">Ch盻ｩc v盻･:</span>
                                 <div className="font-medium">{contract.position}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Lﾆｰﾆ｡ng:</span>
                                 <div className="font-bold text-green-600">{formatCurrency(contract.salary)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Th盻拱 gian:</span>
                                 <div>{contract.startDate} - {contract.endDate}</div>
                              </div>
                           </div>
                           <div>
                              <span className="text-gray-500">Phﾃｺc l盻｣i:</span>
                              <div className="text-sm text-gray-700 mt-1">{contract.benefits}</div>
                           </div>
                           <div>
                              <span className="text-gray-500">ﾄ進盻「 kho蘯｣n:</span>
                              <div className="text-sm text-gray-700 mt-1">{contract.terms}</div>
                           </div>
                         </div>
                       ))}
                     {contracts.filter(contract => contract.staffId === selectedStaff?.id).length === 0 && (
                       <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                          <p>Chﾆｰa cﾃｳ h盻｣p ﾄ黛ｻ渡g nﾃo</p>
                       </div>
                     )}
                  </div>
               </div>

               {/* Payroll Section */}
               <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                     <DollarSign size={20} className="text-green-600" />
                     B蘯｣ng Lﾆｰﾆ｡ng Chi ti蘯ｿt
                  </h4>
                  <div className="space-y-3">
                     {/* Mock payroll data for the selected staff */}
                     {payrolls
                       .filter(payroll => payroll.staffId === selectedStaff?.id)
                       .map(payroll => (
                         <div key={payroll.id} className="bg-white p-4 rounded-lg border border-green-200">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <div className="font-medium text-gray-800">K盻ｳ lﾆｰﾆ｡ng: {payroll.payPeriod}</div>
                                 <div className="text-sm text-gray-500">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                       payroll.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                       payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                     }`}>
                                       {payroll.status === 'PAID' ? 'ﾄ静｣ thanh toﾃ｡n' : 
                                        payroll.status === 'APPROVED' ? 'ﾄ静｣ duy盻㏄' : 'Ch盻・duy盻㏄'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button 
                                    onClick={() => handleViewPayrollDetail(payroll)}
                                    className="text-blue-600 hover:bg-blue-50 rounded-lg p-2" 
                                    title="Xem chi ti蘯ｿt"
                                 >
                                    <Eye size={16} />
                                 </button>
                                 <button className="text-gray-600 hover:bg-gray-50 rounded-lg p-2" title="In b蘯｣ng lﾆｰﾆ｡ng">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                 <span className="text-gray-500">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n:</span>
                                 <div className="font-medium">{formatCurrency(payroll.baseSalary)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Ph盻･ c蘯･p:</span>
                                 <div className="font-medium text-blue-600">{formatCurrency(payroll.allowances || 0)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Thﾆｰ盻殤g:</span>
                                 <div className="font-medium text-green-600">{formatCurrency(payroll.bonuses || 0)}</div>
                              </div>
                              <div>
                                 <span className="text-gray-500">Kh蘯･u tr盻ｫ:</span>
                                 <div className="font-medium text-red-600">{formatCurrency(payroll.deductions || 0)}</div>
                              </div>
                           </div>
                           <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-500 font-medium">T盻貧g thu nh蘯ｭp:</span>
                                 <span className="font-bold text-blue-600">{formatCurrency(payroll.grossSalary || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-500 font-medium">Th盻ｱc lﾄｩnh:</span>
                                 <span className="font-bold text-green-600 text-lg">{formatCurrency(payroll.netSalary || 0)}</span>
                              </div>
                           </div>
                           <div className="text-xs text-gray-500 mt-2">
                              Ngﾃy thanh toﾃ｡n: {payroll.paymentDate || 'Chﾆｰa thanh toﾃ｡n'}
                           </div>
                         </div>
                       ))}
                     {payrolls.filter(payroll => payroll.staffId === selectedStaff?.id).length === 0 && (
                       <div className="text-center py-8 text-gray-500">
                          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                          <p>Chﾆｰa cﾃｳ b蘯｣ng lﾆｰﾆ｡ng nﾃo</p>
                       </div>
                     )}
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                     ﾄ静ｳng
                  </Button>
                  <Button onClick={handleUpdateProfile}>
                     C蘯ｭp nh蘯ｭt
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Contract Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={`T蘯｡o H盻｣p ﾄ黛ｻ渡g t盻ｫ M蘯ｫu: ${selectedTemplate?.name}`} maxWidth="max-w-2xl">
         {selectedTemplate && (
            <div className="space-y-6">
               {/* Template Preview */}
               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">N盻冓 dung m蘯ｫu:</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                     <div><strong>Tiﾃｪu ﾄ黛ｻ・</strong> {selectedTemplate.content.title}</div>
                     <div><strong>S盻・ﾄ訴盻「 kho蘯｣n:</strong> {selectedTemplate.content.articles.length}</div>
                     <div className="max-h-32 overflow-y-auto">
                        <strong>ﾄ進盻「 kho蘯｣n chﾃｭnh:</strong>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                        <select
                           value={templateForm.staffId}
                           onChange={(e) => setTemplateForm({...templateForm, staffId: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
                           {staffList.map(staff => (
                              <option key={staff.id} value={staff.id}>
                                 {staff.fullName} - {staff.department}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                        <input
                           type="text"
                           value={templateForm.position}
                           onChange={(e) => setTemplateForm({...templateForm, position: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Nh蘯ｭp ch盻ｩc v盻･"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng</label>
                        <input
                           type="number"
                           value={templateForm.salary}
                           onChange={(e) => setTemplateForm({...templateForm, salary: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="Nh蘯ｭp lﾆｰﾆ｡ng"
                           min="0"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy k蘯ｿt thﾃｺc</label>
                        <input
                           type="date"
                           value={templateForm.endDate}
                           onChange={(e) => setTemplateForm({...templateForm, endDate: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｺc l盻｣i</label>
                        <input
                           type="text"
                           value={templateForm.benefits}
                           onChange={(e) => setTemplateForm({...templateForm, benefits: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           placeholder="B蘯｣o hi盻ノ, ph盻･ c蘯･p, thﾆｰ盻殤g..."
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ進盻「 kho蘯｣n b盻・sung</label>
                     <textarea
                        value={templateForm.specialTerms}
                        onChange={(e) => setTemplateForm({...templateForm, specialTerms: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Cﾃ｡c ﾄ訴盻「 kho蘯｣n b盻・sung theo yﾃｪu c蘯ｧu..."
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                     H盻ｧy
                  </Button>
                  <Button onClick={handleGenerateContract} disabled={!templateForm.staffId || !templateForm.position || !templateForm.salary}>
                     T蘯｡o h盻｣p ﾄ黛ｻ渡g
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Family Modal */}
      <Modal isOpen={showFamilyModal} onClose={() => setShowFamilyModal(false)} title="Thﾃｪm Thﾃnh viﾃｪn Gia ﾄ妥ｬnh">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                  <select
                     value={familyForm.staffId}
                     onChange={(e) => setFamilyForm({...familyForm, staffId: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quan h盻・/label>
                  <select
                     value={familyForm.relationship}
                     onChange={(e) => setFamilyForm({...familyForm, relationship: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 quan h盻・/option>
                     <option value="V盻｣">V盻｣</option>
                     <option value="Ch盻渡g">Ch盻渡g</option>
                     <option value="Con">Con</option>
                     <option value="B盻・>B盻・/option>
                     <option value="M蘯ｹ">M蘯ｹ</option>
                     <option value="Cha">Cha</option>
                     <option value="Em gﾃ｡i">Em gﾃ｡i</option>
                     <option value="Anh">Anh</option>
                     <option value="Ch盻・>Ch盻・/option>
                     <option value="Khﾃ｡c">Khﾃ｡c</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H盻・vﾃ tﾃｪn</label>
                  <input
                     type="text"
                     value={familyForm.name}
                     onChange={(e) => setFamilyForm({...familyForm, name: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp h盻・vﾃ tﾃｪn"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">S盻・ﾄ訴盻㌻ tho蘯｡i</label>
                  <input
                     type="tel"
                     value={familyForm.phone}
                     onChange={(e) => setFamilyForm({...familyForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp s盻・ﾄ訴盻㌻ tho蘯｡i"
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
                     placeholder="Nh蘯ｭp email (n蘯ｿu cﾃｳ)"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngh盻・nghi盻㎝</label>
                  <input
                     type="text"
                     value={familyForm.occupation}
                     onChange={(e) => setFamilyForm({...familyForm, occupation: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ngh盻・nghi盻㎝"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ch盻・/label>
                  <input
                     type="text"
                     value={familyForm.address}
                     onChange={(e) => setFamilyForm({...familyForm, address: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ﾄ黛ｻ蟻 ch盻・
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liﾃｪn h盻・kh蘯ｩn c蘯･p</label>
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={familyForm.emergencyContact}
                        onChange={(e) => setFamilyForm({...familyForm, emergencyContact: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600"
                     />
                     <span className="text-sm text-gray-700">ﾄ静｢y lﾃ liﾃｪn h盻・kh蘯ｩn c蘯･p</span>
                  </label>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowFamilyModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleAddFamilyMember} disabled={!familyForm.name || !familyForm.relationship || !familyForm.staffId}>
                  Thﾃｪm thﾃnh viﾃｪn
               </Button>
            </div>
      </Modal>

      {/* Edit Family Member Modal */}
      <Modal isOpen={showEditFamilyModal} onClose={() => setShowEditFamilyModal(false)} title="Ch盻穎h s盻ｭa Thﾃｴng tin Thﾃnh viﾃｪn Gia ﾄ妥ｬnh">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                  <select
                     value={familyForm.staffId}
                     onChange={(e) => setFamilyForm({...familyForm, staffId: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quan h盻・/label>
                  <select
                     value={familyForm.relationship}
                     onChange={(e) => setFamilyForm({...familyForm, relationship: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 quan h盻・/option>
                     <option value="V盻｣">V盻｣</option>
                     <option value="Ch盻渡g">Ch盻渡g</option>
                     <option value="Con">Con</option>
                     <option value="B盻・>B盻・/option>
                     <option value="M蘯ｹ">M蘯ｹ</option>
                     <option value="Cha">Cha</option>
                     <option value="Em gﾃ｡i">Em gﾃ｡i</option>
                     <option value="Anh">Anh</option>
                     <option value="Ch盻・>Ch盻・/option>
                     <option value="Khﾃ｡c">Khﾃ｡c</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">H盻・vﾃ tﾃｪn</label>
                  <input
                     type="text"
                     value={familyForm.name}
                     onChange={(e) => setFamilyForm({...familyForm, name: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp h盻・vﾃ tﾃｪn"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">S盻・ﾄ訴盻㌻ tho蘯｡i</label>
                  <input
                     type="tel"
                     value={familyForm.phone}
                     onChange={(e) => setFamilyForm({...familyForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp s盻・ﾄ訴盻㌻ tho蘯｡i"
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
                     placeholder="Nh蘯ｭp email (n蘯ｿu cﾃｳ)"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngh盻・nghi盻㎝</label>
                  <input
                     type="text"
                     value={familyForm.occupation}
                     onChange={(e) => setFamilyForm({...familyForm, occupation: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ngh盻・nghi盻㎝"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ch盻・/label>
                  <input
                     type="text"
                     value={familyForm.address}
                     onChange={(e) => setFamilyForm({...familyForm, address: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Nh蘯ｭp ﾄ黛ｻ蟻 ch盻・
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liﾃｪn h盻・kh蘯ｩn c蘯･p</label>
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={familyForm.emergencyContact}
                        onChange={(e) => setFamilyForm({...familyForm, emergencyContact: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600"
                     />
                     <span className="text-sm text-gray-700">ﾄ静｢y lﾃ liﾃｪn h盻・kh蘯ｩn c蘯･p</span>
                  </label>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowEditFamilyModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleUpdateFamilyMember} disabled={!familyForm.name || !familyForm.relationship || !familyForm.staffId}>
                  C蘯ｭp nh蘯ｭt thﾃｴng tin
               </Button>
            </div>
      </Modal>

      {/* Advanced Contract Modal */}
      <Modal isOpen={showAdvancedContractModal} onClose={() => setShowAdvancedContractModal(false)} title={`T蘯｡o H盻｣p ﾄ黛ｻ渡g Nﾃ｢ng cao: ${selectedTemplate?.name}`} maxWidth="max-w-6xl">
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
                        {tab === 'basic' && 'Thﾃｴng tin cﾆ｡ b蘯｣n'}
                        {tab === 'company' && 'Doanh nghi盻㎝'}
                        {tab === 'employee' && 'Ngﾆｰ盻拱 lao ﾄ黛ｻ冢g'}
                        {tab === 'job' && 'Cﾃｴng vi盻㌘'}
                        {tab === 'payroll' && 'Lﾆｰﾆ｡ng & Ph盻･ c蘯･p'}
                        {tab === 'terms' && 'ﾄ進盻「 kho蘯｣n'}
                     </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[400px]">
                  {/* Tab 1: Thﾃｴng tin cﾆ｡ b蘯｣n */}
                  {currentPage === 0 && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Lo蘯｡i h盻｣p ﾄ黛ｻ渡g</label>
                              <select
                                 value={templateForm.contractSubType}
                                 onChange={(e) => setTemplateForm({...templateForm, contractSubType: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option value="PERMANENT">Chﾃｭnh th盻ｩc</option>
                                 <option value="PROBATION">Th盻ｭ vi盻㌘</option>
                                 <option value="PART_TIME">Bﾃ｡n th盻拱 gian</option>
                                 <option value="SALARY_INCREASE">Tﾄハg lﾆｰﾆ｡ng</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                              <select
                                 value={templateForm.staffId}
                                 onChange={(e) => setTemplateForm({...templateForm, staffId: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ch盻ｩc v盻･</label>
                              <input
                                 type="text"
                                 value={templateForm.position}
                                 onChange={(e) => setTemplateForm({...templateForm, position: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 placeholder="Nh蘯ｭp ch盻ｩc v盻･"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</label>
                              <input
                                 type="number"
                                 value={templateForm.salary}
                                 onChange={(e) => setTemplateForm({...templateForm, salary: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 placeholder="Nh蘯ｭp lﾆｰﾆ｡ng"
                                 min="0"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</label>
                              <input
                                 type="date"
                                 value={templateForm.startDate}
                                 onChange={(e) => setTemplateForm({...templateForm, startDate: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy k蘯ｿt thﾃｺc</label>
                              <input
                                 type="date"
                                 value={templateForm.endDate}
                                 onChange={(e) => setTemplateForm({...templateForm, endDate: e.target.value})}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ﾄ訴盻ノ lﾃm vi盻㌘</label>
                           <input
                              type="text"
                              value={templateForm.workLocation}
                              onChange={(e) => setTemplateForm({...templateForm, workLocation: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Nh蘯ｭp ﾄ黛ｻ蟻 ﾄ訴盻ノ lﾃm vi盻㌘"
                           />
                        </div>
                     </div>
                  )}

                  {/* Tab 2: Thﾃｴng tin doanh nghi盻㎝ */}
                  {currentPage === 1 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thﾃｴng tin Doanh nghi盻㎝</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tﾃｪn cﾃｴng ty</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Mﾃ｣ s盻・thu蘯ｿ</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ch盻・/label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ進盻㌻ tho蘯｡i</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾆｰ盻拱 ﾄ黛ｺ｡i di盻㌻</label>
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

                  {/* Tab 3: Thﾃｴng tin ngﾆｰ盻拱 lao ﾄ黛ｻ冢g */}
                  {currentPage === 2 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thﾃｴng tin Ngﾆｰ盻拱 lao ﾄ黛ｻ冢g</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">S盻・CMND/CCCD</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy c蘯･p</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nﾆ｡i c蘯･p</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ雪ｻ蟻 ch盻・thﾆｰ盻拵g trﾃｺ</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">S盻・tﾃi kho蘯｣n ngﾃ｢n hﾃng</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tﾃｪn ngﾃ｢n hﾃng</label>
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

                  {/* Tab 4: N盻冓 dung cﾃｴng vi盻㌘ */}
                  {currentPage === 3 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">N盻冓 dung Cﾃｴng vi盻㌘</h3>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Mﾃｴ t蘯｣ cﾃｴng vi盻㌘ chi ti蘯ｿt</label>
                           <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={6}
                              placeholder="Mﾃｴ t蘯｣ chi ti蘯ｿt cﾃｴng vi盻㌘, trﾃ｡ch nhi盻㍊, quy盻］ h蘯｡n..."
                           />
                        </div>

                        {templateForm.contractSubType === 'PROBATION' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Th盻拱 gian th盻ｭ vi盻㌘ (thﾃ｡ng)</label>
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
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Lﾆｰﾆ｡ng th盻ｭ vi盻㌘ (%)</label>
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
                                 <label className="block text-sm font-medium text-gray-700 mb-1">% Tﾄハg lﾆｰﾆ｡ng</label>
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
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy ﾃ｡p d盻･ng tﾄハg lﾆｰﾆ｡ng</label>
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

                  {/* Tab 5: B蘯｣ng lﾆｰﾆ｡ng chi ti蘯ｿt */}
                  {currentPage === 4 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">B蘯｣ng Lﾆｰﾆ｡ng Chi ti蘯ｿt</h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                           <h4 className="font-medium text-gray-800 mb-3">Ph盻･ c蘯･p</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">ﾄＯ trﾆｰa</label>
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
                                 <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ進盻㌻ tho蘯｡i</label>
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
                           <h4 className="font-medium text-gray-800 mb-3">Thﾆｰ盻殤g</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Hi盻㎡ su蘯･t</label>
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
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Chuyﾃｪn c蘯ｧn</label>
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
                           <h4 className="font-medium text-gray-800 mb-3">Kh蘯･u tr盻ｫ (%)</h4>
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

                  {/* Tab 6: ﾄ進盻「 kho蘯｣n */}
                  {currentPage === 5 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">ﾄ進盻「 kho蘯｣n vﾃ Ph盻･ l盻･c</h3>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">ﾄ進盻「 kho蘯｣n b盻・sung</label>
                           <textarea
                              value={templateForm.specialTerms}
                              onChange={(e) => setTemplateForm({...templateForm, specialTerms: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={6}
                              placeholder="Cﾃ｡c ﾄ訴盻「 kho蘯｣n b盻・sung theo yﾃｪu c蘯ｧu..."
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Phﾃｺc l盻｣i</label>
                           <textarea
                              value={templateForm.benefits}
                              onChange={(e) => setTemplateForm({...templateForm, benefits: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={4}
                              placeholder="B蘯｣o hi盻ノ, ph盻･ c蘯･p, thﾆｰ盻殤g, ﾄ妥o t蘯｡o..."
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
                        竊・Trﾆｰ盻嫩
                     </button>
                     <button
                        onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                        disabled={currentPage === 5}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Sau 竊・                     </button>
                  </div>
                  
                  <div className="flex gap-2">
                     <Button variant="secondary" onClick={() => setShowAdvancedContractModal(false)}>
                        H盻ｧy
                     </Button>
                     <Button onClick={handleGenerateContract} disabled={!templateForm.staffId || !templateForm.position || !templateForm.salary}>
                        T蘯｡o h盻｣p ﾄ黛ｻ渡g ({currentPage + 1}/6)
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </Modal>

      {/* Contract Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={`Xem trﾆｰ盻嫩: ${selectedTemplate?.name}`} maxWidth="max-w-4xl">
         {selectedTemplate && (
            <div className="space-y-6">
               {/* Header */}
               <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                     {selectedTemplate.content.title}
                  </h2>
                  <div className="text-sm text-gray-500">
                     M蘯ｫu h盻｣p ﾄ黛ｻ渡g chu蘯ｩn theo phﾃ｡p lu蘯ｭt Vi盻㏄ Nam
                  </div>
               </div>

               {/* Parties */}
               <div className="grid grid-cols-2 gap-8">
                  <div className="border-l-4 border-blue-500 pl-4">
                     <h3 className="font-semibold text-gray-800 mb-2">Bﾃｪn A</h3>
                     <p className="text-gray-700">{selectedTemplate.content.parties.employer}</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                     <h3 className="font-semibold text-gray-800 mb-2">Bﾃｪn B</h3>
                     <p className="text-gray-700">{selectedTemplate.content.parties.employee}</p>
                  </div>
               </div>

               {/* Articles */}
               <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">N盻冓 dung h盻｣p ﾄ黛ｻ渡g</h3>
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
                        <p className="text-sm text-gray-600">ﾄ静｣ kﾃｽ k蘯ｿt t蘯｡i</p>
                        <p className="text-sm text-gray-800 font-medium">[ﾄ雪ｻ蟻 ﾄ訴盻ノ kﾃｽ k蘯ｿt]</p>
                        <p className="text-sm text-gray-800 font-medium">Ngﾃy [Ngﾃy] thﾃ｡ng [Thﾃ｡ng] nﾄノ [Nﾄノ]</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm text-gray-600">ﾄ静｣ kﾃｽ k蘯ｿt t蘯｡i</p>
                        <p className="text-sm text-gray-800 font-medium">[ﾄ雪ｻ蟻 ﾄ訴盻ノ kﾃｽ k蘯ｿt]</p>
                        <p className="text-sm text-gray-800 font-medium">Ngﾃy [Ngﾃy] thﾃ｡ng [Thﾃ｡ng] nﾄノ [Nﾄノ]</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-8">
                     <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">ﾄ雪ｺ｡i di盻㌻ Bﾃｪn A</p>
                        <div className="border-b-2 border-gray-300 pb-2">
                           <p className="text-gray-800 font-medium">[Ch盻ｩc v盻･]</p>
                           <p className="text-gray-800">[H盻・vﾃ tﾃｪn]</p>
                        </div>
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">ﾄ雪ｺ｡i di盻㌻ Bﾃｪn B</p>
                        <div className="border-b-2 border-gray-300 pb-2">
                           <p className="text-gray-800 font-medium">[Ch盻ｩc v盻･]</p>
                           <p className="text-gray-800">[H盻・vﾃ tﾃｪn]</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                     ﾄ静ｳng
                  </Button>
                  <Button onClick={() => {
                     setShowPreviewModal(false);
                     handleUseTemplate(selectedTemplate);
                  }}>
                     S盻ｭ d盻･ng m蘯ｫu nﾃy
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Payroll Detail Modal */}
      <Modal isOpen={showPayrollDetailModal} onClose={() => setShowPayrollDetailModal(false)} title="Chi ti蘯ｿt B蘯｣ng lﾆｰﾆ｡ng" maxWidth="max-w-4xl">
         {selectedPayroll && (
            <div className="space-y-6">
               {/* Header */}
               <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                           B蘯｣ng lﾆｰﾆ｡ng k盻ｳ {selectedPayroll.payPeriod}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              selectedPayroll.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                              selectedPayroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                           }`}>
                              {selectedPayroll.status === 'PAID' ? 'ﾄ静｣ thanh toﾃ｡n' : 
                               selectedPayroll.status === 'APPROVED' ? 'ﾄ静｣ duy盻㏄' : 'Ch盻・duy盻㏄'}
                           </span>
                           <span>Ngﾃy t蘯｡o: {selectedPayroll.payDate}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                           {formatCurrency(selectedPayroll.netSalary)}
                        </div>
                        <div className="text-sm text-gray-500">Lﾆｰﾆ｡ng th盻ｱc nh蘯ｭn</div>
                     </div>
                  </div>
               </div>

               {/* Payroll Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-600" />
                        Thu nh蘯ｭp
                     </h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">Lﾆｰﾆ｡ng cﾆ｡ b蘯｣n</span>
                           <span className="font-medium">{formatCurrency(selectedPayroll.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">Ph盻･ c蘯･p</span>
                           <span className="font-medium text-green-600">+{formatCurrency(selectedPayroll.allowances)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">Thﾆｰ盻殤g</span>
                           <span className="font-medium text-green-600">+{formatCurrency(selectedPayroll.bonuses)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-semibold text-lg">
                           <span>T盻貧g thu nh蘯ｭp</span>
                           <span className="text-green-600">{formatCurrency(selectedPayroll.grossSalary)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Deductions Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-600" />
                        Kh蘯･u tr盻ｫ
                     </h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">B蘯｣o hi盻ノ xﾃ｣ h盻冓 (8%)</span>
                           <span className="font-medium text-red-600">-{formatCurrency(selectedPayroll.socialInsurance)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">B蘯｣o hi盻ノ y t蘯ｿ (1.5%)</span>
                           <span className="font-medium text-red-600">-{formatCurrency(selectedPayroll.healthInsurance)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">B蘯｣o hi盻ノ th蘯･t nghi盻㎝ (1%)</span>
                           <span className="font-medium text-red-600">-{formatCurrency(selectedPayroll.unemploymentInsurance)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                           <span className="text-gray-600">Thu蘯ｿ TNCN</span>
                           <span className="font-medium text-red-600">-{formatCurrency(selectedPayroll.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-semibold text-lg">
                           <span>T盻貧g kh蘯･u tr盻ｫ</span>
                           <span className="text-red-600">{formatCurrency(selectedPayroll.totalDeductions)}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Summary */}
               <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <div className="grid grid-cols-3 gap-6 text-center">
                     <div>
                        <div className="text-sm text-gray-600 mb-1">T盻貧g thu nh蘯ｭp</div>
                        <div className="text-xl font-bold text-green-600">{formatCurrency(selectedPayroll.grossSalary)}</div>
                     </div>
                     <div>
                        <div className="text-sm text-gray-600 mb-1">T盻貧g kh蘯･u tr盻ｫ</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency(selectedPayroll.totalDeductions)}</div>
                     </div>
                     <div>
                        <div className="text-sm text-gray-600 mb-1">Lﾆｰﾆ｡ng th盻ｱc nh蘯ｭn</div>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedPayroll.netSalary)}</div>
                     </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setShowPayrollDetailModal(false)}>
                     ﾄ静ｳng
                  </Button>
                  <Button>
                     <Download size={16} className="mr-2" />
                     In b蘯｣ng lﾆｰﾆ｡ng
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Leave Request Modal */}
      <Modal isOpen={showAddLeaveModal} onClose={() => setShowAddLeaveModal(false)} title="T蘯｡o ﾄ脆｡n Xin Phﾃｩp">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhﾃ｢n viﾃｪn</label>
                  <select
                     value={leaveForm.staffId}
                     onChange={(e) => setLeaveForm({...leaveForm, staffId: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Ch盻肱 nhﾃ｢n viﾃｪn</option>
                     {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                           {staff.fullName} - {staff.department}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lo蘯｡i ngh盻・phﾃｩp</label>
                  <select
                     value={leaveForm.type}
                     onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="Ngh盻・phﾃｩp nﾄノ">Ngh盻・phﾃｩp nﾄノ</option>
                     <option value="Ngh盻・盻僧">Ngh盻・盻僧</option>
                     <option value="Ngh盻・khﾃｴng lﾆｰﾆ｡ng">Ngh盻・khﾃｴng lﾆｰﾆ｡ng</option>
                     <option value="Ngh盻・thai s蘯｣n">Ngh盻・thai s蘯｣n</option>
                     <option value="Ngh盻・tang l盻・>Ngh盻・tang l盻・/option>
                     <option value="Ngh盻・k蘯ｿt hﾃｴn">Ngh盻・k蘯ｿt hﾃｴn</option>
                     <option value="Ngh盻・vi盻㌘ riﾃｪng">Ngh盻・vi盻㌘ riﾃｪng</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy b蘯ｯt ﾄ黛ｺｧu</label>
                  <input
                     type="date"
                     value={leaveForm.startDate}
                     onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngﾃy k蘯ｿt thﾃｺc</label>
                  <input
                     type="date"
                     value={leaveForm.endDate}
                     onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     min={leaveForm.startDate}
                  />
               </div>
            </div>

            <div>
               <label className="flex items-center gap-2">
                  <input
                     type="checkbox"
                     checked={leaveForm.halfDay}
                     onChange={(e) => setLeaveForm({...leaveForm, halfDay: e.target.checked})}
                     className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Ngh盻・n盻ｭa ngﾃy</span>
               </label>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Lﾃｽ do xin ngh盻・/label>
               <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Nh蘯ｭp lﾃｽ do xin ngh盻・phﾃｩp..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Thﾃｴng tin liﾃｪn h盻・trong th盻拱 gian ngh盻・/label>
               <input
                  type="text"
                  value={leaveForm.contactInfo}
                  onChange={(e) => setLeaveForm({...leaveForm, contactInfo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="S盻・ﾄ訴盻㌻ tho蘯｡i ho蘯ｷc email liﾃｪn h盻・kh蘯ｩn c蘯･p..."
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddLeaveModal(false)}>
                  H盻ｧy
               </Button>
               <Button onClick={handleAddLeaveRequest} disabled={!leaveForm.staffId || !leaveForm.startDate || !leaveForm.reason}>
                  G盻ｭi ﾄ柁｡n xin phﾃｩp
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default HRView;
