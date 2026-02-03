import React, { useState, useEffect } from 'react';
import { Plus, Box, AlertTriangle, Edit, PenTool, Loader2, Search, Filter, Package, Truck, Utensils, Home, ChevronLeft, ChevronRight, X, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from './data';
import { InventoryItem, AIAnalysisResult } from './types';
import { Button, Card, Modal } from './components';
import { aiService } from './aiService';

const InventoryView = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // AI States
  const [isPredicting, setIsPredicting] = useState(false);
  const [predResult, setPredResult] = useState<AIAnalysisResult | null>(null);
  const [showPredModal, setShowPredModal] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form States
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'ELECTRONICS',
    quantity: 0,
    location: '',
    condition: 'GOOD',
    purchaseDate: '',
    warranty: '',
    notes: ''
  });

  // Auto Import States
  const [importSource, setImportSource] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    api.getInventory().then(setInventory);
  }, []);

  const handleAIPredict = async () => {
    setIsPredicting(true);
    try {
      const result = await aiService.inventory.predictMaintenance();
      setPredResult(result);
      setShowPredModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  // Filter and pagination logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler functions
  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: Date.now(),
      name: itemForm.name,
      category: itemForm.category,
      unit: 'cái',
      currentStock: itemForm.quantity,
      minStock: 1,
      maxStock: itemForm.quantity * 2,
      unitPrice: 0,
      supplier: 'Nhà cung cấp',
      lastRestockDate: itemForm.purchaseDate || new Date().toISOString().split('T')[0],
      status: itemForm.quantity > 0 ? 'in_stock' : 'out_of_stock',
      quantity: itemForm.quantity,
      location: itemForm.location,
      condition: itemForm.condition as 'GOOD' | 'FAIR' | 'POOR' | 'MAINTENANCE',
      purchaseDate: itemForm.purchaseDate || new Date().toISOString().split('T')[0],
      warranty: itemForm.warranty,
      notes: itemForm.notes
    };
    
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
    setItemForm({
      name: '',
      category: 'ELECTRONICS',
      quantity: 0,
      location: '',
      condition: 'GOOD',
      purchaseDate: '',
      warranty: '',
      notes: ''
    });
    alert('Đã thêm tài sản mới thành công!');
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      condition: item.condition,
      purchaseDate: item.purchaseDate || '',
      warranty: item.warranty || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;
    
    const updatedInventory = inventory.map(item => 
      item.id === selectedItem.id 
        ? { ...item, ...itemForm }
        : item
    );
    
    setInventory(updatedInventory);
    setShowEditModal(false);
    setSelectedItem(null);
    setItemForm({
      name: '',
      category: 'ELECTRONICS',
      quantity: 0,
      location: '',
      condition: 'GOOD',
      purchaseDate: '',
      warranty: '',
      notes: ''
    });
    alert('Đã cập nhật tài sản thành công!');
  };

  const handleAutoImport = () => {
    let newItems: InventoryItem[] = [];
    
    if (importSource === 'ktx') {
      newItems = [
        {
          id: Date.now() + 1,
          name: 'Máy lạnh KTX Tầng 1',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 5,
          minStock: 1,
          maxStock: 10,
          unitPrice: 5000000,
          supplier: 'Samsung Electronics',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 5,
          location: 'KTX Tầng 1 - Phòng 101-105',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '24 tháng'
        },
        {
          id: Date.now() + 2,
          name: 'Bàn ghế học tập KTX',
          category: 'FURNITURE',
          unit: 'bộ',
          currentStock: 20,
          minStock: 5,
          maxStock: 40,
          unitPrice: 1500000,
          supplier: 'Nội thất ABC',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 20,
          location: 'KTX Tầng 2 - Phòng học',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '12 tháng'
        },
        {
          id: Date.now() + 3,
          name: 'Máy giặt KTX',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 3,
          minStock: 1,
          maxStock: 6,
          unitPrice: 8000000,
          supplier: 'LG Electronics',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 3,
          location: 'KTX Tầng 1 - Phòng giặt',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '18 tháng'
        }
      ];
    } else if (importSource === 'canteen') {
      newItems = [
        {
          id: Date.now() + 4,
          name: 'Bếp điện công nghiệp',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 2,
          minStock: 1,
          maxStock: 4,
          unitPrice: 15000000,
          supplier: 'Bếp Việt',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 2,
          location: 'Căn tin - Bếp chính',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '12 tháng'
        },
        {
          id: Date.now() + 5,
          name: 'Bàn ghế ăn',
          category: 'FURNITURE',
          unit: 'bộ',
          currentStock: 50,
          minStock: 10,
          maxStock: 100,
          unitPrice: 800000,
          supplier: 'Nội thất XYZ',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 50,
          location: 'Căn tin - Khu vực ăn',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '24 tháng'
        },
        {
          id: Date.now() + 6,
          name: 'Tủ lạnh công nghiệp',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 4,
          minStock: 1,
          maxStock: 8,
          unitPrice: 25000000,
          supplier: 'Sanaky',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 4,
          location: 'Căn tin - Kho thực phẩm',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '36 tháng'
        }
      ];
    } else if (importSource === 'new') {
      newItems = [
        {
          id: Date.now() + 7,
          name: 'Máy chiếu thông minh',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 8,
          minStock: 2,
          maxStock: 16,
          unitPrice: 12000000,
          supplier: 'Epson Vietnam',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 8,
          location: 'Phòng họp lớn',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '24 tháng'
        },
        {
          id: Date.now() + 8,
          name: 'Bảng tương tác thông minh',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 5,
          minStock: 1,
          maxStock: 10,
          unitPrice: 45000000,
          supplier: 'Smart Board',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 5,
          location: 'Phòng học A1-A5',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '36 tháng'
        },
        {
          id: Date.now() + 9,
          name: 'Máy tính xách tay giáo viên',
          category: 'ELECTRONICS',
          unit: 'cái',
          currentStock: 15,
          minStock: 3,
          maxStock: 30,
          unitPrice: 25000000,
          supplier: 'Dell Vietnam',
          lastRestockDate: new Date().toISOString().split('T')[0],
          status: 'in_stock',
          quantity: 15,
          location: 'Phòng giáo viên',
          condition: 'GOOD',
          purchaseDate: new Date().toISOString().split('T')[0],
          warranty: '12 tháng'
        }
      ];
    }
    
    setInventory([...inventory, ...newItems]);
    setShowAutoImportModal(false);
    setImportSource('');
    alert(`Đã nhập kho thành công ${newItems.length} tài sản từ ${importSource === 'ktx' ? 'KTX' : importSource === 'canteen' ? 'Căn tin' : 'thiết bị mới'}!`);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tài sản & Thiết bị</h2>
           <p className="text-gray-500">Quản lý cơ sở vật chất nhà trường</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
             onClick={handleAIPredict}
             disabled={isPredicting}
           >
             {isPredicting ? <Loader2 size={18} className="animate-spin"/> : <PenTool size={18}/>}
             {isPredicting ? 'Đang quét...' : 'AI Dự báo Bảo trì'}
           </Button>
           <Button onClick={() => setShowAutoImportModal(true)}>
             <Package size={20}/> Nhập Kho Tự Động
           </Button>
           <Button onClick={() => setShowAddModal(true)}>
             <Plus size={20}/> Nhập Kho
           </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
         <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                     type="text" 
                     placeholder="Tìm kiếm tài sản, vị trí, danh mục..." 
                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
               <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500"/>
                  <select 
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                     <option value="all">Tất cả danh mục</option>
                     <option value="ELECTRONICS">Điện tử</option>
                     <option value="FURNITURE">Nội thất</option>
                     <option value="SPORTS">Thể thao</option>
                     <option value="LAB">Thiết bị lab</option>
                     <option value="OFFICE">Văn phòng</option>
                  </select>
               </div>
               
               <div>
                  <select 
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  >
                     <option value="all">Tất cả tình trạng</option>
                     <option value="GOOD">Tốt</option>
                     <option value="FAIR">Khá</option>
                     <option value="POOR">Kém</option>
                     <option value="MAINTENANCE">Bảo trì</option>
                  </select>
               </div>
            </div>
         </div>
         
         {/* Results count */}
         <div className="mt-3 text-sm text-gray-600">
            Hiển thị {paginatedInventory.length} / {filteredInventory.length} tài sản
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
               <th className="p-4">Tên thiết bị</th>
               <th className="p-4">Danh mục</th>
               <th className="p-4 text-center">Số lượng</th>
               <th className="p-4">Vị trí</th>
               <th className="p-4 text-center">Tình trạng</th>
               <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {paginatedInventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                   <td className="p-4 font-medium text-gray-800">{item.name}</td>
                   <td className="p-4 text-gray-600">{item.category}</td>
                   <td className="p-4 text-center font-bold">{item.quantity}</td>
                   <td className="p-4 text-gray-600">{item.location}</td>
                   <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                         item.condition === 'GOOD' ? 'bg-green-100 text-green-700' : 
                         item.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-700' :
                         item.condition === 'POOR' ? 'bg-red-100 text-red-700' :
                         'bg-orange-100 text-orange-700'
                      }`}>
                         {item.condition === 'GOOD' ? 'Tốt' : 
                          item.condition === 'FAIR' ? 'Khá' :
                          item.condition === 'POOR' ? 'Kém' : 'Bảo trì'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <Edit size={18}/>
                      </button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showPredModal} onClose={() => setShowPredModal(false)} title="AI Quản lý Tài sản (Inventory AI)">
         {predResult && (
            <div className="space-y-4">
               <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2">{predResult.title}</h4>
                  <p className="text-orange-700 text-sm">{predResult.summary}</p>
               </div>
               
               {predResult.dataPoints && (
                  <div className="text-center py-4">
                     <div className="text-gray-500 text-sm">{predResult.dataPoints[0].label}</div>
                     <div className="text-3xl font-bold text-red-600">{predResult.dataPoints[0].value}</div>
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Cảnh báo & Đề xuất:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {predResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowPredModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddModal} onClose={() => {
        setShowAddModal(false);
        setItemForm({
          name: '',
          category: 'ELECTRONICS',
          quantity: 0,
          location: '',
          condition: 'GOOD',
          purchaseDate: '',
          warranty: '',
          notes: ''
        });
      }} title="Nhập Kho Tài Sản Mới">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    placeholder="Nhập tên tài sản..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({...itemForm, quantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  >
                     <option value="ELECTRONICS">Điện tử</option>
                     <option value="FURNITURE">Nội thất</option>
                     <option value="SPORTS">Thể thao</option>
                     <option value="LAB">Thiết bị lab</option>
                     <option value="OFFICE">Văn phòng</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({...itemForm, condition: e.target.value})}
                  >
                     <option value="GOOD">Tốt</option>
                     <option value="FAIR">Khá</option>
                     <option value="POOR">Kém</option>
                     <option value="MAINTENANCE">Bảo trì</option>
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={itemForm.location}
                 onChange={(e) => setItemForm({...itemForm, location: e.target.value})}
                 placeholder="Phòng A1, KTX Tầng 1..."
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.purchaseDate}
                    onChange={(e) => setItemForm({...itemForm, purchaseDate: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.warranty}
                    onChange={(e) => setItemForm({...itemForm, warranty: e.target.value})}
                    placeholder="12 tháng, 24 tháng..."
                  />
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={3}
                 value={itemForm.notes}
                 onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                 placeholder="Ghi chú về tài sản..."
               />
            </div>
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => {
                  setShowAddModal(false);
                  setItemForm({
                    name: '',
                    category: 'ELECTRONICS',
                    quantity: 0,
                    location: '',
                    condition: 'GOOD',
                    purchaseDate: '',
                    warranty: '',
                    notes: ''
                  });
               }}>
                  Hủy
               </Button>
               <Button onClick={handleAddItem}>
                  <Plus size={16}/> Nhập Kho
               </Button>
            </div>
         </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={showEditModal} onClose={() => {
        setShowEditModal(false);
        setSelectedItem(null);
        setItemForm({
          name: '',
          category: 'ELECTRONICS',
          quantity: 0,
          location: '',
          condition: 'GOOD',
          purchaseDate: '',
          warranty: '',
          notes: ''
        });
      }} title="Chỉnh sửa Tài Sản">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    placeholder="Nhập tên tài sản..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({...itemForm, quantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                  >
                     <option value="ELECTRONICS">Điện tử</option>
                     <option value="FURNITURE">Nội thất</option>
                     <option value="SPORTS">Thể thao</option>
                     <option value="LAB">Thiết bị lab</option>
                     <option value="OFFICE">Văn phòng</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({...itemForm, condition: e.target.value})}
                  >
                     <option value="GOOD">Tốt</option>
                     <option value="FAIR">Khá</option>
                     <option value="POOR">Kém</option>
                     <option value="MAINTENANCE">Bảo trì</option>
                  </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={itemForm.location}
                 onChange={(e) => setItemForm({...itemForm, location: e.target.value})}
                 placeholder="Phòng A1, KTX Tầng 1..."
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.purchaseDate}
                    onChange={(e) => setItemForm({...itemForm, purchaseDate: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={itemForm.warranty}
                    onChange={(e) => setItemForm({...itemForm, warranty: e.target.value})}
                    placeholder="12 tháng, 24 tháng..."
                  />
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={3}
                 value={itemForm.notes}
                 onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                 placeholder="Ghi chú về tài sản..."
               />
            </div>
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                  setItemForm({
                    name: '',
                    category: 'ELECTRONICS',
                    quantity: 0,
                    location: '',
                    condition: 'GOOD',
                    purchaseDate: '',
                    warranty: '',
                    notes: ''
                  });
               }}>
                  Hủy
               </Button>
               <Button onClick={handleUpdateItem}>
                  <CheckCircle size={16}/> Cập nhật
               </Button>
            </div>
         </div>
      </Modal>

      {/* Auto Import Modal */}
      <Modal isOpen={showAutoImportModal} onClose={() => {
        setShowAutoImportModal(false);
        setImportSource('');
      }} title="Nhập Kho Tự Động">
         <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <h4 className="font-bold text-blue-800 mb-2">Nhập kho tự động từ các hệ thống</h4>
               <p className="text-blue-700 text-sm">
                  Chọn nguồn để tự động nhập các tài sản tương ứng vào kho.
               </p>
            </div>
            
            <div className="space-y-3">
               <button
                 onClick={() => setImportSource('ktx')}
                 className={`w-full p-4 border-2 rounded-lg transition-all ${
                   importSource === 'ktx'
                     ? 'border-blue-500 bg-blue-50'
                     : 'border-gray-200 hover:border-gray-300'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <Home className={`w-8 h-8 ${importSource === 'ktx' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                       <div className="font-medium">Ký túc xá</div>
                       <div className="text-sm text-gray-500">Máy lạnh, bàn ghế, máy giặt...</div>
                    </div>
                 </div>
               </button>
               
               <button
                 onClick={() => setImportSource('canteen')}
                 className={`w-full p-4 border-2 rounded-lg transition-all ${
                   importSource === 'canteen'
                     ? 'border-blue-500 bg-blue-50'
                     : 'border-gray-200 hover:border-gray-300'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <Utensils className={`w-8 h-8 ${importSource === 'canteen' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                       <div className="font-medium">Căn tin</div>
                       <div className="text-sm text-gray-500">Bếp công nghiệp, bàn ghế, tủ lạnh...</div>
                    </div>
                 </div>
               </button>
               
               <button
                 onClick={() => setImportSource('new')}
                 className={`w-full p-4 border-2 rounded-lg transition-all ${
                   importSource === 'new'
                     ? 'border-blue-500 bg-blue-50'
                     : 'border-gray-200 hover:border-gray-300'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <Package className={`w-8 h-8 ${importSource === 'new' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                       <div className="font-medium">Thiết bị mới</div>
                       <div className="text-sm text-gray-500">Máy chiếu, bảng tương tác, laptop...</div>
                    </div>
                 </div>
               </button>
            </div>
            
            {importSource && (
               <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                     <CheckCircle className="text-green-600" size={20}/>
                     <h5 className="font-semibold text-green-800">Đã chọn: {importSource === 'ktx' ? 'Ký túc xá' : importSource === 'canteen' ? 'Căn tin' : 'Thiết bị mới'}</h5>
                  </div>
                  <p className="text-green-700 text-sm">
                     Sẽ nhập 3 tài sản mẫu từ {importSource === 'ktx' ? 'KTX' : importSource === 'canteen' ? 'căn tin' : 'thiết bị mới'} vào kho.
                  </p>
               </div>
            )}
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => {
                  setShowAutoImportModal(false);
                  setImportSource('');
               }}>
                  Hủy
               </Button>
               <Button 
                 onClick={handleAutoImport}
                 disabled={!importSource}
                 className="flex items-center gap-2"
               >
                  <ArrowRight size={16}/> Nhập Kho
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default InventoryView;
