import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Utensils, ChefHat, Loader2, Clock, Calendar, Edit, Trash2, Save, X, Coffee, Sandwich, Cookie } from 'lucide-react';
import { api, MOCK_MENU, MOCK_MEAL_SCHEDULES } from './data';
import { CanteenItem, AIAnalysisResult, MealSchedule, MenuItemForm } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const CanteenView = () => {
  const [menu, setMenu] = useState<CanteenItem[]>([]);
  const [cart, setCart] = useState<{item: CanteenItem, qty: number}[]>([]);
  const [category, setCategory] = useState<'All' | 'Food' | 'Drink' | 'Snack'>('All');
  const [activeTab, setActiveTab] = useState<'menu' | 'schedule' | 'manage'>('menu');

  // AI
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Menu Management
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CanteenItem | null>(null);
  const [itemForm, setItemForm] = useState<MenuItemForm>({
    name: '',
    price: '',
    category: 'Food',
    calories: '',
    description: '',
    ingredients: '',
    preparationTime: '',
    image: ''
  });

  // Meal Schedule
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    timeSlot: 'Sáng' as 'Sáng' | 'Ra chơi sáng' | 'Trưa' | 'Ra chơi chiều' | 'Tối',
    startTime: '',
    endTime: '',
    date: '',
    itemIds: [] as number[]
  });

  useEffect(() => {
    setMenu(MOCK_MENU);
    setMealSchedules(MOCK_MEAL_SCHEDULES);
  }, []);

  const handleAIOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await aiService.canteen.optimizeMenu();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  // Menu Management Functions
  const handleAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      price: '',
      category: 'Food',
      calories: '',
      description: '',
      ingredients: '',
      preparationTime: '',
      image: ''
    });
    setShowAddItemModal(true);
  };

  const handleEditItem = (item: CanteenItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      calories: item.calories?.toString() || '',
      description: item.description || '',
      ingredients: item.ingredients?.join(', ') || '',
      preparationTime: item.preparationTime?.toString() || '',
      image: item.image
    });
    setShowAddItemModal(true);
  };

  const handleSaveItem = () => {
    const newItem: CanteenItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: itemForm.name,
      price: parseFloat(itemForm.price),
      category: itemForm.category,
      image: itemForm.image || `https://placehold.co/200x200/cccccc/666666?text=${encodeURIComponent(itemForm.name)}`,
      available: true,
      calories: parseInt(itemForm.calories) || undefined,
      description: itemForm.description,
      ingredients: itemForm.ingredients.split(',').map(i => i.trim()).filter(i => i),
      preparationTime: parseInt(itemForm.preparationTime) || undefined
    };

    if (editingItem) {
      setMenu(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setMenu(prev => [...prev, newItem]);
    }

    setShowAddItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      setMenu(prev => prev.filter(item => item.id !== id));
    }
  };

  // Meal Schedule Functions
  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      timeSlot: 'Sáng',
      startTime: '',
      endTime: '',
      date: '',
      itemIds: []
    });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: MealSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      timeSlot: schedule.timeSlot,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      date: schedule.date,
      itemIds: schedule.items.map(item => item.id)
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    const scheduleItems = menu.filter(item => scheduleForm.itemIds.includes(item.id));
    
    const newSchedule: MealSchedule = {
      id: editingSchedule ? editingSchedule.id : Date.now(),
      timeSlot: scheduleForm.timeSlot,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      date: scheduleForm.date,
      isActive: true,
      items: scheduleItems
    };

    if (editingSchedule) {
      setMealSchedules(prev => prev.map(s => s.id === editingSchedule.id ? newSchedule : s));
    } else {
      setMealSchedules(prev => [...prev, newSchedule]);
    }

    setShowScheduleModal(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thực đơn này?')) {
      setMealSchedules(prev => prev.filter(schedule => schedule.id !== id));
    }
  };

  const toggleScheduleStatus = (id: number) => {
    setMealSchedules(prev => prev.map(schedule => 
      schedule.id === id ? { ...schedule, isActive: !schedule.isActive } : schedule
    ));
  };

  const addToCart = (item: CanteenItem) => {
    setCart(prev => {
       const existing = prev.find(i => i.item.id === item.id);
       if (existing) {
          return prev.map(i => i.item.id === item.id ? {...i, qty: i.qty + 1} : i);
       }
       return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
     setCart(prev => prev.filter(i => i.item.id !== id));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);

  const filteredMenu = category === 'All' ? menu : menu.filter(i => i.category === category);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Utensils size={24} className="text-orange-500"/> Căng tin
          </h2>
          <Button 
            variant="secondary" 
            className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 !py-1 !text-sm"
            onClick={handleAIOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? <Loader2 size={16} className="animate-spin"/> : <ChefHat size={16}/>}
            {isOptimizing ? 'AI...' : 'AI Tối ưu Thực đơn'}
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'menu', label: 'Thực đơn', icon: Utensils },
            { id: 'schedule', label: 'Lịch trình', icon: Clock },
            { id: 'manage', label: 'Quản lý', icon: Edit }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab.id 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2">
            {['All', 'Food', 'Drink', 'Snack'].map(c => (
              <button 
                key={c}
                onClick={() => setCategory(c as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c === 'All' ? 'Tất cả' : c === 'Food' ? 'Món ăn' : c === 'Drink' ? 'Đồ uống' : 'Đồ ăn vặt'}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                <div className="aspect-video relative overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                  <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {item.calories} kcal
                  </span>
                  <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {item.category === 'Food' ? 'Món ăn' : item.category === 'Drink' ? 'Đồ uống' : 'Đồ ăn vặt'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  {item.preparationTime && (
                    <p className="text-xs text-gray-400 mb-2">⏱️ {item.preparationTime} phút</p>
                  )}
                  <p className="text-orange-600 font-bold mb-4">{formatCurrency(item.price)}</p>
                  <Button 
                    variant="secondary" 
                    className="mt-auto w-full text-sm !py-1"
                    onClick={() => addToCart(item)}
                  >
                    <Plus size={16}/> Thêm
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={18}/> Đơn hàng
              </h3>
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {cart.length} món
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-20"/>
                  <p className="text-sm">Chưa có món nào</p>
                </div>
              ) : (
                cart.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium text-gray-800">{i.item.name}</div>
                      <div className="text-gray-500 text-xs">{formatCurrency(i.item.price)} x {i.qty}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(i.item.price * i.qty)}</span>
                      <button onClick={() => removeFromCart(i.item.id)} className="text-red-400 hover:text-red-600">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
              </div>
              <Button className="w-full justify-center" disabled={cart.length === 0}>
                Thanh toán ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-blue-500"/> Lịch trình phục vụ
            </h3>
            <Button onClick={handleAddSchedule}>
              <Plus size={16}/> Thêm lịch trình
            </Button>
          </div>

          <div className="grid gap-4">
            {mealSchedules.map(schedule => (
              <div key={schedule.id} className={`bg-white rounded-xl shadow-sm border ${schedule.isActive ? 'border-green-200' : 'border-gray-200'} p-6`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Clock size={18} className="text-blue-500"/>
                      {schedule.timeSlot}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {schedule.startTime} - {schedule.endTime} | {schedule.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {schedule.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleScheduleStatus(schedule.id)}
                    >
                      {schedule.isActive ? 'Tắt' : 'Bật'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <Edit size={14}/>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {schedule.items.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <img src={item.image} alt={item.name} className="w-full h-16 object-cover rounded mb-2"/>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-orange-600 font-bold">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit size={20} className="text-purple-500"/> Quản lý món ăn
            </h3>
            <Button onClick={handleAddItem}>
              <Plus size={16}/> Thêm món mới
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên món</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menu.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded"/>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.category === 'Food' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'Drink' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.category === 'Food' ? 'Món ăn' : item.category === 'Drink' ? 'Đồ uống' : 'Đồ ăn vặt'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.calories || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.preparationTime ? `${item.preparationTime} phút` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'Có sẵn' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit size={14}/>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
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
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <Modal onClose={() => setShowAddItemModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Nhập tên món"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Food">Món ăn</option>
                    <option value="Drink">Đồ uống</option>
                    <option value="Snack">Đồ ăn vặt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calo</label>
                  <input
                    type="number"
                    value={itemForm.calories}
                    onChange={(e) => setItemForm({...itemForm, calories: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({...itemForm, preparationTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Mô tả món ăn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên liệu (cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={itemForm.ingredients}
                  onChange={(e) => setItemForm({...itemForm, ingredients: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nguyên liệu 1, Nguyên liệu 2, ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="text"
                  value={itemForm.image}
                  onChange={(e) => setItemForm({...itemForm, image: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddItemModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveItem}>
                <Save size={16}/> Lưu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Schedule Modal */}
      {showScheduleModal && (
        <Modal onClose={() => setShowScheduleModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingSchedule ? 'Chỉnh sửa lịch trình' : 'Thêm lịch trình mới'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ *</label>
                  <select
                    value={scheduleForm.timeSlot}
                    onChange={(e) => setScheduleForm({...scheduleForm, timeSlot: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Sáng">Sáng</option>
                    <option value="Ra chơi sáng">Ra chơi sáng</option>
                    <option value="Trưa">Trưa</option>
                    <option value="Ra chơi chiều">Ra chơi chiều</option>
                    <option value="Tối">Tối</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc *</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn món ăn</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {menu.map(item => (
                    <label key={item.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={scheduleForm.itemIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setScheduleForm({...scheduleForm, itemIds: [...scheduleForm.itemIds, item.id]});
                          } else {
                            setScheduleForm({...scheduleForm, itemIds: scheduleForm.itemIds.filter(id => id !== item.id)});
                          }
                        }}
                        className="rounded text-orange-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveSchedule}>
                <Save size={16}/> Lưu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Modal */}
      {showAIModal && aiResult && (
        <Modal onClose={() => setShowAIModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ChefHat size={20} className="text-orange-500"/> AI Tối ưu Thực đơn
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{aiResult.recommendation}</p>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowAIModal(false)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CanteenView;
