"""
Course Catalog Agent - Agent chuyên tạo danh sách môn học chi tiết
Tạo môn học cho tất cả cấp học và lĩnh vực từ cơ bản đến chuyên sâu
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Any, List, Set, Tuple, Optional
from dataclasses import dataclass
from .base_agent import BaseAgent

@dataclass
class Course:
    course_id: str
    title: str
    level: str  # basic, intermediate, advanced, expert
    credits: int
    duration_weeks: int
    prerequisites: List[str]
    description: str
    learning_outcomes: List[str]
    assessment_methods: List[str]
    topics: List[str]
    skills_gained: List[str]

class CourseCatalogAgent(BaseAgent):
    def __init__(self):
        super().__init__("course_catalog", "llama3:70b-instruct")
        self.description = "Agent chuyên tạo danh sách môn học từ cơ bản đến chuyên sâu"
        self.capabilities = [
            "generate_course_catalog",
            "create_course_sequences",
            "define_learning_paths",
            "map_skills_to_courses",
            "create_specializations"
        ]
        
        self.course_levels = {
            "basic": {"level": 100, "difficulty": 1.0, "prerequisites": []},
            "intermediate": {"level": 200, "difficulty": 2.0, "prerequisites": ["basic"]},
            "advanced": {"level": 300, "difficulty": 3.0, "prerequisites": ["intermediate"]},
            "expert": {"level": 400, "difficulty": 4.0, "prerequisites": ["advanced"]}
        }
        
        self.fields = {
            "k12_education": ["elementary_math", "elementary_vietnamese", "elementary_science", "middle_school_math", "middle_school_literature", "middle_school_physics", "middle_school_chemistry", "middle_school_biology", "high_school_math", "high_school_literature", "high_school_physics", "high_school_chemistry", "high_school_biology"],
            "computer_science": ["programming", "algorithms", "databases", "ai", "security"],
            "business": ["finance", "marketing", "management", "accounting", "entrepreneurship"],
            "engineering": ["mechanical", "electrical", "civil", "chemical", "biomedical"],
            "sciences": ["physics", "chemistry", "biology", "mathematics", "statistics"]
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if task == "generate_catalog":
            return await self.generate_course_catalog(data)
        elif task == "create_sequences":
            return await self.create_course_sequences(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def generate_course_catalog(self, data: Dict[str, Any]) -> Dict[str, Any]:
        field = data.get("field", "computer_science")
        levels = data.get("levels", ["basic", "intermediate", "advanced", "expert"])
        
        catalog = {}
        
        for level in levels:
            catalog[level] = await self.generate_courses_for_level(field, level)
        
        return self.format_response({
            "field": field,
            "catalog": catalog,
            "total_courses": sum(len(courses) for courses in catalog.values()),
            "learning_paths": await self.create_learning_paths(field)
        }, confidence=0.95)
    
    async def generate_courses_for_level(self, field: str, level: str) -> List[Course]:
        courses = []
        
        if field == "k12_education":
            if level == "basic":
                courses = [
                    # Elementary School (Grades 1-5)
                    Course("K12_MATH101", "Toán Lớp 1 - Số đếm và phép cộng", "basic", 2, 16, [],
                           "Giới thiệu số đếm và phép cộng cơ bản cho học sinh lớp 1",
                           ["Đếm số từ 1-100", "Phép cộng cơ bản", "Nhận biết hình dạng"],
                           ["Bài tập đếm", "Thực hành phép cộng", "Vẽ hình học", "Kiểm tra"],
                           ["Số và đếm", "Phép cộng", "Hình học cơ bản"],
                           ["Tư duy toán học", "Kỹ năng đếm", "Logic cơ bản"]),
                    Course("K12_VIET101", "Tiếng Việt Lớp 1 - Chữ cái và đọc", "basic", 3, 16, [],
                           "Học chữ cái và luyện đọc cơ bản",
                           ["Đọc thành thạo 29 chữ cái", "Viết đúng nét chữ", "Tập làm câu"],
                           ["Thực hành đọc", "Luyện viết chữ", "Tập kể chuyện", "Kiểm tra"],
                           ["Bảng chữ cái", "Nguyên âm phụ âm", "Từ vựng cơ bản", "Câu đơn"],
                           ["Kỹ năng đọc viết", "Từ vựng", "Ngữ pháp cơ bản"]),
                    Course("K12_SCI101", "Tự nhiên Xã hội Lớp 1", "basic", 2, 16, [],
                           "Khám phá thế giới tự nhiên và xã hội",
                           ["Nhận biết cây cỏ động vật", "Hiểu về gia đình trường học"],
                           ["Quan sát thực tế", "Vẽ tranh", "Thảo luận", "Dự án nhỏ"],
                           ["Cây cỏ hoa lá", "Động vật quen thuộc", "Gia đình bạn bè", "Trường lớp"],
                           ["Tư duy quan sát", "Yêu thiên nhiên", "Ý thức cộng đồng"]),
                    
                    Course("K12_MATH102", "Toán Lớp 2 - Phép trừ và nhân", "basic", 2, 16, ["K12_MATH101"],
                           "Phép trừ, phép nhân và bài toán đố",
                           ["Phép trừ trong phạm vi 100", "Bảng cửu chương", "Giải bài toán đố"],
                           ["Thực hành tính toán", "Giải bài tập", "Trò chơi toán học"],
                           ["Phép trừ", "Bảng cửu chương", "Bài toán đố", "Đo lường"],
                           ["Tính nhẩm", "Giải quyết vấn đề", "Logic toán học"]),
                    Course("K12_VIET102", "Tiếng Việt Lớp 2 - Đọc hiểu văn", "basic", 3, 16, ["K12_VIET101"],
                           "Phát triển kỹ năng đọc hiểu và viết văn ngắn",
                           ["Đọc hiểu truyện ngắn", "Viết đoạn văn", "Tập viết thư"],
                           ["Thực hành đọc", "Luyện viết đoạn văn", "Tập kể chuyện"],
                           ["Từ loại văn học", "Cấu trúc đoạn văn", "Dấu câu", "Từ vựng"],
                           ["Kỹ năng đọc hiểu", "Viết sáng tác", "Ngữ pháp"]),
                    
                    Course("K12_MATH103", "Toán Lớp 3 - Phép chia và phân số", "basic", 3, 16, ["K12_MATH102"],
                           "Phép chia, phân số và bài toán thời gian",
                           ["Phép chia có dư", "Phân số cơ bản", "Bài toán thời gian"],
                           ["Thực hành phép chia", "Học phân số", "Giải bài toán thực tế"],
                           ["Phép chia", "Phân số", "Thời gian", "Diện tích cơ bản"],
                           ["Tư duy toán học", "Giải quyết vấn đề", "Tính toán"]),
                    Course("K12_VIET103", "Tiếng Việt Lớp 3 - Tập làm văn", "basic", 3, 16, ["K12_VIET102"],
                           "Hoàn thiện kỹ năng viết và ngữ pháp",
                           ["Viết văn tả", "Ngữ pháp câu", "Tập viết thơ"],
                           ["Thực hành viết văn", "Học ngữ pháp", "Tập sáng tác"],
                           ["Các thể loại văn bản", "Ngữ pháp nâng cao", "Từ vựng phong phú"],
                           ["Viết sáng tác", "Ngữ pháp", "Kỹ năng thuyết trình"]),
                    
                    Course("K12_MATH104", "Toán Lớp 4 - Hình học và đại số", "basic", 3, 16, ["K12_MATH103"],
                           "Hình học phẳng và đại số cơ bản",
                           ["Hình học tam giác", "Phương trình đơn giản", "Diện tích thể tích"],
                           ["Vẽ hình học", "Giải phương trình", "Thực hành đo lường"],
                           ["Hình học phẳng", "Phương trình đại số", "Diện tích chu vi", "Thể tích"],
                           ["Tư duy không gian", "Giải quyết vấn đề", "Logic hình học"]),
                    Course("K12_VIET104", "Tiếng Việt Lớp 4 - Văn học cơ bản", "basic", 3, 16, ["K12_VIET103"],
                           "Phân tích văn học và sáng tác văn bản",
                           ["Phân tích tác phẩm", "Sáng tác truyện ngắn", "Viết báo cáo"],
                           ["Đọc và phân tích", "Thực hành sáng tác", "Thảo luận văn học"],
                           ["Văn học Việt Nam", "Các thể loại sáng tác", "Phân tích tác phẩm"],
                           ["Phân tích văn học", "Sáng tác", "Tư duy phê bình"]),
                    
                    Course("K12_MATH105", "Toán Lớp 5 - Ôn tập tổng hợp", "basic", 3, 16, ["K12_MATH104"],
                           "Ôn tập kiến thức toán tiểu học",
                           ["Ôn tập toàn chương", "Bài toán tổng hợp", "Luyện thi chuyển cấp"],
                           ["Giải bài tập tổng hợp", "Luyện thi", "Dự án toán học"],
                           ["Tổng quan toán tiểu học", "Bài toán ứng dụng", "Lý thuyết số"],
                           ["Tư duy toán học tổng hợp", "Giải quyết vấn đề", "Ôn tập"]),
                    Course("K12_VIET105", "Tiếng Việt Lớp 5 - Chuẩn bị THCS", "basic", 3, 16, ["K12_VIET104"],
                           "Củng cố văn học và kỹ năng THCS",
                           ["Tổng quan văn học", "Kỹ năng viết luận", "Thuyết trình"],
                           ["Ôn tập văn học", "Thực hành viết luận", "Thuyết trình"],
                           ["Tổng quan văn học", "Viết luận cơ bản", "Kỹ năng thuyết trình"],
                           ["Phân tích văn học", "Viết luận", "Thuyết trình tự tin"])
                ]
            
            elif level == "intermediate":
                courses = [
                    # Middle School (Grades 6-8)
                    Course("K12_MATH201", "Toán Lớp 6 - Số học đại số", "intermediate", 3, 16, ["K12_MATH105"],
                           "Số học, tập hợp và đại số THCS",
                           ["Số học cơ bản", "Tập hợp", "Phương trình bậc nhất"],
                           ["Thực hành tính toán", "Giải phương trình", "Làm bài tập nhóm"],
                           ["Số tự nhiên số nguyên", "Tập hợp phép toán", "Phương trình bậc nhất"],
                           ["Tư duy đại số", "Giải quyết vấn đề", "Logic toán học"]),
                    Course("K12_LIT201", "Ngữ văn Lớp 6 - Văn học THCS", "intermediate", 3, 16, ["K12_VIET105"],
                           "Giới thiệu văn học THCS",
                           ["Phân tích tác phẩm", "Viết văn nghị luận", "Tìm hiểu thể loại"],
                           ["Đọc và phân tích", "Thực hành viết văn", "Thảo luận nhóm"],
                           ["Văn học THCS", "Các thể loại văn học", "Phân tích tác phẩm"],
                           ["Phân tích văn học", "Viết nghị luận", "Tư duy phê bình"]),
                    Course("K12_PHY201", "Vật lý Lớp 6 - Cơ học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu vật lý cơ học",
                           ["Định luật Newton", "Lực và chuyển động", "Công và năng lượng"],
                           ["Thí nghiệm vật lý", "Giải bài tập cơ học", "Làm đồ án khoa học"],
                           ["Chuyển động và lực", "Định luật Newton", "Công và năng lượng"],
                           ["Tư duy khoa học", "Kỹ năng thực nghiệm", "Giải quyết vấn đề"]),
                    Course("K12_CHEM201", "Hóa học Lớp 6 - Hóa học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu hóa học cơ bản",
                           ["Cấu trúc nguyên tử", "Phản ứng hóa học", "Các hợp chất"],
                           ["Thí nghiệm hóa học", "Luyện tập phản ứng", "Viết báo cáo"],
                           ["Nguyên tử phân tử", "Phản ứng hóa học", "Các hợp chất quan trọng"],
                           ["Tư duy hóa học", "Kỹ năng thí nghiệm", "An toàn hóa học"]),
                    Course("K12_BIO201", "Sinh học Lớp 6 - Sinh học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu sinh học cơ bản",
                           ["Tế bào và cấu trúc", "Các quá trình sống", "Phân loại sinh vật"],
                           ["Quan sát kính hiển vi", "Thí nghiệm sinh học", "Lập biểu đồ"],
                           ["Tế bào", "Các quá trình sống", "Đa dạng sinh học"],
                           ["Tư duy sinh học", "Kỹ năng quan sát", "Ý thức môi trường"]),
                    
                    Course("K12_MATH202", "Toán Lớp 7 - Hình học thống kê", "intermediate", 3, 16, ["K12_MATH201"],
                           "Hình học phẳng và thống kê cơ bản",
                           ["Hình học phẳng nâng cao", "Thống kê cơ bản"],
                           ["Vẽ hình học", "Thực hành thống kê", "Giải bài tập hình học"],
                           ["Hình học phẳng", "Thống kê xác suất", "Tọa độ"],
                           ["Tư duy không gian", "Phân tích dữ liệu", "Logic hình học"]),
                    Course("K12_LIT202", "Ngữ văn Lớp 7 - Văn học Việt Nam", "intermediate", 3, 16, ["K12_LIT201"],
                           "Văn học Việt Nam hiện đại",
                           ["Văn học Việt Nam hiện đại", "Phân tích tác phẩm", "Viết văn sáng tạo"],
                           ["Đọc và phân tích", "Thực hành viết văn", "Thảo luận tác phẩm"],
                           ["Văn học Việt Nam hiện đại", "Các tác giả tiêu biểu", "Viết sáng tạo"],
                           ["Phân tích văn học", "Sáng tác", "Tư duy phản biện"]),
                    
                    Course("K12_MATH203", "Toán Lớp 8 - Đại số hình học nâng cao", "intermediate", 3, 16, ["K12_MATH202"],
                           "Đại số nâng cao và hình học phân tích",
                           ["Đa thức và phương trình bậc hai", "Hình học phân tích"],
                           ["Giải phương trình bậc hai", "Vẽ đồ thị", "Hệ thống hóa kiến thức"],
                           ["Đa thức", "Phương trình bậc hai", "Hình học phân tích", "Hàm số"],
                           ["Tư duy đại số", "Phân tích đồ thị", "Logic toán học"]),
                    Course("K12_LIT203", "Ngữ văn Lớp 8 - Văn học nước ngoài", "intermediate", 3, 16, ["K12_LIT202"],
                           "Văn học nước ngoài và sáng tác",
                           ["Văn học nước ngoài", "Sáng tác văn học", "Phê bình văn học"],
                           ["Đọc và phân tích", "Thực hành sáng tác", "Viết phê bình"],
                           ["Văn học nước ngoài", "Các thể loại quốc tế", "Sáng tác văn học"],
                           ["Hiểu biết văn hóa thế giới", "Sáng tác", "Phê bình văn học"])
                ]
            
            elif level == "advanced":
                courses = [
                    # High School (Grades 9-10)
                    Course("K12_MATH301", "Toán Lớp 9 - Đại số lượng giác", "advanced", 3, 16, ["K12_MATH203"],
                           "Đại số nâng cao và lượng giác",
                           ["Đại số nâng cao", "Lượng giác", "Hình học không gian"],
                           ["Giải bài tập nâng cao", "Luyện thi", "Dự án toán học"],
                           ["Đa thức nâng cao", "Lượng giác", "Hình học không gian"],
                           ["Tư duy toán học nâng cao", "Giải quyết vấn đề phức tạp"]),
                    Course("K12_LIT301", "Ngữ văn Lớp 9 - Văn học xã hội", "advanced", 3, 16, ["K12_LIT203"],
                           "Văn học và các vấn đề xã hội",
                           ["Văn học và xã hội", "Phân tích tác phẩm sâu", "Viết luận nâng cao"],
                           ["Phân tích tác phẩm", "Thảo luận xã hội", "Viết luận nâng cao"],
                           ["Văn học và xã hội", "Phân tích tác phẩm sâu", "Viết luận xã hội"],
                           ["Tư duy phê bình sâu", "Hiểu biết xã hội", "Viết luận nâng cao"]),
                    Course("K12_PHY301", "Vật lý Lớp 9 - Điện học từ học", "advanced", 3, 16, [],
                           "Điện học, từ học và ứng dụng",
                           ["Điện học nâng cao", "Từ học", "Điện từ học"],
                           ["Thí nghiệm điện học", "Lắp mạch phức tạp", "Nghiên cứu ứng dụng"],
                           ["Điện trường dòng điện", "Định luật Ohm", "Từ trường"],
                           ["Tư duy vật lý nâng cao", "Kỹ năng thí nghiệm", "Ứng dụng công nghệ"]),
                    Course("K12_CHEM301", "Hóa học Lớp 9 - Hóa học hữu cơ", "advanced", 3, 16, [],
                           "Hóa học hữu cơ cơ bản",
                           ["Hóa học hữu cơ", "Các phản ứng quan trọng", "Polyme"],
                           ["Thí nghiệm hóa hữu cơ", "Tổng hợp chất hữu cơ", "Nghiên cứu polyme"],
                           ["Hóa học hữu cơ", "Cacbon và hợp chất", "Các phản ứng quan trọng"],
                           ["Tư duy hóa học nâng cao", "Kỹ năng thí nghiệm", "Ý thức môi trường"]),
                    
                    Course("K12_MATH401", "Toán Lớp 10 - Giải tích hình học", "advanced", 3, 16, ["K12_MATH301"],
                           "Giải tích cơ bản và hình học nâng cao",
                           ["Giải tích cơ bản", "Hình học phân tích", "Xác suất thống kê"],
                           ["Giải bài tập giải tích", "Vẽ đồ thị phức tạp", "Thống kê ứng dụng"],
                           ["Giải tích cơ bản", "Đạo hàm", "Tích phân", "Hình học phân tích"],
                           ["Tư duy giải tích", "Phân tích toán học", "Ứng dụng thống kê"]),
                    Course("K12_LIT401", "Ngữ văn Lớp 10 - Văn học so sánh", "advanced", 3, 16, ["K12_LIT301"],
                           "Văn học so sánh và lý luận",
                           ["Văn học so sánh", "Lý luận văn học", "Chuẩn bị đại học"],
                           ["So sánh tác phẩm", "Nghiên cứu lý luận", "Viết luận văn học"],
                           ["Văn học so sánh", "Lý luận văn học", "Các trường phái văn học"],
                           ["Tư duy so sánh", "Nghiên cứu văn học", "Lý luận phê bình"]),
                    Course("K12_PHY401", "Vật lý Lớp 10 - Cơ học lượng tử", "advanced", 3, 16, ["K12_PHY301"],
                           "Cơ học lượng tử và vật lý hiện đại",
                           ["Cơ học lượng tử cơ bản", "Vật lý hiện đại", "Thuyết tương đối"],
                           ["Nghiên cứu lý thuyết", "Thí nghiệm hiện đại", "Báo cáo khoa học"],
                           ["Cơ học lượng tử", "Thuyết tương đối", "Vật lý hạt nhân"],
                           ["Tư duy khoa học hiện đại", "Nghiên cứu lý thuyết", "Hiểu biết vũ trụ"])
                ]
            
            elif level == "expert":
                courses = [
                    # High School Advanced (Grades 11-12)
                    Course("K12_MATH501", "Toán Lớp 11 - Giải tích nâng cao", "expert", 3, 16, ["K12_MATH401"],
                           "Giải tích nâng cao và chuẩn bị đại học",
                           ["Giải tích nâng cao", "Phương trình vi phân", "Tối ưu hóa"],
                           ["Giải bài tập nâng cao", "Nghiên cứu ứng dụng", "Chuẩn bị thi đại học"],
                           ["Giải tích đa biến", "Phương trình vi phân", "Tối ưu hóa"],
                           ["Tư duy toán học cao cấp", "Nghiên cứu độc lập", "Giải quyết vấn đề phức tạp"]),
                    Course("K12_LIT501", "Ngữ văn Lớp 11 - Văn học chuyên sâu", "expert", 3, 16, ["K12_LIT401"],
                           "Văn học chuyên sâu và nghiên cứu",
                           ["Văn học chuyên sâu", "Nghiên cứu tác phẩm", "Lý luận phê bình"],
                           ["Nghiên cứu chuyên sâu", "Viết luận văn học", "Thảo luận học thuật"],
                           ["Văn học chuyên sâu", "Các tác giả kinh điển", "Lý luận phê bình"],
                           ["Nghiên cứu văn học", "Tư duy phê bình sâu", "Kỹ năng học thuật"]),
                    
                    Course("K12_MATH601", "Toán Lớp 12 - Ôn tập thi đại học", "expert", 3, 16, ["K12_MATH501"],
                           "Ôn tập toàn diện và chuẩn bị thi đại học",
                           ["Ôn tập toàn diện", "Luyện thi đại học", "Giải quyết vấn đề"],
                           ["Luyện thi", "Giải đề thi", "Ôn tập chuyên sâu"],
                           ["Ôn tập toàn diện", "Các dạng bài toán thi", "Giải quyết vấn đề"],
                           ["Sẵn sàng thi cử", "Giải quyết vấn đề dưới áp lực", "Tư duy toán học tổng hợp"]),
                    Course("K12_LIT601", "Ngữ văn Lớp 12 - Ôn tập thi đại học", "expert", 3, 16, ["K12_LIT501"],
                           "Ôn tập văn học và chuẩn bị thi đại học",
                           ["Ôn tập toàn diện", "Luyện thi đại học", "Viết luận thi"],
                           ["Luyện viết luận", "Ôn tập tác phẩm", "Giải đề thi"],
                           ["Ôn tập toàn diện", "Các dạng đề thi", "Viết luận thi"],
                           ["Sẵn sàng thi cử", "Viết luận dưới áp lực", "Phân tích nhanh"])
                ]
        
        elif field == "computer_science":
            if level == "basic":
                courses = [
                    Course("CS101", "Introduction to Programming", "basic", 3, 16, [],
                           "Fundamentals of programming using Python",
                           ["Basic programming concepts", "Problem solving", "Code debugging"],
                           ["Programming assignments", "Quizzes", "Final project"],
                           ["Variables", "Control structures", "Functions", "Basic data structures"],
                           ["Python programming", "Problem solving", "Code organization"]),
                    Course("CS102", "Computer Fundamentals", "basic", 3, 16, [],
                           "Introduction to computer hardware and software",
                           ["Computer architecture", "Operating systems", "Network basics"],
                           ["Labs", "Written exams", "Practical tests"],
                           ["Hardware components", "OS concepts", "Network fundamentals", "Software installation"],
                           ["Computer literacy", "Hardware understanding", "OS usage"])
                ]
            elif level == "intermediate":
                courses = [
                    Course("CS201", "Data Structures and Algorithms", "intermediate", 4, 16, ["CS101"],
                           "Advanced data structures and algorithm analysis",
                           ["Complex data structures", "Algorithm design", "Performance analysis"],
                           ["Coding assignments", "Algorithm analysis", "Written exams"],
                           ["Arrays", "Linked lists", "Trees", "Graphs", "Sorting algorithms", "Dynamic programming"],
                           ["Algorithmic thinking", "Data structure selection", "Performance optimization"]),
                    Course("CS202", "Database Systems", "intermediate", 3, 16, ["CS101"],
                           "Introduction to database design and SQL",
                           ["Database design", "SQL programming", "Data modeling"],
                           ["Database projects", "SQL exams", "Design documentation"],
                           ["Relational model", "SQL queries", "Database design", "Normalization", "Transactions"],
                           ["Database design", "SQL programming", "Data modeling"])
                ]
            elif level == "advanced":
                courses = [
                    Course("CS301", "Machine Learning", "advanced", 4, 16, ["CS201", "CS202"],
                           "Introduction to machine learning algorithms",
                           ["ML algorithms", "Model evaluation", "Feature engineering"],
                           ["ML projects", "Algorithm implementations", "Research papers"],
                           ["Supervised learning", "Unsupervised learning", "Neural networks", "Model evaluation", "Feature engineering"],
                           ["Machine learning", "Data science", "Algorithm implementation"]),
                    Course("CS302", "Software Engineering", "advanced", 3, 16, ["CS201"],
                           "Advanced software development methodologies",
                           ["Software architecture", "Testing", "Project management"],
                           ["Software projects", "Architecture documentation", "Testing plans"],
                           ["Design patterns", "Agile methods", "Testing strategies", "DevOps", "Project management"],
                           ["Software architecture", "Team collaboration", "Quality assurance"])
                ]
            elif level == "expert":
                courses = [
                    Course("CS401", "Deep Learning and Neural Networks", "expert", 4, 16, ["CS301"],
                           "Advanced deep learning techniques",
                           ["Neural network architectures", "Deep learning frameworks", "Research methods"],
                           ["Research projects", "Paper implementations", "Conference presentations"],
                           ["CNN", "RNN", "Transformers", "GANs", "Reinforcement learning", "Research methodologies"],
                           ["Deep learning", "AI research", "Advanced algorithms"]),
                    Course("CS402", "Computer Vision", "expert", 4, 16, ["CS301"],
                           "Advanced computer vision and image processing",
                           ["Image processing", "Computer vision algorithms", "Deep learning for vision"],
                           ["Vision projects", "Algorithm implementations", "Research papers"],
                           ["Image processing", "Object detection", "Image segmentation", "Face recognition", "Medical imaging"],
                           ["Computer vision", "Image processing", "AI applications"])
                ]
        
        elif field == "business":
            if level == "basic":
                courses = [
                    Course("BUS101", "Introduction to Business", "basic", 3, 16, [],
                           "Fundamentals of business administration",
                           ["Business concepts", "Management basics", "Market analysis"],
                           ["Case studies", "Business plans", "Presentations"],
                           ["Business types", "Management functions", "Marketing basics", "Financial concepts"],
                           ["Business literacy", "Management skills", "Market understanding"]),
                    Course("BUS102", "Business Mathematics", "basic", 3, 16, [],
                           "Mathematical concepts for business",
                           ["Business calculations", "Statistics basics", "Financial math"],
                           ["Problem sets", "Case studies", "Exams"],
                           ["Percentages", "Interest calculations", "Statistics", "Probability", "Financial ratios"],
                           ["Business math", "Statistical thinking", "Financial calculations"])
                ]
        
        return courses
    
    async def create_learning_paths(self, field: str) -> Dict[str, List[str]]:
        if field == "k12_education":
            return {
                "elementary": ["K12_MATH101", "K12_VIET101", "K12_SCI101", "K12_MATH102", "K12_VIET102", "K12_MATH103", "K12_VIET103", "K12_MATH104", "K12_VIET104", "K12_MATH105", "K12_VIET105"],
                "middle_school": ["K12_MATH201", "K12_LIT201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH202", "K12_LIT202", "K12_MATH203", "K12_LIT203"],
                "high_school": ["K12_MATH301", "K12_LIT301", "K12_PHY301", "K12_CHEM301", "K12_MATH401", "K12_LIT401", "K12_PHY401"],
                "advanced_high_school": ["K12_MATH501", "K12_LIT501", "K12_MATH601", "K12_LIT601"]
            }
        else:
            return {
                "beginner": ["CS101", "CS102"],
                "intermediate": ["CS201", "CS202"],
                "advanced": ["CS301", "CS302"],
                "expert": ["CS401", "CS402"]
            }
