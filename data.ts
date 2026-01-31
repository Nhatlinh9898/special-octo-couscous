import { Teacher, Class, Student, Subject, LMSMaterial, ChatMessage, ScheduleItem, Invoice, Book, SchoolEvent, Exam, TransportRoute, InventoryItem, Staff, LeaveRequest, CanteenItem, DormRoom, Alumnus, MedicalRecord, HealthIncident, Survey, FeedbackItem, Applicant, Club, ClubActivity, ResearchProject, CounselingSession, PartnerUniversity, ExchangeProgram, AbroadApplication, IoTDevice, AIMessage } from './types';

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
  { id: 1, name: "Máy chiếu Panasonic", category: "Thiết bị điện tử", quantity: 20, location: "Kho A", condition: 'GOOD' },
  { id: 2, name: "Bàn ghế học sinh", category: "Nội thất", quantity: 500, location: "Các lớp học", condition: 'GOOD' },
  { id: 3, name: "Kính hiển vi quang học", category: "Thiết bị thí nghiệm", quantity: 30, location: "Phòng Lab Lý", condition: 'MAINTENANCE' },
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
  { id: 1, name: "Cơm Rang Thập Cẩm", price: 35000, category: "Food", available: true, calories: 550, image: "https://placehold.co/200x200/ffedd5/c2410c?text=Com+Rang" },
  { id: 2, name: "Phở Bò", price: 40000, category: "Food", available: true, calories: 450, image: "https://placehold.co/200x200/dcfce7/15803d?text=Pho+Bo" },
  { id: 3, name: "Bánh Mì Pate", price: 20000, category: "Food", available: true, calories: 350, image: "https://placehold.co/200x200/fce7f3/db2777?text=Banh+Mi" },
  { id: 4, name: "Nước Cam Ép", price: 25000, category: "Drink", available: true, calories: 120, image: "https://placehold.co/200x200/e0e7ff/4338ca?text=Nuoc+Cam" },
  { id: 5, name: "Sữa Chua", price: 10000, category: "Snack", available: true, calories: 100, image: "https://placehold.co/200x200/f3f4f6/374151?text=Sua+Chua" },
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
  { id: 2, code: "TS002", fullName: "Nguyen Thi Ut", dob: "2009-05-10", email: "ut.nguyen@gmail.com", phone: "0909000222", gradeApplying: 10, status: 'Interview', applicationDate: "2023-11-15", interviewDate: "2023-11-25 09:00" },
  { id: 3, code: "TS003", fullName: "Tran Van Teo", dob: "2009-12-01", email: "teo.tran@gmail.com", phone: "0909000333", gradeApplying: 11, status: 'Accepted', applicationDate: "2023-11-10", score: 8.5 },
];

export const MOCK_CLUBS: Club[] = [
  { id: 1, name: "CLB Bóng Đá", category: "Sports", presidentName: "Tran Minh Tuan", memberCount: 25, description: "Rèn luyện sức khỏe và tinh thần đồng đội.", image: "https://placehold.co/400x200/green/white?text=Football+Club", meetingDay: "Thứ 4, 17:00" },
  { id: 2, name: "CLB Guitar", category: "Arts", presidentName: "Le Thu Ha", memberCount: 15, description: "Nơi thỏa mãn đam mê âm nhạc.", image: "https://placehold.co/400x200/orange/white?text=Guitar+Club", meetingDay: "Thứ 6, 16:30" },
  { id: 3, name: "CLB Lập Trình", category: "Academic", presidentName: "Do Minh Duc", memberCount: 20, description: "Học lập trình Python và Web.", image: "https://placehold.co/400x200/blue/white?text=Coding+Club", meetingDay: "Thứ 7, 14:00" },
];

export const MOCK_CLUB_ACTIVITIES: ClubActivity[] = [
  { id: 1, clubId: 1, title: "Giao hữu với trường THPT Chu Văn An", date: "2023-12-10", description: "Trận đấu giao hữu tại sân vận động Mỹ Đình." },
  { id: 2, clubId: 2, title: "Biểu diễn văn nghệ Giáng Sinh", date: "2023-12-24", description: "Chuẩn bị các tiết mục cho đêm hội Noel." },
];

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
