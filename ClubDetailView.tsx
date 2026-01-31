import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Calendar, MapPin, User, Plus, Edit, Trash2, Clock, Send, CheckCircle, XCircle, MessageSquare, Heart, Share2, Search, Filter, ChevronDown, Star, Award, Target, BookOpen, Lightbulb, Coffee, Gamepad2, Music, Palette, Camera, Mic, Globe, Code, Dumbbell, Trophy, Loader2, MessageCircle
} from 'lucide-react';
import { api } from './data';
import { Club, ClubMember, ClubPost, ClubEvent, ClubActivity, ClubAdminRole, ClubMembership } from './types';
import { Button, Modal } from './components';

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
    try {
      setLoading(true);
      console.log('Loading club data for clubId:', clubId);
      
      // Use only mock data for now to avoid API errors
      loadMockData();
      
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

  // Admin approval functions
  const [applications, setApplications] = useState<any[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const loadApplications = () => {
    const allApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
    const clubApplications = allApplications.filter((app: any) => app.clubId === parseInt(clubId || '1'));
    setApplications(clubApplications);
  };

  const handleApproveApplication = (applicationId: number) => {
    const allApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
    const updatedApplications = allApplications.map((app: any) => 
      app.id === applicationId ? { ...app, status: 'approved', approvedDate: new Date().toISOString() } : app
    );
    localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));
    
    // Add to members list
    const application = allApplications.find((app: any) => app.id === applicationId);
    if (application) {
      // Check if this is the first member (creator) or assign appropriate role
      const currentMembersCount = members.length;
      let assignedRole: ClubAdminRole = 'member';
      
      if (currentMembersCount === 0) {
        // First member becomes president
        assignedRole = 'president';
      } else if (currentMembersCount < 4) {
        // Early members get leadership roles
        const leadershipRoles: ClubAdminRole[] = ['vice_president', 'secretary', 'treasurer'];
        assignedRole = leadershipRoles[currentMembersCount - 1];
      }
      
      const newMember = {
        id: Date.now(),
        fullName: application.fullName,
        email: application.email,
        role: assignedRole,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        avatar: '/default-avatar.jpg',
        phone: application.phone,
        class: application.class,
        grade: application.grade
      };
      setMembers(prev => [...prev, newMember]);
      
      // Save to localStorage
      const clubMemberships = JSON.parse(localStorage.getItem(`club_memberships_${clubId}`) || '[]');
      clubMemberships.push({
        id: Date.now(),
        userId: application.userId,
        clubId: parseInt(clubId || '1'),
        role: assignedRole,
        status: 'approved',
        joinedDate: new Date().toISOString().split('T')[0],
        applicationDate: application.submittedDate,
        approvedBy: currentUser?.id || 1,
        approvedDate: new Date().toISOString()
      });
      localStorage.setItem(`club_memberships_${clubId}`, JSON.stringify(clubMemberships));
      
      loadApplications();
      alert(`Đã phê duyệt đơn đăng ký! ${application.fullName} đã được thêm vào CLB với vai trò: ${assignedRole}`);
    }
  };

  const handleRejectApplication = (applicationId: number) => {
    const allApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
    const updatedApplications = allApplications.map((app: any) => 
      app.id === applicationId ? { ...app, status: 'rejected', rejectedDate: new Date().toISOString() } : app
    );
    localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));
    loadApplications();
    alert('Đã từ chối đơn đăng ký!');
  };

  // Schedule management
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    dayOfWeek: '2', // 2 = Thứ 3
    time: '15:00',
    frequency: 'weekly', // weekly, biweekly, monthly
    location: club?.meetingRoom || '',
    color: 'blue'
  });
  const [schedules, setSchedules] = useState<any[]>([
    {
      id: 1,
      title: 'Sinh hoạt thường lệ',
      description: 'Buổi sinh hoạt hàng tuần của CLB',
      dayOfWeek: '2',
      time: '15:00',
      frequency: 'weekly',
      location: club?.meetingRoom || '',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Workshop đặc biệt',
      description: 'Workshop nâng cao cho thành viên',
      dayOfWeek: '5',
      time: '17:00',
      frequency: 'biweekly',
      location: club?.meetingRoom || '',
      color: 'green'
    }
  ]);

  const handleCreateSchedule = () => {
    console.log('handleCreateSchedule called!');
    console.log('Current club:', club);
    console.log('Current schedules:', schedules);
    
    setScheduleForm({
      title: '',
      description: '',
      dayOfWeek: '2',
      time: '15:00',
      frequency: 'weekly',
      location: club?.meetingRoom || '',
      color: 'blue'
    });
    console.log('Schedule form set:', scheduleForm);
    setShowScheduleModal(true);
    console.log('ShowScheduleModal set to true');
  };

  const handleSaveSchedule = () => {
    const newSchedule = {
      id: Date.now(),
      ...scheduleForm
    };
    setSchedules(prev => [...prev, newSchedule]);
    setShowScheduleModal(false);
    alert('Đã thêm lịch sinh hoạt thành công!');
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch sinh hoạt này?')) return;
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    alert('Đã xóa lịch sinh hoạt thành công!');
  };

  const getDayName = (dayOfWeek: string) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[parseInt(dayOfWeek)] || dayOfWeek;
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Hàng tuần';
      case 'biweekly': return '2 tuần/lần';
      case 'monthly': return 'Hàng tháng';
      default: return frequency;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 bg-blue-50 text-blue-800 bg-blue-100';
      case 'green':
        return 'border-green-500 bg-green-50 text-green-800 bg-green-100';
      case 'purple':
        return 'border-purple-500 bg-purple-50 text-purple-800 bg-purple-100';
      case 'red':
        return 'border-red-500 bg-red-50 text-red-800 bg-red-100';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800 bg-gray-100';
    }
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

  useEffect(() => {
    loadClubData();
    loadCurrentUser();
    loadApplications();
  }, [clubId]);

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
  const isUserAdmin = (() => {
    // Super admin (system admin)
    if (currentUser?.role === 'ADMIN') return true;
    
    // Teacher can admin any club
    if (currentUser?.role === 'TEACHER') return true;
    
    // Check club-specific admin roles
    const userMembership = members.find(m => m.email === currentUser?.email);
    if (!userMembership) return false;
    
    return ['president', 'vice_president', 'secretary', 'treasurer'].includes(userMembership.role);
  })();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-700 relative">
          <img src={club.image || '/default-club.jpg'} alt={club.name} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end">
            <div className="p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {club.category}
                </div>
                <div className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                  <Users size={14} />
                  {members.length} thành viên
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <p className="text-lg opacity-90 max-w-3xl">{club.description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phòng họp</p>
                <p className="font-semibold text-gray-800">{club.meetingRoom}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-500 rounded-lg">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cố vấn</p>
                <p className="font-semibold text-gray-800">{club.advisor?.fullName || 'Chưa có'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoạt động</p>
                <p className="font-semibold text-gray-800">{events.length} sự kiện</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {!isUserMember ? (
              <Button 
                onClick={handleJoinClub} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg px-8 py-3 shadow-lg transform transition hover:scale-105"
              >
                <Users size={18} className="mr-2" /> Đăng ký thành viên
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 border border-green-300 rounded-lg">
                <CheckCircle size={18} className="text-green-600" />
                <span className="font-medium text-green-800">Đã là thành viên</span>
              </div>
            )}
            <Button variant="secondary" onClick={onBack} className="px-6 py-3">
              <ArrowLeft size={16} className="mr-2" /> Quay lại
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'posts' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle size={18} />
                <span>Bài viết</span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/20">
                  {posts.length}
                </span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'members' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={18} />
                <span>Thành viên</span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/20">
                  {members.length}
                </span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'events' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={18} />
                <span>Sự kiện</span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/20">
                  {events.length}
                </span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'schedule' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock size={18} />
                <span>Lịch sinh hoạt</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                <span>Chat</span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/20">
                  {chatMessages.length}
                </span>
              </div>
            </button>
            {isUserAdmin && (
              <button 
                onClick={() => setActiveTab('approval')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'approval' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  <span>Xét duyệt</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-white/20">
                    {applications.filter(app => app.status === 'pending').length}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {activeTab === 'posts' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="text-blue-500" />
                Bài viết
              </h2>
              {(isUserMember || isUserAdmin) && (
                <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" /> Viết bài
                </Button>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500">Hãy là người đầu tiên chia sẻ điều thú vị!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar || '/default-avatar.jpg'} alt={post.author} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{post.author}</h4>
                          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        post.type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                        post.type === 'discussion' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {post.type === 'announcement' ? 'Thông báo' :
                         post.type === 'discussion' ? 'Thảo luận' : 'Sự kiện'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-red-500">
                        <Heart size={16} />
                        <span>{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <MessageSquare size={16} />
                        <span>{post.comments || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500">
                        <Share2 size={16} />
                        <span>Chia sẻ</span>
                      </button>
                    </div>
                  </div>
                ))}
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="text-blue-500" />
              Lịch sinh hoạt
            </h2>
            <Button 
              onClick={() => {
                console.log('Add Schedule button clicked!');
                handleCreateSchedule();
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" /> Thêm lịch
            </Button>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có lịch sinh hoạt nào</h3>
              <p className="text-gray-500">Hãy thêm lịch sinh hoạt đầu tiên cho CLB!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map(schedule => (
                <div key={schedule.id} className={`flex items-center gap-4 p-4 border-l-4 ${getColorClasses(schedule.color)} rounded-lg`}>
                  <div className="text-center">
                    <div className="text-sm font-medium">{getDayName(schedule.dayOfWeek)}</div>
                    <div className="text-lg font-bold">{schedule.time}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{schedule.title}</h4>
                    <p className="text-sm text-gray-600">{schedule.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span>{schedule.location}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getColorClasses(schedule.color)}`}>
                    {getFrequencyText(schedule.frequency)}
                  </span>
                  {(isUserAdmin || isUserMember) && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleDeleteSchedule(schedule.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approval' && isUserAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Xét duyệt đơn đăng ký</h2>
            <span className="text-sm text-gray-500">
              {applications.filter(app => app.status === 'pending').length} đơn chờ duyệt
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Chưa có đơn đăng ký nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{application.fullName}</h3>
                      <p className="text-sm text-gray-500">{application.email}</p>
                      <p className="text-sm text-gray-500">{application.phone}</p>
                      <p className="text-sm text-gray-500">Lớp: {application.class}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status === 'pending' ? 'Chờ duyệt' :
                       application.status === 'approved' ? 'Đã duyệt' :
                       application.status === 'rejected' ? 'Đã từ chối' : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Lý do tham gia:</strong> {application.reason || 'Không có'}</p>
                    <p><strong>Kỹ năng:</strong> {application.skills || 'Không có'}</p>
                    <p><strong>Ngày đăng ký:</strong> {new Date(application.submittedDate).toLocaleDateString('vi-VN')}</p>
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApproveApplication(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={16} className="mr-2" /> Phê duyệt
                      </Button>
                      <Button 
                        onClick={() => handleRejectApplication(application.id)}
                        variant="secondary"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle size={16} className="mr-2" /> Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* Test Modal */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '600px'
          }}>
            <h2>Thêm lịch sinh hoạt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập tiêu đề lịch sinh hoạt"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Mô tả chi tiết về lịch sinh hoạt"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ trong tuần</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({...scheduleForm, dayOfWeek: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="1">Thứ 2</option>
                    <option value="2">Thứ 3</option>
                    <option value="3">Thứ 4</option>
                    <option value="4">Thứ 5</option>
                    <option value="5">Thứ 6</option>
                    <option value="6">Thứ 7</option>
                    <option value="0">Chủ nhật</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) => setScheduleForm({...scheduleForm, frequency: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="weekly">Hàng tuần</option>
                    <option value="biweekly">2 tuần/lần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                  <select
                    value={scheduleForm.color}
                    onChange={(e) => setScheduleForm({...scheduleForm, color: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="blue">Xanh dương</option>
                    <option value="green">Xanh lá</option>
                    <option value="purple">Tím</option>
                    <option value="red">Đỏ</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Địa điểm sinh hoạt"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveSchedule} 
                disabled={!scheduleForm.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Lưu lịch
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClubDetailView;
