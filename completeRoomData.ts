// Complete Room Data for KTX and Hotel Management
export interface CompleteRoom {
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
  electricityRate: number;
  waterRate: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  description?: string;
}

// Generate complete room data
export const generateCompleteRooms = (): CompleteRoom[] => {
  const rooms: CompleteRoom[] = [];
  
  // KTX Area A - 15 rooms (3 floors x 5 rooms)
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 5; room++) {
      const roomNumber = `A0${floor}${room.toString().padStart(2, '0')}`;
      const id = floor * 1000 + room;
      
      rooms.push({
        id,
        roomNumber,
        area: 'A',
        floor,
        capacity: 4,
        currentOccupancy: Math.floor(Math.random() * 5),
        type: 'Standard',
        status: Math.random() > 0.3 ? 'Occupied' : 'Available',
        price: 1500000,
        facilities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Giường', 'Bàn học', 'Tủ quần áo'],
        electricityRate: 3000,
        waterRate: 25000,
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        description: `Phòng tiêu chuẩn 4 người - Tầng ${floor}`
      });
    }
  }
  
  // KTX Area B - 15 rooms (3 floors x 5 rooms)
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 5; room++) {
      const roomNumber = `B0${floor}${room.toString().padStart(2, '0')}`;
      const id = 4000 + floor * 1000 + room;
      const roomType = floor <= 2 ? 'Premium' : 'VIP';
      const capacity = roomType === 'Premium' ? 3 : 2;
      const price = roomType === 'Premium' ? 2000000 : 3000000;
      
      rooms.push({
        id,
        roomNumber,
        area: 'B',
        floor,
        capacity,
        currentOccupancy: Math.floor(Math.random() * (capacity + 1)),
        type: roomType,
        status: Math.random() > 0.2 ? 'Occupied' : 'Available',
        price,
        facilities: roomType === 'Premium' 
          ? ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Giường', 'Bàn học', 'Tủ quần áo', 'Máy giặt', 'Microwave']
          : ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Nóng lạnh', 'Giường', 'Bàn học', 'Tủ quần áo', 'Máy giặt', 'Microwave', 'Smart TV', 'Minibar', 'Balcony'],
        electricityRate: 3000,
        waterRate: 25000,
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-04-10',
        description: `Phòng ${roomType.toLowerCase()} ${capacity} người - Tầng ${floor}`
      });
    }
  }
  
  // Hotel Area - 15 rooms (3 floors x 5 rooms)
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 5; room++) {
      const roomNumber = `H${floor}${room.toString().padStart(2, '0')}`;
      const id = 7000 + floor * 1000 + room;
      const roomType = floor === 1 ? 'Deluxe' : floor === 2 ? 'Suite' : 'Suite';
      const capacity = floor === 3 ? 4 : 2;
      const price = floor === 1 ? 800000 : floor === 2 ? 1200000 : 2500000;
      
      rooms.push({
        id,
        roomNumber,
        area: 'Hotel',
        floor,
        capacity,
        currentOccupancy: 0, // Hotel rooms start empty
        type: roomType,
        status: 'Available',
        price,
        facilities: floor === 1 
          ? ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Smart TV', 'Minibar', 'Room Service', 'Safe']
          : floor === 2
          ? ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Smart TV', 'Minibar', 'Room Service', 'Safe', 'Jacuzzi', 'Living Room']
          : ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Smart TV', 'Minibar', 'Room Service', 'Safe', 'Jacuzzi', 'Living Room', 'Butler Service', 'Private Terrace'],
        electricityRate: 4000,
        waterRate: 30000,
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-02-20',
        description: `Phòng ${roomType} ${capacity} người - Tầng ${floor}`
      });
    }
  }
  
  return rooms;
};

// Generate meter history for all rooms
export const generateCompleteMeterHistory = (rooms: CompleteRoom[]) => {
  const history: {[key: string]: Array<{
    date: string;
    electricityReading: number;
    waterReading: number;
    notes?: string;
  }>} = {};
  
  rooms.forEach(room => {
    const baseElectricity = 1000 + (room.id * 50);
    const baseWater = 200 + (room.id * 10);
    
    history[room.roomNumber] = [
      {
        date: '2024-01-01',
        electricityReading: baseElectricity,
        waterReading: baseWater,
        notes: 'Đầu kỳ'
      },
      {
        date: '2024-01-15',
        electricityReading: baseElectricity + Math.floor(Math.random() * 100) + 50,
        waterReading: baseWater + Math.floor(Math.random() * 15) + 5,
        notes: 'Giữa kỳ'
      },
      {
        date: '2024-02-01',
        electricityReading: baseElectricity + Math.floor(Math.random() * 200) + 100,
        waterReading: baseWater + Math.floor(Math.random() * 30) + 10,
        notes: 'Cuối kỳ'
      }
    ];
  });
  
  return history;
};

// Generate complete student data
export const generateCompleteStudents = (rooms: CompleteRoom[]) => {
  const students = [];
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied');
  
  occupiedRooms.forEach((room, index) => {
    for (let i = 0; i < room.currentOccupancy; i++) {
      students.push({
        id: index * room.currentOccupancy + i + 1,
        code: `SV2024${(index * room.currentOccupancy + i + 1).toString().padStart(4, '0')}`,
        fullName: `Sinh viên ${index + 1}-${i + 1}`,
        classId: (index % 5) + 1,
        gender: Math.random() > 0.5 ? 'Nam' as const : 'Nữ' as const,
        phone: `09${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `student${index * room.currentOccupancy + i + 1}@university.edu.vn`,
        address: 'Hà Nội',
        idCard: `${(index * room.currentOccupancy + i + 1).toString().padStart(12, '0')}`,
        roomNumber: room.roomNumber,
        checkInDate: '2024-01-01',
        status: 'Active' as const
      });
    }
  });
  
  return students;
};

// Generate utility bills
export const generateCompleteUtilityBills = (rooms: CompleteRoom[], history: {[key: string]: any[]}) => {
  const bills = [];
  
  rooms.forEach(room => {
    const roomHistory = history[room.roomNumber];
    if (roomHistory && roomHistory.length >= 2) {
      const lastReading = roomHistory[roomHistory.length - 1];
      const prevReading = roomHistory[roomHistory.length - 2];
      
      const electricityUsage = lastReading.electricityReading - prevReading.electricityReading;
      const waterUsage = lastReading.waterReading - prevReading.waterReading;
      
      bills.push({
        id: room.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        month: '01',
        year: 2024,
        electricity: Math.max(0, electricityUsage),
        water: Math.max(0, waterUsage),
        electricityCost: room.electricityRate,
        waterCost: room.waterRate,
        totalAmount: Math.max(0, electricityUsage * room.electricityRate + waterUsage * room.waterRate),
        status: Math.random() > 0.3 ? 'Paid' : 'Unpaid',
        dueDate: '2024-01-31'
      });
    }
  });
  
  return bills;
};

// Export complete data sets
export const completeRoomData = generateCompleteRooms();
export const completeMeterHistory = generateCompleteMeterHistory(completeRoomData);
export const completeStudentData = generateCompleteStudents(completeRoomData);
export const completeUtilityBills = generateCompleteUtilityBills(completeRoomData, completeMeterHistory);

// Data statistics
export const dataStatistics = {
  totalRooms: completeRoomData.length,
  ktxRooms: completeRoomData.filter(r => r.area !== 'Hotel').length,
  hotelRooms: completeRoomData.filter(r => r.area === 'Hotel').length,
  occupiedRooms: completeRoomData.filter(r => r.status === 'Occupied').length,
  availableRooms: completeRoomData.filter(r => r.status === 'Available').length,
  totalStudents: completeStudentData.length,
  totalBills: completeUtilityBills.length,
  paidBills: completeUtilityBills.filter(b => b.status === 'Paid').length,
  unpaidBills: completeUtilityBills.filter(b => b.status === 'Unpaid').length
};

console.log('📊 Complete Data Generated:', dataStatistics);
