import React from 'react';
import { TrendingUp, Users, DollarSign, Award, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsView = () => {
  return (
    <div className="space-y-6">
       <div>
           <h2 className="text-2xl font-bold text-gray-800">Phân tích Chiến lược</h2>
           <p className="text-gray-500">Dữ liệu thời gian thực dành cho Ban Lãnh đạo</p>
       </div>

       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Users size={20}/></div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+12% <ArrowUpRight size={12}/></span>
             </div>
             <div className="text-2xl font-bold text-gray-800">1,250</div>
             <p className="text-xs text-gray-500">Tổng học sinh</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600"><DollarSign size={20}/></div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+8% <ArrowUpRight size={12}/></span>
             </div>
             <div className="text-2xl font-bold text-gray-800">12.5 Tỷ</div>
             <p className="text-xs text-gray-500">Doanh thu năm nay</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Award size={20}/></div>
                <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">0% <ArrowUpRight size={12}/></span>
             </div>
             <div className="text-2xl font-bold text-gray-800">98.5%</div>
             <p className="text-xs text-gray-500">Tỉ lệ tốt nghiệp</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Target size={20}/></div>
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">-2% <ArrowDownRight size={12}/></span>
             </div>
             <div className="text-2xl font-bold text-gray-800">85%</div>
             <p className="text-xs text-gray-500">Tỉ lệ giữ chân HS</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart Simulation */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-6">Tăng trưởng Doanh thu (Tỷ VNĐ)</h3>
             <div className="h-64 flex items-end justify-between gap-4">
                {[2, 3, 4.5, 5, 6, 7.5, 8, 9.2, 10, 11, 12, 12.5].map((val, idx) => (
                   <div key={idx} className="flex-1 flex flex-col justify-end group cursor-pointer">
                      <div className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all relative" style={{height: `${(val/15)*100}%`}}>
                         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{val}</div>
                      </div>
                      <div className="text-center text-xs text-gray-400 mt-2">Th{idx + 1}</div>
                   </div>
                ))}
             </div>
          </div>

          {/* Student Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-6">Phân bổ Học lực</h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Xuất sắc</span>
                      <span className="font-bold text-gray-800">15%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Giỏi</span>
                      <span className="font-bold text-gray-800">35%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Khá</span>
                      <span className="font-bold text-gray-800">40%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '40%'}}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Trung bình / Yếu</span>
                      <span className="font-bold text-gray-800">10%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '10%'}}></div>
                   </div>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-800 mb-3">Dự báo năm tới</h4>
                <p className="text-sm text-gray-500 mb-2">Dựa trên dữ liệu hiện tại, dự kiến số lượng học sinh đăng ký mới sẽ tăng <span className="text-green-600 font-bold">15%</span> vào kỳ thu tới.</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default AnalyticsView;