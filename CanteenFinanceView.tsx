import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package, Users, ShoppingCart, CreditCard, Calendar, FileText, Plus, Edit, Trash2, Eye, Download, AlertCircle, CheckCircle, QrCode, Camera, Barcode } from 'lucide-react';
import { 
  MOCK_FINANCIAL_TRANSACTIONS, 
  MOCK_PROFIT_ANALYSIS, 
  MOCK_BUDGET_PLANS, 
  MOCK_SUPPLIERS, 
  MOCK_EXPENSE_REPORTS,
  MOCK_INVENTORY,
  MOCK_INVENTORY_TRANSACTIONS,
  MOCK_INVENTORY_REPORTS
} from './data';
import { 
  FinancialTransaction, 
  ProfitAnalysis, 
  BudgetPlan, 
  Supplier, 
  ExpenseReport, 
  InventoryItem,
  InventoryTransaction,
  InventoryReport
} from './types';
import { Button, Modal } from './components';

const CanteenFinanceView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'inventory' | 'movements' | 'analytics' | 'suppliers' | 'budget' | 'reports'>('overview');
  
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>([]);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [showMovementQRScannerModal, setShowMovementQRScannerModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [editingMovement, setEditingMovement] = useState<InventoryTransaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<BudgetPlan | null>(null);
  const [movementForm, setMovementForm] = useState({
    inventoryItemId: 0,
    quantity: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    period: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    allocatedBudget: '',
    categories: []
  });
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

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'food_ingredient',
    unit: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    supplier: '',
    lastRestockDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock'
  });

  useEffect(() => {
    // Load mock data
    setTransactions(MOCK_FINANCIAL_TRANSACTIONS);
    setProfitAnalysis(MOCK_PROFIT_ANALYSIS);
    setBudgetPlans(MOCK_BUDGET_PLANS);
    setSuppliers(MOCK_SUPPLIERS);
    setInventory(MOCK_INVENTORY);
    setExpenseReports(MOCK_EXPENSE_REPORTS);
    setInventoryTransactions(MOCK_INVENTORY_TRANSACTIONS);
    setInventoryReports(MOCK_INVENTORY_REPORTS);

    // Load canteen transactions from localStorage
    refreshDataFromLocalStorage();

    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(() => {
      refreshDataFromLocalStorage();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const currentMonthExpenses = expenseReports[0]?.totalExpenses || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Function to refresh data from localStorage
  const refreshDataFromLocalStorage = () => {
    const canteenTransactions = JSON.parse(localStorage.getItem('canteenFinancialTransactions') || '[]');
    const canteenMovements = JSON.parse(localStorage.getItem('canteenInventoryMovements') || '[]');
    
    // Reload transactions
    setTransactions(MOCK_FINANCIAL_TRANSACTIONS);
    if (canteenTransactions.length > 0) {
      setTransactions(prev => [...prev, ...canteenTransactions]);
    }
    
    // Reload inventory movements
    setInventoryTransactions(MOCK_INVENTORY_TRANSACTIONS);
    if (canteenMovements.length > 0) {
      setInventoryTransactions(prev => [...prev, ...canteenMovements]);
    }
  };

  // Analytics calculation functions
  const calculateProductAnalytics = () => {
    // Get all canteen transactions (revenue from sales)
    const canteenTransactions = JSON.parse(localStorage.getItem('canteenFinancialTransactions') || '[]');
    const canteenMovements = JSON.parse(localStorage.getItem('canteenInventoryMovements') || '[]');
    
    // Group movements by product
    const productMovements: Record<string, {
      totalQuantity: number;
      totalRevenue: number;
      totalCost: number;
      movementCount: number;
      avgPrice: number;
      profit: number;
      profitMargin: string;
    }> = {};
    
    canteenMovements.forEach(movement => {
      if (!productMovements[movement.itemName]) {
        productMovements[movement.itemName] = {
          totalQuantity: 0,
          totalRevenue: 0,
          totalCost: 0,
          movementCount: 0,
          avgPrice: 0,
          profit: 0,
          profitMargin: '0'
        };
      }
      productMovements[movement.itemName].totalQuantity += movement.quantity;
      productMovements[movement.itemName].totalRevenue += movement.totalValue;
      productMovements[movement.itemName].movementCount += 1;
    });

    // Calculate cost and profit for each product
    Object.keys(productMovements).forEach(productName => {
      const inventoryItem = inventory.find(item => item.name === productName);
      if (inventoryItem) {
        productMovements[productName].totalCost = productMovements[productName].totalQuantity * inventoryItem.unitPrice;
        productMovements[productName].avgPrice = inventoryItem.unitPrice;
        productMovements[productName].profit = productMovements[productName].totalRevenue - productMovements[productName].totalCost;
        productMovements[productName].profitMargin = ((productMovements[productName].profit / productMovements[productName].totalRevenue) * 100).toFixed(2);
      }
    });

    // Sort by total revenue
    const sortedProducts = Object.entries(productMovements)
      .sort(([,a], [,b]) => (b as any).totalRevenue - (a as any).totalRevenue)
      .map(([name, data]) => ({ name, ...data }));

    return sortedProducts;
  };

  const generateInventoryRecommendations = () => {
    const productAnalytics = calculateProductAnalytics();
    const recommendations = [];

    productAnalytics.forEach(product => {
      const inventoryItem = inventory.find(item => item.name === product.name);
      if (!inventoryItem) return;

      // Analyze stock levels and sales trends
      const stockRatio = inventoryItem.currentStock / inventoryItem.maxStock;
      const dailySales = product.totalQuantity / 30; // Assuming 30 days period
      
      let recommendation = {
        product: product.name,
        currentStock: inventoryItem.currentStock,
        maxStock: inventoryItem.maxStock,
        unitPrice: inventoryItem.unitPrice,
        supplier: inventoryItem.supplier,
        dailySales: dailySales,
        stockRatio: stockRatio,
        priority: 'medium' as 'low' | 'medium' | 'high',
        action: '',
        quantity: 0,
        reason: ''
      };

      // Generate recommendations based on stock levels and sales
      if (stockRatio < 0.2) {
        recommendation.priority = 'high';
        recommendation.action = 'restock';
        recommendation.quantity = Math.ceil(dailySales * 7); // 7 days supply
        recommendation.reason = `Tồn kho thấp (${stockRatio.toFixed(1)}%), cần nhập ${recommendation.quantity} ${inventoryItem.unit}`;
      } else if (stockRatio < 0.4) {
        recommendation.priority = 'medium';
        recommendation.action = 'monitor';
        recommendation.quantity = Math.ceil(dailySales * 3); // 3 days supply
        recommendation.reason = `Tồn kho trung bình, theo dõi ${recommendation.quantity} ${inventoryItem.unit}`;
      } else if (stockRatio > 0.8) {
        recommendation.priority = 'low';
        recommendation.action = 'hold';
        recommendation.reason = `Tồn kho đủ (${stockRatio.toFixed(1)}%), tạm ngừng nhập`;
      }

      // Check if product is profitable
      if (parseFloat(product.profitMargin) < 0) {
        recommendation.priority = 'high';
        recommendation.action = 'review';
        recommendation.reason = `Sản phẩm đang lỗ (${product.profitMargin}%), cần xem xét lại giá hoặc chi phí`;
      }

      recommendations.push(recommendation);
    });

    return recommendations.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const calculateFinancialSummary = () => {
    const canteenTransactions = JSON.parse(localStorage.getItem('canteenFinancialTransactions') || '[]');
    const canteenMovements = JSON.parse(localStorage.getItem('canteenInventoryMovements') || '[]');
    
    const totalRevenue = canteenTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCost = canteenMovements.reduce((sum, m) => sum + m.totalValue, 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0';

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      transactionCount: canteenTransactions.length,
      movementCount: canteenMovements.length
    };
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
    setEditingBudget(null);
    setBudgetForm({
      name: '',
      period: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString().split('T')[0],
      totalBudget: '',
      allocatedBudget: '',
      categories: []
    });
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget: BudgetPlan) => {
    setEditingBudget(budget);
    setBudgetForm({
      name: budget.name,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalBudget: budget.totalBudget.toString(),
      allocatedBudget: budget.allocatedBudget.toString(),
      categories: budget.categories
    });
    setShowBudgetModal(true);
  };

  const handleSaveBudget = () => {
    const newBudget: BudgetPlan = {
      id: editingBudget ? editingBudget.id : Date.now(),
      name: budgetForm.name,
      period: budgetForm.period,
      startDate: budgetForm.startDate,
      endDate: budgetForm.endDate,
      totalBudget: parseFloat(budgetForm.totalBudget),
      allocatedBudget: parseFloat(budgetForm.allocatedBudget),
      spentAmount: editingBudget ? editingBudget.spentAmount : 0,
      remainingBudget: parseFloat(budgetForm.totalBudget) - parseFloat(budgetForm.allocatedBudget),
      categories: budgetForm.categories.map(cat => ({
        category: cat,
        allocated: parseFloat(budgetForm.totalBudget) / budgetForm.categories.length,
        spent: 0,
        remaining: parseFloat(budgetForm.totalBudget) / budgetForm.categories.length
      })),
      status: editingBudget ? editingBudget.status : 'active',
      createdAt: editingBudget ? editingBudget.createdAt : new Date().toISOString()
    };

    if (editingBudget) {
      setBudgetPlans(prev => prev.map(b => b.id === editingBudget.id ? newBudget : b));
    } else {
      setBudgetPlans(prev => [...prev, newBudget]);
    }

    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetForm({
      name: '',
      period: '',
      startDate: '',
      endDate: '',
      totalBudget: '',
      allocatedBudget: '',
      categories: []
    });

    alert(`Đã ${editingBudget ? 'cập nhật' : 'tạo'} ngân sách "${newBudget.name}" thành công!`);
  };

  const handleDeleteBudget = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      setBudgetPlans(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleGenerateReport = () => {
    const reportData = {
      period: new Date().toISOString().split('T')[0],
      totalRevenue: calculateFinancialSummary().totalRevenue,
      totalCost: calculateFinancialSummary().totalCost,
      totalProfit: calculateFinancialSummary().totalProfit,
      profitMargin: calculateFinancialSummary().profitMargin,
      transactionCount: calculateFinancialSummary().transactionCount,
      movementCount: calculateFinancialSummary().movementCount,
      topProducts: calculateProductAnalytics().slice(0, 5),
      inventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
      outOfStockCount: inventory.filter(item => item.status === 'out_of_stock').length,
      lowStockCount: inventory.filter(item => item.status === 'low_stock').length
    };

    // Save report to localStorage
    const existingReports = JSON.parse(localStorage.getItem('canteenReports') || '[]');
    existingReports.push({
      id: Date.now(),
      ...reportData,
      createdAt: new Date().toISOString(),
      createdBy: 'Nguyễn Thị Hanh'
    });
    localStorage.setItem('canteenReports', JSON.stringify(existingReports));

    alert('Đã tạo báo cáo thành công! Báo cáo đã được lưu vào hệ thống.');
  };

  const handleExportPDF = () => {
    const reportData = {
      period: new Date().toISOString().split('T')[0],
      totalRevenue: calculateFinancialSummary().totalRevenue,
      totalCost: calculateFinancialSummary().totalCost,
      totalProfit: calculateFinancialSummary().totalProfit,
      profitMargin: calculateFinancialSummary().profitMargin,
      transactionCount: calculateFinancialSummary().transactionCount,
      movementCount: calculateFinancialSummary().movementCount,
      topProducts: calculateProductAnalytics().slice(0, 5),
      inventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
      outOfStockCount: inventory.filter(item => item.status === 'out_of_stock').length,
      lowStockCount: inventory.filter(item => item.status === 'low_stock').length
    };

    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Báo cáo tài chính căng tin</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { display: flex; justify-content: space-between; margin: 20px 0; }
            .summary-item { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Báo cáo tài chính căng tin</h1>
          <p><strong>Kỳ báo cáo:</strong> ${reportData.period}</p>
          <p><strong>Ngày tạo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
          
          <h2>Tóm tắt tài chính</h2>
          <div class="summary">
            <div class="summary-item">
              <h3>Tổng Doanh thu</h3>
              <p style="color: green; font-size: 18px; font-weight: bold;">${formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div class="summary-item">
              <h3>Tổng Chi phí</h3>
              <p style="color: red; font-size: 18px; font-weight: bold;">${formatCurrency(reportData.totalCost)}</p>
            </div>
            <div class="summary-item">
              <h3>Lợi nhuận</h3>
              <p style="color: ${reportData.totalProfit >= 0 ? 'green' : 'red'}; font-size: 18px; font-weight: bold;">${formatCurrency(reportData.totalProfit)}</p>
            </div>
            <div class="summary-item">
              <h3>Biên lợi nhuận</h3>
              <p style="color: blue; font-size: 18px; font-weight: bold;">${reportData.profitMargin}%</p>
            </div>
          </div>
          
          <h2>Sản phẩm bán chạy nhất</h2>
          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topProducts.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.totalQuantity}</td>
                  <td>${formatCurrency(item.totalRevenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Thông tin tồn kho</h2>
          <table>
            <tr>
              <td><strong>Tổng giá trị tồn kho</strong></td>
              <td>${formatCurrency(reportData.inventoryValue)}</td>
            </tr>
            <tr>
              <td><strong>Sản phẩm hết hàng</strong></td>
              <td>${reportData.outOfStockCount}</td>
            </tr>
            <tr>
              <td><strong>Sản phẩm sắp hết hàng</strong></td>
              <td>${reportData.lowStockCount}</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleExportExcel = () => {
    const reportData = {
      period: new Date().toISOString().split('T')[0],
      totalRevenue: calculateFinancialSummary().totalRevenue,
      totalCost: calculateFinancialSummary().totalCost,
      totalProfit: calculateFinancialSummary().totalProfit,
      profitMargin: calculateFinancialSummary().profitMargin,
      transactionCount: calculateFinancialSummary().transactionCount,
      movementCount: calculateFinancialSummary().movementCount,
      topProducts: calculateProductAnalytics().slice(0, 5),
      inventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
      outOfStockCount: inventory.filter(item => item.status === 'out_of_stock').length,
      lowStockCount: inventory.filter(item => item.status === 'low_stock').length
    };

    // Create CSV content
    let csvContent = "Báo cáo tài chính căng tin\n\n";
    csvContent += `Kỳ báo cáo,${reportData.period}\n`;
    csvContent += `Ngày tạo,${new Date().toLocaleDateString('vi-VN')}\n\n`;
    
    csvContent += "Tóm tắt tài chính\n";
    csvContent += "Chỉ số,Giá trị\n";
    csvContent += `Tổng Doanh thu,${reportData.totalRevenue}\n`;
    csvContent += `Tổng Chi phí,${reportData.totalCost}\n`;
    csvContent += `Lợi nhuận,${reportData.totalProfit}\n`;
    csvContent += `Biên lợi nhuận,${reportData.profitMargin}%\n`;
    csvContent += `Số giao dịch,${reportData.transactionCount}\n`;
    csvContent += `Số khi suất,${reportData.movementCount}\n\n`;
    
    csvContent += "Sản phẩm bán chạy nhất\n";
    csvContent += "Tên sản phẩm,Số lượng,Doanh thu\n";
    reportData.topProducts.forEach(item => {
      csvContent += `"${item.name}",${item.totalQuantity},${item.totalRevenue}\n`;
    });
    
    csvContent += "\nThông tin tồn kho\n";
    csvContent += "Chỉ số,Giá trị\n";
    csvContent += `Tổng giá trị tồn kho,${reportData.inventoryValue}\n`;
    csvContent += `Sản phẩm hết hàng,${reportData.outOfStockCount}\n`;
    csvContent += `Sản phẩm sắp hết hàng,${reportData.lowStockCount}\n`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-tai-chinh-${reportData.period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const reportData = {
      period: new Date().toISOString().split('T')[0],
      totalRevenue: calculateFinancialSummary().totalRevenue,
      totalCost: calculateFinancialSummary().totalCost,
      totalProfit: calculateFinancialSummary().totalProfit,
      profitMargin: calculateFinancialSummary().profitMargin,
      transactionCount: calculateFinancialSummary().transactionCount,
      movementCount: calculateFinancialSummary().movementCount,
      topProducts: calculateProductAnalytics().slice(0, 5),
      inventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
      outOfStockCount: inventory.filter(item => item.status === 'out_of_stock').length,
      lowStockCount: inventory.filter(item => item.status === 'low_stock').length
    };

    // Create CSV content with detailed data
    let csvContent = "Báo cáo tài chính căng tin\n";
    csvContent += `Kỳ báo cáo,${reportData.period}\n`;
    csvContent += `Ngày tạo,${new Date().toLocaleDateString('vi-VN')}\n\n`;
    
    csvContent += "Tóm tắt tài chính\n";
    csvContent += "Chỉ số,Giá trị\n";
    csvContent += `Tổng Doanh thu,${reportData.totalRevenue}\n`;
    csvContent += `Tổng Chi phí,${reportData.totalCost}\n`;
    csvContent += `Lợi nhuận,${reportData.totalProfit}\n`;
    csvContent += `Biên lợi nhuận,${reportData.profitMargin}%\n`;
    csvContent += `Số giao dịch,${reportData.transactionCount}\n`;
    csvContent += `Số khi suất,${reportData.movementCount}\n\n`;
    
    csvContent += "Sản phẩm bán chạy nhất\n";
    csvContent += "Tên sản phẩm,Số lượng,Doanh thu\n";
    reportData.topProducts.forEach(item => {
      csvContent += `"${item.name}",${item.totalQuantity},${item.totalRevenue}\n`;
    });
    
    csvContent += "\nThông tin tồn kho\n";
    csvContent += "Chỉ số,Giá trị\n";
    csvContent += `Tổng giá trị tồn kho,${reportData.inventoryValue}\n`;
    csvContent += `Sản phẩm hết hàng,${reportData.outOfStockCount}\n`;
    csvContent += `Sản phẩm sắp hết hàng,${reportData.lowStockCount}\n\n`;
    
    csvContent += "Chi tiết giao dịch\n";
    csvContent += "ID,Loại,Ngày,Số tiền,Mô tả,Trạng thái\n";
    transactions.forEach(t => {
      csvContent += `${t.id},${t.type},${t.date},${t.amount},"${t.description}",${t.status}\n`;
    });
    
    csvContent += "\nChi tiết tồn kho\n";
    csvContent += "ID,Tên sản phẩm,Danh mục,Tồn kho hiện tại,Đơn giá,Tổng giá trị,Trạng thái\n";
    inventory.forEach(item => {
      csvContent += `${item.id},"${item.name}",${item.category},${item.currentStock},${item.unitPrice},${item.currentStock * item.unitPrice},${item.status}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-chi-tiet-${reportData.period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inventory CRUD functions
  const handleAddInventory = () => {
    setEditingInventory(null);
    setInventoryForm({
      name: '',
      category: 'food_ingredient',
      unit: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unitPrice: '',
      supplier: '',
      lastRestockDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'in_stock'
    });
    setShowInventoryModal(true);
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventory(item);
    setInventoryForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      lastRestockDate: item.lastRestockDate,
      expiryDate: item.expiryDate || '',
      status: item.status
    });
    setShowInventoryModal(true);
  };

  const handleSaveInventory = () => {
    const newInventory: InventoryItem = {
      id: editingInventory ? editingInventory.id : Date.now(),
      name: inventoryForm.name,
      category: inventoryForm.category,
      unit: inventoryForm.unit,
      currentStock: parseFloat(inventoryForm.currentStock),
      minStock: parseFloat(inventoryForm.minStock),
      maxStock: parseFloat(inventoryForm.maxStock),
      unitPrice: parseFloat(inventoryForm.unitPrice),
      supplier: inventoryForm.supplier,
      lastRestockDate: inventoryForm.lastRestockDate,
      expiryDate: inventoryForm.expiryDate || undefined,
      status: inventoryForm.status
    };

    if (editingInventory) {
      setInventory(prev => prev.map(i => i.id === editingInventory.id ? newInventory : i));
    } else {
      setInventory(prev => [...prev, newInventory]);
    }

    setShowInventoryModal(false);
    setEditingInventory(null);
  };

  const handleDeleteInventory = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguyên vật liệu này?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleRestock = (id: number) => {
    const quantity = prompt('Nhập số lượng cần nhập kho:');
    if (quantity && !isNaN(parseFloat(quantity))) {
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          const newStock = item.currentStock + parseFloat(quantity);
          return {
            ...item,
            currentStock: newStock,
            lastRestockDate: new Date().toISOString().split('T')[0],
            status: newStock <= item.minStock ? 'low_stock' : newStock >= item.maxStock ? 'out_of_stock' : 'in_stock'
          };
        }
        return item;
      }));
    }
  };

  // QR Code Scanning Functions
  const handleOpenQRScanner = () => {
    setShowQRScannerModal(true);
    setScannedCode('');
    setScannedItem(null);
    setIsScanning(false);
  };

  const handleScanQRCode = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      // Generate a random item from inventory for demo
      const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
      setScannedCode(`INV-${randomItem.id}-${Date.now()}`);
      setScannedItem(randomItem);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualCodeInput = (code: string) => {
    // Parse code format: INV-{id}-{timestamp}
    const match = code.match(/INV-(\d+)-/);
    if (match) {
      const itemId = parseInt(match[1]);
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        setScannedItem(item);
        setScannedCode(code);
      } else {
        alert('Không tìm thấy sản phẩm với mã này!');
      }
    } else {
      alert('Mã không hợp lệ! Vui lòng nhập đúng định dạng.');
    }
  };

  const handleQRRestock = () => {
    if (!scannedItem) return;
    
    const quantity = prompt(`Nhập số lượng cần nhập kho cho ${scannedItem.name}:`);
    if (quantity && !isNaN(parseFloat(quantity))) {
      setInventory(prev => prev.map(item => {
        if (item.id === scannedItem.id) {
          const newStock = item.currentStock + parseFloat(quantity);
          return {
            ...item,
            currentStock: newStock,
            lastRestockDate: new Date().toISOString().split('T')[0],
            status: newStock <= item.minStock ? 'low_stock' : newStock >= item.maxStock ? 'out_of_stock' : 'in_stock'
          };
        }
        return item;
      }));
      
      alert(`Đã nhập kho thành công ${quantity} ${scannedItem.unit} ${scannedItem.name}!`);
      setShowQRScannerModal(false);
      setScannedItem(null);
      setScannedCode('');
    }
  };

  const generateQRCodeForItem = (item: InventoryItem) => {
    // Generate QR code data for inventory item
    return `INV-${item.id}-${item.name}-${Date.now()}`;
  };

  // Movement QR Scanner Functions
  const handleOpenMovementQRScanner = () => {
    setShowMovementQRScannerModal(true);
    setScannedCode('');
    setScannedItem(null);
    setIsScanning(false);
    setEditingMovement(null);
  };

  const handleScanMovementQRCode = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      // Generate a random item from inventory for demo
      const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
      setScannedCode(`MOV-${randomItem.id}-${Date.now()}`);
      setScannedItem(randomItem);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualMovementCodeInput = (code: string) => {
    // Parse code format: MOV-{id}-{timestamp}
    const match = code.match(/MOV-(\d+)-/);
    if (match) {
      const itemId = parseInt(match[1]);
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        setScannedItem(item);
        setScannedCode(code);
        // Pre-fill movement form with scanned item
        setMovementForm({
          inventoryItemId: item.id,
          quantity: '',
          reason: `Quét mã QR cho ${item.name}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          notes: ''
        });
      } else {
        alert('Không tìm thấy sản phẩm với mã này!');
      }
    } else {
      alert('Mã không hợp lệ! Vui lòng nhập đúng định dạng MOV-[ID]-[TIMESTAMP].');
    }
  };

  const handleRecordMovement = () => {
    setEditingMovement(null);
    setMovementForm({
      inventoryItemId: 0,
      quantity: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    });
    setShowMovementModal(true);
  };

  const handleEditMovement = (transaction: InventoryTransaction) => {
    setEditingMovement(transaction);
    setMovementForm({
      inventoryItemId: transaction.inventoryItemId,
      quantity: transaction.quantity.toString(),
      reason: transaction.reason,
      date: transaction.date,
      time: transaction.time,
      notes: transaction.notes || ''
    });
    setShowMovementModal(true);
  };

  const handleSaveMovement = () => {
    if (!movementForm.inventoryItemId || !movementForm.quantity || !movementForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const item = inventory.find(i => i.id === movementForm.inventoryItemId);
    if (!item) {
      alert('Không tìm thấy sản phẩm!');
      return;
    }

    const newMovement: InventoryTransaction = {
      id: editingMovement ? editingMovement.id : Date.now(),
      inventoryItemId: movementForm.inventoryItemId,
      itemName: item.name,
      transactionType: movementForm.quantity.startsWith('-') ? 'out' : 'in',
      quantity: Math.abs(parseFloat(movementForm.quantity)),
      unitPrice: item.unitPrice,
      totalValue: Math.abs(parseFloat(movementForm.quantity)) * item.unitPrice,
      reference: editingMovement ? editingMovement.reference : `MOV-${Date.now()}`,
      reason: movementForm.reason,
      date: movementForm.date,
      time: movementForm.time,
      createdBy: 'Nguyễn Thị Hanh',
      approvedBy: 'Trần Văn Bảo',
      status: 'completed',
      supplier: item.supplier,
      notes: movementForm.notes
    };

    if (editingMovement) {
      setInventoryTransactions(prev => prev.map(t => t.id === editingMovement.id ? newMovement : t));
    } else {
      setInventoryTransactions(prev => [...prev, newMovement]);
    }

    // Update inventory stock
    const stockChange = newMovement.transactionType === 'in' ? newMovement.quantity : -newMovement.quantity;
    setInventory(prev => prev.map(item => {
      if (item.id === newMovement.inventoryItemId) {
        const newStock = item.currentStock + stockChange;
        return {
          ...item,
          currentStock: newStock,
          lastRestockDate: newMovement.date,
          status: newStock <= item.minStock ? 'low_stock' : newStock >= item.maxStock ? 'out_of_stock' : 'in_stock'
        };
      }
      return item;
    }));

    setShowMovementModal(false);
    setEditingMovement(null);
    setMovementForm({
      inventoryItemId: 0,
      quantity: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    });

    alert(`Đã ghi nhận ${newMovement.transactionType === 'in' ? 'nhập kho' : 'xuất kho'} ${Math.abs(newMovement.quantity)} ${item.unit} ${item.name} thành công!`);
  };

  const handleDeleteMovement = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      setInventoryTransactions(prev => prev.filter(t => t.id !== id));
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
          { id: 'movements', label: 'Khi suất kho', icon: ShoppingCart },
          { id: 'analytics', label: 'Phân tích', icon: TrendingUp },
          { id: 'suppliers', label: 'Nhà cung cấp', icon: Users },
          { id: 'budget', label: 'Ngân sách', icon: Calendar },
          { id: 'reports', label: 'Báo cáo', icon: FileText }
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
              <div className="flex gap-2">
                <Button variant="secondary" onClick={refreshDataFromLocalStorage}>
                  <Download size={16}/> Làm mới
                </Button>
                <Button onClick={handleAddTransaction}>
                  <Plus size={16}/> Thêm giao dịch
                </Button>
              </div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package size={20} className="text-orange-500"/> Quản lý Nguyên vật
              </h3>
              <div className="flex gap-2">
                <Button onClick={handleOpenQRScanner} variant="success">
                  <QrCode size={16}/> Quét mã nhập kho
                </Button>
                <Button onClick={handleAddInventory}>
                  <Plus size={16}/> Thêm nguyên vật
                </Button>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  // Filter logic here
                }}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              >
                Tất cả ({inventory.length})
              </button>
              <button
                onClick={() => {
                  // Filter logic here
                }}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
              >
                Thực phẩm ({inventory.filter(i => i.category === 'food_ingredient').length})
              </button>
              <button
                onClick={() => {
                  // Filter logic here
                }}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
              >
                Đồ uống ({inventory.filter(i => i.category === 'beverage').length})
              </button>
              <button
                onClick={() => {
                  // Filter logic here
                }}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
              >
                Bao bì ({inventory.filter(i => i.category === 'packaging').length})
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inventory.map(item => (
                <div key={item.id} className={`border rounded-lg p-4 ${
                  item.status === 'out_of_stock' 
                    ? 'border-red-200 bg-red-50' 
                    : item.status === 'low_stock' 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'out_of_stock' 
                        ? 'bg-red-100 text-red-800' 
                        : item.status === 'low_stock' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'out_of_stock' ? 'Hết hàng' : item.status === 'low_stock' ? 'Sắp hết' : 'Còn đủ'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="font-medium">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tối thiểu:</span>
                      <span className="text-gray-500">{item.minStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá:</span>
                      <span className="font-medium">{formatCurrency(item.unitPrice)}/{item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NCC:</span>
                      <span className="text-xs text-gray-500 truncate">{item.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhập kho:</span>
                      <span className="text-xs text-gray-500">{item.lastRestockDate}</span>
                    </div>
                    {item.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">HSD:</span>
                        <span className="text-xs text-gray-500">{item.expiryDate}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Stock Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.status === 'out_of_stock' 
                            ? 'bg-red-500' 
                            : item.status === 'low_stock' 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{item.minStock}</span>
                      <span>{item.maxStock}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditInventory(item)}
                      className="flex-1"
                    >
                      <Edit size={12}/>
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleRestock(item.id)}
                      className="flex-1"
                    >
                      <Plus size={12}/>
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        const qrCode = generateQRCodeForItem(item);
                        alert(`Mã QR cho ${item.name}:\n${qrCode}\n\nSử dụng mã này để quét khi nhập kho!`);
                      }}
                      className="flex-1"
                    >
                      <QrCode size={12}/>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteInventory(item.id)}
                      className="flex-1"
                    >
                      <Trash2 size={12}/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Movements Tab */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-500"/> Khi suất kho
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={refreshDataFromLocalStorage}>
                  <Download size={16}/> Làm mới
                </Button>
                <Button variant="success" onClick={handleOpenMovementQRScanner}>
                  <QrCode size={16}/> Quét mã khi suất
                </Button>
                <Button onClick={handleRecordMovement}>
                  <Plus size={16}/> Ghi nhận khi suất
                </Button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-600">Tổng nhập kho</span>
                  <TrendingUp size={16} className="text-green-500"/>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {inventoryTransactions.filter(t => t.transactionType === 'in').reduce((sum, t) => sum + t.quantity, 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatCurrency(inventoryTransactions.filter(t => t.transactionType === 'in').reduce((sum, t) => sum + t.totalValue, 0))}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-600">Tổng xuất kho</span>
                  <TrendingDown size={16} className="text-red-500"/>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {inventoryTransactions.filter(t => t.transactionType === 'out').reduce((sum, t) => sum + t.quantity, 0)}
                </p>
                <p className="text-xs text-red-600">
                  {formatCurrency(inventoryTransactions.filter(t => t.transactionType === 'out').reduce((sum, t) => sum + t.totalValue, 0))}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">Net change</span>
                  <Package size={16} className="text-blue-500"/>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {inventoryTransactions.filter(t => t.transactionType === 'in').reduce((sum, t) => sum + t.quantity, 0) - 
                   inventoryTransactions.filter(t => t.transactionType === 'out').reduce((sum, t) => sum + t.quantity, 0)}
                </p>
                <p className="text-xs text-blue-600">
                  {formatCurrency(inventoryTransactions.filter(t => t.transactionType === 'in').reduce((sum, t) => sum + t.totalValue, 0) - 
                           inventoryTransactions.filter(t => t.transactionType === 'out').reduce((sum, t) => sum + t.totalValue, 0))}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-600">Tổng giao dịch</span>
                  <FileText size={16} className="text-purple-500"/>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {inventoryTransactions.length}
                </p>
                <p className="text-xs text-purple-600">Trong 7 ngày gần nhất</p>
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Tất cả ({inventoryTransactions.length})
              </button>
              <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Nhập kho ({inventoryTransactions.filter(t => t.transactionType === 'in').length})
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Xuất kho ({inventoryTransactions.filter(t => t.transactionType === 'out').length})
              </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng giá</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventoryTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{transaction.date}</td>
                      <td className="px-4 py-3 text-sm">{transaction.time}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transactionType === 'in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transactionType === 'in' ? 'Nhập kho' : 'Xuất kho'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{transaction.itemName}</td>
                      <td className="px-4 py-3 text-sm">{transaction.quantity}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(transaction.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(transaction.totalValue)}</td>
                      <td className="px-4 py-3 text-sm">{transaction.reason}</td>
                      <td className="px-4 py-3 text-sm">{transaction.createdBy}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditMovement(transaction)}
                          >
                            <Edit size={14}/>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteMovement(transaction.id)}
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

          {/* Inventory Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-500"/> Báo cáo khi suất kho
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inventoryReports.map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800">{report.period}</h4>
                      <p className="text-sm text-gray-600">{report.startDate} - {report.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giao dịch nhập</label>
                      <p className="text-lg font-bold text-green-600">{report.totalInTransactions}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(report.totalValueIn)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giao dịch xuất</label>
                      <p className="text-lg font-bold text-red-600">{report.totalOutTransactions}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(report.totalValueOut)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thay đổi ròng</label>
                    <p className={`text-lg font-bold ${report.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(report.netChange)}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Sản phẩm hoạt động nhiều nhất:</h5>
                    <div className="space-y-2">
                      {report.topItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{item.itemName}</span>
                          <div className="text-right">
                            <span className="font-medium">{item.transactionCount} lần</span>
                            <span className="text-gray-500 ml-2">{item.totalQuantity} {item.totalValue > 0 && `(${formatCurrency(item.totalValue)})`}</span>
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-500"/> Phân tích Tài chính Tổng hợp
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-600">Tổng Doanh thu</span>
                  <TrendingUp size={16} className="text-green-500"/>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculateFinancialSummary().totalRevenue)}
                </p>
                <p className="text-xs text-green-600">
                  {calculateFinancialSummary().transactionCount} giao dịch
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-600">Tổng Chi phí</span>
                  <TrendingDown size={16} className="text-red-500"/>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(calculateFinancialSummary().totalCost)}
                </p>
                <p className="text-xs text-red-600">
                  {calculateFinancialSummary().movementCount} khi suất
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">Lợi nhuận</span>
                  <Package size={16} className="text-blue-500"/>
                </div>
                <p className={`text-2xl font-bold ${calculateFinancialSummary().totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(calculateFinancialSummary().totalProfit)}
                </p>
                <p className="text-xs text-blue-600">
                  Biên lợi nhuận: {calculateFinancialSummary().profitMargin}%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-600">Hiệu quả</span>
                  <CheckCircle size={16} className="text-purple-500"/>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {parseFloat(calculateFinancialSummary().profitMargin) > 20 ? 'Tốt' : 
                   parseFloat(calculateFinancialSummary().profitMargin) > 10 ? 'Khá tốt' : 
                   parseFloat(calculateFinancialSummary().profitMargin) > 0 ? 'Trung bình' : 'Cần cải thiện'}
                </p>
                <p className="text-xs text-purple-600">
                  Dựa trên biên lợi nhuận
                </p>
              </div>
            </div>
          </div>

          {/* Product Performance Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-500"/> Phân tích Hiệu suất Sản phẩm
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lợi nhuận</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biên lợi nhuận</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giao dịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {calculateProductAnalytics().slice(0, 10).map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-sm">{product.totalQuantity}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(product.totalRevenue)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(product.totalCost)}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(product.profit)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(product.profitMargin) >= 20 
                            ? 'bg-green-100 text-green-800' 
                            : parseFloat(product.profitMargin) >= 10 
                            ? 'bg-blue-100 text-blue-800' 
                            : parseFloat(product.profitMargin) >= 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.profitMargin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.movementCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-orange-500"/> Đề xuất Kế hoạch Nguyên vật
            </h3>
            
            <div className="space-y-4">
              {generateInventoryRecommendations().slice(0, 8).map((rec, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  rec.priority === 'high' 
                    ? 'border-red-200 bg-red-50' 
                    : rec.priority === 'medium' 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{rec.product}</h4>
                      <p className="text-xs text-gray-600">Nhà cung cấp: {rec.supplier}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : rec.priority === 'medium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority === 'high' ? 'Ưu tiên cao' : rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <p className="font-medium">{rec.currentStock}/{rec.maxStock}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá:</span>
                      <p className="font-medium">{formatCurrency(rec.unitPrice)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bán/ngày:</span>
                      <p className="font-medium">{rec.dailySales.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Hành động:</span>
                      <p className="font-medium">{rec.action}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                  </div>
                  
                  {rec.action === 'restock' && (
                    <Button variant="success" size="sm" className="mt-2">
                      <Plus size={14}/> Nhập kho ngay
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500"/> Đề xuất Chiến lược
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500"/> Tối ưu hóa Lợi nhuận
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Tập trung vào các sản phẩm có biên lợi nhuận &gt; 20%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Giảm hoặc loại bỏ sản phẩm đang lỗ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Tăng giá cho các sản phẩm có nhu cầu cao</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Tạo combo để tăng giá trị đơn hàng</span>
                  </li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-blue-500"/> Quản lý Tồn kho
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Duy trì tồn kho tối thiểu 7 ngày</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Nhập hàng theo lịch định kỳ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Theo dõi hàng tồn kho thấp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Tối ưu nhà cung cấp uy tín</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500"/> Lập kế hoạch Ngân sách
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Phân bổ ngân sách theo sản phẩm bán chạy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Dự trù 10% cho chi phí phát sinh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Đánh giá hiệu quả hàng tháng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Điều chỉnh kế hoạch theo thực tế</span>
                  </li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Users size={16} className="text-orange-500"/> Quan hệ Nhà cung cấp
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Đàm phán giá với các nhà cung cấp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Ký hợp dài hạn để có giá tốt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Đa dạng nhà cung cấp dự phòng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Đánh giá hiệu suất định kỳ</span>
                  </li>
                </ul>
              </div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-purple-500"/> Báo cáo tài chính
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Download size={16}/> In báo cáo
                </Button>
                <Button variant="success" onClick={handleGenerateReport}>
                  <Plus size={16}/> Tạo báo cáo mới
                </Button>
              </div>
            </div>
            
            {/* Report Period Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại báo cáo</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="monthly">Báo cáo tháng</option>
                  <option value="quarterly">Báo cáo quý</option>
                  <option value="yearly">Báo cáo năm</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue={new Date(new Date().setDate(1)).toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-600">Tổng Doanh thu</span>
                  <TrendingUp size={16} className="text-green-500"/>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(calculateFinancialSummary().totalRevenue)}
                </p>
                <p className="text-xs text-green-600">
                  {calculateFinancialSummary().transactionCount} giao dịch
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-600">Tổng Chi phí</span>
                  <TrendingDown size={16} className="text-red-500"/>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(calculateFinancialSummary().totalCost)}
                </p>
                <p className="text-xs text-red-600">
                  {calculateFinancialSummary().movementCount} khi suất
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">Lợi nhuận</span>
                  <Package size={16} className="text-blue-500"/>
                </div>
                <p className={`text-2xl font-bold ${calculateFinancialSummary().totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(calculateFinancialSummary().totalProfit)}
                </p>
                <p className="text-xs text-blue-600">
                  Biên lợi nhuận: {calculateFinancialSummary().profitMargin}%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-600">Hiệu quả</span>
                  <CheckCircle size={16} className="text-purple-500"/>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {parseFloat(calculateFinancialSummary().profitMargin) > 20 ? 'Tốt' : 
                   parseFloat(calculateFinancialSummary().profitMargin) > 10 ? 'Khá tốt' : 
                   parseFloat(calculateFinancialSummary().profitMargin) > 0 ? 'Trung bình' : 'Cần cải thiện'}
                </p>
                <p className="text-xs text-purple-600">
                  Dựa trên biên lợi nhuận
                </p>
              </div>
            </div>
            
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
                          <span className="text-sm text-gray-600">{trend.month}</span>
                          <span className="text-sm font-medium">{formatCurrency(trend.amount)}</span>
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

          {/* Detailed Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500"/> Báo cáo chi tiết
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inventory Report */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Báo cáo tồn kho</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng giá trị tồn kho:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Số lượng sản phẩm:</span>
                    <span className="text-lg font-bold text-gray-800">{inventory.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sản phẩm hết hàng:</span>
                    <span className="text-lg font-bold text-red-600">
                      {inventory.filter(item => item.status === 'out_of_stock').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sản phẩm sắp hết:</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {inventory.filter(item => item.status === 'low_stock').length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Transaction Report */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-4">Báo cáo giao dịch</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng giao dịch:</span>
                    <span className="text-lg font-bold text-gray-800">{transactions.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giao dịch thành công:</span>
                    <span className="text-lg font-bold text-green-600">
                      {transactions.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giao dịch chờ duyệt:</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {transactions.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giao dịch bị hủy:</span>
                    <span className="text-lg font-bold text-red-600">
                      {transactions.filter(t => t.status === 'cancelled').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Download size={20} className="text-orange-500"/> Xuất báo cáo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="secondary" className="w-full" onClick={handleExportPDF}>
                <FileText size={16} className="mr-2"/>
                Xuất PDF
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleExportExcel}>
                <FileText size={16} className="mr-2"/>
                Xuất Excel
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleExportCSV}>
                <FileText size={16} className="mr-2"/>
                Xuất CSV
              </Button>
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <Modal 
          isOpen={showInventoryModal} 
          onClose={() => setShowInventoryModal(false)} 
          title={editingInventory ? 'Chỉnh sửa nguyên vật' : 'Thêm nguyên vật mới'}
        >
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên vật *</label>
                  <input
                    type="text"
                    value={inventoryForm.name}
                    onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập tên nguyên vật"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({...inventoryForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="food_ingredient">Nguyên liệu thực phẩm</option>
                    <option value="beverage">Đồ uống</option>
                    <option value="packaging">Bao bì</option>
                    <option value="cleaning">Gia vị & Chất tẩy</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                  <input
                    type="text"
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({...inventoryForm, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="kg, cái, chai, hộp..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp *</label>
                  <input
                    type="text"
                    value={inventoryForm.supplier}
                    onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tên nhà cung cấp"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho hiện tại *</label>
                  <input
                    type="number"
                    value={inventoryForm.currentStock}
                    onChange={(e) => setInventoryForm({...inventoryForm, currentStock: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối thiểu *</label>
                  <input
                    type="number"
                    value={inventoryForm.minStock}
                    onChange={(e) => setInventoryForm({...inventoryForm, minStock: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối đa *</label>
                  <input
                    type="number"
                    value={inventoryForm.maxStock}
                    onChange={(e) => setInventoryForm({...inventoryForm, maxStock: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá *</label>
                  <input
                    type="number"
                    value={inventoryForm.unitPrice}
                    onChange={(e) => setInventoryForm({...inventoryForm, unitPrice: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhập kho *</label>
                  <input
                    type="date"
                    value={inventoryForm.lastRestockDate}
                    onChange={(e) => setInventoryForm({...inventoryForm, lastRestockDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={inventoryForm.expiryDate}
                    onChange={(e) => setInventoryForm({...inventoryForm, expiryDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                  <select
                    value={inventoryForm.status}
                    onChange={(e) => setInventoryForm({...inventoryForm, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="in_stock">Còn đủ</option>
                    <option value="low_stock">Sắp hết</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowInventoryModal(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveInventory}
                disabled={!inventoryForm.name || !inventoryForm.unit || !inventoryForm.supplier || !inventoryForm.currentStock || !inventoryForm.minStock || !inventoryForm.maxStock || !inventoryForm.unitPrice}
              >
                Lưu nguyên vật
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      {showQRScannerModal && (
        <Modal 
          isOpen={showQRScannerModal} 
          onClose={() => setShowQRScannerModal(false)} 
          title="Quét mã QR nhập kho"
        >
          <div className="p-6">
            <div className="space-y-6">
              {/* Scanner Area */}
              <div className="text-center">
                <div className={`w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${
                  isScanning ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'
                }`}>
                  {isScanning ? (
                    <>
                      <Camera size={48} className="text-blue-500 mb-2 animate-pulse"/>
                      <p className="text-blue-600 font-medium">Đang quét mã...</p>
                      <div className="w-16 h-1 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <QrCode size={48} className="text-gray-400 mb-2"/>
                      <p className="text-gray-600">Đặt mã QR vào camera</p>
                    </>
                  )}
                </div>
              </div>

              {/* Scanned Item Info */}
              {scannedItem && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600"/>
                    Đã quét thành công!
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Sản phẩm:</span>
                      <p className="font-medium">{scannedItem.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <p className="font-medium">{scannedItem.currentStock} {scannedItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Đơn giá:</span>
                      <p className="font-medium">{formatCurrency(scannedItem.unitPrice)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nhà cung cấp:</span>
                      <p className="font-medium text-xs">{scannedItem.supplier}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Mã quét:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded">{scannedCode}</p>
                  </div>
                </div>
              )}

              {/* Manual Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc nhập mã thủ công:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="INV-1-1640995200000"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    onClick={() => handleManualCodeInput(scannedCode)}
                    disabled={!scannedCode}
                  >
                    <Barcode size={16}/>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Định dạng: INV-[ID]-[TIMESTAMP]
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowQRScannerModal(false);
                    setScannedItem(null);
                    setScannedCode('');
                    setIsScanning(false);
                  }}
                  className="flex-1"
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleScanQRCode}
                  disabled={isScanning}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <Camera size={16} className="animate-pulse mr-2"/>
                      Đang quét...
                    </>
                  ) : (
                    <>
                      <Camera size={16} className="mr-2"/>
                      Quét mã QR
                    </>
                  )}
                </Button>
                {scannedItem && (
                  <Button
                    onClick={handleQRRestock}
                    variant="success"
                    className="flex-1"
                  >
                    <Plus size={16} className="mr-2"/>
                    Nhập kho
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn sử dụng:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click "Quét mã QR" để bắt đầu quét</li>
                  <li>• Đặt mã QR của sản phẩm vào camera</li>
                  <li>• Hoặc nhập mã thủ công nếu có sẵn</li>
                  <li>• Sau khi quét thành công, click "Nhập kho"</li>
                  <li>• Nhập số lượng cần nhập và xác nhận</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Movement QR Scanner Modal */}
      {showMovementQRScannerModal && (
        <Modal 
          isOpen={showMovementQRScannerModal} 
          onClose={() => setShowMovementQRScannerModal(false)} 
          title="Quét mã QR khi suất kho"
        >
          <div className="p-6">
            <div className="space-y-6">
              {/* Scanner Area */}
              <div className="text-center">
                <div className={`w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex flex-col items-center justify-center ${
                  isScanning ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'
                }`}>
                  {isScanning ? (
                    <>
                      <Camera size={48} className="text-blue-500 mb-2 animate-pulse"/>
                      <p className="text-blue-600 font-medium">Đang quét mã...</p>
                      <div className="w-16 h-1 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <QrCode size={48} className="text-gray-400 mb-2"/>
                      <p className="text-gray-600">Đặt mã QR khi suất vào camera</p>
                    </>
                  )}
                </div>
              </div>

              {/* Scanned Item Info */}
              {scannedItem && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600"/>
                    Đã quét thành công!
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Sản phẩm:</span>
                      <p className="font-medium">{scannedItem.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <p className="font-medium">{scannedItem.currentStock} {scannedItem.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Đơn giá:</span>
                      <p className="font-medium">{formatCurrency(scannedItem.unitPrice)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nhà cung cấp:</span>
                      <p className="font-medium text-xs">{scannedItem.supplier}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Mã quét:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded">{scannedCode}</p>
                  </div>
                </div>
              )}

              {/* Manual Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc nhập mã thủ công:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="MOV-1-1640995200000"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    onClick={() => handleManualMovementCodeInput(scannedCode)}
                    disabled={!scannedCode}
                  >
                    <Barcode size={16}/>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Định dạng: MOV-[ID]-[TIMESTAMP]
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowMovementQRScannerModal(false);
                    setScannedItem(null);
                    setScannedCode('');
                    setIsScanning(false);
                    setEditingMovement(null);
                  }}
                  className="flex-1"
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleScanMovementQRCode}
                  disabled={isScanning}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <Camera size={16} className="animate-pulse mr-2"/>
                      Đang quét...
                    </>
                  ) : (
                    <>
                      <Camera size={16} className="mr-2"/>
                      Quét mã QR
                    </>
                  )}
                </Button>
                {scannedItem && (
                  <Button
                    onClick={handleQRRestock}
                    variant="success"
                    className="flex-1"
                  >
                    <Plus size={16} className="mr-2"/>
                    Nhập kho
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn sử dụng:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click "Quét mã QR" để bắt đầu quét</li>
                  <li>• Đặt mã QR của sản phẩm vào camera</li>
                  <li>• Hoặc nhập mã thủ công nếu có sẵn</li>
                  <li>• Sau khi quét thành công, click "Nhập kho"</li>
                  <li>• Nhập số lượng (dùng dấu "-" cho xuất kho)</li>
                  <li>• Xác nhận và lưu giao dịch</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Movement Record Modal */}
      {showMovementModal && (
        <Modal 
          isOpen={showMovementModal} 
          onClose={() => setShowMovementModal(false)} 
          title={editingMovement ? 'Chỉnh sửa giao dịch' : 'Ghi nhận khi suất kho'}
        >
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm *</label>
                  <select
                    value={movementForm.inventoryItemId}
                    onChange={(e) => setMovementForm({...movementForm, inventoryItemId: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input
                    type="text"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
                    placeholder="Nhập số lượng (dùng '-' cho xuất kho)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khi suất *</label>
                <textarea
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Nhập lý do khi suất kho"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                  <input
                    type="date"
                    value={movementForm.date}
                    onChange={(e) => setMovementForm({...movementForm, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ *</label>
                  <input
                    type="time"
                    value={movementForm.time}
                    onChange={(e) => setMovementForm({...movementForm, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Ghi chú thêm thông tin"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowMovementModal(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveMovement}
                disabled={!movementForm.inventoryItemId || !movementForm.quantity || !movementForm.reason}
              >
                {editingMovement ? 'Cập nhật' : 'Lưu'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <Modal 
          isOpen={showBudgetModal} 
          onClose={() => setShowBudgetModal(false)} 
          title={editingBudget ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách mới'}
        >
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân sách *</label>
                <input
                  type="text"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm({...budgetForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên ngân sách"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ *</label>
                <input
                  type="text"
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ví dụ: Tháng 1/2024"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={budgetForm.startDate}
                    onChange={(e) => setBudgetForm({...budgetForm, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={budgetForm.endDate}
                    onChange={(e) => setBudgetForm({...budgetForm, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng ngân sách *</label>
                  <input
                    type="number"
                    value={budgetForm.totalBudget}
                    onChange={(e) => setBudgetForm({...budgetForm, totalBudget: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đã phân bổ *</label>
                  <input
                    type="number"
                    value={budgetForm.allocatedBudget}
                    onChange={(e) => setBudgetForm({...budgetForm, allocatedBudget: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục ngân sách</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="food"
                      checked={budgetForm.categories.includes('food')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBudgetForm({...budgetForm, categories: [...budgetForm.categories, 'food']});
                        } else {
                          setBudgetForm({...budgetForm, categories: budgetForm.categories.filter(c => c !== 'food')});
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="food" className="text-sm text-gray-700">Đồ ăn</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="beverages"
                      checked={budgetForm.categories.includes('beverages')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBudgetForm({...budgetForm, categories: [...budgetForm.categories, 'beverages']});
                        } else {
                          setBudgetForm({...budgetForm, categories: budgetForm.categories.filter(c => c !== 'beverages')});
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="beverages" className="text-sm text-gray-700">Đồ uống</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="packaging"
                      checked={budgetForm.categories.includes('packaging')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBudgetForm({...budgetForm, categories: [...budgetForm.categories, 'packaging']});
                        } else {
                          setBudgetForm({...budgetForm, categories: budgetForm.categories.filter(c => c !== 'packaging')});
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="packaging" className="text-sm text-gray-700">Bao bì</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="utilities"
                      checked={budgetForm.categories.includes('utilities')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBudgetForm({...budgetForm, categories: [...budgetForm.categories, 'utilities']});
                        } else {
                          setBudgetForm({...budgetForm, categories: budgetForm.categories.filter(c => c !== 'utilities')});
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="utilities" className="text-sm text-gray-700">Chi phí vận hành</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="other"
                      checked={budgetForm.categories.includes('other')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBudgetForm({...budgetForm, categories: [...budgetForm.categories, 'other']});
                        } else {
                          setBudgetForm({...budgetForm, categories: budgetForm.categories.filter(c => c !== 'other')});
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="other" className="text-sm text-gray-700">Khác</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowBudgetModal(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveBudget}
                disabled={!budgetForm.name || !budgetForm.period || !budgetForm.totalBudget || !budgetForm.allocatedBudget}
              >
                {editingBudget ? 'Cập nhật' : 'Lưu'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CanteenFinanceView;
