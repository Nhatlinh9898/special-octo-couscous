import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package, Users, ShoppingCart, CreditCard, Calendar, FileText, Plus, Edit, Trash2, Eye, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  MOCK_FINANCIAL_TRANSACTIONS, 
  MOCK_PROFIT_ANALYSIS, 
  MOCK_BUDGET_PLANS, 
  MOCK_SUPPLIERS, 
  MOCK_EXPENSE_REPORTS,
  MOCK_INVENTORY 
} from './data';
import { 
  FinancialTransaction, 
  ProfitAnalysis, 
  BudgetPlan, 
  Supplier, 
  ExpenseReport, 
  InventoryItem 
} from './types';
import { Button, Modal } from './components';

const CanteenFinanceView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'inventory' | 'suppliers' | 'budget' | 'reports'>('overview');
  
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'revenue' as any,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    status: 'completed' as 'completed' | 'pending' | 'cancelled',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'qr',
    createdBy: 'Nguyễn Thị Hanh'
  });

  useEffect(() => {
    setTransactions(MOCK_FINANCIAL_TRANSACTIONS);
    setProfitAnalysis(MOCK_PROFIT_ANALYSIS);
    setBudgetPlans(MOCK_BUDGET_PLANS);
    setSuppliers(MOCK_SUPPLIERS);
    setInventory(MOCK_INVENTORY);
    setExpenseReports(MOCK_EXPENSE_REPORTS);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const currentMonthExpenses = expenseReports[0]?.totalExpenses || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionForm({
      type: 'income',
      category: 'revenue',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      status: 'completed',
      paymentMethod: 'cash',
      createdBy: 'Nguyễn Thị Hanh'
    });
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      reference: transaction.reference,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      createdBy: transaction.createdBy
    });
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddSupplier = () => {
    console.log('Add supplier');
  };

  const handleEditSupplier = (supplier: Supplier) => {
    console.log('Edit supplier:', supplier);
  };

  const handleDeleteSupplier = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddBudget = () => {
    console.log('Add budget');
  };

  const handleEditBudget = (budget: BudgetPlan) => {
    console.log('Edit budget:', budget);
  };

  const handleDeleteBudget = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      setBudgetPlans(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSaveTransaction = () => {
    const newTransaction: FinancialTransaction = {
      id: editingTransaction ? editingTransaction.id : Date.now(),
      type: transactionForm.type,
      category: transactionForm.category,
      amount: parseFloat(transactionForm.amount),
      description: transactionForm.description,
      date: transactionForm.date,
      reference: transactionForm.reference || `TRX-${Date.now()}`,
      status: transactionForm.status,
      paymentMethod: transactionForm.paymentMethod,
      createdBy: transactionForm.createdBy,
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString()
    };

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? newTransaction : t));
    } else {
      setTransactions(prev => [...prev, newTransaction]);
    }

    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign size={24} className="text-green-500"/> Quản lý Tài chính Căng tin
        </h2>
        <Button onClick={handleAddTransaction}>
          <Plus size={16}/> Thêm giao dịch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng thu</span>
            <TrendingUp size={16} className="text-green-500"/>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng chi</span>
            <TrendingDown size={16} className="text-red-500"/>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Lợi nhuận</span>
            <div className={`w-2 h-2 rounded-full ${netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chi phí tháng này</span>
            <AlertCircle size={16} className="text-orange-500"/>
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentMonthExpenses)}</p>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Tổng quan', icon: DollarSign },
          { id: 'transactions', label: 'Giao dịch', icon: FileText },
          { id: 'inventory', label: 'Nguyên vật', icon: Package },
          { id: 'suppliers', label: 'Nhà cung cấp', icon: Users },
          { id: 'budget', label: 'Ngân sách', icon: Calendar },
          { id: 'reports', label: 'Báo cáo', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.id 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500"/> Phân tích lợi nhuận
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profitAnalysis.map(analysis => (
                <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800">{analysis.period}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doanh thu:</span>
                      <span className="font-medium text-green-600">{formatCurrency(analysis.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chi phí:</span>
                      <span className="font-medium text-red-600">{formatCurrency(analysis.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lợi nhuận:</span>
                      <span className={`font-medium ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-500"/> Ngân sách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetPlans.map(budget => (
                <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{budget.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      budget.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {budget.status === 'active' ? 'Đang hoạt động' : budget.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Tổng ngân sách:</span>
                    <span className="font-medium">{formatCurrency(budget.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Đã chi tiêu:</span>
                    <span className="font-medium">{formatCurrency(budget.spentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Còn lại:</span>
                    <span className={`font-medium ${budget.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(budget.remainingBudget)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h3>
              <Button onClick={handleAddTransaction}>
                <Plus size={16}/> Thêm giao dịch
              </Button>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{transaction.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Thu' : 'Chi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(transaction.amount)}</td>
                    <td className="px-4 py-3 text-sm">{transaction.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit size={14}/>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 size={14}/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-orange-500"/> Quản lý Nguyên vật
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map(item => (
                <div key={item.id} className={`border rounded-lg p-4 ${
                  item.status === 'out_of_stock' 
                    ? 'border-red-200 bg-red-50' 
                    : item.status === 'low_stock' 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'out_of_stock' 
                        ? 'bg-red-100 text-red-800' 
                        : item.status === 'low_stock' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'out_of' ? 'Hết hàng' : item.status === 'low_stock' ? 'Sắp hết' : 'Còn đủ'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="font-medium">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-medium">{formatCurrency(item.unitPrice)}/{item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhà cung cấp:</span>
                      <span className="font-medium">{item.supplier}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-blue-500"/> Nhà cung cấp
              </h3>
              <Button onClick={handleAddSupplier}>
                <Plus size={16}/> Thêm nhà cung cấp
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{supplier.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Liên hệ:</span>
                      <span className="font-medium">{supplier.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Điện thoại:</span>
                      <span className="font-medium">{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-blue-600">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Đánh giá:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full ${
                            i < supplier.rating ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Danh mục:</span>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map((cat, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit size={14}/>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={20} className="text-purple-500"/> Ngân sách
              </h3>
              <Button onClick={handleAddBudget}>
                <Plus size={16}/> Tạo ngân sách
              </Button>
            </div>
            
            <div className="space-y-4">
              {budgetPlans.map(budget => (
                <div key={budget.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800">{budget.name}</h4>
                      <p className="text-sm text-gray-600">{budget.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        budget.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : budget.status === 'completed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {budget.status === 'active' ? 'Đang hoạt động' : budget.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit size={14}/>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 size={14}/>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng ngân sách</label>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(budget.totalBudget)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đã sử dụng</label>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(budget.spentAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Còn lại</label>
                      <p className={`text-lg font-bold ${budget.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budget.remainingBudget)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiến độ sử dụng</label>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(budget.spentAmount / budget.totalBudget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700 mb-2">Phân bổ ngân sách:</h5>
                    <div className="space-y-2">
                      {budget.categories.map((cat, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  cat.spent >= cat.allocated 
                                    ? 'bg-red-500' 
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-500"/> Báo cáo tài chính
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Báo cáo chi phí</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng chi phí tháng này:</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(currentMonthExpenses)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700 mb-2">Chi phí theo danh mục:</h5>
                    {expenseReports[0]?.expensesByCategory.map((expense, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{expense.category}</span>
                        <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Xu hướng chi phí:</h5>
                    <div className="space-y-1">
                      {expenseReports[0]?.monthlyTrend.map((trend, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{t.month}</span>
                          <span className="text-sm font-medium">{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Sản phẩm bán chạy nhất</h4>
                {profitAnalysis[0]?.topSellingItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{item.itemName}</span>
                      <span className="text-xs text-gray-500">({item.quantity} đơn)</span>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <Modal 
          isOpen={showTransactionModal} 
          onClose={() => setShowTransactionModal(false)} 
          title={editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        >
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch *</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="income">Thu</option>
                    <option value="expense">Chi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="revenue">Doanh thu</option>
                    <option value="supplier_payment">Thanh toán nhà cung cấp</option>
                    <option value="salary">Lương nhân viên</option>
                    <option value="utilities">Chi phí vận hành</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền *</label>
                  <input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                <textarea
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nhập mô tả giao dịch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
                <select
                  value={transactionForm.paymentMethod}
                  onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="qr">Quét mã QR</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowTransactionModal(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveTransaction}
                disabled={!transactionForm.amount || !transactionForm.description}
              >
                Lưu giao dịch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CanteenFinanceView;
