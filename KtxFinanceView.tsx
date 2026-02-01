import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Users, 
  FileText, 
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
  Zap,
  Droplets,
  Settings,
  Printer,
  Bell,
  Mail
} from 'lucide-react';
import { Button, Modal } from './components';

// Interfaces
interface Transaction {
  id: number;
  studentId: number;
  studentName: string;
  roomNumber: string;
  type: 'Rent' | 'Electricity' | 'Water' | 'Deposit' | 'Fine' | 'Refund';
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentMethod: string;
  description: string;
}

interface Invoice {
  id: number;
  studentId: number;
  studentName: string;
  roomNumber: string;
  month: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
}

interface UtilityBill {
  id: number;
  roomNumber: string;
  month: string;
  electricity: number;
  water: number;
  totalCost: number;
  status: 'Draft' | 'Generated' | 'Paid';
}

const KtxFinanceView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data
    setTransactions([
      {
        id: 1,
        studentId: 1,
        studentName: 'Nguyễn Văn An',
        roomNumber: 'A0101',
        type: 'Rent',
        amount: 1200000,
        date: '2024-01-05',
        dueDate: '2024-01-05',
        status: 'Paid',
        paymentMethod: 'Bank Transfer',
        description: 'Tiền phòng tháng 1/2024'
      }
    ]);

    setInvoices([
      {
        id: 1,
        studentId: 1,
        studentName: 'Nguyễn Văn An',
        roomNumber: 'A0101',
        month: '2024-01',
        total: 1845000,
        status: 'Paid',
        dueDate: '2024-02-10'
      }
    ]);

    setUtilityBills([
      {
        id: 1,
        roomNumber: 'A0101',
        month: '2024-01',
        electricity: 150,
        water: 10,
        totalCost: 645000,
        status: 'Generated'
      }
    ]);
  }, []);

  const stats = {
    revenue: 450000000,
    expenses: 150000000,
    income: 300000000,
    collection: 92.5,
    overdue: 35000000
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">KTX Financial Management</h2>
          <p className="text-gray-500">Quản lý tài chính ký túc xá chuyên nghiệp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <FileText size={20}/> Tạo Hóa đơn
          </Button>
          <Button variant="secondary">
            <Bell size={20}/> Gửi Nhắc nợ
          </Button>
          <Button variant="secondary">
            <BarChart3 size={20}/> Báo cáo Tài chính
          </Button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng Doanh thu</p>
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
              <p className="text-sm text-gray-600">Tổng Chi phí</p>
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
              <p className="text-sm text-gray-600">Thu nhập Ròng</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats.income / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ Thu</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.collection.toFixed(1)}%
              </p>
            </div>
            <CreditCard className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Công nợ</p>
              <p className="text-2xl font-bold text-orange-600">
                {(stats.overdue / 1000000).toFixed(1)}M VNĐ
              </p>
            </div>
            <AlertCircle className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
            { id: 'transactions', label: 'Giao dịch', icon: Receipt },
            { id: 'invoices', label: 'Hóa đơn', icon: FileText },
            { id: 'utility', label: 'Điện nước', icon: Zap },
            { id: 'students', label: 'Sinh viên', icon: Users },
            { id: 'reports', label: 'Báo cáo', icon: PieChart }
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
            <h3 className="text-lg font-semibold text-gray-800">Tổng quan Tài chính KTX</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Doanh thu theo Loại</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Tiền phòng</span>
                    <span className="text-blue-600 font-bold">360.0M VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Tiền điện nước</span>
                    <span className="text-green-600 font-bold">90.0M VNĐ</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Chi phí Hoạt động</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Nhân sự</span>
                    <span className="text-red-600 font-bold">80.0M VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Bảo trì</span>
                    <span className="text-orange-600 font-bold">30.0M VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Giao dịch</h3>
              <Button>
                <Plus size={20}/> Thêm Giao dịch
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Ngày</th>
                    <th className="text-left py-3 px-4">Sinh viên</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Loại</th>
                    <th className="text-left py-3 px-4">Số tiền</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4">{transaction.studentName}</td>
                      <td className="py-3 px-4">{transaction.roomNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {transaction.type === 'Rent' ? 'Tiền phòng' : transaction.type}
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
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Hóa đơn</h3>
              <Button>
                <Plus size={20}/> Tạo Hóa đơn
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Mã HD</th>
                    <th className="text-left py-3 px-4">Sinh viên</th>
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tháng</th>
                    <th className="text-left py-3 px-4">Tổng cộng</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">INV-{invoice.id.toString().padStart(6, '0')}</td>
                      <td className="py-3 px-4">{invoice.studentName}</td>
                      <td className="py-3 px-4">{invoice.roomNumber}</td>
                      <td className="py-3 px-4">{invoice.month}</td>
                      <td className="py-3 px-4 font-medium">{invoice.total.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'utility' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Điện nước</h3>
              <Button>
                <Plus size={20}/> Ghi chỉ số
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Phòng</th>
                    <th className="text-left py-3 px-4">Tháng</th>
                    <th className="text-left py-3 px-4">Điện (kWh)</th>
                    <th className="text-left py-3 px-4">Nước (m³)</th>
                    <th className="text-left py-3 px-4">Tổng cộng</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {utilityBills.map(bill => (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{bill.roomNumber}</td>
                      <td className="py-3 px-4">{bill.month}</td>
                      <td className="py-3 px-4">{bill.electricity}</td>
                      <td className="py-3 px-4">{bill.water}</td>
                      <td className="py-3 px-4 font-medium">{bill.totalCost.toLocaleString()}đ</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Tài chính Sinh viên</h3>
              <Button>
                <Plus size={20} /> Tạo Kế hoạch TT
              </Button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có dữ liệu sinh viên</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Báo cáo Tài chính</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Báo cáo Doanh thu</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tiền phòng</span>
                    <span className="font-medium">360.0M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiện ích</span>
                    <span className="font-medium">90.0M VNĐ</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Báo cáo Chi phí</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Nhân sự</span>
                    <span className="font-medium">80.0M VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bảo trì</span>
                    <span className="font-medium">30.0M VNĐ</span>
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

export default KtxFinanceView;
