import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, FileText, Calendar, Users, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, Download, Upload, Receipt, Building, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Loader2, Filter, Search, BarChart3, PieChart, Activity, QrCode, Smartphone, Banknote, Wifi, Shield, Clock, Link2, Wallet, Bell, BellRing, Mail, Send, UserCheck, AlertTriangle, Info } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { aiService } from './aiService';
import { Invoice, AIAnalysisResult } from './types';
import { Button, Modal } from './components';

interface Allowances {
  meal: string;
  transport: string;
  phone: string;
  housing: string;
  responsibility: string;
  other: string;
}

interface Bonuses {
  performance: string;
  attendance: string;
  project: string;
  holiday: string;
  yearEnd: string;
  other: string;
}

interface Deductions {
  socialInsurance: string;
  healthInsurance: string;
  unemploymentInsurance: string;
  personalIncomeTax: string;
  unionFee: string;
  other: string;
}

interface PayrollForm {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  salaryGrade: string;
  baseSalary: string;
  allowances: Allowances;
  bonuses: Bonuses;
  deductions: Deductions;
  grossSalary: string;
  netSalary: string;
  payPeriod: string;
  paymentDate: string;
  status: string;
}

const FinanceView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'budgets' | 'reports' | 'payments' | 'notifications' | 'payroll'>('overview');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI States
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<AIAnalysisResult | null>(null);
  const [showForecastModal, setShowForecastModal] = useState(false);

  // Invoice States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    type: 'TUITION',
    items: [] as any[]
  });

  // Expense States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    vendor: '',
    receipt: '',
    approvedBy: '',
    status: 'PENDING'
  });

  // Budget States
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    allocatedAmount: '',
    period: 'MONTHLY',
    description: '',
    department: ''
  });

  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    paymentMethod: 'BANK_TRANSFER',
    bankAccount: '',
    transactionId: '',
    amount: '',
    paymentDate: '',
    notes: ''
  });

  // Bank Integration States
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: 'Vietcombank', accountNumber: '1234567890', accountName: 'Trường ABC', balance: 50000000, type: 'CURRENT' },
    { id: 2, bankName: 'Techcombank', accountNumber: '0987654321', accountName: 'Trường ABC', balance: 25000000, type: 'SAVINGS' },
    { id: 3, bankName: 'ACB', accountNumber: '1122334455', accountName: 'Trường ABC', balance: 15000000, type: 'CURRENT' }
  ]);

  // QR Payment States
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Transaction States
  const [transactions, setTransactions] = useState<any[]>([]);

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNotificationDetailModal, setShowNotificationDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'FEE_REMINDER',
    recipients: 'ALL',
    studentIds: [] as number[],
    dueDate: '',
    amount: '',
    sendEmail: true,
    sendSMS: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filter States
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'FEE_REMINDER' | 'ASSIGNMENT' | 'EXAM_SCHEDULE' | 'GENERAL'>('ALL');
  
  // Payroll States
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showPayrollNotificationModal, setShowPayrollNotificationModal] = useState(false);
  const [payrollForm, setPayrollForm] = useState<PayrollForm>({
    employeeId: '',
    employeeName: '',
    position: '',
    department: '',
    salaryGrade: '',
    baseSalary: '',
    allowances: {
      meal: '',
      transport: '',
      phone: '',
      housing: '',
      responsibility: '',
      other: ''
    },
    bonuses: {
      performance: '',
      attendance: '',
      project: '',
      holiday: '',
      yearEnd: '',
      other: ''
    },
    deductions: {
      socialInsurance: '',
      healthInsurance: '',
      unemploymentInsurance: '',
      personalIncomeTax: '',
      unionFee: '',
      other: ''
    },
    grossSalary: '',
    netSalary: '',
    payPeriod: '',
    paymentDate: '',
    status: 'PENDING'
  });
  const [payrollNotificationForm, setPayrollNotificationForm] = useState({
    title: '',
    message: '',
    recipients: 'ALL',
    employeeIds: [] as number[],
    payPeriod: '',
    sendEmail: true,
    sendSMS: false
  });
  
  // Mock employees
  const [employees] = useState([
    { id: 101, fullName: 'Nguyễn Văn A', position: 'Giáo viên', department: 'Toán - Lý - Hóa', email: 'anv@school.edu.vn', phone: '0901234567', baseSalary: 15000000, salaryGrade: 'GV3', experience: 5 },
    { id: 102, fullName: 'Trần Thị B', position: 'Giáo viên', department: 'Ngữ Văn - Lịch Sử', email: 'btt@school.edu.vn', phone: '0901234568', baseSalary: 14000000, salaryGrade: 'GV2', experience: 3 },
    { id: 103, fullName: 'Lê Văn C', position: 'Nhân viên hành chính', department: 'Văn phòng', email: 'lvc@school.edu.vn', phone: '0901234569', baseSalary: 8000000, salaryGrade: 'NV2', experience: 2 },
    { id: 104, fullName: 'Phạm Thị D', position: 'Thủ quỹ', department: 'Kế toán', email: 'ptd@school.edu.vn', phone: '0901234570', baseSalary: 12000000, salaryGrade: 'NV3', experience: 4 },
    { id: 105, fullName: 'Hoàng Văn E', position: 'Giáo viên', department: 'Tiếng Anh', email: 'hve@school.edu.vn', phone: '0901234571', baseSalary: 16000000, salaryGrade: 'GV4', experience: 7 },
    { id: 106, fullName: 'Ngô Thị F', position: 'Hiệu trưởng', department: 'Ban Giám hiệu', email: 'ntf@school.edu.vn', phone: '0901234572', baseSalary: 25000000, salaryGrade: 'HT', experience: 10 },
    { id: 107, fullName: 'Đỗ Văn G', position: 'Giáo viên', department: 'Sinh học - Hóa học', email: 'dvg@school.edu.vn', phone: '0901234573', baseSalary: 13000000, salaryGrade: 'GV1', experience: 1 },
    { id: 108, fullName: 'Bùi Thị H', position: 'Nhân viên IT', department: 'IT', email: 'bth@school.edu.vn', phone: '0901234574', baseSalary: 10000000, salaryGrade: 'NV4', experience: 3 },
  ]);
  
  // Filter notifications based on type
  const filteredNotifications = filterType === 'ALL' ? notifications : 
    filterType === 'UNREAD' ? notifications.filter(n => n.status === 'UNREAD') :
    notifications.filter(n => n.type === filterType);

  // Financial Summary
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    pendingInvoices: 0,
    pendingExpenses: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    api.getInvoices().then(setInvoices);
    
    // Mock notifications
    setNotifications([
      { id: 1, title: 'Học phí tháng 12', message: 'Hạn nộp học phí tháng 12 là 15/12/2023', type: 'FEE_REMINDER', studentId: 1001, studentName: 'Tran Minh Tuan', amount: 5000000, dueDate: '2023-12-15', status: 'UNREAD', date: '2023-12-01', sentEmail: true, sentSMS: false },
      { id: 2, title: 'Phí hoạt động học kỳ 1', message: 'Phí hoạt động học kỳ 1 sắp đến hạn', type: 'FEE_REMINDER', studentId: 1002, studentName: 'Le Thu Ha', amount: 2000000, dueDate: '2023-12-20', status: 'READ', date: '2023-12-02', sentEmail: true, sentSMS: true },
      { id: 3, title: 'Tài liệu học tập', message: 'Vui lòng hoàn thành bài tập cuối tuần', type: 'ASSIGNMENT', studentId: 1001, studentName: 'Tran Minh Tuan', amount: 0, dueDate: '2023-12-10', status: 'UNREAD', date: '2023-12-03', sentEmail: false, sentSMS: false },
      { id: 4, title: 'Lịch thi cuối kỳ', message: 'Lịch thi cuối kỳ đã được cập nhật', type: 'EXAM_SCHEDULE', studentId: null, studentName: 'Tất cả học sinh', amount: 0, dueDate: '', status: 'READ', date: '2023-12-04', sentEmail: true, sentSMS: false },
    ]);
    
    // Mock payrolls
    setPayrolls([
      { 
        id: 1, employeeId: 101, employeeName: 'Nguyễn Văn A', position: 'Giáo viên', department: 'Toán - Lý - Hóa', salaryGrade: 'GV3', baseSalary: 15000000, 
        allowances: { meal: 800000, transport: 500000, phone: 200000, housing: 0, responsibility: 1000000, other: 300000 },
        bonuses: { performance: 1500000, attendance: 200000, project: 500000, holiday: 300000, yearEnd: 0, other: 0 },
        deductions: { socialInsurance: 1200000, healthInsurance: 300000, unemploymentInsurance: 75000, personalIncomeTax: 1800000, unionFee: 75000, other: 0 },
        grossSalary: 19500000, netSalary: 14750000, payPeriod: '2023-11', paymentDate: '2023-11-30', status: 'PAID' 
      },
      { 
        id: 2, employeeId: 102, employeeName: 'Trần Thị B', position: 'Giáo viên', department: 'Ngữ Văn - Lịch Sử', salaryGrade: 'GV2', baseSalary: 14000000,
        allowances: { meal: 800000, transport: 400000, phone: 200000, housing: 0, responsibility: 800000, other: 200000 },
        bonuses: { performance: 1200000, attendance: 150000, project: 300000, holiday: 200000, yearEnd: 0, other: 0 },
        deductions: { socialInsurance: 1120000, healthInsurance: 280000, unemploymentInsurance: 70000, personalIncomeTax: 1500000, unionFee: 70000, other: 0 },
        grossSalary: 18250000, netSalary: 13950000, payPeriod: '2023-11', paymentDate: '2023-11-30', status: 'PAID' 
      },
      { 
        id: 3, employeeId: 103, employeeName: 'Lê Văn C', position: 'Nhân viên hành chính', department: 'Văn phòng', salaryGrade: 'NV2', baseSalary: 8000000,
        allowances: { meal: 600000, transport: 300000, phone: 150000, housing: 0, responsibility: 400000, other: 100000 },
        bonuses: { performance: 800000, attendance: 100000, project: 200000, holiday: 150000, yearEnd: 0, other: 0 },
        deductions: { socialInsurance: 640000, healthInsurance: 160000, unemploymentInsurance: 40000, personalIncomeTax: 800000, unionFee: 40000, other: 0 },
        grossSalary: 10200000, netSalary: 8220000, payPeriod: '2023-11', paymentDate: '2023-11-30', status: 'PAID' 
      },
      { 
        id: 4, employeeId: 104, employeeName: 'Phạm Thị D', position: 'Thủ quỹ', department: 'Kế toán', salaryGrade: 'NV3', baseSalary: 12000000,
        allowances: { meal: 700000, transport: 400000, phone: 200000, housing: 0, responsibility: 600000, other: 200000 },
        bonuses: { performance: 1000000, attendance: 150000, project: 400000, holiday: 200000, yearEnd: 0, other: 0 },
        deductions: { socialInsurance: 960000, healthInsurance: 240000, unemploymentInsurance: 60000, personalIncomeTax: 1200000, unionFee: 60000, other: 0 },
        grossSalary: 14850000, netSalary: 11750000, payPeriod: '2023-11', paymentDate: '2023-11-30', status: 'PAID' 
      },
      { 
        id: 5, employeeId: 105, employeeName: 'Hoàng Văn E', position: 'Giáo viên', department: 'Tiếng Anh', salaryGrade: 'GV4', baseSalary: 16000000,
        allowances: { meal: 900000, transport: 600000, phone: 200000, housing: 0, responsibility: 1200000, other: 400000 },
        bonuses: { performance: 2000000, attendance: 250000, project: 800000, holiday: 400000, yearEnd: 0, other: 0 },
        deductions: { socialInsurance: 1280000, healthInsurance: 320000, unemploymentInsurance: 80000, personalIncomeTax: 2200000, unionFee: 80000, other: 0 },
        grossSalary: 22150000, netSalary: 16750000, payPeriod: '2023-12', paymentDate: '', status: 'PENDING' 
      },
      { 
        id: 6, employeeId: 106, employeeName: 'Ngô Thị F', position: 'Hiệu trưởng', department: 'Ban Giám hiệu', salaryGrade: 'HT', baseSalary: 25000000,
        allowances: { meal: 1200000, transport: 1000000, phone: 300000, housing: 2000000, responsibility: 2000000, other: 800000 },
        bonuses: { performance: 3000000, attendance: 500000, project: 1000000, holiday: 800000, yearEnd: 5000000, other: 0 },
        deductions: { socialInsurance: 2000000, healthInsurance: 500000, unemploymentInsurance: 125000, personalIncomeTax: 4500000, unionFee: 125000, other: 0 },
        grossSalary: 35925000, netSalary: 26750000, payPeriod: '2023-12', paymentDate: '', status: 'PENDING' 
      },
    ]);
    
    // Mock transactions
    setTransactions([
      { id: 1, invoiceId: 1, type: 'INCOME', method: 'BANK_TRANSFER', amount: 5000000, status: 'COMPLETED', date: '2023-11-25', bankName: 'Vietcombank', transactionId: 'VCB123456' },
      { id: 2, invoiceId: 2, type: 'INCOME', method: 'QR_CODE', amount: 3000000, status: 'COMPLETED', date: '2023-11-24', bankName: 'Techcombank', transactionId: 'QR789012' },
      { id: 3, expenseId: 1, type: 'EXPENSE', method: 'BANK_TRANSFER', amount: 15000000, status: 'COMPLETED', date: '2023-11-23', bankName: 'ACB', transactionId: 'ACB345678' },
      { id: 4, invoiceId: 3, type: 'INCOME', method: 'CASH', amount: 2000000, status: 'PENDING', date: '2023-11-22', bankName: '', transactionId: '' },
    ]);
    
    // Mock data for expenses
    setExpenses([
      { id: 1, category: 'Lương nhân viên', description: 'Lương tháng 11/2023', amount: 150000000, date: '2023-11-25', vendor: 'Nhân viên', receipt: 'HD001', approvedBy: 'Admin', status: 'APPROVED', department: 'Nhân sự' },
      { id: 2, category: 'Điện nước', description: 'Tiền điện tháng 11', amount: 8500000, date: '2023-11-20', vendor: 'EVN', receipt: 'HD002', approvedBy: 'Admin', status: 'APPROVED', department: 'Hành chính' },
      { id: 3, category: 'Mua sắm thiết bị', description: 'Máy tính văn phòng', amount: 25000000, date: '2023-11-15', vendor: 'FPT Shop', receipt: 'HD003', approvedBy: 'Admin', status: 'PENDING', department: 'IT' },
      { id: 4, category: 'Marketing', description: 'Quảng cáo tuyển sinh', amount: 12000000, date: '2023-11-10', vendor: 'Facebook Ads', receipt: 'HD004', approvedBy: 'Admin', status: 'APPROVED', department: 'Marketing' },
      { id: 5, category: 'Đầu tư phát triển', description: 'Nâng cấp phòng học', amount: 50000000, date: '2023-11-05', vendor: 'Công ty Xây dựng', receipt: 'HD005', approvedBy: 'Admin', status: 'PENDING', department: 'Cơ sở vật chất' },
    ]);

    // Mock data for budgets
    setBudgets([
      { id: 1, category: 'Lương nhân viên', allocatedAmount: 200000000, spentAmount: 150000000, period: 'MONTHLY', department: 'Nhân sự', remaining: 50000000 },
      { id: 2, category: 'Marketing', allocatedAmount: 50000000, spentAmount: 35000000, period: 'MONTHLY', department: 'Marketing', remaining: 15000000 },
      { id: 3, category: 'Đầu tư phát triển', allocatedAmount: 100000000, spentAmount: 75000000, period: 'YEARLY', department: 'Cơ sở vật chất', remaining: 25000000 },
      { id: 4, category: 'Vận hành', allocatedAmount: 30000000, spentAmount: 22000000, period: 'MONTHLY', department: 'Hành chính', remaining: 8000000 },
    ]);

    // Calculate financial summary
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
    const pendingInvoices = invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);
    
    setFinancialSummary({
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingInvoices,
      pendingExpenses,
      monthlyGrowth: 12.5 // Mock growth percentage
    });
  }, [invoices, expenses]);

  const handleCreateInvoice = () => {
    const newInvoice: Invoice = {
      id: Date.now(),
      studentId: parseInt(invoiceForm.studentId),
      title: invoiceForm.title,
      amount: parseFloat(invoiceForm.amount),
      dueDate: invoiceForm.dueDate,
      status: 'UNPAID'
    };
    setInvoices([newInvoice, ...invoices]);
    setShowInvoiceModal(false);
    setInvoiceForm({
      studentId: '',
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      type: 'TUITION',
      items: []
    });
    alert('Tạo hóa đơn thành công!');
  };

  const handleCreateExpense = () => {
    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      status: 'PENDING'
    };
    setExpenses([newExpense, ...expenses]);
    setShowExpenseModal(false);
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      date: '',
      vendor: '',
      receipt: '',
      approvedBy: '',
      status: 'PENDING'
    });
    alert('Tạo khoản chi thành công!');
  };

  const handleCreateBudget = () => {
    const newBudget = {
      id: Date.now(),
      ...budgetForm,
      allocatedAmount: parseFloat(budgetForm.allocatedAmount),
      spentAmount: 0,
      remaining: parseFloat(budgetForm.allocatedAmount)
    };
    setBudgets([newBudget, ...budgets]);
    setShowBudgetModal(false);
    setBudgetForm({
      category: '',
      allocatedAmount: '',
      period: 'MONTHLY',
      description: '',
      department: ''
    });
    alert('Tạo ngân sách thành công!');
  };

  const approveExpense = (expenseId: number) => {
    setExpenses(expenses.map(e => 
      e.id === expenseId ? { ...e, status: 'APPROVED' } : e
    ));
    alert('Đã duyệt khoản chi!');
  };

  const rejectExpense = (expenseId: number) => {
    setExpenses(expenses.map(e => 
      e.id === expenseId ? { ...e, status: 'REJECTED' } : e
    ));
    alert('Đã từ chối khoản chi!');
  };

  const handlePayment = () => {
    const newTransaction = {
      id: Date.now(),
      invoiceId: parseInt(paymentForm.invoiceId),
      type: 'INCOME',
      method: paymentForm.paymentMethod,
      amount: parseFloat(paymentForm.amount),
      status: 'COMPLETED',
      date: paymentForm.paymentDate,
      bankName: bankAccounts.find(acc => acc.accountNumber === paymentForm.bankAccount)?.bankName || '',
      transactionId: paymentForm.transactionId
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Update invoice status
    setInvoices(invoices.map(inv => 
      inv.id === parseInt(paymentForm.invoiceId) ? { ...inv, status: 'PAID' } : inv
    ));
    
    setShowPaymentModal(false);
    setPaymentForm({
      invoiceId: '',
      paymentMethod: 'BANK_TRANSFER',
      bankAccount: '',
      transactionId: '',
      amount: '',
      paymentDate: '',
      notes: ''
    });
    alert('Thanh toán thành công!');
  };

  const generateQRPayment = (invoiceId: number, amount: number) => {
    setIsGeneratingQR(true);
    setShowQRModal(true);
    setPaymentStatus('pending');
    
    // Simulate QR generation
    setTimeout(() => {
      const qrContent = `SCHOOL_PAYMENT:${invoiceId}:${amount}:${Date.now()}`;
      setQrData(qrContent);
      setIsGeneratingQR(false);
      
      // Simulate payment completion after 5 seconds
      setTimeout(() => {
        setPaymentStatus('success');
        const newTransaction = {
          id: Date.now(),
          invoiceId,
          type: 'INCOME',
          method: 'QR_CODE',
          amount,
          status: 'COMPLETED',
          date: new Date().toISOString().split('T')[0],
          bankName: 'Multiple Banks',
          transactionId: `QR${Date.now()}`
        };
        setTransactions([newTransaction, ...transactions]);
        setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
      }, 5000);
    }, 2000);
  };

  const handleBankConnect = (bankId: number) => {
    const bank = bankAccounts.find(b => b.id === bankId);
    if (bank) {
      alert(`Đã kết nối với ${bank.bankName}!\nSố dư: ${formatCurrency(bank.balance)}`);
    }
  };

  const handleViewNotificationDetail = (notification: any) => {
    setSelectedNotification(notification);
    setShowNotificationDetailModal(true);
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
  };

  const handleSendNotification = () => {
    const newNotification = {
      id: Date.now(),
      ...notificationForm,
      status: 'SENT',
      date: new Date().toISOString().split('T')[0]
    };
    
    setNotifications([newNotification, ...notifications]);
    setShowNotificationModal(false);
    setNotificationForm({
      title: '',
      message: '',
      type: 'FEE_REMINDER',
      recipients: 'ALL',
      studentIds: [],
      dueDate: '',
      amount: '',
      sendEmail: true,
      sendSMS: false
    });
    alert('Đã gửi thông báo thành công!');
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, status: 'READ' } : n
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const deleteNotification = (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.status === 'UNREAD') {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const sendBulkNotifications = (type: string, studentIds: number[] = []) => {
    const students = studentIds.length > 0 ? studentIds : MOCK_STUDENTS.map(s => s.id);
    
    students.forEach(studentId => {
      const newNotification = {
        id: Date.now() + studentId,
        title: type === 'FEE_REMINDER' ? 'Nhắc nhở học phí' : 'Thông báo chung',
        message: type === 'FEE_REMINDER' ? 'Vui lòng thanh toán học phí đúng hạn' : 'Có thông báo mới từ trường',
        type,
        studentId,
        studentName: MOCK_STUDENTS.find(s => s.id === studentId)?.fullName || '',
        amount: type === 'FEE_REMINDER' ? 5000000 : 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'UNREAD',
        date: new Date().toISOString().split('T')[0],
        sentEmail: true,
        sentSMS: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    });
    
    setUnreadCount(prev => prev + students.length);
    alert(`Đã gửi thông báo đến ${students.length} học sinh!`);
  };

  const handleCreatePayroll = () => {
    const baseSalary = parseFloat(payrollForm.baseSalary || '0');
    const allowances = Object.values(payrollForm.allowances).reduce((sum: number, val: any) => sum + parseFloat(val || '0'), 0);
    const bonuses = Object.values(payrollForm.bonuses).reduce((sum: number, val: any) => sum + parseFloat(val || '0'), 0);
    const deductions = Object.values(payrollForm.deductions).reduce((sum: number, val: any) => sum + parseFloat(val || '0'), 0);
    
    const grossSalary = baseSalary + allowances + bonuses;
    const netSalary = grossSalary - deductions;
    
    const newPayroll = {
      id: Date.now(),
      ...payrollForm,
      grossSalary,
      netSalary,
      status: 'PENDING'
    };
    
    setPayrolls([newPayroll, ...payrolls]);
    setShowPayrollModal(false);
    setPayrollForm({
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      salaryGrade: '',
      baseSalary: '',
      allowances: {
        meal: '',
        transport: '',
        phone: '',
        housing: '',
        responsibility: '',
        other: ''
      },
      bonuses: {
        performance: '',
        attendance: '',
        project: '',
        holiday: '',
        yearEnd: '',
        other: ''
      },
      deductions: {
        socialInsurance: '',
        healthInsurance: '',
        unemploymentInsurance: '',
        personalIncomeTax: '',
        unionFee: '',
        other: ''
      },
      grossSalary: '',
      netSalary: '',
      payPeriod: '',
      paymentDate: '',
      status: 'PENDING'
    });
    alert('Tạo bảng lương thành công!');
  };

  const handleSendPayrollNotification = () => {
    const recipients = payrollNotificationForm.recipients === 'ALL' ? employees : 
      employees.filter(emp => payrollNotificationForm.employeeIds.includes(emp.id));
    
    recipients.forEach(employee => {
      const newNotification = {
        id: Date.now() + employee.id,
        title: payrollNotificationForm.title,
        message: payrollNotificationForm.message,
        type: 'PAYROLL',
        studentId: null,
        studentName: employee.fullName,
        amount: 0,
        dueDate: '',
        status: 'UNREAD',
        date: new Date().toISOString().split('T')[0],
        sentEmail: payrollNotificationForm.sendEmail,
        sentSMS: payrollNotificationForm.sendSMS,
        employeeId: employee.id,
        payPeriod: payrollNotificationForm.payPeriod
      };
      setNotifications(prev => [newNotification, ...prev]);
    });
    
    setUnreadCount(prev => prev + recipients.length);
    setShowPayrollNotificationModal(false);
    setPayrollNotificationForm({
      title: '',
      message: '',
      recipients: 'ALL',
      employeeIds: [],
      payPeriod: '',
      sendEmail: true,
      sendSMS: false
    });
    alert(`Đã gửi thông báo lương đến ${recipients.length} nhân viên!`);
  };

  const approvePayroll = (payrollId: number) => {
    setPayrolls(payrolls.map(p => 
      p.id === payrollId ? { ...p, status: 'APPROVED', paymentDate: new Date().toISOString().split('T')[0] } : p
    ));
    alert('Đã duyệt bảng lương!');
  };

  const updatePayrollStatus = (payrollId: number, status: string) => {
    setPayrolls(payrolls.map(p => 
      p.id === payrollId ? { ...p, status, paymentDate: status === 'PAID' ? new Date().toISOString().split('T')[0] : p.paymentDate } : p
    ));
    alert(`Đã cập nhật trạng thái bảng lương thành "${status}"!`);
  };

  const handleAIForecast = async () => {
    setIsForecasting(true);
    try {
      const currentRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
      const result = await aiService.finance.forecastRevenue(currentRevenue);
      setForecastResult(result);
      setShowForecastModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsForecasting(false);
    }
  };

  const filteredInvoices = filterStatus === 'ALL' ? invoices : invoices.filter(i => i.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'UNPAID': return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'OVERDUE': return 'Quá hạn';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài Chính</h2>
          <p className="text-gray-500">Hệ thống quản lý tài chính toàn diện</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
             onClick={handleAIForecast}
             disabled={isForecasting}
           >
             {isForecasting ? <Loader2 size={18} className="animate-spin"/> : <TrendingUp size={18}/>}
             {isForecasting ? 'Đang dự báo...' : 'AI Dự báo'}
           </Button>
           <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus size={18} /> Tạo Hóa Đơn
           </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 size={16} className="inline mr-2" />
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'invoices'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Receipt size={16} className="inline mr-2" />
          Hóa đơn
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard size={16} className="inline mr-2" />
          Khoản chi
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'budgets'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <PiggyBank size={16} className="inline mr-2" />
          Ngân sách
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText size={16} className="inline mr-2" />
          Báo cáo
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
            activeTab === 'payments'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Wallet size={16} className="inline mr-2" />
          Thanh toán
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
            activeTab === 'notifications'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Bell size={16} className="inline mr-2" />
          Thông báo
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'payroll'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <DollarSign size={16} className="inline mr-2" />
          Quản lý Lương
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight size={16} />
                  <span>+{financialSummary.monthlyGrowth}%</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.totalRevenue)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <ArrowDownRight size={16} />
                  <span>-8.2%</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Chi Phí</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.totalExpenses)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target size={24} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <ArrowUpRight size={16} />
                  <span>+15.3%</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Thu Net</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.netIncome)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
                <div className="text-yellow-600 text-sm font-medium">Đang chờ</div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Đang Chờ Xử lý</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.pendingInvoices + financialSummary.pendingExpenses)}</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Giao Dịch Gần Đây</h3>
              <div className="space-y-3">
                {invoices.slice(0, 5).map(invoice => {
                  const student = MOCK_STUDENTS.find(s => s.id === invoice.studentId);
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <ArrowUpRight size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{invoice.title}</p>
                          <p className="text-xs text-gray-500">{student?.fullName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(invoice.amount)}</p>
                        <p className="text-xs text-gray-500">{invoice.dueDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Chi Phí Gần Đây</h3>
              <div className="space-y-3">
                {expenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <ArrowDownRight size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.vendor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm hóa đơn..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Tất cả' : getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus size={18} /> Tạo Hóa Đơn
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Mã HĐ</th>
                  <th className="p-4">Học sinh</th>
                  <th className="p-4">Nội dung</th>
                  <th className="p-4 text-right">Số tiền</th>
                  <th className="p-4">Hạn nộp</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                  <th className="p-4 text-center">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map(inv => {
                  const student = MOCK_STUDENTS.find(s => s.id === inv.studentId);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">#{inv.id}</td>
                      <td className="p-4 font-medium">{student?.fullName} <span className="text-xs text-gray-400">({student?.code})</span></td>
                      <td className="p-4">{inv.title}</td>
                      <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(inv.amount)}</td>
                      <td className="p-4 text-sm text-gray-500">{inv.dueDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(inv.status)}`}>
                          {getStatusText(inv.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-blue-600 hover:underline text-sm font-medium">Chi tiết</button>
                      </td>
                      <td className="p-4 text-center">
                        {inv.status === 'UNPAID' && (
                          <div className="flex gap-1 justify-center">
                            <button 
                              onClick={() => {
                                setPaymentForm({
                                  ...paymentForm,
                                  invoiceId: inv.id.toString(),
                                  amount: inv.amount.toString(),
                                  paymentDate: new Date().toISOString().split('T')[0]
                                });
                                setShowPaymentModal(true);
                              }}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Chuyển khoản"
                            >
                              <CreditCard size={14} />
                            </button>
                            <button 
                              onClick={() => generateQRPayment(inv.id, inv.amount)}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                              title="QR Code"
                            >
                              <QrCode size={14} />
                            </button>
                          </div>
                        )}
                        {inv.status === 'PAID' && (
                          <span className="text-green-600 text-sm">✓ Đã thanh toán</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Khoản Chi</h3>
            <Button onClick={() => setShowExpenseModal(true)}>
              <Plus size={18} /> Tạo Khoản Chi
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Mã</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Mô tả</th>
                  <th className="p-4">Nhà cung cấp</th>
                  <th className="p-4 text-right">Số tiền</th>
                  <th className="p-4">Ngày</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{expense.id}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4">{expense.description}</td>
                    <td className="p-4">{expense.vendor}</td>
                    <td className="p-4 text-right font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                    <td className="p-4 text-sm text-gray-500">{expense.date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        expense.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status === 'APPROVED' ? 'Đã duyệt' :
                         expense.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {expense.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveExpense(expense.id)}
                            className="text-green-600 hover:underline text-sm font-medium"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => rejectExpense(expense.id)}
                            className="text-red-600 hover:underline text-sm font-medium"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Ngân sách</h3>
            <Button onClick={() => setShowBudgetModal(true)}>
              <Plus size={18} /> Tạo Ngân sách
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map(budget => {
              const percentageUsed = (budget.spentAmount / budget.allocatedAmount) * 100;
              const isOverBudget = percentageUsed > 100;
              
              return (
                <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{budget.category}</h4>
                      <p className="text-sm text-gray-500">{budget.department} • {budget.period}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isOverBudget ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isOverBudget ? 'Vượt ngân sách' : 'Trong ngân sách'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã sử dụng:</span>
                      <span className="font-medium">{formatCurrency(budget.spentAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ngân sách:</span>
                      <span className="font-medium">{formatCurrency(budget.allocatedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Còn lại:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : percentageUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      {percentageUsed.toFixed(1)}% đã sử dụng
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Bank Accounts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building size={20} className="text-blue-600" />
                Tài khoản Ngân hàng
              </h3>
              <Button onClick={() => setShowBankModal(true)}>
                <Link2 size={18} /> Kết nối Ngân hàng
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bankAccounts.map(bank => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Banknote size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{bank.bankName}</h4>
                        <p className="text-xs text-gray-500">{bank.type === 'CURRENT' ? 'Tài khoản thanh toán' : 'Tài khoản tiết kiệm'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Wifi size={12} />
                      <span className="text-xs">Đã kết nối</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <span className="font-medium">{bank.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chủ tài khoản:</span>
                      <span className="font-medium">{bank.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số dư:</span>
                      <span className="font-bold text-green-600">{formatCurrency(bank.balance)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleBankConnect(bank.id)}
                      className="w-full"
                    >
                      <Shield size={14} className="mr-2" />
                      Kiểm tra kết nối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-purple-600" />
              Giao dịch Gần đây
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Mã GD</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Phương thức</th>
                    <th className="p-4">Ngân hàng</th>
                    <th className="p-4 text-right">Số tiền</th>
                    <th className="p-4">Ngày</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">#{transaction.id}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'INCOME' ? 'Thu' : 'Chi'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {transaction.method === 'BANK_TRANSFER' && <CreditCard size={16} className="text-blue-600" />}
                          {transaction.method === 'QR_CODE' && <QrCode size={16} className="text-green-600" />}
                          {transaction.method === 'CASH' && <Banknote size={16} className="text-gray-600" />}
                          <span className="text-sm">
                            {transaction.method === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                             transaction.method === 'QR_CODE' ? 'QR Code' : 'Tiền mặt'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{transaction.bankName || '-'}</td>
                      <td className="p-4 text-right font-bold">
                        <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{transaction.date}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {transaction.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Chuyển khoản Ngân hàng</h4>
                  <p className="text-sm text-gray-500">Nhanh chóng, an toàn</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Hỗ trợ nhiều ngân hàng</p>
                <p>• Xác thực tức thì</p>
                <p>• Lưu lịch sử giao dịch</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <QrCode size={24} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Thanh toán QR Code</h4>
                  <p className="text-sm text-gray-500">Tiện lợi, hiện đại</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Quét và thanh toán</p>
                <p>• Hỗ trợ ví điện tử</p>
                <p>• Không cần tiền mặt</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Smartphone size={24} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Ví Điện Tử</h4>
                  <p className="text-sm text-gray-500">Đa dạng lựa chọn</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Momo, ZaloPay, VNPay</p>
                <p>• Khuyến mãi hấp dẫn</p>
                <p>• Thanh toán không tiếp xúc</p>
              </div>
            </div>
          </div>

          {/* Transaction Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Hướng dẫn Thực hiện Giao dịch
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    Kết nối Ngân hàng
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 ml-8">
                    <li>Vào tab "Thanh toán" → "Kết nối Ngân hàng"</li>
                    <li>Chọn ngân hàng (Vietcombank, Techcombank, ACB)</li>
                    <li>Đăng nhập và cấp quyền truy cập</li>
                    <li>Kiểm tra trạng thái "Đã kết nối"</li>
                  </ol>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    Chọn Hóa đơn
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 ml-8">
                    <li>Vào tab "Hóa đơn"</li>
                    <li>Tìm hóa đơn trạng thái "Chưa thanh toán"</li>
                    <li>Kiểm tra số tiền và hạn nộp</li>
                    <li>Chọn phương thức thanh toán</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    Thực hiện Thanh toán
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CreditCard size={16} className="text-blue-600 mt-0.5" />
                      <div>
                        <strong>Chuyển khoản:</strong> Điền thông tin → Nhập mã giao dịch → Xác nhận
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <QrCode size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <strong>QR Code:</strong> Quét mã → Xác nhận trên app → Chờ 5 giây
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    Kiểm tra & Xác nhận
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 ml-8">
                    <li>Hóa đơn chuyển thành "Đã thanh toán"</li>
                    <li>Kiểm tra lại trong "Lịch sử Giao dịch"</li>
                    <li>Nhận email xác nhận tự động</li>
                    <li>In biên lai nếu cần</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                Lưu ý Quan trọng
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Luôn kiểm tra số tiền trước khi xác nhận</li>
                <li>• Giữ lại mã giao dịch để đối chiếu</li>
                <li>• Liên hệ admin nếu giao dịch thất bại</li>
                <li>• Hệ thống tự động cập nhật sau 5 giây với QR Code</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Quản lý Thông báo</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {unreadCount} chưa đọc
                    </span>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, status: 'READ' })));
                        setUnreadCount(0);
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowNotificationModal(true)}>
                    <Send size={18} /> Gửi Thông báo
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => sendBulkNotifications('FEE_REMINDER')}
                  >
                    <BellRing size={18} /> Nhắc nhở Học phí
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('UNREAD')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'UNREAD'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Chưa đọc
                </button>
                <button
                  onClick={() => setFilterType('FEE_REMINDER')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'FEE_REMINDER'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Học phí
                </button>
                <button
                  onClick={() => setFilterType('ASSIGNMENT')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'ASSIGNMENT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Bài tập
                </button>
                <button
                  onClick={() => setFilterType('EXAM_SCHEDULE')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'EXAM_SCHEDULE'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Lịch thi
                </button>
                <button
                  onClick={() => setFilterType('GENERAL')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterType === 'GENERAL'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Chung
                </button>
              </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="secondary" 
              onClick={() => sendBulkNotifications('FEE_REMINDER')}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <AlertTriangle size={20} className="text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Nhắc nhở học phí</div>
                <div className="text-xs text-gray-500">Gửi đến tất cả học sinh</div>
              </div>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendBulkNotifications('ASSIGNMENT')}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <FileText size={20} className="text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Bài tập mới</div>
                <div className="text-xs text-gray-500">Thông báo tài liệu</div>
              </div>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendBulkNotifications('EXAM_SCHEDULE')}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <Calendar size={20} className="text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Lịch thi</div>
                <div className="text-xs text-gray-500">Cập nhật lịch thi</div>
              </div>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => sendBulkNotifications('GENERAL')}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <Info size={20} className="text-green-600" />
              <div className="text-left">
                <div className="font-medium">Thông báo chung</div>
                <div className="text-xs text-gray-500">Thông tin chung</div>
              </div>
            </Button>
          </div>

              {/* Filtered Notifications List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>Không có thông báo nào</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            notification.status === 'UNREAD' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => handleViewNotificationDetail(notification)}>
                              <div className={`p-2 rounded-full ${
                                notification.type === 'FEE_REMINDER' ? 'bg-orange-100' :
                                notification.type === 'ASSIGNMENT' ? 'bg-blue-100' :
                                notification.type === 'EXAM_SCHEDULE' ? 'bg-purple-100' :
                                notification.type === 'GENERAL' ? 'bg-gray-100' :
                                'bg-green-100'
                              }`}>
                                {notification.type === 'FEE_REMINDER' && <AlertTriangle size={16} className="text-orange-600" />}
                                {notification.type === 'ASSIGNMENT' && <FileText size={16} className="text-blue-600" />}
                                {notification.type === 'EXAM_SCHEDULE' && <Calendar size={16} className="text-purple-600" />}
                                {notification.type === 'GENERAL' && <Info size={16} className="text-gray-600" />}
                                {notification.type === 'EVENT' && <Users size={16} className="text-green-600" />}
                                {notification.type === 'ANNOUNCEMENT' && <AlertCircle size={16} className="text-red-600" />}
                              </div>
                              <div className="flex-1 cursor-pointer" onClick={() => handleViewNotificationDetail(notification)}>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                                  {notification.status === 'UNREAD' && (
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Mới</span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <UserCheck size={12} />
                                    <span>{notification.studentName}</span>
                                  </div>
                                  {notification.amount > 0 && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign size={12} />
                                      <span>{formatCurrency(notification.amount)}</span>
                                    </div>
                                  )}
                                  {notification.dueDate && (
                                    <div className="flex items-center gap-1">
                                      <Clock size={12} />
                                      <span>Hạn: {notification.dueDate}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Mail size={12} />
                                    <span>{notification.sentEmail ? 'Email ✓' : 'Email ✗'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Smartphone size={12} />
                                    <span>{notification.sentSMS ? 'SMS ✓' : 'SMS ✗'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {notification.status === 'UNREAD' && (
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Eye size={14} />
                                </Button>
                              )}
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell size={24} className="text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{notifications.length}</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng thông báo</h3>
              <p className="text-xs text-gray-400">Tất cả các thông báo</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle size={24} className="text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {notifications.filter(n => n.type === 'FEE_REMINDER').length}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Học phí</h3>
              <p className="text-xs text-gray-400">Thông báo học phí</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {notifications.filter(n => n.status === 'READ').length}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Đã đọc</h3>
              <p className="text-xs text-gray-400">Thông báo đã xem</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {notifications.filter(n => n.type === 'EXAM_SCHEDULE').length}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Lịch thi</h3>
              <p className="text-xs text-gray-400">Thông báo lịch thi</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Thống kê Chi tiết
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{notifications.filter(n => n.type === 'ASSIGNMENT').length}</div>
                <div className="text-sm text-gray-600">Bài tập</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{notifications.filter(n => n.status === 'UNREAD').length}</div>
                <div className="text-sm text-gray-600">Chưa đọc</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{notifications.filter(n => n.sentEmail).length}</div>
                <div className="text-sm text-gray-600">Đã gửi Email</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{notifications.filter(n => n.sentSMS).length}</div>
                <div className="text-sm text-gray-600">Đã gửi SMS</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Quản lý Lương</h3>
              <div className="text-sm text-gray-500">
                Tổng: {payrolls.length} bảng lương
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowPayrollNotificationModal(true)}>
                <BellRing size={18} /> Thông báo Lương
              </Button>
              <Button onClick={() => setShowPayrollModal(true)}>
                <Plus size={18} /> Tạo Bảng Lương
              </Button>
            </div>
          </div>

          {/* Payroll Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{employees.length}</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Nhân viên</h3>
              <p className="text-xs text-gray-400">Giáo viên và nhân viên</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(payrolls.reduce((sum, p) => sum + p.totalSalary, 0))}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Lương</h3>
              <p className="text-xs text-gray-400">Tất cả kỳ lương</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock size={24} className="text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {payrolls.filter(p => p.status === 'PENDING').length}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Chờ Duyệt</h3>
              <p className="text-xs text-gray-400">Bảng lương chờ duyệt</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle size={24} className="text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {payrolls.filter(p => p.status === 'PAID').length}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Đã Thanh toán</h3>
              <p className="text-xs text-gray-400">Bảng lương đã thanh toán</p>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Mã NV</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Chức vụ</th>
                  <th className="p-4">Bậc lương</th>
                  <th className="p-4">Lương CB</th>
                  <th className="p-4 text-right">Phụ cấp</th>
                  <th className="p-4 text-right">Thưởng</th>
                  <th className="p-4 text-right">BHXH</th>
                  <th className="p-4 text-right">BHYT</th>
                  <th className="p-4 text-right">BHTN</th>
                  <th className="p-4 text-right">TNCN</th>
                  <th className="p-4 text-right">CĐ</th>
                  <th className="p-4 text-right">Tổng thu</th>
                  <th className="p-4 text-right">Thực lĩnh</th>
                  <th className="p-4">Kỳ lương</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrolls.map(payroll => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{payroll.employeeId}</td>
                    <td className="p-4 font-medium">{payroll.employeeName}</td>
                    <td className="p-4">{payroll.position}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {payroll.salaryGrade}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(payroll.baseSalary)}</td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-medium">
                        <div className="text-blue-600">{formatCurrency(
                          (payroll.allowances.meal || 0) + 
                          (payroll.allowances.transport || 0) + 
                          (payroll.allowances.phone || 0) + 
                          (payroll.allowances.housing || 0) + 
                          (payroll.allowances.responsibility || 0) + 
                          (payroll.allowances.other || 0)
                        )}</div>
                        <div className="text-xs text-gray-500">6 khoản</div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-medium">
                        <div className="text-green-600">{formatCurrency(
                          (payroll.bonuses.performance || 0) + 
                          (payroll.bonuses.attendance || 0) + 
                          (payroll.bonuses.project || 0) + 
                          (payroll.bonuses.holiday || 0) + 
                          (payroll.bonuses.yearEnd || 0) + 
                          (payroll.bonuses.other || 0)
                        )}</div>
                        <div className="text-xs text-gray-500">6 khoản</div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(payroll.deductions.socialInsurance)}</td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(payroll.deductions.healthInsurance)}</td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(payroll.deductions.unemploymentInsurance)}</td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(payroll.deductions.personalIncomeTax)}</td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(payroll.deductions.unionFee)}</td>
                    <td className="p-4 text-right font-bold text-blue-600">{formatCurrency(payroll.grossSalary)}</td>
                    <td className="p-4 text-right font-bold text-green-600">{formatCurrency(payroll.netSalary)}</td>
                    <td className="p-4 text-sm">{payroll.payPeriod}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        payroll.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payroll.status === 'PAID' ? 'Đã thanh toán' :
                         payroll.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        {payroll.status === 'PENDING' && (
                          <button 
                            onClick={() => approvePayroll(payroll.id)}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Duyệt
                          </button>
                        )}
                        {payroll.status === 'APPROVED' && (
                          <button 
                            onClick={() => updatePayrollStatus(payroll.id, 'PAID')}
                            className="text-green-600 hover:underline text-sm font-medium"
                          >
                            Thanh toán
                          </button>
                        )}
                        <button className="text-gray-600 hover:underline text-sm font-medium">
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payrolls.length === 0 && (
              <div className="p-8 text-center text-gray-500">Chưa có bảng lương nào.</div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              variant="secondary" 
              onClick={() => setShowPayrollNotificationModal(true)}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <BellRing size={20} className="text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Thông báo lương</div>
                <div className="text-xs text-gray-500">Gửi thông báo lương</div>
              </div>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                // Generate payroll for all employees
                const currentPeriod = new Date().toISOString().slice(0, 7);
                employees.forEach(employee => {
                  const newPayroll = {
                    id: Date.now() + employee.id,
                    employeeId: employee.id,
                    employeeName: employee.fullName,
                    position: employee.position,
                    department: employee.department,
                    baseSalary: employee.baseSalary,
                    allowances: Math.floor(employee.baseSalary * 0.1),
                    bonuses: Math.floor(employee.baseSalary * 0.05),
                    deductions: Math.floor(employee.baseSalary * 0.08),
                    totalSalary: 0,
                    payPeriod: currentPeriod,
                    paymentDate: '',
                    status: 'PENDING'
                  };
                  newPayroll.totalSalary = newPayroll.baseSalary + newPayroll.allowances + newPayroll.bonuses - newPayroll.deductions;
                  setPayrolls(prev => [...prev, newPayroll]);
                });
                alert('Đã tạo bảng lương cho tất cả nhân viên!');
              }}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <Users size={20} className="text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Tạo lương hàng loạt</div>
                <div className="text-xs text-gray-500">Tạo cho tất cả nhân viên</div>
              </div>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                // Export payroll data
                alert('Chức năng xuất bảng lương đang phát triển!');
              }}
              className="flex items-center justify-center gap-2 p-4 h-auto"
            >
              <Download size={20} className="text-green-600" />
              <div className="text-left">
                <div className="font-medium">Xuất báo cáo</div>
                <div className="text-xs text-gray-500">Xuất file Excel/PDF</div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-blue-600" />
                Phân tích Doanh thu
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Học phí:</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalRevenue * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dịch vụ khác:</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalRevenue * 0.2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={20} className="text-red-600" />
                Phân tích Chi phí
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lương nhân viên:</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalExpenses * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vận hành:</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalExpenses * 0.4)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download size={20} className="text-green-600" />
                Xuất Báo cáo
              </h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start">
                  <FileText size={16} className="mr-2" />
                  Báo cáo Thu chi
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <FileText size={16} className="mr-2" />
                  Báo cáo Ngân sách
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <FileText size={16} className="mr-2" />
                  Báo cáo Hóa đơn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Tạo Hóa Đơn Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học sinh</label>
                  <select
                     value={invoiceForm.studentId}
                     onChange={(e) => setInvoiceForm({...invoiceForm, studentId: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn học sinh</option>
                     {MOCK_STUDENTS.map(student => (
                        <option key={student.id} value={student.id}>
                           {student.fullName} ({student.code})
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại hóa đơn</label>
                  <select
                     value={invoiceForm.type}
                     onChange={(e) => setInvoiceForm({...invoiceForm, type: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="TUITION">Học phí</option>
                     <option value="FACILITY">Phí cơ sở vật chất</option>
                     <option value="ACTIVITY">Phí hoạt động</option>
                     <option value="OTHER">Khác</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
               <input
                  type="text"
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({...invoiceForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung hóa đơn"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả chi tiết"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                     type="number"
                     value={invoiceForm.amount}
                     onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp</label>
                  <input
                     type="date"
                     value={invoiceForm.dueDate}
                     onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min={new Date().toISOString().split('T')[0]}
                  />
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleCreateInvoice} disabled={!invoiceForm.studentId || !invoiceForm.title || !invoiceForm.amount}>
                  Tạo hóa đơn
               </Button>
            </div>
         </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Tạo Khoản Chi Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                     value={expenseForm.category}
                     onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn danh mục</option>
                     <option value="Lương nhân viên">Lương nhân viên</option>
                     <option value="Điện nước">Điện nước</option>
                     <option value="Mua sắm thiết bị">Mua sắm thiết bị</option>
                     <option value="Marketing">Marketing</option>
                     <option value="Đầu tư phát triển">Đầu tư phát triển</option>
                     <option value="Vận hành">Vận hành</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                  <input
                     type="text"
                     value={expenseForm.vendor}
                     onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhà cung cấp"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả chi tiết khoản chi"
               />
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                     type="number"
                     value={expenseForm.amount}
                     onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                  <input
                     type="date"
                     value={expenseForm.date}
                     onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số hóa đơn</label>
                  <input
                     type="text"
                     value={expenseForm.receipt}
                     onChange={(e) => setExpenseForm({...expenseForm, receipt: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Số hóa đơn"
                  />
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleCreateExpense} disabled={!expenseForm.category || !expenseForm.description || !expenseForm.amount}>
                  Tạo khoản chi
               </Button>
            </div>
         </div>
      </Modal>

      {/* Budget Modal */}
      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Tạo Ngân sách Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                     value={budgetForm.category}
                     onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn danh mục</option>
                     <option value="Lương nhân viên">Lương nhân viên</option>
                     <option value="Marketing">Marketing</option>
                     <option value="Đầu tư phát triển">Đầu tư phát triển</option>
                     <option value="Vận hành">Vận hành</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                  <input
                     type="text"
                     value={budgetForm.department}
                     onChange={(e) => setBudgetForm({...budgetForm, department: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập phòng ban"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền ngân sách</label>
                  <input
                     type="number"
                     value={budgetForm.allocatedAmount}
                     onChange={(e) => setBudgetForm({...budgetForm, allocatedAmount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ</label>
                  <select
                     value={budgetForm.period}
                     onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="MONTHLY">Hàng tháng</option>
                     <option value="QUARTERLY">Hàng quý</option>
                     <option value="YEARLY">Hàng năm</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
               <textarea
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả chi tiết ngân sách"
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowBudgetModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleCreateBudget} disabled={!budgetForm.category || !budgetForm.allocatedAmount}>
                  Tạo ngân sách
               </Button>
            </div>
         </div>
      </Modal>

      {/* AI Forecast Modal */}
      <Modal isOpen={showForecastModal} onClose={() => setShowForecastModal(false)} title="Dự báo Tài chính AI">
         {forecastResult && (
            <div className="space-y-4">
               <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 mb-2">{forecastResult.title}</h4>
                  <p className="text-green-700 text-sm">{forecastResult.summary}</p>
               </div>
               
               {forecastResult.dataPoints && (
                  <div className="text-center py-4">
                     <div className="text-gray-500 text-sm">{forecastResult.dataPoints[0].label}</div>
                     <div className="text-3xl font-bold text-gray-800">{forecastResult.dataPoints[0].value}</div>
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp size={16}/> Khuyến nghị:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {forecastResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowForecastModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Thanh toán Hóa đơn" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <select
                     value={paymentForm.paymentMethod}
                     onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                     <option value="QR_CODE">QR Code</option>
                     <option value="CASH">Tiền mặt</option>
                     <option value="E_WALLET">Ví điện tử</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản ngân hàng</label>
                  <select
                     value={paymentForm.bankAccount}
                     onChange={(e) => setPaymentForm({...paymentForm, bankAccount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn tài khoản</option>
                     {bankAccounts.map(bank => (
                        <option key={bank.id} value={bank.accountNumber}>
                           {bank.bankName} - {bank.accountNumber}
                        </option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                     type="number"
                     value={paymentForm.amount}
                     onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                     disabled
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
                  <input
                     type="date"
                     value={paymentForm.paymentDate}
                     onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch</label>
               <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mã giao dịch (nếu có)"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
               <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ghi chú thanh toán"
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handlePayment} disabled={!paymentForm.paymentMethod || !paymentForm.amount}>
                  Xác nhận thanh toán
               </Button>
            </div>
         </div>
      </Modal>

      {/* Bank Connection Modal */}
      <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Kết nối Ngân hàng" maxWidth="max-w-md">
         <div className="space-y-4">
            <div className="text-center">
               <div className="mb-4">
                  <Building size={48} className="text-blue-600 mx-auto" />
               </div>
               <h3 className="text-lg font-semibold mb-2">Kết nối Tài khoản Ngân hàng</h3>
               <p className="text-gray-600 text-sm">Kết nối tài khoản ngân hàng để tự động hóa thanh toán</p>
            </div>

            <div className="space-y-3">
               <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          VCB
                        </div>
                        <div>
                           <h4 className="font-medium">Vietcombank</h4>
                           <p className="text-sm text-gray-500">Kết nối qua Internet Banking</p>
                        </div>
                     </div>
                     <Link2 size={20} className="text-gray-400" />
                  </div>
               </div>

               <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                          TCB
                        </div>
                        <div>
                           <h4 className="font-medium">Techcombank</h4>
                           <p className="text-sm text-gray-500">Kết nối qua Techcombank Mobile</p>
                        </div>
                     </div>
                     <Link2 size={20} className="text-gray-400" />
                  </div>
               </div>

               <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                          ACB
                        </div>
                        <div>
                           <h4 className="font-medium">ACB</h4>
                           <p className="text-sm text-gray-500">Kết nối qua ACB ONE</p>
                        </div>
                     </div>
                     <Link2 size={20} className="text-gray-400" />
                  </div>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  Bảo mật & An toàn
               </h4>
               <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mã hóa 256-bit SSL</li>
                  <li>• Xác thực hai yếu tố</li>
                  <li>• Không lưu thông tin nhạy cảm</li>
               </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowBankModal(false)}>
                  Đóng
               </Button>
            </div>
         </div>
      </Modal>

      {/* QR Payment Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Thanh toán QR Code" maxWidth="max-w-md">
         <div className="space-y-4">
            <div className="text-center">
               <div className="mb-4">
                  <div className="w-64 h-64 mx-auto border-4 border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                     {isGeneratingQR ? (
                        <>
                           <div className="animate-pulse mb-4">
                              <QrCode size={48} className="text-gray-400" />
                           </div>
                           <p className="text-gray-600 font-medium">Đang tạo mã QR...</p>
                        </>
                     ) : paymentStatus === 'pending' ? (
                        <>
                           <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-4">
                              <div className="w-40 h-40 bg-gray-200 rounded flex items-center justify-center">
                                 <QrCode size={80} className="text-gray-600" />
                              </div>
                           </div>
                           <p className="text-gray-600 font-medium">Quét mã để thanh toán</p>
                           <p className="text-sm text-gray-500 mt-2">Sử dụng ứng dụng ngân hàng hoặc ví điện tử</p>
                        </>
                     ) : paymentStatus === 'success' ? (
                        <>
                           <div className="mb-4">
                              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                 <CheckCircle size={40} className="text-green-600" />
                              </div>
                           </div>
                           <p className="text-green-600 font-bold text-lg">Thanh toán thành công!</p>
                           <p className="text-sm text-gray-500 mt-2">Giao dịch đã được xác nhận</p>
                        </>
                     ) : (
                        <>
                           <div className="mb-4">
                              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                 <XCircle size={40} className="text-red-600" />
                              </div>
                           </div>
                           <p className="text-red-600 font-bold text-lg">Thanh toán thất bại</p>
                           <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại</p>
                        </>
                     )}
                  </div>
               </div>

               {paymentStatus === 'pending' && (
                  <div className="flex justify-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
               )}

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn thanh toán:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                     <li>1. Mở ứng dụng ngân hàng/ví điện tử</li>
                     <li>2. Chọn "Quét mã QR"</li>
                     <li>3. Đưa camera vào mã QR trên màn hình</li>
                     <li>4. Xác nhận thông tin và thanh toán</li>
                  </ul>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="secondary" onClick={() => setShowQRModal(false)}>
                     {paymentStatus === 'success' ? 'Hoàn tất' : 'Hủy'}
                  </Button>
                  {paymentStatus === 'failed' && (
                     <Button onClick={() => setShowQRModal(false)}>
                        Thử lại
                     </Button>
                  )}
               </div>
            </div>
         </div>
      </Modal>

      {/* Send Notification Modal */}
      <Modal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} title="Gửi Thông báo Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại thông báo</label>
                  <select
                     value={notificationForm.type}
                     onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="FEE_REMINDER">Nhắc nhở học phí</option>
                     <option value="ASSIGNMENT">Bài tập/Tài liệu</option>
                     <option value="EXAM_SCHEDULE">Lịch thi</option>
                     <option value="GENERAL">Thông báo chung</option>
                     <option value="EVENT">Sự kiện</option>
                     <option value="ANNOUNCEMENT">Thông báo quan trọng</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
                  <select
                     value={notificationForm.recipients}
                     onChange={(e) => setNotificationForm({...notificationForm, recipients: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="ALL">Tất cả học sinh</option>
                     <option value="CLASS">Theo lớp</option>
                     <option value="INDIVIDUAL">Cá nhân</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
               <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề thông báo"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung thông báo</label>
               <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Nhập nội dung chi tiết thông báo"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (nếu có)</label>
                  <input
                     type="number"
                     value={notificationForm.amount}
                     onChange={(e) => setNotificationForm({...notificationForm, amount: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp (nếu có)</label>
                  <input
                     type="date"
                     value={notificationForm.dueDate}
                     onChange={(e) => setNotificationForm({...notificationForm, dueDate: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
               <h4 className="font-medium text-gray-800 mb-3">Phương thức gửi</h4>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={notificationForm.sendEmail}
                        onChange={(e) => setNotificationForm({...notificationForm, sendEmail: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600"
                     />
                     <span className="text-sm text-gray-700">Gửi qua Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={notificationForm.sendSMS}
                        onChange={(e) => setNotificationForm({...notificationForm, sendSMS: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600"
                     />
                     <span className="text-sm text-gray-700">Gửi qua SMS</span>
                  </label>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info size={16} />
                  Thông tin gửi
               </h4>
               <div className="text-sm text-blue-700 space-y-1">
                  <p>• Email sẽ được gửi đến địa chỉ email của phụ huynh</p>
                  <p>• SMS sẽ được gửi đến số điện thoại đã đăng ký</p>
                  <p>• Thông báo sẽ xuất hiện trong tài khoản học sinh</p>
                  <p>• Phụ huynh có thể thanh toán trực tiếp từ thông báo</p>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleSendNotification} disabled={!notificationForm.title || !notificationForm.message}>
                  Gửi thông báo
               </Button>
            </div>
         </div>
      </Modal>

      {/* Notification Detail Modal */}
      <Modal isOpen={showNotificationDetailModal} onClose={() => setShowNotificationDetailModal(false)} title="Chi tiết Thông báo" maxWidth="max-w-2xl">
         {selectedNotification && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className={`p-3 rounded-full ${
                  selectedNotification.type === 'FEE_REMINDER' ? 'bg-orange-100' :
                  selectedNotification.type === 'ASSIGNMENT' ? 'bg-blue-100' :
                  selectedNotification.type === 'EXAM_SCHEDULE' ? 'bg-purple-100' :
                  selectedNotification.type === 'GENERAL' ? 'bg-gray-100' :
                  'bg-green-100'
                }`}>
                  {selectedNotification.type === 'FEE_REMINDER' && <AlertTriangle size={24} className="text-orange-600" />}
                  {selectedNotification.type === 'ASSIGNMENT' && <FileText size={24} className="text-blue-600" />}
                  {selectedNotification.type === 'EXAM_SCHEDULE' && <Calendar size={24} className="text-purple-600" />}
                  {selectedNotification.type === 'GENERAL' && <Info size={24} className="text-gray-600" />}
                  {selectedNotification.type === 'EVENT' && <Users size={24} className="text-green-600" />}
                  {selectedNotification.type === 'ANNOUNCEMENT' && <AlertCircle size={24} className="text-red-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedNotification.status === 'UNREAD' ? 'Chưa đọc' : 'Đã đọc'} • {selectedNotification.date}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-3">Nội dung thông báo</h4>
                <p className="text-gray-700 leading-relaxed">{selectedNotification.message}</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <UserCheck size={16} className="text-blue-600" />
                    Thông tin học sinh
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ và tên:</span>
                      <span className="font-medium">{selectedNotification.studentName}</span>
                    </div>
                    {selectedNotification.studentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã học sinh:</span>
                        <span className="font-medium">HS{selectedNotification.studentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedNotification.amount > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      Thông tin thanh toán
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-bold text-green-600">{formatCurrency(selectedNotification.amount)}</span>
                      </div>
                      {selectedNotification.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hạn nộp:</span>
                          <span className="font-medium text-orange-600">{selectedNotification.dueDate}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          // Find related invoice and open payment modal
                          const relatedInvoice = invoices.find(inv => 
                            inv.studentId === selectedNotification.studentId && 
                            inv.amount === selectedNotification.amount
                          );
                          if (relatedInvoice) {
                            setPaymentForm({
                              ...paymentForm,
                              invoiceId: relatedInvoice.id.toString(),
                              amount: relatedInvoice.amount.toString(),
                              paymentDate: new Date().toISOString().split('T')[0]
                            });
                            setShowNotificationDetailModal(false);
                            setShowPaymentModal(true);
                          }
                        }}
                      >
                        <CreditCard size={16} className="mr-2" />
                        Thanh toán ngay
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Send size={16} className="text-purple-600" />
                  Thông tin gửi
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className={`ml-2 ${selectedNotification.sentEmail ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedNotification.sentEmail ? 'Đã gửi ✓' : 'Chưa gửi ✗'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">SMS:</span>
                      <span className={`ml-2 ${selectedNotification.sentSMS ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedNotification.sentSMS ? 'Đã gửi ✓' : 'Chưa gửi ✗'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>• Email được gửi đến địa chỉ email của phụ huynh</p>
                  <p>• SMS được gửi đến số điện thoại đã đăng ký</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (selectedNotification.status === 'UNREAD') {
                      markAsRead(selectedNotification.id);
                    }
                  }}
                >
                  <Eye size={16} className="mr-2" />
                  {selectedNotification.status === 'UNREAD' ? 'Đánh dấu đã đọc' : 'Đã đọc'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    // Forward notification
                    alert('Chức năng chuyển tiếp thông báo đang phát triển!');
                  }}
                >
                  <Send size={16} className="mr-2" />
                  Chuyển tiếp
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    // Print notification
                    alert('Chức năng in thông báo đang phát triển!');
                  }}
                >
                  <Download size={16} className="mr-2" />
                  In thông báo
                </Button>
                <Button 
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setShowNotificationDetailModal(false);
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
         )}
      </Modal>

      {/* Payroll Modal */}
      <Modal isOpen={showPayrollModal} onClose={() => setShowPayrollModal(false)} title="Tạo Bảng Lương Chi Tiết" maxWidth="max-w-4xl">
         <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                  <select
                     value={payrollForm.employeeId}
                     onChange={(e) => {
                       const employee = employees.find(emp => emp.id === parseInt(e.target.value));
                       setPayrollForm({
                         ...payrollForm,
                         employeeId: e.target.value,
                         employeeName: employee?.fullName || '',
                         position: employee?.position || '',
                         department: employee?.department || '',
                         salaryGrade: employee?.salaryGrade || '',
                         baseSalary: employee?.baseSalary?.toString() || ''
                       });
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn nhân viên</option>
                     {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                           {employee.fullName} - {employee.position} ({employee.salaryGrade})
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bậc lương</label>
                  <input
                     type="text"
                     value={payrollForm.salaryGrade}
                     onChange={(e) => setPayrollForm({...payrollForm, salaryGrade: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Ví dụ: GV3, NV2"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ lương</label>
                  <input
                     type="text"
                     value={payrollForm.payPeriod}
                     onChange={(e) => setPayrollForm({...payrollForm, payPeriod: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Ví dụ: 2023-12"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản</label>
                  <input
                     type="number"
                     value={payrollForm.baseSalary}
                     onChange={(e) => setPayrollForm({...payrollForm, baseSalary: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="0"
                     min="0"
                  />
               </div>
            </div>

            {/* Phụ cấp */}
            <div className="border-t pt-4">
               <h4 className="font-semibold text-gray-800 mb-3">Phụ cấp</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ăn trưa</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.meal}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, meal: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Đi lại</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.transport}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, transport: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.phone}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, phone: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nhà ở</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.housing}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, housing: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Trách nhiệm</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.responsibility}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, responsibility: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Khác</label>
                     <input
                        type="number"
                        value={payrollForm.allowances.other}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: {...payrollForm.allowances, other: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
               </div>
            </div>

            {/* Thưởng */}
            <div className="border-t pt-4">
               <h4 className="font-semibold text-gray-800 mb-3">Thưởng</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Hiệu suất</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.performance}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, performance: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên cần</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.attendance}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, attendance: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.project}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, project: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Thưởng lễ</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.holiday}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, holiday: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Thưởng cuối năm</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.yearEnd}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, yearEnd: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Khác</label>
                     <input
                        type="number"
                        value={payrollForm.bonuses.other}
                        onChange={(e) => setPayrollForm({...payrollForm, bonuses: {...payrollForm.bonuses, other: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
               </div>
            </div>

            {/* Khấu trừ */}
            <div className="border-t pt-4">
               <h4 className="font-semibold text-gray-800 mb-3">Khấu trừ</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">BHXH (8%)</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.socialInsurance}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, socialInsurance: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">BHYT (1.5%)</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.healthInsurance}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, healthInsurance: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">BHTN (1%)</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.unemploymentInsurance}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, unemploymentInsurance: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Thuế TNCN</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.personalIncomeTax}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, personalIncomeTax: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Phí Công đoàn</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.unionFee}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, unionFee: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Khác</label>
                     <input
                        type="number"
                        value={payrollForm.deductions.other}
                        onChange={(e) => setPayrollForm({...payrollForm, deductions: {...payrollForm.deductions, other: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                     />
                  </div>
               </div>
            </div>

            {/* Tổng kết */}
            <div className="bg-gray-50 rounded-lg p-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Tổng phụ cấp:</span>
                        <span className="text-lg font-medium text-blue-600">
                           {formatCurrency(
                             Object.values(payrollForm.allowances).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
                           )}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Tổng thưởng:</span>
                        <span className="text-lg font-medium text-green-600">
                           {formatCurrency(
                             Object.values(payrollForm.bonuses).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
                           )}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Tổng khấu trừ:</span>
                        <span className="text-lg font-medium text-red-600">
                           {formatCurrency(
                             Object.values(payrollForm.deductions).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
                           )}
                        </span>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Tổng thu nhập:</span>
                        <span className="text-xl font-bold text-blue-600">
                           {formatCurrency(
                             parseFloat(payrollForm.baseSalary || '0') + 
                             Object.values(payrollForm.allowances).reduce((sum, val) => sum + parseFloat(val || '0'), 0) + 
                             Object.values(payrollForm.bonuses).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
                           )}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Thực lĩnh:</span>
                        <span className="text-2xl font-bold text-green-600">
                           {formatCurrency(
                             (parseFloat(payrollForm.baseSalary || '0') + 
                              Object.values(payrollForm.allowances).reduce((sum, val) => sum + parseFloat(val || '0'), 0) + 
                              Object.values(payrollForm.bonuses).reduce((sum, val) => sum + parseFloat(val || '0'), 0)) -
                             Object.values(payrollForm.deductions).reduce((sum, val) => sum + parseFloat(val || '0'), 0)
                           )}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowPayrollModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleCreatePayroll} disabled={!payrollForm.employeeId || !payrollForm.baseSalary}>
                  Tạo bảng lương
               </Button>
            </div>
         </div>
      </Modal>

      {/* Payroll Notification Modal */}
      <Modal isOpen={showPayrollNotificationModal} onClose={() => setShowPayrollNotificationModal(false)} title="Gửi Thông báo Lương" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
                  <select
                     value={payrollNotificationForm.recipients}
                     onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, recipients: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="ALL">Tất cả nhân viên</option>
                     <option value="TEACHERS">Giáo viên</option>
                     <option value="STAFF">Nhân viên</option>
                     <option value="INDIVIDUAL">Cá nhân</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ lương</label>
                  <input
                     type="text"
                     value={payrollNotificationForm.payPeriod}
                     onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, payPeriod: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Ví dụ: 2023-12"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
               <input
                  type="text"
                  value={payrollNotificationForm.title}
                  onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề thông báo lương"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung thông báo</label>
               <textarea
                  value={payrollNotificationForm.message}
                  onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Nhập nội dung chi tiết thông báo lương"
               />
            </div>

            <div className="border-t border-gray-200 pt-4">
               <h4 className="font-medium text-gray-800 mb-3">Phương thức gửi</h4>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={payrollNotificationForm.sendEmail}
                        onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, sendEmail: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600"
                     />
                     <span className="text-sm text-gray-700">Gửi qua Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={payrollNotificationForm.sendSMS}
                        onChange={(e) => setPayrollNotificationForm({...payrollNotificationForm, sendSMS: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600"
                     />
                     <span className="text-sm text-gray-700">Gửi qua SMS</span>
                  </label>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info size={16} />
                  Thông tin gửi
               </h4>
               <div className="text-sm text-blue-700 space-y-1">
                  <p>• Email sẽ được gửi đến địa chỉ email của nhân viên</p>
                  <p>• SMS sẽ được gửi đến số điện thoại đã đăng ký</p>
                  <p>• Thông báo sẽ xuất hiện trong tài khoản nhân viên</p>
                  <p>• Nhân viên có thể xem chi tiết bảng lương từ thông báo</p>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowPayrollNotificationModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleSendPayrollNotification} disabled={!payrollNotificationForm.title || !payrollNotificationForm.message}>
                  Gửi thông báo lương
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default FinanceView;