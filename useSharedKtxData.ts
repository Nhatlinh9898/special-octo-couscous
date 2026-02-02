// Simple Shared Data Hook for KTX System
import { useState, useEffect } from 'react';
import { completeRoomData, completeMeterHistory, completeStudentData, completeUtilityBills } from './completeRoomData';

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

// Initialize data
const initializeData = () => {
  if (globalStudents.length === 0) {
    console.log('🏠 Initializing complete KTX and Hotel data...');
    
    // Use complete data from completeRoomData.ts
    globalStudents = completeStudentData;
    globalRooms = completeRoomData.map(room => ({
      ...room,
      students: [] // Will be populated separately
    }));
    globalMeterHistory = completeMeterHistory;
    globalUtilityBills = completeUtilityBills;
    
    console.log('✅ Data initialized:', {
      rooms: globalRooms.length,
      students: globalStudents.length,
      bills: globalUtilityBills.length,
      meterHistory: Object.keys(globalMeterHistory).length
    });
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
