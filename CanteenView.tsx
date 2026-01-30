import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Utensils, ChefHat, Loader2 } from 'lucide-react';
import { api } from './data';
import { CanteenItem, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const CanteenView = () => {
  const [menu, setMenu] = useState<CanteenItem[]>([]);
  const [cart, setCart] = useState<{item: CanteenItem, qty: number}[]>([]);
  const [category, setCategory] = useState<'All' | 'Food' | 'Drink' | 'Snack'>('All');

  // AI
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getMenu().then(setMenu);
  }, []);

  const handleAIOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await aiService.canteen.optimizeMenu();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
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
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
       {/* Menu Section */}
       <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-4">
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Utensils size={24} className="text-orange-500"/> Căng tin</h2>
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
             <div className="flex gap-2">
                {['All', 'Food', 'Drink', 'Snack'].map(c => (
                   <button 
                     key={c}
                     onClick={() => setCategory(c as any)}
                     className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
                   >
                      {c === 'All' ? 'Tất cả' : c}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
             {filteredMenu.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition">
                   <div className="aspect-video relative overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                      <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                         {item.calories} kcal
                      </span>
                   </div>
                   <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
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
       </div>

       {/* Cart Section */}
       <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit md:h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
             <h3 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={18}/> Đơn hàng</h3>
             <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">{cart.length} món</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
             <Button className="w-full justify-center" disabled={cart.length === 0}>Thanh toán ngay</Button>
          </div>
       </div>

       {/* AI Modal */}
       <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Dinh dưỡng & Thực đơn (Canteen AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2">{aiResult.title}</h4>
                  <p className="text-orange-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-orange-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Đề xuất:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {aiResult.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
               </div>
               <div className="flex justify-end pt-2"><Button onClick={() => setShowAIModal(false)}>Đóng</Button></div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default CanteenView;
