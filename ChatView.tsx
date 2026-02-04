import React, { useState, useContext, useRef, useEffect } from 'react';
import { Search, Phone, Video, AlertCircle, Paperclip, Send, MessageCircle, Smile, MoreVertical, User, Settings, Archive, Trash2, Check, CheckCheck } from 'lucide-react';
import { AppContext } from './context';
import { MOCK_TEACHERS, MOCK_STUDENTS, MOCK_CHAT_HISTORY } from './data';
import { ChatMessage } from './types';
import CallModal from './CallModal';

const ChatView = () => {
  const { user } = useContext(AppContext);
  const [activeContact, setActiveContact] = useState<number | null>(MOCK_TEACHERS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>(MOCK_TEACHERS.map(t => t.id));
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: user?.id || 0,
      senderName: "Me",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isMe: true,
      status: 'sent'
    };
    setMessages([...messages, newMsg]);
    setInputText("");
    
    // Auto reply mock
    setTimeout(() => {
       const reply: ChatMessage = {
          id: Date.now() + 1,
          senderId: activeContact || 0,
          senderName: "Người nhận",
          text: "Tôi đã nhận được tin nhắn của bạn.",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: false,
          status: 'delivered'
       };
       setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  // Enhanced handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(inputText + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newMsg: ChatMessage = {
          id: Date.now(),
          senderId: user?.id || 0,
          senderName: "Me",
          text: `📎 Đã gửi file: ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: true,
          status: 'sent',
          attachment: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        };
        setMessages([...messages, newMsg]);
      }
    };
    input.click();
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording and send voice message
      const newMsg: ChatMessage = {
        id: Date.now(),
        senderId: user?.id || 0,
        senderName: "Me",
        text: "🎤 Tin nhắn thoại",
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: true,
        status: 'sent',
        voiceMessage: true
      };
      setMessages([...messages, newMsg]);
    } else {
      setIsRecording(true);
      // Start recording
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const handleArchiveChat = () => {
    alert('Đã lưu trữ cuộc trò chuyện!');
  };

  const handleClearChat = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn?')) {
      setMessages([]);
    }
  };

  const handleBlockContact = () => {
    if (confirm('Bạn có chắc chắn muốn chặn liên hệ này?')) {
      alert('Đã chặn liên hệ!');
    }
  };

  // Call handling functions
  const handleVoiceCall = () => {
    setIsVideoCall(false);
    setIsIncomingCall(false);
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    setIsVideoCall(true);
    setIsIncomingCall(false);
    setShowCallModal(true);
  };

  const simulateIncomingCall = () => {
    // Simulate incoming call after 3 seconds
    setTimeout(() => {
      const randomContact = MOCK_TEACHERS[Math.floor(Math.random() * MOCK_TEACHERS.length)];
      setActiveContact(randomContact.id);
      setIsVideoCall(Math.random() > 0.5);
      setIsIncomingCall(true);
      setShowCallModal(true);
    }, 3000);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter contacts based on search
  const filteredTeachers = MOCK_TEACHERS.filter(t => 
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       {/* Sidebar Contacts */}
       <div className="w-80 border-r border-gray-100 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-100">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <input 
                  placeholder="Tìm kiếm liên hệ..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase">Giáo viên</div>
             {filteredTeachers.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setActiveContact(t.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${activeContact === t.id ? 'bg-indigo-50' : ''}`}
                >
                   <div className="relative">
                      <img src={t.avatar} alt="" className="w-10 h-10 rounded-full"/>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineUsers.includes(t.id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{t.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate">{t.major}</p>
                   </div>
                   {onlineUsers.includes(t.id) && (
                      <span className="text-xs text-green-600">Online</span>
                   )}
                </div>
             ))}
             <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase mt-2">Lớp 10A1</div>
             {filteredStudents.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {s.fullName.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{s.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate">Học sinh</p>
                   </div>
                   <span className="text-xs text-gray-400">Offline</span>
                </div>
             ))}
          </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 flex flex-col bg-gray-50/50">
          {activeContact ? (
             <>
               <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <img src={MOCK_TEACHERS.find(t => t.id === activeContact)?.avatar} alt="" className="w-10 h-10 rounded-full"/>
                     <div>
                        <h3 className="font-bold text-gray-800">{MOCK_TEACHERS.find(t => t.id === activeContact)?.fullName || 'Người dùng'}</h3>
                        <span className={`text-xs flex items-center gap-1 ${onlineUsers.includes(activeContact) ? 'text-green-600' : 'text-gray-500'}`}>
                           <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(activeContact) ? 'bg-green-500' : 'bg-gray-400'}`}></span> 
                           {onlineUsers.includes(activeContact) ? 'Trực tuyến' : 'Ngoại tuyến'}
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                     <button 
                       className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                       onClick={handleVoiceCall}
                       title="Gọi điện"
                     >
                       <Phone size={20}/>
                     </button>
                     <button 
                       className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                       onClick={handleVideoCall}
                       title="Gọi video"
                     >
                       <Video size={20}/>
                     </button>
                     <button 
                       className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                       onClick={() => setShowContactInfo(!showContactInfo)}
                       title="Thông tin liên hệ"
                     >
                       <AlertCircle size={20}/>
                     </button>
                     <button 
                       className="p-2 hover:bg-gray-100 rounded-full transition-colors relative" 
                       onClick={() => setShowChatSettings(!showChatSettings)}
                       title="Thêm tùy chọn"
                     >
                       <MoreVertical size={20}/>
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                           msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                           <p className="text-sm">{msg.text}</p>
                           {msg.attachment && (
                              <div className="mt-2 p-2 bg-white/10 rounded-lg">
                                 <div className="flex items-center gap-2 text-xs">
                                    <Paperclip size={12} />
                                    <span>{msg.attachment.name}</span>
                                    <span className="opacity-70">({(msg.attachment.size / 1024).toFixed(1)} KB)</span>
                                 </div>
                              </div>
                           )}
                           {msg.voiceMessage && (
                              <div className="mt-2 flex items-center gap-2">
                                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                 </div>
                                 <span className="text-xs">Tin nhắn thoại</span>
                              </div>
                           )}
                           <div className="flex items-center justify-between mt-1">
                              <span className={`text-[10px] ${msg.isMe ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.timestamp}</span>
                              {msg.isMe && (
                                 <div className="flex items-center gap-1">
                                    {msg.status === 'sent' && <Check size={12} className="text-indigo-200" />}
                                    {msg.status === 'delivered' && <CheckCheck size={12} className="text-indigo-200" />}
                                    {msg.status === 'read' && <CheckCheck size={12} className="text-indigo-100" />}
                                 </div>
                              )}
                           </div>
                        </div>
                        {msg.isMe && (
                           <button 
                              className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Xóa tin nhắn"
                           >
                              <Trash2 size={12} />
                           </button>
                        )}
                     </div>
                  ))}
               </div>

               <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2">
                     <button 
                       className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors" 
                       onClick={handleFileAttach}
                       title="Đính kèm file"
                     >
                       <Paperclip size={20}/>
                     </button>
                     <button 
                       className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors relative" 
                       onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                       title="Emoji"
                     >
                       <Smile size={20}/>
                     </button>
                     <input 
                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 bg-gray-50"
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                     />
                     <button 
                       className={`p-2 rounded-full transition-all transform active:scale-95 ${
                         isRecording 
                           ? 'bg-red-500 text-white animate-pulse' 
                           : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                       }`}
                       onClick={handleVoiceRecord}
                       title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
                     >
                       <div className={`w-5 h-5 rounded-full ${isRecording ? 'bg-white' : 'bg-current'}`}></div>
                     </button>
                     <button 
                       onClick={handleSend}
                       disabled={!inputText.trim()}
                       className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transform active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Gửi tin nhắn"
                     >
                        <Send size={20} className="ml-0.5"/>
                     </button>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                     <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 z-10">
                        {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '🙏', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'].map((emoji, idx) => (
                           <button
                              key={idx}
                              className="p-2 hover:bg-gray-100 rounded text-lg"
                              onClick={() => handleEmojiSelect(emoji)}
                           >
                              {emoji}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Contact Info Modal */}
               {showContactInfo && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                     <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center mb-4">
                           <img src={MOCK_TEACHERS.find(t => t.id === activeContact)?.avatar} alt="" className="w-20 h-20 rounded-full mx-auto mb-2"/>
                           <h3 className="font-bold text-lg">{MOCK_TEACHERS.find(t => t.id === activeContact)?.fullName}</h3>
                           <p className="text-gray-500">{MOCK_TEACHERS.find(t => t.id === activeContact)?.major}</p>
                           <p className={`text-sm mt-1 ${onlineUsers.includes(activeContact) ? 'text-green-600' : 'text-gray-500'}`}>
                              {onlineUsers.includes(activeContact) ? '🟢 Online' : '⚫ Offline'}
                           </p>
                        </div>
                        <div className="space-y-2">
                           <button className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2">
                              <User size={16} /> Xem hồ sơ
                           </button>
                           <button className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2">
                              <Archive size={16} /> Lưu trữ cuộc trò chuyện
                           </button>
                           <button className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2 text-red-600">
                              <Trash2 size={16} /> Chặn liên hệ
                           </button>
                        </div>
                        <div className="flex gap-2 mt-4">
                           <button 
                              className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-50"
                              onClick={() => setShowContactInfo(false)}
                           >
                              Đóng
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {/* Chat Settings Dropdown */}
               {showChatSettings && (
                  <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                     <button 
                        className="w-full p-2 text-left hover:bg-gray-100 flex items-center gap-2 px-4"
                        onClick={handleArchiveChat}
                     >
                        <Archive size={16} /> Lưu trữ cuộc trò chuyện
                     </button>
                     <button 
                        className="w-full p-2 text-left hover:bg-gray-100 flex items-center gap-2 px-4"
                        onClick={handleClearChat}
                     >
                        <Trash2 size={16} /> Xóa tin nhắn
                     </button>
                     <button 
                        className="w-full p-2 text-left hover:bg-gray-100 flex items-center gap-2 px-4 text-red-600"
                        onClick={handleBlockContact}
                     >
                        <AlertCircle size={16} /> Chặn liên hệ
                     </button>
                  </div>
               )}
               
               <div ref={messagesEndRef} />
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={64} className="mb-4 opacity-20"/>
                <p>Chọn một liên hệ để bắt đầu trò chuyện</p>
                <button 
                  onClick={simulateIncomingCall}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  📞 Mô phỏng cuộc gọi đến
                </button>
             </div>
          )}
       </div>

       {/* Call Modal */}
       <CallModal
         isOpen={showCallModal}
         onClose={() => setShowCallModal(false)}
         contactName={MOCK_TEACHERS.find(t => t.id === activeContact)?.fullName || 'Người dùng'}
         contactAvatar={MOCK_TEACHERS.find(t => t.id === activeContact)?.avatar || ''}
         isVideoCall={isVideoCall}
         isIncoming={isIncomingCall}
       />
    </div>
  );
};

export default ChatView;