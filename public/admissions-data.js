// Admissions Data - Shared between React component and HTML page
window.ADMISSIONS_DATA = {
  school: {
    name: 'Trường THPT ABC',
    slogan: 'Nâng tầm tri thức - Vươn ra thế giới',
    description: 'Trường THPT ABC là cơ sở giáo dục uy tín với hơn 15 năm kinh nghiệm trong việc đào tạo và phát triển thế hệ tương lai.',
    heroImage: 'https://via.placeholder.com/1200x600/6366f1/ffffff?text=Trường+THPT+ABC',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    phone: '(028) 1234 5678',
    email: 'tuyensinh@thptabc.edu.vn',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM'
  },
  
  statistics: [
    { id: 1, label: 'Học sinh', value: '2,500+', icon: 'users' },
    { id: 2, label: 'Tỷ lệ tốt nghiệp', value: '98%', icon: 'graduation-cap' },
    { id: 3, label: 'Giải thưởng', value: '150+', icon: 'award' },
    { id: 4, label: 'Khóa học', value: '50+', icon: 'book-open' }
  ],

  programs: [
    {
      id: 1,
      name: 'Chương trình Tú tài',
      grade: 'Lớp 10-12',
      duration: '3 năm',
      tuition: '15.000.000 VNĐ/năm',
      features: [
        'Chương trình chuẩn Bộ GD&ĐT',
        'Song ngữ Anh - Việt',
        'CLB học thuật quốc tế',
        'Học bổng du học'
      ],
      image: 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Chương+trình+Tú+tài',
      description: 'Chương trình đào tạo toàn diện chuẩn bị cho kỳ thi THPT Quốc gia và du học'
    },
    {
      id: 2,
      name: 'Chương trình Trung học',
      grade: 'Lớp 6-9',
      duration: '4 năm',
      tuition: '12.000.000 VNĐ/năm',
      features: [
        'Phát triển tư duy phản biện',
        'Kỹ năng mềm toàn diện',
        'Hoạt động thể chất đa dạng',
        'Tư vấn hướng nghiệp sớm'
      ],
      image: 'https://via.placeholder.com/400x250/10b981/ffffff?text=Chương+trình+Trung+học',
      description: 'Xây dựng nền tảng kiến thức vững chắc và phát triển kỹ năng thế kỷ 21'
    },
    {
      id: 3,
      name: 'Chương trình Tiểu học',
      grade: 'Lớp 1-5',
      duration: '5 năm',
      tuition: '10.000.000 VNĐ/năm',
      features: [
        'Phương pháp giáo dục hiện đại',
        'Lớp học tối đa 25 học sinh',
        'Ngoại khóa đa dạng',
        'Phát triển thể chất và nghệ thuật'
      ],
      image: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Chương+trình+Tiểu+học',
      description: 'Môi trường học tập thân thiện, khơi dậy niềm đam mê học tập từ sớm'
    }
  ],

  courses: [
    {
      id: 1,
      title: 'Luyện thi THPT Quốc gia',
      category: 'Luyện thi',
      duration: '9 tháng',
      level: 'Nâng cao',
      price: '8.000.000 VNĐ',
      instructor: 'Thầy Nguyễn Văn A',
      rating: 4.8,
      students: 156,
      image: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Luyện+thi'
    },
    {
      id: 2,
      title: 'Tiếng Anh giao tiếp',
      category: 'Ngoại ngữ',
      duration: '3 tháng',
      level: 'Cơ bản - Nâng cao',
      price: '3.500.000 VNĐ',
      instructor: 'Cô Trần Thị B',
      rating: 4.9,
      students: 203,
      image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Tiếng+Anh'
    },
    {
      id: 3,
      title: 'Lập trình Python',
      category: 'Công nghệ',
      duration: '6 tháng',
      level: 'Cơ bản',
      price: '5.000.000 VNĐ',
      instructor: 'Thầy Lê Văn C',
      rating: 4.7,
      students: 89,
      image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Python'
    }
  ],

  testimonials: [
    {
      id: 1,
      name: 'Nguyễn Thị Mai',
      role: 'Phụ huynh học sinh lớp 10',
      content: 'Con tôi đã tiến bộ vượt bậc sau khi chuyển sang trường. Môi trường giáo dục tuyệt vời!',
      rating: 5,
      avatar: 'https://via.placeholder.com/50x50/6366f1/ffffff?text=NM'
    },
    {
      id: 2,
      name: 'Trần Minh Anh',
      role: 'Học sinh lớp 12',
      content: 'Nhờ sự hướng dẫn của thầy cô, em đã đỗ trường đại học mơ ước.',
      rating: 5,
      avatar: 'https://via.placeholder.com/50x50/10b981/ffffff?text=TA'
    },
    {
      id: 3,
      name: 'Lê Văn Hùng',
      role: 'Cựu học sinh',
      content: 'Nền tảng từ trường đã giúp em thành công trong sự nghiệp.',
      rating: 5,
      avatar: 'https://via.placeholder.com/50x50/f59e0b/ffffff?text=LH'
    }
  ],

  facilities: [
    {
      id: 1,
      name: 'Thư viện hiện đại',
      description: '20,000+ đầu sách, không gian học tập yên tĩnh',
      icon: 'book-open',
      image: 'https://via.placeholder.com/64x64/6366f1/ffffff?text=📚'
    },
    {
      id: 2,
      name: 'Phòng Lab công nghệ',
      description: 'Trang thiết bị hiện đại, wifi tốc độ cao',
      icon: 'cpu',
      image: 'https://via.placeholder.com/64x64/10b981/ffffff?text=💻'
    },
    {
      id: 3,
      name: 'Sân thể thao',
      description: 'Sân bóng đá, bóng rổ, gym hiện đại',
      icon: 'target',
      image: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=⚽'
    },
    {
      id: 4,
      name: 'An ninh 24/7',
      description: 'Camera giám sát, bảo vệ chuyên nghiệp',
      icon: 'shield',
      image: 'https://via.placeholder.com/64x64/ef4444/ffffff?text=🔒'
    }
  ],

  contact: {
    phone: '(028) 1234 5678',
    hotline: '1900-xxxx',
    email: 'tuyensinh@thptabc.edu.vn',
    infoEmail: 'info@thptabc.edu.vn',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    workingHours: 'Đón học sinh từ 7:00 - 17:00'
  },

  seo: {
    title: 'Tuyển sinh 2024-2025 - Trường THPT ABC',
    description: 'Đăng ký tuyển sinh các chương trình đào tạo chất lượng cao. Môi trường học tập hiện đại, đội ngũ giáo viên giỏi.',
    keywords: 'tuyển sinh, trường thpt, giáo dục, học tập, trường ABC',
    ogImage: 'https://via.placeholder.com/1200x630/6366f1/ffffff?text=Trường+THPT+ABC'
  }
};

// Helper functions for dynamic content loading
window.loadAdmissionsData = function() {
  return window.ADMISSIONS_DATA;
};

window.updateAdmissionsData = function(newData) {
  window.ADMISSIONS_DATA = { ...window.ADMISSIONS_DATA, ...newData };
  // Trigger update event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admissionsDataUpdated', { 
      detail: window.ADMISSIONS_DATA 
    }));
  }
};

// Initialize data on load
if (typeof window !== 'undefined') {
  // Data is already loaded via script tag
  console.log('Admissions data loaded successfully');
}
