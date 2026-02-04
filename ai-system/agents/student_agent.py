"""
Student Agent - Theo dõi hiệu suất và đánh giá rủi ro học sinh
"""

from typing import Dict, Any, List
import json
from .base_agent import BaseAgent

class StudentAgent(BaseAgent):
    def __init__(self):
        super().__init__("student", "mistral:7b-instruct")
        self.description = "Agent chuyên theo dõi hiệu suất học sinh, đánh giá rủi ro và phân tích hành vi"
        self.capabilities = [
            "monitor_student_progress",
            "assess_academic_risk",
            "analyze_behavior_patterns",
            "provide_study_support",
            "track_engagement"
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý các tác vụ liên quan đến học sinh"""
        
        if task == "monitor_student_progress":
            return await self.monitor_student_progress(data)
        elif task == "assess_academic_risk":
            return await self.assess_academic_risk(data)
        elif task == "analyze_behavior_patterns":
            return await self.analyze_behavior_patterns(data)
        elif task == "provide_study_support":
            return await self.provide_study_support(data)
        elif task == "track_engagement":
            return await self.track_engagement(data)
        else:
            return self.format_response(
                f"Task '{task}' not supported by Student Agent",
                confidence=0.1
            )
    
    async def monitor_student_progress(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Theo dõi tiến độ học sinh real-time"""
        
        student_id = data.get("student_id")
        current_grades = data.get("current_grades", {})
        attendance_rate = data.get("attendance_rate", 0)
        assignment_completion = data.get("assignment_completion", 0)
        participation_score = data.get("participation_score", 0)
        
        prompt = f"""
        Bạn là một cố vấn học tập. Hãy theo dõi và phân tích tiến độ học sinh với thông tin:
        
        ID học sinh: {student_id}
        Điểm số hiện tại: {current_grades}
        Tỷ lệ chuyên cần: {attendance_rate}%
        Tỷ lệ hoàn thành bài tập: {assignment_completion}%
        Điểm tham gia: {participation_score}/10
        
        Hãy phân tích và trả về JSON:
        {{
            "progress_status": "on_track/at_risk/behind",
            "overall_trend": "improving/stable/declining",
            "key_metrics": {{
                "academic_performance": 8.2,
                "engagement_level": 7.5,
                "consistency": 8.0
            }},
            "achievements": ["thành tích 1", "thành tích 2"],
            "concerns": ["mối quan tâm 1", "mối quan tâm 2"],
            "immediate_actions": ["hành động ngay 1", "hành động ngay 2"],
            "weekly_goals": ["mục tiêu tuần 1", "mục tiêu tuần 2"]
        }}
        """
        
        system_prompt = "Bạn là cố vấn học tập tận tâm, luôn đưa ra phân tích chi tiết và gợi ý thiết thực."
        
        response = await self.call_ollama(prompt, system_prompt)
        progress_analysis = self.extract_json_from_response(response)
        
        return self.format_response(
            progress_analysis,
            confidence=0.88,
            suggestions=[
                "Tạo lịch học tập hàng tuần",
                "Thiết lập mục tiêu ngắn hạn",
                "Tìm bạn học cùng tiến bộ"
            ]
        )
    
    async def assess_academic_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đánh giá rủi ro học thuật"""
        
        student_id = data.get("student_id")
        recent_grades = data.get("recent_grades", [])
        attendance_trend = data.get("attendance_trend", [])
        behavioral_issues = data.get("behavioral_issues", [])
        social_factors = data.get("social_factors", {})
        
        prompt = f"""
        Bạn là một chuyên gia nhận diện rủi ro học thuật. Hãy đánh giá rủi ro cho học sinh với thông tin:
        
        ID học sinh: {student_id}
        Điểm số gần đây: {recent_grades}
        Xu hướng chuyên cần: {attendance_trend}
        Vấn đề hành vi: {behavioral_issues}
        Yếu tố xã hội: {social_factors}
        
        Hãy đánh giá và trả về JSON:
        {{
            "risk_level": "low/medium/high/critical",
            "risk_score": 7.2,
            "primary_risk_factors": [
                {{
                    "factor": "yếu tố rủi ro",
                    "severity": "high/medium/low",
                    "impact": "ảnh hưởng"
                }}
            ],
            "early_warning_indicators": ["dấu hiệu cảnh báo 1", "dấu hiệu cảnh báo 2"],
            "recommended_interventions": [
                {{
                    "intervention": "can thiệp",
                    "priority": "high/medium/low",
                    "timeline": "thời gian",
                    "responsible": "người phụ trách"
                }}
            ],
            "monitoring_plan": ["kế hoạch giám sát"],
            "success_probability": 0.75
        }}
        """
        
        system_prompt = "Bạn là chuyên gia đánh giá rủi ro, luôn nhận diện sớm và đưa ra giải pháp hiệu quả."
        
        response = await self.call_ollama(prompt, system_prompt)
        risk_assessment = self.extract_json_from_response(response)
        
        return self.format_response(
            risk_assessment,
            confidence=0.85,
            suggestions=[
                "Tăng cường giám sát học tập",
                "Lên lịch gặp phụ huynh",
                "Tạo kế hoạch hỗ trợ cá nhân"
            ]
        )
    
    async def analyze_behavior_patterns(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Phân tích hành vi học tập"""
        
        student_id = data.get("student_id")
        study_time_patterns = data.get("study_time_patterns", {})
        subject_preferences = data.get("subject_preferences", {})
        interaction_patterns = data.get("interaction_patterns", {})
        motivation_indicators = data.get("motivation_indicators", {})
        
        prompt = f"""
        Bạn là một chuyên gia phân tích hành vi học tập. Hãy phân tích hành vi học sinh với thông tin:
        
        ID học sinh: {student_id}
        Mẫu thời gian học: {study_time_patterns}
        Sở thích môn học: {subject_preferences}
        Mẫu tương tác: {interaction_patterns}
        Chỉ số động lực: {motivation_indicators}
        
        Hãy phân tích và trả về JSON:
        {{
            "learning_style": "visual/auditory/kinesthetic/mixed",
            "study_habits": {{
                "consistency": "high/medium/low",
                "effectiveness": "high/medium/low",
                "optimal_time": "sáng/chiều/tối"
            }},
            "behavioral_patterns": [
                {{
                    "pattern": "mẫu hành vi",
                    "frequency": "tần suất",
                    "impact": "ảnh hưởng"
                }}
            ],
            "motivation_level": "high/medium/low",
            "engagement_indicators": ["chỉ số 1", "chỉ số 2"],
            "recommendations": [
                "gợi ý 1",
                "gợi ý 2"
            ]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia phân tích hành vi, luôn đưa ra nhận diện sâu sắc và gợi ý hữu ích."
        
        response = await self.call_ollama(prompt, system_prompt)
        behavior_analysis = self.extract_json_from_response(response)
        
        return self.format_response(
            behavior_analysis,
            confidence=0.80,
            suggestions=[
                "Tối ưu thời gian học theo phong cách",
                "Tăng cường các hoạt động yêu thích",
                "Tạo môi trường học tập tích cực"
            ]
        )
    
    async def provide_study_support(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cung cấp hỗ trợ học tập"""
        
        student_id = data.get("student_id")
        current_challenges = data.get("current_challenges", [])
        preferred_subjects = data.get("preferred_subjects", [])
        learning_difficulties = data.get("learning_difficulties", [])
        available_resources = data.get("available_resources", [])
        
        prompt = f"""
        Bạn là một trợ lý học tập thông minh. Hãy cung cấp hỗ trợ cho học sinh với thông tin:
        
        ID học sinh: {student_id}
        Thách thức hiện tại: {current_challenges}
        Môn học yêu thích: {preferred_subjects}
        Khó khăn học tập: {learning_difficulties}
        Tài nguyên có sẵn: {available_resources}
        
        Hãy đưa ra hỗ trợ và trả về JSON:
        {{
            "support_plan": [
                {{
                    "area": "lĩnh vực hỗ trợ",
                    "strategy": "chiến lược",
                    "resources": ["tài nguyên 1", "tài nguyên 2"],
                    "timeline": "thời gian"
                }}
            ],
            "study_techniques": [
                {{
                    "technique": "kỹ thuật học tập",
                    "description": "mô tả",
                    "best_for": ["phù hợp cho"]
                }}
            ],
            "motivation_strategies": ["chiến lược động lực 1", "chiến lược động lực 2"],
            "time_management_tips": ["mẹo quản lý thời gian 1", "mẹo quản lý thời gian 2"],
            "success_metrics": ["chỉ số thành công"]
        }}
        """
        
        system_prompt = "Bạn là trợ lý học tập thân thiện, luôn đưa ra giải pháp cá nhân hóa và hiệu quả."
        
        response = await self.call_ollama(prompt, system_prompt)
        support_plan = self.extract_json_from_response(response)
        
        return self.format_response(
            support_plan,
            confidence=0.87,
            suggestions=[
                "Áp dụng kỹ thuật học tập mới",
                "Tạo lịch trình linh hoạt",
                "Tìm sự hỗ trợ khi cần"
            ]
        )
    
    async def track_engagement(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Theo dõi mức độ tham gia"""
        
        student_id = data.get("student_id")
        class_participation = data.get("class_participation", {})
        online_activity = data.get("online_activity", {})
        extracurricular_involvement = data.get("extracurricular_involvement", [])
        peer_interaction = data.get("peer_interaction", {})
        
        prompt = f"""
        Bạn là chuyên gia phân tích sự tham gia của học sinh. Hãy theo dõi mức độ tham gia với thông tin:
        
        ID học sinh: {student_id}
        Tham gia lớp học: {class_participation}
        Hoạt động online: {online_activity}
        Hoạt động ngoại khóa: {extracurricular_involvement}
        Tương tác với bạn bè: {peer_interaction}
        
        Hãy phân tích và trả về JSON:
        {{
            "engagement_score": 8.5,
            "engagement_trend": "increasing/stable/decreasing",
            "participation_areas": {{
                "academic": 8.0,
                "social": 7.5,
                "extracurricular": 9.0
            }},
            "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
            "areas_for_improvement": ["cần cải thiện 1", "cần cải thiện 2"],
            "engagement_strategies": [
                {{
                    "strategy": "chiến lược",
                    "expected_impact": "tác động dự kiến"
                }}
            ],
            "recognition_opportunities": ["cơ hội ghi nhận"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia phân tích sự tham gia, luôn đưa ra nhận diện chính xác và gợi ý cải thiện."
        
        response = await self.call_ollama(prompt, system_prompt)
        engagement_analysis = self.extract_json_from_response(response)
        
        return self.format_response(
            engagement_analysis,
            confidence=0.83,
            suggestions=[
                "Tăng cường hoạt động nhóm",
                "Tham gia các câu lạc bộ",
                "Ghi nhận thành tích"
            ]
        )
