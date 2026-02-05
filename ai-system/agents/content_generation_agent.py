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
        super().__init__("content_generation_agent", "llama3:70b-instruct")
        self.description = "Agent chuyên tạo nội dung giáo dục với AI tiên tiến"
        self.capabilities = [
            "lesson_generation",        # Tạo bài học
            "exercise_generation",       # Tạo bài tập
            "exam_generation",          # Tạo bài thi
            "quiz_generation",           # Tạo câu hỏi nhanh
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
                    "ai_model": self.model_name,
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
    
    async def _calculate_quality_score(self, content: str) -> float:
        """Tính điểm chất lượng nội dung"""
        # Simple heuristic based on content characteristics
        score = 7.0  # Base score
        
        # Length factor
        if len(content) > 500:
            score += 0.5
        if len(content) > 2000:
            score += 0.5
            
        # Structure factor
        if "introduction" in content.lower() and "conclusion" in content.lower():
            score += 0.5
            
        # Clarity factor
        sentences = content.split('.')
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
        # In real implementation, this would call the actual AI model
        # For now, return a mock response
        return json.dumps({
            "message": "AI-generated content based on prompt",
            "status": "success"
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
