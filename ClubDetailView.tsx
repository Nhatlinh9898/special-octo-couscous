import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, MapPin, Clock, ArrowLeft, Plus, Edit, Trash2, 
  Heart, MessageCircle, Share2, User, Mail, Phone, Award, 
  BookOpen, Target, Star, CheckCircle, XCircle, Loader2, Send, Search
} from 'lucide-react';
import { Button, Modal } from './components';
import { Club, ClubMember, ClubPost, ClubEvent } from './types';

interface ClubDetailViewProps {
  clubId: string;
  onBack: () => void;
}

const ClubDetailView: React.FC<ClubDetailViewProps> = ({ clubId, onBack }) => {
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'events' | 'schedule' | 'chat'>('posts');
  
  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ClubPost | null>(null);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [joinForm, setJoinForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    grade: '',
    class: '',
    reason: '',
    skills: ''
  });
  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'announcement',
    images: []
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    maxParticipants: '',
    registrationDeadline: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadClubData();
    loadCurrentUser();
  }, [clubId]);

  const loadClubData = async () => {
    setLoading(true);
    try {
      // Load club details
      const clubResponse = await fetch(`/api/clubs/${clubId}`);
      const clubData = await clubResponse.json();
      if (clubData.success) {
        setClub(clubData.data);
      }

      // Load members
      const membersResponse = await fetch(`/api/clubs/${clubId}/members`);
      const membersData = await membersResponse.json();
      if (membersData.success) {
        setMembers(membersData.data);
      }

      // Load posts
      const postsResponse = await fetch(`/api/clubs/${clubId}/posts`);
      const postsData = await postsResponse.json();
      if (postsData.success) {
        setPosts(postsData.data);
      }

      // Load events
      const eventsResponse = await fetch(`/api/clubs/${clubId}/events`);
      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        setEvents(eventsData.data);
      }
    } catch (error) {
      console.error('Error loading club data:', error);
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const clubIdNum = parseInt(clubId || '1');
    
    // Try to load saved events from localStorage first
    const savedEvents = JSON.parse(localStorage.getItem(`club_events_${clubId}`) || '[]');
    
    // Mock data for different clubs
    const clubDataMap: { [key: number]: any } = {
      1: {
        id: 1,
        name: 'CLB Tin học',
        description: 'Câu lạc bộ dành cho những ai đam mê công nghệ và lập trình',
        category: 'Công nghệ',
        image: '/club-tech.jpg',
        advisor: { fullName: 'Nguyễn Văn An', email: 'an.nv@school.edu.vn' },
        meetingRoom: 'Phòng Lab 1',
        schedules: [],
        _count: { members: 45, schedules: 3 }
      },
      2: {
        id: 2,
        name: 'CLB Bóng đá',
        description: 'Câu lạc bộ bóng đá với mục tiêu phát triển thể chất và tinh thần đồng đội',
        category: 'Thể thao',
        image: '/club-soccer.jpg',
        advisor: { fullName: 'Trần Văn B', email: 'b.tv@school.edu.vn' },
        meetingRoom: 'Sân bóng A',
        schedules: [],
        _count: { members: 22, schedules: 5 }
      },
      3: {
        id: 3,
        name: 'CLB Âm nhạc',
        description: 'Câu lạc bộ dành cho những ai yêu thích âm nhạc và muốn thể hiện tài năng',
        category: 'Nghệ thuật',
        image: '/club-music.jpg',
        advisor: { fullName: 'Lê Thị C', email: 'c.lt@school.edu.vn' },
        meetingRoom: 'Phòng nhạc',
        schedules: [],
        _count: { members: 30, schedules: 4 }
      },
      4: {
        id: 4,
        name: 'CLB Tiếng Anh',
        description: 'Câu lạc bộ giúp cải thiện kỹ năng tiếng Anh và giao tiếp quốc tế',
        category: 'Học thuật',
        image: '/club-english.jpg',
        advisor: { fullName: 'Phạm Văn D', email: 'd.pv@school.edu.vn' },
        meetingRoom: 'Phòng 201',
        schedules: [],
        _count: { members: 38, schedules: 3 }
      },
      5: {
        id: 5,
        name: 'CLB Tình nguyện',
        description: 'Câu lạc bộ tổ chức các hoạt động thiện nguyện và phục vụ cộng đồng',
        category: 'Tình nguyện',
        image: '/club-volunteer.jpg',
        advisor: { fullName: 'Nguyễn Thị E', email: 'e.nt@school.edu.vn' },
        meetingRoom: 'Phòng sinh hoạt chung',
        schedules: [],
        _count: { members: 55, schedules: 6 }
      }
    };

    const membersDataMap: { [key: number]: any[] } = {
      1: [
        { id: 1, fullName: 'Trần Thị Bình', email: 'binh.tt@school.edu.vn', role: 'president', joinedDate: '2023-09-01', status: 'active', avatar: '/avatar1.jpg' },
        { id: 2, fullName: 'Lê Văn Cường', email: 'cuong.lv@school.edu.vn', role: 'member', joinedDate: '2023-09-15', status: 'active', avatar: '/avatar2.jpg' }
      ],
      2: [
        { id: 3, fullName: 'Phạm Văn Hùng', email: 'hung.pv@school.edu.vn', role: 'president', joinedDate: '2023-09-01', status: 'active', avatar: '/avatar3.jpg' },
        { id: 4, fullName: 'Nguyễn Thị Mai', email: 'mai.nt@school.edu.vn', role: 'vice_president', joinedDate: '2023-09-10', status: 'active', avatar: '/avatar4.jpg' }
      ],
      3: [
        { id: 5, fullName: 'Trần Quang Duy', email: 'duy.tq@school.edu.vn', role: 'president', joinedDate: '2023-09-01', status: 'active', avatar: '/avatar5.jpg' },
        { id: 6, fullName: 'Lê Thu An', email: 'an.lt@school.edu.vn', role: 'member', joinedDate: '2023-09-20', status: 'active', avatar: '/avatar6.jpg' }
      ],
      4: [
        { id: 7, fullName: 'Hoàng Văn Nam', email: 'nam.hv@school.edu.vn', role: 'president', joinedDate: '2023-09-01', status: 'active', avatar: '/avatar7.jpg' },
        { id: 8, fullName: 'Đỗ Thị Lan', email: 'lan.dt@school.edu.vn', role: 'secretary', joinedDate: '2023-09-05', status: 'active', avatar: '/avatar8.jpg' }
      ],
      5: [
        { id: 9, fullName: 'Bùi Minh Tuấn', email: 'tuan.bm@school.edu.vn', role: 'president', joinedDate: '2023-09-01', status: 'active', avatar: '/avatar9.jpg' },
        { id: 10, fullName: 'Vũ Thu Hà', email: 'ha.vt@school.edu.vn', role: 'treasurer', joinedDate: '2023-09-08', status: 'active', avatar: '/avatar10.jpg' }
      ]
    };

    const postsDataMap: { [key: number]: any[] } = {
      1: [
        {
          id: 1,
          title: 'Workshop Lập trình Python cơ bản',
          content: 'Chúng tôi sẽ tổ chức workshop về Python cho thành viên mới. Hãy tham gia để học những kiến thức cơ bản về lập trình!',
          type: 'announcement',
          author: 'Trần Thị Bình',
          authorAvatar: '/avatar1.jpg',
          createdAt: '2024-01-15T10:00:00Z',
          likes: 12,
          comments: 5,
          images: ['/python-workshop.jpg'],
          clubId: 1
        }
      ],
      2: [
        {
          id: 2,
          title: 'Tập luyện cuối tuần',
          content: 'Chúng ta sẽ có buổi tập luyện vào cuối tuần này. Mọi người nhớ chuẩn bị đồ dùng cá nhân và đến đúng giờ!',
          type: 'announcement',
          author: 'Phạm Văn Hùng',
          authorAvatar: '/avatar3.jpg',
          createdAt: '2024-01-16T14:00:00Z',
          likes: 8,
          comments: 3,
          images: ['/soccer-training.jpg'],
          clubId: 2
        }
      ],
      3: [
        {
          id: 3,
          title: 'Buổi biểu diễn tháng 2',
          content: 'CLB âm nhạc sẽ có buổi biểu diễn chào mừng năm mới. Các thành viên hãy đăng ký tham gia biểu diễn!',
          type: 'event',
          author: 'Trần Quang Duy',
          authorAvatar: '/avatar5.jpg',
          createdAt: '2024-01-17T09:00:00Z',
          likes: 15,
          comments: 7,
          images: ['/music-performance.jpg'],
          clubId: 3
        }
      ],
      4: [
        {
          id: 4,
          title: 'English Speaking Club',
          content: 'Hàng tuần chúng ta sẽ có buổi nói chuyện tiếng Anh để cải thiện kỹ năng giao tiếp. Mọi người đều welcome!',
          type: 'discussion',
          author: 'Hoàng Văn Nam',
          authorAvatar: '/avatar7.jpg',
          createdAt: '2024-01-18T16:00:00Z',
          likes: 20,
          comments: 10,
          images: ['/english-club.jpg'],
          clubId: 4
        }
      ],
      5: [
        {
          id: 5,
          title: 'Chiến dịch Mùa xuân tình nguyện',
          content: 'CLB sẽ tổ chức chiến dịch tình nguyện tại các làng xã vùng cao. Hãy cùng nhau lan tỏa yêu thương!',
          type: 'achievement',
          author: 'Bùi Minh Tuấn',
          authorAvatar: '/avatar9.jpg',
          createdAt: '2024-01-19T11:00:00Z',
          likes: 25,
          comments: 12,
          images: ['/volunteer-campaign.jpg'],
          clubId: 5
        }
      ]
    };

    const eventsDataMap: { [key: number]: any[] } = {
      1: [
        {
          id: 1,
          title: 'Workshop Python cơ bản',
          description: 'Học lập trình Python từ đầu',
          date: '2024-02-01',
          time: '14:00',
          location: 'Phòng Lab 1',
          maxParticipants: 30,
          currentParticipants: 15,
          registrationDeadline: '2024-01-30',
          status: 'upcoming',
          clubId: 1,
          createdAt: '2024-01-15T10:00:00Z'
        }
      ],
      2: [
        {
          id: 2,
          title: 'Trận giao hữu với CLB khác',
          description: 'Trận đấu giao hữu để tăng cường kinh nghiệm',
          date: '2024-02-03',
          time: '16:00',
          location: 'Sân bóng A',
          maxParticipants: 22,
          currentParticipants: 20,
          registrationDeadline: '2024-02-01',
          status: 'upcoming',
          clubId: 2,
          createdAt: '2024-01-16T14:00:00Z'
        }
      ],
      3: [
        {
          id: 3,
          title: 'Recital Âm nhạc',
          description: 'Buổi biểu diễn tài năng của thành viên',
          date: '2024-02-05',
          time: '19:00',
          location: 'Hội trường',
          maxParticipants: 100,
          currentParticipants: 75,
          registrationDeadline: '2024-02-03',
          status: 'upcoming',
          clubId: 3,
          createdAt: '2024-01-17T09:00:00Z'
        }
      ],
      4: [
        {
          id: 4,
          title: 'Debate Competition',
          description: 'Cuộc thi tranh biện tiếng Anh',
          date: '2024-02-07',
          time: '14:30',
          location: 'Phòng 201',
          maxParticipants: 40,
          currentParticipants: 32,
          registrationDeadline: '2024-02-05',
          status: 'upcoming',
          clubId: 4,
          createdAt: '2024-01-18T16:00:00Z'
        }
      ],
      5: [
        {
          id: 5,
          title: 'Chuyến đi tình nguyện',
          description: 'Thăm và tặng quà cho trẻ em vùng cao',
          date: '2024-02-10',
          time: '07:00',
          location: 'Huyện X',
          maxParticipants: 25,
          currentParticipants: 18,
          registrationDeadline: '2024-02-08',
          status: 'upcoming',
          clubId: 5,
          createdAt: '2024-01-19T11:00:00Z'
        }
      ]
    };

    const chatMessagesMap: { [key: number]: any[] } = {
      1: [
        { id: 1, sender: 'Trần Thị Bình', message: 'Chào mừng mọi người đến với CLB Tin học!', timestamp: '2024-01-15T09:00:00Z', avatar: '/avatar1.jpg' },
        { id: 2, sender: 'Lê Văn Cường', message: 'Mọi người ơi, workshop Python tuần này có ai tham gia không?', timestamp: '2024-01-15T10:30:00Z', avatar: '/avatar2.jpg' }
      ],
      2: [
        { id: 3, sender: 'Phạm Văn Hùng', message: 'Cuối tuần tập luyện nhé cả đội!', timestamp: '2024-01-16T08:00:00Z', avatar: '/avatar3.jpg' },
        { id: 4, sender: 'Nguyễn Thị Mai', message: 'Sẵn sàng!', timestamp: '2024-01-16T08:15:00Z', avatar: '/avatar4.jpg' }
      ],
      3: [
        { id: 5, sender: 'Trần Quang Duy', message: 'Ai muốn biểu diễn trong buổi recital tháng 2?', timestamp: '2024-01-17T14:00:00Z', avatar: '/avatar5.jpg' },
        { id: 6, sender: 'Lê Thu An', message: 'Em muốn tham gia ạ!', timestamp: '2024-01-17T14:30:00Z', avatar: '/avatar6.jpg' }
      ],
      4: [
        { id: 7, sender: 'Hoàng Văn Nam', message: 'Welcome to English Club!', timestamp: '2024-01-18T16:00:00Z', avatar: '/avatar7.jpg' },
        { id: 8, sender: 'Đỗ Thị Lan', message: 'Hello everyone!', timestamp: '2024-01-18T16:05:00Z', avatar: '/avatar8.jpg' }
      ],
      5: [
        { id: 9, sender: 'Bùi Minh Tuấn', message: 'Chiến dịch tình nguyện sắp tới, mọi người sẵn sàng chưa?', timestamp: '2024-01-19T11:00:00Z', avatar: '/avatar9.jpg' },
        { id: 10, sender: 'Vũ Thu Hà', message: 'Em sẵn sàng tham gia!', timestamp: '2024-01-19T11:30:00Z', avatar: '/avatar10.jpg' }
      ]
    };

    // Set data based on clubId
    setClub(clubDataMap[clubIdNum] || clubDataMap[1]);
    setMembers(membersDataMap[clubIdNum] || membersDataMap[1]);
    setPosts(postsDataMap[clubIdNum] || postsDataMap[1]);
    // Use saved events if available, otherwise use mock data
    setEvents(savedEvents.length > 0 ? savedEvents : (eventsDataMap[clubIdNum] || eventsDataMap[1]));
    setChatMessages(chatMessagesMap[clubIdNum] || chatMessagesMap[1]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      sender: currentUser?.fullName || 'Người dùng',
      message: newMessage,
      timestamp: new Date().toISOString(),
      avatar: currentUser?.avatar || '/default-avatar.jpg'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const filteredMembers = members.filter(member => 
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
  };

  const handleJoinClub = () => {
    setJoinForm({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      grade: currentUser?.grade || '',
      class: currentUser?.class || '',
      reason: '',
      skills: ''
    });
    setShowJoinModal(true);
  };

  const handleSubmitJoin = async () => {
    try {
      const membershipData = {
        ...joinForm,
        clubId: parseInt(clubId || '1'),
        userId: currentUser?.id || 1,
        status: 'pending',
        submittedDate: new Date().toISOString()
      };

      // Save to localStorage
      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      existingApplications.push(membershipData);
      localStorage.setItem('clubApplications', JSON.stringify(existingApplications));

      alert('Đã gửi đơn đăng ký thành công! Vui lòng chờ phê duyệt.');
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Có lỗi xảy ra khi gửi đơn đăng ký.');
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      content: '',
      type: 'announcement',
      images: []
    });
    setShowPostModal(true);
  };

  const handleEditPost = (post: ClubPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      type: post.type,
      images: post.images || []
    });
    setShowPostModal(true);
  };

  const handleSavePost = async () => {
    try {
      const postData = {
        ...postForm,
        id: editingPost ? editingPost.id : Date.now(),
        clubId: parseInt(clubId || '1'),
        author: currentUser?.fullName || 'Người dùng',
        authorAvatar: currentUser?.avatar || '/default-avatar.jpg',
        createdAt: editingPost ? editingPost.createdAt : new Date().toISOString(),
        likes: editingPost ? editingPost.likes : 0,
        comments: editingPost ? editingPost.comments : 0
      };

      if (editingPost) {
        setPosts(prev => prev.map(p => p.id === editingPost.id ? postData : p));
      } else {
        setPosts(prev => [postData, ...prev]);
      }

      setShowPostModal(false);
      setEditingPost(null);
      alert(editingPost ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết thành công!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Có lỗi xảy ra khi lưu bài viết.');
    }
  };

  const handleDeletePost = (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    setPosts(prev => prev.filter(p => p.id !== postId));
    alert('Xóa bài viết thành công!');
  };

  const handleLikePost = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      maxParticipants: '',
      registrationDeadline: new Date().toISOString().split('T')[0]
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: ClubEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || '09:00',
      location: event.location || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationDeadline: event.registrationDeadline || event.date
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        id: editingEvent ? editingEvent.id : Date.now(),
        clubId: parseInt(clubId || '1'),
        maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : null,
        currentParticipants: editingEvent ? editingEvent.currentParticipants : 0,
        createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
        status: 'upcoming'
      };

      if (editingEvent) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
        alert('Cập nhật sự kiện thành công!');
      } else {
        setEvents(prev => [eventData, ...prev]);
        alert('Tạo sự kiện thành công!');
      }

      setShowEventModal(false);
      setEditingEvent(null);
      
      // Save to localStorage to persist data
      const savedEvents = JSON.parse(localStorage.getItem(`club_events_${clubId}`) || '[]');
      if (editingEvent) {
        const updatedEvents = savedEvents.map((e: any) => e.id === editingEvent.id ? eventData : e);
        localStorage.setItem(`club_events_${clubId}`, JSON.stringify(updatedEvents));
      } else {
        localStorage.setItem(`club_events_${clubId}`, JSON.stringify([eventData, ...savedEvents]));
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Có lỗi xảy ra khi lưu sự kiện.');
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    
    setEvents(prev => prev.filter(e => e.id !== eventId));
    
    // Update localStorage
    const savedEvents = JSON.parse(localStorage.getItem(`club_events_${clubId}`) || '[]');
    const updatedEvents = savedEvents.filter((e: any) => e.id !== eventId);
    localStorage.setItem(`club_events_${clubId}`, JSON.stringify(updatedEvents));
    
    alert('Xóa sự kiện thành công!');
  };

  const handleRegisterForEvent = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      alert('Sự kiện đã đủ số người tham gia!');
      return;
    }

    // Update participant count
    const updatedEvents = events.map(e => 
      e.id === eventId 
        ? { ...e, currentParticipants: e.currentParticipants + 1 }
        : e
    );
    setEvents(updatedEvents);

    // Update localStorage
    localStorage.setItem(`club_events_${clubId}`, JSON.stringify(updatedEvents));

    alert('Đăng ký tham gia sự kiện thành công!');
  };

  const isUserMember = members.some(m => m.email === currentUser?.email);
  const isUserAdmin = members.some(m => m.email === currentUser?.email && ['president', 'vice_president'].includes(m.role));

  console.log('ClubDetailView rendering...', { clubId, club: !!club, loading });

  if (loading) {
    console.log('Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!club) {
    console.log('No club found:', clubId);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy câu lạc bộ</h2>
          <Button onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" /> Quay lại
          </Button>
        </div>
      </div>
    );
  }

  console.log('About to render tabs...', { 
    activeTab, 
    postsCount: posts.length, 
    membersCount: members.length,
    eventsCount: events.length 
  });

  return (
    <div className="space-y-6">
      {/* TEST COMPONENT - Remove this after debugging */}
      <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
        <h3 className="text-red-700 font-bold">TEST: ClubDetailView is rendering!</h3>
        <p>Club ID: {clubId}</p>
        <p>Club Name: {club?.name}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Posts: {posts.length}</p>
        <p>Members: {members.length}</p>
        <p>Events: {events.length}</p>
        <button 
          onClick={() => alert('Test button works!')}
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Test Button
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img src={club.image || '/default-club.jpg'} alt={club.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <p className="text-lg opacity-90">{club.category}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{club.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{club._count?.members || 0} thành viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{club.meetingRoom || 'Chưa có địa điểm cố định'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Cố vấn: {club.advisor?.fullName || 'Chưa có'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isUserMember ? (
                <Button onClick={handleJoinClub} className="bg-green-600 hover:bg-green-700">
                  <Users size={16} className="mr-2" /> Đăng ký thành viên
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span>Đã là thành viên</span>
                </div>
              )}
              <Button variant="secondary" onClick={onBack}>
                <ArrowLeft size={16} className="mr-2" /> Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SIMPLE TABS TEST */}
      <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4">
        <h3 className="text-blue-700 font-bold mb-2">SIMPLE TABS TEST</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded ${activeTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Posts ({posts.length})
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded ${activeTab === 'members' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Members ({members.length})
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Events ({events.length})
          </button>
        </div>
        <div className="bg-white p-4 rounded">
          <p>Current Tab: <strong>{activeTab}</strong></p>
          {activeTab === 'posts' && <p>Posts content here...</p>}
          {activeTab === 'members' && <p>Members content here...</p>}
          {activeTab === 'events' && <p>Events content here...</p>}
        </div>
      </div>

      {/* ORIGINAL TABS LOCATION MARKER */}
      <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4">
        <h3 className="text-green-700 font-bold">📍 ORIGINAL TABS SHOULD BE BELOW THIS GREEN BOX</h3>
        <p>If you don't see tabs below, there's a rendering issue</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-orange-500 border-4 border-orange-700 rounded-xl p-4">
        <h3 className="text-white font-bold text-center mb-2">🎯 ORIGINAL TABS (ORANGE BOX)</h3>
        <div className="flex space-x-1">
          <button 
            onClick={() => {
              console.log('Clicking posts tab');
              setActiveTab('posts');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'posts' 
                ? 'bg-white text-orange-600' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Bài viết
          </button>
          <button 
            onClick={() => {
              console.log('Clicking members tab');
              setActiveTab('members');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'members' 
                ? 'bg-white text-orange-600' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Thành viên ({members.length})
          </button>
          <button 
            onClick={() => {
              console.log('Clicking events tab');
              setActiveTab('events');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'events' 
                ? 'bg-white text-orange-600' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Sự kiện ({events.length})
          </button>
          <button 
            onClick={() => {
              console.log('Clicking schedule tab');
              setActiveTab('schedule');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'schedule' 
                ? 'bg-white text-orange-600' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Lịch sinh hoạt
          </button>
          <button 
            onClick={() => {
              console.log('Clicking chat tab');
              setActiveTab('chat');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'chat' 
                ? 'bg-white text-orange-600' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Chat ({chatMessages.length})
          </button>
        </div>
      </div>

      {/* TABS CONFIRMATION MARKER */}
      <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4">
        <h3 className="text-purple-700 font-bold">📍 TABS SHOULD BE ABOVE THIS PURPLE BOX</h3>
        <p>If you see this but no tabs above, the tabs component is not rendering</p>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <strong>Debug Info:</strong><br/>
        Active Tab: {activeTab}<br/>
        Posts: {posts.length}<br/>
        Members: {members.length}<br/>
        Events: {events.length}<br/>
        Chat Messages: {chatMessages.length}<br/>
        Is User Member: {isUserMember ? 'Yes' : 'No'}<br/>
        Is User Admin: {isUserAdmin ? 'Yes' : 'No'}
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Bài viết</h2>
            {(isUserMember || isUserAdmin) && (
              <Button onClick={handleCreatePost}>
                <Plus size={16} className="mr-2" /> Viết bài
              </Button>
            )}
          </div>

          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <img src={post.authorAvatar || '/default-avatar.jpg'} alt={post.author} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.author} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {isUserAdmin && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditPost(post)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeletePost(post.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {post.images.map((image, index) => (
                        <img key={index} src={image} alt="" className="w-full h-32 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button onClick={() => handleLikePost(post.id)} className="flex items-center gap-1 hover:text-red-600">
                      <Heart size={16} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <MessageCircle size={16} />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-600">
                      <Share2 size={16} />
                      <span>Chia sẻ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Chưa có bài viết nào</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Thành viên ({members.length})</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={member.avatar || '/default-avatar.jpg'} alt={member.fullName} className="w-16 h-16 rounded-full" />
                  <div>
                    <h3 className="font-bold text-gray-800">{member.fullName}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      member.role === 'president' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'vice_president' ? 'bg-blue-100 text-blue-800' :
                      member.role === 'secretary' ? 'bg-green-100 text-green-800' :
                      member.role === 'treasurer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role === 'president' ? 'Chủ nhiệm' :
                       member.role === 'vice_president' ? 'Phó chủ nhiệm' :
                       member.role === 'secretary' ? 'Thư ký' :
                       member.role === 'treasurer' ? 'Thủ quỹ' : 'Thành viên'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Ngày tham gia: {new Date(member.joinedDate).toLocaleDateString('vi-VN')}</p>
                  <p>Trạng thái: <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span></p>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy thành viên nào</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Sự kiện ({events.length})</h2>
            {(isUserMember || isUserAdmin) && (
              <Button onClick={handleCreateEvent}>
                <Plus size={16} className="mr-2" /> Tạo sự kiện
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status === 'upcoming' ? 'Sắp diễn ra' :
                       event.status === 'ongoing' ? 'Đang diễn ra' :
                       event.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                    </span>
                    {isUserAdmin && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa sự kiện"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa sự kiện"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(event.date).toLocaleDateString('vi-VN')} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  {event.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{event.currentParticipants}/{event.maxParticipants} người tham gia</span>
                      {event.currentParticipants >= event.maxParticipants && (
                        <span className="text-red-600 font-medium">(Đã đủ)</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Hạn đăng ký: {new Date(event.registrationDeadline).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex gap-2">
                      {!isUserMember ? (
                        <Button size="sm" variant="secondary" disabled>
                          <Users size={14} className="mr-1" /> Cần là thành viên
                        </Button>
                      ) : event.maxParticipants && event.currentParticipants >= event.maxParticipants ? (
                        <Button size="sm" variant="secondary" disabled>
                          <Users size={14} className="mr-1" /> Đã đủ người
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleRegisterForEvent(event.id)}>
                          <Users size={14} className="mr-1" /> Đăng ký tham gia
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Chưa có sự kiện nào</p>
              {(isUserMember || isUserAdmin) && (
                <Button onClick={handleCreateEvent} className="mt-4">
                  <Plus size={16} className="mr-2" /> Tạo sự kiện đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Lịch sinh hoạt</h2>
            <Button variant="secondary">
              <Plus size={16} className="mr-2" /> Thêm lịch
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="text-center">
                  <div className="text-sm text-blue-600 font-medium">Thứ 3</div>
                  <div className="text-lg font-bold text-blue-800">15:00</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">Sinh hoạt thường lệ</h4>
                  <p className="text-sm text-gray-600">Buổi sinh hoạt hàng tuần của CLB</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Hàng tuần</span>
              </div>

              <div className="flex items-center gap-4 p-4 border-l-4 border-green-500 bg-green-50">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium">Thứ 6</div>
                  <div className="text-lg font-bold text-green-800">17:00</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">Workshop đặc biệt</h4>
                  <p className="text-sm text-gray-600">Workshop nâng cao cho thành viên</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">2 tuần/lần</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Chat nội bộ</h2>
            <span className="text-sm text-gray-500">{members.length} thành viên trực tuyến</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(message => (
                <div key={message.id} className={`flex gap-3 ${message.sender === currentUser?.fullName ? 'flex-row-reverse' : ''}`}>
                  <img src={message.avatar || '/default-avatar.jpg'} alt={message.sender} className="w-8 h-8 rounded-full" />
                  <div className={`max-w-xs ${message.sender === currentUser?.fullName ? 'text-right' : ''}`}>
                    <div className={`text-xs text-gray-500 mb-1 ${message.sender === currentUser?.fullName ? 'text-right' : ''}`}>
                      {message.sender} • {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.sender === currentUser?.fullName 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện *</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nhập tên sự kiện"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sự kiện *</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Mô tả chi tiết về sự kiện"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tổ chức *</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm *</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập địa điểm tổ chức"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số người tối đa</label>
                <input
                  type="number"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({...eventForm, maxParticipants: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Không giới hạn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn đăng ký</label>
                <input
                  type="date"
                  value={eventForm.registrationDeadline}
                  onChange={(e) => setEventForm({...eventForm, registrationDeadline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEventModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEvent} disabled={!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.location}>
              {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Đăng ký thành viên">
        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={joinForm.fullName}
                  onChange={(e) => setJoinForm({...joinForm, fullName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={joinForm.email}
                  onChange={(e) => setJoinForm({...joinForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={joinForm.phone}
                  onChange={(e) => setJoinForm({...joinForm, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                <input
                  type="text"
                  value={joinForm.class}
                  onChange={(e) => setJoinForm({...joinForm, class: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="VD: 12A1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do muốn tham gia *</label>
              <textarea
                value={joinForm.reason}
                onChange={(e) => setJoinForm({...joinForm, reason: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Hãy chia sẻ lý do bạn muốn tham gia câu lạc bộ này..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng và sở thích</label>
              <textarea
                value={joinForm.skills}
                onChange={(e) => setJoinForm({...joinForm, skills: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={2}
                placeholder="Các kỹ năng hoặc sở thích liên quan đến hoạt động của CLB..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowJoinModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitJoin} disabled={!joinForm.fullName || !joinForm.email || !joinForm.reason}>
              Gửi đơn đăng ký
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post Modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title={editingPost ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài viết</label>
              <select
                value={postForm.type}
                onChange={(e) => setPostForm({...postForm, type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="announcement">Thông báo</option>
                <option value="news">Tin tức</option>
                <option value="discussion">Thảo luận</option>
                <option value="achievement">Thành tích</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
              <textarea
                value={postForm.content}
                onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={6}
                placeholder="Nhập nội dung bài viết..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowPostModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSavePost} disabled={!postForm.title || !postForm.content}>
              {editingPost ? 'Cập nhật' : 'Đăng bài'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClubDetailView;
