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
        
        if field == "computer_science":
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
        paths = {
            "beginner": ["CS101", "CS102"],
            "intermediate": ["CS201", "CS202"],
            "advanced": ["CS301", "CS302"],
            "expert": ["CS401", "CS402"]
        }
        return paths
