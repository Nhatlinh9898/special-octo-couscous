import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Cpu, Terminal, ShieldCheck, Clock, AlertCircle, HardDrive } from 'lucide-react';
import { aiService } from './aiService';
import { SystemLog, ServerStats } from './types';

const ServerMonitorView = () => {
  const [stats, setStats] = useState<ServerStats>(aiService.getStats());
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(aiService.getStats());
      setLogs(aiService.getLogs());
      setStatuses(aiService.getServiceStatuses());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-400';
      case 'WARNING': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getServiceStatusColor = (status: string) => {
     if (status === 'Running') return 'text-green-600 bg-green-100';
     if (status === 'Processing') return 'text-blue-600 bg-blue-100 animate-pulse';
     return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Hạ tầng Máy chủ AI</h2>
           <p className="text-gray-500">Giám sát các Microservices và Nhật ký hệ thống</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           System Operational
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-800">
            <div className="flex justify-between items-start mb-4">
               <Cpu size={24} className="text-blue-400"/>
               <span className="text-xs text-gray-400">Core i9-13900K</span>
            </div>
            <div className="text-3xl font-mono font-bold mb-1">{stats.cpu}%</div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
               <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{width: `${stats.cpu}%`}}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">CPU Usage</p>
         </div>

         <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-800">
            <div className="flex justify-between items-start mb-4">
               <Database size={24} className="text-purple-400"/>
               <span className="text-xs text-gray-400">64GB DDR5</span>
            </div>
            <div className="text-3xl font-mono font-bold mb-1">{stats.memory}%</div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
               <div className="bg-purple-500 h-1 rounded-full transition-all duration-300" style={{width: `${stats.memory}%`}}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Memory Usage</p>
         </div>

         <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-800">
            <div className="flex justify-between items-start mb-4">
               <Activity size={24} className="text-green-400"/>
               <span className="text-xs text-gray-400">Microservices</span>
            </div>
            <div className="text-3xl font-mono font-bold mb-1">{stats.activeMicroservices} / {Object.keys(statuses).length}</div>
            <p className="text-xs text-gray-400 mt-2 text-green-400 flex items-center gap-1">
               <Clock size={10}/> Uptime: {stats.uptime}
            </p>
         </div>

         <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-800">
            <div className="flex justify-between items-start mb-4">
               <ShieldCheck size={24} className="text-orange-400"/>
               <span className="text-xs text-gray-400">Security</span>
            </div>
            <div className="text-lg font-bold mb-1 text-orange-400">Protected</div>
            <p className="text-xs text-gray-400 mt-2">Firewall Active</p>
            <p className="text-xs text-gray-500">0 Threats detected</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
         {/* Live Console Logs */}
         <div className="lg:col-span-2 bg-black rounded-xl shadow-lg overflow-hidden flex flex-col font-mono text-sm border border-gray-800">
            <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center text-gray-400">
               <div className="flex items-center gap-2"><Terminal size={16}/> System Logs</div>
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
               </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-gray-300">
               {logs.length === 0 && <span className="text-gray-600">Waiting for system events...</span>}
               {logs.map(log => (
                  <div key={log.id} className="break-all">
                     <span className="text-gray-500">[{log.timestamp}]</span>
                     <span className={`mx-2 font-bold ${getLevelColor(log.level)}`}>{log.level}</span>
                     <span className="text-indigo-400">[{log.module}]</span>
                     <span className="ml-2">{log.message}</span>
                     {log.latency && <span className="text-gray-500 ml-2">({log.latency}ms)</span>}
                  </div>
               ))}
            </div>
         </div>

         {/* Microservices Status */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
               <Server size={20} className="text-indigo-600"/> Microservices
            </h3>
            <div className="space-y-3">
               {Object.entries(statuses).map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center gap-3">
                        <HardDrive size={18} className="text-gray-500"/>
                        <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded ${getServiceStatusColor(status)}`}>
                        {status}
                     </span>
                  </div>
               ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
               <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Activity size={20} className="text-blue-500 flex-shrink-0 mt-0.5"/>
                  <div>
                     <h4 className="text-sm font-bold text-blue-700">Load Balancer</h4>
                     <p className="text-xs text-blue-600 mt-1">Traffic distribution is optimal.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ServerMonitorView;