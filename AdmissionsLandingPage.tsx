import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Award, BookOpen, Calendar, Phone, Mail, MapPin, 
  Clock, CheckCircle, Star, TrendingUp, Heart, Target, Zap, Shield,
  ChevronRight, ArrowRight, Play, Download, Send, MessageCircle
} from 'lucide-react';
import { Button, Modal } from './components';

interface Program {
  id: number;
  name: string;
  grade: string;
  duration: string;
  tuition: string;
  features: string[];
  image: string;
  description: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  rating: number;
  students: number;
}

interface RegistrationForm {
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  address: string;
  previousSchool: string;
  interests: string[];
}

const AdmissionsLandingPage: React.FC = () => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<RegistrationForm>({
    fullName: '',
    dob: '',
    email: '',
    phone: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    address: '',
    previousSchool: '',
    interests: []
  });

  // State for dynamic data
  const [dynamicData, setDynamicData] = useState<any>(null);
  const [useDynamicData, setUseDynamicData] = useState(false);

  // Load data from admissions-data.js if available
  useEffect(() => {
    const loadExternalData = async () => {
      try {
        // Try to load the data file
        const response = await fetch('/admissions-data.js');
        if (response.ok) {
          const text = await response.text();
          // Execute the JavaScript to get the data
          const script = document.createElement('script');
          script.text = text;
          document.head.appendChild(script);
          
          // Wait a bit for the script to execute
          setTimeout(() => {
            if ((window as any).ADMISSIONS_DATA) {
              setDynamicData((window as any).ADMISSIONS_DATA);
              setUseDynamicData(true);
              console.log('Loaded dynamic data from admissions-data.js');
            }
            document.head.removeChild(script);
          }, 100);
        }
      } catch (error) {
        console.log('Could not load admissions-data.js, using default data');
        setUseDynamicData(false);
      }
    };

    loadExternalData();
  }, []);

  // Use dynamic data if available, otherwise use defaults
  const currentData = useDynamicData && dynamicData ? dynamicData : getDefaultData();

  function getDefaultData() {
    return {
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
          students: 156
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
          students: 203
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
          students: 89
        }
      ],
      testimonials: [
        {
          id: 1,
          name: 'Nguyễn Thị Mai',
          role: 'Phụ huynh học sinh lớp 10',
          content: 'Con tôi đã tiến bộ vượt bậc sau khi chuyển sang trường. Môi trường giáo dục tuyệt vời!',
          rating: 5
        },
        {
          id: 2,
          name: 'Trần Minh Anh',
          role: 'Học sinh lớp 12',
          content: 'Nhờ sự hướng dẫn của thầy cô, em đã đỗ trường đại học mơ ước.',
          rating: 5
        },
        {
          id: 3,
          name: 'Lê Văn Hùng',
          role: 'Cựu học sinh',
          content: 'Nền tảng từ trường đã giúp em thành công trong sự nghiệp.',
          rating: 5
        }
      ],
      facilities: [
        {
          id: 1,
          name: 'Thư viện hiện đại',
          description: '20,000+ đầu sách, không gian học tập yên tĩnh',
          icon: 'book-open'
        },
        {
          id: 2,
          name: 'Phòng Lab công nghệ',
          description: 'Trang thiết bị hiện đại, wifi tốc độ cao',
          icon: 'cpu'
        },
        {
          id: 3,
          name: 'Sân thể thao',
          description: 'Sân bóng đá, bóng rổ, gym hiện đại',
          icon: 'target'
        },
        {
          id: 4,
          name: 'An ninh 24/7',
          description: 'Camera giám sát, bảo vệ chuyên nghiệp',
          icon: 'shield'
        }
      ],
      contact: {
        phone: '(028) 1234 5678',
        email: 'tuyensinh@thptabc.edu.vn',
        address: '123 Nguyễn Huệ, Q.1, TP.HCM'
      }
    };
  }

  const programs: Program[] = currentData.programs;

  const courses: Course[] = currentData.courses;

  const statistics = currentData.statistics.map(stat => ({
    icon: stat.icon === 'users' ? <Users size={24} /> : 
           stat.icon === 'graduation-cap' ? <GraduationCap size={24} /> :
           stat.icon === 'award' ? <Award size={24} /> :
           stat.icon === 'book-open' ? <BookOpen size={24} /> : <Users size={24} />,
    value: stat.value,
    label: stat.label
  }));

  const facilities = [
    {
      icon: <BookOpen size={32} />,
      title: 'Thư viện hiện đại',
      description: 'Hơn 20,000 đầu sách, không gian học tập mở'
    },
    {
      icon: <Zap size={32} />,
      title: 'Phòng Lab công nghệ',
      description: 'Trang thiết bị hiện đại, wifi tốc độ cao'
    },
    {
      icon: <Heart size={32} />,
      title: 'Sân thể thao đa năng',
      description: 'Bóng đá, bóng rổ, cầu lông, gym'
    },
    {
      icon: <Shield size={32} />,
      title: 'An ninh 24/7',
      description: 'Camera giám sát, bảo vệ chuyên nghiệp'
    }
  ];

  const testimonials = currentData.testimonials;

  const handleRegistration = (program?: Program, course?: Course) => {
    setSelectedProgram(program || null);
    setSelectedCourse(course || null);
    setShowRegistrationModal(true);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration submission
    console.log('Registration data:', formData, 'Program:', selectedProgram, 'Course:', selectedCourse);
    alert('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    setShowRegistrationModal(false);
    setSelectedProgram(null);
    setSelectedCourse(null);
    setFormData({
      fullName: '',
      dob: '',
      email: '',
      phone: '',
      grade: '',
      parentName: '',
      parentPhone: '',
      address: '',
      previousSchool: '',
      interests: []
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Chào mừng đến với
                <br />
                <span className="text-yellow-300">{currentData.school.name}</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                {currentData.school.slogan}. {currentData.school.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => handleRegistration()}
                  className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
                >
                  <GraduationCap size={20} className="mr-2"/>
                  Đăng ký tuyển sinh
                </Button>
                <Button 
                  variant="secondary" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
                >
                  <Play size={20} className="mr-2"/>
                  Xem video giới thiệu
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {statistics.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-blue-100">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://via.placeholder.com/600x400/ffffff/6366f1?text=Trường+THPT+ABC"
                alt="School" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Chương trình đào tạo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Các chương trình được thiết kế phù hợp với từng lứa tuổi, 
              đảm bảo sự phát triển toàn diện về kiến thức, kỹ năng và nhân cách.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <img 
                  src={program.image} 
                  alt={program.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{program.name}</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {program.grade}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thời gian:</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Học phí:</span>
                      <span className="font-medium text-blue-600">{program.tuition}</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Đặc điểm nổi bật:</h4>
                    <ul className="space-y-1">
                      {program.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle size={14} className="text-green-500 mr-2 flex-shrink-0"/>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => handleRegistration(program)}
                    className="w-full"
                  >
                    <ArrowRight size={16} className="mr-2"/>
                    Đăng ký chương trình
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Khóa học nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nâng cao kiến thức và kỹ năng với các khóa học chất lượng cao
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} className="fill-current"/>
                    <span className="ml-1 text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h3>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trình độ:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảng viên:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Học viên:</span>
                    <span className="font-medium">{course.students} học sinh</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold text-blue-600">{course.price}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      <Users size={10} className="inline mr-1"/>
                      {course.students} đã đăng ký
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRegistration(undefined, course)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <GraduationCap size={14} className="mr-1"/>
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cơ sở vật chất hiện đại
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Môi trường học tập lý tưởng với trang thiết bị tiên tiến
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((facility, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {facility.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{facility.title}</h3>
                <p className="text-gray-600">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cảm nhận từ phụ huynh và học sinh
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những chia sẻ chân thực từ người đã trải nghiệm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current"/>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình giáo dục?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và tư vấn miễn phí
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => handleRegistration()}
              className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
            >
              <GraduationCap size={20} className="mr-2"/>
              Đăng ký tuyển sinh
            </Button>
            <Button 
              variant="secondary" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
            >
              <Download size={20} className="mr-2"/>
              Tải tài liệu
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Điện thoại</h3>
              <p className="text-gray-600">{currentData.contact.phone}</p>
              <p className="text-gray-600">Hotline: 1900-xxxx</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">{currentData.contact.email}</p>
              <p className="text-gray-600">info@thptabc.edu.vn</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Địa chỉ</h3>
              <p className="text-gray-600">{currentData.contact.address}</p>
              <p className="text-gray-600">Đón học sinh từ 7:00 - 17:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <Modal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)} 
        title={selectedProgram ? `Đăng ký ${selectedProgram.name}` : selectedCourse ? `Đăng ký ${selectedCourse.title}` : 'Đăng ký tuyển sinh'}
        size="large"
      >
        <form onSubmit={handleSubmitRegistration} className="space-y-6">
          {selectedProgram && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Chương trình đã chọn:</h4>
              <p className="text-blue-700">{selectedProgram.name} - {selectedProgram.grade}</p>
              <p className="text-sm text-blue-600">{selectedProgram.description}</p>
            </div>
          )}
          
          {selectedCourse && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">Khóa học đã chọn:</h4>
              <p className="text-green-700">{selectedCourse.title}</p>
              <div className="text-sm text-green-600 space-y-1">
                <p>• Thời lượng: {selectedCourse.duration}</p>
                <p>• Giảng viên: {selectedCourse.instructor}</p>
                <p>• Học phí: {selectedCourse.price}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên học sinh *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ngày sinh *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email học sinh *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SĐT học sinh *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Lớp đăng ký *</label>
              <select
                required
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full border rounded-lg p-3"
              >
                <option value="">-- Chọn lớp --</option>
                <option value="1">Lớp 1</option>
                <option value="2">Lớp 2</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
                <option value="6">Lớp 6</option>
                <option value="7">Lớp 7</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Trường cũ</label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="Tên trường cũ"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên phụ huynh *</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="Nguyễn Văn B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SĐT phụ huynh *</label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                className="w-full border rounded-lg p-3"
                placeholder="0987654321"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Địa chỉ *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border rounded-lg p-3"
              placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sở thích (chọn nhiều)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Lịch sử', 'Địa lý', 'Tiếng Anh', 'Tin học', 'Nghệ thuật', 'Thể thao', 'Âm nhạc'].map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, interests: [...formData.interests, interest]});
                      } else {
                        setFormData({...formData, interests: formData.interests.filter(i => i !== interest)});
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Các trường có dấu (*) là bắt buộc</li>
              <li>• Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ</li>
              <li>• Vui lòng chuẩn bị hồ sơ gốc khi đến trường</li>
              <li>• Nhận ưu đãi học phí khi đăng ký trước 30/06</li>
              {selectedCourse && (
                <li>• Khóa học {selectedCourse.title} sẽ bắt đầu sau khi đủ số lượng học sinh</li>
              )}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowRegistrationModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              <Send size={18} className="mr-2"/>
              Gửi đăng ký
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdmissionsLandingPage;
