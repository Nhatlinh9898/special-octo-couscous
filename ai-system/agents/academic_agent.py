"""
Academic Agent - Phân tích học tập và gợi ý lộ trình học tập
"""

from typing import Dict, Any, List
import json
from .base_agent import BaseAgent

class AcademicAgent(BaseAgent):
    def __init__(self):
        super().__init__("academic", "llama3:8b-instruct")
        self.description = "Agent chuyên phân tích học tập, gợi ý lộ trình học tập và đề xuất nội dung"
        self.capabilities = [
            "analyze_student_performance",
            "suggest_learning_path", 
            "recommend_content",
            "predict_academic_outcomes",
            "identify_learning_gaps"
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý các tác vụ học thuật"""
        
        if task == "analyze_student_performance":
            return await self.analyze_student_performance(data)
        elif task == "suggest_learning_path":
            return await self.suggest_learning_path(data)
        elif task == "recommend_content":
            return await self.recommend_content(data)
        elif task == "predict_academic_outcomes":
            return await self.predict_academic_outcomes(data)
        elif task == "identify_learning_gaps":
            return await self.identify_learning_gaps(data)
        else:
            return self.format_response(
                f"Task '{task}' not supported by Academic Agent",
                confidence=0.1
            )
    
    async def analyze_student_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Phân tích hiệu suất học sinh"""
        
        student_id = data.get("student_id")
        grades = data.get("grades", [])
        attendance = data.get("attendance", [])
        subjects = data.get("subjects", [])
        
        prompt = f"""
        Bạn là một chuyên gia giáo dục. Hãy phân tích hiệu suất học tập của học sinh với thông tin sau:
        
        ID học sinh: {student_id}
        Điểm số các môn: {grades}
        Chuyên cần: {attendance}%
        Các môn học: {subjects}
        
        Hãy phân tích và trả về JSON với cấu trúc:
        {{
            "performance_trend": "improving/stable/declining",
            "strengths": ["mạnh điểm 1", "mạnh điểm 2"],
            "weaknesses": ["yếu điểm 1", "yếu điểm 2"],
            "risk_factors": ["rủi ro 1", "rủi ro 2"],
            "recommendations": ["khuyến nghị 1", "khuyến nghị 2"],
            "overall_score": 8.5,
            "improvement_plan": ["bước 1", "bước 2", "bước 3"]
        }}
        """
        
        system_prompt = "Bạn là một chuyên gia giáo dục có kinh nghiệm, luôn đưa ra phân tích khách quan và gợi ý thiết thực."
        
        response = await self.call_ollama(prompt, system_prompt)
        analysis = self.extract_json_from_response(response)
        
        return self.format_response(
            analysis,
            confidence=0.85,
            suggestions=[
                "Tạo kế hoạch cải thiện cho các môn yếu",
                "Tăng cường tương tác trong lớp học",
                "Tìm gia sư cho các môn khó"
            ]
        )
    
    async def suggest_learning_path(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Gợi ý lộ trình học tập cá nhân hóa"""
        
        student_id = data.get("student_id")
        subject = data.get("subject")
        current_level = data.get("current_level", "beginner")
        goals = data.get("goals", [])
        time_frame = data.get("time_frame", "3 months")
        
        prompt = f"""
        Bạn là một chuyên gia thiết kế lộ trình học tập. Hãy tạo lộ trình học tập cá nhân hóa với thông tin:
        
        Học sinh: {student_id}
        Môn học: {subject}
        Trình độ hiện tại: {current_level}
        Mục tiêu: {goals}
        Thời gian: {time_frame}
        
        Hãy thiết kế lộ trình và trả về JSON:
        {{
            "current_assessment": {{
                "level": "{current_level}",
                "strengths": ["điểm mạnh"],
                "gaps": ["lỗ hổng kiến thức"]
            }},
            "learning_objectives": ["mục tiêu 1", "mục tiêu 2"],
            "weekly_plan": [
                {{
                    "week": 1,
                    "topics": ["chủ đề 1", "chủ đề 2"],
                    "activities": ["hoạt động 1", "hoạt động 2"],
                    "resources": ["tài nguyên 1", "tài nguyên 2"]
                }}
            ],
            "milestones": ["cột mốc 1", "cột mốc 2"],
            "assessment_methods": ["phương pháp đánh giá"],
            "estimated_completion": "{time_frame}"
        }}
        """
        
        system_prompt = "Bạn là chuyên gia thiết kế chương trình học tập, luôn tạo lộ trình thực tế và hiệu quả."
        
        response = await self.call_ollama(prompt, system_prompt)
        learning_path = self.extract_json_from_response(response)
        
        return self.format_response(
            learning_path,
            confidence=0.80,
            suggestions=[
                "Bắt đầu với các bài tập cơ bản",
                "Thực hành hàng ngày",
                "Tìm bạn học cùng tiến bộ"
            ]
        )
    
    async def recommend_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đề xuất nội dung học tập phù hợp"""
        
        subject = data.get("subject")
        topic = data.get("topic")
        learning_style = data.get("learning_style", "visual")
        difficulty = data.get("difficulty", "intermediate")
        
        prompt = f"""
        Bạn là một chuyên gia nội dung giáo dục. Hãy đề xuất tài liệu học tập với thông tin:
        
        Môn học: {subject}
        Chủ đề: {topic}
        Phong cách học: {learning_style}
        Độ khó: {difficulty}
        
        Hãy đề xuất và trả về JSON:
        {{
            "videos": [
                {{
                    "title": "tiêu đề video",
                    "url": "link",
                    "duration": "thời lượng",
                    "difficulty": "độ khó"
                }}
            ],
            "articles": [
                {{
                    "title": "tiêu đề bài viết",
                    "url": "link",
                    "reading_time": "thời gian đọc",
                    "key_points": ["điểm chính 1", "điểm chính 2"]
                }}
            ],
            "exercises": [
                {{
                    "title": "tên bài tập",
                    "type": "loại bài tập",
                    "difficulty": "độ khó",
                    "estimated_time": "thời gian ước tính"
                }}
            ],
            "interactive_resources": [
                {{
                    "name": "tên tài nguyên",
                    "type": "loại tài nguyên",
                    "description": "mô tả"
                }}
            ]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia nội dung giáo dục, luôn đề xuất tài liệu chất lượng và phù hợp."
        
        response = await self.call_ollama(prompt, system_prompt)
        recommendations = self.extract_json_from_response(response)
        
        return self.format_response(
            recommendations,
            confidence=0.75,
            suggestions=[
                "Xem video trước khi đọc bài viết",
                "Làm bài tập ngay sau khi học",
                "Ghi chú trong quá trình học"
            ]
        )
    
    async def predict_academic_outcomes(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Dự báo kết quả học tập"""
        
        student_id = data.get("student_id")
        historical_data = data.get("historical_data", {})
        current_performance = data.get("current_performance", {})
        external_factors = data.get("external_factors", {})
        
        prompt = f"""
        Bạn là một chuyên gia phân tích dữ liệu giáo dục. Hãy dự báo kết quả học tập với thông tin:
        
        Học sinh: {student_id}
        Dữ liệu lịch sử: {historical_data}
        Hiệu suất hiện tại: {current_performance}
        Yếu tố bên ngoài: {external_factors}
        
        Hãy dự báo và trả về JSON:
        {{
            "predicted_gpa": 8.2,
            "confidence_interval": [7.8, 8.6],
            "subject_predictions": {{
                "math": {{"grade": 8.5, "confidence": 0.8}},
                "literature": {{"grade": 7.8, "confidence": 0.7}}
            }},
            "success_probability": 0.85,
            "risk_factors": ["yếu tố rủi ro"],
            "improvement_potential": "high",
            "recommendations": ["khuyến nghị"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia dự báo học thuật, sử dụng dữ liệu để đưa ra dự báo chính xác."
        
        response = await self.call_ollama(prompt, system_prompt)
        predictions = self.extract_json_from_response(response)
        
        return self.format_response(
            predictions,
            confidence=0.70,
            suggestions=[
                "Tập trung vào các môn có nguy cơ",
                "Tăng cường thời gian học",
                "Tìm sự hỗ trợ khi cần"
            ]
        )
    
    async def identify_learning_gaps(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Nhận diện lỗ hổng kiến thức"""
        
        student_id = data.get("student_id")
        subject = data.get("subject")
        assessment_results = data.get("assessment_results", [])
        curriculum_standards = data.get("curriculum_standards", {})
        
        prompt = f"""
        Bạn là một chuyên gia đánh giá giáo dục. Hãy nhận diện lỗ hổng kiến thức với thông tin:
        
        Học sinh: {student_id}
        Môn học: {subject}
        Kết quả đánh giá: {assessment_results}
        Chuẩn chương trình: {curriculum_standards}
        
        Hãy phân tích và trả về JSON:
        {{
            "identified_gaps": [
                {{
                    "topic": "chủ đề",
                    "severity": "high/medium/low",
                    "impact": "ảnh hưởng",
                    "prerequisites": ["kiến thức cần có"]
                }}
            ],
            "remediation_plan": [
                {{
                    "gap": "lỗ hổng",
                    "actions": ["hành động 1", "hành động 2"],
                    "resources": ["tài nguyên"],
                    "timeline": "thời gian"
                }}
            ],
            "priority_order": ["lỗ hồng ưu tiên 1", "lỗ hổng ưu tiên 2"],
            "success_criteria": ["tiêu chí thành công"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia nhận diện lỗ hổng kiến thức, luôn phân tích sâu và đưa ra giải pháp hiệu quả."
        
        response = await self.call_ollama(prompt, system_prompt)
        gaps_analysis = self.extract_json_from_response(response)
        
        return self.format_response(
            gaps_analysis,
            confidence=0.82,
            suggestions=[
                "Bắt đầu với các lỗ hổng nghiêm trọng",
                "Làm bài tập củng cố",
                "Tìm sự hỗ trợ từ giáo viên"
            ]
        )
