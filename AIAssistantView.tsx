import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, BookOpen, HelpCircle, Loader2 } from 'lucide-react';
import { api } from './data';
import { realAIService } from './realAIService'; // Use real AI service
import { AIMessage } from './types';
import { Button } from './components';

const AIAssistantView = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAIMessages().then(setMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg: AIMessage = {
       id: Date.now(),
       sender: 'user',
       text: textToSend,
       timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
       // Call the AI Server
       const responseText = await realAIService.chat(textToSend);
       
       const aiMsg: AIMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
       };
       setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       console.error(error);
    } finally {
       setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
       <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Bot size={28} className="text-indigo-600"/> Trợ lý Ảo EduBot
           </h2>
           <p className="text-gray-500">Hỗ trợ soạn bài, giải đáp thắc mắc và tra cứu thông tin</p>
       </div>

       <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                   <Bot size={64}/>
                   <p className="text-lg font-medium">EduBot sẵn sàng hỗ trợ bạn</p>
                </div>
             )}
             {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                         msg.sender === 'user' ? 'bg-gray-200' : 'bg-indigo-600 text-white'
                      }`}>
                         {msg.sender === 'user' ? 'ME' : <Sparkles size={18}/>}
                      </div>
                      <div className={`p-4 rounded-2xl ${
                         msg.sender === 'user' ? 'bg-indigo-50 text-gray-800 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                         <p className="text-sm leading-relaxed">{msg.text}</p>
                         <span className="text-[10px] text-gray-400 mt-2 block">{msg.timestamp}</span>
                      </div>
                   </div>
                </div>
             ))}
             {isTyping && (
                <div className="flex justify-start">
                   <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white">
                         <Sparkles size={18}/>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                         <Loader2 size={16} className="animate-spin text-gray-500"/>
                         <span className="text-sm text-gray-500">EduBot đang nhập...</span>
                      </div>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition whitespace-nowrap" onClick={() => handleSend("Hãy tạo một đề thi Toán lớp 10")}>
                <BookOpen size={14}/> Soạn đề thi
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition whitespace-nowrap" onClick={() => handleSend("Tra cứu thời khóa biểu hôm nay")}>
                <HelpCircle size={14}/> Thời khóa biểu
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition whitespace-nowrap" onClick={() => handleSend("Kiểm tra học phí")}>
                <Sparkles size={14}/> Học phí
             </button>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
             <input 
               className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
               placeholder="Nhập câu hỏi cho EduBot..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               disabled={isTyping}
             />
             <Button onClick={() => handleSend()} className="rounded-xl px-6" disabled={isTyping}>
                <Send size={20}/>
             </Button>
          </div>
       </div>
    </div>
  );
};

export default AIAssistantView;
