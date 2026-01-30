import React, { useState, useEffect } from 'react';
import { Plus, Box, AlertTriangle, Edit, PenTool, Loader2 } from 'lucide-react';
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
           <Button><Plus size={20}/> Nhập Kho</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
         <Card title="Tổng Tài sản" value={inventory.reduce((acc, i) => acc + i.quantity, 0)} icon={<Box size={24}/>} color="bg-blue-500"/>
         <Card title="Hư hỏng / Bảo trì" value={inventory.filter(i => i.condition !== 'GOOD').length} icon={<AlertTriangle size={24}/>} color="bg-red-500"/>
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
             {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                   <td className="p-4 font-medium text-gray-800">{item.name}</td>
                   <td className="p-4 text-gray-600">{item.category}</td>
                   <td className="p-4 text-center font-bold">{item.quantity}</td>
                   <td className="p-4 text-gray-600">{item.location}</td>
                   <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                         item.condition === 'GOOD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {item.condition === 'GOOD' ? 'Tốt' : 'Bảo trì'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600"><Edit size={18}/></button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default InventoryView;
