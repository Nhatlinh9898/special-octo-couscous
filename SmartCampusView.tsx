import React, { useState, useEffect } from 'react';
import { Cpu, Power, Zap, Thermometer, Lightbulb, Projector, Activity, Loader2 } from 'lucide-react';
import { api } from './data';
import { aiService } from './aiService'; // Import AI Service
import { IoTDevice } from './types';
import { Button, Card } from './components';

const SmartCampusView = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    api.getIoTDevices().then(setDevices);
  }, []);

  const toggleDevice = (id: number) => {
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, status: d.status === 'ON' ? 'OFF' : 'ON' } : d
    ));
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
       await aiService.optimizeEnergy(); // Call the simulated server
       // Simulate result by turning off some devices
       setDevices(prev => prev.map((d, idx) => idx % 2 === 0 ? {...d, status: 'OFF'} : d));
       alert("AI đã tối ưu hóa hệ thống năng lượng!");
    } catch (e) {
       console.error(e);
    } finally {
       setIsOptimizing(false);
    }
  };

  const totalPower = devices.reduce((acc, d) => d.status === 'ON' ? acc + d.powerUsage : acc, 0);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Smart Campus (IoT)</h2>
           <p className="text-gray-500">Giám sát và điều khiển thiết bị thông minh</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700 shadow-green-200" 
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
           {isOptimizing ? <Loader2 size={20} className="animate-spin"/> : <Zap size={20}/>}
           {isOptimizing ? 'Đang phân tích...' : 'Tối ưu Năng lượng'}
        </Button>
      </div>

      {/* Sensor Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
               <Thermometer size={24} className="opacity-80"/>
               <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Trung bình</span>
            </div>
            <div className="text-3xl font-bold mb-1">28.5°C</div>
            <p className="text-sm opacity-90">Nhiệt độ toàn trường</p>
         </div>
         <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-6 rounded-xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
               <Activity size={24} className="opacity-80"/>
               <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Ổn định</span>
            </div>
            <div className="text-3xl font-bold mb-1">AQI 45</div>
            <p className="text-sm opacity-90">Chất lượng không khí</p>
         </div>
         <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
               <Zap size={24} className="opacity-80"/>
               <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Hôm nay</span>
            </div>
            <div className="text-3xl font-bold mb-1">{totalPower / 1000} kW</div>
            <p className="text-sm opacity-90">Công suất tiêu thụ</p>
         </div>
         <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
               <Cpu size={24} className="opacity-80"/>
               <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Online</span>
            </div>
            <div className="text-3xl font-bold mb-1">{devices.length} / {devices.length}</div>
            <p className="text-sm opacity-90">Thiết bị hoạt động</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Cpu size={20} className="text-indigo-600"/> Danh sách thiết bị
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(dev => (
               <div key={dev.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        dev.status === 'ON' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                     }`}>
                        {dev.type === 'AC' && <Thermometer size={24}/>}
                        {dev.type === 'LIGHT' && <Lightbulb size={24}/>}
                        {dev.type === 'PROJECTOR' && <Projector size={24}/>}
                        {dev.type === 'SENSOR' && <Activity size={24}/>}
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-800">{dev.name}</h4>
                        <p className="text-sm text-gray-500">{dev.location}</p>
                        {dev.value && <p className="text-xs text-indigo-600 font-medium mt-1">{dev.value}</p>}
                     </div>
                  </div>
                  <button 
                     onClick={() => toggleDevice(dev.id)}
                     className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        dev.status === 'ON' ? 'bg-green-500' : 'bg-gray-300'
                     }`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                        dev.status === 'ON' ? 'translate-x-6' : 'translate-x-0'
                     }`}></div>
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SmartCampusView;
