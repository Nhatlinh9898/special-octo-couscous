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
  Mail, 
  Bell,
  Handshake,
  CheckCircle
} from 'lucide-react';
import { Button, Modal } from './components';

interface Tenant {
  id: number;
  name: string;
  type: 'Student' | 'Hotel Guest';
  roomNumber: string;
  building: 'KTX-A' | 'KTX-B' | 'Hotel';
  email: string;
  phone: string;
  balance: number;
  status: 'Active' | 'CheckedOut';
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
        status: 'Active'
      },
      {
        id: 2,
        name: 'John Smith',
        type: 'Hotel Guest',
        roomNumber: 'H0201',
        building: 'Hotel',
        email: 'john.smith@email.com',
        phone: '+1-234-567-8900',
        balance: 0,
        status: 'Active'
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
        tenantName: 'John Smith',
        roomNumber: 'H0201',
        building: 'Hotel',
        type: 'Service',
        amount: 3500000,
        date: '2024-01-15',
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

    return {
      totalRevenue: ktxRevenue + hotelRevenue,
      ktxRevenue,
      hotelRevenue,
      totalTenants: tenants.length,
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
              <p className="text-sm text-gray-600">Người thuê</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalTenants}
              </p>
            </div>
            <Users className="text-orange-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đối tác</p>
              <p className="text-2xl font-bold text-teal-600">
                {stats.activePartners}
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
                <h4 className="font-medium text-gray-700 mb-3">Người thuê</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Sinh viên KTX</span>
                    <span className="text-green-600 font-bold">
                      {tenants.filter(t => t.type === 'Student').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Khách Hotel</span>
                    <span className="text-orange-600 font-bold">
                      {tenants.filter(t => t.type === 'Hotel Guest').length}
                    </span>
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
              <Button>
                <Plus size={20}/> Thêm Người thuê
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Tên</th>
                    <th className="text-left py-3 px-4">Loại</th>
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
                          tenant.type === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {tenant.type === 'Student' ? 'Sinh viên' : 'Khách sạn'}
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
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Mail size={16} />
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
              <Button>
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
              <Button>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedFinanceView;
