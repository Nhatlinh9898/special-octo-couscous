import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Bed, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Calculator, 
  BarChart3, 
  PieChart, 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  MapPin,
  Star,
  Phone,
  Mail,
  Settings,
  Bell,
  Handshake
} from 'lucide-react';
import { Button, Modal } from './components';
import { useSharedKtxData } from './useSharedKtxData';

// Interfaces
interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  idCard: string;
  nationality: string;
  checkIn: string;
  checkOut: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  totalAmount: number;
  status: 'Active' | 'CheckedOut' | 'Reserved';
  specialRequests: string;
}

interface Room {
  id: number;
  number: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
  amenities: string[];
  lastCleaned: string;
  nextMaintenance: string;
}

interface Transaction {
  id: number;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdBy: string;
  approvedBy?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalAmount: number;
  status: 'Active' | 'Inactive' | 'Blacklisted';
}

interface PurchaseOrder {
  id: number;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  items: PurchaseItem[];
  totalAmount: number;
  notes: string;
  requestedBy: string;
  approvedBy?: string;
}

interface PurchaseItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications: string;
}

interface Inventory {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
}

interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  roomRevenue: number;
  serviceRevenue: number;
  foodRevenue: number;
  otherRevenue: number;
  staffCosts: number;
  utilitiesCosts: number;
  maintenanceCosts: number;
  suppliesCosts: number;
  otherCosts: number;
  occupancyRate: number;
  averageDailyRate: number;
  revPAR: number;
}

const HotelManagementView = () => {
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

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Initialize mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Generate 100 rooms
    const mockRooms: Room[] = [];
    const roomTypes = [
      { type: 'Standard Single', capacity: 1, price: 800000 },
      { type: 'Standard Double', capacity: 2, price: 1200000 },
      { type: 'Deluxe', capacity: 2, price: 1800000 },
      { type: 'Suite', capacity: 4, price: 3500000 },
      { type: 'Presidential', capacity: 6, price: 8000000 }
    ];

    for (let i = 1; i <= 100; i++) {
      const floor = Math.ceil(i / 10);
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      mockRooms.push({
        id: i,
        number: `${floor.toString().padStart(2, '0')}${(i % 10 || 10).toString().padStart(2, '0')}`,
        type: roomType.type,
        floor,
        capacity: roomType.capacity,
        pricePerNight: roomType.price,
        status: Math.random() > 0.3 ? 'Occupied' : Math.random() > 0.5 ? 'Available' : 'Cleaning',
        amenities: ['TV', 'AC', 'Mini Bar', 'WiFi', 'Safe'],
        lastCleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setRooms(mockRooms);

    // Mock guests
    const mockGuests: Guest[] = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 234-567-8900',
        address: '123 Main St, New York, USA',
        idCard: 'AB123456789',
        nationality: 'American',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        roomId: 1,
        roomNumber: '0101',
        roomType: 'Deluxe',
        totalAmount: 5400000,
        status: 'Active',
        specialRequests: 'Late check-in, Extra pillows'
      }
    ];
    setGuests(mockGuests);

    // Mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: 1,
        type: 'Income',
        category: 'Room Booking',
        description: 'Deluxe Room - 3 nights',
        amount: 5400000,
        date: '2024-01-15',
        reference: 'INV-2024-001',
        paymentMethod: 'Credit Card',
        status: 'Completed',
        createdBy: 'Reception',
        approvedBy: 'Manager'
      },
      {
        id: 2,
        type: 'Expense',
        category: 'Supplies',
        description: 'Cleaning supplies purchase',
        amount: 2500000,
        date: '2024-01-14',
        reference: 'PO-2024-001',
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        createdBy: 'Housekeeping'
      }
    ];
    setTransactions(mockTransactions);

    // Mock suppliers
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: 'CleanPro Supplies',
        contact: 'Mr. Johnson',
        phone: '090-123-4567',
        email: 'info@cleanpro.com',
        address: '456 Supply St, District 1',
        taxCode: 'TX001234567',
        category: 'Cleaning Supplies',
        rating: 4.5,
        totalOrders: 45,
        totalAmount: 125000000,
        status: 'Active'
      },
      {
        id: 2,
        name: 'FoodTech Solutions',
        contact: 'Ms. Chen',
        phone: '091-234-5678',
        email: 'sales@foodtech.vn',
        address: '789 Food Ave, District 3',
        taxCode: 'TX002345678',
        category: 'Food & Beverage',
        rating: 4.8,
        totalOrders: 32,
        totalAmount: 89000000,
        status: 'Active'
      }
    ];
    setSuppliers(mockSuppliers);

    // Mock inventory
    const mockInventory: Inventory[] = [
      {
        id: 1,
        name: 'Bed Sheets',
        category: 'Linens',
        quantity: 500,
        unit: 'Set',
        unitPrice: 150000,
        totalValue: 75000000,
        minStock: 100,
        maxStock: 800,
        location: 'Main Storage',
        supplier: 'CleanPro Supplies',
        lastRestocked: '2024-01-10',
        status: 'In Stock'
      },
      {
        id: 2,
        name: 'Shampoo',
        category: 'Toiletries',
        quantity: 200,
        unit: 'Bottle',
        unitPrice: 25000,
        totalValue: 5000000,
        minStock: 50,
        maxStock: 500,
        location: 'Housekeeping',
        supplier: 'CleanPro Supplies',
        lastRestocked: '2024-01-12',
        expiryDate: '2025-12-31',
        status: 'In Stock'
      }
    ];
    setInventory(mockInventory);

    // Mock financial reports
    const mockReports: FinancialReport[] = [
      {
        period: '2024-01',
        totalRevenue: 850000000,
        totalExpenses: 420000000,
        netProfit: 430000000,
        roomRevenue: 680000000,
        serviceRevenue: 120000000,
        foodRevenue: 50000000,
        otherRevenue: 0,
        staffCosts: 250000000,
        utilitiesCosts: 80000000,
        maintenanceCosts: 50000000,
        suppliesCosts: 40000000,
        otherCosts: 0,
        occupancyRate: 75.5,
        averageDailyRate: 1850000,
        revPAR: 1396750
      }
    ];
    setFinancialReports(mockReports);
  };

  const getFinancialStats = () => {
    const currentMonth = financialReports[0];
    if (!currentMonth) return { revenue: 0, expenses: 0, profit: 0, occupancy: 0 };
    
    return {
      revenue: currentMonth.totalRevenue,
      expenses: currentMonth.totalExpenses,
      profit: currentMonth.netProfit,
      occupancy: currentMonth.occupancyRate
    };
  };

  const stats = getFinancialStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hotel Management System</h2>
          <p className="text-gray-500">Professional Hotel Operations & Financial Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowReportModal(true)}>
            <BarChart3 size={20}/> Financial Report
          </Button>
          <Button variant="secondary" onClick={() => setShowTransactionModal(true)}>
            <Plus size={20}/> Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {(stats.revenue / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {(stats.expenses / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats.profit / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.occupancy.toFixed(1)}%
              </p>
            </div>
            <Bed className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Building2 },
            { id: 'rooms', label: 'Room Management', icon: Bed },
            { id: 'guests', label: 'Guest Management', icon: Users },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'suppliers', label: 'Suppliers', icon: ShoppingCart },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Hotel Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Room Status Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Available</span>
                    <span className="text-green-600 font-bold">
                      {rooms.filter(r => r.status === 'Available').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Occupied</span>
                    <span className="text-blue-600 font-bold">
                      {rooms.filter(r => r.status === 'Occupied').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Cleaning</span>
                    <span className="text-yellow-600 font-bold">
                      {rooms.filter(r => r.status === 'Cleaning').length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {transactions.slice(0, 3).map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'Income' ? '+' : '-'}
                        {(transaction.amount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Room Management</h3>
              <Button onClick={() => setShowBookingModal(true)}>
                <Plus size={20}/> New Booking
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Room</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Floor</th>
                    <th className="text-left py-3 px-4">Capacity</th>
                    <th className="text-left py-3 px-4">Price/Night</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.slice(0, 10).map(room => (
                    <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{room.number}</td>
                      <td className="py-3 px-4">{room.type}</td>
                      <td className="py-3 px-4">{room.floor}</td>
                      <td className="py-3 px-4">{room.capacity}</td>
                      <td className="py-3 px-4">{room.pricePerNight.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.status === 'Available' ? 'bg-green-100 text-green-800' :
                          room.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                          room.status === 'Cleaning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit size={16} />
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

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Financial Transactions</h3>
              <Button onClick={() => setShowTransactionModal(true)}>
                <Plus size={20}/> Add Transaction
              </Button>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transaction.category}</td>
                      <td className="py-3 px-4">{transaction.description}</td>
                      <td className="py-3 px-4 font-medium">
                        <span className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'Income' ? '+' : '-'}
                          {transaction.amount.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit size={16} />
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

        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Supplier Management</h3>
              <Button onClick={() => setShowSupplierModal(true)}>
                <Plus size={20}/> Add Supplier
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{supplier.name}</h4>
                      <p className="text-sm text-gray-600">{supplier.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Contact:</strong> {supplier.contact}</p>
                    <p><strong>Phone:</strong> {supplier.phone}</p>
                    <p><strong>Email:</strong> {supplier.email}</p>
                    <p><strong>Orders:</strong> {supplier.totalOrders} ({(supplier.totalAmount / 1000000).toFixed(1)}M VNĐ)</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className={`px-2 py-1 rounded text-xs ${
                      supplier.status === 'Active' ? 'bg-green-100 text-green-800' :
                      supplier.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {supplier.status}
                    </span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Inventory Management</h3>
              <Button onClick={() => setShowInventoryModal(true)}>
                <Plus size={20}/> Add Item
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Item Name</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Unit Price</th>
                    <th className="text-left py-3 px-4">Total Value</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.unitPrice.toLocaleString()}đ</td>
                      <td className="py-3 px-4 font-medium">{item.totalValue.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                          item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit size={16} />
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Financial Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room Revenue</span>
                    <span className="font-medium">{(financialReports[0]?.roomRevenue / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Revenue</span>
                    <span className="font-medium">{(financialReports[0]?.serviceRevenue / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food & Beverage</span>
                    <span className="font-medium">{(financialReports[0]?.foodRevenue / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Expense Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Staff Costs</span>
                    <span className="font-medium">{(financialReports[0]?.staffCosts / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities</span>
                    <span className="font-medium">{(financialReports[0]?.utilitiesCosts / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance</span>
                    <span className="font-medium">{(financialReports[0]?.maintenanceCosts / 1000000 || 0).toFixed(1)}M VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelManagementView;
