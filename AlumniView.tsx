import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Building2, Phone, Mail, Calendar, Users2, Loader2 } from 'lucide-react';
import { api } from './data';
import { Alumnus, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';

const AlumniView = () => {
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // AI States
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<AIAnalysisResult | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    api.getAlumni().then(setAlumni);
  }, []);

  const handleAIMatch = async () => {
    setIsMatching(true);
    try {
      const result = await aiService.alumni.matchMentors();
      setMatchResult(result);
      setShowMatchModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  const filteredAlumni = alumni.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Mạng lưới Cựu học sinh</h2>
           <p className="text-gray-500">Kết nối và theo dõi thành công của cựu học sinh</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
             onClick={handleAIMatch}
             disabled={isMatching}
           >
             {isMatching ? <Loader2 size={18} className="animate-spin"/> : <Users2 size={18}/>}
             {isMatching ? 'AI Đang tìm kiếm...' : 'AI Kết nối Mentor'}
           </Button>
           <Button>Tổ chức Sự kiện</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Alumni List */}
         <div className="flex-1 space-y-6">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
               <input 
                  type="text" 
                  placeholder="Tìm kiếm cựu học sinh, công ty..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {filteredAlumni.map(person => (
                  <div key={person.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
                     <img src={person.avatar} alt={person.fullName} className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover"/>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg">{person.fullName}</h3>
                        <p className="text-indigo-600 font-medium text-sm mb-2">Niên khóa {person.graduationYear}</p>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                           <div className="flex items-center gap-2 truncate" title={person.currentJob}>
                              <Building2 size={14} className="text-gray-400"/>
                              {person.currentJob} tại <span className="font-semibold">{person.company}</span>
                           </div>
                           <div className="flex items-center gap-2 truncate">
                              <Mail size={14} className="text-gray-400"/>
                              {person.email}
                           </div>
                           <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400"/>
                              {person.phone}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Events */}
         <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-600"/> Sự kiện sắp tới
               </h3>
               
               <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                     <div className="text-xs font-bold text-indigo-600 uppercase mb-1">15 Tháng 11, 2023</div>
                     <h4 className="font-bold text-gray-800 mb-1">Họp mặt Niên khóa 2010</h4>
                     <p className="text-sm text-gray-500">Tại Hội trường A, 18:00 - 21:00</p>
                     <button className="mt-2 text-sm text-indigo-600 hover:underline">Chi tiết</button>
                  </div>
                  
                  <div className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                     <div className="text-xs font-bold text-indigo-600 uppercase mb-1">20 Tháng 12, 2023</div>
                     <h4 className="font-bold text-gray-800 mb-1">Career Talk: Định hướng tương lai</h4>
                     <p className="text-sm text-gray-500">Khách mời: CEO Tech Group</p>
                     <button className="mt-2 text-sm text-indigo-600 hover:underline">Chi tiết</button>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
               <h3 className="font-bold text-lg mb-2">Quyên góp Quỹ trường</h3>
               <p className="text-indigo-100 text-sm mb-4">Chung tay xây dựng cơ sở vật chất và học bổng cho thế hệ sau.</p>
               <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none">Đóng góp ngay</Button>
            </div>
         </div>
      </div>

      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="AI Kết nối Mentor (Alumni AI)">
         {matchResult && (
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2">{matchResult.title}</h4>
                  <p className="text-indigo-700 text-sm">{matchResult.summary}</p>
               </div>
               
               {matchResult.dataPoints && (
                  <div className="text-center py-4">
                     <div className="text-gray-500 text-sm">{matchResult.dataPoints[0].label}</div>
                     <div className="text-3xl font-bold text-indigo-600">{matchResult.dataPoints[0].value}</div>
                  </div>
               )}

               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><Users2 size={16}/> Đề xuất kết nối:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {matchResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowMatchModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default AlumniView;
