import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, MapPin, Clock, ArrowLeft, Plus, Edit, Trash2, 
  Heart, MessageCircle, Share2, User, Mail, Phone, Award, 
  BookOpen, Target, Star, CheckCircle, XCircle, Loader2
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
  
  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ClubPost | null>(null);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  
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

    // Set data based on clubId
    setClub(clubDataMap[clubIdNum] || clubDataMap[1]);
    setMembers(membersDataMap[clubIdNum] || membersDataMap[1]);
    setPosts(postsDataMap[clubIdNum] || postsDataMap[1]);
    setEvents(eventsDataMap[clubIdNum] || eventsDataMap[1]);
  };

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

  const handleSaveEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        id: editingEvent ? editingEvent.id : Date.now(),
        clubId: parseInt(clubId || '1'),
        maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : null,
        currentParticipants: editingEvent ? editingEvent.currentParticipants : 0,
        createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
      };

      if (editingEvent) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
      } else {
        setEvents(prev => [eventData, ...prev]);
      }

      setShowEventModal(false);
      setEditingEvent(null);
      alert(editingEvent ? 'Cập nhật sự kiện thành công!' : 'Tạo sự kiện thành công!');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Có lỗi xảy ra khi lưu sự kiện.');
    }
  };

  const isUserMember = members.some(m => m.email === currentUser?.email);
  const isUserAdmin = members.some(m => m.email === currentUser?.email && ['president', 'vice_president'].includes(m.role));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!club) {
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

  return (
    <div className="space-y-6">
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

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex space-x-1">
          <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium">
            Bài viết
          </button>
          <button className="flex-1 py-2 px-4 hover:bg-gray-50 rounded-lg font-medium">
            Thành viên
          </button>
          <button className="flex-1 py-2 px-4 hover:bg-gray-50 rounded-lg font-medium">
            Sự kiện
          </button>
          <button className="flex-1 py-2 px-4 hover:bg-gray-50 rounded-lg font-medium">
            Lịch sinh hoạt
          </button>
        </div>
      </div>

      {/* Posts Section */}
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
