import { Teacher, Class, Student, Subject, LMSMaterial, ChatMessage, ScheduleItem, Invoice, Book, SchoolEvent, Exam, TransportRoute, InventoryItem, Staff, LeaveRequest, CanteenItem, DormRoom, Alumnus, MedicalRecord, HealthIncident, Survey, FeedbackItem, Applicant, Club, ClubActivity, ResearchProject, CounselingSession, PartnerUniversity, ExchangeProgram, AbroadApplication, IoTDevice, AIMessage, MealSchedule, FinancialTransaction, ProfitAnalysis, BudgetPlan, Supplier, ExpenseReport, InventoryTransaction, InventoryReport } from './types';

export const MOCK_TEACHERS: Teacher[] = [
  { id: 101, fullName: "Nguyen Van A", email: "anv@school.edu.vn", phone: "0901234567", major: "Toán Học", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=e0e7ff&color=4338ca" },
  { id: 102, fullName: "Tran Thi B", email: "btt@school.edu.vn", phone: "0902345678", major: "Ngữ Văn", avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=fce7f3&color=db2777" },
  { id: 103, fullName: "Le Van C", email: "clv@school.edu.vn", phone: "0903456789", major: "Vật Lý", avatar: "https://ui-avatars.com/api/?name=Le+Van+C&background=ffedd5&color=c2410c" },
  { id: 104, fullName: "Pham Thi D", email: "ptd@school.edu.vn", phone: "0904567890", major: "Tiếng Anh", avatar: "https://ui-avatars.com/api/?name=Pham+Thi+D&background=dcfce7&color=15803d" },
];

export const MOCK_CLASSES: Class[] = [
  { id: 1, code: "10A1", name: "Lớp 10A1", gradeLevel: 10, academicYear: "2023-2024", homeroomTeacherId: 101, studentCount: 35, room: "P.201" },
  { id: 2, code: "11B2", name: "Lớp 11B2", gradeLevel: 11, academicYear: "2023-2024", homeroomTeacherId: 102, studentCount: 32, room: "P.202" },
  { id: 3, code: "12C3", name: "Lớp 12C3", gradeLevel: 12, academicYear: "2023-2024", homeroomTeacherId: 103, studentCount: 30, room: "P.301" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 1001, code: "HS001", fullName: "Tran Minh Tuan", classId: 1, dob: "2008-05-12", gender: "Male", status: "Active", email: "tuan@st.edu.vn", phone: "0987654321" },
  { id: 1002, code: "HS002", fullName: "Le Thu Ha", classId: 1, dob: "2008-08-20", gender: "Female", status: "Active", email: "ha@st.edu.vn", phone: "0987654322" },
  { id: 1003, code: "HS003", fullName: "Nguyen Hoang Nam", classId: 2, dob: "2007-02-15", gender: "Male", status: "Active", email: "nam@st.edu.vn", phone: "0987654323" },
  { id: 1004, code: "HS004", fullName: "Pham Lan Anh", classId: 2, dob: "2006-11-30", gender: "Female", status: "Active", email: "lananh@st.edu.vn", phone: "0987654324" },
  { id: 1005, code: "HS005", fullName: "Do Minh Duc", classId: 3, dob: "2005-09-10", gender: "Male", status: "Active", email: "duc@st.edu.vn", phone: "0987654325" },
];

// Student Activities and Achievements Data
export const MOCK_STUDENT_ACTIVITIES = [
  {
    studentId: 1001,
    activities: [
      { name: "CLB STEM", type: "academic", role: "Thành viên", duration: "2022-2024", achievements: "Tham gia dự án robot" },
      { name: "Đội tuyển Toán", type: "competition", role: "Thành viên", duration: "2023-2024", achievements: "Giải nhì cấp trường" },
      { name: "Tình nguyện Mùa hè xanh", type: "volunteer", role: "Tình nguyện viên", duration: "2023", achievements: "Hoàn thành 40 giờ tình nguyện" }
    ],
    academicPerformance: {
      gpa: 3.8,
      strongSubjects: ["Toán", "Lý", "Anh"],
      weakSubjects: ["Văn"],
      rank: "Top 5%"
    },
    goals: ["Du học Mỹ ngành Computer Science", "Trở thành kỹ sư phần mềm"]
  },
  {
    studentId: 1002,
    activities: [
      { name: "CLB Tiếng Anh", type: "academic", role: "Trưởng ban", duration: "2022-2024", achievements: "Tổ chức 5 sự kiện tiếng Anh" },
      { name: "Đội tuyển Hùng biện", type: "competition", role: "Thành viên", duration: "2023-2024", achievements: "Giải nhất cấp quận" },
      { name: "CLB Tình nguyện", type: "volunteer", role: "Thủ quỹ", duration: "2022-2024", achievements: "Quyên góp 10 triệu đồng" }
    ],
    academicPerformance: {
      gpa: 3.9,
      strongSubjects: ["Anh", "Văn", "Sử"],
      weakSubjects: ["Lý"],
      rank: "Top 3%"
    },
    goals: ["Du học Anh ngành International Relations", "Làm việc cho tổ chức UN"]
  },
  {
    studentId: 1003,
    activities: [
      { name: "CLB Bóng rổ", type: "sports", role: "Đội trưởng", duration: "2022-2024", achievements: "Giải nhất thành phố" },
      { name: "CLB Lãnh đạo", type: "leadership", role: "Thành viên", duration: "2023-2024", achievements: "Hoàn thành khóa lãnh đạo" },
      { name: "Đội tuyển Khoa học", type: "academic", role: "Thành viên", duration: "2023-2024", achievements: "Dự án nghiên cứu môi trường" }
    ],
    academicPerformance: {
      gpa: 3.6,
      strongSubjects: ["Lý", "Hóa", "Sinh"],
      weakSubjects: ["Văn"],
      rank: "Top 10%"
    },
    goals: ["Du học Úc ngành Environmental Science", "Nghiên cứu năng lượng tái tạo"]
  },
  {
    studentId: 1004,
    activities: [
      { name: "CLB Âm nhạc", type: "arts", role: "Phó chủ nhiệm", duration: "2022-2024", achievements: "Đạt giải nhất cuộc thi hát" },
      { name: "CLB Sách", type: "academic", role: "Thành viên", duration: "2022-2024", achievements: "Đọc 50 cuốn sách/năm" },
      { name: "Đội tuyển Văn học", type: "competition", role: "Thành viên", duration: "2023-2024", achievements: "Giải nhì thành phố" }
    ],
    academicPerformance: {
      gpa: 3.7,
      strongSubjects: ["Văn", "Anh", "Sử"],
      weakSubjects: ["Toán"],
      rank: "Top 7%"
    },
    goals: ["Du học Singapore ngành Literature", "Trở thành biên tập viên"]
  },
  {
    studentId: 1005,
    activities: [
      { name: "CLB Doanh nhân trẻ", type: "business", role: "Chủ nhiệm", duration: "2022-2024", achievements: "Khởi nghiệp dự án EdTech" },
      { name: "Đội tuyển Startup", type: "competition", role: "Thành viên", duration: "2023-2024", achievements: "Vào top 10 cuộc thi startup" },
      { name: "CLB Kỹ năng mềm", type: "leadership", role: "Huấn luyện viên", duration: "2023-2024", achievements: "Đào tạo 50 sinh viên" }
    ],
    academicPerformance: {
      gpa: 3.5,
      strongSubjects: ["Toán", "Kinh tế"],
      weakSubjects: ["Sử"],
      rank: "Top 12%"
    },
    goals: ["Du học Canada ngành Business Administration", "Khởi nghiệp công nghệ giáo dục"]
  }
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 1, code: "MATH", name: "Toán Học", credits: 4, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, code: "LIT", name: "Ngữ Văn", credits: 3, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: 3, code: "ENG", name: "Tiếng Anh", credits: 3, color: "bg-green-100 text-green-700 border-green-200" },
  { id: 4, code: "PHY", name: "Vật Lý", credits: 2, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: 5, code: "CHE", name: "Hóa Học", credits: 2, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: 6, code: "HIS", name: "Lịch Sử", credits: 1, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];

export const MOCK_LMS_MATERIALS: LMSMaterial[] = [
  { id: 1, title: "Bài giảng: Hàm số bậc hai", type: 'VIDEO', subjectId: 1, url: "#", postedBy: "Nguyen Van A", date: "2023-10-15", description: "Video bài giảng chi tiết về hàm số bậc hai, cách vẽ đồ thị và khảo sát sự biến thiên." },
  { id: 2, title: "Bài tập về nhà: Phân tích tác phẩm", type: 'ASSIGNMENT', subjectId: 2, deadline: "2023-10-20", postedBy: "Tran Thi B", date: "2023-10-16", description: "Các em hãy phân tích hình tượng nhân vật chính trong tác phẩm. Nộp file Word hoặc PDF." },
];

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  { id: 1, senderId: 101, senderName: "Nguyen Van A (GVCN)", text: "Chào em, hôm nay em có đi học không?", timestamp: "08:30", isMe: false },
  { id: 2, senderId: 1, senderName: "Me", text: "Dạ có ạ, em đang trên đường đến trường.", timestamp: "08:31", isMe: true },
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  { day: 2, period: 1, subjectId: 1, teacherId: 101 }, { day: 2, period: 2, subjectId: 1, teacherId: 101 }, { day: 2, period: 3, subjectId: 3, teacherId: 104 },
  { day: 3, period: 1, subjectId: 2, teacherId: 102 }, { day: 3, period: 2, subjectId: 4, teacherId: 103 },
  { day: 4, period: 1, subjectId: 3, teacherId: 104 }, { day: 4, period: 2, subjectId: 1, teacherId: 101 },
  { day: 5, period: 1, subjectId: 4, teacherId: 103 }, { day: 5, period: 2, subjectId: 2, teacherId: 102 },
  { day: 6, period: 1, subjectId: 1, teacherId: 101 }, { day: 6, period: 2, subjectId: 3, teacherId: 104 },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 1, studentId: 1001, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-30", status: "PAID", paymentDate: "2023-09-15" },
  { id: 2, studentId: 1001, title: "Phí Bảo hiểm Y tế", amount: 600000, dueDate: "2023-09-15", status: "PAID", paymentDate: "2023-09-10" },
  { id: 3, studentId: 1002, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-30", status: "UNPAID" },
  { id: 4, studentId: 1003, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-15", status: "OVERDUE" },
];

export const MOCK_BOOKS: Book[] = [
  { id: 1, title: "Đại số 10 Nâng cao", author: "Bộ Giáo Dục", category: "Sách Giáo Khoa", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Toan+10" },
  { id: 2, title: "Vật Lý Đại Cương", author: "Nguyễn Văn X", category: "Tham Khảo", status: "BORROWED", borrowedBy: 1001, cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Vat+Ly" },
  { id: 3, title: "History of the World", author: "H. G. Wells", category: "Lịch Sử", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=History" },
  { id: 4, title: "Lập trình Python", author: "Guido van Rossum", category: "Tin Học", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Python" },
];

export const MOCK_EVENTS: SchoolEvent[] = [
  { id: 1, title: "Lễ Khai Giảng", date: "2023-09-05", type: "ACTIVITY", description: "Toàn trường tập trung tại sân trường lúc 7:00." },
  { id: 2, title: "Thi Giữa Kỳ I", date: "2023-11-01", type: "ACADEMIC", description: "Các khối 10, 11, 12 thi tập trung." },
  { id: 3, title: "Nghỉ Lễ Quốc Khánh", date: "2023-09-02", type: "HOLIDAY", description: "Nghỉ theo quy định nhà nước." },
];

export const MOCK_EXAMS: Exam[] = [
  { id: 1, title: "Thi Giữa Kỳ I - Toán 10", subjectId: 1, date: "2023-11-05", duration: 90, totalQuestions: 50, status: 'ONGOING' },
  { id: 2, title: "Kiểm tra 15 phút - Anh 10", subjectId: 3, date: "2023-11-10", duration: 15, totalQuestions: 20, status: 'UPCOMING' },
  { id: 3, title: "Thi Cuối Kỳ I - Vật Lý 10", subjectId: 4, date: "2023-12-20", duration: 60, totalQuestions: 40, status: 'UPCOMING' },
];

export const MOCK_ROUTES: TransportRoute[] = [
  { id: 1, name: "Tuyến 01: Cầu Giấy - Trường", driverName: "Nguyen Van Tai", driverPhone: "0912345678", licensePlate: "29B-123.45", capacity: 45, studentCount: 40, status: 'ON_ROUTE' },
  { id: 2, name: "Tuyến 02: Hà Đông - Trường", driverName: "Le Van Xe", driverPhone: "0912345679", licensePlate: "29B-678.90", capacity: 29, studentCount: 25, status: 'IDLE' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  // Nguyên liệu thực phẩm chính
  { 
    id: 1, 
    name: "Thịt bò tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 50,
    minStock: 10,
    maxStock: 100,
    unitPrice: 180000,
    supplier: "Công ty TNHH Thực phẩm ABC",
    lastRestockDate: "2024-01-15",
    status: "in_stock"
  },
  { 
    id: 2, 
    name: "Thịt heo tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 30,
    minStock: 15,
    maxStock: 80,
    unitPrice: 120000,
    supplier: "Công ty TNHH Thực phẩm ABC",
    lastRestockDate: "2024-01-14",
    status: "low_stock"
  },
  { 
    id: 3, 
    name: "Gà tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 40,
    minStock: 20,
    maxStock: 90,
    unitPrice: 85000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-13",
    status: "in_stock"
  },
  { 
    id: 4, 
    name: "Cá tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 25,
    minStock: 10,
    maxStock: 60,
    unitPrice: 150000,
    supplier: "Công ty Hải sản VNK",
    lastRestockDate: "2024-01-12",
    status: "in_stock"
  },
  
  // Rau củ quả
  { 
    id: 5, 
    name: "Rau củ tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 30,
    minStock: 15,
    maxStock: 80,
    unitPrice: 25000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-14",
    status: "low_stock"
  },
  { 
    id: 6, 
    name: "Cà chua", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 20,
    minStock: 10,
    maxStock: 50,
    unitPrice: 18000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-13",
    status: "in_stock"
  },
  { 
    id: 7, 
    name: "Dưa leo", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 15,
    minStock: 8,
    maxStock: 40,
    unitPrice: 12000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-12",
    status: "in_stock"
  },
  { 
    id: 8, 
    name: "Hành tây", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 18,
    minStock: 10,
    maxStock: 45,
    unitPrice: 22000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-11",
    status: "in_stock"
  },
  { 
    id: 9, 
    name: "Khoai tây", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 35,
    minStock: 15,
    maxStock: 70,
    unitPrice: 15000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-10",
    status: "in_stock"
  },
  { 
    id: 10, 
    name: "Trái cây tươi", 
    category: "food_ingredient", 
    unit: "kg",
    currentStock: 25,
    minStock: 12,
    maxStock: 60,
    unitPrice: 35000,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-09",
    status: "in_stock"
  },
  
  // Đồ uống
  { 
    id: 11, 
    name: "Nước suối đóng chai", 
    category: "beverage", 
    unit: "chai",
    currentStock: 100,
    minStock: 20,
    maxStock: 200,
    unitPrice: 8000,
    supplier: "Công ty Nước giải khát",
    lastRestockDate: "2024-01-13",
    status: "in_stock"
  },
  { 
    id: 12, 
    name: "Trà túi lọc", 
    category: "beverage", 
    unit: "hộp",
    currentStock: 50,
    minStock: 15,
    maxStock: 100,
    unitPrice: 45000,
    supplier: "Công ty Trà VN",
    lastRestockDate: "2024-01-12",
    status: "in_stock"
  },
  { 
    id: 13, 
    name: "Cà phê rang xay", 
    category: "beverage", 
    unit: "gói",
    currentStock: 30,
    minStock: 10,
    maxStock: 80,
    unitPrice: 25000,
    supplier: "Công ty Cà phê VN",
    lastRestockDate: "2024-01-11",
    status: "in_stock"
  },
  { 
    id: 14, 
    name: "Sữa tươi", 
    category: "beverage", 
    unit: "hộp",
    currentStock: 40,
    minStock: 12,
    maxStock: 90,
    unitPrice: 28000,
    supplier: "Công ty Sữa VN",
    lastRestockDate: "2024-01-10",
    status: "in_stock"
  },
  { 
    id: 15, 
    name: "Nước ngọt", 
    category: "beverage", 
    unit: "chai",
    currentStock: 80,
    minStock: 25,
    maxStock: 150,
    unitPrice: 12000,
    supplier: "Công ty Nước giải khát",
    lastRestockDate: "2024-01-09",
    status: "in_stock"
  },
  
  // Bao bì
  { 
    id: 16, 
    name: "Hộp xốp đựng thực phẩm", 
    category: "packaging", 
    unit: "cái",
    currentStock: 200,
    minStock: 50,
    maxStock: 500,
    unitPrice: 1500,
    supplier: "Công ty Bao bì VN",
    lastRestockDate: "2024-01-10",
    status: "in_stock"
  },
  { 
    id: 17, 
    name: "Túi nilon", 
    category: "packaging", 
    unit: "bịch",
    currentStock: 500,
    minStock: 100,
    maxStock: 1000,
    unitPrice: 500,
    supplier: "Công ty Bao bì VN",
    lastRestockDate: "2024-01-09",
    status: "in_stock"
  },
  { 
    id: 18, 
    name: "Ly giấy", 
    category: "packaging", 
    unit: "cái",
    currentStock: 300,
    minStock: 80,
    maxStock: 600,
    unitPrice: 2000,
    supplier: "Công ty Bao bì VN",
    lastRestockDate: "2024-01-08",
    status: "in_stock"
  },
  { 
    id: 19, 
    name: "Khăn giấy", 
    category: "packaging", 
    unit: "bịch",
    currentStock: 150,
    minStock: 40,
    maxStock: 300,
    unitPrice: 3500,
    supplier: "Công ty Bao bì VN",
    lastRestockDate: "2024-01-07",
    status: "in_stock"
  },
  
  // Gia vị và nguyên liệu khô
  { 
    id: 20, 
    name: "Dầu ăn", 
    category: "cleaning", 
    unit: "lít",
    currentStock: 5,
    minStock: 2,
    maxStock: 20,
    unitPrice: 45000,
    supplier: "Công ty Hóa chất ABC",
    lastRestockDate: "2024-01-12",
    status: "low_stock"
  },
  { 
    id: 21, 
    name: "Nước mắm", 
    category: "cleaning", 
    unit: "chai",
    currentStock: 8,
    minStock: 3,
    maxStock: 25,
    unitPrice: 35000,
    supplier: "Công ty Gia vị VN",
    lastRestockDate: "2024-01-11",
    status: "in_stock"
  },
  { 
    id: 22, 
    name: "Đường", 
    category: "cleaning", 
    unit: "kg",
    currentStock: 25,
    minStock: 10,
    maxStock: 60,
    unitPrice: 25000,
    supplier: "Công ty Đường VN",
    lastRestockDate: "2024-01-10",
    status: "in_stock"
  },
  { 
    id: 23, 
    name: "Muối", 
    category: "cleaning", 
    unit: "kg",
    currentStock: 15,
    minStock: 5,
    maxStock: 40,
    unitPrice: 12000,
    supplier: "Công ty Gia vị VN",
    lastRestockDate: "2024-01-09",
    status: "in_stock"
  },
  { 
    id: 24, 
    name: "Tiêu", 
    category: "cleaning", 
    unit: "kg",
    currentStock: 8,
    minStock: 3,
    maxStock: 25,
    unitPrice: 180000,
    supplier: "Công ty Gia vị VN",
    lastRestockDate: "2024-01-08",
    status: "in_stock"
  },
  { 
    id: 25, 
    name: "Bột ngọt", 
    category: "cleaning", 
    unit: "gói",
    currentStock: 20,
    minStock: 8,
    maxStock: 50,
    unitPrice: 5000,
    supplier: "Công ty Gia vị VN",
    lastRestockDate: "2024-01-07",
    status: "in_stock"
  },
  
  // Nguyên liệu làm bánh
  { 
    id: 26, 
    name: "Bột mì", 
    category: "other", 
    unit: "kg",
    currentStock: 40,
    minStock: 15,
    maxStock: 80,
    unitPrice: 22000,
    supplier: "Công ty Bột mì VN",
    lastRestockDate: "2024-01-06",
    status: "in_stock"
  },
  { 
    id: 27, 
    name: "Trứng gà", 
    category: "other", 
    unit: "quả",
    currentStock: 100,
    minStock: 30,
    maxStock: 200,
    unitPrice: 3500,
    supplier: "Nông trại XYZ",
    lastRestockDate: "2024-01-05",
    status: "in_stock"
  },
  { 
    id: 28, 
    name: "Sữa đặc", 
    category: "other", 
    unit: "lon",
    currentStock: 25,
    minStock: 8,
    maxStock: 60,
    unitPrice: 15000,
    supplier: "Công ty Sữa VN",
    lastRestockDate: "2024-01-04",
    status: "in_stock"
  },
  { 
    id: 29, 
    name: "Bơ", 
    category: "other", 
    unit: "bịch",
    currentStock: 15,
    minStock: 5,
    maxStock: 40,
    unitPrice: 45000,
    supplier: "Công ty Sữa VN",
    lastRestockDate: "2024-01-03",
    status: "in_stock"
  },
  { 
    id: 30, 
    name: "Giấy ăn", 
    category: "other", 
    unit: "bịch",
    currentStock: 1000,
    minStock: 200,
    maxStock: 2000,
    unitPrice: 500,
    supplier: "Công ty Giấy VN",
    lastRestockDate: "2024-01-02",
    status: "in_stock"
  }
];

// Financial Management Data
export const MOCK_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 1,
    type: 'income',
    category: 'revenue',
    amount: 5000000,
    description: 'Doanh thu bán đồ ăn - Tuần 1',
    date: '2024-01-15',
    reference: 'INV-2024-001',
    status: 'completed',
    paymentMethod: 'transfer',
    createdBy: 'Nguyễn Thị Hanh',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    type: 'income',
    category: 'revenue',
    amount: 3500000,
    description: 'Doanh thu đồ uống - Tuần 1',
    date: '2024-01-15',
    reference: 'INV-2024-002',
    status: 'completed',
    paymentMethod: 'cash',
    createdBy: 'Nguyễn Thị Hanh',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 3,
    type: 'expense',
    category: 'supplier_payment',
    amount: 2000000,
    description: 'Thanh toán nguyên liệu thực phẩm - Công ty TNHH Thực phẩm ABC',
    date: '2024-01-14',
    reference: 'SUP-2024-001',
    status: 'completed',
    paymentMethod: 'transfer',
    createdBy: 'Nguyễn Thị Hanh',
    createdAt: '2024-01-14T14:00:00Z'
  },
  {
    id: 4,
    type: 'expense',
    category: 'salary',
    amount: 15000000,
    description: 'Lương nhân viên tháng 1',
    date: '2024-01-25',
    reference: 'SAL-2024-001',
    status: 'pending',
    paymentMethod: 'transfer',
    createdBy: 'Nguyễn Thị Hanh',
    createdAt: '2024-01-25T08:00:00Z'
  },
  {
    id: 5,
    type: 'expense',
    category: 'utilities',
    amount: 500000,
    description: 'Điện, nước tháng 1',
    date: '2024-01-20',
    reference: 'UTL-2024-001',
    status: 'completed',
    paymentMethod: 'transfer',
    createdBy: 'Nguyễn Thị Hanh',
    createdAt: '2024-01-20T11:00:00Z'
  }
];

export const MOCK_PROFIT_ANALYSIS: ProfitAnalysis[] = [
  {
    id: 1,
    period: 'Tháng 1/2024',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    totalRevenue: 8500000,
    totalExpenses: 18000000,
    grossProfit: -9500000,
    netProfit: -9500000,
    profitMargin: -11.18,
    totalOrders: 245,
    averageOrderValue: 34694,
    topSellingItems: [
      { itemId: 1, itemName: 'Cơm Rang Thập Cẩm', quantity: 45, revenue: 1575000 },
      { itemId: 2, itemName: 'Phở Bò', quantity: 32, revenue: 1280000 },
      { itemId: 4, itemName: 'Nước Cam Ép', quantity: 60, revenue: 1500000 }
    ],
    expenseBreakdown: [
      { category: 'salary', amount: 15000000, percentage: 83.33 },
      { category: 'supplier_payment', amount: 2000000, percentage: 11.11 },
      { category: 'utilities', amount: 500000, percentage: 2.78 },
      { category: 'other', amount: 500000, percentage: 2.78 }
    ]
  }
];

export const MOCK_BUDGET_PLANS: BudgetPlan[] = [
  {
    id: 1,
    name: 'Ngân sách tháng 1/2024',
    period: 'Tháng 1/2024',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    totalBudget: 20000000,
    allocatedBudget: 18000000,
    spentAmount: 18000000,
    remainingBudget: 2000000,
    categories: [
      { category: 'Nguyên vật thực phẩm', allocated: 8000000, spent: 7500000, remaining: 500000 },
      { category: 'Đồ uống', allocated: 3000000, spent: 2800000, remaining: 200000 },
      { category: 'Lương nhân viên', allocated: 5000000, spent: 5000000, remaining: 0 },
      { category: 'Chi phí vận hành', allocated: 2000000, spent: 2700000, remaining: -700000 }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: 'Công ty TNHH Thực phẩm ABC',
    contactPerson: 'Nguyễn Văn An',
    phone: '0912345678',
    email: 'an.nv@thucphamabc.com',
    address: '123 Nguyễn Trãi, Q.1, TP.HCM',
    categories: ['Thịt', 'Rau củ', 'Hải sản'],
    paymentTerms: 'Net 30 ngày',
    rating: 4.5,
    status: 'active'
  },
  {
    id: 2,
    name: 'Nông trại XYZ',
    contactPerson: 'Trần Thị Bình',
    phone: '0923456789',
    email: 'binh.tt@nongtraixyz.com',
    address: '456 Quốc lộ 1A, Q.2, TP.HCM',
    categories: ['Rau củ', 'Trái cây', 'Gia vị'],
    paymentTerms: 'Net 15 ngày',
    rating: 4.2,
    status: 'active'
  },
  {
    id: 3,
    name: 'Công ty Nước giải khát',
    contactPerson: 'Lê Văn Cường',
    phone: '09345678901',
    email: 'cuong.lv@nuocgiaikhat.com',
    address: '789 Nguyễn Huệ, Q.3, TP.HCM',
    categories: ['Nước suối', 'Nước ngọt', 'Trà'],
    paymentTerms: 'COD',
    rating: 4.0,
    status: 'active'
  }
];

export const MOCK_EXPENSE_REPORTS: ExpenseReport[] = [
  {
    id: 1,
    month: 'Tháng 1',
    year: 2024,
    totalExpenses: 18000000,
    expensesByCategory: [
      { category: 'salary', amount: 15000000, transactions: 1 },
      { category: 'supplier_payment', amount: 2000000, transactions: 3 },
      { category: 'utilities', amount: 500000, transactions: 2 },
      { category: 'other', amount: 500000, transactions: 1 }
    ],
    monthlyTrend: [
      { month: 'Tháng 11', amount: 16000000 },
      { month: 'Tháng 12', amount: 17500000 },
      { month: 'Tháng 1', amount: 18000000 }
    ]
  }
];

// Inventory Transaction Data
export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 1,
    inventoryItemId: 1,
    itemName: "Thịt bò tươi",
    transactionType: "in",
    quantity: 20,
    unitPrice: 180000,
    totalValue: 3600000,
    reference: "INV-IN-001",
    reason: "Nhập kho định kỳ tuần 1",
    date: "2024-01-15",
    time: "09:30:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Công ty TNHH Thực phẩm ABC",
    batchNumber: "BEO20240115001",
    expiryDate: "2024-01-25",
    notes: "Nhập kho từ nhà cung cấp uy tín, chất lượng tốt"
  },
  {
    id: 2,
    inventoryItemId: 2,
    itemName: "Thịt heo tươi",
    transactionType: "in",
    quantity: 15,
    unitPrice: 120000,
    totalValue: 1800000,
    reference: "INV-IN-002",
    reason: "Nhập kho bổ sung",
    date: "2024-01-14",
    time: "14:15:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Công ty TNHH Thực phẩm ABC",
    batchNumber: "HEO20240114001",
    expiryDate: "2024-01-20",
    notes: "Nhập kho gấp do nhu cầu tăng"
  },
  {
    id: 3,
    inventoryItemId: 5,
    itemName: "Rau củ tươi",
    transactionType: "out",
    quantity: 8,
    unitPrice: 25000,
    totalValue: 200000,
    reference: "INV-OUT-001",
    reason: "Sử dụng cho bữa trưa ngày 15/01",
    date: "2024-01-15",
    time: "11:30:00",
    createdBy: "Lê Thị Mai",
    approvedBy: "Nguyễn Thị Hanh",
    status: "completed",
    notes: "Sử dụng cho nấu ăn học sinh"
  },
  {
    id: 4,
    inventoryItemId: 11,
    itemName: "Nước suối đóng chai",
    transactionType: "in",
    quantity: 50,
    unitPrice: 8000,
    totalValue: 400000,
    reference: "INV-IN-003",
    reason: "Nhập kho định kỳ",
    date: "2024-01-13",
    time: "10:00:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Công ty Nước giải khát",
    batchNumber: "NS20240113001",
    notes: "Nhập kho nước suối cho tuần 2"
  },
  {
    id: 5,
    inventoryItemId: 11,
    itemName: "Nước suối đóng chai",
    transactionType: "out",
    quantity: 25,
    unitPrice: 8000,
    totalValue: 200000,
    reference: "INV-OUT-002",
    reason: "Bán cho học sinh",
    date: "2024-01-14",
    time: "13:45:00",
    createdBy: "Lê Thị Mai",
    approvedBy: "Nguyễn Thị Hanh",
    status: "completed",
    notes: "Bán tại căng tin"
  },
  {
    id: 6,
    inventoryItemId: 3,
    itemName: "Gà tươi",
    transactionType: "in",
    quantity: 25,
    unitPrice: 85000,
    totalValue: 2125000,
    reference: "INV-IN-004",
    reason: "Nhập kho từ nông trại",
    date: "2024-01-12",
    time: "08:30:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Nông trại XYZ",
    batchNumber: "GA20240112001",
    expiryDate: "2024-01-18",
    notes: "Gà tươi sạch, chất lượng cao"
  },
  {
    id: 7,
    inventoryItemId: 16,
    itemName: "Hộp xốp đựng thực phẩm",
    transactionType: "in",
    quantity: 100,
    unitPrice: 1500,
    totalValue: 150000,
    reference: "INV-IN-005",
    reason: "Nhập kho bao bì",
    date: "2024-01-10",
    time: "15:00:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Công ty Bao bì VN",
    notes: "Nhập kho hộp xốp cho đóng gói đồ ăn"
  },
  {
    id: 8,
    inventoryItemId: 16,
    itemName: "Hộp xốp đựng thực phẩm",
    transactionType: "out",
    quantity: 30,
    unitPrice: 1500,
    totalValue: 45000,
    reference: "INV-OUT-003",
    reason: "Sử dụng cho đóng gói cơm trưa",
    date: "2024-01-13",
    time: "10:30:00",
    createdBy: "Lê Thị Mai",
    approvedBy: "Nguyễn Thị Hanh",
    status: "completed",
    notes: "Sử dụng cho đóng gói cơm trưa học sinh"
  },
  {
    id: 9,
    inventoryItemId: 20,
    itemName: "Dầu ăn",
    transactionType: "in",
    quantity: 10,
    unitPrice: 45000,
    totalValue: 450000,
    reference: "INV-IN-006",
    reason: "Nhập kho dầu ăn",
    date: "2024-01-11",
    time: "09:00:00",
    createdBy: "Nguyễn Thị Hanh",
    approvedBy: "Trần Văn Bảo",
    status: "completed",
    supplier: "Công ty Hóa chất ABC",
    batchNumber: "DAU20240111001",
    expiryDate: "2024-12-11",
    notes: "Dầu ăn tinh khiết, dùng cho nấu ăn"
  },
  {
    id: 10,
    inventoryItemId: 20,
    itemName: "Dầu ăn",
    transactionType: "out",
    quantity: 2,
    unitPrice: 45000,
    totalValue: 90000,
    reference: "INV-OUT-004",
    reason: "Sử dụng cho nấu ăn tuần 2",
    date: "2024-01-14",
    time: "07:30:00",
    createdBy: "Lê Thị Mai",
    approvedBy: "Nguyễn Thị Hanh",
    status: "completed",
    notes: "Sử dụng cho nấu ăn sáng và trưa"
  }
];

export const MOCK_INVENTORY_REPORTS: InventoryReport[] = [
  {
    id: 1,
    period: "Tuần 3/2024",
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    totalInTransactions: 6,
    totalOutTransactions: 4,
    totalValueIn: 8425000,
    totalValueOut: 335000,
    netChange: 8090000,
    topItems: [
      {
        itemName: "Thịt bò tươi",
        transactionCount: 2,
        totalQuantity: 25,
        totalValue: 4500000
      },
      {
        itemName: "Nước suối đóng chai",
        transactionCount: 2,
        totalQuantity: 25,
        totalValue: 200000
      },
      {
        itemName: "Hộp xốp đựng thực phẩm",
        transactionCount: 2,
        totalQuantity: 70,
        totalValue: 105000
      }
    ],
    transactionsByDate: [
      {
        date: "2024-01-15",
        inCount: 2,
        outCount: 1,
        inValue: 3800000,
        outValue: 200000
      },
      {
        date: "2024-01-14",
        inCount: 1,
        outCount: 2,
        inValue: 1800000,
        outValue: 290000
      },
      {
        date: "2024-01-13",
        inCount: 1,
        outCount: 1,
        inValue: 400000,
        outValue: 45000
      }
    ]
  }
];

export const MOCK_STAFF: Staff[] = [
  { id: 1, fullName: "Nguyen Thi Hanh", role: "Kế toán trưởng", department: "Tài chính", status: "Active", email: "hanh.nt@school.edu.vn", phone: "0988111222", salary: 15000000 },
  { id: 2, fullName: "Tran Van Bao", role: "Bảo vệ", department: "An ninh", status: "Active", email: "bao.tv@school.edu.vn", phone: "0977333444", salary: 7000000 },
  { id: 3, fullName: "Le Thi Mai", role: "Y tá", department: "Y tế", status: "On Leave", email: "mai.lt@school.edu.vn", phone: "0966555666", salary: 9000000 },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 1, staffId: 3, type: "Sick", startDate: "2023-10-20", endDate: "2023-10-22", reason: "Sốt virus", status: "Approved" },
  { id: 2, staffId: 1, type: "Annual", startDate: "2023-11-01", endDate: "2023-11-05", reason: "Du lịch gia đình", status: "Pending" },
];

export const MOCK_MENU: CanteenItem[] = [
  // Món ăn chính
  { id: 1, name: "Cơm Rang Thập Cẩm", price: 35000, category: "Food", available: true, calories: 550, image: "https://placehold.co/200x200/ffedd5/c2410c?text=Com+Rang", description: "Cơm rang với trứng, rau củ và thịt", ingredients: ["Cơm", "trứng", "cà rốt", "đậu que", "thịt heo"], preparationTime: 15 },
  { id: 2, name: "Phở Bò", price: 40000, category: "Food", available: true, calories: 450, image: "https://placehold.co/200x200/dcfce7/15803d?text=Pho+Bo", description: "Phở bò tươi với bánh phở tự làm", ingredients: ["Bò tươi", "bánh phở", "hành", "rau thơm"], preparationTime: 20 },
  { id: 3, name: "Bánh Mì Pate", price: 20000, category: "Food", available: true, calories: 350, image: "https://placehold.co/200x200/fce7f3/db2777?text=Banh+Mi", description: "Bánh mì nóng với pate, rau", ingredients: ["Bánh mì", "pate", "dưa leo", "cà rốt"], preparationTime: 5 },
  { id: 6, name: "Bún Chả Giò", price: 30000, category: "Food", available: true, calories: 400, image: "https://placehold.co/200x200/fef3c7/f59e0b?text=Bun+Cha+Gio", description: "Bún tươi với chả giò giòn rụm", ingredients: ["Bún", "chả giò", "rau sống", "nước mắm"], preparationTime: 10 },
  { id: 7, name: "Cơm Gà Nướng", price: 45000, category: "Food", available: true, calories: 600, image: "https://placehold.co/200x200/fecaca/dc2626?text=Com+Ga+Nuong", description: "Gà nướng mật ong với cơm trắng", ingredients: ["Gà", "mật ong", "gia vị", "cơm"], preparationTime: 25 },
  { id: 8, name: "Mì Ý Sốt Bò Bằm", price: 38000, category: "Food", available: true, calories: 520, image: "https://placehold.co/200x200/e0e7ff/4338ca?text=Mi+Y", description: "Mì Ý al dente với sốt bò bằm", ingredients: ["Mì Ý", "thịt bò", "cà chua", "hành tây"], preparationTime: 18 },
  { id: 9, name: "Salad Cá Ngừ", price: 32000, category: "Food", available: true, calories: 280, image: "https://placehold.co/200x200/d1fae5/10b981?text=Salad+Ca+Ngu", description: "Salad tươi ngon với cá ngừ", ingredients: ["Cá ngừ", "xà lách", "cà chua", "dưa leo"], preparationTime: 8 },
  { id: 10, name: "Bún Thịt Nướng", price: 35000, category: "Food", available: true, calories: 480, image: "https://placehold.co/200x200/fed7aa/ea580c?text=Bun+Thit+Nuong", description: "Bún với thịt nướng thơm lừng", ingredients: ["Thịt heo", "bún", "rau sống", "nước mắm"], preparationTime: 15 },
  
  // Đồ uống
  { id: 4, name: "Nước Cam Ép", price: 25000, category: "Drink", available: true, calories: 120, image: "https://placehold.co/200x200/e0e7ff/4338ca?text=Nuoc+Cam", description: "Nước cam ép tươi nguyên chất", ingredients: ["Cam tươi", "đường", "đá"], preparationTime: 3 },
  { id: 11, name: "Trà Sữa", price: 30000, category: "Drink", available: true, calories: 200, image: "https://placehold.co/200x200/f3e8ff/9333ea?text=Tra+Sua", description: "Trà sữa với trân châu", ingredients: ["Trà", "sữa", "trân châu", "đường"], preparationTime: 5 },
  { id: 12, name: "Cà Phê Sữa Đá", price: 22000, category: "Drink", available: true, calories: 80, image: "https://placehold.co/200x200/7f1d1d/991b1b?text=Ca+Phe", description: "Cà phê đậm đà với sữa đặc", ingredients: ["Cà phê", "sữa đặc", "đá"], preparationTime: 2 },
  { id: 13, name: "Nước Ép Táo", price: 23000, category: "Drink", available: true, calories: 110, image: "https://placehold.co/200x200/dcfce7/15803d?text=Nuoc+Tao", description: "Nước táo ép tự nhiên", ingredients: ["Táo tươi", "đường", "đá"], preparationTime: 3 },
  { id: 14, name: "Sinh Tố Xoài", price: 28000, category: "Drink", available: true, calories: 180, image: "https://placehold.co/200x200/fed7aa/f59e0b?text=Sinh+To+Xoai", description: "Sinh tố xoài thơm ngon", ingredients: ["Xoài chín", "sữa", "đá"], preparationTime: 4 },
  { id: 15, name: "Trà Lạnh Chanh", price: 18000, category: "Drink", available: true, calories: 60, image: "https://placehold.co/200x200/fef3c7/fbbf24?text=Tra+Lanh", description: "Trà chanh mát lạnh", ingredients: ["Trà", "chanh", "đường", "đá"], preparationTime: 2 },
  
  // Đồ ăn vặt
  { id: 5, name: "Sữa Chua", price: 10000, category: "Snack", available: true, calories: 100, image: "https://placehold.co/200x200/f3f4f6/374151?text=Sua+Chua", description: "Sữa chua trái cây", ingredients: ["Sữa chua", "trái cây", "đường"], preparationTime: 1 },
  { id: 16, name: "Bánh Croissant", price: 15000, category: "Snack", available: true, calories: 220, image: "https://placehold.co/200x200/fef3c7/f59e0b?text=Croissant", description: "Bánh sừng bò bơ thơm ngon", ingredients: ["Bột mì", "bơ", "đường"], preparationTime: 1 },
  { id: 17, name: "Khoai Tây Chiên", price: 18000, category: "Snack", available: true, calories: 300, image: "https://placehold.co/200x200/fecaca/dc2626?text=Khoai+Tay", description: "Khoai tây chiên giòn", ingredients: ["Khoai tây", "dầu ăn", "muối"], preparationTime: 8 },
  { id: 18, name: "Bánh Ngọt", price: 12000, category: "Snack", available: true, calories: 180, image: "https://placehold.co/200x200/fce7f3/db2777?text=Banh+Ngot", description: "Bánh ngọt đa dạng hương vị", ingredients: ["Bột mì", "đường", "kem"], preparationTime: 1 },
  { id: 19, name: "Trái Cắt", price: 20000, category: "Snack", available: true, calories: 150, image: "https://placehold.co/200x200/d1fae5/10b981?text=Trai+Cat", description: "Hộp trái cây tươi", ingredients: ["Táo", "cam", "nho", "dưa hấu"], preparationTime: 5 },
  { id: 20, name: "Bánh Quy", price: 8000, category: "Snack", available: true, calories: 90, image: "https://placehold.co/200x200/f3f4f6/6b7280?text=Banh+Quy", description: "Bánh quy bơ giòn tan", ingredients: ["Bột mì", "bơ", "đường"], preparationTime: 1 }
];

// Thực đơn theo thời gian
export const MOCK_MEAL_SCHEDULES: MealSchedule[] = [
  {
    id: 1,
    timeSlot: "Sáng",
    startTime: "06:30",
    endTime: "07:30",
    date: "2024-01-15",
    isActive: true,
    items: [
      MOCK_MENU[0], // Cơm Rang Thập Cẩm
      MOCK_MENU[1], // Phở Bò
      MOCK_MENU[2], // Bánh Mì Pate
      MOCK_MENU[3], // Nước Cam Ép
      MOCK_MENU[4]  // Sữa Chua
    ]
  },
  {
    id: 2,
    timeSlot: "Ra chơi sáng",
    startTime: "09:30",
    endTime: "10:00",
    date: "2024-01-15",
    isActive: true,
    items: [
      MOCK_MENU[15], // Bánh Croissant
      MOCK_MENU[16], // Khoai Tây Chiên
      MOCK_MENU[10], // Trà Sữa
      MOCK_MENU[11], // Cà Phê Sữa Đá
      MOCK_MENU[18]  // Trái Cắt
    ]
  },
  {
    id: 3,
    timeSlot: "Trưa",
    startTime: "11:30",
    endTime: "13:30",
    date: "2024-01-15",
    isActive: true,
    items: [
      MOCK_MENU[5], // Cơm Gà Nướng
      MOCK_MENU[6], // Mì Ý Sốt Bò Bằm
      MOCK_MENU[7], // Salad Cá Ngừ
      MOCK_MENU[8], // Bún Thịt Nướng
      MOCK_MENU[12], // Nước Ép Táo
      MOCK_MENU[13]  // Sinh Tố Xoài
    ]
  },
  {
    id: 4,
    timeSlot: "Ra chơi chiều",
    startTime: "15:30",
    endTime: "16:00",
    date: "2024-01-15",
    isActive: true,
    items: [
      MOCK_MENU[17], // Bánh Ngọt
      MOCK_MENU[18], // Trái Cắt
      MOCK_MENU[14], // Trà Lạnh Chanh
      MOCK_MENU[19]  // Bánh Quy
    ]
  },
  {
    id: 5,
    timeSlot: "Tối",
    startTime: "17:30",
    endTime: "19:00",
    date: "2024-01-15",
    isActive: true,
    items: [
      MOCK_MENU[0], // Cơm Rang Thập Cẩm
      MOCK_MENU[1], // Phở Bò
      MOCK_MENU[5], // Cơm Gà Nướng
      MOCK_MENU[6], // Mì Ý Sốt Bò Bằm
      MOCK_MENU[3], // Nước Cam Ép
      MOCK_MENU[10]  // Trà Sữa
    ]
  }
];

export const MOCK_DORM_ROOMS: DormRoom[] = [
  { id: 101, name: "Phòng 101 - A1", type: "Male", capacity: 4, occupied: 3, status: "Available", block: "A" },
  { id: 102, name: "Phòng 102 - A1", type: "Male", capacity: 4, occupied: 4, status: "Full", block: "A" },
  { id: 201, name: "Phòng 201 - B1", type: "Female", capacity: 6, occupied: 2, status: "Available", block: "B" },
  { id: 202, name: "Phòng 202 - B1", type: "Female", capacity: 6, occupied: 0, status: "Maintenance", block: "B" },
];

export const MOCK_ALUMNI: Alumnus[] = [
  { id: 1, fullName: "Phạm Nhật M", graduationYear: 2010, currentJob: "CEO", company: "Tech Group", email: "m.pham@tech.com", phone: "0999888777", avatar: "https://ui-avatars.com/api/?name=Pham+Nhat+M&background=0D8ABC&color=fff" },
  { id: 2, fullName: "Tran Thu T", graduationYear: 2012, currentJob: "Marketing Manager", company: "Vin Corp", email: "t.tran@vin.com", phone: "0999111222", avatar: "https://ui-avatars.com/api/?name=Tran+Thu+T&background=random&color=fff" },
  { id: 3, fullName: "Nguyen Van K", graduationYear: 2015, currentJob: "Software Engineer", company: "Google", email: "k.nguyen@google.com", phone: "0999333444", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+K&background=random&color=fff" },
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 1, studentId: 1001, condition: "Hen suyễn nhẹ", allergies: "Phấn hoa", bloodType: "A+", lastCheckup: "2023-08-15", notes: "Cần mang theo ống hít." },
  { id: 2, studentId: 1003, condition: "Bình thường", allergies: "Hải sản", bloodType: "O", lastCheckup: "2023-09-01", notes: "Không có vấn đề gì." },
];

export const MOCK_HEALTH_INCIDENTS: HealthIncident[] = [
  { id: 1, studentId: 1005, date: "2023-10-10", description: "Ngã khi đá bóng", treatment: "Băng bó vết thương, chườm đá", severity: "Medium", status: "Resolved" },
  { id: 2, studentId: 1002, date: "2023-11-05", description: "Đau bụng, sốt nhẹ", treatment: "Nghỉ ngơi tại phòng y tế, uống thuốc hạ sốt", severity: "Low", status: "Resolved" },
];

export const MOCK_SURVEYS: Survey[] = [
  { id: 1, title: "Đánh giá chất lượng giảng dạy HK1", deadline: "2023-12-31", participants: 150, totalTarget: 500, status: 'Active', type: 'TeacherEval' },
  { id: 2, title: "Khảo sát chất lượng bữa ăn Căng tin", deadline: "2023-11-30", participants: 300, totalTarget: 500, status: 'Closed', type: 'Facility' },
];

export const MOCK_FEEDBACKS: FeedbackItem[] = [
  { id: 1, senderName: "Ẩn danh", category: "Cơ sở vật chất", content: "Điều hòa phòng 201 bị hỏng, mong nhà trường sửa sớm.", date: "2023-11-15", status: 'New' },
  { id: 2, senderName: "Phụ huynh em A", category: "Giảng dạy", content: "Cô giáo môn Anh dạy rất dễ hiểu, cảm ơn nhà trường.", date: "2023-11-10", status: 'Replied' },
];

export const MOCK_APPLICANTS: Applicant[] = [
  { id: 1, code: "TS001", fullName: "Le Van Em", dob: "2009-02-15", email: "em.le@gmail.com", phone: "0909000111", gradeApplying: 10, status: 'New', applicationDate: "2023-11-20" },
  { id: 2, code: "TS002", fullName: "Nguyen Van Teo", dob: "2009-12-01", email: "teo.tran@gmail.com", phone: "0909000333", gradeApplying: 11, status: 'Accepted', applicationDate: "2023-11-10", score: 8.5 }
];

export const MOCK_CLUBS: Club[] = [
  { id: 1, name: "CLB Tin học", category: "Academic", presidentName: "Trần Thị Bình", memberCount: 45, description: "Câu lạc bộ dành cho những ai đam mê công nghệ và lập trình", image: "https://placehold.co/400x200/blue/white?text=IT+Club", meetingDay: "Thứ 3, 15:00" },
  { id: 2, name: "CLB Bóng đá", category: "Sports", presidentName: "Phạm Văn Hùng", memberCount: 22, description: "Câu lạc bộ bóng đá với mục tiêu phát triển thể chất và tinh thần đồng đội", image: "https://placehold.co/400x200/green/white?text=Football+Club", meetingDay: "Thứ 4, 17:00" },
  { id: 3, name: "CLB Âm nhạc", category: "Arts", presidentName: "Trần Quang Duy", memberCount: 30, description: "Câu lạc bộ dành cho những ai yêu thích âm nhạc và muốn thể hiện tài năng", image: "https://placehold.co/400x200/purple/white?text=Music+Club", meetingDay: "Thứ 5, 16:00" },
  { id: 4, name: "CLB Tiếng Anh", category: "Academic", presidentName: "Hoàng Văn Nam", memberCount: 38, description: "Câu lạc bộ giúp cải thiện kỹ năng tiếng Anh và giao tiếp quốc tế", image: "https://placehold.co/400x200/red/white?text=English+Club", meetingDay: "Thứ 6, 14:30" },
  { id: 5, name: "CLB Tình nguyện", category: "Social", presidentName: "Bùi Minh Tuấn", memberCount: 55, description: "Câu lạc bộ tổ chức các hoạt động thiện nguyện và phục vụ cộng đồng", image: "https://placehold.co/400x200/yellow/white?text=Volunteer+Club", meetingDay: "Thứ 7, 10:00" }
];

export const MOCK_CLUB_ACTIVITIES: ClubActivity[] = [
  { id: 1, clubId: 1, title: "Workshop Python", date: "2024-01-20", description: "Workshop lập trình Python cơ bản" },
  { id: 2, clubId: 2, title: "Tập luyện cuối tuần", date: "2024-01-21", description: "Buổi tập luyện bóng đá cuối tuần" },
  { id: 3, clubId: 3, title: "Buổi biểu diễn", date: "2024-01-22", description: "Buổi biểu diễn âm nhạc tháng 1" },
  { id: 4, clubId: 4, title: "English Speaking Club", date: "2024-01-23", description: "Buổi nói chuyện tiếng Anh hàng tuần" },
  { id: 5, clubId: 5, title: "Chiến dịch tình nguyện", date: "2024-01-24", description: "Chiến dịch tình nguyện mùa xuân" }
];

// ...

export const MOCK_PROJECTS: ResearchProject[] = [
  { id: 1, title: "Hệ thống tưới cây tự động IoT", field: "Công nghệ", leaderName: "Nguyen Van A", members: 3, status: "Ongoing", budget: 5000000, startDate: "2023-09-15", progress: 60 },
  { id: 2, title: "Nghiên cứu văn học dân gian địa phương", field: "Xã hội", leaderName: "Tran Thi B", members: 5, status: "Completed", budget: 2000000, startDate: "2023-01-10", progress: 100 },
  { id: 3, title: "Chế tạo Robot hỗ trợ người già", field: "Kỹ thuật", leaderName: "Le Van C", members: 4, status: "Proposal", budget: 10000000, startDate: "2023-12-01", progress: 10 },
];

export const MOCK_SESSIONS: CounselingSession[] = [
  { id: 1, studentId: 1001, counselorName: "TS. Tâm Lý Học", date: "2023-11-20", time: "09:00", type: "Psychological", status: "Scheduled", room: "P.TV01" },
  { id: 2, studentId: 1004, counselorName: "ThS. Hướng Nghiệp", date: "2023-11-21", time: "14:00", type: "Career", status: "Completed", room: "P.TV02", notes: "Học sinh quan tâm đến ngành IT." },
];

export const MOCK_PARTNERS: PartnerUniversity[] = [
  { id: 1, name: "Harvard University", country: "USA", ranking: 1, image: "https://placehold.co/300x200/a51c30/fff?text=Harvard", description: "Hợp tác trao đổi học thuật và nghiên cứu.", website: "https://harvard.edu" },
  { id: 2, name: "University of Oxford", country: "UK", ranking: 5, image: "https://placehold.co/300x200/002147/fff?text=Oxford", description: "Chương trình trại hè ngôn ngữ và văn hóa.", website: "https://ox.ac.uk" },
  { id: 3, name: "National University of Singapore", country: "Singapore", ranking: 11, image: "https://placehold.co/300x200/ff7f00/fff?text=NUS", description: "Học bổng du học toàn phần cho học sinh xuất sắc.", website: "https://nus.edu.sg" },
  { id: 4, name: "Stanford University", country: "USA", ranking: 3, image: "https://placehold.co/300x200/840a2f/fff?text=Stanford", description: "Chương trình đổi mới sáng tạo và khởi nghiệp.", website: "https://stanford.edu" },
  { id: 5, name: "MIT", country: "USA", ranking: 2, image: "https://placehold.co/300x200/a31f34/fff?text=MIT", description: "Học bổng kỹ thuật và công nghệ hàng đầu thế giới.", website: "https://mit.edu" },
  { id: 6, name: "University of Cambridge", country: "UK", ranking: 4, image: "https://placehold.co/300x200/f3e5ab/000?text=Cambridge", description: "Chương trình trao đổi học thuật và nghiên cứu khoa học.", website: "https://cam.ac.uk" },
  { id: 7, name: "ETH Zurich", country: "Switzerland", ranking: 8, image: "https://placehold.co/300x200/0066b3/fff?text=ETH", description: "Học bổng kỹ thuật và công nghệ Thụy Sĩ.", website: "https://ethz.ch" },
  { id: 8, name: "University of Tokyo", country: "Japan", ranking: 9, image: "https://placehold.co/300x200/00205b/fff?text=Tokyo", description: "Chương trình trao đổi văn hóa và ngôn ngữ Nhật Bản.", website: "https://u-tokyo.ac.jp" },
  { id: 9, name: "University of Melbourne", country: "Australia", ranking: 15, image: "https://placehold.co/300x200/0055a4/fff?text=Melbourne", description: "Học bổng du học Úc với nhiều ngành học đa dạng.", website: "https://unimelb.edu.au" },
  { id: 10, name: "University of Toronto", country: "Canada", ranking: 18, image: "https://placehold.co/300x200/002147/fff?text=Toronto", description: "Chương trình trao đổi học thuật Canada.", website: "https://utoronto.ca" },
  { id: 11, name: "Seoul National University", country: "South Korea", ranking: 29, image: "https://placehold.co/300x200/8b0000/fff?text=SNU", description: "Học bổng K-POP và văn hóa Hàn Quốc.", website: "https://snu.ac.kr" },
  { id: 12, name: "Technical University of Munich", country: "Germany", ranking: 50, image: "https://placehold.co/300x200/0066b3/fff?text=TUM", description: "Học bổng kỹ thuật và công nghệ Đức.", website: "https://tum.de" },
  { id: 13, name: "University of Amsterdam", country: "Netherlands", ranking: 58, image: "https://placehold.co/300x200/00843d/fff?text=Amsterdam", description: "Chương trình kinh doanh và quản lý quốc tế.", website: "https://uva.nl" },
  { id: 14, name: "Tsinghua University", country: "China", ranking: 14, image: "https://placehold.co/300x200/7f1418/fff?text=Tsinghua", description: "Học bổng trao đổi Trung Quốc và công nghệ.", website: "https://tsinghua.edu.cn" },
  { id: 15, name: "University of Auckland", country: "New Zealand", ranking: 85, image: "https://placehold.co/300x200/0055a4/fff?text=Auckland", description: "Chương trình du học New Zealand với môi trường học tập tuyệt vời.", website: "https://auckland.ac.nz" },
];

export const MOCK_PROGRAMS: ExchangeProgram[] = [
  { id: 1, partnerId: 1, title: "Harvard Summer Leadership Camp", type: "Summer Camp", duration: "2 tuần", cost: 5000, deadline: "2024-03-01", slots: 5 },
  { id: 2, partnerId: 2, title: "Oxford Cultural Exchange", type: "Semester Exchange", duration: "1 kỳ học", cost: 15000, deadline: "2024-04-15", slots: 3 },
  { id: 3, partnerId: 3, title: "NUS ASEAN Scholarship", type: "Scholarship", duration: "4 năm", cost: 0, deadline: "2024-02-28", slots: 2 },
  { id: 4, partnerId: 4, title: "Stanford Innovation Bootcamp", type: "Summer Camp", duration: "3 tuần", cost: 7500, deadline: "2024-03-15", slots: 4 },
  { id: 5, partnerId: 5, title: "MIT Research Internship", type: "Research", duration: "2 tháng", cost: 8000, deadline: "2024-02-20", slots: 2 },
  { id: 6, partnerId: 6, title: "Cambridge Science Exchange", type: "Semester Exchange", duration: "1 kỳ học", cost: 18000, deadline: "2024-04-01", slots: 3 },
  { id: 7, partnerId: 7, title: "ETH Zurich Engineering Scholarship", type: "Scholarship", duration: "3 năm", cost: 0, deadline: "2024-03-10", slots: 3 },
  { id: 8, partnerId: 8, title: "Tokyo Language & Culture Program", type: "Summer Camp", duration: "4 tuần", cost: 4000, deadline: "2024-03-25", slots: 6 },
  { id: 9, partnerId: 9, title: "Melbourne Business Exchange", type: "Semester Exchange", duration: "1 kỳ học", cost: 12000, deadline: "2024-04-10", slots: 4 },
  { id: 10, partnerId: 10, title: "Toronto STEM Scholarship", type: "Scholarship", duration: "4 năm", cost: 0, deadline: "2024-02-15", slots: 2 },
  { id: 11, partnerId: 11, title: "SNU K-Pop & Culture Camp", type: "Summer Camp", duration: "3 tuần", cost: 3500, deadline: "2024-03-20", slots: 8 },
  { id: 12, partnerId: 12, title: "TUM German Engineering Exchange", type: "Semester Exchange", duration: "1 kỳ học", cost: 10000, deadline: "2024-04-05", slots: 3 },
  { id: 13, partnerId: 13, title: "Amsterdam Business School", type: "Semester Exchange", duration: "1 kỳ học", cost: 13000, deadline: "2024-04-12", slots: 4 },
  { id: 14, partnerId: 14, title: "Tsinghua Tech Innovation", type: "Research", duration: "3 tháng", cost: 6000, deadline: "2024-02-25", slots: 3 },
  { id: 15, partnerId: 15, title: "Auckland Environmental Studies", type: "Summer Camp", duration: "2 tuần", cost: 3000, deadline: "2024-03-30", slots: 5 },
];

export const MOCK_ABROAD_APPS: AbroadApplication[] = [
  { id: 1, studentId: 1001, programId: 1, status: "Under Review", submissionDate: "2023-11-01" },
  { id: 2, studentId: 1002, programId: 3, status: "Submitted", submissionDate: "2023-11-10" },
  { id: 3, studentId: 1003, programId: 5, status: "Accepted", submissionDate: "2023-10-15" },
  { id: 4, studentId: 1004, programId: 7, status: "Interview", submissionDate: "2023-11-05" },
  { id: 5, studentId: 1005, programId: 11, status: "Under Review", submissionDate: "2023-11-12" },
  { id: 6, studentId: 1006, programId: 14, status: "Submitted", submissionDate: "2023-11-18" },
  { id: 7, studentId: 1007, programId: 4, status: "Rejected", submissionDate: "2023-10-20" },
  { id: 8, studentId: 1008, programId: 9, status: "Accepted", submissionDate: "2023-10-25" },
];

// Mock Smart Campus Data
export const MOCK_DEVICES: IoTDevice[] = [
  { id: 1, name: "Điều hòa P.201", type: "AC", location: "Phòng 201", status: "ON", value: "24°C", powerUsage: 1200 },
  { id: 2, name: "Đèn hành lang A", type: "LIGHT", location: "Khu A - Tầng 2", status: "OFF", powerUsage: 0 },
  { id: 3, name: "Máy chiếu P.202", type: "PROJECTOR", location: "Phòng 202", status: "ON", powerUsage: 300 },
  { id: 4, name: "Cảm biến P.201", type: "SENSOR", location: "Phòng 201", status: "ON", value: "25°C / 60%", powerUsage: 5 },
];

export const MOCK_AI_HISTORY: AIMessage[] = [
  { id: 1, sender: 'user', text: "Hãy tóm tắt bài học Lịch sử về Cách mạng tháng 8.", timestamp: "10:00" },
  { id: 2, sender: 'ai', text: "Cách mạng tháng Tám năm 1945 là mốc son chói lọi trong lịch sử dân tộc Việt Nam...", timestamp: "10:01" },
];

export const api = {
  getClasses: () => Promise.resolve(MOCK_CLASSES),
  getStudents: () => Promise.resolve(MOCK_STUDENTS),
  getTeachers: () => Promise.resolve(MOCK_TEACHERS),
  getSubjects: () => Promise.resolve(MOCK_SUBJECTS),
  getLMSMaterials: () => Promise.resolve(MOCK_LMS_MATERIALS),
  getSchedule: () => Promise.resolve(MOCK_SCHEDULE),
  getInvoices: () => Promise.resolve(MOCK_INVOICES),
  getBooks: () => Promise.resolve(MOCK_BOOKS),
  getEvents: () => Promise.resolve(MOCK_EVENTS),
  getExams: () => Promise.resolve(MOCK_EXAMS),
  getRoutes: () => Promise.resolve(MOCK_ROUTES),
  getInventory: () => Promise.resolve(MOCK_INVENTORY),
  getStaff: () => Promise.resolve(MOCK_STAFF),
  getLeaveRequests: () => Promise.resolve(MOCK_LEAVE_REQUESTS),
  getMenu: () => Promise.resolve(MOCK_MENU),
  getDormRooms: () => Promise.resolve(MOCK_DORM_ROOMS),
  getAlumni: () => Promise.resolve(MOCK_ALUMNI),
  getMedicalRecords: () => Promise.resolve(MOCK_MEDICAL_RECORDS),
  getHealthIncidents: () => Promise.resolve(MOCK_HEALTH_INCIDENTS),
  getSurveys: () => Promise.resolve(MOCK_SURVEYS),
  getFeedbacks: () => Promise.resolve(MOCK_FEEDBACKS),
  getApplicants: () => Promise.resolve(MOCK_APPLICANTS),
  getClubs: () => Promise.resolve(MOCK_CLUBS),
  getClubActivities: () => Promise.resolve(MOCK_CLUB_ACTIVITIES),
  getProjects: () => Promise.resolve(MOCK_PROJECTS),
  getSessions: () => Promise.resolve(MOCK_SESSIONS),
  getPartners: () => Promise.resolve(MOCK_PARTNERS),
  getPrograms: () => Promise.resolve(MOCK_PROGRAMS),
  getAbroadApps: () => Promise.resolve(MOCK_ABROAD_APPS),
  getIoTDevices: () => Promise.resolve(MOCK_DEVICES),
  getAIMessages: () => Promise.resolve(MOCK_AI_HISTORY),
};
