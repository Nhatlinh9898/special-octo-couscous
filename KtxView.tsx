import React, { useState, useEffect } from 'react';
import { Building2, Users, Bed, FileText, Upload, Calendar, DollarSign, Settings, Package, Zap, Droplets, Wind, Plus, Search, Filter, Edit, Trash2, Eye, Download, CheckCircle, AlertCircle, XCircle, Clock, Camera } from 'lucide-react';
import { Button, Modal } from './components';

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
  month: string;
  electricity: number;
  water: number;
  electricityCost: number;
  waterCost: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  dueDate: string;
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
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  
  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
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
    totalAmount: 0,
    status: 'Unpaid' as 'Paid' | 'Unpaid' | 'Overdue'
  });

  // Meter reading state
  const [meterReadings, setMeterReadings] = useState({
    previousElectricity: 0,
    currentElectricity: 0,
    previousWater: 0,
    currentWater: 0,
    electricityImage: '',
    waterImage: ''
  });

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

    setRooms([...areaARooms, ...areaBRooms]);

    // Mock students
    const mockStudents: Student[] = [
      {
        id: 1,
        code: 'SV001',
        fullName: 'Nguyễn Văn An',
        classId: 1,
        gender: 'Nam',
        phone: '0912345678',
        email: 'an.nguyen@university.edu.vn',
        address: 'Hà Nội',
        idCard: '001234567890'
      },
      {
        id: 2,
        code: 'SV002',
        fullName: 'Trần Thị Bình',
        classId: 2,
        gender: 'Nữ',
        phone: '0923456789',
        email: 'binh.tran@university.edu.vn',
        address: 'TP. Hồ Chí Minh',
        idCard: '002345678901'
      }
    ];

    setStudents(mockStudents);

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

    setRegistrations(mockRegistrations);

    // Mock utility bills
    const mockUtilityBills: UtilityBill[] = [
      {
        id: 1,
        roomId: 1,
        month: '2024-01',
        electricity: 120,
        water: 15,
        electricityCost: 3000,
        waterCost: 25000,
        totalAmount: (120 * 3000) + (15 * 25000),
        status: 'Unpaid',
        dueDate: '2024-02-05'
      },
      {
        id: 2,
        roomId: 2,
        month: '2024-01',
        electricity: 95,
        water: 12,
        electricityCost: 3000,
        waterCost: 25000,
        totalAmount: (95 * 3000) + (12 * 25000),
        status: 'Paid',
        dueDate: '2024-02-05'
      }
    ];

    setUtilityBills(mockUtilityBills);

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
    setRooms([...rooms, newRoom]);
    
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
    setRegistrations([...registrations, newRegistration]);
    
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

  const handleAddUtilityBill = () => {
    console.log('Adding utility bill:', utilityForm);
    
    // Calculate total amount
    const totalAmount = (utilityForm.electricity * utilityForm.electricityCost) + 
                       (utilityForm.water * utilityForm.waterCost);
    
    const newBill: UtilityBill = {
      id: utilityBills.length + 1,
      roomId: utilityForm.roomId,
      month: utilityForm.month,
      electricity: utilityForm.electricity,
      water: utilityForm.water,
      electricityCost: utilityForm.electricityCost,
      waterCost: utilityForm.waterCost,
      totalAmount,
      status: utilityForm.status,
      dueDate: new Date(utilityForm.year, new Date(utilityForm.month).getMonth() + 1, 5).toISOString().split('T')[0]
    };
    
    setUtilityBills([...utilityBills, newBill]);
    alert(`Đã tạo hóa đơn thành công!\n\nPhòng: ${utilityForm.roomNumber}\nTháng: ${utilityForm.month}/${utilityForm.year}\nTiền điện: ${utilityForm.electricity} kWh × ${utilityForm.electricityCost.toLocaleString()}đ = ${(utilityForm.electricity * utilityForm.electricityCost).toLocaleString()}đ\nTiền nước: ${utilityForm.water} m³ × ${utilityForm.waterCost.toLocaleString()}đ = ${(utilityForm.water * utilityForm.waterCost).toLocaleString()}đ\nTổng cộng: ${totalAmount.toLocaleString()}đ`);
    
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
      totalAmount: 0,
      status: 'Unpaid'
    });
    setShowUtilityModal(false);
  };

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
      totalAmount: 0,
      status: 'Unpaid'
    });
    setShowUtilityModal(false);
  };

  // Handle image capture and meter reading
  const handleImageCapture = (meterType: 'electricity' | 'water') => {
    // In a real app, this would open camera or file picker
    // For demo, we'll simulate with random numbers
    if (meterType === 'electricity') {
      const previousReading = meterReadings.previousElectricity || Math.floor(Math.random() * 1000);
      const currentReading = previousReading + Math.floor(Math.random() * 200) + 50; // Add 50-250 kWh
      
      setMeterReadings(prev => ({
        ...prev,
        previousElectricity: previousReading,
        currentElectricity: currentReading,
        electricityImage: `electricity_meter_${Date.now()}.jpg`
      }));
      
      // Update utility form with calculated usage
      const usage = currentReading - previousReading;
      setUtilityForm(prev => ({
        ...prev,
        electricity: usage
      }));
      
      alert(`📸 Đã chụp công-tơ điện!\n\nChỉ số trước: ${previousReading} kWh\nChỉ số hiện tại: ${currentReading} kWh\nTiêu thụ: ${usage} kWh\n\nSố liệu đã được tự động cập nhật!`);
    } else {
      const previousReading = meterReadings.previousWater || Math.floor(Math.random() * 100);
      const currentReading = previousReading + Math.floor(Math.random() * 20) + 5; // Add 5-25 m³
      
      setMeterReadings(prev => ({
        ...prev,
        previousWater: previousReading,
        currentWater: currentReading,
        waterImage: `water_meter_${Date.now()}.jpg`
      }));
      
      // Update utility form with calculated usage
      const usage = currentReading - previousReading;
      setUtilityForm(prev => ({
        ...prev,
        water: usage
      }));
      
      alert(`📸 Đã chụp đồng hồ nước!\n\nChỉ số trước: ${previousReading} m³\nChỉ số hiện tại: ${currentReading} m³\nTiêu thụ: ${usage} m³\n\nSố liệu đã được tự động cập nhật!`);
    }
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

  const handleDeleteRoom = (roomId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setRooms(rooms.filter(r => r.id !== roomId));
      alert('Đã xóa phòng thành công!');
    }
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
        setRooms([...rooms, ...newRooms]);
        
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
      setRooms([...rooms, testRoom]);
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
                    const roomId = parseInt(e.target.value);
                    const room = rooms.find(r => r.id === roomId);
                    setUtilityForm({
                      ...utilityForm,
                      roomId,
                      roomNumber: room?.roomNumber || ''
                    });
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
            
            {/* Smart Meter Reading Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-3">📸 Chụp hình công-tơ (Tự động tính toán)</h4>
              
              {/* Electricity Meter */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-green-700">⚡ Công-tơ điện</h5>
                  <button
                    onClick={() => handleImageCapture('electricity')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <Camera size={14} /> Chụp công-tơ
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Chỉ số trước:</span>
                    <span className="ml-2 font-medium">{meterReadings.previousElectricity || 0} kWh</span>
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
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <Camera size={14} /> Chụp đồng hồ
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Chỉ số trước:</span>
                    <span className="ml-2 font-medium">{meterReadings.previousWater || 0} m³</span>
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
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Chi tiết hóa đơn</h4>
              <div className="space-y-2 text-sm">
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
                  <span>{((utilityForm.electricity * utilityForm.electricityCost) + (utilityForm.water * utilityForm.waterCost)).toLocaleString()}đ</span>
                </div>
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
    </div>
  );
};

export default KtxView;
