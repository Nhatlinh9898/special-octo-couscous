"""
Comprehensive Course Catalog Agent - Agent chuyên tạo danh sách môn học đầy đủ
Tạo môn học chi tiết cho tất cả cấp học và lĩnh vực từ cơ bản đến chuyên sâu
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
    lab_hours: int = 0
    lecture_hours: int = 0
    project_based: bool = False

class ComprehensiveCourseCatalogAgent(BaseAgent):
    def __init__(self):
        super().__init__("comprehensive_course_catalog", "llama3:70b-instruct")
        self.description = "Agent chuyên tạo danh sách môn học đầy đủ cho tất cả lĩnh vực"
        self.capabilities = [
            "generate_comprehensive_catalog",
            "create_degree_programs",
            "design_curriculum_paths",
            "map_career_outcomes",
            "create_specializations"
        ]
        
        self.course_levels = {
            "basic": {"level": 100, "difficulty": 1.0, "credits": 3, "duration": 16},
            "intermediate": {"level": 200, "difficulty": 2.0, "credits": 3-4, "duration": 16},
            "advanced": {"level": 300, "difficulty": 3.0, "credits": 3-4, "duration": 16},
            "expert": {"level": 400, "difficulty": 4.0, "credits": 4, "duration": 16}
        }
        
        self.academic_fields = {
            "k12_education": {
                "specializations": ["elementary", "middle_school", "high_school", "stem", "languages", "arts"],
                "total_courses": 60,
                "grade_levels": ["grade_1", "grade_2", "grade_3", "grade_4", "grade_5", "grade_6", "grade_7", "grade_8", "grade_9", "grade_10", "grade_11", "grade_12"]
            },
            "computer_science": {
                "specializations": ["ai_ml", "software_engineering", "cybersecurity", "data_science", "systems"],
                "total_courses": 40
            },
            "business_administration": {
                "specializations": ["finance", "marketing", "management", "accounting", "entrepreneurship"],
                "total_courses": 35
            },
            "engineering": {
                "specializations": ["mechanical", "electrical", "civil", "chemical", "biomedical"],
                "total_courses": 45
            },
            "sciences": {
                "specializations": ["physics", "chemistry", "biology", "mathematics", "statistics"],
                "total_courses": 38
            },
            "arts_humanities": {
                "specializations": ["literature", "history", "philosophy", "languages", "fine_arts"],
                "total_courses": 30
            },
            "social_sciences": {
                "specializations": ["psychology", "sociology", "economics", "political_science", "anthropology"],
                "total_courses": 32
            },
            "health_sciences": {
                "specializations": ["medicine", "nursing", "public_health", "pharmacy", "nutrition"],
                "total_courses": 42
            },
            "education": {
                "specializations": ["early_childhood", "secondary", "special_education", "educational_technology", "administration"],
                "total_courses": 28
            }
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if task == "generate_comprehensive_catalog":
            return await self.generate_comprehensive_catalog(data)
        elif task == "create_degree_programs":
            return await self.create_degree_programs(data)
        elif task == "design_curriculum_paths":
            return await self.design_curriculum_paths(data)
        elif task == "map_career_outcomes":
            return await self.map_career_outcomes(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def generate_comprehensive_catalog(self, data: Dict[str, Any]) -> Dict[str, Any]:
        fields = data.get("fields", list(self.academic_fields.keys()))
        levels = data.get("levels", ["basic", "intermediate", "advanced", "expert"])
        
        comprehensive_catalog = {}
        total_courses = 0
        
        for field in fields:
            if field in self.academic_fields:
                field_catalog = {}
                field_total = 0
                
                for level in levels:
                    courses = await self.generate_courses_for_field_and_level(field, level)
                    field_catalog[level] = [course.__dict__ for course in courses]
                    field_total += len(courses)
                
                comprehensive_catalog[field] = {
                    "catalog": field_catalog,
                    "specializations": self.academic_fields[field]["specializations"],
                    "total_courses": field_total,
                    "degree_programs": await self.create_degree_programs_for_field(field)
                }
                total_courses += field_total
        
        return self.format_response({
            "comprehensive_catalog": comprehensive_catalog,
            "total_fields": len(fields),
            "total_courses": total_courses,
            "academic_structure": await self.create_academic_structure(),
            "career_mappings": await self.create_career_mappings()
        }, confidence=0.95)
    
    async def generate_courses_for_field_and_level(self, field: str, level: str) -> List[Course]:
        courses = []
        
        if field == "k12_education":
            if level == "basic":
                courses = [
                    # Elementary School (Grades 1-5)
                    Course("K12_MATH101", "Toán Lớp 1 - Số đếm và phép cộng cơ bản", "basic", 2, 16, [],
                           "Giới thiệu số đếm, nhận biết số và phép cộng cơ bản cho học sinh lớp 1",
                           ["Đếm số từ 1-100", "Phép cộng trong phạm vi 10", "Nhận biết hình dạng cơ bản"],
                           ["Bài tập tập đếm", "Thực hành phép cộng", "Vẽ hình học", "Kiểm tra nhỏ"],
                           ["Số và đếm", "Phép cộng cơ bản", "Hình học cơ bản", "Đo lường đơn giản"],
                           ["Tư duy toán học", "Kỹ năng đếm", "Vận động tinh", "Logic cơ bản"],
                           lecture_hours=3, project_based=True),
                    Course("K12_VIET101", "Tiếng Việt Lớp 1 - Nhận biết chữ và đọc cơ bản", "basic", 3, 16, [],
                           "Học nhận biết chữ cái, luyện đọc và viết cơ bản cho học sinh lớp 1",
                           ["Đọc thành thạo 29 chữ cái", "Viết đúng nét chữ", "Tập làm văn ngắn"],
                           ["Thực hành đọc", "Luyện viết chữ", "Tập kể chuyện", "Kiểm tra đọc viết"],
                           ["Bảng chữ cái", "Nguyên âm và phụ âm", "Từ vựng cơ bản", "Câu đơn"],
                           ["Kỹ năng đọc viết", "Từ vựng", "Ngữ pháp cơ bản", "Kể chuyện"],
                           lecture_hours=4, project_based=True),
                    Course("K12_SCI101", "Tự nhiên Xã hội Lớp 1 - Thế giới xung quanh", "basic", 2, 16, [],
                           "Khám phá thế giới tự nhiên và xã hội gần gũi",
                           ["Nhận biết các loài cây, con", "Hiểu về gia đình, trường học", "Bảo vệ môi trường"],
                           ["Quan sát thực tế", "Vẽ tranh minh họa", "Thảo luận nhóm", "Dự án nhỏ"],
                           ["Cây cỏ, hoa lá", "Động vật quen thuộc", "Gia đình và bạn bè", "Trường lớp", "Vệ sinh cá nhân"],
                           ["Tư duy quan sát", "Yêu thiên nhiên", "Ý thức cộng đồng", "Kỹ năng tự phục vụ"],
                           lecture_hours=2, project_based=True),
                    
                    Course("K12_MATH102", "Toán Lớp 2 - Phép trừ và nhân cơ bản", "basic", 2, 16, ["K12_MATH101"],
                           "Phép trừ, phép nhân và các bài toán đố đơn giản",
                           ["Phép trừ trong phạm vi 100", "Bảng cửu chương", "Giải bài toán đố"],
                           ["Thực hành tính toán", "Giải bài tập", "Học trò chơi toán học", "Kiểm tra định kỳ"],
                           ["Phép trừ", "Bảng cửu chương", "Bài toán đố", "Đo lường"],
                           ["Tính nhẩm", "Giải quyết vấn đề", "Logic toán học", "Tư duy phản biện"],
                           lecture_hours=3),
                    Course("K12_VIET102", "Tiếng Việt Lớp 2 - Đọc hiểu và tập làm văn", "basic", 3, 16, ["K12_VIET101"],
                           "Phát triển kỹ năng đọc hiểu và tập làm văn ngắn",
                           ["Đọc hiểu truyện ngắn", "Viết đoạn văn 3-5 câu", "Tập viết thư"],
                           ["Thực hành đọc", "Luyện viết đoạn văn", "Tập kể chuyện", "Sáng tác nhỏ"],
                           ["Từ loại văn học", "Cấu trúc đoạn văn", "Dấu câu", "Từ vựng mở rộng"],
                           ["Kỹ năng đọc hiểu", "Viết sáng tác", "Ngữ pháp", "Diễn đạt"],
                           lecture_hours=4),
                    
                    Course("K12_MATH103", "Toán Lớp 3 - Phép chia và phân số cơ bản", "basic", 3, 16, ["K12_MATH102"],
                           "Phép chia, phân số và các phép toán phức tạp hơn",
                           ["Phép chia có dư", "Phân số cơ bản", "Các bài toán về thời gian"],
                           ["Thực hành phép chia", "Học phân số", "Giải bài toán thực tế", "Đồ án toán học"],
                           ["Phép chia", "Phân số", "Thời gian và lịch", "Diện tích cơ bản", "Số thập phân"],
                           ["Tư duy toán học", "Giải quyết vấn đề", "Tính toán chính xác", "Logic"],
                           lecture_hours=3),
                    Course("K12_VIET103", "Tiếng Việt Lớp 3 - Tập làm văn và ngữ pháp", "basic", 3, 16, ["K12_VIET102"],
                           "Hoàn thiện kỹ năng viết và học ngữ pháp cơ bản",
                           ["Viết văn tả", "Ngữ pháp câu", "Tập viết thơ", "Thuyết trình"],
                           ["Thực hành viết văn", "Học ngữ pháp", "Tập sáng tác", "Thuyết trình lớp"],
                           ["Các thể loại văn bản", "Ngữ pháp nâng cao", "Từ vựng phong phú", "Biểu đạt"],
                           ["Viết sáng tác", "Ngữ pháp", "Kỹ năng thuyết trình", "Tư duy văn học"],
                           lecture_hours=4),
                    
                    Course("K12_MATH104", "Toán Lớp 4 - Hình học và đại số cơ bản", "basic", 3, 16, ["K12_MATH103"],
                           "Hình học phẳng, đại số cơ bản và các bài toán phức tạp",
                           ["Hình học tam giác, hình chữ nhật", "Phương trình đơn giản", "Tính diện tích, thể tích"],
                           ["Vẽ hình học", "Giải phương trình", "Thực hành đo lường", "Dự án hình học"],
                           ["Hình học phẳng", "Phương trình đại số", "Diện tích và chu vi", "Thể tích", "Tỷ lệ"],
                           ["Tư duy không gian", "Giải quyết vấn đề", "Logic hình học", "Tính toán"],
                           lecture_hours=3),
                    Course("K12_VIET104", "Tiếng Việt Lớp 4 - Văn học và sáng tác", "basic", 3, 16, ["K12_VIET103"],
                           "Phân tích văn học và kỹ năng sáng tác văn bản",
                           ["Phân tích tác phẩm văn học", "Sáng tác truyện ngắn", "Viết báo cáo"],
                           ["Đọc và phân tích", "Thực hành sáng tác", "Thảo luận văn học", "Dự án đọc"],
                           ["Văn học Việt Nam", "Các thể loại sáng tác", "Phân tích tác phẩm", "Viết báo cáo"],
                           ["Phân tích văn học", "Sáng tác", "Tư duy phê bình", "Kỹ năng nghiên cứu"],
                           lecture_hours=4),
                    
                    Course("K12_MATH105", "Toán Lớp 5 - Ôn tập và nâng cao", "basic", 3, 16, ["K12_MATH104"],
                           "Ôn tập kiến thức toán tiểu học và chuẩn bị chuyển cấp",
                           ["Ôn tập toàn chương toán tiểu học", "Các bài toán tổng hợp", "Luyện thi chuyển cấp"],
                           ["Giải bài tập tổng hợp", "Luyện thi", "Dự án toán học", "Kiểm tra cuối kỳ"],
                           ["Tổng quan toán tiểu học", "Bài toán ứng dụng", "Lý thuyết số", "Hình học tổng hợp"],
                           ["Tư duy toán học tổng hợp", "Giải quyết vấn đề phức tạp", "Ôn tập và hệ thống hóa", "Tự tin"],
                           lecture_hours=3),
                    Course("K12_VIET105", "Tiếng Việt Lớp 5 - Văn học và chuẩn bị THCS", "basic", 3, 16, ["K12_VIET104"],
                           "Củng cố văn học và kỹ năng chuẩn bị cho trung học cơ sở",
                           ["Tổng quan văn học tiểu học", "Kỹ năng viết luận", "Thuyết trình nâng cao"],
                           ["Ôn tập văn học", "Thực hành viết luận", "Thuyết trình", "Dự án văn học"],
                           ["Tổng quan văn học", "Viết luận cơ bản", "Kỹ năng thuyết trình", "Ngữ pháp nâng cao"],
                           ["Phân tích văn học", "Viết luận", "Thuyết trình tự tin", "Sẵn sàng chuyển cấp"],
                           lecture_hours=4)
                ]
            
            elif level == "intermediate":
                courses = [
                    # Middle School (Grades 6-8)
                    Course("K12_MATH201", "Toán Lớp 6 - Số học và đại số", "intermediate", 3, 16, ["K12_MATH105"],
                           "Số học, tập hợp và đại số cơ bản trung học cơ sở",
                           ["Số học cơ bản", "Tập hợp", "Phương trình bậc nhất", "Hệ phương trình"],
                           ["Thực hành tính toán", "Giải phương trình", "Làm bài tập nhóm", "Kiểm tra định kỳ"],
                           ["Số tự nhiên và số nguyên", "Tập hợp và phép toán", "Phương trình bậc nhất", "Hệ phương trình bậc nhất", "Bất phương trình"],
                           ["Tư duy đại số", "Giải quyết vấn đề", "Logic toán học", "Kỹ năng tính toán"],
                           lecture_hours=3),
                    Course("K12_LIT201", "Ngữ văn Lớp 6 - Văn học trung học cơ sở", "intermediate", 3, 16, ["K12_VIET105"],
                           "Giới thiệu văn học trung học cơ sở và kỹ năng đọc hiểu văn bản",
                           ["Phân tích tác phẩm văn học", "Viết văn nghị luận", "Tìm hiểu thể loại"],
                           ["Đọc và phân tích", "Thực hành viết văn", "Thảo luận nhóm", "Dự án văn học"],
                           ["Văn học trung học cơ sở", "Các thể loại văn học", "Phân tích tác phẩm", "Viết nghị luận xã hội", "Viết nghị luận văn học"],
                           ["Phân tích văn học", "Viết nghị luận", "Tư duy phê bình", "Kỹ năng diễn đạt"],
                           lecture_hours=4),
                    Course("K12_PHY201", "Vật lý Lớp 6 - Cơ học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu vật lý cơ học và các định luật cơ bản",
                           ["Định luật Newton", "Lực và chuyển động", "Công và công suất", "Năng lượng"],
                           ["Thí nghiệm vật lý", "Giải bài tập cơ học", "Làm đồ án khoa học", "Báo cáo thực nghiệm"],
                           ["Chuyển động và lực", "Định luật Newton", "Công và năng lượng", "Động lượng và động năng", "Đàn hồi và sóng cơ"],
                           ["Tư duy khoa học", "Kỹ năng thực nghiệm", "Giải quyết vấn đề", "Logic vật lý"],
                           lab_hours=2, lecture_hours=3),
                    Course("K12_CHEM201", "Hóa học Lớp 6 - Hóa học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu hóa học và các phản ứng hóa học cơ bản",
                           ["Cấu trúc nguyên tử", "Phản ứng hóa học", "Các hợp chất cơ bản"],
                           ["Thí nghiệm hóa học", "Luyện tập phản ứng", "Viết báo cáo", "Dự án hóa học"],
                           ["Nguyên tử và phân tử", "Biểu tượng hóa học", "Phản ứng hóa học", "Các hợp chất quan trọng", "Hóa học và đời sống"],
                           ["Tư duy hóa học", "Kỹ năng thí nghiệm", "An toàn hóa học", "Ứng dụng thực tế"],
                           lab_hours=2, lecture_hours=3),
                    Course("K12_BIO201", "Sinh học Lớp 6 - Sinh học cơ bản", "intermediate", 3, 16, [],
                           "Giới thiệu sinh học và các quá trình sống cơ bản",
                           ["Tế bào và cấu trúc", "Các quá trình sống", "Phân loại sinh vật"],
                           ["Quan sát dưới kính hiển vi", "Thí nghiệm sinh học", "Lập biểu đồ", "Dự án sinh học"],
                           ["Tế bào", "Các quá trình sống", "Đa dạng sinh học", "Sinh thái học cơ bản", "Di truyền học cơ bản"],
                           ["Tư duy sinh học", "Kỹ năng quan sát", "Phân loại và hệ thống", "Ý thức môi trường"],
                           lab_hours=2, lecture_hours=3),
                    
                    Course("K12_MATH202", "Toán Lớp 7 - Hình học và thống kê", "intermediate", 3, 16, ["K12_MATH201"],
                           "Hình học phẳng, không gian và thống kê cơ bản",
                           ["Hình học phẳng nâng cao", "Hình học không gian", "Thống kê cơ bản"],
                           ["Vẽ hình học", "Thực hành thống kê", "Giải bài tập hình học", "Dự án thống kê"],
                           ["Hình học phẳng", "Hình học không gian", "Thống kê và xác suất", "Tọa độ", "Đo lường"],
                           ["Tư duy không gian", "Phân tích dữ liệu", "Logic hình học", "Thống kê"],
                           lecture_hours=3),
                    Course("K12_LIT202", "Ngữ văn Lớp 7 - Văn học Việt Nam hiện đại", "intermediate", 3, 16, ["K12_LIT201"],
                           "Văn học Việt Nam hiện đại và các tác phẩm tiêu biểu",
                           ["Văn học Việt Nam hiện đại", "Phân tích tác phẩm", "Viết văn sáng tạo"],
                           ["Đọc và phân tích", "Thực hành viết văn", "Thảo luận tác phẩm", "Dự án sáng tạo"],
                           ["Văn học Việt Nam hiện đại", "Các tác giả tiêu biểu", "Phân tích tác phẩm", "Viết sáng tạo", "Văn học và đời sống"],
                           ["Phân tích văn học", "Sáng tác", "Tư duy phản biện", "Hiểu biết văn hóa"],
                           lecture_hours=4),
                    Course("K12_PHY202", "Vật lý Lớp 7 - Nhiệt học và quang học", "intermediate", 3, 16, ["K12_PHY201"],
                           "Nhiệt học, quang học và các hiện tượng vật lý khác",
                           ["Nhiệt học và nhiệt động học", "Quang học cơ bản", "Điện học cơ bản"],
                           ["Thí nghiệm nhiệt học", "Thực hành quang học", "Lắp mạch điện cơ bản", "Báo cáo thực nghiệm"],
                           ["Nhiệt và nhiệt độ", "Định luật nhiệt động học", "Ánh sáng và phản xạ", "Khúc xạ và lăng kính", "Điện học cơ bản"],
                           ["Tư duy vật lý", "Kỹ năng thí nghiệm", "Ứng dụng thực tế", "Giải quyết vấn đề"],
                           lab_hours=2, lecture_hours=3),
                    
                    Course("K12_MATH203", "Toán Lớp 8 - Đại số và hình học nâng cao", "intermediate", 3, 16, ["K12_MATH202"],
                           "Đại số nâng cao và hình học phân tích cơ bản",
                           ["Đa thức và phương trình bậc hai", "Hình học phân tích", "Hàm số cơ bản"],
                           ["Giải phương trình bậc hai", "Vẽ đồ thị", "Hệ thống hóa kiến thức", "Luyện thi"],
                           ["Đa thức", "Phương trình bậc hai", "Hình học phân tích", "Hàm số", "Lượng giác cơ bản"],
                           ["Tư duy đại số", "Phân tích đồ thị", "Logic toán học", "Giải quyết vấn đề phức tạp"],
                           lecture_hours=3),
                    Course("K12_LIT203", "Ngữ văn Lớp 8 - Văn học nước ngoài và sáng tác", "intermediate", 3, 16, ["K12_LIT202"],
                           "Văn học nước ngoài và kỹ năng sáng tác văn học",
                           ["Văn học nước ngoài", "Sáng tác văn học", "Phê bình văn học"],
                           ["Đọc và phân tích", "Thực hành sáng tác", "Viết phê bình", "Dự án văn học"],
                           ["Văn học nước ngoài", "Các thể loại văn học quốc tế", "Sáng tác văn học", "Phê bình và bình luận", "Văn học so sánh"],
                           ["Hiểu biết văn hóa thế giới", "Sáng tác", "Phê bình văn học", "Tư duy toàn cầu"],
                           lecture_hours=4)
                ]
            
            elif level == "advanced":
                courses = [
                    # High School (Grades 9-10)
                    Course("K12_MATH301", "Toán Lớp 9 - Đại số nâng cao và lượng giác", "advanced", 3, 16, ["K12_MATH203"],
                           "Đại số nâng cao, lượng giác và chuẩn bị thi chuyển cấp",
                           ["Đại số nâng cao", "Lượng giác", "Hình học không gian", "Chuẩn bị thi"],
                           ["Giải bài tập nâng cao", "Luyện thi", "Dự án toán học", "Kiểm tra tổng hợp"],
                           ["Đa thức nâng cao", "Lượng giác", "Hình học không gian", "Tổ hợp và xác suất", "Chuẩn bị thi THPT"],
                           ["Tư duy toán học nâng cao", "Giải quyết vấn đề phức tạp", "Logic toán học", "Sẵn sàng thi cử"],
                           lecture_hours=3),
                    Course("K12_LIT301", "Ngữ văn Lớp 9 - Văn học và xã hội", "advanced", 3, 16, ["K12_LIT203"],
                           "Văn học và các vấn đề xã hội, chuẩn bị thi chuyển cấp",
                           ["Văn học và xã hội", "Phân tích tác phẩm sâu", "Viết luận nâng cao"],
                           ["Phân tích tác phẩm", "Thảo luận xã hội", "Viết luận nâng cao", "Dự án văn học"],
                           ["Văn học và xã hội", "Phân tích tác phẩm sâu", "Viết luận xã hội", "Văn học đương đại", "Chuẩn bị thi THPT"],
                           ["Tư duy phê bình sâu", "Hiểu biết xã hội", "Viết luận nâng cao", "Nhận thức văn học"],
                           lecture_hours=4),
                    Course("K12_PHY301", "Vật lý Lớp 9 - Điện học và từ học", "advanced", 3, 16, ["K12_PHY202"],
                           "Điện học, từ học và các ứng dụng trong đời sống",
                           ["Điện học nâng cao", "Từ học", "Điện từ học", "Ứng dụng điện"],
                           ["Thí nghiệm điện học", "Lắp mạch phức tạp", "Nghiên cứu ứng dụng", "Báo cáo khoa học"],
                           ["Điện trường và dòng điện", "Định luật Ohm", "Từ trường", "Điện từ cảm ứng", "Ứng dụng điện tử"],
                           ["Tư duy vật lý nâng cao", "Kỹ năng thí nghiệm", "Ứng dụng công nghệ", "Giải quyết vấn đề"],
                           lab_hours=2, lecture_hours=3),
                    Course("K12_CHEM301", "Hóa học Lớp 9 - Hóa học hữu cơ", "advanced", 3, 16, ["K12_CHEM201"],
                           "Hóa học hữu cơ và các phản ứng hóa học phức tạp",
                           ["Hóa học hữu cơ cơ bản", "Các phản ứng quan trọng", "Polyme và nhựa"],
                           ["Thí nghiệm hóa hữu cơ", "Tổng hợp chất hữu cơ", "Nghiên cứu polyme", "Báo cáo hóa học"],
                           ["Hóa học hữu cơ", "Cacbon và hợp chất", "Các phản ứng quan trọng", "Polyme", "Hóa học và môi trường"],
                           ["Tư duy hóa học nâng cao", "Kỹ năng thí nghiệm", "Ý thức môi trường", "Ứng dụng thực tế"],
                           lab_hours=2, lecture_hours=3),
                    
                    Course("K12_MATH401", "Toán Lớp 10 - Giải tích và hình học", "advanced", 3, 16, ["K12_MATH301"],
                           "Giải tích cơ bản và hình học nâng cao",
                           ["Giải tích cơ bản", "Hình học phân tích", "Xác suất thống kê"],
                           ["Giải bài tập giải tích", "Vẽ đồ thị phức tạp", "Thống kê ứng dụng", "Dự án toán học"],
                           ["Giải tích cơ bản", "Đạo hàm", "Tích phân", "Hình học phân tích", "Xác suất nâng cao"],
                           ["Tư duy giải tích", "Phân tích toán học", "Ứng dụng thống kê", "Logic toán học cao cấp"],
                           lecture_hours=3),
                    Course("K12_LIT401", "Ngữ văn Lớp 10 - Văn học so sánh và lý luận", "advanced", 3, 16, ["K12_LIT301"],
                           "Văn học so sánh, lý luận văn học và chuẩn bị đại học",
                           ["Văn học so sánh", "Lý luận văn học", "Chuẩn bị đại học"],
                           ["So sánh tác phẩm", "Nghiên cứu lý luận", "Viết luận văn học", "Dự án nghiên cứu"],
                           ["Văn học so sánh", "Lý luận văn học", "Các trường phái văn học", "Nghiên cứu văn học", "Chuẩn bị đại học"],
                           ["Tư duy so sánh", "Nghiên cứu văn học", "Lý luận phê bình", "Sẵn sàng đại học"],
                           lecture_hours=4),
                    Course("K12_PHY401", "Vật lý Lớp 10 - Cơ học lượng tử và hiện đại", "advanced", 3, 16, ["K12_PHY301"],
                           "Cơ học lượng tử, vật lý hiện đại và các lý thuyết mới",
                           ["Cơ học lượng tử cơ bản", "Vật lý hiện đại", "Thuyết tương đối"],
                           ["Nghiên cứu lý thuyết", "Thí nghiệm hiện đại", "Báo cáo khoa học", "Dự án nghiên cứu"],
                           ["Cơ học lượng tử", "Thuyết tương đối", "Vật lý hạt nhân", "Vật lý thiên văn", "Vật lý hiện đại"],
                           ["Tư duy khoa học hiện đại", "Nghiên cứu lý thuyết", "Hiểu biết vũ trụ", "Sẵn sàng đại học"],
                           lab_hours=2, lecture_hours=3)
                ]
            
            elif level == "expert":
                courses = [
                    # High School Advanced (Grades 11-12)
                    Course("K12_MATH501", "Toán Lớp 11 - Giải tích nâng cao", "expert", 3, 16, ["K12_MATH401"],
                           "Giải tích nâng cao và chuẩn bị đại học",
                           ["Giải tích nâng cao", "Phương trình vi phân", "Tối ưu hóa"],
                           ["Giải bài tập nâng cao", "Nghiên cứu ứng dụng", "Dự án toán học", "Chuẩn bị thi đại học"],
                           ["Giải tích đa biến", "Phương trình vi phân", "Tối ưu hóa", "Giải tích số", "Chuẩn bị đại học"],
                           ["Tư duy toán học cao cấp", "Nghiên cứu độc lập", "Giải quyết vấn đề phức tạp", "Sẵn sàng đại học"],
                           lecture_hours=3),
                    Course("K12_LIT501", "Ngữ văn Lớp 11 - Văn học chuyên sâu", "expert", 3, 16, ["K12_LIT401"],
                           "Văn học chuyên sâu và nghiên cứu tác phẩm",
                           ["Văn học chuyên sâu", "Nghiên cứu tác phẩm", "Lý luận phê bình"],
                           ["Nghiên cứu chuyên sâu", "Viết luận văn học", "Thảo luận học thuật", "Dự án nghiên cứu"],
                           ["Văn học chuyên sâu", "Các tác giả kinh điển", "Lý luận phê bình", "Nghiên cứu tác phẩm", "Chuẩn bị đại học"],
                           ["Nghiên cứu văn học", "Tư duy phê bình sâu", "Kỹ năng học thuật", "Sẵn sàng đại học"],
                           lecture_hours=4),
                    Course("K12_SCI501", "Khoa học Lớp 11 - Nghiên cứu khoa học", "expert", 3, 16, ["K12_PHY401", "K12_CHEM301"],
                           "Nghiên cứu khoa học và các dự án thực tế",
                           ["Phương pháp nghiên cứu", "Dự án khoa học", "Thống kê khoa học"],
                           ["Thực hiện dự án", "Thống kê dữ liệu", "Viết báo cáo khoa học", "Thuyết trình nghiên cứu"],
                           ["Phương pháp nghiên cứu", "Thiết kế thực nghiệm", "Thống kê khoa học", "Đạo đức khoa học", "Ứng dụng thực tế"],
                           ["Nghiên cứu khoa học", "Tư duy phản biện", "Kỹ năng thực nghiệm", "Sẵn sàng đại học"],
                           lab_hours=3, lecture_hours=2, project_based=True),
                    
                    Course("K12_MATH601", "Toán Lớp 12 - Ôn tập và thi đại học", "expert", 3, 16, ["K12_MATH501"],
                           "Ôn tập toàn diện và chuẩn bị thi đại học",
                           ["Ôn tập toàn diện", "Luyện thi đại học", "Giải quyết vấn đề"],
                           ["Luyện thi", "Giải đề thi", "Ôn tập chuyên sâu", "Kiểm tra mô phỏng"],
                           ["Ôn tập toàn diện", "Các dạng bài toán thi", "Giải quyết vấn đề", "Chuẩn bị tâm lý thi", "Kỹ năng làm bài"],
                           ["Sẵn sàng thi cử", "Giải quyết vấn đề dưới áp lực", "Tư duy toán học tổng hợp", "Tự tin"],
                           lecture_hours=3),
                    Course("K12_LIT601", "Ngữ văn Lớp 12 - Ôn tập và thi đại học", "expert", 3, 16, ["K12_LIT501"],
                           "Ôn tập văn học và chuẩn bị thi đại học",
                           ["Ôn tập toàn diện", "Luyện thi đại học", "Viết luận thi"],
                           ["Luyện viết luận", "Ôn tập tác phẩm", "Giải đề thi", "Thảo luận chiến lược thi"],
                           ["Ôn tập toàn diện", "Các dạng đề thi", "Viết luận thi", "Chiến lược làm bài", "Chuẩn bị tâm lý"],
                           ["Sẵn sàng thi cử", "Viết luận dưới áp lực", "Phân tích nhanh", "Tự tin"],
                           lecture_hours=4),
                    Course("K12_SCI601", "Khoa học Lớp 12 - Dự án nghiên cứu cuối cấp", "expert", 3, 16, ["K12_SCI501"],
                           "Dự án nghiên cứu khoa học cuối cấp",
                           ["Dự án nghiên cứu cá nhân", "Thực hiện nghiên cứu", "Báo cáo khoa học"],
                           ["Thực hiện dự án", "Thu thập dữ liệu", "Phân tích kết quả", "Bảo vệ dự án"],
                           ["Nghiên cứu độc lập", "Thiết kế nghiên cứu", "Thống kê nâng cao", "Báo cáo khoa học", "Chuẩn bị đại học"],
                           ["Nghiên cứu độc lập", "Tư duy khoa học", "Kỹ năng báo cáo", "Sẵn sàng đại học"],
                           lab_hours=3, lecture_hours=2, project_based=True)
                ]
        
        elif field == "computer_science":
            if level == "basic":
                courses = [
                    Course("CS101", "Introduction to Computer Science", "basic", 3, 16, [],
                           "Fundamentals of computer science and programming concepts",
                           ["Understand computer science fundamentals", "Basic programming skills", "Problem-solving techniques"],
                           ["Programming assignments", "Written exams", "Lab exercises", "Final project"],
                           ["Computer history", "Binary systems", "Programming basics", "Internet fundamentals", "Ethics in computing"],
                           ["Computational thinking", "Basic programming", "Digital literacy"],
                           lab_hours=2, lecture_hours=3),
                    Course("CS102", "Programming Fundamentals", "basic", 4, 16, ["CS101"],
                           "Introduction to programming using Python",
                           ["Master Python programming", "Develop algorithms", "Debug code effectively"],
                           ["Coding projects", "Algorithm challenges", "Code reviews", "Practical exams"],
                           ["Variables and data types", "Control structures", "Functions", "Basic data structures", "File handling", "Error handling"],
                           ["Python programming", "Algorithm design", "Code debugging", "Problem solving"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS103", "Discrete Mathematics", "basic", 3, 16, [],
                           "Mathematical foundations for computer science",
                           ["Understand discrete structures", "Apply mathematical reasoning", "Proof techniques"],
                           ["Mathematical proofs", "Problem sets", "Logical exercises", "Written exams"],
                           ["Logic", "Sets", "Functions", "Relations", "Graphs", "Combinatorics", "Probability basics"],
                           ["Mathematical reasoning", "Logical thinking", "Proof techniques"],
                           lecture_hours=4),
                    Course("CS104", "Computer Architecture", "basic", 3, 16, ["CS101"],
                           "Introduction to computer hardware and organization",
                           ["Understand computer architecture", "Assembly programming", "Hardware-software interaction"],
                           ["Lab assignments", "Assembly projects", "Hardware simulations", "Written exams"],
                           ["Digital logic", "CPU organization", "Memory systems", "Instruction sets", "Assembly language", "Performance metrics"],
                           ["Hardware understanding", "Assembly programming", "System architecture"],
                           lab_hours=2, lecture_hours=3)
                ]
            
            elif level == "intermediate":
                courses = [
                    Course("CS201", "Data Structures and Algorithms", "intermediate", 4, 16, ["CS102", "CS103"],
                           "Advanced data structures and algorithm analysis",
                           ["Master data structures", "Analyze algorithm complexity", "Design efficient algorithms"],
                           ["Algorithm implementations", "Complexity analysis", "Programming contests", "Research projects"],
                           ["Arrays and linked lists", "Stacks and queues", "Trees", "Graphs", "Hash tables", "Sorting algorithms", "Search algorithms", "Dynamic programming", "Greedy algorithms"],
                           ["Algorithmic thinking", "Data structure selection", "Performance optimization", "Problem solving"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS202", "Object-Oriented Programming", "intermediate", 3, 16, ["CS102"],
                           "Object-oriented design and programming principles",
                           ["Master OOP concepts", "Design class hierarchies", "Implement design patterns"],
                           ["OOP projects", "Design pattern implementations", "Code reviews", "Team projects"],
                           ["Classes and objects", "Inheritance", "Polymorphism", "Encapsulation", "Design patterns", "UML", "Software design principles"],
                           ["Object-oriented design", "Software architecture", "Design patterns", "Team programming"],
                           lab_hours=2, lecture_hours=3, project_based=True),
                    Course("CS203", "Database Systems", "intermediate", 3, 16, ["CS102"],
                           "Database design, implementation, and management",
                           ["Design relational databases", "Write complex SQL queries", "Understand database architecture"],
                           ["Database projects", "SQL assignments", "Design documentation", "Performance tuning"],
                           ["Relational model", "SQL", "Database design", "Normalization", "Transactions", "Indexing", "Query optimization", "NoSQL basics"],
                           ["Database design", "SQL programming", "Data modeling", "Performance tuning"],
                           lab_hours=2, lecture_hours=3),
                    Course("CS204", "Operating Systems", "intermediate", 4, 16, ["CS102", "CS104"],
                           "Operating system principles and implementation",
                           ["Understand OS concepts", "Process management", "Memory management", "File systems"],
                           ["OS projects", "System programming", "Kernel development", "Performance analysis"],
                           ["Process management", "Memory management", "File systems", "I/O systems", "Synchronization", "Deadlocks", "Security", "Virtualization"],
                           ["System programming", "OS concepts", "Resource management", "System design"],
                           lab_hours=3, lecture_hours=3)
                ]
            
            elif level == "advanced":
                courses = [
                    Course("CS301", "Machine Learning", "advanced", 4, 16, ["CS201", "CS203"],
                           "Introduction to machine learning algorithms and applications",
                           ["Understand ML algorithms", "Implement ML models", "Evaluate model performance"],
                           ["ML projects", "Algorithm implementations", "Research papers", "Model evaluations"],
                           ["Supervised learning", "Unsupervised learning", "Neural networks", "Model evaluation", "Feature engineering", "Ensemble methods", "Deep learning basics"],
                           ["Machine learning", "Data science", "Statistical analysis", "Algorithm implementation"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS302", "Software Engineering", "advanced", 3, 16, ["CS202"],
                           "Advanced software development methodologies and practices",
                           ["Design software architecture", "Apply design patterns", "Manage software projects"],
                           ["Software projects", "Architecture documentation", "Testing strategies", "Agile practices"],
                           ["Software lifecycle", "Requirements engineering", "Design patterns", "Testing strategies", "Agile methods", "DevOps", "Project management", "Quality assurance"],
                           ["Software architecture", "Project management", "Quality assurance", "Team collaboration"],
                           lab_hours=2, lecture_hours=3, project_based=True),
                    Course("CS303", "Computer Networks", "advanced", 4, 16, ["CS204"],
                           "Network protocols, architectures, and applications",
                           ["Understand network protocols", "Design network applications", "Network security basics"],
                           ["Network projects", "Protocol implementations", "Network programming", "Security analysis"],
                           ["Network models", "TCP/IP", "Routing", "Application protocols", "Network programming", "Wireless networks", "Network security", "Cloud networking"],
                           ["Network programming", "Protocol understanding", "Network design", "Security awareness"],
                           lab_hours=3, lecture_hours=3),
                    Course("CS304", "Artificial Intelligence", "advanced", 4, 16, ["CS201", "CS103"],
                           "Artificial intelligence principles and techniques",
                           ["Understand AI concepts", "Implement AI algorithms", "Solve complex problems"],
                           ["AI projects", "Algorithm implementations", "Problem solving", "Research papers"],
                           ["Search algorithms", "Knowledge representation", "Reasoning", "Planning", "Natural language processing", "Computer vision", "Robotics", "Ethics in AI"],
                           ["AI algorithms", "Problem solving", "Knowledge representation", "Ethical reasoning"],
                           lab_hours=2, lecture_hours=3, project_based=True)
                ]
            
            elif level == "expert":
                courses = [
                    Course("CS401", "Deep Learning and Neural Networks", "expert", 4, 16, ["CS301"],
                           "Advanced deep learning architectures and applications",
                           ["Design neural network architectures", "Implement deep learning models", "Research new techniques"],
                           ["Research projects", "Paper implementations", "Conference presentations", "Model innovations"],
                           ["CNN", "RNN", "Transformers", "GANs", "Reinforcement learning", "Transfer learning", "AutoML", "Research methodologies"],
                           ["Deep learning", "AI research", "Advanced algorithms", "Research skills"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS402", "Computer Vision", "expert", 4, 16, ["CS301", "CS304"],
                           "Advanced computer vision and image processing techniques",
                           ["Implement vision algorithms", "Design vision systems", "Research vision applications"],
                           ["Vision projects", "Algorithm implementations", "Research papers", "System designs"],
                           ["Image processing", "Object detection", "Image segmentation", "Face recognition", "Medical imaging", "Autonomous vehicles", "3D vision", "Video analysis"],
                           ["Computer vision", "Image processing", "AI applications", "Research methods"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS403", "Cybersecurity", "expert", 4, 16, ["CS303", "CS204"],
                           "Advanced cybersecurity principles and practices",
                           ["Understand security threats", "Implement security measures", "Design secure systems"],
                           ["Security projects", "Penetration testing", "Security audits", "Research papers"],
                           ["Cryptography", "Network security", "Application security", "System security", "Ethical hacking", "Security policies", "Incident response", "Digital forensics"],
                           ["Cybersecurity", "Security design", "Risk assessment", "Ethical hacking"],
                           lab_hours=3, lecture_hours=3, project_based=True),
                    Course("CS404", "Distributed Systems", "expert", 4, 16, ["CS204", "CS303"],
                           "Design and implementation of distributed systems",
                           ["Design distributed architectures", "Implement distributed algorithms", "Handle distributed challenges"],
                           ["Distributed projects", "System implementations", "Performance analysis", "Research papers"],
                           ["Distributed architectures", "Consensus algorithms", "Distributed databases", "Cloud computing", "Microservices", "Blockchain", "Scalability", "Fault tolerance"],
                           ["Distributed systems", "System design", "Scalability", "Fault tolerance"],
                           lab_hours=3, lecture_hours=3, project_based=True)
                ]
        
        elif field == "business_administration":
            if level == "basic":
                courses = [
                    Course("BUS101", "Introduction to Business", "basic", 3, 16, [],
                           "Fundamentals of business administration and management",
                           ["Understand business concepts", "Analyze business environments", "Basic management skills"],
                           ["Case studies", "Business plans", "Presentations", "Market analysis"],
                           ["Business types", "Management functions", "Marketing basics", "Financial concepts", "Business ethics", "Global business"],
                           ["Business literacy", "Management skills", "Market understanding", "Ethical awareness"],
                           lecture_hours=3),
                    Course("BUS102", "Business Mathematics", "basic", 3, 16, [],
                           "Mathematical concepts and applications in business",
                           ["Apply mathematical concepts", "Business calculations", "Statistical analysis"],
                           ["Problem sets", "Case studies", "Financial calculations", "Statistical projects"],
                           ["Percentages", "Interest calculations", "Statistics", "Probability", "Financial ratios", "Break-even analysis", "Forecasting"],
                           ["Business math", "Statistical thinking", "Financial calculations", "Analytical skills"],
                           lecture_hours=4),
                    Course("BUS103", "Principles of Economics", "basic", 3, 16, [],
                           "Micro and macroeconomics fundamentals",
                           ["Understand economic principles", "Analyze market behavior", "Economic decision making"],
                           ["Economic analysis", "Market studies", "Policy analysis", "Case discussions"],
                           ["Supply and demand", "Market structures", "GDP", "Inflation", "Unemployment", "Fiscal policy", "Monetary policy"],
                           ["Economic thinking", "Market analysis", "Policy understanding", "Decision making"],
                           lecture_hours=3),
                    Course("BUS104", "Business Communication", "basic", 3, 16, [],
                           "Effective communication in business contexts",
                           ["Develop communication skills", "Professional writing", "Presentation skills"],
                           ["Writing assignments", "Presentations", "Team projects", "Communication exercises"],
                           ["Business writing", "Public speaking", "Interpersonal communication", "Digital communication", "Cross-cultural communication", "Negotiation"],
                           ["Communication skills", "Professional writing", "Presentation skills", "Team collaboration"],
                           lecture_hours=3)
                ]
            
            elif level == "intermediate":
                courses = [
                    Course("BUS201", "Financial Accounting", "intermediate", 4, 16, ["BUS102"],
                           "Financial accounting principles and practices",
                           ["Prepare financial statements", "Analyze financial data", "Accounting standards"],
                           ["Accounting projects", "Financial analysis", "Case studies", "Auditing exercises"],
                           ["Accounting principles", "Financial statements", "Revenue recognition", "Asset valuation", "Liability accounting", "Equity accounting", "Financial analysis"],
                           ["Accounting skills", "Financial analysis", "Regulatory compliance", "Attention to detail"],
                           lecture_hours=4),
                    Course("BUS202", "Marketing Management", "intermediate", 3, 16, ["BUS101"],
                           "Strategic marketing principles and practices",
                           ["Develop marketing strategies", "Market research", "Brand management"],
                           ["Marketing plans", "Research projects", "Campaign development", "Case analysis"],
                           ["Marketing strategy", "Consumer behavior", "Market research", "Digital marketing", "Brand management", "Pricing strategies", "Distribution channels"],
                           ["Marketing strategy", "Research skills", "Brand management", "Digital marketing"],
                           lecture_hours=3),
                    Course("BUS203", "Organizational Behavior", "intermediate", 3, 16, ["BUS101"],
                           "Human behavior in organizations",
                           ["Understand organizational dynamics", "Leadership principles", "Team management"],
                           ["Behavioral analysis", "Leadership projects", "Team exercises", "Case studies"],
                           ["Individual behavior", "Group dynamics", "Leadership", "Motivation", "Communication", "Organizational culture", "Change management"],
                           ["Leadership skills", "Team management", "Organizational understanding", "Behavioral analysis"],
                           lecture_hours=3),
                    Course("BUS204", "Business Statistics", "intermediate", 3, 16, ["BUS102"],
                           "Statistical methods for business decision making",
                           ["Apply statistical methods", "Data analysis", "Statistical inference"],
                           ["Statistical projects", "Data analysis", "Hypothesis testing", "Regression analysis"],
                           ["Descriptive statistics", "Probability distributions", "Hypothesis testing", "Regression analysis", "Time series", "Quality control", "Decision analysis"],
                           ["Statistical analysis", "Data interpretation", "Decision making", "Quality control"],
                           lab_hours=2, lecture_hours=3)
                ]
        
        elif field == "engineering":
            if level == "basic":
                courses = [
                    Course("ENG101", "Engineering Mathematics", "basic", 4, 16, [],
                           "Mathematical foundations for engineering",
                           ["Apply mathematical concepts", "Engineering calculations", "Problem solving"],
                           ["Mathematical problems", "Engineering applications", "Computational projects"],
                           ["Calculus", "Linear algebra", "Differential equations", "Complex numbers", "Vector analysis", "Numerical methods"],
                           ["Mathematical skills", "Problem solving", "Engineering applications", "Computational thinking"],
                           lecture_hours=4),
                    Course("ENG102", "Engineering Physics", "basic", 3, 16, [],
                           "Physics principles for engineering applications",
                           ["Understand physics concepts", "Apply physics to engineering", "Laboratory skills"],
                           ["Physics experiments", "Engineering applications", "Problem solving", "Lab reports"],
                           ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern physics", "Laboratory techniques"],
                           ["Physics understanding", "Experimental skills", "Engineering applications", "Problem solving"],
                           lab_hours=3, lecture_hours=3),
                    Course("ENG103", "Engineering Drawing", "basic", 3, 16, [],
                           "Technical drawing and CAD fundamentals",
                           ["Create technical drawings", "Use CAD software", "Engineering visualization"],
                           ["Drawing projects", "CAD assignments", "Technical documentation", "Design exercises"],
                           ["Technical drawing", "CAD software", "3D modeling", "Engineering standards", "Dimensioning", "Assembly drawing"],
                           ["Technical drawing", "CAD skills", "Visualization", "Design communication"],
                           lab_hours=4, lecture_hours=2),
                    Course("ENG104", "Introduction to Engineering", "basic", 2, 16, [],
                           "Engineering disciplines and professional practice",
                           ["Understand engineering fields", "Professional ethics", "Engineering design process"],
                           ["Field research", "Design projects", "Ethics analysis", "Professional development"],
                           ["Engineering disciplines", "Design process", "Engineering ethics", "Sustainability", "Project management", "Communication"],
                           ["Engineering awareness", "Professional ethics", "Design thinking", "Sustainability"],
                           lecture_hours=2)
                ]
        
        elif field == "sciences":
            if level == "basic":
                courses = [
                    Course("SCI101", "General Chemistry", "basic", 4, 16, [],
                           "Fundamental concepts of chemistry",
                           ["Understand chemical principles", "Laboratory techniques", "Chemical calculations"],
                           ["Lab experiments", "Chemical calculations", "Problem solving", "Lab reports"],
                           ["Atomic structure", "Chemical bonding", "Reactions", "Stoichiometry", "Thermodynamics", "Kinetics", "Equilibrium"],
                           ["Chemical understanding", "Lab skills", "Problem solving", "Safety awareness"],
                           lab_hours=3, lecture_hours=3),
                    Course("SCI102", "General Physics", "basic", 4, 16, [],
                           "Fundamental concepts of physics",
                           ["Understand physical laws", "Problem solving", "Experimental methods"],
                           ["Physics experiments", "Problem sets", "Lab reports", "Data analysis"],
                           ["Mechanics", "Thermodynamics", "Waves", "Electricity", "Magnetism", "Optics", "Modern physics"],
                           ["Physics understanding", "Problem solving", "Experimental skills", "Data analysis"],
                           lab_hours=3, lecture_hours=3),
                    Course("SCI103", "Biology", "basic", 4, 16, [],
                           "Fundamental concepts of biological sciences",
                           ["Understand biological principles", "Laboratory techniques", "Scientific method"],
                           ["Lab experiments", "Biological analysis", "Research projects", "Scientific writing"],
                           ["Cell biology", "Genetics", "Evolution", "Ecology", "Physiology", "Molecular biology", "Biodiversity"],
                           ["Biological understanding", "Lab skills", "Research methods", "Scientific thinking"],
                           lab_hours=3, lecture_hours=3),
                    Course("SCI104", "Mathematics for Sciences", "basic", 4, 16, [],
                           "Mathematical methods for scientific applications",
                           ["Apply mathematical concepts", "Scientific calculations", "Data analysis"],
                           ["Mathematical problems", "Scientific applications", "Data analysis", "Computational projects"],
                           ["Calculus", "Linear algebra", "Statistics", "Differential equations", "Numerical methods", "Data analysis"],
                           ["Mathematical skills", "Scientific applications", "Data analysis", "Computational thinking"],
                           lecture_hours=4)
                ]
        
        return courses
    
    async def create_degree_programs_for_field(self, field: str) -> Dict[str, Any]:
        programs = {}
        
        if field == "k12_education":
            programs = {
                "elementary_program": {
                    "name": "Chương trình Tiểu học (Lớp 1-5)",
                    "duration_years": 5,
                    "total_credits": 50,
                    "grade_levels": ["grade_1", "grade_2", "grade_3", "grade_4", "grade_5"],
                    "core_courses": ["K12_MATH101", "K12_VIET101", "K12_SCI101", "K12_MATH102", "K12_VIET102", "K12_MATH103", "K12_VIET103", "K12_MATH104", "K12_VIET104", "K12_MATH105", "K12_VIET105"],
                    "specializations": {
                        "math_focus": ["K12_MATH101", "K12_MATH102", "K12_MATH103", "K12_MATH104", "K12_MATH105"],
                        "language_focus": ["K12_VIET101", "K12_VIET102", "K12_VIET103", "K12_VIET104", "K12_VIET105"],
                        "science_focus": ["K12_SCI101", "K12_MATH103", "K12_MATH104", "K12_MATH105"]
                    }
                },
                "middle_school_program": {
                    "name": "Chương trình Trung học cơ sở (Lớp 6-8)",
                    "duration_years": 3,
                    "total_credits": 36,
                    "grade_levels": ["grade_6", "grade_7", "grade_8"],
                    "core_courses": ["K12_MATH201", "K12_LIT201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH202", "K12_LIT202", "K12_MATH203", "K12_LIT203"],
                    "specializations": {
                        "stem_focus": ["K12_MATH201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH202", "K12_MATH203"],
                        "literature_focus": ["K12_LIT201", "K12_LIT202", "K12_LIT203"],
                        "comprehensive": ["K12_MATH201", "K12_LIT201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH202", "K12_LIT202", "K12_MATH203", "K12_LIT203"]
                    }
                },
                "high_school_program": {
                    "name": "Chương trình Trung học phổ thông (Lớp 9-12)",
                    "duration_years": 4,
                    "total_credits": 48,
                    "grade_levels": ["grade_9", "grade_10", "grade_11", "grade_12"],
                    "core_courses": ["K12_MATH301", "K12_LIT301", "K12_PHY301", "K12_CHEM301", "K12_MATH401", "K12_LIT401", "K12_PHY401", "K12_MATH501", "K12_LIT501", "K12_MATH601", "K12_LIT601"],
                    "specializations": {
                        "science_track": ["K12_MATH301", "K12_PHY301", "K12_CHEM301", "K12_MATH401", "K12_PHY401", "K12_MATH501", "K12_MATH601"],
                        "literature_track": ["K12_LIT301", "K12_MATH301", "K12_LIT401", "K12_LIT501", "K12_LIT601"],
                        "comprehensive_track": ["K12_MATH301", "K12_LIT301", "K12_PHY301", "K12_CHEM301", "K12_MATH401", "K12_LIT401", "K12_PHY401", "K12_MATH501", "K12_LIT501", "K12_MATH601", "K12_LIT601"]
                    }
                }
            }
        
        elif field == "computer_science":
            programs = {
                "bachelor_cs": {
                    "name": "Bachelor of Computer Science",
                    "duration_years": 4,
                    "total_credits": 120,
                    "specializations": ["ai_ml", "software_engineering", "cybersecurity", "data_science"],
                    "core_courses": ["CS101", "CS102", "CS103", "CS104", "CS201", "CS202", "CS203", "CS204"],
                    "specialization_courses": {
                        "ai_ml": ["CS301", "CS304", "CS401", "CS402"],
                        "software_engineering": ["CS302", "CS404", "Advanced Software Architecture", "DevOps"],
                        "cybersecurity": ["CS303", "CS403", "Network Security", "Cryptography"],
                        "data_science": ["CS301", "Data Mining", "Big Data Analytics", "Statistical Learning"]
                    }
                },
                "master_cs": {
                    "name": "Master of Computer Science",
                    "duration_years": 2,
                    "total_credits": 60,
                    "specializations": ["ai_ml", "software_engineering", "cybersecurity", "data_science"],
                    "core_courses": ["Advanced Algorithms", "Research Methods", "Advanced Topics"],
                    "specialization_courses": {
                        "ai_ml": ["Deep Learning", "Computer Vision", "NLP", "Reinforcement Learning"],
                        "software_engineering": ["Advanced Software Design", "Cloud Computing", "Distributed Systems"],
                        "cybersecurity": ["Advanced Security", "Cryptographic Protocols", "Security Architecture"],
                        "data_science": ["Advanced Machine Learning", "Data Visualization", "Big Data Technologies"]
                    }
                }
            }
        
        return programs
    
    async def create_academic_structure(self) -> Dict[str, Any]:
        return {
            "levels": {
                "basic": {"description": "Foundational courses for beginners", "credits": 3, "duration": "16 weeks"},
                "intermediate": {"description": "Advanced undergraduate courses", "credits": 3-4, "duration": "16 weeks"},
                "advanced": {"description": "Upper-level undergraduate courses", "credits": 3-4, "duration": "16 weeks"},
                "expert": {"description": "Graduate-level courses", "credits": 4, "duration": "16 weeks"}
            },
            "assessment_types": ["assignments", "exams", "projects", "presentations", "research_papers"],
            "delivery_methods": ["lecture", "lab", "seminar", "online", "hybrid"],
            "credit_system": {"lecture_hour": 1, "lab_hour": 0.5, "project_work": 2}
        }
    
    async def create_career_mappings(self) -> Dict[str, Any]:
        return {
            "k12_education": {
                "elementary_teacher": ["K12_MATH101", "K12_VIET101", "K12_SCI101", "K12_MATH102", "K12_VIET102", "K12_MATH103", "K12_VIET103", "K12_MATH104", "K12_VIET104", "K12_MATH105", "K12_VIET105"],
                "middle_school_teacher": ["K12_MATH201", "K12_LIT201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH202", "K12_LIT202", "K12_MATH203", "K12_LIT203"],
                "high_school_teacher": ["K12_MATH301", "K12_LIT301", "K12_PHY301", "K12_CHEM301", "K12_MATH401", "K12_LIT401", "K12_PHY401", "K12_MATH501", "K12_LIT501", "K12_MATH601", "K12_LIT601"],
                "education_administrator": ["K12_LIT201", "K12_LIT301", "K12_LIT401", "K12_LIT501", "K12_LIT601"],
                "curriculum_developer": ["K12_MATH201", "K12_LIT201", "K12_PHY201", "K12_CHEM201", "K12_BIO201", "K12_MATH301", "K12_LIT301"],
                "education_consultant": ["K12_MATH401", "K12_LIT401", "K12_MATH501", "K12_LIT501", "K12_MATH601", "K12_LIT601"]
            },
            "computer_science": {
                "software_developer": ["CS102", "CS202", "CS302"],
                "data_scientist": ["CS203", "CS301", "Data Mining"],
                "ai_engineer": ["CS301", "CS304", "CS401", "CS402"],
                "cybersecurity_analyst": ["CS303", "CS403", "Network Security"],
                "system_architect": ["CS204", "CS404", "Distributed Systems"]
            },
            "business_administration": {
                "financial_analyst": ["BUS201", "Financial Management", "Investment Analysis"],
                "marketing_manager": ["BUS202", "Digital Marketing", "Brand Management"],
                "business_consultant": ["BUS101", "BUS203", "Strategic Management"],
                "entrepreneur": ["BUS101", "Entrepreneurship", "Business Planning"]
            }
        }
    
    async def create_degree_programs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        field = data.get("field", "computer_science")
        degree_type = data.get("degree_type", "bachelor")
        
        programs = await self.create_degree_programs_for_field(field)
        
        return self.format_response({
            "field": field,
            "degree_type": degree_type,
            "programs": programs,
            "curriculum_structure": await self.create_curriculum_structure(field, degree_type),
            "learning_outcomes": await self.define_program_learning_outcomes(field, degree_type)
        }, confidence=0.90)
    
    async def create_curriculum_structure(self, field: str, degree_type: str) -> Dict[str, Any]:
        if degree_type == "bachelor":
            return {
                "total_credits": 120,
                "duration_years": 4,
                "structure": {
                    "general_education": {"credits": 30, "percentage": 25},
                    "major_core": {"credits": 60, "percentage": 50},
                    "specialization": {"credits": 24, "percentage": 20},
                    "electives": {"credits": 6, "percentage": 5}
                },
                "semester_breakdown": {
                    "year_1": ["basic courses", "general education"],
                    "year_2": ["intermediate courses", "major core"],
                    "year_3": ["advanced courses", "specialization"],
                    "year_4": ["expert courses", "capstone project"]
                }
            }
        elif degree_type == "master":
            return {
                "total_credits": 60,
                "duration_years": 2,
                "structure": {
                    "core_courses": {"credits": 24, "percentage": 40},
                    "specialization": {"credits": 30, "percentage": 50},
                    "thesis_project": {"credits": 6, "percentage": 10}
                }
            }
        
        return {}
    
    async def define_program_learning_outcomes(self, field: str, degree_type: str) -> List[str]:
        outcomes = {
            "computer_science": {
                "bachelor": [
                    "Design and implement software solutions",
                    "Analyze algorithm complexity",
                    "Understand computer architecture",
                    "Apply mathematical foundations",
                    "Work effectively in teams",
                    "Communicate technical concepts"
                ],
                "master": [
                    "Conduct independent research",
                    "Design complex systems",
                    "Evaluate emerging technologies",
                    "Contribute to scholarly literature",
                    "Lead technical projects"
                ]
            }
        }
        
        return outcomes.get(field, {}).get(degree_type, [])
    
    async def design_curriculum_paths(self, data: Dict[str, Any]) -> Dict[str, Any]:
        field = data.get("field", "computer_science")
        career_goal = data.get("career_goal", "software_developer")
        
        paths = await self.create_learning_paths(field, career_goal)
        
        return self.format_response({
            "field": field,
            "career_goal": career_goal,
            "learning_paths": paths,
            "recommended_courses": await self.recommend_courses_for_career(field, career_goal),
            "skill_progression": await self.create_skill_progression(field, career_goal)
        }, confidence=0.88)
    
    async def create_learning_paths(self, field: str, career_goal: str) -> Dict[str, List[str]]:
        paths = {
            "computer_science": {
                "software_developer": ["CS101", "CS102", "CS202", "CS302", "Web Development", "Mobile Development"],
                "data_scientist": ["CS101", "CS102", "CS203", "CS301", "Statistics", "Data Visualization"],
                "ai_engineer": ["CS101", "CS102", "CS201", "CS301", "CS304", "CS401", "CS402"],
                "cybersecurity_specialist": ["CS101", "CS204", "CS303", "CS403", "Network Security", "Ethical Hacking"]
            }
        }
        
        return paths.get(field, {}).get(career_goal, [])
    
    async def recommend_courses_for_career(self, field: str, career_goal: str) -> List[Dict[str, Any]]:
        # Simplified course recommendations
        return [
            {"course_id": "CS101", "priority": "high", "reason": "Fundamental programming skills"},
            {"course_id": "CS201", "priority": "high", "reason": "Essential data structures and algorithms"},
            {"course_id": "CS301", "priority": "medium", "reason": "Advanced skills for specialization"}
        ]
    
    async def create_skill_progression(self, field: str, career_goal: str) -> Dict[str, List[str]]:
        return {
            "year_1": ["Basic programming", "Problem solving", "Computer literacy"],
            "year_2": ["Data structures", "Algorithm design", "System programming"],
            "year_3": ["Specialized skills", "Project management", "Team collaboration"],
            "year_4": ["Advanced topics", "Research skills", "Professional development"]
        }
    
    async def map_career_outcomes(self, data: Dict[str, Any]) -> Dict[str, Any]:
        field = data.get("field", "computer_science")
        
        career_mappings = await self.create_career_mappings()
        
        return self.format_response({
            "field": field,
            "career_mappings": career_mappings.get(field, {}),
            "job_market_trends": await self.get_job_market_trends(field),
            "salary_projections": await self.get_salary_projections(field),
            "skill_demand": await self.get_skill_demand(field)
        }, confidence=0.85)
    
    async def get_job_market_trends(self, field: str) -> Dict[str, Any]:
        return {
            "growth_rate": "+15% annually",
            "high_demand_jobs": ["Software Developer", "Data Scientist", "AI Engineer"],
            "emerging_roles": ["ML Engineer", "Cloud Architect", "DevOps Engineer"],
            "market_outlook": "Excellent"
        }
    
    async def get_salary_projections(self, field: str) -> Dict[str, Any]:
        return {
            "entry_level": "$60,000 - $80,000",
            "mid_level": "$80,000 - $120,000",
            "senior_level": "$120,000 - $180,000",
            "executive_level": "$180,000+"
        }
    
    async def get_skill_demand(self, field: str) -> List[str]:
        return [
            "Programming languages (Python, Java, JavaScript)",
            "Cloud computing (AWS, Azure, GCP)",
            "Data analysis and visualization",
            "Machine learning and AI",
            "Cybersecurity fundamentals",
            "Communication and teamwork"
        ]
