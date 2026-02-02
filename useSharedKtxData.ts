// Simple Shared Data Hook for KTX System
import { useState, useEffect } from 'react';

// Shared interfaces
export interface Student {
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

export interface Room {
  id: number;
  roomNumber: string;
  area: 'A' | 'B' | 'Hotel';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  type: 'Standard' | 'Premium' | 'VIP' | 'Deluxe' | 'Suite';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  price: number;
  facilities: string[];
  students: Student[];
  electricityRate?: number;
  waterRate?: number;
}

export interface UtilityBill {
  id: number;
  roomId: number;
  roomNumber: string;
  month: string;
  year: number;
  electricity: number;
  water: number;
  electricityCost: number;
  waterCost: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface MeterReading {
  date: string;
  electricityReading: number;
  waterReading: number;
  electricityImage?: string;
  waterImage?: string;
  notes?: string;
}

export interface Registration {
  id: number;
  studentId: string;
  studentName: string;
  roomNumber: string;
  registrationDate: string;
  duration: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  notes?: string;
}

// Global state
let globalStudents: Student[] = [];
let globalRooms: Room[] = [];
let globalUtilityBills: UtilityBill[] = [];
let globalMeterHistory: {[key: string]: MeterReading[]} = {};
let globalRegistrations: Registration[] = [];

// Initial data
const initializeData = () => {
  if (globalStudents.length === 0) {
    globalStudents = [
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
        roomNumber: 'A0101',
        checkInDate: '2024-01-01',
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
        roomNumber: 'A0102',
        checkInDate: '2024-01-01',
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
        roomNumber: 'B0101',
        checkInDate: '2024-01-01',
        status: 'Active'
      }
    ];
  }

  if (globalRooms.length === 0) {
    globalRooms = [
      {
        id: 1,
        roomNumber: 'A0101',
        area: 'A',
        floor: 1,
        capacity: 4,
        currentOccupancy: 1,
        type: 'Standard',
        status: 'Occupied',
        price: 1500000,
        facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh'],
        students: [],
        electricityRate: 3000,
        waterRate: 25000
      },
      {
        id: 2,
        roomNumber: 'A0102',
        area: 'A',
        floor: 1,
        capacity: 4,
        currentOccupancy: 1,
        type: 'Standard',
        status: 'Occupied',
        price: 1500000,
        facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh'],
        students: [],
        electricityRate: 3000,
        waterRate: 25000
      },
      {
        id: 3,
        roomNumber: 'B0101',
        area: 'B',
        floor: 1,
        capacity: 3,
        currentOccupancy: 1,
        type: 'Premium',
        status: 'Occupied',
        price: 2000000,
        facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Máy giặt'],
        students: [],
        electricityRate: 3000,
        waterRate: 25000
      },
      {
        id: 4,
        roomNumber: 'H001',
        area: 'Hotel',
        floor: 1,
        capacity: 2,
        currentOccupancy: 0,
        type: 'Deluxe',
        status: 'Available',
        price: 500000,
        facilities: ['WiFi', 'Điều hòa', 'Mini bar', 'Room service'],
        students: [],
        electricityRate: 4000,
        waterRate: 30000
      }
    ];
  }

  if (Object.keys(globalMeterHistory).length === 0) {
    globalMeterHistory = {
      'A0101': [
        { date: '2024-01-01', electricityReading: 1000, waterReading: 200, notes: 'Đầu kỳ' },
        { date: '2024-01-15', electricityReading: 1125, waterReading: 212, notes: 'Giữa kỳ' },
        { date: '2024-02-01', electricityReading: 1250, waterReading: 225, notes: 'Cuối kỳ' }
      ],
      'A0102': [
        { date: '2024-01-01', electricityReading: 950, waterReading: 180, notes: 'Đầu kỳ' },
        { date: '2024-01-15', electricityReading: 1048, waterReading: 188, notes: 'Giữa kỳ' },
        { date: '2024-02-01', electricityReading: 1148, waterReading: 198, notes: 'Cuối kỳ' }
      ],
      'B0101': [
        { date: '2024-01-01', electricityReading: 1200, waterReading: 240, notes: 'Đầu kỳ' },
        { date: '2024-01-15', electricityReading: 1355, waterReading: 258, notes: 'Giữa kỳ' },
        { date: '2024-02-01', electricityReading: 1510, waterReading: 276, notes: 'Cuối kỳ' }
      ]
    };
  }
};

// Hook for using shared data
export const useSharedKtxData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [meterHistory, setMeterHistory] = useState<{[key: string]: MeterReading[]}>({});
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
    setStudents([...globalStudents]);
    setRooms([...globalRooms]);
    setUtilityBills([...globalUtilityBills]);
    setMeterHistory({...globalMeterHistory});
    setRegistrations([...globalRegistrations]);
  }, []);

  // Sync functions
  const syncStudents = (newStudents: Student[]) => {
    globalStudents = [...newStudents];
    setStudents([...newStudents]);
  };

  const syncRooms = (newRooms: Room[]) => {
    globalRooms = [...newRooms];
    setRooms([...newRooms]);
  };

  const syncUtilityBills = (newBills: UtilityBill[]) => {
    globalUtilityBills = [...newBills];
    setUtilityBills([...newBills]);
  };

  const syncMeterHistory = (newHistory: {[key: string]: MeterReading[]}) => {
    globalMeterHistory = {...newHistory};
    setMeterHistory({...newHistory});
  };

  const syncRegistrations = (newRegistrations: Registration[]) => {
    globalRegistrations = [...newRegistrations];
    setRegistrations([...newRegistrations]);
  };

  // Utility functions
  const getStudentsByRoom = (roomNumber: string) => {
    return students.filter(student => student.roomNumber === roomNumber && student.status === 'Active');
  };

  const getRoomByNumber = (roomNumber: string) => {
    return rooms.find(room => room.roomNumber === roomNumber);
  };

  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === 'Available');
  };

  const getOccupiedRooms = () => {
    return rooms.filter(room => room.status === 'Occupied');
  };

  const getBillsByRoom = (roomNumber: string) => {
    return utilityBills.filter(bill => bill.roomNumber === roomNumber);
  };

  const getUnpaidBills = () => {
    return utilityBills.filter(bill => bill.status === 'Unpaid');
  };

  const getMeterHistory = (roomNumber: string) => {
    return meterHistory[roomNumber] || [];
  };

  const getLastReading = (roomNumber: string) => {
    const history = getMeterHistory(roomNumber);
    return history.length > 0 ? history[history.length - 1] : null;
  };

  return {
    // Data
    students,
    rooms,
    utilityBills,
    meterHistory,
    registrations,
    
    // Sync functions
    syncStudents,
    syncRooms,
    syncUtilityBills,
    syncMeterHistory,
    syncRegistrations,
    
    // Utility functions
    getStudentsByRoom,
    getRoomByNumber,
    getAvailableRooms,
    getOccupiedRooms,
    getBillsByRoom,
    getUnpaidBills,
    getMeterHistory,
    getLastReading
  };
};

export default useSharedKtxData;
