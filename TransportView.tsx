import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Navigation, Loader2, Edit, Trash2, Users, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
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

  // Modal States
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  // Form States
  const [routeForm, setRouteForm] = useState({
    name: '',
    driverName: '',
    driverPhone: '',
    licensePlate: '',
    capacity: 0,
    startTime: '',
    endTime: '',
    routeDescription: '',
    pickupPoints: [] as string[]
  });
  const [newPickupPoint, setNewPickupPoint] = useState('');

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

  const handleAddRoute = () => {
    const newRoute: TransportRoute = {
      id: Date.now(),
      ...routeForm,
      studentCount: 0,
      status: 'WAITING'
    };
    
    setRoutes([...routes, newRoute]);
    setShowRouteModal(false);
    setRouteForm({
      name: '',
      driverName: '',
      driverPhone: '',
      licensePlate: '',
      capacity: 0,
      startTime: '',
      endTime: '',
      routeDescription: '',
      pickupPoints: []
    });
    alert('Đã thêm tuyến xe mới thành công!');
  };

  const handleEditRoute = (route: TransportRoute) => {
    setSelectedRoute(route);
    setRouteForm({
      name: route.name,
      driverName: route.driverName,
      driverPhone: route.driverPhone,
      licensePlate: route.licensePlate,
      capacity: route.capacity,
      startTime: route.startTime || '',
      endTime: route.endTime || '',
      routeDescription: route.routeDescription || '',
      pickupPoints: route.pickupPoints || []
    });
    setShowRouteModal(true);
  };

  const handleUpdateRoute = () => {
    if (!selectedRoute) return;
    
    const updatedRoutes = routes.map(route => 
      route.id === selectedRoute.id 
        ? { ...route, ...routeForm }
        : route
    );
    
    setRoutes(updatedRoutes);
    setShowRouteModal(false);
    setSelectedRoute(null);
    setRouteForm({
      name: '',
      driverName: '',
      driverPhone: '',
      licensePlate: '',
      capacity: 0,
      startTime: '',
      endTime: '',
      routeDescription: '',
      pickupPoints: []
    });
    alert('Đã cập nhật tuyến xe thành công!');
  };

  const handleDeleteRoute = () => {
    if (!selectedRoute) return;
    
    setRoutes(routes.filter(route => route.id !== selectedRoute.id));
    setShowDeleteModal(false);
    setSelectedRoute(null);
    alert('Đã xóa tuyến xe thành công!');
  };

  const handleViewDetail = (route: TransportRoute) => {
    setSelectedRoute(route);
    setShowDetailModal(true);
  };

  const handleAddPickupPoint = () => {
    if (newPickupPoint.trim()) {
      setRouteForm({
        ...routeForm,
        pickupPoints: [...routeForm.pickupPoints, newPickupPoint.trim()]
      });
      setNewPickupPoint('');
    }
  };

  const handleRemovePickupPoint = (index: number) => {
    setRouteForm({
      ...routeForm,
      pickupPoints: routeForm.pickupPoints.filter((_, i) => i !== index)
    });
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
           <Button onClick={() => setShowRouteModal(true)}>
             <Plus size={20}/> Thêm Tuyến
           </Button>
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
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        route.status === 'ON_ROUTE' ? 'bg-green-100 text-green-700' : 
                        route.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                         {route.status === 'ON_ROUTE' ? 'Đang chạy' : 
                          route.status === 'WAITING' ? 'Đang chờ' : 'Sẵn sàng'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                         <button 
                           onClick={() => handleViewDetail(route)}
                           className="text-indigo-600 hover:underline text-sm font-medium"
                         >
                           Chi tiết
                         </button>
                         <button 
                           onClick={() => handleEditRoute(route)}
                           className="text-blue-600 hover:underline text-sm font-medium"
                         >
                           <Edit size={14} className="inline"/>
                         </button>
                         <button 
                           onClick={() => {
                             setSelectedRoute(route);
                             setShowDeleteModal(true);
                           }}
                           className="text-red-600 hover:underline text-sm font-medium"
                         >
                           <Trash2 size={14} className="inline"/>
                         </button>
                      </div>
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

      {/* Add/Edit Route Modal */}
      <Modal 
        isOpen={showRouteModal} 
        onClose={() => {
          setShowRouteModal(false);
          setSelectedRoute(null);
          setRouteForm({
            name: '',
            driverName: '',
            driverPhone: '',
            licensePlate: '',
            capacity: 0,
            startTime: '',
            endTime: '',
            routeDescription: '',
            pickupPoints: []
          });
        }} 
        title={selectedRoute ? 'Chỉnh sửa Tuyến xe' : 'Thêm Tuyến xe Mới'}
      >
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến xe *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.name}
                    onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
                    placeholder="Tuyến 1 - Nội thành"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.capacity}
                    onChange={(e) => setRouteForm({...routeForm, capacity: parseInt(e.target.value) || 0})}
                    placeholder="30"
                  />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài xế *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.driverName}
                    onChange={(e) => setRouteForm({...routeForm, driverName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.driverPhone}
                    onChange={(e) => setRouteForm({...routeForm, driverPhone: e.target.value})}
                    placeholder="09xxxxxxxx"
                  />
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe *</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 value={routeForm.licensePlate}
                 onChange={(e) => setRouteForm({...routeForm, licensePlate: e.target.value})}
                 placeholder="30A-12345"
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.startTime}
                    onChange={(e) => setRouteForm({...routeForm, startTime: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                  <input 
                    type="time" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={routeForm.endTime}
                    onChange={(e) => setRouteForm({...routeForm, endTime: e.target.value})}
                  />
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tuyến đường</label>
               <textarea 
                 className="w-full p-2 border border-gray-300 rounded-lg"
                 rows={3}
                 value={routeForm.routeDescription}
                 onChange={(e) => setRouteForm({...routeForm, routeDescription: e.target.value})}
                 placeholder="Mô tả chi tiết tuyến đường..."
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đón học sinh</label>
               <div className="space-y-2">
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       className="flex-1 p-2 border border-gray-300 rounded-lg"
                       value={newPickupPoint}
                       onChange={(e) => setNewPickupPoint(e.target.value)}
                       placeholder="Nhập điểm đón..."
                       onKeyPress={(e) => e.key === 'Enter' && handleAddPickupPoint()}
                     />
                     <button 
                       onClick={handleAddPickupPoint}
                       className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                     >
                       <Plus size={16}/>
                     </button>
                  </div>
                  <div className="space-y-1">
                     {routeForm.pickupPoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                           <span className="text-sm">{point}</span>
                           <button 
                             onClick={() => handleRemovePickupPoint(index)}
                             className="text-red-500 hover:text-red-700"
                           >
                             <X size={14}/>
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="flex justify-end gap-2">
               <Button variant="secondary" onClick={() => {
                  setShowRouteModal(false);
                  setSelectedRoute(null);
                  setRouteForm({
                    name: '',
                    driverName: '',
                    driverPhone: '',
                    licensePlate: '',
                    capacity: 0,
                    startTime: '',
                    endTime: '',
                    routeDescription: '',
                    pickupPoints: []
                  });
               }}>
                  Hủy
               </Button>
               <Button onClick={selectedRoute ? handleUpdateRoute : handleAddRoute}>
                  {selectedRoute ? 'Cập nhật' : 'Thêm'}
               </Button>
            </div>
         </div>
      </Modal>

      {/* Route Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết Tuyến xe">
         {selectedRoute && (
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">Thông tin chung</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <span className="font-medium text-gray-600">Tên tuyến:</span>
                        <p className="text-gray-800">{selectedRoute.name}</p>
                     </div>
                     <div>
                        <span className="font-medium text-gray-600">Sức chứa:</span>
                        <p className="text-gray-800">{selectedRoute.studentCount}/{selectedRoute.capacity} học sinh</p>
                     </div>
                     <div>
                        <span className="font-medium text-gray-600">Biển số:</span>
                        <p className="text-gray-800">{selectedRoute.licensePlate}</p>
                     </div>
                     <div>
                        <span className="font-medium text-gray-600">Trạng thái:</span>
                        <p className="text-gray-800">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                             selectedRoute.status === 'ON_ROUTE' ? 'bg-green-100 text-green-700' : 
                             selectedRoute.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-gray-100 text-gray-500'
                           }`}>
                              {selectedRoute.status === 'ON_ROUTE' ? 'Đang chạy' : 
                               selectedRoute.status === 'WAITING' ? 'Đang chờ' : 'Sẵn sàng'}
                           </span>
                        </p>
                     </div>
                  </div>
               </div>
               
               <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                     <Users size={16}/> Thông tin tài xế
                  </h4>
                  <div className="space-y-2 text-sm">
                     <div>
                        <span className="font-medium text-gray-600">Họ tên:</span>
                        <p className="text-gray-800">{selectedRoute.driverName}</p>
                     </div>
                     <div>
                        <span className="font-medium text-gray-600">Số điện thoại:</span>
                        <p className="text-gray-800">{selectedRoute.driverPhone}</p>
                     </div>
                  </div>
               </div>
               
               {selectedRoute.startTime && selectedRoute.endTime && (
                  <div className="bg-green-50 p-4 rounded-lg">
                     <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <Clock size={16}/> Thời gian hoạt động
                     </h4>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="font-medium text-gray-600">Bắt đầu:</span>
                           <p className="text-gray-800">{selectedRoute.startTime}</p>
                        </div>
                        <div>
                           <span className="font-medium text-gray-600">Kết thúc:</span>
                           <p className="text-gray-800">{selectedRoute.endTime}</p>
                        </div>
                     </div>
                  </div>
               )}
               
               {selectedRoute.routeDescription && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                     <h4 className="font-bold text-purple-800 mb-2">Mô tả tuyến đường</h4>
                     <p className="text-sm text-gray-700">{selectedRoute.routeDescription}</p>
                  </div>
               )}
               
               {selectedRoute.pickupPoints && selectedRoute.pickupPoints.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                     <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <MapPin size={16}/> Điểm đón học sinh
                     </h4>
                     <div className="space-y-1">
                        {selectedRoute.pickupPoints.map((point, index) => (
                           <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                                 {index + 1}
                              </span>
                              <span className="text-gray-700">{point}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               
               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                  <Button onClick={() => {
                     setShowDetailModal(false);
                     handleEditRoute(selectedRoute);
                  }}>
                     <Edit size={16}/> Chỉnh sửa
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Xác nhận Xóa Tuyến xe">
         {selectedRoute && (
            <div className="space-y-4">
               <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="text-red-600" size={24}/>
                     <div>
                        <h4 className="font-bold text-red-800">Bạn có chắc chắn muốn xóa?</h4>
                        <p className="text-red-700 text-sm">
                           Tuyến xe "{selectedRoute.name}" sẽ bị xóa vĩnh viễn và không thể khôi phục.
                        </p>
                     </div>
                  </div>
               </div>
               
               <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">Thông tin tuyến xe:</h5>
                  <div className="text-sm space-y-1">
                     <p><span className="font-medium">Tên:</span> {selectedRoute.name}</p>
                     <p><span className="font-medium">Tài xế:</span> {selectedRoute.driverName}</p>
                     <p><span className="font-medium">Biển số:</span> {selectedRoute.licensePlate}</p>
                  </div>
               </div>
               
               <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
                  <Button onClick={handleDeleteRoute} className="bg-red-600 hover:bg-red-700">
                     <Trash2 size={16}/> Xóa Tuyến
                  </Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default TransportView;
