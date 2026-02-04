"""
Teacher Agent - Trợ lý giảng dạy và quản lý lớp học
"""

from typing import Dict, Any, List
import json
from .base_agent import BaseAgent

class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__("teacher", "codellama:7b-instruct")
        self.description = "Agent chuyên hỗ trợ giáo viên giảng dạy, quản lý lớp học và tối ưu tài nguyên"
        self.capabilities = [
            "assist_teaching",
            "manage_classroom",
            "analyze_teaching_effectiveness",
            "optimize_resources",
            "generate_materials"
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if task == "assist_teaching":
            return await self.assist_teaching(data)
        elif task == "manage_classroom":
            return await self.manage_classroom(data)
        elif task == "analyze_teaching_effectiveness":
            return await self.analyze_teaching_effectiveness(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def assist_teaching(self, data: Dict[str, Any]) -> Dict[str, Any]:
        teacher_id = data.get("teacher_id")
        subject = data.get("subject")
        class_performance = data.get("class_performance", {})
        teaching_challenges = data.get("teaching_challenges", [])
        
        prompt = f"""
        Bạn là một chuyên gia giáo dục. Hãy hỗ trợ giáo viên với thông tin:
        Giáo viên: {teacher_id}
        Môn học: {subject}
        Hiệu suất lớp: {class_performance}
        Thách thức: {teaching_challenges}
        
        Trả về JSON với gợi ý giảng dạy chi tiết.
        """
        
        response = await self.call_ollama(prompt)
        return self.format_response({"suggestions": response}, confidence=0.85)

# Create other agents similarly
class ParentAgent(BaseAgent):
    def __init__(self):
        super().__init__("parent", "llama3:8b-instruct")
        self.description = "Agent hỗ trợ phụ huynh giám sát và giao tiếp với trường"
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.format_response("Parent agent processing", confidence=0.8)

class AdminAgent(BaseAgent):
    def __init__(self):
        super().__init__("admin", "llama3:70b-instruct")
        self.description = "Agent hỗ trợ quản lý và ra quyết định"
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.format_response("Admin agent processing", confidence=0.8)

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__("finance", "mistral:7b-instruct")
        self.description = "Agent chuyên phân tích tài chính và tối ưu học phí"
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.format_response("Finance agent processing", confidence=0.8)

class AnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__("analytics", "llama3:8b-instruct")
        self.description = "Agent chuyên phân tích dữ liệu và tạo báo cáo"
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.format_response("Analytics agent processing", confidence=0.8)
