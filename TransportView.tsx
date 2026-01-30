import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Navigation, Loader2 } from 'lucide-react';
import { api } from './data';
import { TransportRoute, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const TransportView = () => {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  // AI States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optResult, setOptResult] = useState<AIAnalysisResult | null>(null);
  const [showOptModal, setShowOptModal] = useState(false);

  useEffect(() => {
    api.getRoutes().then(setRoutes);
  }, []);

  const handleAIOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await aiService.transport.optimizeRoutes();
      setOptResult(result);
      setShowOptModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản lý Vận tải</h2>
           <p className="text-gray-500">Theo dõi đội xe và đưa đón học sinh</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
             onClick={handleAIOptimize}
             disabled={isOptimizing}
           >
             {isOptimizing ? <Loader2 size={18} className="animate-spin"/> : <Navigation size={18}/>}
             {isOptimizing ? 'AI Đang tính toán...' : 'AI Tối ưu Lộ trình'}
           </Button>
           <Button><Plus size={20}/> Thêm Tuyến</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
               <th className="p-4">Tuyến xe</th>
               <th className="p-4">Tài xế</th>
               <th className="p-4">Biển số</th>
               <th className="p-4 text-center">Sĩ số</th>
               <th className="p-4 text-center">Trạng thái</th>
               <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {routes.map(route => (
                <tr key={route.id} className="hover:bg-gray-50">
                   <td className="p-4">
                      <div className="font-bold text-gray-800">{route.name}</div>
                   </td>
                   <td className="p-4">
                      <div className="font-medium">{route.driverName}</div>
                      <div className="text-xs text-gray-500">{route.driverPhone}</div>
                   </td>
                   <td className="p-4 text-gray-600">{route.licensePlate}</td>
                   <td className="p-4 text-center">
                      <span className="font-bold">{route.studentCount}</span>/{route.capacity}
                   </td>
                   <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${route.status === 'ON_ROUTE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                         {route.status === 'ON_ROUTE' ? 'Đang chạy' : 'Đang chờ'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button className="text-indigo-600 hover:underline text-sm font-medium">Chi tiết</button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
      
      {/* Map Placeholder */}
      <div className="bg-gray-100 rounded-xl h-64 border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=21.028511,105.804817&zoom=13&size=600x300&sensor=false')] bg-cover opacity-50 bg-center"></div>
          <div className="relative bg-white p-4 rounded-lg shadow-lg text-center">
             <MapPin size={32} className="text-red-500 mx-auto mb-2"/>
             <p className="font-bold text-gray-800">Bản đồ trực tuyến</p>
             <p className="text-xs text-gray-500">Tính năng đang phát triển</p>
          </div>
      </div>

      <Modal isOpen={showOptModal} onClose={() => setShowOptModal(false)} title="AI Tối ưu Vận tải (Transport AI)">
         {optResult && (
            <div className="space-y-4">
               <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 mb-2">{optResult.title}</h4>
                  <p className="text-green-700 text-sm">{optResult.summary}</p>
               </div>
               
               {optResult.dataPoints && (
                  <div className="text-center py-4">
                     <div className="text-gray-500 text-sm">{optResult.dataPoints[0].label}</div>
                     <div className="text-3xl font-bold text-gray-800">{optResult.dataPoints[0].value}</div>
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Navigation size={16}/> Đề xuất lộ trình:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {optResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowOptModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default TransportView;
