import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail, 
  Bell,
  Handshake,
  CheckCircle,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { Button, Modal } from './components';
import { useSharedKtxData } from './useSharedKtxData';

interface FinanceRoom {
  id: number;
  number: string;
  type: 'KTX Standard' | 'KTX Premium' | 'Hotel Standard' | 'Hotel Deluxe' | 'Hotel Suite';
  building: 'KTX-A' | 'KTX-B' | 'Hotel';
  floor: number;
  capacity: number;
  monthlyRent: number;
  electricityRate: number;
  waterRate: number;
  currentOccupancy: number;
  maxOccupancy: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning' | 'Reserved';
  currentTenants: string[];
  pendingMoveOuts: string[];
  pendingMoveIns: string[];
  lastUpdated: string;
}

interface FinanceTenant {
  id: number;
  name: string;
  type: 'Student' | 'Teacher' | 'Visitor';
  roomNumber: string;
  building: 'KTX-A' | 'KTX-B' | 'Hotel';
  email: string;
  phone: string;
  balance: number;
  status: 'Active' | 'CheckedOut';
}

interface FinanceTransaction {
  id: number;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  referenceId?: string;
  referenceType?: string;
}

const IntegratedFinanceView = () => {
  // Use shared data
  const {
    rooms,
    students,
    utilityBills,
    getStudentsByRoom,
    getAvailableRooms,
    getOccupiedRooms,
    getBillsByRoom,
    getUnpaidBills
  } = useSharedKtxData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [financeRooms, setFinanceRooms] = useState<FinanceRoom[]>([]);
  const [financeTenants, setFinanceTenants] = useState<FinanceTenant[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Initialize data with shared data
  useEffect(() => {
    // Convert shared rooms to finance format
    const convertedRooms: FinanceRoom[] = rooms.map(room => ({
      id: room.id,
      number: room.roomNumber,
      type: room.area === 'Hotel' 
        ? (room.type === 'Deluxe' ? 'Hotel Deluxe' : room.type === 'Suite' ? 'Hotel Suite' : 'Hotel Standard')
        : (room.type === 'Standard' ? 'KTX Standard' : 'KTX Premium'),
      building: room.area === 'Hotel' ? 'Hotel' : `KTX-${room.area}` as 'KTX-A' | 'KTX-B' | 'Hotel',
      floor: room.floor,
      capacity: room.capacity,
      monthlyRent: room.price,
      electricityRate: room.electricityRate || 3000,
      waterRate: room.waterRate || 25000,
      currentOccupancy: room.currentOccupancy,
      maxOccupancy: room.capacity,
      status: room.status,
      currentTenants: getStudentsByRoom(room.roomNumber).map(s => s.fullName),
      pendingMoveOuts: [],
      pendingMoveIns: [],
      lastUpdated: new Date().toISOString()
    }));

    // Convert shared students to finance tenants
    const convertedTenants: FinanceTenant[] = students.map(student => ({
      id: student.id,
      name: student.fullName,
      type: 'Student' as const,
      roomNumber: student.roomNumber || '',
      building: student.roomNumber?.startsWith('H') ? 'Hotel' : 
               student.roomNumber?.startsWith('A') ? 'KTX-A' : 'KTX-B',
      email: student.email,
      phone: student.phone,
      balance: Math.floor(Math.random() * 1000000) - 500000, // Random balance
      status: student.status === 'Active' ? 'Active' : 'CheckedOut'
    }));

    // Convert utility bills to finance transactions
    const convertedTransactions: FinanceTransaction[] = utilityBills.map(bill => ({
      id: bill.id,
      type: 'Income' as const,
      category: 'Utility Bill',
      description: `Hóa đơn điện nước phòng ${bill.roomNumber} - ${bill.month}/${bill.year}`,
      amount: bill.totalAmount,
      date: bill.dueDate,
      status: bill.status === 'Paid' ? 'Completed' : 'Pending',
      referenceId: bill.id.toString(),
      referenceType: 'Utility'
    }));

    setFinanceRooms(convertedRooms);
    setFinanceTenants(convertedTenants);
    setFinanceTransactions(convertedTransactions);
  }, [rooms, students, utilityBills]);

  // Filter rooms
  const filteredRooms = financeRooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.currentTenants.some(tenant => tenant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBuilding = filterBuilding === 'all' || room.building === filterBuilding;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  // Filter tenants
  const filteredTenants = financeTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = filterBuilding === 'all' || tenant.building === filterBuilding;
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  // Filter transactions
  const filteredTransactions = financeTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterBuilding === 'all' || transaction.category === filterBuilding;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalRooms = financeRooms.length;
  const occupiedRooms = financeRooms.filter(r => r.status === 'Occupied').length;
  const availableRooms = financeRooms.filter(r => r.status === 'Available').length;
  const maintenanceRooms = financeRooms.filter(r => r.status === 'Maintenance').length;
  const reservedRooms = financeRooms.filter(r => r.status === 'Reserved').length;
  const cleaningRooms = financeRooms.filter(r => r.status === 'Cleaning').length;

  const totalTenants = financeTenants.length;
  const activeTenants = financeTenants.filter(t => t.status === 'Active').length;
  const totalRevenue = financeTransactions
    .filter(t => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = financeTransactions
    .filter(t => t.type === 'Expense' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integrated Finance Management</h1>
              <p className="text-gray-600 mt-1">Quản lý tài chính tích hợp cho KTX và Hotel</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Filter size={16} />
                Filters
              </Button>
              <Button>
                <Plus size={16} />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
                <p className="text-2xl font-bold text-green-600">{occupiedRooms}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString()}đ</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-purple-600">{activeTenants}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Room Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl font-bold text-green-600">{availableRooms}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-xl font-bold text-blue-600">{occupiedRooms}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-xl font-bold text-orange-600">{maintenanceRooms}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cleaning</p>
              <p className="text-xl font-bold text-yellow-600">{cleaningRooms}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-xl font-bold text-purple-600">{reservedRooms}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search rooms, tenants, transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Buildings</option>
              <option value="KTX-A">KTX-A</option>
              <option value="KTX-B">KTX-B</option>
              <option value="Hotel">Hotel</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rooms ({filteredRooms.length})
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tenants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tenants ({filteredTenants.length})
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions ({filteredTransactions.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'rooms' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Building
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Tenants
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.building}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            room.status === 'Available' ? 'bg-green-100 text-green-800' :
                            room.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                            room.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                            room.status === 'Cleaning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.currentOccupancy}/{room.maxOccupancy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.monthlyRent.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            {room.currentTenants.join(', ') || 'No tenants'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tenants' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Building
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tenant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.roomNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.building}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.balance.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{tenant.email}</div>
                            <div>{tenant.phone}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.amount.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedFinanceView;
