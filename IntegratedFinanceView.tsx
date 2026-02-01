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
  CheckCircle
} from 'lucide-react';
import { Button, Modal } from './components';

interface Tenant {
  id: number;
  name: string;
  type: 'Student' | 'Teacher' | 'Visitor';
  roomNumber: string;
  building: 'KTX-A' | 'KTX-B' | 'Hotel';
  email: string;
  phone: string;
  balance: number;
  status: 'Active' | 'CheckedOut';
  checkInDate: string;
  checkOutDate?: string;
  purpose?: string; // Study, Teaching, Visiting
}

interface Transaction {
  id: number;
  tenantName: string;
  roomNumber: string;
  building: string;
  type: 'Rent' | 'Electricity' | 'Water' | 'Service';
  amount: number;
  date: string;
  status: 'Paid' | 'Unpaid';
}

interface Invoice {
  id: number;
  tenantName: string;
  roomNumber: string;
  building: string;
  month: string;
  total: number;
  status: 'Sent' | 'Paid' | 'Overdue';
  notificationsSent: boolean;
}

interface Partner {
  id: number;
  name: string;
  type: 'Supplier' | 'Service Provider' | 'Utility';
  category: string;
  totalContracts: number;
  totalValue: number;
  status: 'Active' | 'Inactive';
}

const IntegratedFinanceView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  // Modal states
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [tenantForm, setTenantForm] = useState({
    name: '',
    type: 'Student' as 'Student' | 'Teacher' | 'Visitor',
    roomNumber: '',
    building: 'KTX-A' as 'KTX-A' | 'KTX-B' | 'Hotel',
    email: '',
    phone: '',
    balance: 0,
    purpose: 'Study'
  });
  
  const [transactionForm, setTransactionForm] = useState({
    tenantName: '',
    roomNumber: '',
    building: '',
    type: 'Rent' as 'Rent' | 'Electricity' | 'Water' | 'Service',
    amount: 0,
    date: '',
    description: ''
  });
  
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    type: 'Supplier' as 'Supplier' | 'Service Provider' | 'Utility',
    category: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    taxCode: ''
  });

  useEffect(() => {
    // Mock data
    setTenants([
      {
        id: 1,
        name: 'Nguyễn Văn An',
        type: 'Student',
        roomNumber: 'A0101',
        building: 'KTX-A',
        email: 'an.nguyen@university.edu.vn',
        phone: '0912345678',
        balance: 1500000,
        status: 'Active',
        checkInDate: '2024-01-01',
        purpose: 'Study'
      },
      {
        id: 2,
        name: 'Trần Thị Bình',
        type: 'Student',
        roomNumber: 'B0205',
        building: 'KTX-B',
        email: 'binh.tran@university.edu.vn',
        phone: '0923456789',
        balance: -500000,
        status: 'Active',
        checkInDate: '2024-01-01',
        purpose: 'Study'
      },
      {
        id: 3,
        name: 'Ts. Nguyễn Văn Cường',
        type: 'Teacher',
        roomNumber: 'H0101',
        building: 'Hotel',
        email: 'cuong.nguyen@university.edu.vn',
        phone: '0934567890',
        balance: 0,
        status: 'Active',
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-20',
        purpose: 'Teaching'
      },
      {
        id: 4,
        name: 'Dr. Sarah Johnson',
        type: 'Visitor',
        roomNumber: 'H0203',
        building: 'Hotel',
        email: 'sarah.johnson@university.edu',
        phone: '+1-555-0123',
        balance: 0,
        status: 'Active',
        checkInDate: '2024-01-18',
        checkOutDate: '2024-01-22',
        purpose: 'Visiting'
      }
    ]);

    setTransactions([
      {
        id: 1,
        tenantName: 'Nguyễn Văn An',
        roomNumber: 'A0101',
        building: 'KTX-A',
        type: 'Rent',
        amount: 1200000,
        date: '2024-01-05',
        status: 'Paid'
      },
      {
        id: 2,
        tenantName: 'Trần Thị Bình',
        roomNumber: 'B0205',
        building: 'KTX-B',
        type: 'Electricity',
        amount: 175000,
        date: '2024-01-10',
        status: 'Unpaid'
      },
      {
        id: 3,
        tenantName: 'Ts. Nguyễn Văn Cường',
        roomNumber: 'H0101',
        building: 'Hotel',
        type: 'Service',
        amount: 2500000,
        date: '2024-01-15',
        status: 'Paid'
      },
      {
        id: 4,
        tenantName: 'Dr. Sarah Johnson',
        roomNumber: 'H0203',
        building: 'Hotel',
        type: 'Service',
        amount: 3500000,
        date: '2024-01-18',
        status: 'Paid'
      }
    ]);

    setInvoices([
      {
        id: 1,
        tenantName: 'Nguyễn Văn An',
        roomNumber: 'A0101',
        building: 'KTX-A',
        month: '2024-01',
        total: 1725000,
        status: 'Paid',
        notificationsSent: true
      }
    ]);

    setPartners([
      {
        id: 1,
        name: 'CleanPro Services',
        type: 'Service Provider',
        category: 'Cleaning',
        totalContracts: 12,
        totalValue: 240000000,
        status: 'Active'
      },
      {
        id: 2,
        name: 'EVN Power Company',
        type: 'Utility',
        category: 'Electricity',
        totalContracts: 6,
        totalValue: 180000000,
        status: 'Active'
      }
    ]);
  }, []);

  const getStats = () => {
    const ktxRevenue = transactions
      .filter(t => t.building.startsWith('KTX'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const hotelRevenue = transactions
      .filter(t => t.building === 'Hotel')
      .reduce((sum, t) => sum + t.amount, 0);

    const students = tenants.filter(t => t.type === 'Student');
    const teachers = tenants.filter(t => t.type === 'Teacher');
    const visitors = tenants.filter(t => t.type === 'Visitor');

    return {
      totalRevenue: ktxRevenue + hotelRevenue,
      ktxRevenue,
      hotelRevenue,
      totalTenants: tenants.length,
      students: students.length,
      teachers: teachers.length,
      visitors: visitors.length,
      activePartners: partners.filter(p => p.status === 'Active').length,
      pendingInvoices: invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length
    };
  };

  const sendBulkNotifications = (type: string) => {
    alert(`Đã gửi thông báo ${type} cho tất cả người thuê!`);
  };

  const generateBulkInvoices = () => {
    alert('Đã tạo hóa đơn hàng loạt!');
  };

  // CRUD Handler Functions
  const handleAddTenant = () => {
    setIsEditing(false);
    setTenantForm({
      name: '',
      type: 'Student',
      roomNumber: '',
      building: 'KTX-A',
      email: '',
      phone: '',
      balance: 0,
      purpose: 'Study'
    });
    setShowTenantModal(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setIsEditing(true);
    setSelectedItem(tenant);
    setTenantForm({
      name: tenant.name,
      type: tenant.type,
      roomNumber: tenant.roomNumber,
      building: tenant.building,
      email: tenant.email,
      phone: tenant.phone,
      balance: tenant.balance,
      purpose: tenant.purpose || 'Study'
    });
    setShowTenantModal(true);
  };

  const handleSaveTenant = () => {
    if (!tenantForm.name || !tenantForm.roomNumber) {
      alert('Vui lòng điền thông tin bắt buộc!');
      return;
    }

    if (isEditing && selectedItem) {
      // Update existing tenant
      setTenants(prev => prev.map(t => 
        t.id === selectedItem.id 
          ? { ...t, ...tenantForm, id: t.id, status: 'Active' as const, checkInDate: t.checkInDate }
          : t
      ));
      alert('Đã cập nhật thông tin người thuê!');
    } else {
      // Add new tenant
      const newTenant: Tenant = {
        id: Date.now(),
        ...tenantForm,
        status: 'Active',
        checkInDate: new Date().toISOString().split('T')[0]
      };
      setTenants(prev => [...prev, newTenant]);
      alert('Đã thêm người thuê mới!');
    }
    setShowTenantModal(false);
  };

  const handleDeleteTenant = (tenantId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa người thuê này?')) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      alert('Đã xóa người thuê!');
    }
  };

  const handleAddTransaction = () => {
    setIsEditing(false);
    setTransactionForm({
      tenantName: '',
      roomNumber: '',
      building: '',
      type: 'Rent',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = () => {
    if (!transactionForm.tenantName || !transactionForm.amount) {
      alert('Vui lòng điền thông tin bắt buộc!');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      ...transactionForm,
      status: 'Unpaid'
    };
    setTransactions(prev => [...prev, newTransaction]);
    setShowTransactionModal(false);
    alert('Đã thêm giao dịch mới!');
  };

  const handleAddPartner = () => {
    setIsEditing(false);
    setPartnerForm({
      name: '',
      type: 'Supplier',
      category: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      taxCode: ''
    });
    setShowPartnerModal(true);
  };

  const handleSavePartner = () => {
    if (!partnerForm.name || !partnerForm.contact) {
      alert('Vui lòng điền thông tin bắt buộc!');
      return;
    }

    const newPartner: Partner = {
      id: Date.now(),
      ...partnerForm,
      totalContracts: 0,
      totalValue: 0,
      status: 'Active',
      contracts: []
    };
    setPartners(prev => [...prev, newPartner]);
    setShowPartnerModal(false);
    alert('Đã thêm đối tác mới!');
  };

  const handleDeletePartner = (partnerId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
      setPartners(prev => prev.filter(p => p.id !== partnerId));
      alert('Đã xóa đối tác!');
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Integrated Finance Management</h2>
          <p className="text-gray-500">KTX + Hotel + Partners - Unified Financial System</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => sendBulkNotifications('invoice')}>
            <Mail size={20}/> Gửi Hóa đơn
          </Button>
          <Button variant="secondary" onClick={() => sendBulkNotifications('payment')}>
            <Bell size={20}/> Nhắc nợ
          </Button>
          <Button variant="secondary" onClick={generateBulkInvoices}>
            <FileText size={20}/> Tạo HĐ hàng loạt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng Doanh thu</p>
              <p className="text-2xl font-bold text-green-600">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KTX Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats.ktxRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <Building2 className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hotel Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                {(stats.hotelRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Học sinh KTX</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.students}
              </p>
            </div>
            <Users className="text-orange-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giáo viên & Khách</p>
              <p className="text-2xl font-bold text-teal-600">
                {stats.teachers + stats.visitors}
              </p>
            </div>
            <Handshake className="text-teal-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">HĐ chờ TT</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.pendingInvoices}
              </p>
            </div>
            <Receipt className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'tenants', label: 'Người thuê', icon: Users },
            { id: 'transactions', label: 'Giao dịch', icon: Receipt },
            { id: 'invoices', label: 'Hóa đơn', icon: FileText },
            { id: 'partners', label: 'Đối tác', icon: Handshake }
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
            <h3 className="text-lg font-semibold text-gray-800">Tổng quan Tài chính Tích hợp</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Phân bổ Doanh thu</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">KTX</span>
                    <span className="text-blue-600 font-bold">
                      {(stats.ktxRevenue / 1000000).toFixed(1)}M VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Hotel</span>
                    <span className="text-purple-600 font-bold">
                      {(stats.hotelRevenue / 1000000).toFixed(1)}M VNĐ
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Phân bổ Người thuê</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Học sinh KTX</span>
                    <span className="text-blue-600 font-bold">{stats.students}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Giáo viên</span>
                    <span className="text-green-600 font-bold">{stats.teachers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Khách tham quan</span>
                    <span className="text-purple-600 font-bold">{stats.visitors}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Đối tác</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                    <span className="font-medium">Active</span>
                    <span className="text-teal-600 font-bold">{stats.activePartners}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">HĐ chờ TT</span>
                    <span className="text-red-600 font-bold">{stats.pendingInvoices}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Người thuê (KTX + Hotel)</h3>
              <Button onClick={handleAddTenant}>
                <Plus size={20}/> Thêm Người thuê
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Tên</th>
                    <th className="text-left py-3 px-4">Loại</th>
                    <th className="text-left py-3 px-4">Mục đích</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tòa nhà</th>
                    <th className="text-left py-3 px-4">Liên hệ</th>
                    <th className="text-left py-3 px-4">Số dư</th>
                    <th className="text-left py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{tenant.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tenant.type === 'Student' ? 'bg-blue-100 text-blue-800' :
                          tenant.type === 'Teacher' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {tenant.type === 'Student' ? 'Học sinh' :
                           tenant.type === 'Teacher' ? 'Giáo viên' : 'Khách tham quan'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {tenant.purpose}
                        </span>
                      </td>
                      <td className="py-3 px-4">{tenant.roomNumber}</td>
                      <td className="py-3 px-4">{tenant.building}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{tenant.email}</p>
                          <p className="text-xs text-gray-500">{tenant.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${tenant.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tenant.balance.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditTenant(tenant)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleEditTenant(tenant)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            <Trash2 size={16} />
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
              <h3 className="text-lg font-semibold text-gray-800">Giao dịch Tích hợp</h3>
              <Button onClick={handleAddTransaction}>
                <Plus size={20}/> Thêm Giao dịch
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Ngày</th>
                    <th className="text-left py-3 px-4">Người thuê</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tòa nhà</th>
                    <th className="text-left py-3 px-4">Loại</th>
                    <th className="text-left py-3 px-4">Số tiền</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4">{transaction.tenantName}</td>
                      <td className="py-3 px-4">{transaction.roomNumber}</td>
                      <td className="py-3 px-4">{transaction.building}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{transaction.amount.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status === 'Paid' ? 'Đã TT' : 'Chưa TT'}
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
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
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

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Hóa đơn Tích hợp</h3>
              <Button>
                <Plus size={20}/> Tạo Hóa đơn
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Mã HD</th>
                    <th className="text-left py-3 px-4">Người thuê</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tòa nhà</th>
                    <th className="text-left py-3 px-4">Tổng cộng</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Thông báo</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">INV-{invoice.id.toString().padStart(6, '0')}</td>
                      <td className="py-3 px-4">{invoice.tenantName}</td>
                      <td className="py-3 px-4">{invoice.roomNumber}</td>
                      <td className="py-3 px-4">{invoice.building}</td>
                      <td className="py-3 px-4 font-medium">{invoice.total.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {invoice.notificationsSent ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <Bell className="text-red-600" size={16} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Đối tác</h3>
              <Button onClick={handleAddPartner}>
                <Plus size={20}/> Thêm Đối tác
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map(partner => (
                <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{partner.name}</h4>
                      <p className="text-sm text-gray-600">{partner.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      partner.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {partner.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Hợp đồng:</strong> {partner.totalContracts}</p>
                    <p><strong>Giá trị:</strong> {(partner.totalValue / 1000000).toFixed(1)}M VNĐ</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDeletePartner(partner.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tenant Modal */}
      {showTenantModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Cập nhật Người thuê' : 'Thêm Người thuê Mới'}
              </h3>
              <button 
                onClick={() => setShowTenantModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 80px)'}}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      value={tenantForm.name}
                      onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại *</label>
                    <select
                      value={tenantForm.type}
                      onChange={(e) => setTenantForm({...tenantForm, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Student">Học sinh</option>
                      <option value="Teacher">Giáo viên</option>
                      <option value="Visitor">Khách tham quan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <input
                      type="text"
                      value={tenantForm.roomNumber}
                      onChange={(e) => setTenantForm({...tenantForm, roomNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A0101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà *</label>
                    <select
                      value={tenantForm.building}
                      onChange={(e) => setTenantForm({...tenantForm, building: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="KTX-A">KTX-A</option>
                      <option value="KTX-B">KTX-B</option>
                      <option value="Hotel">Hotel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={tenantForm.email}
                      onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={tenantForm.phone}
                      onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số dư</label>
                  <input
                    type="number"
                    value={tenantForm.balance}
                    onChange={(e) => setTenantForm({...tenantForm, balance: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowTenantModal(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveTenant}>
                    {isEditing ? 'Cập nhật' : 'Thêm'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Thêm Giao dịch Mới</h3>
              <button 
                onClick={() => setShowTransactionModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người thuê *</label>
                  <input
                    type="text"
                    value={transactionForm.tenantName}
                    onChange={(e) => setTransactionForm({...transactionForm, tenantName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nhập tên người thuê"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                    <input
                      type="text"
                      value={transactionForm.roomNumber}
                      onChange={(e) => setTransactionForm({...transactionForm, roomNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A0101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>
                    <input
                      type="text"
                      value={transactionForm.building}
                      onChange={(e) => setTransactionForm({...transactionForm, building: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="KTX-A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch</label>
                    <select
                      value={transactionForm.type}
                      onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Rent">Tiền phòng</option>
                      <option value="Electricity">Tiền điện</option>
                      <option value="Water">Tiền nước</option>
                      <option value="Service">Dịch vụ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền *</label>
                    <input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Mô tả giao dịch..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowTransactionModal(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveTransaction}>
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Modal */}
      {showPartnerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Thêm Đối tác Mới</h3>
              <button 
                onClick={() => setShowPartnerModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <Plus size={20} className="rotate-45"/>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đối tác *</label>
                    <input
                      type="text"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Nhập tên đối tác"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                    <select
                      value={partnerForm.type}
                      onChange={(e) => setPartnerForm({...partnerForm, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Supplier">Nhà cung cấp</option>
                      <option value="Service Provider">Dịch vụ</option>
                      <option value="Utility">Tiện ích</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ *</label>
                  <input
                    type="text"
                    value={partnerForm.contact}
                    onChange={(e) => setPartnerForm({...partnerForm, contact: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Tên người liên hệ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({...partnerForm, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Địa chỉ"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowPartnerModal(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSavePartner}>
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedFinanceView;
