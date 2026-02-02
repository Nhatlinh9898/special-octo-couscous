// Shared Data Context for KTX, Finance, Hotel Management Systems
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Common Interfaces
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
  checkOutDate?: string;
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
  lastMaintenance?: string;
  nextMaintenance?: string;
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

export interface Booking {
  id: number;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomType: string;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  specialRequests?: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
}

export interface Service {
  id: number;
  name: string;
  category: 'Food' | 'Laundry' | 'Cleaning' | 'Maintenance' | 'Transport' | 'Other';
  price: number;
  description: string;
  available: boolean;
  icon?: string;
}

export interface Transaction {
  id: number;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  referenceId?: string;
  referenceType?: 'Room' | 'Service' | 'Utility' | 'Booking' | 'Other';
  status: 'Completed' | 'Pending' | 'Failed';
  paymentMethod?: string;
  notes?: string;
}

// Context Interface
interface SharedDataContextType {
  // Students
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: number, student: Partial<Student>) => void;
  deleteStudent: (id: number) => void;
  getStudentsByRoom: (roomNumber: string) => Student[];

  // Rooms
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: number, room: Partial<Room>) => void;
  deleteRoom: (id: number) => void;
  getRoomByNumber: (roomNumber: string) => Room | undefined;
  getAvailableRooms: () => Room[];
  getOccupiedRooms: () => Room[];

  // Utility Bills
  utilityBills: UtilityBill[];
  setUtilityBills: React.Dispatch<React.SetStateAction<UtilityBill[]>>;
  addUtilityBill: (bill: Omit<UtilityBill, 'id'>) => void;
  updateUtilityBill: (id: number, bill: Partial<UtilityBill>) => void;
  deleteUtilityBill: (id: number) => void;
  getBillsByRoom: (roomNumber: string) => UtilityBill[];
  getUnpaidBills: () => UtilityBill[];

  // Meter History
  meterHistory: {[key: string]: MeterReading[]};
  setMeterHistory: React.Dispatch<React.SetStateAction<{[key: string]: MeterReading[]}>>;
  addMeterReading: (roomNumber: string, reading: MeterReading) => void;
  getMeterHistory: (roomNumber: string) => MeterReading[];
  getLastReading: (roomNumber: string) => MeterReading | null;

  // Registrations
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  addRegistration: (registration: Omit<Registration, 'id'>) => void;
  updateRegistration: (id: number, registration: Partial<Registration>) => void;
  deleteRegistration: (id: number) => void;

  // Hotel Bookings
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBooking: (id: number, booking: Partial<Booking>) => void;
  deleteBooking: (id: number) => void;
  getActiveBookings: () => Booking[];

  // Services
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: number, service: Partial<Service>) => void;
  deleteService: (id: number) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  getTransactionsByType: (type: 'Income' | 'Expense') => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];

  // Utility Functions
  calculateRoomOccupancy: (roomId: number) => number;
  calculateMonthlyRevenue: (year: number, month: number) => number;
  calculateUtilityUsage: (roomNumber: string, startDate: string, endDate: string) => { electricity: number; water: number };
}

// Initial Data
const initialStudents: Student[] = [
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

const initialRooms: Room[] = [
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

const initialMeterHistory: {[key: string]: MeterReading[]} = {
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

const initialServices: Service[] = [
  { id: 1, name: 'Giặt là', category: 'Laundry', price: 50000, description: 'Giặt ủi quần áo', available: true },
  { id: 2, name: 'Dọn phòng', category: 'Cleaning', price: 100000, description: 'Dọn dẹp phòng hàng ngày', available: true },
  { id: 3, name: 'Sửa chữa', category: 'Maintenance', price: 150000, description: 'Sửa chữa thiết bị', available: true },
  { id: 4, name: 'Bữa sáng', category: 'Food', price: 80000, description: 'Bữa sáng đầy đủ', available: true },
  { id: 5, name: 'Đưa đón sân bay', category: 'Transport', price: 500000, description: 'Dịch vụ đưa đón', available: true }
];

// Create Context
const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

// Provider Component
export const SharedDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [meterHistory, setMeterHistory] = useState<{[key: string]: MeterReading[]}>(initialMeterHistory);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Student Functions
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: Date.now() };
    setStudents(prev => [...prev, newStudent]);
    
    // Update room occupancy
    if (student.roomNumber) {
      updateRoomOccupancy(student.roomNumber);
    }
  };

  const updateStudent = (id: number, updatedStudent: Partial<Student>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updatedStudent } : student
    ));
    
    // Update room occupancy if room changed
    const student = students.find(s => s.id === id);
    if (student && updatedStudent.roomNumber && student.roomNumber !== updatedStudent.roomNumber) {
      updateRoomOccupancy(student.roomNumber);
      updateRoomOccupancy(updatedStudent.roomNumber);
    }
  };

  const deleteStudent = (id: number) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(student => student.id !== id));
    
    // Update room occupancy
    if (student?.roomNumber) {
      updateRoomOccupancy(student.roomNumber);
    }
  };

  const getStudentsByRoom = (roomNumber: string) => {
    return students.filter(student => student.roomNumber === roomNumber && student.status === 'Active');
  };

  // Room Functions
  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom = { ...room, id: Date.now() };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (id: number, updatedRoom: Partial<Room>) => {
    setRooms(prev => prev.map(room => 
      room.id === id ? { ...room, ...updatedRoom } : room
    ));
  };

  const deleteRoom = (id: number) => {
    setRooms(prev => prev.filter(room => room.id !== id));
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

  const updateRoomOccupancy = (roomNumber: string) => {
    const occupancy = getStudentsByRoom(roomNumber).length;
    const room = getRoomByNumber(roomNumber);
    if (room) {
      updateRoom(room.id, { 
        currentOccupancy: occupancy,
        status: occupancy > 0 ? 'Occupied' : 'Available'
      });
    }
  };

  // Utility Bill Functions
  const addUtilityBill = (bill: Omit<UtilityBill, 'id'>) => {
    const newBill = { ...bill, id: Date.now() };
    setUtilityBills(prev => [...prev, newBill]);
    
    // Add transaction
    addTransaction({
      type: 'Income',
      category: 'Utility Bill',
      description: `Hóa đơn điện nước phòng ${bill.roomNumber} - ${bill.month}/${bill.year}`,
      amount: bill.totalAmount,
      date: new Date().toISOString().split('T')[0],
      referenceId: newBill.id.toString(),
      referenceType: 'Utility',
      status: bill.status === 'Paid' ? 'Completed' : 'Pending',
      paymentMethod: bill.paymentMethod
    });
  };

  const updateUtilityBill = (id: number, updatedBill: Partial<UtilityBill>) => {
    setUtilityBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, ...updatedBill } : bill
    ));
  };

  const deleteUtilityBill = (id: number) => {
    setUtilityBills(prev => prev.filter(bill => bill.id !== id));
  };

  const getBillsByRoom = (roomNumber: string) => {
    return utilityBills.filter(bill => bill.roomNumber === roomNumber);
  };

  const getUnpaidBills = () => {
    return utilityBills.filter(bill => bill.status === 'Unpaid');
  };

  // Meter History Functions
  const addMeterReading = (roomNumber: string, reading: MeterReading) => {
    setMeterHistory(prev => ({
      ...prev,
      [roomNumber]: [...(prev[roomNumber] || []), reading]
    }));
  };

  const getMeterHistory = (roomNumber: string) => {
    return meterHistory[roomNumber] || [];
  };

  const getLastReading = (roomNumber: string) => {
    const history = getMeterHistory(roomNumber);
    return history.length > 0 ? history[history.length - 1] : null;
  };

  // Registration Functions
  const addRegistration = (registration: Omit<Registration, 'id'>) => {
    const newRegistration = { ...registration, id: Date.now() };
    setRegistrations(prev => [...prev, newRegistration]);
  };

  const updateRegistration = (id: number, updatedRegistration: Partial<Registration>) => {
    setRegistrations(prev => prev.map(registration => 
      registration.id === id ? { ...registration, ...updatedRegistration } : registration
    ));
  };

  const deleteRegistration = (id: number) => {
    setRegistrations(prev => prev.filter(registration => registration.id !== id));
  };

  // Booking Functions
  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = { ...booking, id: Date.now() };
    setBookings(prev => [...prev, newBooking]);
    
    // Add transaction
    addTransaction({
      type: 'Income',
      category: 'Hotel Booking',
      description: `Đặt phòng ${booking.roomNumber} - ${booking.guestName}`,
      amount: booking.totalPrice,
      date: booking.checkInDate,
      referenceId: newBooking.id.toString(),
      referenceType: 'Booking',
      status: booking.paymentStatus === 'Paid' ? 'Completed' : 'Pending'
    });
  };

  const updateBooking = (id: number, updatedBooking: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, ...updatedBooking } : booking
    ));
  };

  const deleteBooking = (id: number) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  const getActiveBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.status === 'Confirmed' && 
      booking.checkInDate <= today && 
      booking.checkOutDate >= today
    );
  };

  // Service Functions
  const addService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: Date.now() };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: number, updatedService: Partial<Service>) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...updatedService } : service
    ));
  };

  const deleteService = (id: number) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  // Transaction Functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: number, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
    ));
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getTransactionsByType = (type: 'Income' | 'Expense') => {
    return transactions.filter(transaction => transaction.type === type);
  };

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter(transaction => 
      transaction.date >= startDate && transaction.date <= endDate
    );
  };

  // Utility Functions
  const calculateRoomOccupancy = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    return room.currentOccupancy;
  };

  const calculateMonthlyRevenue = (year: number, month: number) => {
    const monthStr = month.toString().padStart(2, '0');
    const monthlyTransactions = transactions.filter(t => 
      t.type === 'Income' && 
      t.date.startsWith(`${year}-${monthStr}`)
    );
    return monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateUtilityUsage = (roomNumber: string, startDate: string, endDate: string) => {
    const history = getMeterHistory(roomNumber);
    const startReading = history.find(r => r.date >= startDate);
    const endReading = history.find(r => r.date <= endDate);
    
    if (!startReading || !endReading) {
      return { electricity: 0, water: 0 };
    }
    
    return {
      electricity: endReading.electricityReading - startReading.electricityReading,
      water: endReading.waterReading - startReading.waterReading
    };
  };

  // Initialize room occupancy
  React.useEffect(() => {
    rooms.forEach(room => {
      updateRoomOccupancy(room.roomNumber);
    });
  }, []);

  const value: SharedDataContextType = {
    // Students
    students,
    setStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByRoom,

    // Rooms
    rooms,
    setRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomByNumber,
    getAvailableRooms,
    getOccupiedRooms,

    // Utility Bills
    utilityBills,
    setUtilityBills,
    addUtilityBill,
    updateUtilityBill,
    deleteUtilityBill,
    getBillsByRoom,
    getUnpaidBills,

    // Meter History
    meterHistory,
    setMeterHistory,
    addMeterReading,
    getMeterHistory,
    getLastReading,

    // Registrations
    registrations,
    setRegistrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,

    // Bookings
    bookings,
    setBookings,
    addBooking,
    updateBooking,
    deleteBooking,
    getActiveBookings,

    // Services
    services,
    setServices,
    addService,
    updateService,
    deleteService,

    // Transactions
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByType,
    getTransactionsByDateRange,

    // Utility Functions
    calculateRoomOccupancy,
    calculateMonthlyRevenue,
    calculateUtilityUsage
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};

// Hook to use the context
export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
};

export default SharedDataContext;
