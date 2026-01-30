import { AIMessage, SystemLog, AIAnalysisResult } from './types';

// Mock Server State
let serverLogs: SystemLog[] = [];
let totalRequests = 0;

// Sub-server statuses
const microservicesStatus = {
  nlpCore: 'Running',
  admissionsAI: 'Idle',
  financeAI: 'Idle',
  hrAI: 'Idle',
  libraryAI: 'Idle',
  lmsAI: 'Idle',
  transportAI: 'Idle',
  inventoryAI: 'Idle',
  healthAI: 'Idle',
  clubAI: 'Idle',
  alumniAI: 'Idle',
  examAI: 'Idle',
  // New Services
  timetableAI: 'Idle',
  classAI: 'Idle',
  studentAI: 'Idle',
  teacherAI: 'Idle',
  attendanceAI: 'Idle',
  gradesAI: 'Idle',
  eventAI: 'Idle',
  canteenAI: 'Idle',
  dormAI: 'Idle',
  sentimentAI: 'Idle', // Feedback
  researchAI: 'Idle',
  counselingAI: 'Idle',
  studyAbroadAI: 'Idle',
  strategyAI: 'Idle', // Analytics
  iotController: 'Running'
};

const addLog = (level: SystemLog['level'], module: string, message: string, latency?: number) => {
  const log: SystemLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    level,
    module,
    message,
    latency
  };
  serverLogs = [log, ...serverLogs].slice(0, 100);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- NLP Core ---
const processIntent = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('xin chào')) return "Chào bạn! EduBot có thể giúp gì?";
  return "Xin lỗi, tôi chưa hiểu rõ yêu cầu.";
};

// --- PREVIOUS SERVICES (Keep them) ---
const admissionsServer = {
  async analyzeApplicants(count: number): Promise<AIAnalysisResult> {
    microservicesStatus.admissionsAI = 'Processing';
    await delay(1500);
    microservicesStatus.admissionsAI = 'Idle';
    addLog('SUCCESS', 'ADMISSIONS_AI', `Analyzed ${count} profiles.`, 1500);
    return { title: "Phân tích Hồ sơ Tuyển sinh", summary: "Chất lượng đầu vào tăng 15%.", recommendations: ["Ưu tiên HS giỏi Toán"], dataPoints: [{label: 'Đạt', value: '78%'}] };
  }
};
// ... (Assume Finance, HR, etc. are implicitly here or re-implemented if space permits. 
// For brevity in this big file, I will include ALL implementations below to ensure the file is complete)

const financeServer = {
  async forecastRevenue(rev: number): Promise<AIAnalysisResult> {
    microservicesStatus.financeAI = 'Processing'; await delay(1000); microservicesStatus.financeAI = 'Idle';
    addLog('INFO', 'FINANCE_AI', 'Forecast generated.', 1000);
    return { title: "Dự báo Tài chính", summary: "Dòng tiền ổn định.", recommendations: ["Nhắc phí tự động"], dataPoints: [{label: 'Dự thu', value: '15 Tỷ'}] };
  }
};
const hrServer = { async evaluateStaffPerformance(): Promise<AIAnalysisResult> { microservicesStatus.hrAI = 'Processing'; await delay(1000); microservicesStatus.hrAI = 'Idle'; return { title: "Đánh giá NS", summary: "Tải công việc cao.", recommendations: ["Tuyển thêm GV Toán"] }; }};
const libraryServer = { async suggestBooks(): Promise<AIAnalysisResult> { microservicesStatus.libraryAI = 'Processing'; await delay(1000); microservicesStatus.libraryAI = 'Idle'; return { title: "Gợi ý Sách", summary: "Nhu cầu sách KH cao.", recommendations: ["Nhập thêm sách Stephen Hawking"] }; }};
const lmsServer = { async analyzeLearningPatterns(): Promise<AIAnalysisResult> { microservicesStatus.lmsAI = 'Processing'; await delay(1000); microservicesStatus.lmsAI = 'Idle'; return { title: "Phân tích Học tập", summary: "Video tương tác tốt.", recommendations: ["Tăng video ngắn"] }; }};
const transportServer = { async optimizeRoutes(): Promise<AIAnalysisResult> { microservicesStatus.transportAI = 'Processing'; await delay(1000); microservicesStatus.transportAI = 'Idle'; return { title: "Tối ưu Lộ trình", summary: "Tiết kiệm 15% nhiên liệu.", recommendations: ["Gộp điểm đón"] }; }};
const inventoryServer = { async predictMaintenance(): Promise<AIAnalysisResult> { microservicesStatus.inventoryAI = 'Processing'; await delay(1000); microservicesStatus.inventoryAI = 'Idle'; return { title: "Dự báo Bảo trì", summary: "5 Máy chiếu sắp hỏng.", recommendations: ["Thay bóng đèn"] }; }};
const healthServer = { async analyzeHealthTrends(): Promise<AIAnalysisResult> { microservicesStatus.healthAI = 'Processing'; await delay(1000); microservicesStatus.healthAI = 'Idle'; return { title: "Xu hướng Sức khỏe", summary: "Cúm mùa tăng nhẹ.", recommendations: ["Phun khử khuẩn"] }; }};
const clubServer = { async suggestActivities(): Promise<AIAnalysisResult> { microservicesStatus.clubAI = 'Processing'; await delay(1000); microservicesStatus.clubAI = 'Idle'; return { title: "Gợi ý CLB", summary: "Trend AI & Robot.", recommendations: ["Mở CLB Robotics"] }; }};
const alumniServer = { async matchMentors(): Promise<AIAnalysisResult> { microservicesStatus.alumniAI = 'Processing'; await delay(1000); microservicesStatus.alumniAI = 'Idle'; return { title: "Kết nối Mentor", summary: "Tìm thấy 15 mentors.", recommendations: ["Tổ chức Career Talk"] }; }};
const examServer = { async analyzeExamDifficulty(): Promise<AIAnalysisResult> { microservicesStatus.examAI = 'Processing'; await delay(1000); microservicesStatus.examAI = 'Idle'; return { title: "Độ khó Đề thi", summary: "Phân hóa tốt.", recommendations: ["Giữ nguyên cấu trúc"] }; }};

// --- NEW IMPLEMENTATIONS FOR REMAINING PAGES ---

const timetableServer = {
  async optimizeSchedule(): Promise<AIAnalysisResult> {
    microservicesStatus.timetableAI = 'Processing';
    const start = Date.now(); await delay(2500); const latency = Date.now() - start;
    addLog('SUCCESS', 'TIMETABLE_AI', 'Genetic algorithm solved schedule conflicts.', latency);
    microservicesStatus.timetableAI = 'Idle';
    return {
      title: "Tối ưu hóa Thời khóa biểu",
      summary: "Đã giải quyết 3 xung đột phòng học và tối ưu giờ trống cho giáo viên.",
      recommendations: ["Chuyển tiết Lý 10A1 sang chiều Thứ 3", "Gộp lớp Thể dục khối 11"],
      dataPoints: [{ label: 'Độ phủ phòng', value: '92%' }, { label: 'Xung đột', value: '0' }]
    };
  }
};

const classServer = {
  async balanceComposition(): Promise<AIAnalysisResult> {
    microservicesStatus.classAI = 'Processing';
    const start = Date.now(); await delay(1800);
    addLog('INFO', 'CLASS_AI', 'Class composition analysis done.', Date.now() - start);
    microservicesStatus.classAI = 'Idle';
    return {
      title: "Cân bằng Sĩ số & Học lực",
      summary: "Lớp 10A1 đang có tỷ lệ HS Giỏi cao bất thường so với mặt bằng chung.",
      recommendations: ["Điều chuyển 2 HS Khá sang 10A2", "Tăng cường trợ giảng cho 10A5"],
      dataPoints: [{ label: 'Độ lệch chuẩn', value: '0.4' }]
    };
  }
};

const studentServer = {
  async predictAtRisk(): Promise<AIAnalysisResult> {
    microservicesStatus.studentAI = 'Processing';
    await delay(2000);
    addLog('WARNING', 'STUDENT_AI', 'Identified at-risk students.', 2000);
    microservicesStatus.studentAI = 'Idle';
    return {
      title: "Dự báo Nguy cơ Bỏ học/Học yếu",
      summary: "Phát hiện 5 học sinh có dấu hiệu sa sút nghiêm trọng trong 2 tuần qua.",
      recommendations: ["Gặp gỡ phụ huynh em Trần Văn B", "Bổ trợ kiến thức Toán cho nhóm yếu"],
      dataPoints: [{ label: 'Nguy cơ cao', value: '5 HS' }]
    };
  }
};

const teacherServer = {
  async suggestPD(): Promise<AIAnalysisResult> {
    microservicesStatus.teacherAI = 'Processing';
    await delay(1500);
    addLog('SUCCESS', 'TEACHER_AI', 'Skill gap analysis complete.', 1500);
    microservicesStatus.teacherAI = 'Idle';
    return {
      title: "Đề xuất Phát triển Chuyên môn",
      summary: "Giáo viên tổ Xã hội cần tăng cường kỹ năng số hóa bài giảng.",
      recommendations: ["Tổ chức workshop Canva & AI", "Khuyến khích thi chứng chỉ IELTS"],
      dataPoints: [{ label: 'Nhu cầu đào tạo', value: 'High' }]
    };
  }
};

const attendanceServer = {
  async detectPatterns(): Promise<AIAnalysisResult> {
    microservicesStatus.attendanceAI = 'Processing';
    await delay(1200);
    addLog('INFO', 'ATTENDANCE_AI', 'Pattern recognition running.', 1200);
    microservicesStatus.attendanceAI = 'Idle';
    return {
      title: "Phân tích Xu hướng Chuyên cần",
      summary: "Tỷ lệ đi muộn tăng cao vào sáng Thứ 2 và những ngày mưa.",
      recommendations: ["Dời giờ vào lớp sáng T2 trễ hơn 15p", "Kiểm tra xe đưa đón tuyến 02"],
      dataPoints: [{ label: 'Đi muộn T2', value: '12%' }]
    };
  }
};

const gradesServer = {
  async analyzePerformance(): Promise<AIAnalysisResult> {
    microservicesStatus.gradesAI = 'Processing';
    await delay(3000);
    addLog('SUCCESS', 'GRADES_AI', 'Deep learning on grade distribution.', 3000);
    microservicesStatus.gradesAI = 'Idle';
    return {
      title: "Phân tích Kết quả Học tập",
      summary: "Điểm môn Tiếng Anh có sự phân hóa mạnh, môn Lý thấp hơn kỳ vọng.",
      recommendations: ["Tổ chức phụ đạo Lý cho khối 11", "Khen thưởng nhóm Anh văn xuất sắc"],
      dataPoints: [{ label: 'TB Môn Lý', value: '6.5' }]
    };
  }
};

const eventServer = {
  async predictEngagement(): Promise<AIAnalysisResult> {
    microservicesStatus.eventAI = 'Processing';
    await delay(1000);
    addLog('INFO', 'EVENT_AI', 'Engagement prediction model.', 1000);
    microservicesStatus.eventAI = 'Idle';
    return {
      title: "Dự báo Tham gia Sự kiện",
      summary: "Sự kiện 'Ngày hội STEM' dự kiến thu hút 85% học sinh.",
      recommendations: ["Chuẩn bị thêm 200 suất ăn nhẹ", "Mở rộng khu vực check-in"],
      dataPoints: [{ label: 'Dự kiến', value: '850 HS' }]
    };
  }
};

const canteenServer = {
  async optimizeMenu(): Promise<AIAnalysisResult> {
    microservicesStatus.canteenAI = 'Processing';
    await delay(1600);
    addLog('SUCCESS', 'CANTEEN_AI', 'Menu optimization based on sales.', 1600);
    microservicesStatus.canteenAI = 'Idle';
    return {
      title: "Tối ưu Thực đơn & Dinh dưỡng",
      summary: "Món 'Cơm rang' bán chạy nhưng 'Súp rau' thừa nhiều.",
      recommendations: ["Giảm 30% lượng Súp rau", "Bổ sung món Mì ý vào T4"],
      dataPoints: [{ label: 'Lãng phí thực phẩm', value: '-15%' }]
    };
  }
};

const dormServer = {
  async matchRoommates(): Promise<AIAnalysisResult> {
    microservicesStatus.dormAI = 'Processing';
    await delay(2000);
    addLog('INFO', 'DORM_AI', 'Compatibility matching algorithm.', 2000);
    microservicesStatus.dormAI = 'Idle';
    return {
      title: "Sắp xếp Phòng KTX Thông minh",
      summary: "Đã tối ưu hóa việc xếp phòng dựa trên thói quen sinh hoạt.",
      recommendations: ["Xếp nhóm ôn thi ĐH vào khu yên tĩnh", "Tách riêng 2 HS có xung đột trước đó"],
      dataPoints: [{ label: 'Độ hài lòng', value: '90%' }]
    };
  }
};

const sentimentServer = {
  async analyzeFeedback(): Promise<AIAnalysisResult> {
    microservicesStatus.sentimentAI = 'Processing';
    await delay(2200);
    addLog('WARNING', 'SENTIMENT_AI', 'Negative sentiment detected in Facility category.', 2200);
    microservicesStatus.sentimentAI = 'Idle';
    return {
      title: "Phân tích Cảm xúc Phản hồi",
      summary: "Học sinh đang phàn nàn nhiều về Wifi và Điều hòa.",
      recommendations: ["Nâng cấp gói cước Internet thư viện", "Bảo trì điều hòa dãy nhà B"],
      dataPoints: [{ label: 'Tiêu cực', value: 'Wifi (60%)' }]
    };
  }
};

const researchServer = {
  async identifyTrends(): Promise<AIAnalysisResult> {
    microservicesStatus.researchAI = 'Processing';
    await delay(1800);
    addLog('INFO', 'RESEARCH_AI', 'Scanning global STEM trends.', 1800);
    microservicesStatus.researchAI = 'Idle';
    return {
      title: "Xu hướng Nghiên cứu STEM",
      summary: "Chủ đề 'Năng lượng tái tạo' và 'AI' đang là xu hướng hot.",
      recommendations: ["Khuyến khích đề tài pin mặt trời", "Tổ chức cuộc thi coding AI"],
      dataPoints: [{ label: 'Trend Score', value: '9.5/10' }]
    };
  }
};

const counselingServer = {
  async screenRisks(): Promise<AIAnalysisResult> {
    microservicesStatus.counselingAI = 'Processing';
    await delay(2500);
    addLog('WARNING', 'COUNSELING_AI', 'Mental health risk screening.', 2500);
    microservicesStatus.counselingAI = 'Idle';
    return {
      title: "Sàng lọc Nguy cơ Tâm lý",
      summary: "Gia tăng căng thẳng ở khối 12 giai đoạn nước rút.",
      recommendations: ["Tổ chức buổi Yoga/Thiền", "Tăng cường khung giờ tư vấn 1-1"],
      dataPoints: [{ label: 'Stress Level', value: 'High' }]
    };
  }
};

const studyAbroadServer = {
  async matchScholarships(): Promise<AIAnalysisResult> {
    microservicesStatus.studyAbroadAI = 'Processing';
    await delay(1500);
    addLog('SUCCESS', 'STUDY_ABROAD_AI', 'Scholarship matching engine.', 1500);
    microservicesStatus.studyAbroadAI = 'Idle';
    return {
      title: "Kết nối Học bổng Quốc tế",
      summary: "Tìm thấy 5 học bổng phù hợp với profile HS trường ta.",
      recommendations: ["Apply học bổng ASEAN của NUS", "Giới thiệu chương trình Monbukagakusho (Nhật)"],
      dataPoints: [{ label: 'Cơ hội', value: 'High' }]
    };
  }
};

const strategyServer = {
  async generateStrategy(): Promise<AIAnalysisResult> {
    microservicesStatus.strategyAI = 'Processing';
    await delay(3500);
    addLog('INFO', 'STRATEGY_AI', 'Generating strategic insights.', 3500);
    microservicesStatus.strategyAI = 'Idle';
    return {
      title: "Chiến lược Phát triển Nhà trường",
      summary: "Dữ liệu cho thấy nên tập trung vào chất lượng mũi nhọn và quốc tế hóa.",
      recommendations: ["Đầu tư phòng Lab chuẩn quốc tế", "Mở hệ song bằng Cambridge"],
      dataPoints: [{ label: 'ROI Dự kiến', value: '25%' }]
    };
  }
};

export const aiService = {
  // Expose All Microservices (Old + New)
  admissions: admissionsServer,
  finance: financeServer,
  hr: hrServer,
  library: libraryServer,
  lms: lmsServer,
  transport: transportServer,
  inventory: inventoryServer,
  health: healthServer,
  club: clubServer,
  alumni: alumniServer,
  exam: examServer,
  // New
  timetable: timetableServer,
  class: classServer,
  student: studentServer,
  teacher: teacherServer,
  attendance: attendanceServer,
  grades: gradesServer,
  event: eventServer,
  canteen: canteenServer,
  dorm: dormServer,
  sentiment: sentimentServer,
  research: researchServer,
  counseling: counselingServer,
  studyAbroad: studyAbroadServer,
  strategy: strategyServer,

  // General Chat
  async chat(message: string): Promise<string> {
    totalRequests++;
    const start = Date.now();
    const latency = Math.floor(Math.random() * 500) + 200;
    await delay(latency);
    const response = processIntent(message);
    addLog('SUCCESS', 'NLP_CORE', `Processed chat`, latency);
    return response;
  },

  // IoT Task
  async optimizeEnergy(): Promise<string> {
    totalRequests++;
    const start = Date.now();
    addLog('INFO', 'IOT_CONTROLLER', 'Optimizing energy...', 500);
    await delay(2000);
    addLog('SUCCESS', 'IOT_CONTROLLER', 'Optimization done.', 2000);
    return "Đã tối ưu hóa năng lượng.";
  },

  getLogs(): SystemLog[] { return serverLogs; },
  getStats() {
    return {
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: Math.floor(Math.random() * 50) + 30,
      activeRequests: Math.floor(Math.random() * 20),
      totalRequests,
      uptime: "12d 6h 15m",
      activeMicroservices: Object.values(microservicesStatus).filter(s => s !== 'Idle').length
    };
  },
  getServiceStatuses() { return microservicesStatus; }
};
