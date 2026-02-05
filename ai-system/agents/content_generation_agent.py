"""
Content Generation Agent - Adapted from Jubilant Carnival
Agent chuyên tạo nội dung giáo dục với AI tiên tiến
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import re

from .base_agent import BaseAgent

@dataclass
class ContentTemplate:
    """Template cho việc tạo nội dung"""
    id: str
    name: str
    type: str  # lesson, exercise, exam, quiz
    subject: str
    level: str
    structure: Dict[str, Any]
    metadata: Dict[str, Any]

@dataclass
class GeneratedContent:
    """Nội dung đã được tạo"""
    id: str
    template_id: str
    content_type: str
    title: str
    content: str
    objectives: List[str]
    duration: int  # minutes
    difficulty_level: str
    quality_score: float
    metadata: Dict[str, Any]
    created_at: datetime

class ContentGenerationAgent(BaseAgent):
    """Agent chuyên tạo nội dung giáo dục từ Jubilant Carnival"""
    
    def __init__(self):
        super().__init__("content_generation_agent", "llama3:8b")
        self.description = "Agent chuyên tạo nội dung giáo dục với AI tiên tiến"
        self.capabilities = [
            "lesson_generation",        # Tạo bài học
            "exercise_generation",       # Tạo bài tập
            "exam_generation",          # Tạo bài thi
            "quiz_generation",           # Tạo câu hỏi nhanh
            "curriculum_generation",     # Tạo giáo trình chi tiết
            "content_personalization",   # Cá nhân hóa nội dung
            "quality_assessment",        # Đánh giá chất lượng
            "template_management",       # Quản lý templates
            "multilingual_support"        # Hỗ trợ đa ngôn ngữ
        ]
        
        # Content templates
        self.templates = self._initialize_templates()
        
        # Quality metrics
        self.quality_criteria = {
            "clarity": 0.3,
            "accuracy": 0.3,
            "engagement": 0.2,
            "appropriateness": 0.2
        }
        
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý tác vụ tạo nội dung"""
        
        try:
            if task == "generate_lesson":
                return await self.generate_lesson(data)
            elif task == "generate_exercise":
                return await self.generate_exercise(data)
            elif task == "generate_exam":
                return await self.generate_exam(data)
            elif task == "generate_quiz":
                return await self.generate_quiz(data)
            elif task == "generate_curriculum":
                return await self.generate_curriculum(data)
            elif task == "personalize_content":
                return await self.personalize_content(data)
            elif task == "assess_quality":
                return await self.assess_content_quality(data)
            elif task == "get_template":
                return await self.get_template(data)
            elif task == "create_template":
                return await self.create_template(data)
            else:
                return self.format_response(
                    f"Task '{task}' not supported. Available tasks: {', '.join(self.capabilities)}",
                    confidence=0.1
                )
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "confidence": 0.0
            }
    
    async def generate_lesson(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo bài học hoàn chỉnh"""
        
        topic = data.get("topic", "")
        subject = data.get("subject", "general")
        level = data.get("level", "intermediate")
        duration = data.get("duration", 60)  # minutes
        objectives = data.get("objectives", [])
        
        try:
            # Get appropriate template
            template = await self._get_template_for_lesson(subject, level)
            
            # Generate content using AI
            prompt = self._create_lesson_prompt(topic, subject, level, duration, objectives, template)
            
            ai_response = await self._call_ai(prompt)
            
            # Parse and structure content
            lesson_content = self._parse_lesson_content(ai_response, template)
            
            # Generate objectives if not provided
            if not objectives:
                objectives = await self._generate_objectives(topic, level, duration)
            
            # Create content object
            generated_content = GeneratedContent(
                id=f"lesson_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                template_id=template.id if template else "default",
                content_type="lesson",
                title=f"{topic} - {subject} Lesson",
                content=lesson_content,
                objectives=objectives,
                duration=duration,
                difficulty_level=level,
                quality_score=await self._calculate_quality_score(lesson_content),
                metadata={
                    "topic": topic,
                    "subject": subject,
                    "level": level,
                    "ai_model": self.model,
                    "generation_time": datetime.now().isoformat()
                },
                created_at=datetime.now()
            )
            
            return {
                "success": True,
                "content": generated_content,
                "template_used": template.name if template else "default",
                "confidence": 0.9
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lesson generation failed: {str(e)}",
                "confidence": 0.0
            }
    
    async def generate_exercise(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo bài tập"""
        
        topic = data.get("topic", "")
        exercise_type = data.get("type", "practice")  # practice, homework, assignment
        difficulty = data.get("difficulty", "medium")
        count = data.get("count", 5)
        
        try:
            prompt = self._create_exercise_prompt(topic, exercise_type, difficulty, count)
            
            ai_response = await self._call_ai(prompt)
            exercises = self._parse_exercise_content(ai_response)
            
            return {
                "success": True,
                "exercises": exercises,
                "metadata": {
                    "topic": topic,
                    "type": exercise_type,
                    "difficulty": difficulty,
                    "count": len(exercises),
                    "generated_at": datetime.now().isoformat()
                },
                "confidence": 0.85
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Exercise generation failed: {str(e)}",
                "confidence": 0.0
            }
    
    async def generate_exam(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo bài thi"""
        
        subject = data.get("subject", "")
        topics = data.get("topics", [])
        duration = data.get("duration", 120)  # minutes
        question_types = data.get("question_types", ["multiple_choice", "short_answer", "essay"])
        total_points = data.get("total_points", 100)
        
        try:
            prompt = self._create_exam_prompt(subject, topics, duration, question_types, total_points)
            
            ai_response = await self._call_ai(prompt)
            exam_content = self._parse_exam_content(ai_response)
            
            return {
                "success": True,
                "exam": exam_content,
                "metadata": {
                    "subject": subject,
                    "topics": topics,
                    "duration": duration,
                    "question_types": question_types,
                    "total_points": total_points,
                    "generated_at": datetime.now().isoformat()
                },
                "confidence": 0.8
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Exam generation failed: {str(e)}",
                "confidence": 0.0
            }
    
    async def generate_quiz(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo câu hỏi nhanh"""
        
        topic = data.get("topic", "")
        quiz_type = data.get("type", "quick")  # quick, formative, summative
        question_count = data.get("count", 10)
        time_limit = data.get("time_limit", 15)  # minutes
        
        try:
            prompt = self._create_quiz_prompt(topic, quiz_type, question_count, time_limit)
            
            ai_response = await self._call_ai(prompt)
            quiz_content = self._parse_quiz_content(ai_response)
            
            return {
                "success": True,
                "quiz": quiz_content,
                "metadata": {
                    "topic": topic,
                    "type": quiz_type,
                    "question_count": question_count,
                    "time_limit": time_limit,
                    "generated_at": datetime.now().isoformat()
                },
                "confidence": 0.85
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Quiz generation failed: {str(e)}",
                "confidence": 0.0
            }
    
    async def generate_curriculum(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo giáo trình chi tiết và chuyên sâu"""
        
        title = data.get("title", "")
        subject = data.get("subject", "")
        description = data.get("description", "")
        target_level = data.get("target_level", "intermediate")
        duration_weeks = data.get("duration_weeks", 12)
        modules_count = data.get("modules_count", 6)
        
        try:
            # Create comprehensive curriculum prompt
            prompt = self._create_curriculum_prompt(
                title, subject, description, target_level, 
                duration_weeks, modules_count
            )
            
            ai_response = await self._call_ai(prompt)
            curriculum_content = self._parse_curriculum_content(ai_response)
            
            # Generate detailed syllabus
            syllabus = await self._generate_detailed_syllabus(
                title, subject, curriculum_content, target_level
            )
            
            # Create assessment plan
            assessment_plan = await self._generate_assessment_plan(
                title, subject, curriculum_content, duration_weeks
            )
            
            # Generate resources list
            resources = await self._generate_resources_list(
                title, subject, curriculum_content
            )
            
            return {
                "success": True,
                "curriculum": {
                    "title": title,
                    "subject": subject,
                    "description": description,
                    "target_level": target_level,
                    "duration_weeks": duration_weeks,
                    "overview": curriculum_content.get("overview", ""),
                    "learning_outcomes": curriculum_content.get("learning_outcomes", []),
                    "modules": curriculum_content.get("modules", []),
                    "syllabus": syllabus,
                    "assessment_plan": assessment_plan,
                    "resources": resources,
                    "teaching_strategies": curriculum_content.get("teaching_strategies", []),
                    "prerequisites": curriculum_content.get("prerequisites", [])
                },
                "metadata": {
                    "title": title,
                    "subject": subject,
                    "target_level": target_level,
                    "duration_weeks": duration_weeks,
                    "modules_count": len(curriculum_content.get("modules", [])),
                    "generated_at": datetime.now().isoformat(),
                    "ai_model": self.model
                },
                "confidence": 0.9
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Curriculum generation failed: {str(e)}",
                "confidence": 0.0
            }
    
    def _create_curriculum_prompt(self, title: str, subject: str, description: str, 
                               target_level: str, duration_weeks: int, modules_count: int) -> str:
        """Tạo prompt chi tiết cho việc tạo giáo trình"""
        
        return f"""
Create a comprehensive, detailed curriculum for:

TITLE: {title}
SUBJECT: {subject}
DESCRIPTION: {description}
TARGET LEVEL: {target_level}
DURATION: {duration_weeks} weeks
MODULES: {modules_count}

REQUIREMENTS:
1. Create engaging, practical curriculum with real-world applications
2. Include detailed learning outcomes for each module
3. Provide comprehensive content with examples and case studies
4. Design progressive learning path from basic to advanced
5. Include interactive activities and assessments
6. Consider different learning styles and abilities
7. Align with educational standards and best practices
8. Include modern teaching methodologies

For {subject} specifically:
- Use authentic materials and examples
- Include cultural and contextual relevance
- Provide practical skill development
- Integrate technology where appropriate
- Include assessment rubrics and criteria

OUTPUT FORMAT:
{{
    "overview": "Comprehensive curriculum overview with goals and approach...",
    "learning_outcomes": [
        "Students will be able to...",
        "Students will understand...",
        "Students will develop skills in...",
        ...
    ],
    "prerequisites": [
        "Basic knowledge of...",
        "Familiarity with...",
        ...
    ],
    "modules": [
        {{
            "module_number": 1,
            "title": "Module Title",
            "duration_weeks": 2,
            "description": "Detailed module description...",
            "learning_objectives": [
                "Objective 1...",
                "Objective 2...",
                ...
            ],
            "topics": [
                {{
                    "title": "Topic Title",
                    "description": "Topic description...",
                    "content": "Detailed content explanation...",
                    "examples": ["Example 1...", "Example 2..."],
                    "activities": [
                        {{
                            "type": "individual/group/class",
                            "description": "Activity description...",
                            "duration": "30 minutes",
                            "materials": ["Material 1...", "Material 2..."]
                        }}
                    ],
                    "assessment": {{
                        "type": "formative/summative",
                        "description": "Assessment description...",
                        "criteria": ["Criterion 1...", "Criterion 2..."]
                    }}
                }}
            ],
            "resources": [
                {{
                    "type": "textbook/video/article/website",
                    "title": "Resource title",
                    "description": "Resource description...",
                    "url": "URL if applicable"
                }}
            ]
        }},
        ...
    ],
    "teaching_strategies": [
        "Strategy 1 with implementation details...",
        "Strategy 2 with implementation details...",
        ...
    ],
    "assessment_methods": [
        {{
            "type": "quiz/presentation/project/exam",
            "description": "Assessment description...",
            "weight": "20%",
            "criteria": ["Criterion 1...", "Criterion 2..."]
        }}
    ]
}}

For literature curriculum specifically:
- Include literary analysis techniques
- Provide historical and cultural context
- Include various literary genres and forms
- Develop critical thinking and interpretation skills
- Include creative writing components
- Use authentic literary texts and examples
- Include author biographical information where relevant
"""
    
    async def _generate_detailed_syllabus(self, title: str, subject: str, 
                                       curriculum_content: Dict[str, Any], 
                                       target_level: str) -> Dict[str, Any]:
        """Tạo syllabus chi tiết"""
        
        modules = curriculum_content.get("modules", [])
        
        syllabus = {
            "title": f"Chi tiết Syllabus: {title}",
            "subject": subject,
            "target_level": target_level,
            "total_weeks": sum(module.get("duration_weeks", 1) for module in modules),
            "weekly_breakdown": []
        }
        
        current_week = 1
        for module in modules:
            module_weeks = module.get("duration_weeks", 1)
            module_title = module.get("title", "")
            
            for week in range(module_weeks):
                syllabus["weekly_breakdown"].append({
                    "week": current_week,
                    "module": module_title,
                    "topics": [topic.get("title", "") for topic in module.get("topics", [])],
                    "learning_objectives": module.get("learning_objectives", []),
                    "activities": [
                        activity.get("description", "") 
                        for topic in module.get("topics", []) 
                        for activity in topic.get("activities", [])
                    ],
                    "assessment": "Weekly quiz or activity completion",
                    "readings": [
                        resource.get("title", "") 
                        for resource in module.get("resources", []) 
                        if resource.get("type") == "textbook"
                    ]
                })
                current_week += 1
        
        return syllabus
    
    async def _generate_assessment_plan(self, title: str, subject: str, 
                                    curriculum_content: Dict[str, Any], 
                                    duration_weeks: int) -> Dict[str, Any]:
        """Tạo kế hoạch đánh giá chi tiết"""
        
        return {
            "title": f"Kế hoạch đánh giá: {title}",
            "subject": subject,
            "duration_weeks": duration_weeks,
            "assessment_components": [
                {
                    "component": "Tham gia lớp học",
                    "weight": "10%",
                    "description": "Thảo luận, hoạt động nhóm, hoàn thành nhiệm vụ",
                    "criteria": [
                        "Tích cực tham gia",
                        "Đóng góp ý kiến có giá trị",
                        "Hỗ trợ đồng đội"
                    ]
                },
                {
                    "component": "Bài tập hàng tuần",
                    "weight": "20%",
                    "description": "Bài tập cá nhân và nhóm",
                    "criteria": [
                        "Hoàn thành đúng hạn",
                        "Chất lượng giải pháp",
                        "Sáng tạo trong cách tiếp cận"
                    ]
                },
                {
                    "component": "Dự án giữa kỳ",
                    "weight": "30%",
                    "description": "Dự án nghiên cứu hoặc sáng tạo",
                    "criteria": [
                        "Nội dung chuyên sâu",
                        "Phương pháp luận",
                        "Trình bày",
                        "Tư duy phản biện"
                    ]
                },
                {
                    "component": "Bài thi cuối kỳ",
                    "weight": "40%",
                    "description": "Bài thi tổng hợp kiến thức",
                    "criteria": [
                        "Hiểu biết lý thuyết",
                        "Vận dụng thực tế",
                        "Phân tích vấn đề",
                        "Kỹ năng viết"
                    ]
                }
            ],
            "grading_scale": {
                "A": "90-100: Xuất sắc",
                "B": "80-89: Giỏi", 
                "C": "70-79: Khá",
                "D": "60-69: Trung bình",
                "F": "0-59: Yếu"
            }
        }
    
    async def _generate_resources_list(self, title: str, subject: str, 
                                   curriculum_content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Tạo danh sách tài nguyên học tập"""
        
        base_resources = [
            {
                "type": "textbook",
                "title": f"Giáo trình {subject} cơ bản",
                "author": "Bộ Giáo dục và Đào tạo",
                "description": "Giáo trình chính thức cho môn học",
                "isbn": "ISBN chính thức"
            },
            {
                "type": "reference_book",
                "title": f"Tài liệu tham khảo {subject} nâng cao",
                "author": "Các chuyên gia đầu ngành",
                "description": "Tài liệu bổ sung cho học sinh muốn tìm hiểu sâu"
            },
            {
                "type": "online_resource",
                "title": "Kho tài liệu số {subject}",
                "url": "https://example.com/resources",
                "description": "Thư viện trực tuyến với bài giảng và bài tập"
            },
            {
                "type": "video",
                "title": "Video bài giảng {subject}",
                "platform": "YouTube/E-learning Platform",
                "description": "Video hướng dẫn học tập trực quan"
            },
            {
                "type": "software",
                "title": "Phần mềm học tập {subject}",
                "description": "Công cụ hỗ trợ học tập tương tác"
            }
        ]
        
        # Add subject-specific resources
        if subject.lower() == "ngữ văn" or "literature" in subject.lower():
            base_resources.extend([
                {
                    "type": "literary_works",
                    "title": "Tác phẩm văn học Việt Nam kinh điển",
                    "description": "Tuyển tập các tác phẩm cần phân tích"
                },
                {
                    "type": "dictionary",
                    "title": "Từ điển văn học và thuật ngữ",
                    "description": "Giải thích các thuật ngữ văn học"
                }
            ])
        
        return base_resources
    
    def _parse_curriculum_content(self, ai_response: str) -> Dict[str, Any]:
        """Phân tích nội dung giáo trình từ AI response"""
        
        try:
            # Try to parse as JSON first
            if ai_response.strip().startswith('{'):
                return json.loads(ai_response)
            
            # If not JSON, create structured content from text
            return {
                "overview": ai_response,
                "learning_outcomes": [
                    "Phát triển kiến thức chuyên môn về chủ đề",
                    "Nâng cao kỹ năng phân tích và tư duy phản biện",
                    "Vận dụng kiến thức vào thực tế"
                ],
                "modules": [],
                "teaching_strategies": [
                    "Dạy học theo dự án",
                    "Học tập qua giải quyết vấn đề",
                    "Thảo luận nhóm và trình bày"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error parsing curriculum content: {e}")
            return {
                "overview": ai_response,
                "learning_outcomes": [],
                "modules": [],
                "teaching_strategies": []
            }
    
    async def personalize_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cá nhân hóa nội dung"""
        
        content_id = data.get("content_id", "")
        student_profile = data.get("student_profile", {})
        learning_style = data.get("learning_style", "visual")
        adaptation_level = data.get("adaptation_level", "medium")
        
        try:
            # Get original content
            original_content = await self._get_content_by_id(content_id)
            
            # Create personalization prompt
            prompt = self._create_personalization_prompt(
                original_content, student_profile, learning_style, adaptation_level
            )
            
            ai_response = await self._call_ai(prompt)
            personalized_content = self._parse_personalized_content(ai_response)
            
            return {
                "success": True,
                "original_content": original_content,
                "personalized_content": personalized_content,
                "personalization_factors": {
                    "learning_style": learning_style,
                    "adaptation_level": adaptation_level,
                    "student_level": student_profile.get("level", "intermediate"),
                    "interests": student_profile.get("interests", [])
                },
                "confidence": 0.8
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Content personalization failed: {str(e)}",
                "confidence": 0.0
            }
    
    async def assess_content_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đánh giá chất lượng nội dung"""
        
        content = data.get("content", "")
        content_type = data.get("content_type", "lesson")
        criteria = data.get("criteria", list(self.quality_criteria.keys()))
        
        try:
            # Create assessment prompt
            prompt = self._create_quality_assessment_prompt(content, content_type, criteria)
            
            ai_response = await self._call_ai(prompt)
            assessment = self._parse_quality_assessment(ai_response, criteria)
            
            # Calculate overall score
            overall_score = self._calculate_overall_quality_score(assessment, criteria)
            
            return {
                "success": True,
                "assessment": assessment,
                "overall_score": overall_score,
                "recommendations": await self._generate_quality_recommendations(assessment),
                "confidence": 0.9
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Quality assessment failed: {str(e)}",
                "confidence": 0.0
            }
    
    # Helper methods
    def _initialize_templates(self) -> Dict[str, ContentTemplate]:
        """Khởi tạo templates mặc định"""
        templates = {}
        
        # Lesson templates
        templates["lesson_basic"] = ContentTemplate(
            id="lesson_basic",
            name="Basic Lesson Template",
            type="lesson",
            subject="general",
            level="beginner",
            structure={
                "sections": ["introduction", "main_content", "practice", "summary"],
                "duration_distribution": {"introduction": 10, "main_content": 40, "practice": 15, "summary": 5}
            },
            metadata={"version": "1.0", "author": "AI System"}
        )
        
        templates["lesson_advanced"] = ContentTemplate(
            id="lesson_advanced",
            name="Advanced Lesson Template",
            type="lesson",
            subject="general",
            level="advanced",
            structure={
                "sections": ["warm_up", "objectives", "main_content", "activities", "assessment", "conclusion"],
                "duration_distribution": {"warm_up": 5, "objectives": 5, "main_content": 45, "activities": 20, "assessment": 15, "conclusion": 5}
            },
            metadata={"version": "1.0", "author": "AI System"}
        )
        
        # Exercise templates
        templates["exercise_practice"] = ContentTemplate(
            id="exercise_practice",
            name="Practice Exercise Template",
            type="exercise",
            subject="general",
            level="intermediate",
            structure={
                "question_format": "problem_statement + solution + explanation",
                "difficulty_progression": "easy_to_hard"
            },
            metadata={"version": "1.0", "author": "AI System"}
        )
        
        return templates
    
    async def _get_template_for_lesson(self, subject: str, level: str) -> Optional[ContentTemplate]:
        """Lấy template phù hợp cho bài học"""
        template_key = f"lesson_{level}"
        return self.templates.get(template_key, self.templates.get("lesson_basic"))
    
    def _create_lesson_prompt(self, topic: str, subject: str, level: str, duration: int, objectives: List[str], template: Optional[ContentTemplate]) -> str:
        """Tạo prompt cho việc tạo bài học"""
        
        base_prompt = f"""
You are an expert educational content creator. Create a comprehensive lesson plan with the following specifications:

TOPIC: {topic}
SUBJECT: {subject}
LEVEL: {level}
DURATION: {duration} minutes
OBJECTIVES: {', '.join(objectives) if objectives else 'Generate appropriate objectives'}

"""
        
        if template:
            base_prompt += f"""
TEMPLATE STRUCTURE:
{json.dumps(template.structure, indent=2)}

Please follow this structure exactly and create engaging, educational content appropriate for the specified level.
"""
        
        base_prompt += """
REQUIREMENTS:
1. Clear learning objectives
2. Engaging introduction
3. Well-structured main content
4. Interactive practice activities
5. Concise summary
6. Age-appropriate language
7. Include examples and illustrations where relevant

OUTPUT FORMAT:
{
    "title": "Lesson Title",
    "objectives": ["objective1", "objective2", ...],
    "introduction": "Introduction content...",
    "main_content": [
        {
            "section": "Section 1",
            "content": "Content...",
            "duration": 15
        },
        ...
    ],
    "practice_activities": [
        {
            "activity": "Activity description",
            "type": "individual/group",
            "duration": 10
        },
        ...
    ],
    "summary": "Lesson summary...",
    "assessment": {
        "questions": ["question1", "question2", ...],
        "type": "formative"
    }
}
"""
        
        return base_prompt
    
    def _create_exercise_prompt(self, topic: str, exercise_type: str, difficulty: str, count: int) -> str:
        """Tạo prompt cho việc tạo bài tập"""
        
        return f"""
Create {count} {difficulty} level {exercise_type} exercises on the topic: {topic}

REQUIREMENTS:
1. Clear problem statements
2. Step-by-step solutions
3. Explanations for key concepts
4. Progressive difficulty
5. Variety of question formats

OUTPUT FORMAT:
{{
    "exercises": [
        {{
            "id": 1,
            "question": "Problem statement...",
            "type": "calculation/conceptual/application",
            "difficulty": "{difficulty}",
            "solution": {{
                "steps": ["step1", "step2", ...],
                "final_answer": "Answer",
                "explanation": "Explanation..."
            }},
            "hints": ["hint1", "hint2"],
            "time_estimate": 5
        }},
        ...
    ]
}}
"""
    
    def _create_exam_prompt(self, subject: str, topics: List[str], duration: int, question_types: List[str], total_points: int) -> str:
        """Tạo prompt cho việc tạo bài thi"""
        
        return f"""
Create a comprehensive {subject} exam covering the topics: {', '.join(topics)}

SPECIFICATIONS:
- Duration: {duration} minutes
- Total Points: {total_points}
- Question Types: {', '.join(question_types)}
- Balanced difficulty distribution

REQUIREMENTS:
1. Clear instructions
2. Point allocation for each question
3. Answer key
4. Grading rubric
5. Time recommendations per section

OUTPUT FORMAT:
{{
    "exam_info": {{
        "title": "Exam Title",
        "duration": {duration},
        "total_points": {total_points},
        "instructions": "General instructions..."
    }},
    "sections": [
        {{
            "name": "Section Name",
            "topics": ["topic1", "topic2"],
            "duration": 30,
            "points": 25,
            "questions": [
                {{
                    "id": 1,
                    "type": "multiple_choice/short_answer/essay",
                    "question": "Question text...",
                    "options": ["A", "B", "C", "D"],
                    "points": 5,
                    "answer": "Correct answer",
                    "rubric": "Grading criteria..."
                }},
                ...
            ]
        }},
        ...
    ],
    "answer_key": {{
        "answers": {{
            "1": "Answer to question 1",
            "2": "Answer to question 2",
            ...
        }},
        "grading_notes": "General grading guidelines..."
    }}
}}
"""
    
    def _create_quiz_prompt(self, topic: str, quiz_type: str, question_count: int, time_limit: int) -> str:
        """Tạo prompt cho việc tạo quiz"""
        
        return f"""
Create a {quiz_type} quiz with {question_count} questions on: {topic}

SPECIFICATIONS:
- Time limit: {time_limit} minutes
- Quick assessment format
- Mixed question types

OUTPUT FORMAT:
{{
    "quiz_info": {{
        "title": "Quiz Title",
        "topic": "{topic}",
        "time_limit": {time_limit},
        "instructions": "Quiz instructions..."
    }},
    "questions": [
        {{
            "id": 1,
            "type": "multiple_choice/true_false/fill_blank",
            "question": "Question text...",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Explanation...",
            "points": 1
        }},
        ...
    ]
}}
"""
    
    def _create_personalization_prompt(self, content: str, student_profile: Dict, learning_style: str, adaptation_level: str) -> str:
        """Tạo prompt cho việc cá nhân hóa nội dung"""
        
        return f"""
Adapt the following educational content for a specific student profile:

ORIGINAL CONTENT:
{content}

STUDENT PROFILE:
{json.dumps(student_profile, indent=2)}

LEARNING STYLE: {learning_style}
ADAPTATION LEVEL: {adaptation_level}

REQUIREMENTS:
1. Maintain educational objectives
2. Adapt to learning style (visual, auditory, kinesthetic, reading/writing)
3. Adjust difficulty based on student level
4. Incorporate student interests where relevant
5. Provide appropriate scaffolding

OUTPUT FORMAT:
{{
    "personalized_content": "Adapted content...",
    "adaptations_made": [
        "Adaptation 1 description",
        "Adaptation 2 description",
        ...
    ],
    "scaffolding_provided": {{
        "hints": ["hint1", "hint2"],
        "additional_resources": ["resource1", "resource2"],
        "support_tools": ["tool1", "tool2"]
    }},
    "accessibility_features": [
        "Feature 1",
        "Feature 2"
    ]
}}
"""
    
    def _create_quality_assessment_prompt(self, content: str, content_type: str, criteria: List[str]) -> str:
        """Tạo prompt cho việc đánh giá chất lượng"""
        
        return f"""
Assess the quality of the following {content_type} content:

CONTENT:
{content}

ASSESSMENT CRITERIA:
{', '.join(criteria)}

ASSESSMENT SCALE:
1-10 for each criterion (1=Poor, 10=Excellent)

REQUIREMENTS:
1. Evaluate each criterion objectively
2. Provide specific examples
3. Suggest improvements
4. Consider educational effectiveness

OUTPUT FORMAT:
{{
    "overall_assessment": {{
        "score": 8.5,
        "summary": "Overall quality summary..."
    }},
    "criteria_scores": {{
        "clarity": {{"score": 8, "feedback": "Specific feedback..."}},
        "accuracy": {{"score": 9, "feedback": "Specific feedback..."}},
        "engagement": {{"score": 7, "feedback": "Specific feedback..."}},
        "appropriateness": {{"score": 9, "feedback": "Specific feedback..."}}
    }},
    "strengths": ["Strength 1", "Strength 2"],
    "areas_for_improvement": ["Area 1", "Area 2"],
    "recommendations": [
        "Recommendation 1",
        "Recommendation 2"
    ]
}}
"""
    
    # Parsing methods
    def _parse_lesson_content(self, ai_response: str, template: Optional[ContentTemplate]) -> Dict[str, Any]:
        """Parse nội dung bài học từ AI response"""
        try:
            return json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback parsing
            return {
                "title": "Generated Lesson",
                "content": ai_response,
                "sections": ["introduction", "main_content", "practice", "summary"],
                "raw_response": ai_response
            }
    
    def _parse_exercise_content(self, ai_response: str) -> List[Dict[str, Any]]:
        """Parse nội dung bài tập từ AI response"""
        try:
            data = json.loads(ai_response)
            return data.get("exercises", [])
        except json.JSONDecodeError:
            # Fallback parsing
            return [{"question": ai_response, "type": "text"}]
    
    def _parse_exam_content(self, ai_response: str) -> Dict[str, Any]:
        """Parse nội dung bài thi từ AI response"""
        try:
            return json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback parsing
            return {"exam_info": {"title": "Generated Exam"}, "content": ai_response}
    
    def _parse_quiz_content(self, ai_response: str) -> Dict[str, Any]:
        """Parse nội dung quiz từ AI response"""
        try:
            return json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback parsing
            return {"quiz_info": {"title": "Generated Quiz"}, "questions": [{"question": ai_response}]}
    
    def _parse_personalized_content(self, ai_response: str) -> Dict[str, Any]:
        """Parse nội dung cá nhân hóa từ AI response"""
        try:
            return json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback parsing
            return {"personalized_content": ai_response}
    
    def _parse_quality_assessment(self, ai_response: str, criteria: List[str]) -> Dict[str, Any]:
        """Parse kết quả đánh giá chất lượng từ AI response"""
        try:
            return json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback parsing
            return {"overall_assessment": {"score": 7.0, "summary": ai_response}}
    
    # Additional helper methods
    async def _generate_objectives(self, topic: str, level: str, duration: int) -> List[str]:
        """Tạo objectives cho bài học"""
        prompt = f"Generate 3-5 learning objectives for a {level} level lesson on {topic} ({duration} minutes)"
        response = await self._call_ai(prompt)
        # Parse objectives from response
        return [obj.strip() for obj in response.split('\n') if obj.strip()][:5]
    
    async def _calculate_quality_score(self, content) -> float:
        """Tính điểm chất lượng nội dung"""
        # Simple heuristic based on content characteristics
        score = 7.0  # Base score
        
        # Handle both string and dict content
        content_str = ""
        if isinstance(content, str):
            content_str = content
        elif isinstance(content, dict):
            # Extract text content from dict
            if "content" in content:
                content_str = content["content"]
            elif "title" in content:
                content_str = f"{content.get('title', '')} {content.get('content', '')}"
            else:
                # Convert dict to string for analysis
                content_str = str(content)
        else:
            content_str = str(content)
        
        # Length factor
        if len(content_str) > 500:
            score += 0.5
        if len(content_str) > 2000:
            score += 0.5
            
        # Structure factor
        if "introduction" in content_str.lower() and "conclusion" in content_str.lower():
            score += 0.5
            
        # Clarity factor
        sentences = content_str.split('.')
        if len(sentences) > 10:
            score += 0.3
            
        return min(score, 10.0)
    
    async def _get_content_by_id(self, content_id: str) -> Dict[str, Any]:
        """Lấy nội dung theo ID (mock implementation)"""
        # In real implementation, this would query database
        return {"id": content_id, "content": "Sample content for demonstration"}
    
    def _calculate_overall_quality_score(self, assessment: Dict[str, Any], criteria: List[str]) -> float:
        """Tính điểm chất lượng tổng hợp"""
        total_score = 0
        total_weight = 0
        
        for criterion in criteria:
            if criterion in self.quality_criteria:
                weight = self.quality_criteria[criterion]
                score = assessment.get("criteria_scores", {}).get(criterion, {}).get("score", 5)
                total_score += score * weight
                total_weight += weight
                
        return total_score / total_weight if total_weight > 0 else 5.0
    
    async def _generate_quality_recommendations(self, assessment: Dict[str, Any]) -> List[str]:
        """Tạo recommendations dựa trên assessment"""
        recommendations = []
        
        # Extract areas for improvement
        areas = assessment.get("areas_for_improvement", [])
        for area in areas:
            recommendations.append(f"Improve {area.lower()}")
            
        # Add existing recommendations
        recommendations.extend(assessment.get("recommendations", []))
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    async def _call_ai(self, prompt: str) -> str:
        """Gọi AI model (mock implementation)"""
        try:
            # Call Ollama API
            response = await self.call_ollama(prompt)
            return response
        except Exception as e:
            # Fallback to mock response if API fails
            return json.dumps({
                "message": f"AI-generated content based on prompt: {prompt}",
                "status": "success",
                "error": str(e)
            })
    
    async def get_template(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Lấy template theo ID"""
        template_id = data.get("template_id", "")
        template = self.templates.get(template_id)
        
        if template:
            return {
                "success": True,
                "template": template,
                "confidence": 1.0
            }
        else:
            return {
                "success": False,
                "error": f"Template '{template_id}' not found",
                "available_templates": list(self.templates.keys()),
                "confidence": 0.0
            }
    
    async def create_template(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo template mới"""
        template_id = data.get("id", f"template_{len(self.templates) + 1}")
        
        new_template = ContentTemplate(
            id=template_id,
            name=data.get("name", "New Template"),
            type=data.get("type", "lesson"),
            subject=data.get("subject", "general"),
            level=data.get("level", "intermediate"),
            structure=data.get("structure", {}),
            metadata=data.get("metadata", {})
        )
        
        self.templates[template_id] = new_template
        
        return {
            "success": True,
            "template": new_template,
            "template_id": template_id,
            "confidence": 0.9
        }
