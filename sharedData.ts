// Shared Data for KTX, Finance, Hotel Management Systems
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

// Shared Initial Data
export const initialStudents: Student[] = [
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

export const initialRooms: Room[] = [
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
  },
  {
    id: 5,
    roomNumber: 'A0103',
    area: 'A',
    floor: 1,
    capacity: 4,
    currentOccupancy: 0,
    type: 'Standard',
    status: 'Available',
    price: 1500000,
    facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh'],
    students: [],
    electricityRate: 3000,
    waterRate: 25000
  },
  {
    id: 6,
    roomNumber: 'A0104',
    area: 'A',
    floor: 1,
    capacity: 4,
    currentOccupancy: 0,
    type: 'Standard',
    status: 'Available',
    price: 1500000,
    facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh'],
    students: [],
    electricityRate: 3000,
    waterRate: 25000
  },
  {
    id: 7,
    roomNumber: 'B0102',
    area: 'B',
    floor: 1,
    capacity: 3,
    currentOccupancy: 0,
    type: 'Premium',
    status: 'Available',
    price: 2000000,
    facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Máy giặt'],
    students: [],
    electricityRate: 3000,
    waterRate: 25000
  },
  {
    id: 8,
    roomNumber: 'H002',
    area: 'Hotel',
    floor: 1,
    capacity: 2,
    currentOccupancy: 0,
    type: 'Suite',
    status: 'Available',
    price: 800000,
    facilities: ['WiFi', 'Điều hòa', 'Mini bar', 'Room service', 'Jacuzzi'],
    students: [],
    electricityRate: 4000,
    waterRate: 30000
  }
];

export const initialMeterHistory: {[key: string]: MeterReading[]} = {
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
  ],
  'A0103': [
    { date: '2024-01-01', electricityReading: 1100, waterReading: 220, notes: 'Đầu kỳ' },
    { date: '2024-01-15', electricityReading: 1235, waterReading: 235, notes: 'Giữa kỳ' },
    { date: '2024-02-01', electricityReading: 1370, waterReading: 250, notes: 'Cuối kỳ' }
  ],
  'A0104': [
    { date: '2024-01-01', electricityReading: 900, waterReading: 170, notes: 'Đầu kỳ' },
    { date: '2024-01-15', electricityReading: 998, waterReading: 178, notes: 'Giữa kỳ' },
    { date: '2024-02-01', electricityReading: 1098, waterReading: 188, notes: 'Cuối kỳ' }
  ],
  'B0102': [
    { date: '2024-01-01', electricityReading: 800, waterReading: 150, notes: 'Đầu kỳ' },
    { date: '2024-01-15', electricityReading: 888, waterReading: 158, notes: 'Giữa kỳ' },
    { date: '2024-02-01', electricityReading: 978, waterReading: 168, notes: 'Cuối kỳ' }
  ]
};

export const initialServices: Service[] = [
  { id: 1, name: 'Giặt là', category: 'Laundry', price: 50000, description: 'Giặt ủi quần áo', available: true },
  { id: 2, name: 'Dọn phòng', category: 'Cleaning', price: 100000, description: 'Dọn dẹp phòng hàng ngày', available: true },
  { id: 3, name: 'Sửa chữa', category: 'Maintenance', price: 150000, description: 'Sửa chữa thiết bị', available: true },
  { id: 4, name: 'Bữa sáng', category: 'Food', price: 80000, description: 'Bữa sáng đầy đủ', available: true },
  { id: 5, name: 'Đưa đón sân bay', category: 'Transport', price: 500000, description: 'Dịch vụ đưa đón', available: true },
  { id: 6, name: 'Spa & Massage', category: 'Other', price: 300000, description: 'Dịch vụ spa thư giãn', available: true },
  { id: 7, name: 'Thuê xe', category: 'Transport', price: 200000, description: 'Thuê xe theo ngày', available: true },
  { id: 8, name: 'Hướng dẫn viên', category: 'Other', price: 150000, description: 'Tour du lịch', available: true }
];

export const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: 'Income',
    category: 'Room Rental',
    description: 'Tiền thuê phòng A0101 - Tháng 1/2024',
    amount: 1500000,
    date: '2024-01-01',
    referenceId: '1',
    referenceType: 'Room',
    status: 'Completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 2,
    type: 'Income',
    category: 'Room Rental',
    description: 'Tiền thuê phòng A0102 - Tháng 1/2024',
    amount: 1500000,
    date: '2024-01-01',
    referenceId: '2',
    referenceType: 'Room',
    status: 'Completed',
    paymentMethod: 'Cash'
  },
  {
    id: 3,
    type: 'Income',
    category: 'Room Rental',
    description: 'Tiền thuê phòng B0101 - Tháng 1/2024',
    amount: 2000000,
    date: '2024-01-01',
    referenceId: '3',
    referenceType: 'Room',
    status: 'Completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 4,
    type: 'Expense',
    category: 'Maintenance',
    description: 'Sửa chữa điều hòa phòng A0101',
    amount: 500000,
    date: '2024-01-15',
    referenceType: 'Other',
    status: 'Completed',
    paymentMethod: 'Cash'
  },
  {
    id: 5,
    type: 'Income',
    category: 'Service',
    description: 'Dịch vụ giặt là - SV2024001',
    amount: 50000,
    date: '2024-01-20',
    referenceId: '1',
    referenceType: 'Service',
    status: 'Completed',
    paymentMethod: 'Cash'
  }
];

export const initialBookings: Booking[] = [
  {
    id: 1,
    roomNumber: 'H001',
    guestName: 'John Smith',
    guestPhone: '+1234567890',
    guestEmail: 'john.smith@email.com',
    checkInDate: '2024-02-01',
    checkOutDate: '2024-02-03',
    adults: 2,
    children: 0,
    roomType: 'Deluxe',
    totalPrice: 1000000,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    id: 2,
    roomNumber: 'H002',
    guestName: 'Sarah Johnson',
    guestPhone: '+0987654321',
    guestEmail: 'sarah.j@email.com',
    checkInDate: '2024-02-05',
    checkOutDate: '2024-02-07',
    adults: 2,
    children: 1,
    roomType: 'Suite',
    totalPrice: 1600000,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  }
];

// Utility Functions
export const getStudentsByRoom = (students: Student[], roomNumber: string) => {
  return students.filter(student => student.roomNumber === roomNumber && student.status === 'Active');
};

export const getRoomByNumber = (rooms: Room[], roomNumber: string) => {
  return rooms.find(room => room.roomNumber === roomNumber);
};

export const getAvailableRooms = (rooms: Room[]) => {
  return rooms.filter(room => room.status === 'Available');
};

export const getOccupiedRooms = (rooms: Room[]) => {
  return rooms.filter(room => room.status === 'Occupied');
};

export const getBillsByRoom = (bills: UtilityBill[], roomNumber: string) => {
  return bills.filter(bill => bill.roomNumber === roomNumber);
};

export const getUnpaidBills = (bills: UtilityBill[]) => {
  return bills.filter(bill => bill.status === 'Unpaid');
};

export const getMeterHistory = (history: {[key: string]: MeterReading[]}, roomNumber: string) => {
  return history[roomNumber] || [];
};

export const getLastReading = (history: {[key: string]: MeterReading[]}, roomNumber: string) => {
  const roomHistory = getMeterHistory(history, roomNumber);
  return roomHistory.length > 0 ? roomHistory[roomHistory.length - 1] : null;
};

export const calculateRoomOccupancy = (room: Room) => {
  return room.currentOccupancy;
};

export const calculateMonthlyRevenue = (transactions: Transaction[], year: number, month: number) => {
  const monthStr = month.toString().padStart(2, '0');
  const monthlyTransactions = transactions.filter(t => 
    t.type === 'Income' && 
    t.date.startsWith(`${year}-${monthStr}`)
  );
  return monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
};

export const calculateUtilityUsage = (
  history: {[key: string]: MeterReading[]}, 
  roomNumber: string, 
  startDate: string, 
  endDate: string
) => {
  const roomHistory = getMeterHistory(history, roomNumber);
  const startReading = roomHistory.find(r => r.date >= startDate);
  const endReading = roomHistory.find(r => r.date <= endDate);
  
  if (!startReading || !endReading) {
    return { electricity: 0, water: 0 };
  }
  
  return {
    electricity: endReading.electricityReading - startReading.electricityReading,
    water: endReading.waterReading - startReading.waterReading
  };
};
