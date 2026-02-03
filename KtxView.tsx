import React, { useState, useEffect } from 'react';
import { Building2, Users, Bed, FileText, Upload, Calendar, DollarSign, Settings, Package, Zap, Droplets, Wind, Plus, Search, Filter, Edit, Trash2, Eye, Download, CheckCircle, AlertCircle, XCircle, Clock, Camera, BookOpen, Smartphone, QrCode } from 'lucide-react';
import { Button, Modal } from './components';
import { useSharedKtxData } from './useSharedKtxData';

// Interfaces
interface Student {
  id: number;
  code: string;
  fullName: string;
  classId: number;
  gender: 'Nam' | 'Nữ';
  phone: string;
  email: string;
  address: string;
  idCard: string;
  roomNumber?: string;
  checkInDate?: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

interface Room {
  id: number;
  roomNumber: string;
  area: 'A' | 'B';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  type: 'Standard' | 'Premium' | 'VIP';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  price: number;
  facilities: string[];
  students: Student[];
}

interface Registration {
  id: number;
  studentId: string;
  studentName: string;
  roomNumber: string;
  registrationDate: string;
  duration: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

interface UtilityBill {
  id: number;
  roomId: number;
  roomNumber: string;
  month: string;
  year: number;
  electricity: number;
  water: number;
  electricityCost: number;
  waterCost: number;
  roomCost: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  splitAmounts?: { [studentId: string]: number }; // Phân chia cho từng sinh viên
  individualPayments?: IndividualPayment[]; // Thanh toán của từng sinh viên
}

interface IndividualPayment {
  id: string;
  billId: number;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paidDate?: string;
  paymentMethod?: string;
  notificationSent: boolean;
  reminderCount: number;
}

interface PaymentNotification {
  id: string;
  studentId: string;
  billId: number;
  type: 'NewBill' | 'Reminder' | 'Overdue' | 'Paid';
  message: string;
  sentDate: string;
  read: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'BankTransfer' | 'EWallet' | 'Cash' | 'CreditCard';
  accountInfo: string;
  isActive: boolean;
}

interface Equipment {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: 'Available' | 'In Use' | 'Damaged' | 'Maintenance';
  purchaseDate: string;
  warranty: string;
  supplier: string;
}

const KtxView = () => {
  // Use shared data context
  const {
    students,
    rooms,
    utilityBills,
    meterHistory,
    registrations,
    syncStudents,
    syncRooms,
    syncUtilityBills,
    syncMeterHistory,
    syncRegistrations,
    getStudentsByRoom,
    getRoomByNumber,
    getAvailableRooms,
    getOccupiedRooms,
    getBillsByRoom,
    getUnpaidBills,
    getMeterHistory: getMeterHistoryByRoom,
    getLastReading: getLastReadingByRoom
  } = useSharedKtxData();

  // State management (local state only)
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  
  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Equipment form states
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'ELECTRONICS',
    quantity: 0,
    location: '',
    condition: 'GOOD',
    purchaseDate: '',
    warranty: '',
    notes: ''
  });
  
  // Form states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<'all' | 'A' | 'B'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Room form state
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    area: 'A' as 'A' | 'B',
    floor: 1,
    capacity: 4,
    type: 'Standard' as 'Standard' | 'Premium' | 'VIP',
    price: 1200000,
    status: 'Available' as 'Available' | 'Occupied' | 'Maintenance' | 'Reserved',
    facilities: ['Điều hòa', 'Tủ lạnh']
  });

  // State for tracking newly created rooms
  const [newlyCreatedRooms, setNewlyCreatedRooms] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    studentId: '',
    studentName: '',
    roomNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    duration: 6, // months
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected'
  });

  // Get selected room details
  const getSelectedRoomDetails = () => {
    if (!registrationForm.roomNumber) return null;
    return rooms.find(r => r.roomNumber === registrationForm.roomNumber);
  };

  // Registration filter state
  const [regFilterArea, setRegFilterArea] = useState<'all' | 'A' | 'B'>('all');
  const [regFilterType, setRegFilterType] = useState<'all' | 'Standard' | 'Premium' | 'VIP'>('all');
  const [regFilterStatus, setRegFilterStatus] = useState<'all' | 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'>('all');
  const [regOnlyAvailable, setRegOnlyAvailable] = useState(true);

  // Utility bill form state
  const [utilityForm, setUtilityForm] = useState({
    roomId: 0,
    roomNumber: '',
    month: '',
    year: new Date().getFullYear(),
    electricity: 0,
    water: 0,
    electricityCost: 3000,
    waterCost: 25000,
    roomCost: 0,
    totalAmount: 0,
    status: 'Unpaid' as 'Paid' | 'Unpaid' | 'Overdue'
  });

  // Payment system states
  const [individualPayments, setIndividualPayments] = useState<IndividualPayment[]>([]);
  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      name: 'Chuyển khoản ngân hàng',
      type: 'BankTransfer',
      accountInfo: 'VCB - 1234567890 - Nguyễn Văn A',
      isActive: true
    },
    {
      id: '2',
      name: 'MoMo',
      type: 'EWallet',
      accountInfo: '0912345678',
      isActive: true
    },
    {
      id: '3',
      name: 'Tiền mặt',
      type: 'Cash',
      accountInfo: 'Nộp tại văn phòng KTX',
      isActive: true
    }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<UtilityBill | null>(null);
  
  // Payment processing states (similar to Canteen)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'transfer' | 'qr'>('transfer');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Current meter readings state
  const [meterReadings, setMeterReadings] = useState({
    currentElectricity: 0,
    currentWater: 0,
    electricityImage: '',
    waterImage: ''
  });

  // Capture state to prevent conflicts
  const [captureState, setCaptureState] = useState({
    isCapturing: false,
    currentMeterType: null as 'electricity' | 'water' | null,
    lastCaptureTime: 0
  });

  // Selected reading for detail view
  const [selectedReading, setSelectedReading] = useState<{
    roomNumber: string;
    reading: any;
    index: number;
  } | null>(null);

  // Mock current user state (in real app, this would come from authentication)
  const [currentUser] = useState({
    id: 'SV2024001',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nv@university.edu.vn',
    phone: '0912345678',
    class: 'CNTT4',
    major: 'Công nghệ thông tin'
  });

  // Initialize mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  // Auto-fill user information when registration modal opens
  useEffect(() => {
    if (showRegistrationModal) {
      setRegistrationForm(prev => ({
        ...prev,
        studentId: currentUser.id,
        studentName: currentUser.name
      }));
    }
  }, [showRegistrationModal, currentUser]);

  // Auto-clear highlights after 5 seconds
  useEffect(() => {
    if (newlyCreatedRooms.length > 0) {
      const timer = setTimeout(() => {
        setNewlyCreatedRooms([]);
        console.log('Auto-cleared highlights');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedRooms]);

  const initializeMockData = () => {
    // Mock students first (needed for room assignment)
    const mockStudents: Student[] = [
      {
        id: 1,
        code: 'SV2024001',
        fullName: 'Nguyễn Văn Minh',
        classId: 1,
        gender: 'Nam',
        phone: '0912345678',
        email: 'minh.nv@university.edu.vn',
        address: 'Hà Nội',
        idCard: '001234567890',
        status: 'Active'
      },
      {
        id: 2,
        code: 'SV2024002',
        fullName: 'Trần Thị Lan',
        classId: 2,
        gender: 'Nữ',
        phone: '0923456789',
        email: 'lan.tt@university.edu.vn',
        address: 'Hà Nội',
        idCard: '002345678901',
        status: 'Active'
      },
      {
        id: 3,
        code: 'SV2024003',
        fullName: 'Lê Văn Hùng',
        classId: 1,
        gender: 'Nam',
        phone: '0934567890',
        email: 'hung.lv@university.edu.vn',
        address: 'Hà Nội',
        idCard: '003456789012',
        status: 'Active'
      }
    ];

    syncStudents(mockStudents);

    // Generate 200 rooms for Area A
    const areaARooms: Room[] = [];
    for (let i = 1; i <= 200; i++) {
      const floor = Math.ceil(i / 20);
      areaARooms.push({
        id: i,
        roomNumber: `A${floor.toString().padStart(2, '0')}${(i % 20 || 20).toString().padStart(2, '0')}`,
        area: 'A',
        floor,
        capacity: 4,
        currentOccupancy: Math.floor(Math.random() * 5),
        type: i <= 50 ? 'Premium' : i <= 150 ? 'Standard' : 'VIP',
        status: Math.random() > 0.7 ? 'Occupied' : Math.random() > 0.5 ? 'Available' : 'Maintenance',
        price: i <= 50 ? 1500000 : i <= 150 ? 1200000 : 2000000,
        facilities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Bàn học'],
        students: []
      });
    }

    // Generate 300 rooms for Area B
    const areaBRooms: Room[] = [];
    for (let i = 1; i <= 300; i++) {
      const floor = Math.ceil(i / 25);
      areaBRooms.push({
        id: 200 + i,
        roomNumber: `B${floor.toString().padStart(2, '0')}${(i % 25 || 25).toString().padStart(2, '0')}`,
        area: 'B',
        floor,
        capacity: 6,
        currentOccupancy: Math.floor(Math.random() * 7),
        type: i <= 100 ? 'Standard' : i <= 250 ? 'Premium' : 'VIP',
        status: Math.random() > 0.6 ? 'Occupied' : Math.random() > 0.4 ? 'Available' : 'Reserved',
        price: i <= 100 ? 1000000 : i <= 250 ? 1300000 : 1800000,
        facilities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Bàn học', 'Tủ quần áo'],
        students: []
      });
    }

    // Add students to rooms for payment testing
    const updatedRoomsWithStudents = [...areaARooms, ...areaBRooms].map(room => {
      if (room.roomNumber === 'A0101') {
        return {
          ...room,
          currentOccupancy: 2,
          status: 'Occupied' as 'Available' | 'Occupied' | 'Maintenance' | 'Reserved',
          students: [
            mockStudents[0], // Nguyễn Văn Minh
            mockStudents[1]  // Trần Thị Lan
          ]
        };
      }
      if (room.roomNumber === 'A0102') {
        return {
          ...room,
          currentOccupancy: 1,
          status: 'Occupied' as 'Available' | 'Occupied' | 'Maintenance' | 'Reserved',
          students: [
            mockStudents[2]  // Lê Văn Hùng
          ]
        };
      }
      return room;
    });

    syncRooms(updatedRoomsWithStudents);

    // Mock registrations
    const mockRegistrations: Registration[] = [
      {
        id: 1,
        studentId: 'SV2024001',
        studentName: 'Nguyễn Văn Minh',
        roomNumber: 'A0101',
        registrationDate: '2024-01-15',
        duration: 6,
        status: 'Pending',
        requestDate: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        studentId: 'SV2024002',
        studentName: 'Trần Thị Anh',
        roomNumber: 'A0102',
        registrationDate: '2024-01-14',
        duration: 12,
        status: 'Approved',
        requestDate: '2024-01-14T14:20:00'
      },
      {
        id: 3,
        studentId: 'SV2024003',
        studentName: 'Lê Văn Cường',
        roomNumber: 'B0101',
        registrationDate: '2024-01-13',
        duration: 6,
        status: 'Rejected',
        requestDate: '2024-01-13T09:15:00'
      }
    ];

    syncRegistrations(mockRegistrations);

    // Mock utility bills
    const mockUtilityBills: UtilityBill[] = [
      {
        id: 1,
        roomId: 1,
        roomNumber: 'A0101',
        month: '01',
        year: 2024,
        electricity: 120,
        water: 15,
        electricityCost: 3000,
        waterCost: 25000,
        roomCost: 1200000,
        totalAmount: 361000,
        status: 'Paid',
        dueDate: '2024-01-31'
      },
      {
        id: 2,
        roomId: 2,
        roomNumber: 'A0102',
        month: '01',
        year: 2024,
        electricity: 98,
        water: 12,
        electricityCost: 3000,
        waterCost: 25000,
        roomCost: 1200000,
        totalAmount: 294000,
        status: 'Unpaid',
        dueDate: '2024-01-31'
      }
    ];

    syncUtilityBills(mockUtilityBills);

    // Mock equipment
    const mockEquipment: Equipment[] = [
      {
        id: 1,
        name: 'Máy lạnh',
        category: 'Điện lạnh',
        quantity: 500,
        unit: 'Cái',
        location: 'Tất cả các phòng',
        status: 'In Use',
        purchaseDate: '2023-01-01',
        warranty: '2025-01-01',
        supplier: 'LG Electronics'
      },
      {
        id: 2,
        name: 'Giường ngủ',
        category: 'Nội thất',
        quantity: 1000,
        unit: 'Cái',
        location: 'Tất cả các phòng',
        status: 'In Use',
        purchaseDate: '2023-06-01',
        warranty: '2028-06-01',
        supplier: 'Nội thất ABC'
      }
    ];

    setEquipment(mockEquipment);

    // Initialize individual payments for existing bills
    const mockIndividualPayments: IndividualPayment[] = [];
    
    // Add payments for bill A0101 (2 students)
    mockIndividualPayments.push(
      {
        id: '1_1',
        billId: 1,
        studentId: '1',
        studentName: 'Nguyễn Văn Minh',
        amount: 180500, // Half of 361000
        status: 'Paid',
        paidDate: '2024-01-25',
        paymentMethod: 'Chuyển khoản ngân hàng',
        notificationSent: true,
        reminderCount: 0
      },
      {
        id: '1_2',
        billId: 1,
        studentId: '2',
        studentName: 'Trần Thị Lan',
        amount: 180500, // Half of 361000
        status: 'Paid',
        paidDate: '2024-01-26',
        paymentMethod: 'MoMo',
        notificationSent: true,
        reminderCount: 0
      }
    );
    
    // Add payments for bill A0102 (1 student)
    mockIndividualPayments.push(
      {
        id: '2_3',
        billId: 2,
        studentId: '3',
        studentName: 'Lê Văn Hùng',
        amount: 294000, // Full amount (only 1 student)
        status: 'Pending',
        notificationSent: true,
        reminderCount: 1
      }
    );
    
    setIndividualPayments(mockIndividualPayments);

    // Initialize mock notifications
    const mockNotifications: PaymentNotification[] = [
      {
        id: 'notif_1',
        studentId: '1',
        billId: 1,
        type: 'Paid',
        message: '✅ Thanh toán thành công!\n\nHóa đơn tháng 01/2024\nSố tiền: 180500đ\nCảm ơn bạn đã thanh toán đúng hạn!',
        sentDate: '2024-01-25T10:00:00',
        read: true
      },
      {
        id: 'notif_2',
        studentId: '3',
        billId: 2,
        type: 'Reminder',
        message: '⏰ Nhắc nhở thanh toán hóa đơn tháng 01/2024\n\nSố tiền: 294000đ\nHạn thanh toán: 2024-01-31\n\nCòn 3 ngày nữa đến hạn thanh toán!',
        sentDate: '2024-01-28T09:00:00',
        read: false
      },
      {
        id: 'notif_3',
        studentId: '2',
        billId: 1,
        type: 'NewBill',
        message: '📄 Hóa đơn mới tháng 02/2024 phòng A0101\n\nSố tiền cần thanh toán: 185000đ\nHạn thanh toán: 2024-02-05\n\nVui lòng thanh toán đúng hạn!',
        sentDate: '2024-02-01T08:00:00',
        read: false
      },
      {
        id: 'notif_4',
        studentId: '1',
        billId: 1,
        type: 'Overdue',
        message: '⚠️ HÓA ĐƠN QUÁ HẠN!\n\nTháng 12/2023 phòng A0101\nSố tiền: 175000đ\nQuá hạn: 2024-01-05\n\nVui lòng thanh toán ngay để tránh phí phạt!',
        sentDate: '2024-01-10T14:00:00',
        read: true
      }
    ];
    
    setPaymentNotifications(mockNotifications);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Importing file:', file.name);
      // Handle file import logic here
      alert(`Đã import file: ${file.name}`);
      setShowImportModal(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const csvContent = "Mã SV,Họ tên,Lớp,Giới tính,SĐT,Email,Địa chỉ,CCCD\n" +
                      "SV001,Nguyễn Văn An,CNTT1,Nam,0912345678,an.nguyen@university.edu.vn,Hà Nội,001234567890\n" +
                      "SV002,Trần Thị Bình,CNTT2,Nữ,0923456789,binh.tran@university.edu.vn,TP.HCM,002345678901\n";
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_danh_sach_sinh_vien.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddRoom = () => {
    // Generate new room ID
    const newId = Math.max(...rooms.map(r => r.id)) + 1;
    
    // Create new room object
    const newRoom: Room = {
      id: newId,
      roomNumber: roomForm.roomNumber || `${roomForm.area}${roomForm.floor.toString().padStart(2, '0')}01`,
      area: roomForm.area,
      floor: roomForm.floor,
      capacity: roomForm.capacity,
      currentOccupancy: roomForm.status === 'Occupied' ? 1 : 0,
      type: roomForm.type,
      status: roomForm.status,
      price: roomForm.price,
      facilities: roomForm.facilities,
      students: []
    };
    
    // Add to rooms array
    syncRooms([...rooms, newRoom]);
    
    // Reset form and close modal
    setRoomForm({
      roomNumber: '',
      area: 'A',
      floor: 1,
      capacity: 4,
      type: 'Standard',
      price: 1200000,
      status: 'Available',
      facilities: ['Điều hòa', 'Tủ lạnh']
    });
    setShowRoomModal(false);
    
    alert('Đã thêm phòng mới thành công!');
  };

  // Generate available room numbers based on area and floor
  const getAvailableRoomNumbers = () => {
    const existingRooms = rooms.map(r => r.roomNumber);
    const availableRooms: string[] = [];
    
    // Generate room numbers for Area A (10 floors, 20 rooms per floor)
    for (let floor = 1; floor <= 10; floor++) {
      for (let room = 1; room <= 20; room++) {
        const roomNumber = `A${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`;
        if (!existingRooms.includes(roomNumber)) {
          availableRooms.push(roomNumber);
        }
      }
    }
    
    // Generate room numbers for Area B (10 floors, 25 rooms per floor)
    for (let floor = 1; floor <= 10; floor++) {
      for (let room = 1; room <= 25; room++) {
        const roomNumber = `B${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`;
        if (!existingRooms.includes(roomNumber)) {
          availableRooms.push(roomNumber);
        }
      }
    }
    
    return availableRooms.sort();
  };

  // Auto-fill room details when room number is selected
  const handleRoomNumberChange = (roomNumber: string) => {
    setRoomForm({...roomForm, roomNumber});
    
    if (roomNumber) {
      // Extract area, floor, and room number from the selected room
      const area = roomNumber.charAt(0) as 'A' | 'B';
      const floor = parseInt(roomNumber.substring(1, 3));
      
      // Auto-fill area and floor
      setRoomForm(prev => ({
        ...prev,
        roomNumber,
        area,
        floor
      }));
    }
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      area: room.area,
      floor: room.floor,
      capacity: room.capacity,
      type: room.type,
      price: room.price,
      status: room.status,
      facilities: room.facilities
    });
    setShowRoomModal(true);
  };

  const handleAddRoomClick = () => {
    // Reset form to default values when opening add modal
    setSelectedRoom(null);
    setRoomForm({
      roomNumber: '',
      area: 'A',
      floor: 1,
      capacity: 4,
      type: 'Standard',
      price: 1200000,
      status: 'Available',
      facilities: ['Điều hòa', 'Tủ lạnh']
    });
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    // Reset form when closing modal
    setSelectedRoom(null);
    setRoomForm({
      roomNumber: '',
      area: 'A',
      floor: 1,
      capacity: 4,
      type: 'Standard',
      price: 1200000,
      status: 'Available',
      facilities: ['Điều hòa', 'Tủ lạnh']
    });
    setShowRoomModal(false);
  };

  const handleAddRegistration = () => {
    console.log('Adding registration:', registrationForm);
    
    // Create new registration
    const newRegistration = {
      id: registrations.length + 1,
      studentId: currentUser.id,
      studentName: currentUser.name,
      roomNumber: registrationForm.roomNumber,
      registrationDate: registrationForm.registrationDate,
      duration: registrationForm.duration,
      status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      requestDate: new Date().toISOString()
    };
    
    // Add to registrations list
    syncRegistrations([...registrations, newRegistration]);
    
    alert(`Đã tạo đăng ký thành công!\n\nSinh viên: ${currentUser.name} (${currentUser.id})\nPhòng: ${registrationForm.roomNumber}\nThời gian: ${registrationForm.duration} tháng\nTrạng thái: Chờ duyệt\n\nVui lòng chờ admin duyệt đăng ký của bạn.`);
    
    // Reset form and close modal
    setRegistrationForm({
      studentId: '',
      studentName: '',
      roomNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      duration: 6,
      status: 'Pending'
    });
    setShowRegistrationModal(false);
  };

  // Get filtered rooms for registration
  const getFilteredRoomsForRegistration = () => {
    return rooms.filter(room => {
      const matchesArea = regFilterArea === 'all' || room.area === regFilterArea;
      const matchesType = regFilterType === 'all' || room.type === regFilterType;
      const matchesStatus = regFilterStatus === 'all' || room.status === regFilterStatus;
      const hasAvailableSpots = room.capacity > room.currentOccupancy;
      const matchesAvailability = !regOnlyAvailable || (hasAvailableSpots && room.status !== 'Maintenance');
      
      return matchesArea && matchesType && matchesStatus && matchesAvailability;
    });
  };

  const handleCloseRegistrationModal = () => {
    // Reset form when closing modal
    setRegistrationForm({
      studentId: '',
      studentName: '',
      roomNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      duration: 6,
      status: 'Pending'
    });
    setShowRegistrationModal(false);
  };

  // Payment system functions
  const createIndividualPayments = (bill: UtilityBill) => {
    const selectedRoom = rooms.find(r => r.id === bill.roomId);
    if (!selectedRoom || selectedRoom.students.length === 0) return [];

    const studentsInRoom = selectedRoom.students;
    const amountPerPerson = Math.floor(bill.totalAmount / studentsInRoom.length);
    const remainder = bill.totalAmount - (amountPerPerson * studentsInRoom.length);

    return studentsInRoom.map((student, index) => ({
      id: `${bill.id}_${student.id}`,
      billId: bill.id,
      studentId: student.id,
      studentName: student.fullName,
      amount: amountPerPerson + (index === 0 ? remainder : 0), // First student pays remainder
      status: 'Pending' as 'Pending' | 'Paid' | 'Overdue',
      notificationSent: false,
      reminderCount: 0
    }));
  };

  const sendPaymentNotifications = async (bill: UtilityBill, type: 'NewBill' | 'Reminder' | 'Overdue' | 'Paid') => {
    const selectedRoom = rooms.find(r => r.id === bill.roomId);
    if (!selectedRoom) return;

    const studentsInRoom = selectedRoom.students;
    const newNotifications: PaymentNotification[] = [];

    studentsInRoom.forEach(student => {
      const individualPayment = individualPayments.find(p => p.studentId === student.id && p.billId === bill.id);
      const amount = individualPayment?.amount || 0;

      let message = '';
      switch (type) {
        case 'NewBill':
          message = `📄 Hóa đơn mới tháng ${bill.month}/${bill.year} phòng ${bill.roomNumber}\n\nSố tiền cần thanh toán: ${amount.toLocaleString()}đ\nHạn thanh toán: ${bill.dueDate}\n\nVui lòng thanh toán đúng hạn!`;
          break;
        case 'Reminder':
          message = `⏰ Nhắc nhở thanh toán hóa đơn tháng ${bill.month}/${bill.year}\n\nSố tiền: ${amount.toLocaleString()}đ\nHạn thanh toán: ${bill.dueDate}\n\nCòn 3 ngày nữa đến hạn thanh toán!`;
          break;
        case 'Overdue':
          message = `⚠️ HÓA ĐƠN QUÁ HẠN!\n\nTháng ${bill.month}/${bill.year} phòng ${bill.roomNumber}\nSố tiền: ${amount.toLocaleString()}đ\nQuá hạn: ${bill.dueDate}\n\nVui lòng thanh toán ngay để tránh phí phạt!`;
          break;
        case 'Paid':
          message = `✅ Thanh toán thành công!\n\nHóa đơn tháng ${bill.month}/${bill.year}\nSố tiền: ${amount.toLocaleString()}đ\nCảm ơn bạn đã thanh toán đúng hạn!`;
          break;
      }

      newNotifications.push({
        id: `${bill.id}_${student.id}_${type}_${Date.now()}`,
        studentId: student.id,
        billId: bill.id,
        type,
        message,
        sentDate: new Date().toISOString(),
        read: false
      });
    });

    setPaymentNotifications(prev => [...prev, ...newNotifications]);
    console.log(`Sent ${newNotifications.length} ${type} notifications for bill ${bill.id}`);
  };

  const handleAddUtilityBill = () => {
    console.log('Adding utility bill:', utilityForm);
    console.log('Room selected:', utilityForm.roomId, utilityForm.roomNumber);
    console.log('Form data:', {
      electricity: utilityForm.electricity,
      water: utilityForm.water,
      month: utilityForm.month,
      year: utilityForm.year
    });
    
    // Validate required fields
    if (!utilityForm.roomId || !utilityForm.roomNumber) {
      alert('❌ Vui lòng chọn phòng!');
      return;
    }
    
    if (!utilityForm.month) {
      alert('❌ Vui lòng chọn kỳ billing!');
      return;
    }
    
    if (utilityForm.electricity === 0 && utilityForm.water === 0) {
      alert('❌ Vui lòng nhập số điện hoặc số nước đã dùng!');
      return;
    }
    
    // Calculate total amount including room cost
    const selectedRoom = rooms.find(r => r.id === utilityForm.roomId);
    const roomCost = selectedRoom ? selectedRoom.price : 0;
    const totalAmount = (utilityForm.electricity * utilityForm.electricityCost) + 
                       (utilityForm.water * utilityForm.waterCost) + roomCost;
    
    console.log('Calculated total amount:', totalAmount);
    console.log('Room cost:', roomCost);
    
    const newBill: UtilityBill = {
      id: utilityBills.length + 1,
      roomId: utilityForm.roomId,
      roomNumber: utilityForm.roomNumber,
      month: utilityForm.month,
      year: utilityForm.year,
      electricity: utilityForm.electricity,
      water: utilityForm.water,
      electricityCost: utilityForm.electricityCost,
      waterCost: utilityForm.waterCost,
      roomCost,
      totalAmount,
      status: utilityForm.status,
      dueDate: new Date(utilityForm.year, new Date(utilityForm.month).getMonth() + 1, 5).toISOString().split('T')[0]
    };
    
    console.log('New bill created:', newBill);
    
    syncUtilityBills([...utilityBills, newBill]);
    console.log('Updated utility bills:', [...utilityBills, newBill]);
    
    // Create individual payments and send notifications
    const payments = createIndividualPayments(newBill);
    setIndividualPayments(prev => [...prev, ...payments]);
    
    // Send notifications to all students in the room
    sendPaymentNotifications(newBill, 'NewBill');
    
    alert(`Đã tạo hóa đơn thành công!\n\nPhòng: ${utilityForm.roomNumber}\nTháng: ${utilityForm.month}/${utilityForm.year}\nTiền phòng: ${roomCost.toLocaleString()}đ\nTiền điện: ${utilityForm.electricity} kWh × ${utilityForm.electricityCost.toLocaleString()}đ = ${(utilityForm.electricity * utilityForm.electricityCost).toLocaleString()}đ\nTiền nước: ${utilityForm.water} m³ × ${utilityForm.waterCost.toLocaleString()}đ = ${(utilityForm.water * utilityForm.waterCost).toLocaleString()}đ\nTổng cộng: ${totalAmount.toLocaleString()}đ\n\n📧 Đã gửi thông báo cho ${payments.length} sinh viên trong phòng!`);
    
    // Reset form and close modal
    setUtilityForm({
      roomId: 0,
      roomNumber: '',
      month: '',
      year: new Date().getFullYear(),
      electricity: 0,
      water: 0,
      electricityCost: 3000,
      waterCost: 25000,
      roomCost: 0,
      totalAmount: 0,
      status: 'Unpaid'
    });
    setShowUtilityModal(false);
    console.log('Form reset and modal closed');
  };

  // Handle individual student payment
  const handleStudentPayment = (paymentId: string, paymentMethodId: string) => {
    const payment = individualPayments.find(p => p.id === paymentId);
    const method = paymentMethods.find(m => m.id === paymentMethodId);
    
    if (!payment || !method) return;
    
    // Update payment status
    const updatedPayments = individualPayments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'Paid' as 'Paid' | 'Pending' | 'Overdue', paidDate: new Date().toISOString().split('T')[0], paymentMethod: method.name }
        : p
    );
    setIndividualPayments(updatedPayments);
    
    // Update bill status if all payments are done
    const bill = utilityBills.find(b => b.id === payment.billId);
    if (bill) {
      const billPayments = updatedPayments.filter(p => p.billId === bill.id);
      const allPaid = billPayments.every(p => p.status === 'Paid');
      
      if (allPaid) {
        const updatedBills = utilityBills.map(b => 
          b.id === bill.id 
            ? { ...b, status: 'Paid' as 'Paid' | 'Unpaid' | 'Partial', paidDate: new Date().toISOString().split('T')[0] }
            : b
        );
        syncUtilityBills(updatedBills);
        
        // Send payment confirmation notifications
        sendPaymentNotifications(bill, 'Paid');
      }
    }
    
    alert(`✅ Thanh toán thành công!\n\nSinh viên: ${payment.studentName}\nSố tiền: ${payment.amount.toLocaleString()}đ\nPhương thức: ${method.name}\n\nĐã gửi xác nhận thanh toán!`);
    setShowPaymentModal(false);
  };

  // Payment processing functions (similar to Canteen)
  const handlePaymentMethodSelect = (method: 'cash' | 'transfer' | 'qr') => {
    setSelectedPaymentMethod(method);
  };

  const getTransferInfo = () => {
    const selectedPayment = individualPayments.find(p => 
      p.billId === selectedBillForPayment?.id && p.status === 'Pending'
    );
    
    return {
      bank: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'Trường Đại học ABC - KTX',
      amount: selectedPayment?.amount || 0,
      description: `KTX ${selectedPayment?.studentCode} ${selectedBillForPayment?.month}/${selectedBillForPayment?.year}`
    };
  };

  const processPayment = async (paymentId: string) => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    
    // Create financial transaction record
    createKtxTransaction(paymentId);
    
    // Update payment status
    const payment = individualPayments.find(p => p.id === paymentId);
    if (payment) {
      const updatedPayments = individualPayments.map(p => 
        p.id === paymentId 
          ? { 
              ...p, 
              status: 'Paid' as 'Paid' | 'Pending' | 'Overdue', 
              paidDate: new Date().toISOString().split('T')[0], 
              paymentMethod: selectedPaymentMethod === 'transfer' ? 'Bank Transfer' : 
                           selectedPaymentMethod === 'qr' ? 'E-Wallet' : 'Cash'
            }
          : p
      );
      setIndividualPayments(updatedPayments);
      
      // Update bill status if all payments are done
      const bill = utilityBills.find(b => b.id === payment.billId);
      if (bill) {
        const billPayments = updatedPayments.filter(p => p.billId === bill.id);
        const allPaid = billPayments.every(p => p.status === 'Paid');
        
        if (allPaid) {
          const updatedBills = utilityBills.map(b => 
            b.id === bill.id 
              ? { ...b, status: 'Paid' as 'Paid' | 'Unpaid' | 'Partial', paidDate: new Date().toISOString().split('T')[0] }
              : b
          );
          syncUtilityBills(updatedBills);
          
          // Send payment confirmation notifications
          sendPaymentNotifications(bill, 'Paid');
        }
      }
    }
    
    // Reset after successful payment
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
      setSelectedPaymentMethod('transfer');
    }, 3000);
  };

  const createKtxTransaction = (paymentId: string) => {
    const payment = individualPayments.find(p => p.id === paymentId);
    if (!payment) return;
    
    // Create transaction record for KTX payments
    const transaction = {
      id: Date.now(),
      type: 'income' as 'income' | 'expense',
      category: 'ktx' as any,
      amount: payment.amount,
      description: `Thu tiền KTX phòng ${selectedBillForPayment?.roomNumber} - ${payment.studentName} - ${selectedBillForPayment?.month}/${selectedBillForPayment?.year}`,
      date: new Date().toISOString().split('T')[0],
      reference: `KTX-${payment.studentCode}-${Date.now()}`,
      status: 'completed' as 'completed' | 'pending' | 'cancelled',
      paymentMethod: selectedPaymentMethod as 'cash' | 'transfer' | 'qr',
      createdBy: 'KTX Admin',
      createdAt: new Date().toISOString()
    };

    // Store transaction in localStorage for FinanceView to access
    const existingTransactions = JSON.parse(localStorage.getItem('ktxFinancialTransactions') || '[]');
    localStorage.setItem('ktxFinancialTransactions', JSON.stringify([transaction, ...existingTransactions]));
  };

  // Get payment details for a bill
  const getBillPaymentDetails = (billId: number) => {
    const bill = utilityBills.find(b => b.id === billId);
    const payments = individualPayments.filter(p => p.billId === billId);
    
    return { bill, payments };
  };

  // Check for overdue bills and send reminders
  const checkOverdueBills = () => {
    const today = new Date();
    const overdueBills = utilityBills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return bill.status === 'Unpaid' && dueDate < today;
    });
    
    overdueBills.forEach(bill => {
      sendPaymentNotifications(bill, 'Overdue');
    });
    
    if (overdueBills.length > 0) {
      console.log(`Sent overdue notifications for ${overdueBills.length} bills`);
    }
  };

  // Check for bills due soon (3 days) and send reminders
  const checkUpcomingBills = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const upcomingBills = utilityBills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return bill.status === 'Unpaid' && dueDate <= threeDaysFromNow && dueDate >= today;
    });
    
    upcomingBills.forEach(bill => {
      const payments = individualPayments.filter(p => p.billId === bill.id && p.status === 'Pending');
      if (payments.length > 0) {
        sendPaymentNotifications(bill, 'Reminder');
      }
    });
    
    if (upcomingBills.length > 0) {
      console.log(`Sent reminder notifications for ${upcomingBills.length} upcoming bills`);
    }
  };

  // Auto-check for overdue and upcoming bills daily
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkOverdueBills();
      checkUpcomingBills();
    }, 24 * 60 * 60 * 1000); // Check every 24 hours
    
    return () => clearInterval(checkInterval);
  }, [utilityBills, individualPayments]);

  const handleCloseUtilityModal = () => {
    // Reset form when closing modal
    setUtilityForm({
      roomId: 0,
      roomNumber: '',
      month: '',
      year: new Date().getFullYear(),
      electricity: 0,
      water: 0,
      electricityCost: 3000,
      waterCost: 25000,
      roomCost: 0,
      totalAmount: 0,
      status: 'Unpaid'
    });
    setShowUtilityModal(false);
  };

  // Handle image capture and meter reading - IMPROVED
  const handleImageCapture = async (meterType: 'electricity' | 'water') => {
    console.log('handleImageCapture called with meterType:', meterType);
    
    // Prevent concurrent captures
    if (captureState.isCapturing) {
      console.log('Capture already in progress, ignoring request');
      alert('⚠️ Đang chụp công-tơ, vui lòng đợi hoàn thành trước khi chụp tiếp!');
      return;
    }

    // Prevent rapid successive captures (minimum 2 seconds between captures)
    const currentTime = Date.now();
    if (currentTime - captureState.lastCaptureTime < 2000) {
      console.log('Capture too soon after previous capture');
      alert('⚠️ Vui lòng đợi 2 giây giữa các lần chụp để đảm bảo xử lý đúng!');
      return;
    }

    // Set capture state
    setCaptureState({
      isCapturing: true,
      currentMeterType: meterType,
      lastCaptureTime: currentTime
    });

    try {
      console.log('Current utilityForm:', utilityForm);
      
      const selectedRoom = rooms.find(r => r.id === utilityForm.roomId);
      console.log('Selected room:', selectedRoom);
      
      if (!selectedRoom) {
        console.log('No selected room found');
        alert('❌ Vui lòng chọn phòng trước khi chụp công-tơ!');
        return;
      }

      const roomNumber = selectedRoom.roomNumber;
      const roomHistory = meterHistory && meterHistory[roomNumber] ? meterHistory[roomNumber] : [];
      const currentDate = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      
      console.log('Room number:', roomNumber);
      console.log('Room history:', roomHistory);
      console.log('Current date:', currentDate);
      console.log('Timestamp:', timestamp);
      
      // Get last reading from history
      const lastReading = roomHistory.length > 0 ? roomHistory[roomHistory.length - 1] : null;
      const previousElectricity = lastReading ? lastReading.electricityReading : 0;
      const previousWater = lastReading ? lastReading.waterReading : 0;
      
      console.log('Last reading:', lastReading);
      console.log('Previous readings:', { previousElectricity, previousWater });
      
      // Check if we already captured this meter type today
      const todayReadings = roomHistory.filter(r => r.date === currentDate);
      const alreadyCapturedElectricity = todayReadings.some(r => r.electricityImage);
      const alreadyCapturedWater = todayReadings.some(r => r.waterImage);
      
      console.log('Today readings:', todayReadings);
      console.log('Already captured electricity:', alreadyCapturedElectricity);
      console.log('Already captured water:', alreadyCapturedWater);
      
      // Prevent duplicate capture for same meter type on same day
      if (meterType === 'electricity' && alreadyCapturedElectricity) {
        alert('⚠️ Đã chụp công-tơ điện cho phòng này hôm nay rồi!\n\nChỉ số hiện tại: ' + meterReadings.currentElectricity + ' kWh\n\nNếu muốn chụp lại, vui lòng xóa bản ghi cũ hoặc chụp vào ngày khác.');
        return;
      }
      
      if (meterType === 'water' && alreadyCapturedWater) {
        alert('⚠️ Đã chụp đồng hồ nước cho phòng này hôm nay rồi!\n\nChỉ số hiện tại: ' + meterReadings.currentWater + ' m³\n\nNếu muốn chụp lại, vui lòng xóa bản ghi cũ hoặc chụp vào ngày khác.');
        return;
      }
      
      // Add small delay to simulate camera processing and ensure clean state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Preserve the other meter's current reading when switching
      let currentElectricity = meterReadings.currentElectricity;
      let currentWater = meterReadings.currentWater;
      let electricityImage = meterReadings.electricityImage;
      let waterImage = meterReadings.waterImage;
      
      console.log('Preserving current readings:', { currentElectricity, currentWater });
      
      // Simulate current reading (in real app, this would come from image OCR)
      if (meterType === 'electricity') {
        console.log('Processing electricity meter capture');
        currentElectricity = previousElectricity + Math.floor(Math.random() * 200) + 50; // Add 50-250 kWh
        // Keep water reading unchanged
        electricityImage = `electricity_meter_${roomNumber}_${timestamp}.jpg`;
        
        console.log('Generated current electricity reading:', currentElectricity);
        
        // Update current reading state
        setMeterReadings(prev => ({
          ...prev,
          currentElectricity,
          electricityImage
        }));
        
        console.log('Updated current electricity reading');
        
        // Update history - FIXED: Preserve existing readings
        const existingLastReading = roomHistory.length > 0 ? roomHistory[roomHistory.length - 1] : null;
        const newReading = {
          date: currentDate,
          electricityReading: currentElectricity,
          waterReading: existingLastReading?.waterReading || 0, // Keep existing water reading from last record
          electricityImage,
          notes: `Chụp ngày ${currentDate}`
        };
        
        console.log('New electricity reading to add:', newReading);
        
        const updatedHistory = {
          ...meterHistory,
          [roomNumber]: [...(meterHistory && meterHistory[roomNumber] ? meterHistory[roomNumber] : []), newReading]
        };
        
        syncMeterHistory(updatedHistory);
        
        console.log('Updated meter history for room:', roomNumber);
        
        // Update utility form with calculated usage
        const usage = currentElectricity - previousElectricity;
        console.log('Calculated electricity usage:', usage);
        
        setUtilityForm(prev => ({
          ...prev,
          electricity: Math.max(0, usage)
        }));
        
        console.log('Updated utility form with electricity usage');
        
        alert(`📸 Đã chụp công-tơ điện phòng ${roomNumber}!\n\nChỉ số trước: ${previousElectricity} kWh\nChỉ số hiện tại: ${currentElectricity} kWh\nTiêu thụ kỳ này: ${usage} kWh\n\nLịch sử đã được lưu và số liệu tự động cập nhật!`);
        
      } else {
        console.log('Processing water meter capture');
        currentWater = previousWater + Math.floor(Math.random() * 20) + 5; // Add 5-25 m³
        // Keep electricity reading unchanged
        waterImage = `water_meter_${roomNumber}_${timestamp}.jpg`;
        
        console.log('Generated current water reading:', currentWater);
        
        // Update current reading state
        setMeterReadings(prev => ({
          ...prev,
          currentWater,
          waterImage
        }));
        
        console.log('Updated current water reading');
        
        // Update history - FIXED: Preserve existing readings
        const existingLastReading = roomHistory.length > 0 ? roomHistory[roomHistory.length - 1] : null;
        const newReading = {
          date: currentDate,
          electricityReading: existingLastReading?.electricityReading || 0, // Keep existing electricity reading from last record
          waterReading: currentWater,
          waterImage,
          notes: `Chụp ngày ${currentDate}`
        };
        
        console.log('New water reading to add:', newReading);
        
        const updatedHistory = {
          ...meterHistory,
          [roomNumber]: [...(meterHistory && meterHistory[roomNumber] ? meterHistory[roomNumber] : []), newReading]
        };
        
        syncMeterHistory(updatedHistory);
        
        console.log('Updated meter history for room:', roomNumber);
        
        // Update utility form with calculated usage
        const usage = currentWater - previousWater;
        console.log('Calculated water usage:', usage);
        
        setUtilityForm(prev => ({
          ...prev,
          water: Math.max(0, usage)
        }));
        
        console.log('Updated utility form with water usage');
        
        alert(`📸 Đã chụp đồng hồ nước phòng ${roomNumber}!\n\nChỉ số trước: ${previousWater} m³\nChỉ số hiện tại: ${currentWater} m³\nTiêu thụ kỳ này: ${usage} m³\n\nLịch sử đã được lưu và số liệu tự động cập nhật!`);
      }
      
      console.log('handleImageCapture completed successfully');
      
    } catch (error) {
      console.error('Error during image capture:', error);
      alert('❌ Đã xảy ra lỗi khi chụp công-tơ. Vui lòng thử lại!');
    } finally {
      // Reset capture state
      setCaptureState(prev => ({
        ...prev,
        isCapturing: false,
        currentMeterType: null
      }));
      console.log('Capture state reset');
    }
  };

  // Get last reading for selected room - FIXED
  const getLastReading = () => {
    const selectedRoom = rooms.find(r => r.id === utilityForm.roomId);
    if (!selectedRoom) {
      console.log('No selected room found');
      return null;
    }
    
    const roomNumber = selectedRoom.roomNumber;
    const roomHistory = meterHistory && meterHistory[roomNumber] ? meterHistory[roomNumber] : [];
    console.log('Room history for', roomNumber, ':', roomHistory);
    
    const lastReading = roomHistory.length > 0 ? roomHistory[roomHistory.length - 1] : null;
    console.log('Last reading:', lastReading);
    
    return lastReading;
  };

  // Calculate usage based on billing period
  const calculateUsageForPeriod = () => {
    const selectedRoom = rooms.find(r => r.id === utilityForm.roomId);
    if (!selectedRoom || !utilityForm.month) return;
    
    const roomHistory = meterHistory && meterHistory[selectedRoom.roomNumber] ? meterHistory[selectedRoom.roomNumber] : [];
    const billingPeriod = utilityForm.month; // e.g., "2024-02"
    
    // Find readings within the billing period
    const periodReadings = roomHistory.filter(reading => 
      reading.date.startsWith(billingPeriod)
    );
    
    if (periodReadings.length < 2) return;
    
    const firstReading = periodReadings[0];
    const lastReading = periodReadings[periodReadings.length - 1];
    
    const electricityUsage = lastReading.electricityReading - firstReading.electricityReading;
    const waterUsage = lastReading.waterReading - firstReading.waterReading;
    
    setUtilityForm(prev => ({
      ...prev,
      electricity: Math.max(0, electricityUsage),
      water: Math.max(0, waterUsage)
    }));
  };

  // Calculate usage from meter readings
  const calculateUsage = () => {
    const electricityUsage = meterReadings.currentElectricity - meterReadings.previousElectricity;
    const waterUsage = meterReadings.currentWater - meterReadings.previousWater;
    
    setUtilityForm(prev => ({
      ...prev,
      electricity: Math.max(0, electricityUsage),
      water: Math.max(0, waterUsage)
    }));
  };

  // Auto-calculate when meter readings change
  useEffect(() => {
    if (meterReadings.currentElectricity > 0 && meterReadings.previousElectricity > 0) {
      calculateUsage();
    }
  }, [meterReadings.currentElectricity, meterReadings.previousElectricity, meterReadings.currentWater, meterReadings.previousWater]);

  // Auto-calculate when room or month changes
  useEffect(() => {
    if (utilityForm.roomId && utilityForm.month) {
      calculateUsageForPeriod();
    }
  }, [utilityForm.roomId, utilityForm.month]);

  // Update display when room changes - FIXED
  useEffect(() => {
    if (utilityForm.roomId) {
      const lastReading = getLastReading();
      if (lastReading) {
        setMeterReadings(prev => ({
          ...prev,
          previousElectricity: lastReading.electricityReading,
          previousWater: lastReading.waterReading,
          currentElectricity: lastReading.electricityReading, // Sync current with last reading
          currentWater: lastReading.waterReading // Sync current with last reading
        }));
        console.log('Updated meter readings from history:', {
          previousElectricity: lastReading.electricityReading,
          previousWater: lastReading.waterReading,
          currentElectricity: lastReading.electricityReading,
          currentWater: lastReading.waterReading
        });
      } else {
        // Reset to 0 if no history
        setMeterReadings(prev => ({
          ...prev,
          previousElectricity: 0,
          previousWater: 0,
          currentElectricity: 0,
          currentWater: 0
        }));
        console.log('Reset meter readings to 0 (no history)');
      }
    }
  }, [utilityForm.roomId]);

  const handleDeleteRoom = (roomId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      syncRooms(rooms.filter(r => r.id !== roomId));
      alert('Đã xóa phòng thành công!');
    }
  };

  // Handle detailed view of meter reading
  const handleViewReadingDetails = (roomNumber: string, reading: any, index: number) => {
    console.log('=== DETAIL VIEW DEBUG ===');
    console.log('handleViewReadingDetails called with:', { roomNumber, reading, index });
    console.log('Current selectedReading state:', selectedReading);
    
    // Validate inputs
    if (!roomNumber) {
      console.error('❌ No roomNumber provided');
      return;
    }
    
    if (!reading) {
      console.error('❌ No reading provided');
      return;
    }
    
    if (typeof index !== 'number') {
      console.error('❌ Invalid index:', index);
      return;
    }
    
    console.log('✅ All inputs validated');
    
    // Set the selected reading
    const newSelectedReading = { roomNumber, reading, index };
    console.log('Setting selectedReading to:', newSelectedReading);
    
    setSelectedReading(newSelectedReading);
    
    // Force a re-render by logging after state update
    setTimeout(() => {
      console.log('State after update:', selectedReading);
    }, 100);
    
    console.log('=== END DETAIL VIEW DEBUG ===');
  };

  const handleCloseDetailModal = () => {
    setSelectedReading(null);
  };

  // Calculate usage between two readings
  const calculateUsageBetweenReadings = (reading1: any, reading2: any) => {
    const electricityUsage = reading2.electricityReading - reading1.electricityReading;
    const waterUsage = reading2.waterReading - reading1.waterReading;
    const daysBetween = Math.ceil((new Date(reading2.date).getTime() - new Date(reading1.date).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      electricityUsage,
      waterUsage,
      daysBetween,
      avgElectricityPerDay: daysBetween > 0 ? electricityUsage / daysBetween : 0,
      avgWaterPerDay: daysBetween > 0 ? waterUsage / daysBetween : 0
    };
  };

  // Get usage statistics for a room
  const getRoomUsageStats = (roomNumber: string) => {
    const roomHistory = meterHistory && meterHistory[roomNumber] ? meterHistory[roomNumber] : [];
    if (roomHistory.length < 2) return null;
    
    const firstReading = roomHistory[0];
    const lastReading = roomHistory[roomHistory.length - 1];
    
    const totalElectricity = lastReading.electricityReading - firstReading.electricityReading;
    const totalWater = lastReading.waterReading - firstReading.waterReading;
    const daysBetween = Math.ceil((new Date(lastReading.date).getTime() - new Date(firstReading.date).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalElectricity,
      totalWater,
      daysBetween,
      avgElectricityPerDay: daysBetween > 0 ? totalElectricity / daysBetween : 0,
      avgWaterPerDay: daysBetween > 0 ? totalWater / daysBetween : 0,
      readingsCount: roomHistory.length
    };
  };

  const handleAutoAssign = () => {
    console.log('Auto-assigning rooms...');
    // Auto-assignment logic
    alert('Đã sắp xếp tự động sinh viên vào phòng!');
  };

  const handleCreateAllRooms = () => {
    try {
      if (confirm('Bạn có chắc chắn muốn tạo tất cả phòng còn thiếu? Hành động này sẽ tạo 500 phòng (200 Khu A + 300 Khu B) với trạng thái "Trống".')) {
        const newRooms: Room[] = [];
        const maxId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) : 0;
        let newId = maxId + 1;
        
        console.log('Starting room creation. Current rooms:', rooms.length);
        
        // Create all Area A rooms (10 floors × 20 rooms = 200 rooms)
        for (let floor = 1; floor <= 10; floor++) {
          for (let room = 1; room <= 20; room++) {
            const roomNumber = `A${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`;
            
            // Check if room already exists
            if (!rooms.find(r => r.roomNumber === roomNumber)) {
              const roomType = floor <= 3 ? 'Premium' : floor <= 7 ? 'Standard' : 'VIP';
              const price = roomType === 'VIP' ? 2000000 : roomType === 'Premium' ? 1500000 : 1200000;
              
              newRooms.push({
                id: newId++,
                roomNumber,
                area: 'A',
                floor,
                capacity: 4,
                currentOccupancy: 0,
                type: roomType as 'Standard' | 'Premium' | 'VIP',
                status: 'Available',
                price,
                facilities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Bàn học'],
                students: []
              });
            }
          }
        }
        
        // Create all Area B rooms (10 floors × 25 rooms = 300 rooms)
        for (let floor = 1; floor <= 10; floor++) {
          for (let room = 1; room <= 25; room++) {
            const roomNumber = `B${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`;
            
            // Check if room already exists
            if (!rooms.find(r => r.roomNumber === roomNumber)) {
              const roomType = floor <= 3 ? 'VIP' : floor <= 7 ? 'Premium' : 'Standard';
              const price = roomType === 'VIP' ? 1800000 : roomType === 'Premium' ? 1300000 : 1000000;
              
              newRooms.push({
                id: newId++,
                roomNumber,
                area: 'B',
                floor,
                capacity: 6,
                currentOccupancy: 0,
                type: roomType as 'Standard' | 'Premium' | 'VIP',
                status: 'Available',
                price,
                facilities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Bàn học', 'Tủ quần áo'],
                students: []
              });
            }
          }
        }
        
        console.log('Created rooms:', newRooms.length);
        
        // Add all new rooms to existing rooms
        syncRooms([...rooms, ...newRooms]);
        
        // Track newly created room IDs
        const newRoomIds = newRooms.map(room => room.id);
        setNewlyCreatedRooms(newRoomIds);
        
        // Jump to first page to see new rooms
        setCurrentPage(1);
        
        alert(`Đã tạo thành công ${newRooms.length} phòng mới! Các phòng mới được đánh dấu màu xanh.`);
      }
    } catch (error) {
      console.error('Error creating rooms:', error);
      alert('Có lỗi xảy ra khi tạo phòng. Vui lòng thử lại!');
    }
  };

  const handleTestCreateRoom = () => {
    try {
      console.log('Creating test room...');
      const testRoom: Room = {
        id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
        roomNumber: 'TEST001',
        area: 'A',
        floor: 1,
        capacity: 4,
        currentOccupancy: 0,
        type: 'Standard',
        status: 'Available',
        price: 1200000,
        facilities: ['Điều hòa', 'Tủ lạnh'],
        students: []
      };
      
      console.log('Test room created:', testRoom);
      syncRooms([...rooms, testRoom]);
      setNewlyCreatedRooms([testRoom.id]);
      console.log('Set newly created rooms:', [testRoom.id]);
      
      // Jump to first page to see new room
      setCurrentPage(1);
      
      alert('Đã tạo phòng test thành công! Phòng mới được đánh dấu màu xanh.');
    } catch (error) {
      console.error('Test error:', error);
      alert('Lỗi test: ' + error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === 'all' || room.area === filterArea;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesArea && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const getRoomStats = () => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const maintenance = rooms.filter(r => r.status === 'Maintenance').length;
    const reserved = rooms.filter(r => r.status === 'Reserved').length;
    
    // Calculate missing rooms
    const existingRoomNumbers = rooms.map(r => r.roomNumber);
    const totalExpectedRooms = 500; // 200 Area A + 300 Area B
    const missingRooms = totalExpectedRooms - total;
    
    return { total, occupied, available, maintenance, reserved, missingRooms };
  };

  // Equipment handlers
  const handleAddEquipment = () => {
    const newEquipment: Equipment = {
      id: Date.now(),
      name: equipmentForm.name,
      category: equipmentForm.category,
      quantity: equipmentForm.quantity,
      unit: 'cái',
      location: equipmentForm.location,
      status: 'Available',
      purchaseDate: equipmentForm.purchaseDate || new Date().toISOString().split('T')[0],
      warranty: equipmentForm.warranty,
      supplier: 'Nhà cung cấp KTX'
    };
    
    setEquipment([...equipment, newEquipment]);
    setShowEquipmentModal(false);
    setEquipmentForm({
      name: '',
      category: 'ELECTRONICS',
      quantity: 0,
      location: '',
      condition: 'GOOD',
      purchaseDate: '',
      warranty: '',
      notes: ''
    });
    alert('Đã thêm thiết bị mới thành công!');
  };

  const stats = getRoomStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Ký túc xá</h2>
          <p className="text-gray-500">Hệ thống quản lý phòng ốc và sinh viên</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={20}/> Import Danh sách
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleAutoAssign}
          >
            <Settings size={20} /> Tự động sắp xếp
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng phòng</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Building2 className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã ở</p>
              <p className="text-2xl font-bold text-green-600">{stats.occupied}</p>
            </div>
            <Users className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trống</p>
              <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
            </div>
            <Bed className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bảo trì</p>
              <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
            </div>
            <Settings className="text-orange-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đặt trước</p>
              <p className="text-2xl font-bold text-purple-600">{stats.reserved}</p>
            </div>
            <Calendar className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cần tạo</p>
              <p className="text-2xl font-bold text-red-600">{stats.missingRooms}</p>
            </div>
            <Plus className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Tổng quan', icon: Building2 },
            { id: 'rooms', label: 'Quản lý phòng', icon: Bed },
            { id: 'registrations', label: 'Đăng ký phòng', icon: FileText },
            { id: 'utilities', label: 'Điện nước', icon: Zap },
            { id: 'payments', label: 'Thanh toán', icon: DollarSign },
            { id: 'equipment', label: 'Kho thiết bị', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Tổng quan Ký túc xá</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Phân bố theo khu vực</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Khu A</span>
                    <span className="text-blue-600 font-bold">200 phòng</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Khu B</span>
                    <span className="text-green-600 font-bold">300 phòng</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Loại phòng</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Standard</span>
                    <span className="font-medium">{rooms.filter(r => r.type === 'Standard').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span>Premium</span>
                    <span className="font-medium">{rooms.filter(r => r.type === 'Premium').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>VIP</span>
                    <span className="font-medium">{rooms.filter(r => r.type === 'VIP').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý phòng</h3>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setNewlyCreatedRooms([])}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <CheckCircle size={20}/> Xóa đánh dấu
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleTestCreateRoom}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Plus size={20}/> Test tạo 1 phòng
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleCreateAllRooms}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus size={20}/> Tạo tất cả phòng
                </Button>
                <Button onClick={handleAddRoomClick}>
                  <Plus size={20}/> Thêm phòng
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value as 'all' | 'A' | 'B')}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Tất cả khu</option>
                <option value="A">Khu A</option>
                <option value="B">Khu B</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Available">Trống</option>
                <option value="Occupied">Đã ở</option>
                <option value="Maintenance">Bảo trì</option>
                <option value="Reserved">Đặt trước</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Khu</th>
                    <th className="text-left py-3 px-4">Tầng</th>
                    <th className="text-left py-3 px-4">Loại</th>
                    <th className="text-left py-3 px-4">Sức chứa</th>
                    <th className="text-left py-3 px-4">Đã ở</th>
                    <th className="text-left py-3 px-4">Giá</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(room => {
                    const isNewlyCreated = newlyCreatedRooms.includes(room.id);
                    console.log(`Room ${room.roomNumber} - ID: ${room.id} - Is New: ${isNewlyCreated}`);
                    return (
                    <tr 
                      key={room.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        isNewlyCreated
                          ? 'bg-green-50 border-green-300 animate-pulse' 
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">
                        {room.roomNumber}
                        {isNewlyCreated && (
                          <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-bounce">
                            Mới
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{room.area}</td>
                      <td className="py-3 px-4">{room.floor}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.type === 'VIP' ? 'bg-purple-100 text-purple-800' :
                          room.type === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{room.capacity}</td>
                      <td className="py-3 px-4">{room.currentOccupancy}</td>
                      <td className="py-3 px-4">{room.price.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.status === 'Available' ? 'bg-green-100 text-green-800' :
                          room.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                          room.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {room.status === 'Available' ? 'Trống' :
                           room.status === 'Occupied' ? 'Đã ở' :
                           room.status === 'Maintenance' ? 'Bảo trì' : 'Đặt trước'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRooms.length)} của {filteredRooms.length} phòng
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Đăng ký phòng</h3>
              <Button onClick={() => setShowRegistrationModal(true)}>
                <Plus size={20}/> Đăng ký mới
              </Button>
            </div>
            
            {/* Registration Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng đăng ký</p>
                    <p className="text-2xl font-bold text-gray-800">{registrations.length}</p>
                  </div>
                  <FileText size={24} className="text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-yellow-600">{registrations.filter(r => r.status === 'Pending').length}</p>
                  </div>
                  <Clock size={24} className="text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600">{registrations.filter(r => r.status === 'Approved').length}</p>
                  </div>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Từ chối</p>
                    <p className="text-2xl font-bold text-red-600">{registrations.filter(r => r.status === 'Rejected').length}</p>
                  </div>
                  <XCircle size={24} className="text-red-500" />
                </div>
              </div>
            </div>
            
            {/* Registration Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4">Mã SV</th>
                    <th className="text-left py-3 px-4">Họ tên</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Ngày đăng ký</th>
                    <th className="text-left py-3 px-4">Thời gian</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(registration => (
                    <tr key={registration.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{registration.studentId}</td>
                      <td className="py-3 px-4">{registration.studentName}</td>
                      <td className="py-3 px-4">{registration.roomNumber}</td>
                      <td className="py-3 px-4">{registration.registrationDate}</td>
                      <td className="py-3 px-4">{registration.duration} tháng</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          registration.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          registration.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {registration.status === 'Pending' ? 'Chờ duyệt' :
                           registration.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          {registration.status === 'Pending' && (
                            <>
                              <button className="text-green-600 hover:text-green-800">
                                <CheckCircle size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Điện nước</h3>
              <Button onClick={() => setShowUtilityModal(true)}>
                <Plus size={20} /> Thêm hóa đơn
              </Button>
            </div>
            
            {/* Utility Bill Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                    <p className="text-2xl font-bold text-gray-800">{utilityBills.length}</p>
                  </div>
                  <Zap size={24} className="text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chưa thanh toán</p>
                    <p className="text-2xl font-bold text-yellow-600">{utilityBills.filter(b => b.status === 'Unpaid').length}</p>
                  </div>
                  <Clock size={24} className="text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã thanh toán</p>
                    <p className="text-2xl font-bold text-green-600">{utilityBills.filter(b => b.status === 'Paid').length}</p>
                  </div>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quá hạn</p>
                    <p className="text-2xl font-bold text-red-600">{utilityBills.filter(b => b.status === 'Overdue').length}</p>
                  </div>
                  <XCircle size={24} className="text-red-500" />
                </div>
              </div>
            </div>
            
            {/* Utility Bill Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tháng</th>
                    <th className="text-left py-3 px-4">Điện (kWh)</th>
                    <th className="text-left py-3 px-4">Nước (m³)</th>
                    <th className="text-left py-3 px-4">Tiền điện</th>
                    <th className="text-left py-3 px-4">Tiền nước</th>
                    <th className="text-left py-3 px-4">Tổng cộng</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {utilityBills.map(bill => {
                    const room = rooms.find(r => r.id === bill.roomId);
                    return (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{room?.roomNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{bill.month}</td>
                      <td className="py-3 px-4">{bill.electricity}</td>
                      <td className="py-3 px-4">{bill.water}</td>
                      <td className="py-3 px-4">{(bill.electricity * bill.electricityCost).toLocaleString()}đ</td>
                      <td className="py-3 px-4">{(bill.water * bill.waterCost).toLocaleString()}đ</td>
                      <td className="py-3 px-4 font-semibold">{bill.totalAmount.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          bill.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bill.status === 'Unpaid' ? 'Chưa thanh toán' :
                           bill.status === 'Paid' ? 'Đã thanh toán' : 'Quá hạn'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          {bill.status === 'Unpaid' && (
                            <button className="text-green-600 hover:text-green-800">
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Thanh toán</h3>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowNotificationModal(true)}
                >
                  <AlertCircle size={20} /> Xem thông báo
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setShowUtilityModal(true)}
                >
                  <Plus size={20} /> Tạo hóa đơn
                </Button>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                    <p className="text-2xl font-bold text-blue-600">{utilityBills.length}</p>
                  </div>
                  <FileText className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chờ thanh toán</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {individualPayments.filter(p => p.status === 'Pending').length}
                    </p>
                  </div>
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã thanh toán</p>
                    <p className="text-2xl font-bold text-green-600">
                      {individualPayments.filter(p => p.status === 'Paid').length}
                    </p>
                  </div>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quá hạn</p>
                    <p className="text-2xl font-bold text-red-600">
                      {individualPayments.filter(p => p.status === 'Overdue').length}
                    </p>
                  </div>
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            {/* Payment Guide Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Hướng dẫn thanh toán tiền phòng & điện nước
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quy trình thanh toán */}
                <div className="space-y-3">
                  <h5 className="font-medium text-blue-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                    Quy trình thanh toán
                  </h5>
                  <div className="bg-white p-4 rounded-lg border border-blue-100 text-sm">
                    <ol className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Nhận thông báo:</strong> Hệ thống tự động gửi thông báo khi có hóa đơn mới</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Kiểm tra chi tiết:</strong> Xem số tiền cần thanh toán và hạn thanh toán</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Chọn phương thức:</strong> Chọn 1 trong 3 phương thức thanh toán</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Thực hiện giao dịch:</strong> Giao dịch theo thông tin đã cung cấp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Xác nhận thanh toán:</strong> Admin sẽ xác nhận và cập nhật trạng thái</span>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="space-y-3">
                  <h5 className="font-medium text-blue-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    Phương thức thanh toán
                  </h5>
                  <div className="space-y-3">
                    {paymentMethods.filter(m => m.isActive).map((method, index) => (
                      <div key={method.id} className="bg-white p-3 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}>
                            {method.type === 'BankTransfer' ? '🏦' : method.type === 'EWallet' ? '📱' : '💵'}
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-800">{method.name}</h6>
                            <p className="text-sm text-gray-600 mt-1">{method.accountInfo}</p>
                            {method.type === 'BankTransfer' && (
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                <strong>Lưu ý:</strong> Ghi rõ "Mã SV + Số tiền" trong nội dung chuyển khoản
                              </div>
                            )}
                            {method.type === 'EWallet' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                <strong>Lưu ý:</strong> Chụp ảnh màn hình giao dịch thành công để xác nhận
                              </div>
                            )}
                            {method.type === 'Cash' && (
                              <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                                <strong>Lưu ý:</strong> Đến văn phòng KTX trong giờ hành chính (8:00-17:00)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Lưu ý quan trọng
                </h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Hạn thanh toán:</strong> Thanh toán trước ngày 5 hàng tháng tiếp theo</li>
                  <li>• <strong>Phí trễ:</strong> Phạt 0.5%/ngày trên số tiền chậm thanh toán</li>
                  <li>• <strong>Xác nhận:</strong> Thanh toán sẽ được xác nhận trong vòng 24h</li>
                  <li>• <strong>Lưu trữ:</strong> Giữ lại biên lai/giao dịch để đối chiếu khi cần</li>
                  <li>• <strong>Hỗ trợ:</strong> Liên hệ hotline 1900-XXXX nếu gặp vấn đề</li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowNotificationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                >
                  <Eye size={16} /> Xem thông báo của bạn
                </button>
                <button 
                  onClick={() => {
                    const pendingPayments = individualPayments.filter(p => p.status === 'Pending');
                    if (pendingPayments.length > 0) {
                      const bill = utilityBills.find(b => b.id === pendingPayments[0].billId);
                      if (bill) {
                        setSelectedBillForPayment(bill);
                        setShowPaymentModal(true);
                      }
                    } else {
                      alert('Bạn không có hóa đơn nào cần thanh toán!');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  <DollarSign size={16} /> Thanh toán ngay
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
                >
                  <Download size={16} /> In hướng dẫn
                </button>
              </div>
            </div>

            {/* Bills Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phòng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kỳ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tổng tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Hạn thanh toán</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {utilityBills.map(bill => {
                    const payments = individualPayments.filter(p => p.billId === bill.id);
                    const paidCount = payments.filter(p => p.status === 'Paid').length;
                    const totalCount = payments.length;
                    
                    return (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{bill.roomNumber}</td>
                        <td className="py-3 px-4">{bill.month}/{bill.year}</td>
                        <td className="py-3 px-4 font-medium">{bill.totalAmount.toLocaleString()}đ</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            bill.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {bill.status === 'Paid' ? 'Đã thanh toán' :
                             bill.status === 'Partial' ? 'Thanh toán một phần' : 'Chờ thanh toán'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {paidCount}/{totalCount} SV đã thanh toán
                          </div>
                        </td>
                        <td className="py-3 px-4">{bill.dueDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedBillForPayment(bill);
                                setShowPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Quản lý thanh toán"
                            >
                              <DollarSign size={16} />
                            </button>
                            <button
                              onClick={() => {
                                const details = getBillPaymentDetails(bill.id);
                                console.log('Bill details:', details);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recent Notifications */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Thông báo gần đây</h4>
              <div className="space-y-2">
                {paymentNotifications.slice(-5).reverse().map(notification => (
                  <div key={notification.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        notification.type === 'Overdue' ? 'bg-red-500' :
                        notification.type === 'Reminder' ? 'bg-yellow-500' :
                        notification.type === 'Paid' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></span>
                      <span>{notification.message.split('\n')[0]}</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(notification.sentDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Transaction Guide */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Hướng dẫn chi tiết thực hiện giao dịch
              </h4>
              
              <div className="space-y-6">
                {/* Bank Transfer Guide */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                    🏦 Chuyển khoản ngân hàng
                  </h5>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-green-800 mb-2">Thông tin tài khoản:</h6>
                        <div className="space-y-1 text-sm">
                          <p><strong>Ngân hàng:</strong> Vietcombank</p>
                          <p><strong>Số tài khoản:</strong> 1234567890</p>
                          <p><strong>Chủ tài khoản:</strong> Nguyễn Văn A</p>
                          <p><strong>Chi nhánh:</strong> Hà Nội</p>
                        </div>
                      </div>
                      <div>
                        <h6 className="font-medium text-green-800 mb-2">Các bước thực hiện:</h6>
                        <ol className="text-sm space-y-1">
                          <li>1. Mở app ngân hàng hoặc đến quầy giao dịch</li>
                          <li>2. Chọn "Chuyển khoản" → "Chuyển khoản nội bộ"</li>
                          <li>3. Nhập số tài khoản: <code>1234567890</code></li>
                          <li>4. Nhập số tiền cần thanh toán</li>
                          <li>5. <strong>Quan trọng:</strong> Nội dung: <code>"SV2024001 180500"</code> (Mã SV + Số tiền)</li>
                          <li>6. Xác nhận và lưu lại biên lai</li>
                        </ol>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
                      💡 <strong>Mẹo:</strong> Ghi đúng nội dung chuyển khoản giúp admin xác nhận nhanh hơn!
                    </div>
                  </div>
                </div>

                {/* E-Wallet Guide */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                    📱 Ví điện tử (MoMo/ZaloPay/VNPay)
                  </h5>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-blue-800 mb-2">Thông tin ví:</h6>
                        <div className="space-y-1 text-sm">
                          <p><strong>Số điện thoại:</strong> 0912345678</p>
                          <p><strong>Tên ví:</strong> Nguyễn Văn A</p>
                          <p><strong>Loại ví:</strong> MoMo/ZaloPay/VNPay</p>
                        </div>
                      </div>
                      <div>
                        <h6 className="font-medium text-blue-800 mb-2">Các bước thực hiện:</h6>
                        <ol className="text-sm space-y-1">
                          <li>1. Mở ứng dụng ví điện tử</li>
                          <li>2. Chọn "Chuyển tiền" → "Chuyển tiền đến số điện thoại"</li>
                          <li>3. Nhập SĐT: <code>0912345678</code></li>
                          <li>4. Nhập số tiền cần thanh toán</li>
                          <li>5. Nhập lời nhắn: <code>"SV2024001 180500"</code></li>
                          <li>6. Xác nhận và <strong>chụp màn hình</strong> giao dịch thành công</li>
                        </ol>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                      📸 <strong>Bắt buộc:</strong> Chụp màn hình giao dịch thành công để làm bằng chứng!
                    </div>
                  </div>
                </div>

                {/* Cash Payment Guide */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h5 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                    💵 Thanh toán tiền mặt
                  </h5>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-orange-800 mb-2">Địa chỉ & Thời gian:</h6>
                        <div className="space-y-1 text-sm">
                          <p><strong>Địa chỉ:</strong> Văn phòng KTX Tầng 1, Phòng A101</p>
                          <p><strong>Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 6)</p>
                          <p><strong>Sáng thứ 7:</strong> 8:00 - 12:00</p>
                          <p><strong>Nghỉ:</strong> Chủ nhật và ngày lễ</p>
                        </div>
                      </div>
                      <div>
                        <h6 className="font-medium text-orange-800 mb-2">Khi đến thanh toán:</h6>
                        <ol className="text-sm space-y-1">
                          <li>1. Mang theo thẻ sinh viên/CCCD</li>
                          <li>2. Báo mã sinh viên và phòng ở</li>
                          <li>3. Nhân viên kiểm tra thông tin hóa đơn</li>
                          <li>4. Thanh toán và nhận biên lai</li>
                          <li>5. Giữ lại biên lai để đối chiếu</li>
                        </ol>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                      🏢 <strong>Lưu ý:</strong> Đến đúng giờ hành chính để được phục vụ nhanh nhất!
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h5 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                    ⚠️ Các vấn đề thường gặp & Cách xử lý
                  </h5>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium text-red-800 mb-2">Vấn đề:</h6>
                        <ul className="space-y-1">
                          <li>• Chuyển khoản sai nội dung</li>
                          <li>• Quá hạn thanh toán</li>
                          <li>• Không nhận được thông báo</li>
                          <li>• Thanh toán nhưng chưa được xác nhận</li>
                          <li>• Quên số tiền cần thanh toán</li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-red-800 mb-2">Giải pháp:</h6>
                        <ul className="space-y-1">
                          <li>• Liên hệ ngay admin qua hotline</li>
                          <li>• Cung cấp mã giao dịch để kiểm tra</li>
                          <li>• Chụp lại biên lai/giao dịch</li>
                          <li>• Đến văn phòng KTX để xử lý trực tiếp</li>
                          <li>• Kiểm tra lại email/thông báo trong hệ thống</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Kho Trang thiết bị</h3>
              <Button onClick={() => setShowEquipmentModal(true)}>
                <Plus size={20} /> Thêm thiết bị
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity} {item.unit}</p>
                      <p className="text-sm text-gray-500">Vị trí: {item.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'Available' ? 'bg-green-100 text-green-800' :
                      item.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.status === 'Available' ? 'Sẵn có' :
                       item.status === 'In Use' ? 'Đang dùng' :
                       item.status === 'Damaged' ? 'Hỏng' : 'Bảo trì'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Danh sách Sinh viên">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn Import</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• File phải có định dạng .xlsx hoặc .csv</li>
                <li>• Bao gồm các cột: Mã SV, Họ tên, Lớp, Giới tính, SĐT, Email, Địa chỉ, CCCD</li>
                <li>• Dung lượng file tối đa 10MB</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2">File Mẫu</h4>
              <p className="text-sm text-green-700 mb-3">
                Tải file mẫu để biết đúng định dạng dữ liệu cần import
              </p>
              <Button 
                onClick={handleDownloadTemplate}
                className="w-full"
                variant="secondary"
              >
                <Download size={16} className="mr-2" />
                Tải File Mẫu (.csv)
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Kéo và thả file vào đây hoặc click để chọn</p>
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileImport}
                className="hidden"
                id="file-import"
              />
              <label
                htmlFor="file-import"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
              >
                Chọn file
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <Modal isOpen={showRoomModal} onClose={handleCloseRoomModal} title={selectedRoom ? "Chỉnh sửa Phòng" : "Thêm Phòng Mới"}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng</label>
                {selectedRoom ? (
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                ) : (
                  <select
                    value={roomForm.roomNumber}
                    onChange={(e) => handleRoomNumberChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Chọn số phòng --</option>
                    {getAvailableRoomNumbers().map(roomNumber => (
                      <option key={roomNumber} value={roomNumber}>
                        {roomNumber}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRoom ? "Không thể thay đổi số phòng khi chỉnh sửa" : (
                    <>
                      Có {getAvailableRoomNumbers().length} phòng trống | 
                      Khu A: {getAvailableRoomNumbers().filter(r => r.startsWith('A')).length} phòng | 
                      Khu B: {getAvailableRoomNumbers().filter(r => r.startsWith('B')).length} phòng
                    </>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu</label>
                <select
                  value={roomForm.area}
                  onChange={(e) => setRoomForm({...roomForm, area: e.target.value as 'A' | 'B'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!!selectedRoom}
                >
                  <option value="A">Khu A</option>
                  <option value="B">Khu B</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Khu A: 200 phòng (20 phòng/tầng) | Khu B: 300 phòng (25 phòng/tầng)
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
                <input
                  type="number"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({...roomForm, type: e.target.value as 'Standard' | 'Premium' | 'VIP'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá phòng (VNĐ)</label>
                <input
                  type="number"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({...roomForm, price: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({...roomForm, status: e.target.value as 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Available">Trống</option>
                  <option value="Occupied">Đã ở</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Reserved">Đặt trước</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roomForm.status === 'Occupied' ? 'Sẽ tự động đặt 1 người đang ở' : 'Số người đang ở: 0'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="8"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiện ích</label>
              <div className="space-y-2">
                {['Điều hòa', 'Tủ lạnh', 'Giường', 'Bàn học', 'Tủ quần áo', 'WiFi'].map(facility => (
                  <label key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={roomForm.facilities.includes(facility)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoomForm({...roomForm, facilities: [...roomForm.facilities, facility]});
                        } else {
                          setRoomForm({...roomForm, facilities: roomForm.facilities.filter(f => f !== facility)});
                        }
                      }}
                      className="mr-2"
                    />
                    {facility}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={handleCloseRoomModal}>
                Hủy
              </Button>
              <Button onClick={handleAddRoom}>
                {selectedRoom ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <Modal isOpen={showRegistrationModal} onClose={handleCloseRegistrationModal} title="Đăng ký phòng mới">
          <div className="space-y-4">
            {/* User Information Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2">Thông tin sinh viên</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <p><strong>Mã SV:</strong> {currentUser.id}</p>
                  <p><strong>Họ tên:</strong> {currentUser.name}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </div>
                <div>
                  <p><strong>SĐT:</strong> {currentUser.phone}</p>
                  <p><strong>Lớp:</strong> {currentUser.class}</p>
                  <p><strong>Ngành:</strong> {currentUser.major}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600">
                ✅ Thông tin được tự động điền từ tài khoản đăng nhập
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã sinh viên</label>
                <input
                  type="text"
                  value={registrationForm.studentId}
                  onChange={(e) => setRegistrationForm({...registrationForm, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="SV001"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Tự động điền từ tài khoản</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên sinh viên</label>
                <input
                  type="text"
                  value={registrationForm.studentName}
                  onChange={(e) => setRegistrationForm({...registrationForm, studentName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="Nguyễn Văn A"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Tự động điền từ tài khoản</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng đăng ký</label>
                <select
                  value={registrationForm.roomNumber}
                  onChange={(e) => setRegistrationForm({...registrationForm, roomNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Chọn phòng --</option>
                  {getFilteredRoomsForRegistration().map(room => {
                    const availableSpots = room.capacity - room.currentOccupancy;
                    const statusText = room.status === 'Available' ? 'Trống' : 
                                     room.status === 'Occupied' ? 'Đã ở' : 
                                     room.status === 'Maintenance' ? 'Bảo trì' : 'Đặt trước';
                    const canRegister = availableSpots > 0 && room.status !== 'Maintenance';
                    
                    return (
                      <option 
                        key={room.id} 
                        value={room.roomNumber}
                        disabled={!canRegister}
                        className={!canRegister ? 'text-gray-400' : ''}
                      >
                        {room.roomNumber} - {room.type} - {room.price.toLocaleString()}đ/tháng 
                        ({room.currentOccupancy}/{room.capacity} người) - {statusText}
                        {!canRegister && ' - Hết chỗ'}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hiển thị phòng theo bộ lọc. Phòng màu xám không thể đăng ký.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đăng ký</label>
                <input
                  type="date"
                  value={registrationForm.registrationDate}
                  onChange={(e) => setRegistrationForm({...registrationForm, registrationDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            {/* Room Details Box */}
            {getSelectedRoomDetails() && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Thông tin phòng đã chọn</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <p><strong>Phòng:</strong> {getSelectedRoomDetails()?.roomNumber}</p>
                    <p><strong>Loại:</strong> {getSelectedRoomDetails()?.type}</p>
                    <p><strong>Khu:</strong> {getSelectedRoomDetails()?.area}</p>
                    <p><strong>Tầng:</strong> {getSelectedRoomDetails()?.floor}</p>
                  </div>
                  <div>
                    <p><strong>Sức chứa:</strong> {getSelectedRoomDetails()?.capacity} người</p>
                    <p><strong>Đã có:</strong> {getSelectedRoomDetails()?.currentOccupancy} người</p>
                    <p><strong>Còn trống:</strong> {(getSelectedRoomDetails()?.capacity || 0) - (getSelectedRoomDetails()?.currentOccupancy || 0)} người</p>
                    <p><strong>Giá:</strong> {getSelectedRoomDetails()?.price?.toLocaleString()}đ/tháng</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p><strong>Tiện ích:</strong> {getSelectedRoomDetails()?.facilities?.join(', ')}</p>
                </div>
                {((getSelectedRoomDetails()?.capacity || 0) - (getSelectedRoomDetails()?.currentOccupancy || 0)) > 0 ? (
                  <div className="mt-2 p-2 bg-green-100 rounded text-green-800 text-sm">
                    ✅ Phòng còn chỗ trống, có thể đăng ký
                  </div>
                ) : (
                  <div className="mt-2 p-2 bg-red-100 rounded text-red-800 text-sm">
                    ❌ Phòng đã đầy hoặc đang bảo trì, không thể đăng ký
                  </div>
                )}
              </div>
            )}
            
            {/* Room Filters */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Bộ lọc phòng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <select
                    value={regFilterArea}
                    onChange={(e) => setRegFilterArea(e.target.value as 'all' | 'A' | 'B')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">Tất cả khu</option>
                    <option value="A">Khu A</option>
                    <option value="B">Khu B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                  <select
                    value={regFilterType}
                    onChange={(e) => setRegFilterType(e.target.value as 'all' | 'Standard' | 'Premium' | 'VIP')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={regFilterStatus}
                    onChange={(e) => setRegFilterStatus(e.target.value as 'all' | 'Available' | 'Occupied' | 'Maintenance' | 'Reserved')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Available">Trống</option>
                    <option value="Occupied">Đã ở</option>
                    <option value="Maintenance">Bảo trì</option>
                    <option value="Reserved">Đặt trước</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="onlyAvailable"
                    checked={regOnlyAvailable}
                    onChange={(e) => setRegOnlyAvailable(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="onlyAvailable" className="text-sm font-medium text-gray-700">
                    Chỉ phòng còn chỗ
                  </label>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Hiển thị {getFilteredRoomsForRegistration().length} phòng phù hợp
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thuê (tháng)</label>
                <input
                  type="number"
                  value={registrationForm.duration}
                  onChange={(e) => setRegistrationForm({...registrationForm, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={registrationForm.status}
                  onChange={(e) => setRegistrationForm({...registrationForm, status: e.target.value as 'Pending' | 'Approved' | 'Rejected'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Pending">Chờ duyệt</option>
                  <option value="Approved">Đã duyệt</option>
                  <option value="Rejected">Từ chối</option>
                </select>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Thông tin đăng ký</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Sinh viên:</strong> {registrationForm.studentName || currentUser.name}</p>
                <p>• <strong>Mã SV:</strong> {registrationForm.studentId || currentUser.id}</p>
                <p>• <strong>Phòng:</strong> {registrationForm.roomNumber || 'Chưa chọn'}</p>
                <p>• <strong>Thời gian:</strong> {registrationForm.duration} tháng</p>
                <p>• <strong>Ngày đăng ký:</strong> {registrationForm.registrationDate}</p>
                <p>• <strong>Trạng thái:</strong> {registrationForm.status === 'Pending' ? 'Chờ duyệt' : registrationForm.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={handleCloseRegistrationModal}>
                Hủy
              </Button>
              <Button onClick={handleAddRegistration}>
                Tạo đăng ký
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Utility Bill Modal */}
      {showUtilityModal && (
        <Modal isOpen={showUtilityModal} onClose={handleCloseUtilityModal} title="Thêm hóa đơn điện nước">
          <div className="space-y-4">
            {/* Guidance Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn tạo hóa đơn</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Bước 1:</strong> Chọn phòng và kỳ billing (tháng/năm)</p>
                <p>• <strong>Bước 2:</strong> Nhập số điện và nước đã dùng trong kỳ</p>
                <p>• <strong>Bước 3:</strong> Kiểm tra đơn giá và tổng tiền</p>
                <p>• <strong>Bước 4:</strong> Chọn trạng thái và tạo hóa đơn</p>
              </div>
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-600">
                💡 <strong>Lưu ý:</strong> Số điện đọc từ công-tơ (kWh), số nước đọc từ đồng hồ nước (m³)
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                <select
                  value={utilityForm.roomId}
                  onChange={(e) => {
                    console.log('=== ROOM SELECTION DEBUG ===');
                    console.log('Room selection changed:', e.target.value);
                    
                    const roomId = parseInt(e.target.value);
                    const room = rooms.find(r => r.id === roomId);
                    
                    console.log('Parsed roomId:', roomId);
                    console.log('Found room:', room);
                    console.log('Room roomNumber:', room?.roomNumber);
                    
                    const newUtilityForm = {
                      ...utilityForm,
                      roomId,
                      roomNumber: room?.roomNumber || ''
                    };
                    
                    console.log('New utilityForm:', newUtilityForm);
                    
                    setUtilityForm(newUtilityForm);
                    
                    // Verify after state update
                    setTimeout(() => {
                      console.log('UtilityForm after update:', utilityForm);
                    }, 100);
                    
                    console.log('=== END ROOM SELECTION DEBUG ===');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber} - {room.type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ billing</label>
                <input
                  type="month"
                  value={utilityForm.month}
                  onChange={(e) => setUtilityForm({...utilityForm, month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📅 Chọn tháng/năm của kỳ billing
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện đã dùng (kWh)</label>
                <input
                  type="number"
                  value={utilityForm.electricity}
                  onChange={(e) => setUtilityForm({...utilityForm, electricity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  placeholder="Nhập số kWh đã tiêu thụ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Nhập số điện đã dùng trong kỳ này (ví dụ: 120)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số nước đã dùng (m³)</label>
                <input
                  type="number"
                  value={utilityForm.water}
                  onChange={(e) => setUtilityForm({...utilityForm, water: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  placeholder="Nhập số m³ đã tiêu thụ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💧 Nhập số nước đã dùng trong kỳ này (ví dụ: 15)
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá điện (đ/kWh)</label>
                <input
                  type="number"
                  value={utilityForm.electricityCost}
                  onChange={(e) => setUtilityForm({...utilityForm, electricityCost: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá nước (đ/m³)</label>
                <input
                  type="number"
                  value={utilityForm.waterCost}
                  onChange={(e) => setUtilityForm({...utilityForm, waterCost: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>
            
            {/* Practical Examples */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="font-semibold text-yellow-800 mb-2">📊 Ví dụ thực tế</h4>
              <div className="text-sm text-yellow-700 space-y-2">
                <div className="border-l-4 border-yellow-400 pl-3">
                  <p><strong>Phòng A0101 - Tháng 1/2024:</strong></p>
                  <p>• Đọc công-tơ điện: <code>125.5 kWh</code></p>
                  <p>• Đọc đồng hồ nước: <code>12.3 m³</code></p>
                  <p>• Thành tiền: <code>376.500đ + 307.500đ = 684.000đ</code></p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-3">
                  <p><strong>Phòng B0102 - Tháng 1/2024:</strong></p>
                  <p>• Đọc công-tơ điện: <code>98.2 kWh</code></p>
                  <p>• Đọc đồng hồ nước: <code>8.7 m³</code></p>
                  <p>• Thành tiền: <code>294.600đ + 217.500đ = 512.100đ</code></p>
                </div>
              </div>
            </div>
            
            {/* Meter History Section */}
            {utilityForm.roomNumber && meterHistory && meterHistory[utilityForm.roomNumber] && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-3">📊 Lịch sử dụng công-tơ phòng {utilityForm.roomNumber}</h4>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="text-left py-2 px-2">Ngày</th>
                        <th className="text-left py-2 px-2">Điện (kWh)</th>
                        <th className="text-left py-2 px-2">Nước (m³)</th>
                        <th className="text-left py-2 px-2">Ghi chú</th>
                        <th className="text-left py-2 px-2">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meterHistory && meterHistory[utilityForm.roomNumber] && meterHistory[utilityForm.roomNumber].map((reading, index) => (
                        <tr key={index} className="border-b border-purple-200 hover:bg-purple-50">
                          <td className="py-2 px-2">{reading.date}</td>
                          <td className="py-2 px-2">{reading.electricityReading}</td>
                          <td className="py-2 px-2">{reading.waterReading}</td>
                          <td className="py-2 px-2 text-xs text-gray-600">{reading.notes}</td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => {
                                console.log('Eye icon clicked for reading:', { utilityForm, reading, index });
                                const roomNumber = utilityForm.roomNumber || (rooms.find(r => r.id === utilityForm.roomId)?.roomNumber);
                                console.log('Resolved roomNumber:', roomNumber);
                                handleViewReadingDetails(roomNumber, reading, index);
                              }}
                              className="text-purple-600 hover:text-purple-800"
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 p-2 bg-purple-100 rounded text-xs text-purple-700">
                  📈 <strong>Thông tin:</strong> Hiển thị {meterHistory && meterHistory[utilityForm.roomNumber] ? meterHistory[utilityForm.roomNumber].length : 0} lần ghi chỉ số
                </div>
              </div>
            )}
            
            {/* Smart Meter Reading Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-3">📸 Chụp hình công-tơ (Tự động tính toán)</h4>
              
              {/* Capture Status Alert */}
              {captureState.isCapturing && (
                <div className="mb-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
                      Đang chụp công-tơ {captureState.currentMeterType === 'electricity' ? 'điện' : 'nước'}... 
                      Vui lòng đợi hoàn thành trước khi chụp tiếp theo!
                    </span>
                  </div>
                </div>
              )}
              
              {/* Electricity Meter */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-green-700">⚡ Công-tơ điện</h5>
                  <button
                    onClick={() => handleImageCapture('electricity')}
                    disabled={captureState.isCapturing}
                    className={`px-3 py-1 text-white text-sm rounded-lg flex items-center gap-1 transition-all ${
                      captureState.isCapturing && captureState.currentMeterType === 'electricity'
                        ? 'bg-orange-500 cursor-not-allowed'
                        : captureState.isCapturing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {captureState.isCapturing && captureState.currentMeterType === 'electricity' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang chụp...
                      </>
                    ) : captureState.isCapturing ? (
                      <>
                        <Camera size={14} /> Chụp công-tơ
                      </>
                    ) : (
                      <>
                        <Camera size={14} /> Chụp công-tơ
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Chỉ số trước:</span>
                    <span className="ml-2 font-medium">{getLastReading()?.electricityReading || 0} kWh</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Chỉ số hiện tại:</span>
                    <span className="ml-2 font-medium">{meterReadings.currentElectricity || 0} kWh</span>
                  </div>
                </div>
                {meterReadings.electricityImage && (
                  <div className="mt-2 text-xs text-green-600">
                    📸 Đã chụp: {meterReadings.electricityImage}
                  </div>
                )}
              </div>
              
              {/* Water Meter */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-green-700">💧 Đồng hồ nước</h5>
                  <button
                    onClick={() => handleImageCapture('water')}
                    disabled={captureState.isCapturing}
                    className={`px-3 py-1 text-white text-sm rounded-lg flex items-center gap-1 transition-all ${
                      captureState.isCapturing && captureState.currentMeterType === 'water'
                        ? 'bg-orange-500 cursor-not-allowed'
                        : captureState.isCapturing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {captureState.isCapturing && captureState.currentMeterType === 'water' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang chụp...
                      </>
                    ) : captureState.isCapturing ? (
                      <>
                        <Camera size={14} /> Chụp đồng hồ
                      </>
                    ) : (
                      <>
                        <Camera size={14} /> Chụp đồng hồ
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Chỉ số trước:</span>
                    <span className="ml-2 font-medium">{getLastReading()?.waterReading || 0} m³</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Chỉ số hiện tại:</span>
                    <span className="ml-2 font-medium">{meterReadings.currentWater || 0} m³</span>
                  </div>
                </div>
                {meterReadings.waterImage && (
                  <div className="mt-2 text-xs text-green-600">
                    📸 Đã chụp: {meterReadings.waterImage}
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
                💡 <strong>Thông minh:</strong> Chụp hình công-tơ sẽ tự động tính toán lượng tiêu thụ và điền vào form!
              </div>
            </div>
            
            {/* Test Button */}
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <button
                onClick={() => {
                  console.log('Test button clicked');
                  console.log('Current utilityForm.roomId:', utilityForm.roomId);
                  console.log('Current meterHistory:', meterHistory);
                  
                  if (utilityForm.roomNumber && meterHistory && meterHistory[utilityForm.roomNumber]) {
                    const firstReading = meterHistory[utilityForm.roomNumber][0];
                    console.log('Testing with first reading:', firstReading);
                    handleViewReadingDetails(utilityForm.roomNumber, firstReading, 0);
                  } else {
                    console.log('No room selected or no history');
                    alert('Vui lòng chọn phòng có lịch sử để test!');
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                🧪 Test Detail View
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Chi tiết hóa đơn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tiền phòng:</span>
                  <span>{(rooms.find(r => r.id === utilityForm.roomId)?.price || 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền điện:</span>
                  <span>{utilityForm.electricity} kWh × {utilityForm.electricityCost.toLocaleString()}đ = {(utilityForm.electricity * utilityForm.electricityCost).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền nước:</span>
                  <span>{utilityForm.water} m³ × {utilityForm.waterCost.toLocaleString()}đ = {(utilityForm.water * utilityForm.waterCost).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span>{((utilityForm.electricity * utilityForm.electricityCost) + (utilityForm.water * utilityForm.waterCost) + (rooms.find(r => r.id === utilityForm.roomId)?.price || 0)).toLocaleString()}đ</span>
                </div>
                {utilityForm.roomId && (
                  <div className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                    💡 <strong>Phân chia:</strong> {(rooms.find(r => r.id === utilityForm.roomId)?.students.length || 0)} sinh viên × {Math.floor(((utilityForm.electricity * utilityForm.electricityCost) + (utilityForm.water * utilityForm.waterCost) + (rooms.find(r => r.id === utilityForm.roomId)?.price || 0)) / (rooms.find(r => r.id === utilityForm.roomId)?.students.length || 1)).toLocaleString()}đ/người
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={utilityForm.status}
                  onChange={(e) => setUtilityForm({...utilityForm, status: e.target.value as 'Paid' | 'Unpaid' | 'Overdue'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Unpaid">Chưa thanh toán</option>
                  <option value="Paid">Đã thanh toán</option>
                  <option value="Overdue">Quá hạn</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={handleCloseUtilityModal}>
                Hủy
              </Button>
              <Button onClick={handleAddUtilityBill}>
                Tạo hóa đơn
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Meter Reading Detail Modal */}
      {(() => {
        console.log('=== MODAL RENDER DEBUG ===');
        console.log('selectedReading:', selectedReading);
        console.log('selectedReading truthy:', !!selectedReading);
        
        if (selectedReading) {
          console.log('✅ Modal should render');
          console.log('Room number:', selectedReading.roomNumber);
          console.log('Reading data:', selectedReading.reading);
          console.log('Index:', selectedReading.index);
        } else {
          console.log('❌ Modal should NOT render');
        }
        
        console.log('=== END MODAL RENDER DEBUG ===');
        return selectedReading;
      })() && (
        <Modal isOpen={true} onClose={handleCloseDetailModal} title={`Chi tiết công-tơ phòng ${selectedReading.roomNumber}`}>
          <div className="space-y-4">
            {/* Reading Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3">📊 Thông tin ghi chỉ số</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Phòng:</span>
                  <span className="ml-2 font-medium">{selectedReading.roomNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày ghi:</span>
                  <span className="ml-2 font-medium">{selectedReading.reading.date}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ghi chú:</span>
                  <span className="ml-2 font-medium">{selectedReading.reading.notes || 'Không có'}</span>
                </div>
                <div>
                  <span className="text-gray-600">STT:</span>
                  <span className="ml-2 font-medium">#{selectedReading.index + 1}</span>
                </div>
              </div>
            </div>

            {/* Current Reading Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h5 className="font-semibold text-green-800 mb-2">⚡ Công-tơ điện</h5>
                <div className="text-2xl font-bold text-green-700">{selectedReading.reading.electricityReading} kWh</div>
                <div className="text-sm text-green-600">
                  Chỉ số công-tơ điện tại thời điểm ghi
                </div>
                {selectedReading.reading.electricityImage && (
                  <div className="mt-2 text-xs text-green-600">
                    📸 Ảnh: {selectedReading.reading.electricityImage}
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h5 className="font-semibold text-blue-800 mb-2">💧 Đồng hồ nước</h5>
                <div className="text-2xl font-bold text-blue-700">{selectedReading.reading.waterReading} m³</div>
                <div className="text-sm text-blue-600">
                  Chỉ số đồng hồ nước tại thời điểm ghi
                </div>
                {selectedReading.reading.waterImage && (
                  <div className="mt-2 text-xs text-blue-600">
                    📸 Ảnh: {selectedReading.reading.waterImage}
                  </div>
                )}
              </div>
            </div>

            {/* Usage Analysis */}
            {selectedReading.index > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h4 className="font-semibold text-yellow-800 mb-3">📈 Phân tích tiêu thụ</h4>
                {(() => {
                  const previousReading = meterHistory && meterHistory[selectedReading.roomNumber] && selectedReading.index > 0 
                    ? meterHistory[selectedReading.roomNumber][selectedReading.index - 1] 
                    : null;
                  const usage = calculateUsageBetweenReadings(previousReading, selectedReading.reading);
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khoảng cách:</span>
                        <span className="font-medium">{usage.daysBetween} ngày</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiêu thụ điện:</span>
                        <span className="font-medium">{usage.electricityUsage} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiêu thụ nước:</span>
                        <span className="font-medium">{usage.waterUsage} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trung bình/ngày (điện):</span>
                        <span className="font-medium">{usage.avgElectricityPerDay.toFixed(2)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trung bình/ngày (nước):</span>
                        <span className="font-medium">{usage.avgWaterPerDay.toFixed(2)} m³</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span className="text-gray-700">Tổng chi phí dự kiến:</span>
                        <span className="text-green-700">
                          {(usage.electricityUsage * 3000 + usage.waterUsage * 25000).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Room Statistics */}
            {getRoomUsageStats(selectedReading.roomNumber) && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-3">📊 Thống kê tiêu thụ phòng {selectedReading.roomNumber}</h4>
                {(() => {
                  const stats = getRoomUsageStats(selectedReading.roomNumber);
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng số lần ghi:</span>
                        <span className="font-medium">{stats?.readingsCount || 0} lần</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khoảng cách theo dõi:</span>
                        <span className="font-medium">{stats?.daysBetween || 0} ngày</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiêu thụ điện:</span>
                        <span className="font-medium">{stats?.totalElectricity || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiêu thụ nước:</span>
                        <span className="font-medium">{stats?.totalWater || 0} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trung bình/ngày (điện):</span>
                        <span className="font-medium">{stats?.avgElectricityPerDay.toFixed(2)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trung bình/ngày (nước):</span>
                        <span className="font-medium">{stats?.avgWaterPerDay.toFixed(2)} m³</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span className="text-gray-700">Tổng chi phí dự kiến:</span>
                        <span className="text-purple-700">
                          {(stats?.totalElectricity * 3000 + stats?.totalWater * 25000).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={handleCloseDetailModal}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {selectedBillForPayment && (
        <Modal 
          isOpen={showPaymentModal} 
          title="💳 Thanh toán hóa đơn" 
          onClose={() => setShowPaymentModal(false)}
        >
          <div className="p-6 max-w-md w-full">
            {!paymentSuccess ? (
              <>
                {/* Bill Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Phòng:</span>
                    <span className="font-medium">{selectedBillForPayment.roomNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Kỳ:</span>
                    <span className="font-medium">{selectedBillForPayment.month}/{selectedBillForPayment.year}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{selectedBillForPayment.totalAmount.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Sinh viên cần thanh toán:</h4>
                  {getBillPaymentDetails(selectedBillForPayment.id).payments
                    .filter(p => p.status === 'Pending')
                    .map(payment => (
                    <div key={payment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{payment.studentName}</span>
                          <span className="ml-2 text-sm text-gray-600">({payment.studentCode})</span>
                        </div>
                        <div className="font-bold text-yellow-700">{payment.amount.toLocaleString()}đ</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Chọn phương thức thanh toán:</h4>
                  
                  {/* Cash Payment */}
                  <button
                    onClick={() => handlePaymentMethodSelect('cash')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      selectedPaymentMethod === 'cash' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign size={24} className={selectedPaymentMethod === 'cash' ? 'text-green-500' : 'text-gray-400'} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">Tiền mặt</p>
                      <p className="text-sm text-gray-500">Thanh toán tại văn phòng KTX</p>
                    </div>
                    {selectedPaymentMethod === 'cash' && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>

                  {/* Bank Transfer */}
                  <button
                    onClick={() => handlePaymentMethodSelect('transfer')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      selectedPaymentMethod === 'transfer' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone size={24} className={selectedPaymentMethod === 'transfer' ? 'text-green-500' : 'text-gray-400'} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">Chuyển khoản</p>
                      <p className="text-sm text-gray-500">Chuyển khoản ngân hàng</p>
                    </div>
                    {selectedPaymentMethod === 'transfer' && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>

                  {/* QR Code */}
                  <button
                    onClick={() => handlePaymentMethodSelect('qr')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      selectedPaymentMethod === 'qr' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode size={24} className={selectedPaymentMethod === 'qr' ? 'text-green-500' : 'text-gray-400'} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">Quét mã QR</p>
                      <p className="text-sm text-gray-500">Quét mã QR để thanh toán</p>
                    </div>
                    {selectedPaymentMethod === 'qr' && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === 'transfer' && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-800 mb-2">Thông tin chuyển khoản:</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Ngân hàng:</span> {getTransferInfo().bank}</p>
                      <p><span className="font-medium">Số tài khoản:</span> {getTransferInfo().accountNumber}</p>
                      <p><span className="font-medium">Chủ tài khoản:</span> {getTransferInfo().accountName}</p>
                      <p><span className="font-medium">Số tiền:</span> {getTransferInfo().amount.toLocaleString()}đ</p>
                      <p><span className="font-medium">Nội dung:</span> {getTransferInfo().description}</p>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'qr' && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                    <QrCode size={120} className="mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-blue-800">Quét mã QR để thanh toán</p>
                    <p className="text-xs text-blue-600 mt-1">{getTransferInfo().amount.toLocaleString()}đ</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      const pendingPayments = getBillPaymentDetails(selectedBillForPayment.id).payments
                        .filter(p => p.status === 'Pending');
                      if (pendingPayments.length > 0) {
                        processPayment(pendingPayments[0].id);
                      }
                    }}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  </Button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Thanh toán thành công!</h3>
                <p className="text-gray-600 mb-4">Giao dịch đã được xử lý thành công</p>
                <div className="text-sm text-gray-500">
                  <p>Mã giao dịch: KTX-{Date.now()}</p>
                  <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <Modal 
          isOpen={showNotificationModal} 
          title="📬 Thông báo thanh toán" 
          onClose={() => setShowNotificationModal(false)}
        >
          <div className="space-y-3">
            {paymentNotifications.slice(-10).reverse().map(notification => (
              <div key={notification.id} className={`border rounded-lg p-3 ${
                notification.type === 'Overdue' ? 'border-red-200 bg-red-50' :
                notification.type === 'Reminder' ? 'border-yellow-200 bg-yellow-50' :
                notification.type === 'Paid' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    notification.type === 'Overdue' ? 'bg-red-100 text-red-800' :
                    notification.type === 'Reminder' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'Paid' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.type === 'Overdue' ? '⚠️ Quá hạn' :
                     notification.type === 'Reminder' ? '⏰ Nhắc nhở' :
                     notification.type === 'Paid' ? '✅ Đã thanh toán' :
                     '📄 Hóa đơn mới'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.sentDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-line">{notification.message}</div>
                <div className="text-xs text-gray-600 mt-1">
                  SV: {notification.studentId} | HĐ: #{notification.billId}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
              Đóng
            </Button>
          </div>
      </Modal>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <Modal isOpen={showEquipmentModal} onClose={() => {
          setShowEquipmentModal(false);
          setEquipmentForm({
            name: '',
            category: 'ELECTRONICS',
            quantity: 0,
            location: '',
            condition: 'GOOD',
            purchaseDate: '',
            warranty: '',
            notes: ''
          });
        }} title="Thêm Thiết Bị Mới">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  placeholder="Nhập tên thiết bị..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.quantity}
                  onChange={(e) => setEquipmentForm({...equipmentForm, quantity: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.category}
                  onChange={(e) => setEquipmentForm({...equipmentForm, category: e.target.value})}
                >
                  <option value="ELECTRONICS">Điện tử</option>
                  <option value="FURNITURE">Nội thất</option>
                  <option value="SPORTS">Thể thao</option>
                  <option value="LAB">Thiết bị lab</option>
                  <option value="OFFICE">Văn phòng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng *</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.condition}
                  onChange={(e) => setEquipmentForm({...equipmentForm, condition: e.target.value})}
                >
                  <option value="GOOD">Tốt</option>
                  <option value="FAIR">Khá</option>
                  <option value="POOR">Kém</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={equipmentForm.location}
                onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                placeholder="Phòng A1, KTX Tầng 1..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.purchaseDate}
                  onChange={(e) => setEquipmentForm({...equipmentForm, purchaseDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={equipmentForm.warranty}
                  onChange={(e) => setEquipmentForm({...equipmentForm, warranty: e.target.value})}
                  placeholder="12 tháng, 24 tháng..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                value={equipmentForm.notes}
                onChange={(e) => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                placeholder="Ghi chú về thiết bị..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => {
                setShowEquipmentModal(false);
                setEquipmentForm({
                  name: '',
                  category: 'ELECTRONICS',
                  quantity: 0,
                  location: '',
                  condition: 'GOOD',
                  purchaseDate: '',
                  warranty: '',
                  notes: ''
                });
              }}>
                Hủy
              </Button>
              <Button onClick={handleAddEquipment}>
                <Plus size={16}/> Thêm thiết bị
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KtxView;
