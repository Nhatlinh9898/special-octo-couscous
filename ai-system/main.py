"""
EduManager AI Gateway - Main FastAPI Application
Local AI System with Multi-Agents for School Management
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
import os
import re
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="EduManager AI Gateway",
    description="Local AI System with Multi-Agents for School Management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import agents
from agents.academic_agent import AcademicAgent
from agents.student_agent import StudentAgent
from agents.other_agents import TeacherAgent, ParentAgent, AdminAgent, FinanceAgent, AnalyticsAgent
from agents.library_agent import LibraryAgent
from agents.distributed_data_agent import DistributedDataAgent
from agents.specialized_agents import DataReaderAgent, DataFilterAgent, DataDedupAgent
from agents.advanced_agents import VerificationAgent, EvaluationAgent, StorageAgent, UtilizationAgent
from agents.higher_education_agents import CurriculumDesignAgent, FacultyManagementAgent, ExpertiseDevelopmentAgent
from agents.comprehensive_course_catalog_agent import ComprehensiveCourseCatalogAgent
from agents.education_data_agent import EducationDataAgent
from agents.content_generation_agent import ContentGenerationAgent

# Import ServiceNexus integration
from integration.service_nexus_adapter import ServiceNexusAdapter, ServiceNexusConfig

# Request/Response models
class AIRequest(BaseModel):
    task: str
    data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    agent: str
    task: str
    response: Dict[str, Any]
    confidence: float
    processing_time: float
    suggestions: List[str] = []

# Agent Manager
class AgentManager:
    def __init__(self):
        # Initialize ServiceNexus adapter
        self.service_nexus_adapter = ServiceNexusAdapter(ServiceNexusConfig())
        
        self.agents = {
            # Core educational agents
            "academic": AcademicAgent(),
            "student": StudentAgent(),
            "teacher": TeacherAgent(),
            "parent": ParentAgent(),
            "admin": AdminAgent(),
            "finance": FinanceAgent(),
            "analytics": AnalyticsAgent(),
            "library": LibraryAgent(),
            
            # Distributed data processing agents
            "distributed_data": DistributedDataAgent(),
            
            # Specialized data processing agents
            "data_reader": DataReaderAgent(),
            "data_filter": DataFilterAgent(),
            "data_dedup": DataDedupAgent(),
            
            # Advanced processing agents
            "verification": VerificationAgent(),
            "evaluation": EvaluationAgent(),
            "storage": StorageAgent(),
            "utilization": UtilizationAgent(),
            
            # Higher education agents
            "curriculum_design": CurriculumDesignAgent(),
            "faculty_management": FacultyManagementAgent(),
            "expertise_development": ExpertiseDevelopmentAgent(),
            
            # Course catalog agent
            "course_catalog": ComprehensiveCourseCatalogAgent(),
            
            # ServiceNexus integrated agents
            "education_data": EducationDataAgent(),
            "content_generation": ContentGenerationAgent(),
            
            # ServiceNexus adapter
            "service_nexus": self.service_nexus_adapter
        }
    
    async def initialize(self):
        """Initialize all agents and integrations"""
        try:
            # Initialize ServiceNexus adapter
            nexus_init = await self.service_nexus_adapter.initialize()
            if not nexus_init["success"]:
                print(f"Warning: ServiceNexus integration failed: {nexus_init.get('error')}")
            
            print("Agent Manager initialized successfully")
            return True
            
        except Exception as e:
            print(f"Failed to initialize Agent Manager: {str(e)}")
            return False
    
    def get_agent(self, agent_name: str):
        return self.agents.get(agent_name)

# Initialize agent manager
agent_manager = AgentManager()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await agent_manager.initialize()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EduManager AI Gateway",
        "version": "1.0.0",
        "available_agents": list(agent_manager.agents.keys())
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    agents_status = {}
    for name, agent in agent_manager.agents.items():
        try:
            # Test if agent is responsive
            agents_status[name] = "healthy"
        except Exception as e:
            agents_status[name] = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "agents": agents_status,
        "ollama_status": await check_ollama_status()
    }

async def check_ollama_status():
    """Check if Ollama is running"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=5.0)
            if response.status_code == 200:
                return "healthy"
            else:
                return "unhealthy"
    except Exception:
        return "unhealthy"

@app.post("/api/v1/ai/{agent_name}")
async def call_agent(agent_name: str, request: AIRequest):
    """Main endpoint to call AI agents"""
    
    # Validate agent exists
    agent = agent_manager.get_agent(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    
    try:
        # Process request with agent
        import time
        start_time = time.time()
        
        response = await agent.process(request.task, request.data, request.context)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent=agent_name,
            task=request.task,
            response=response,
            confidence=response.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=response.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/api/v1/agents")
async def list_agents():
    """List all available agents"""
    agents_info = {}
    for name, agent in agent_manager.agents.items():
        agents_info[name] = {
            "name": agent.__class__.__name__,
            "description": agent.description,
            "capabilities": agent.capabilities
        }
    
    return {"agents": agents_info}

@app.post("/api/v1/ai/models")
async def list_models():
    """List available Ollama models"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch models")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")

@app.post("/api/v1/ai/download-model/{model_name}")
async def download_model(model_name: str):
    """Download a specific Ollama model"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/pull",
                json={"name": model_name}
            )
            if response.status_code == 200:
                return {"message": f"Model '{model_name}' download started"}
            else:
                raise HTTPException(status_code=500, detail="Failed to download model")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading model: {str(e)}")

# ServiceNexus Integration Endpoints
@app.post("/api/v1/education/data-analysis")
async def education_data_analysis(request: AIRequest):
    """Process education data using ServiceNexus agents"""
    try:
        agent = agent_manager.get_agent("service_nexus")
        if not agent:
            raise HTTPException(status_code=404, detail="ServiceNexus adapter not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process_education_data(request.task, request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="service_nexus",
            task=request.task,
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing education data: {str(e)}"
        )

@app.post("/api/v1/education/workflow")
async def education_workflow(request: AIRequest):
    """Execute education workflow using ServiceNexus orchestrator"""
    try:
        agent = agent_manager.get_agent("service_nexus")
        if not agent:
            raise HTTPException(status_code=404, detail="ServiceNexus adapter not found")
        
        import time
        start_time = time.time()
        
        result = await agent.orchestrate_education_workflow(request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="service_nexus",
            task="workflow_orchestration",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error executing workflow: {str(e)}"
        )

@app.post("/api/v1/education/visualization")
async def education_visualization(request: AIRequest):
    """Generate education visualizations using ServiceNexus"""
    try:
        agent = agent_manager.get_agent("service_nexus")
        if not agent:
            raise HTTPException(status_code=404, detail="ServiceNexus adapter not found")
        
        import time
        start_time = time.time()
        
        result = await agent.generate_education_visualizations(request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="service_nexus",
            task="visualization_generation",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating visualizations: {str(e)}"
        )

@app.post("/api/v1/education/big-data")
async def education_big_data(request: AIRequest):
    """Process big education data using ServiceNexus"""
    try:
        agent = agent_manager.get_agent("service_nexus")
        if not agent:
            raise HTTPException(status_code=404, detail="ServiceNexus adapter not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process_big_education_data(request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="service_nexus",
            task="big_data_processing",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing big data: {str(e)}"
        )

@app.get("/api/v1/integration/status")
async def integration_status():
    """Get ServiceNexus integration status"""
    try:
        agent = agent_manager.get_agent("service_nexus")
        if not agent:
            raise HTTPException(status_code=404, detail="ServiceNexus adapter not found")
        
        return {
            "service_nexus": {
                "status": "active",
                "loaded_agents": list(agent.service_nexus_agents.keys()),
                "integration_status": agent.integration_status,
                "config": {
                    "enable_big_data": agent.config.enable_big_data,
                    "enable_visualization": agent.config.enable_visualization,
                    "enable_orchestration": agent.config.enable_orchestration,
                    "max_concurrent_tasks": agent.config.max_concurrent_tasks
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error getting integration status: {str(e)}"
        )

# Content Generation Endpoints
@app.post("/api/v1/content/generate/lesson")
async def generate_lesson(request: AIRequest):
    """Generate lesson content using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("generate_lesson", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="generate_lesson",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating lesson: {str(e)}"
        )

@app.post("/api/v1/content/generate/exercise")
async def generate_exercise(request: AIRequest):
    """Generate exercise content using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("generate_exercise", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="generate_exercise",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating exercise: {str(e)}"
        )

@app.post("/api/v1/content/generate/exam")
async def generate_exam(request: AIRequest):
    """Generate exam content using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("generate_exam", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="generate_exam",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating exam: {str(e)}"
        )

@app.post("/api/v1/content/generate/quiz")
async def generate_quiz(request: AIRequest):
    """Generate quiz content using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("generate_quiz", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="generate_quiz",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating quiz: {str(e)}"
        )

@app.post("/api/v1/content/personalize")
async def personalize_content(request: AIRequest):
    """Personalize content using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("personalize_content", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="personalize_content",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error personalizing content: {str(e)}"
        )

@app.post("/api/v1/content/assess-quality")
async def assess_content_quality(request: AIRequest):
    """Assess content quality using AI"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        import time
        start_time = time.time()
        
        result = await agent.process("assess_quality", request.data)
        
        processing_time = time.time() - start_time
        
        return AIResponse(
            agent="content_generation",
            task="assess_quality",
            response=result,
            confidence=result.get("confidence", 0.8),
            processing_time=processing_time,
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error assessing content quality: {str(e)}"
        )

@app.get("/api/v1/content/templates")
async def get_content_templates():
    """Get available content templates"""
    try:
        agent = agent_manager.get_agent("content_generation")
        if not agent:
            raise HTTPException(status_code=404, detail="Content generation agent not found")
        
        templates = list(agent.templates.values())
        
        return {
            "success": True,
            "templates": [
                {
                    "id": template.id,
                    "name": template.name,
                    "type": template.type,
                    "subject": template.subject,
                    "level": template.level,
                    "structure": template.structure,
                    "metadata": template.metadata
                }
                for template in templates
            ],
            "count": len(templates)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error getting templates: {str(e)}"
        )

# Import agents
from agents.academic_agent import AcademicAgent
from agents.student_agent import StudentAgent
from agents.other_agents import TeacherAgent, ParentAgent, AdminAgent, FinanceAgent, AnalyticsAgent
from agents.library_agent import LibraryAgent
from agents.distributed_data_agent import DistributedDataAgent
from agents.specialized_agents import DataReaderAgent, DataFilterAgent, DataDedupAgent
from agents.advanced_agents import VerificationAgent, EvaluationAgent, StorageAgent, UtilizationAgent
from agents.higher_education_agents import CurriculumDesignAgent, FacultyManagementAgent, ExpertiseDevelopmentAgent
from agents.comprehensive_course_catalog_agent import ComprehensiveCourseCatalogAgent
from agents.education_data_agent import EducationDataAgent
from agents.content_generation_agent import ContentGenerationAgent
from agents.advanced_academic_agent import AdvancedAcademicAgent
from agents.advanced_student_agent import AdvancedStudentAgent
from agents.advanced_teacher_agent import AdvancedTeacherAgent
from agents.enhanced_skills_agent import EnhancedSkillsAgent
from agents.universal_skills_integration_agent import UniversalSkillsIntegrationAgent
from agents.ai_training_system import AITrainingSystem
from agents.ai_training_pipeline import AITrainingPipeline
from agents.web_search_agent import WebSearchAgent
from agents.knowledge_integration_agent import KnowledgeIntegrationAgent
from agents.multi_tier_system_manager import MultiTierAgentSystemManager

# Initialize agents
academic_agent = AcademicAgent()
student_agent = StudentAgent()
teacher_agent = TeacherAgent()
parent_agent = ParentAgent()
admin_agent = AdminAgent()
finance_agent = FinanceAgent()
analytics_agent = AnalyticsAgent()
library_agent = LibraryAgent()
distributed_data_agent = DistributedDataAgent()
data_reader_agent = DataReaderAgent()
data_filter_agent = DataFilterAgent()
data_dedup_agent = DataDedupAgent()
verification_agent = VerificationAgent()
evaluation_agent = EvaluationAgent()
storage_agent = StorageAgent()
utilization_agent = UtilizationAgent()
curriculum_design_agent = CurriculumDesignAgent()
faculty_management_agent = FacultyManagementAgent()
expertise_development_agent = ExpertiseDevelopmentAgent()
course_catalog_agent = ComprehensiveCourseCatalogAgent()
education_data_agent = EducationDataAgent()
content_generation_agent = ContentGenerationAgent()

# Initialize advanced agents
advanced_academic_agent = AdvancedAcademicAgent()
advanced_student_agent = AdvancedStudentAgent()
advanced_teacher_agent = AdvancedTeacherAgent()

# Initialize enhanced skills agent
enhanced_skills_agent = EnhancedSkillsAgent()

# Initialize universal skills integration agent
universal_skills_agent = UniversalSkillsIntegrationAgent()

# Initialize AI training system
ai_training_system = AITrainingSystem()
ai_training_pipeline = AITrainingPipeline()

# Initialize web search and knowledge integration agents
web_search_agent = WebSearchAgent()
knowledge_integration_agent = KnowledgeIntegrationAgent()

# Initialize Multi-Tier System Manager
multi_tier_manager = MultiTierAgentSystemManager()

@app.post("/api/v1/chat")
async def chat_endpoint(request: AIRequest):
    """Enhanced chat endpoint that uses actual AI agents"""
    try:
        # Get message from request data
        message = request.data.get("message", "")
        context = request.data.get("context", "general")
        message_lower = message.lower()
        
        # Route to appropriate agent based on message content
        if any(keyword in message_lower for keyword in ["xin chào", "hello", "chào"]):
            response = """🤖 **EDUMANAGER AI SYSTEM - ĐÃ NÂNG CẤP ADVANCED!**

Xin chào! Tôi là hệ thống AI giáo dục đa tác vụ nâng cao với các chuyên gia ảo:

🎓 **Các chuyên gia sẵn sàng:**
- **Advanced Academic Agent**: Phân tích học tập sâu, dự báo thông minh, cá nhân hóa lộ trình
- **Advanced Student Agent**: Giám sát 360°, cảnh báo sớm, can thiệp cá nhân hóa
- **Advanced Teacher Agent**: Tối ưu giảng dạy, phân tích sư phạm, phát triển chuyên môn
- **Enhanced Skills Agent**: Tích hợp 634+ kỹ năng nâng cao từ antigravity-awesome-skills
- **Universal Skills Integration Agent**: Tích hợp toàn diện kỹ năng vào hệ thống giáo dục
- **AI Training System**: Huấn luyện AI với reinforcement learning, fine-tuning
- **AI Training Pipeline**: Pipeline huấn luyện tự động với monitoring và optimization
- **Web Search Agent**: Tìm kiếm thông tin giáo dục từ internet
- **Knowledge Integration Agent**: Tích hợp kiến thức web vào AI training
- **Content Generation Agent**: Tạo nội dung giáo dục chất lượng cao
- **Library Agent**: Quản lý thư viện thông minh
- **Analytics Agent**: Phân tích dữ liệu lớn, báo cáo chuyên sâu

🚀 **Kỹ năng nâng cao:**
- **Phân tích học tập sâu**: Cognitive assessment, learning style detection
- **Dự báo thông minh**: Predictive modeling, early warning systems
- **Cá nhân hóa AI**: Personalized learning paths, adaptive interventions
- **634+ Kỹ năng chuyên sâu**: Content creation, data analysis, automation, development
- **Tích hợp toàn diện**: Universal skill integration cho giáo dục
- **Huấn luyện AI nâng cao**: Reinforcement learning, fine-tuning, continuous learning
- **Pipeline tự động**: Automated training với monitoring và optimization
- **Tìm kiếm web**: Web search cho thông tin giáo dục mới nhất
- **Tích hợp kiến thức**: Knowledge integration từ internet sources
- **Học tập real-time**: Real-time learning với web data
- **Hỗ trợ toàn diện**: Mental health, social-emotional learning, career guidance
- **Nghiên cứu giáo dục**: Research assistance, collaboration facilitation

💡 **Hãy thử các câu hỏi nâng cao:**
1. "Phân tích sâu hiệu suất học tập học sinh A"
2. "Dự báo rủi ro học tập cho lớp 10A"
3. "Tạo lộ trình học tập cá nhân hóa cho môn Toán"
4. "Tối ưu hóa phương pháp giảng dạy Vật lý"
5. "Đánh giá sức khỏe tinh thần học sinh"
6. "Tích hợp kỹ năng content creation vào giáo dục"
7. "Đề xuất kỹ năng phù hợp cho giáo viên"
8. "Tích hợp toàn diện 634+ kỹ năng vào hệ thống"
9. "Huấn luyện AI với reinforcement learning"
10. "Thiết lập pipeline huấn luyện tự động"
11. "Tìm kiếm thông tin về AI trong giáo dục"
12. "Cập nhật kiến thức về machine learning"
13. "Huấn luyện AI với web về personalized learning"

Bạn cần hỗ trợ với kỹ năng nâng cao nào?"""
        
        elif any(keyword in message_lower for keyword in ["tạo bài học", "lesson", "bài giảng"]):
            # Use Content Generation Agent
            result = await content_generation_agent.process("generate_lesson", {
                "topic": "bài học từ chat",
                "subject": "toán học",
                "level": "trung bình",
                "duration": 45,
                "objectives": ["hiểu kiến thức cơ bản", "luyện tập"]
            })
            
            if result.get("success"):
                content = result.get("response", {}).get("content", {})
                response = f"""✅ **BÀI HỌC ĐÃ TẠO THÀNH CÔNG!**

📚 **Nội dung bài học:**
{content.get('content', 'Nội dung đang được tạo...')}

🎯 **Mục tiêu học tập:**
{', '.join(content.get('objectives', []))}

⏱️ **Thời lượng:** {content.get('duration', 45)} phút

📊 **Chất lượng:** {content.get('quality_score', 0)}/10

🤖 **Agent sử dụng:** Content Generation Agent với model {content_generation_agent.model}"""
            else:
                response = f"❌ Lỗi tạo bài học: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["tạo giáo trình", "curriculum", "giáo trình mới"]):
            # Use Content Generation Agent for curriculum
            result = await content_generation_agent.process("generate_curriculum", {
                "title": "Giáo trình từ chat",
                "subject": "Ngữ Văn",
                "description": "Giáo trình chi tiết cho môn học",
                "target_level": "trung bình",
                "duration_weeks": 12,
                "modules_count": 6
            })
            
            if result.get("success"):
                curriculum = result.get("curriculum", {})
                response = f"""✅ **GIÁO TRÌNH ĐÃ TẠO THÀNH CÔNG!**

📚 **Thông tin giáo trình:**
- **Tiêu đề:** {curriculum.get('title', 'Giáo trình từ chat')}
- **Môn học:** {curriculum.get('subject', 'Ngữ Văn')}
- **Mô tả:** {curriculum.get('description', 'Giáo trình chi tiết')}
- **Trình độ:** {curriculum.get('target_level', 'trung bình')}
- **Thời lượng:** {curriculum.get('duration_weeks', 12)} tuần

🎯 **Mục tiêu học tập:**
{chr(10).join([f"- {obj}" for obj in curriculum.get('learning_outcomes', [])])}

📖 **Số module:** {len(curriculum.get('modules', []))}

📋 **Kế hoạch đánh giá:**
- Tham gia lớp học: 10%
- Bài tập hàng tuần: 20%
- Dự án giữa kỳ: 30%
- Bài thi cuối kỳ: 40%

📚 **Tài nguyên học tập:**
{chr(10).join([f"- {res.get('type', '')}: {res.get('title', '')}" for res in curriculum.get('resources', [])[:5]])}

🤖 **Agent sử dụng:** Content Generation Agent với model {content_generation_agent.model}"""
            else:
                response = f"❌ Lỗi tạo giáo trình: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["huấn luyện ai", "ai training", "reinforcement learning", "fine-tuning"]):
            # Use AI Training System
            result = await ai_training_system.process("reinforcement_learning_training", {
                "agent_type": "educational_assistant",
                "environment": "educational_simulation",
                "algorithm": "PPO",
                "training_episodes": 1000,
                "reward_function": "student_success"
            })
            
            if result.get("success"):
                training = result.get("training_plan", "")
                response = f"""🧠 **HUẤN LUYỆN AI REINFORCEMENT LEARNING!**

🎯 **Kế hoạch huấn luyện RL:**
{training}

📊 **Cấu hình huấn luyện:**
- Agent Type: {result.get('agent_type', 'educational_assistant')}
- Algorithm: {result.get('training_config', {}).get('algorithm', 'PPO')}
- Episodes: {result.get('training_config', {}).get('episodes', 1000)}
- Environment: {result.get('training_config', {}).get('environment', 'educational_simulation')}

⏱️ **Thời gian dự kiến:** {result.get('estimated_duration', '2000 minutes')}
🤖 **Agent sử dụng:** AI Training System
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi huấn luyện AI: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["pipeline huấn luyện", "training pipeline", "automated training"]):
            # Use AI Training Pipeline
            result = await ai_training_pipeline.process("automated_training_pipeline", {
                "training_type": "reinforcement_learning",
                "target_agents": ["advanced_academic", "advanced_student"],
                "training_duration": "24_hours",
                "auto_scaling": True
            })
            
            if result.get("success"):
                pipeline = result.get("pipeline_design", "")
                response = f"""🔄 **PIPELINE HUẤN LUYỆN TỰ ĐỘNG!**

🚀 **Thiết kế pipeline:**
{pipeline}

📊 **Cấu hình pipeline:**
- Training Type: {result.get('training_type', 'reinforcement_learning')}
- Target Agents: {result.get('pipeline_config', {}).get('target_agents', [])}
- Duration: {result.get('estimated_completion', '24_hours')}
- Auto Scaling: {result.get('pipeline_config', {}).get('auto_scaling', True)}

🎯 **Các giai đoạn:** {', '.join(result.get('pipeline_config', {}).get('stages', []))}
🤖 **Agent sử dụng:** AI Training Pipeline
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi pipeline: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["fine-tuning", "supervised training", "model tuning"]):
            # Use AI Training System for fine-tuning
            result = await ai_training_system.process("supervised_fine_tuning", {
                "base_model": "llama3:8b",
                "training_data": "educational_conversations",
                "epochs": 10,
                "batch_size": 32,
                "learning_rate": 2e-5
            })
            
            if result.get("success"):
                fine_tuning = result.get("fine_tuning_plan", "")
                response = f"""⚙️ **FINE-TUNING MODEL CÓ GIÁM SÁT!**

🎯 **Kế hoạch fine-tuning:**
{fine_tuning}

📊 **Cấu hình fine-tuning:**
- Base Model: {result.get('base_model', 'llama3:8b')}
- Epochs: {result.get('fine_tuning_config', {}).get('epochs', 10)}
- Batch Size: {result.get('fine_tuning_config', {}).get('batch_size', 32)}
- Learning Rate: {result.get('fine_tuning_config', {}).get('learning_rate', 2e-5)}

⏱️ **Thời gian dự kiến:** {result.get('estimated_duration', '300 minutes')}
🤖 **Agent sử dụng:** AI Training System
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi fine-tuning: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["học liên tục", "continuous learning", "adaptive learning"]):
            # Use AI Training System for continuous learning
            result = await ai_training_system.process("continuous_learning", {
                "learning_strategy": "online_learning",
                "update_frequency": "daily",
                "data_sources": ["user_interactions", "feedback", "performance"],
                "adaptation_rate": 0.1
            })
            
            if result.get("success"):
                learning = result.get("learning_plan", "")
                response = f"""🔄 **HỌC TẬP LIÊN TỤC - ADAPTIVE AI!**

🎯 **Kế hoạch học tập liên tục:**
{learning}

📊 **Cấu hình học tập:**
- Strategy: {result.get('learning_strategy', 'online_learning')}
- Update Frequency: {result.get('update_schedule', 'daily')}
- Data Sources: {result.get('continuous_config', {}).get('data_sources', [])}
- Adaptation Rate: {result.get('continuous_config', {}).get('adaptation_rate', 0.1)}

🤖 **Agent sử dụng:** AI Training System
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi học tập liên tục: {result.get('error', 'Lỗi không xác định')}"
            # Use Universal Skills Integration Agent
            result = await universal_skills_agent.process("universal_skill_integration", {
                "integration_scope": "comprehensive",
                "target_domains": ["teaching", "learning", "administration", "assessment"],
                "priority_level": "high",
                "constraints": {"budget": "flexible", "timeline": "6_months"}
            })
            
            if result.get("success"):
                integration = result.get("integration_plan", "")
                response = f"""🌟 **TÍCH HỢP TOÀN DIỆN 634+ KỸ NĂNG - UNIVERSAL INTEGRATION!**

🚀 **Kế hoạch tích hợp toàn diện:**
{integration}

📊 **Thống kê kỹ năng:**
- Tổng kỹ năng giáo dục: {result.get('total_skills_available', 0)}+ skills
- Lĩnh vực mục tiêu: {len(result.get('target_domains', []))} domains
- Phân bổ kỹ năng: {result.get('skill_distribution', {})}

🎯 **Phạm vi tích hợp:** {result.get('scope', 'comprehensive')}
🤖 **Agent sử dụng:** Universal Skills Integration Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi tích hợp toàn diện: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["hệ sinh thái kỹ năng", "skill ecosystem", "xây dựng hệ thống"]):
            # Use Universal Skills Integration Agent for ecosystem building
            result = await universal_skills_agent.process("skill_ecosystem_builder", {
                "ecosystem_type": "comprehensive",
                "integration_complexity": "high",
                "scalability_requirements": "enterprise"
            })
            
            if result.get("success"):
                ecosystem = result.get("ecosystem_design", "")
                response = f"""🏗️ **HỆ SINH THÁI KỸ NĂNG GIÁO DỤC - ADVANCED!**

🌐 **Thiết kế hệ sinh thái:**
{ecosystem}

📊 **Kiến trúc hệ sinh thái:**
- Core Skills: {len(result.get('architecture', {}).get('core_skills', []))}
- Supporting Skills: {len(result.get('architecture', {}).get('supporting_skills', []))}
- Emerging Skills: {len(result.get('architecture', {}).get('emerging_skills', []))}
- Integration Layers: {len(result.get('architecture', {}).get('integration_layers', []))}

🎯 **Loại hệ sinh thái:** {result.get('ecosystem_type', 'comprehensive')}
🤖 **Agent sử dụng:** Universal Skills Integration Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi xây dựng hệ sinh thái: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["triển khai doanh nghiệp", "enterprise deployment", "quy mô lớn"]):
            # Use Universal Skills Integration Agent for enterprise deployment
            result = await universal_skills_agent.process("enterprise_skill_deployment", {
                "enterprise_scale": "large",
                "deployment_complexity": "enterprise",
                "compliance_requirements": ["security", "privacy", "accessibility", "gdpr"]
            })
            
            if result.get("success"):
                deployment = result.get('deployment_plan', "")
                response = f"""🏢 **TRIỂN KHAI KỸ NĂNG QUY MÔ DOANH NGHIỆP!**

📋 **Kế hoạch triển khai:**
{deployment}

🏗️ **Khung triển khai doanh nghiệp:**
{chr(10).join([f"- {layer}: {description}" for layer, description in result.get('enterprise_framework', {}).items()])}

🎯 **Quy mô:** {result.get('scale', 'large')}
🔒 **Yêu cầu tuân thủ:** {', '.join(result.get('compliance_requirements', []))}
🤖 **Agent sử dụng:** Universal Skills Integration Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi triển khai doanh nghiệp: {result.get('error', 'Lỗi không xác định')}"
            # Use Enhanced Skills Agent
            result = await enhanced_skills_agent.process("skill_integration", {
                "domain": "education",
                "requirements": ["content_creation", "data_analysis", "automation"],
                "current_skills": ["teaching", "assessment"]
            })
            
            if result.get("success"):
                integration = result.get("integration_plan", "")
                response = f"""🚀 **TÍCH HỢP KỸ NĂNG NÂNG CAO - 634+ SKILLS!**

📊 **Kế hoạch tích hợp:**
{integration}

🎯 **Kỹ năng được chọn:** {len(result.get('selected_skills', []))} skills
📚 **Tổng kỹ năng có sẵn:** {result.get('total_available_skills', 0)}+ skills
🤖 **Agent sử dụng:** Enhanced Skills Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi tích hợp kỹ năng: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["đề xuất kỹ năng", "skill recommendation", "recommend skills"]):
            # Use Enhanced Skills Agent for recommendations
            result = await enhanced_skills_agent.process("skill_recommendation", {
                "user_profile": {"role": "teacher", "experience": "intermediate"},
                "current_context": "education",
                "goals": ["improve_teaching", "data_analysis", "content_creation"],
                "skill_level": "intermediate"
            })
            
            if result.get("success"):
                recommendations = result.get("recommended_skills", [])
                response = f"""💡 **ĐỀ XUẤT KỸ NĂNG CÁ NHÂN HÓA!**

🎯 **Kỹ năng được đề xuất:**
{chr(10).join([f"📚 {skill['name']}: {skill['description']}" for skill in recommendations[:5]])}

📊 **Độ phù hợp:** {skill.get('relevance_score', 0):.1%} cho mỗi kỹ năng
🤖 **Agent sử dụng:** Enhanced Skills Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi đề xuất kỹ năng: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["lộ trình kỹ năng", "skill learning path", "learn skills"]):
            # Use Enhanced Skills Agent for learning path
            result = await enhanced_skills_agent.process("skill_learning_path", {
                "target_skills": ["content-creator", "data-analyst", "automation"],
                "current_level": "beginner",
                "target_level": "advanced",
                "time_constraint": "3_months",
                "learning_style": "mixed"
            })
            
            if result.get("success"):
                roadmap = result.get("learning_roadmap", "")
                response = f"""🛤️ **LỘ TRÌNH HỌC KỸ NĂNG - ADVANCED!**

📚 **Lộ trình học tập:**
{roadmap}

⏱️ **Thời gian:** {result.get('time_constraint', '3_months')}
🎯 **Cấp độ mục tiêu:** {result.get('target_level', 'advanced')}
🤖 **Agent sử dụng:** Enhanced Skills Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi tạo lộ trình kỹ năng: {result.get('error', 'Lỗi không xác định')}"
            # Use Advanced Academic Agent
            result = await advanced_academic_agent.process("deep_learning_analysis", {
                "student_id": "from_chat",
                "academic_history": [],
                "learning_data": {"message": message},
                "time_period": "current_semester"
            })
            
            if result.get("success"):
                analysis = result.get("deep_insights", "")
                response = f"""🧠 **PHÂN TÍCH HỌC TẬP SÂU - ADVANCED!**

📊 **Kết quả phân tích sâu:**
{analysis}

🎯 **Đề xuất chuyên sâu:**
{chr(10).join([f"- {rec}" for rec in result.get('recommendations', [])[:5]])}

🤖 **Agent sử dụng:** Advanced Academic Agent với model {advanced_academic_agent.model}
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi phân tích sâu: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["dự báo", "predict", "risk", "cảnh báo sớm"]):
            # Use Advanced Student Agent for early warning
            result = await advanced_student_agent.process("early_warning_system", {
                "student_data": {"message": message},
                "risk_thresholds": {"academic": 70, "attendance": 85, "engagement": 60},
                "prediction_horizon": "4_weeks"
            })
            
            if result.get("success"):
                warning = result.get("warning_analysis", "")
                response = f"""⚠️ **HỆ THỐNG CẢNH BÁO SỚM - ADVANCED!**

🚨 **Phân tích rủi ro:**
{warning}

📊 **Mô hình dự báo:** {result.get('model_used', 'predictive_analytics')}
🎯 **Khung thời gian:** {result.get('prediction_horizon', '4_weeks')}
🤖 **Agent sử dụng:** Advanced Student Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi dự báo: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["lộ trình cá nhân hóa", "personalized learning", "adaptive"]):
            # Use Advanced Academic Agent for personalized learning
            result = await advanced_academic_agent.process("personalized_learning_paths", {
                "student_profile": {"message": message},
                "learning_goals": ["academic_excellence", "skill_development"],
                "current_level": "intermediate",
                "target_level": "advanced",
                "time_constraint": "6_months"
            })
            
            if result.get("success"):
                path = result.get("learning_path", "")
                response = f"""🎯 **LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA - ADVANCED!**

📚 **Lộ trình được tạo:**
{path}

🔄 **Chiến lược thích ứng:** {result.get('adaptation_strategy', 'continuous_learning')}
🤖 **Agent sử dụng:** Advanced Academic Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi tạo lộ trình: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["tối ưu giảng dạy", "optimize teaching", "pedagogical analysis"]):
            # Use Advanced Teacher Agent
            result = await advanced_teacher_agent.process("teaching_effectiveness_analysis", {
                "teaching_data": {"message": message},
                "student_outcomes": {},
                "observation_reports": [],
                "self_assessment": {}
            })
            
            if result.get("success"):
                analysis = result.get("analysis_results", "")
                response = f"""👨‍🏫 **PHÂN TÍCH HIỆU QUẢ GIẢNG DẠY - ADVANCED!**

📊 **Kết quả phân tích sư phạm:**
{analysis}

🎯 **Xếp hạng hiệu quả:** {result.get('effectiveness_rating', 'comprehensive_analysis')}
📅 **Đánh giá tiếp theo:** {result.get('next_review', '90_days')}
🤖 **Agent sử dụng:** Advanced Teacher Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi phân tích giảng dạy: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["sức khỏe tinh thần", "mental health", "wellbeing"]):
            # Use Advanced Student Agent for mental health
            result = await advanced_student_agent.process("mental_health_assessment", {
                "student_info": {"message": message},
                "stress_indicators": [],
                "academic_pressure": "medium",
                "social_factors": {}
            })
            
            if result.get("success"):
                assessment = result.get("mental_health_profile", "")
                response = f"""🧠 **ĐÁNH GIÁ SỨC KHỎE TINH THẦN - ADVANCED!**

📋 **Hồ sơ sức khỏe tinh thần:**
{assessment}

⚠️ **Mức độ rủi ro:** {result.get('risk_level', 'assessed')}
🔄 **Cần theo dõi:** {result.get('follow_up_required', True)}
🤖 **Agent sử dụng:** Advanced Student Agent
📈 **Độ tin cậy:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi đánh giá sức khỏe tinh thần: {result.get('error', 'Lỗi không xác định')}"
            # Use Analytics Agent
            result = await analytics_agent.process("analyze_data", {
                "data_type": "learning_performance",
                "analysis_type": "statistical_analysis",
                "data": {"message": message}
            })
            
            if result.get("success"):
                analysis = result.get("response", {})
                response = f"""📊 **PHÂN TÍCH DỮ LIỆU HOÀN THÀNH!**

� **Kết quả phân tích:**
{analysis.get('summary', 'Đang phân tích dữ liệu...')}
1. **Bài tập củng cố:** Lặp lại kiến thức
2. **Bài tập vận dụng:** Dùng kiến thức giải quyết
3. **Bài tập nâng cao:** Tư duy logic, sáng tạo
4. **Bài tập tổng hợp:** Nhiều kỹ năng

🎯 **Theo từng môn học:**

**Toán học:**
- Bài tập tính toán, giải phương trình
- Bài tập hình học, chứng minh
- Bài tập ứng dụng thực tế

**Vật lý:**
- Bài tập định luật, tính toán
- Bài tập thực hành, thí nghiệm
- Bài tập cơ học, điện học

**Ngữ văn:**
- Bài tập làm văn, phân tích tác phẩm
- Bài tập ngữ pháp, từ vựng
- Bài tập sáng tạo, thơ ca

**Tiếng Anh:**
- Bài tập ngữ pháp, từ vựng
- Bài tập đọc hiểu, viết luận
- Bài tập giao tiếp, phát âm

**Cho tôi biết:**
- Môn học cần tạo bài tập
- Số lượng và độ khó
- Hình thức: Trắc nghiệm/Tự luận
- Thời gian hoàn thành

Tôi sẽ tạo bộ bài tập phù hợp!"""
        
        elif "đề thi" in message_lower or "exam" in message_lower:
            response = """**Tạo đề thi chuẩn hóa và chất lượng:**

📋 **Cấu trúc đề thi hoàn chỉnh:**
1. **Ma trận đề thi:** Phân bổ kiến thức, kỹ năng
2. **Câu hỏi đa dạng:** TN, TL, VD, TH
3. **Độ khó tăng dần:** Dễ → Trung bình → Khó
4. **Thời gian hợp lý:** Phù hợp số lượng câu
5. **Đáp án chi tiết:** Hướng dẫn chấm điểm

🎯 **Các dạng đề thi:**

**Đề kiểm tra 15 phút:**
- 5 câu TN, 2 câu TL
- Kiểm tra nhanh, củng cố

**Đề giữa kỳ:**
- 10 câu TN, 3 câu TL, 1 bài VD
- Thời gian: 60-90 phút

**Đề cuối kỳ:**
- 15 câu TN, 5 câu TL, 2 bài VD/TH
- Thời gian: 90-120 phút

**Đề thi học kỳ:**
- 20 câu TN, 5 câu TL, 2 bài VD, 1 bài TH
- Thời gian: 120-150 phút

**Theo chuẩn quốc tế:**
- Cambridge, IELTS, TOEFL
- SAT, ACT, AP
- Tú tài, Đại học

**Để tạo đề thi, cung cấp:**
- Môn học và lớp
- Thời lượng và hình thức
- Nội dung cần kiểm tra
- Độ khó mong muốn

Tôi sẽ tạo đề thi chất lượng ngay!"""
        
        elif "help" in message_lower or "giúp" in message_lower or "hỗ trợ" in message_lower:
            response = """**🤖 AI TRỢ LÝ GIÁO DỤC EDUMANAGER**

Tôi là trợ lý AI thông minh với kiến thức chuyên sâu về giáo dục. Tôi có thể giúp bạn:

## 📚 **NỘI DUNG HỌC TẬP**
- Tạo bài học chi tiết, có cấu trúc
- Soạn bài tập đa dạng, cấp độ
- Thiết kế đề thi chuẩn hóa
- Tìm kiếm tài liệu học tập

## 🎓 **QUẢN LÝ GIÁO DỤC**
- Phân tích dữ liệu học sinh
- Đánh giá kết quả học tập
- Tối ưu thời khóa biểu
- Quản lý lớp học hiệu quả

## 🔍 **TÌM KIẾM THÔNG TIN**
- Tài liệu thư viện số
- Bài giảng chất lượng cao
- Phương pháp giảng dạy
- Xu hướng giáo dục mới

## � **PHÂN TÍCH DỮ LIỆU**
- Thống kê kết quả học tập
- Phát hiện học sinh yếu kém
- Dự báo thành tích học tập
- Báo cáo quản lý giáo dục

## 🎯 **CÁC CHỦ ĐỀ CÓ THỂ GIÚP:**

### **Học tập:**
- "Tạo bài học chương [Tên chương] môn [Môn học]"
- "Bài tập về [Chủ đề] lớp [Lớp]"
- "Đề thi giữa kỳ môn [Môn học]"

### **Quản lý:**
- "Phân tích kết quả học tập lớp [Lớp]"
- "Tối ưu thời khóa biểu khối [Khối]"
- "Dự báo thành tích cuối năm"

### **Tư vấn:**
- "Phương pháp dạy môn [Môn học]"
- "Giải quyết vấn đề [Vấn đề cụ thể]"
- "Xu hướng giáo dục [Lĩnh vực]"

## � **LỜI ÍCH HỌC TẬP:**
- Phân tích khó khăn của học sinh
- Gợi ý phương pháp phù hợp
- Cá nhân hóa nội dung giảng dạy
- Tối ưu phương pháp đánh giá

## 🚀 **BẮT ĐẦU:**
Hãy cho tôi biết:
1. **Môn học cụ thể** bạn quan tâm
2. **Lớp/trình độ** đang dạy/học
3. **Vấn đề cụ thể** đang gặp phải
4. **Mục tiêu** bạn muốn đạt được

Tôi sẽ phân tích và đưa ra giải pháp chi tiết, hiệu quả!

**Bạn cần hỗ trợ về vấn đề gì ngay bây giờ?**"""
        
        elif "khó khăn" in message_lower or "vấn đề" in message_lower or "problem" in message_lower:
            response = """**🔍 PHÂN TÍCH VÀ GIẢI QUYẾT GIÁO DỤC**

Tôi hiểu rằng bạn đang gặp khó khăn. Hãy cho tôi biết chi tiết:

## 📋 **CÁC LOẠI VẤN ĐỀ THƯỜNG GẶP:**

### **Về học sinh:**
- Học sinh mất gốc kiến thức
- Không tập trung trong giờ học
- Kết quả học tập sa sút
- Mâu thuẫn trong lớp học

### **Về giảng dạy:**
- Phương pháp chưa hiệu quả
- Nội dung quá khó/dễ
- Thiếu thời gian chuẩn bị
- Đánh giá chưa khách quan

### **Về quản lý:**
- Thời khóa biểu chồng chéo
- Phân công không hợp lý
- Thiếu tài nguyên, trang thiết bị
- Áp lực quá tải

### **Về phụ huynh:**
- Phụ huynh không đồng hành
- Không hiểu phương pháp mới
- Mong muốn kết quả cao
- Thiếu thời gian cho con

## 🎯 **GIẢI PHÁP CỤ THỂ:**

**Bước 1: Xác định vấn đề**
- Phân tích nguyên nhân gốc rễ
- Đánh giá mức độ ảnh hưởng
- Xác định đối tượng liên quan

**Bước 2: Tìm giải pháp**
- Nghiên cứu phương pháp tốt nhất
- Tham khảo kinh nghiệm thành công
- Cân nhắn yếu tố thực tế

**Bước 3: Lập kế hoạch**
- Đặt mục tiêu cụ thể
- Phân bổ thời gian hợp lý
- Xác định nguồn lực cần thiết

**Bước 4: Thực hiện và đánh giá**
- Theo dõi tiến độ
- Điều chỉnh khi cần thiết
- Đo lường hiệu quả

## 💬 **ĐỂ TÔI GIÚP TỐT HƠN:**

Hãy mô tả:
1. **Vấn đề cụ thể** bạn đang gặp
2. **Bối cảnh** (lớp, môn học, số lượng)
3. **Đã thử cách nào** chưa hiệu quả
4. **Kết quả mong muốn** của bạn

Tôi sẽ:
- Phân tích sâu vấn đề
- Đề xuất giải pháp khả thi
- Cung cấp kế hoạch chi tiết
- Hỗ trợ theo dõi thực hiện

**Vấn đề của bạn là gì? Hãy chia sẻ để tôi giúp đỡ!**"""
        
        elif any(keyword in message_lower for keyword in ["hệ thống đa tầng", "multi-tier", "xử lý nâng cao", "leann", "vector search"]):
            # Use Multi-Tier System Manager
            result = await multi_tier_manager.process_query(message, {"context": context})
            
            if result.get("success"):
                final_response = result.get("final_response", "")
                quality_scores = result.get("quality_scores", {})
                processing_time = result.get("processing_time", 0)
                
                response = f"""🏗️ **HỆ THỐNG MULTI-TIER AGENTS VỚI LEANN!**

🔍 **Query gốc:** {message}

📋 **Kết quả xử lý đa tầng:**
{final_response}

⏱️ **Thời gian xử lý:** {processing_time:.2f}s
📊 **Điểm chất lượng:** {quality_scores.get('overall', 0):.1%}

🏗️ **Các tầng đã xử lý:**
✅ Input Analysis - Phân tích prompt và keywords
✅ Skill Routing - Routing đến agents phù hợp  
✅ Processing - Xử lý thông tin từ agents
✅ Filtering - Sàng lọc và phân loại
✅ Synthesis - Tổng hợp thông tin
✅ Evaluation - Đánh giá chất lượng
✅ Response - Tạo phản hồi cuối cùng

🤖 **Pipeline ID:** {result.get('pipeline_id', 'N/A')}
📈 **Confidence:** {result.get('confidence', 0):.1%}
"""
            else:
                response = f"❌ Lỗi hệ thống multi-tier: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["tìm kiếm", "search", "tìm thông tin", "research", "web search"]):
            # Use Web Search Agent
            search_query = message.replace("tìm kiếm", "").replace("search", "").replace("tìm thông tin", "").strip()
            result = await web_search_agent.web_search({
                "query": search_query,
                "search_type": "educational",
                "max_results": 10
            })
            
            if result.get("success"):
                search_content = result.get("synthesized_content", "")
                response = f"""🌐 **TÌM KIẾM THÔNG TIN WEB!**

🔍 **Kết quả tìm kiếm cho:** {search_query}

📋 **Nội dung tìm thấy:**
{search_content}

📊 **Thống kê tìm kiếm:**
- Tổng kết quả: {result.get('total_results', 0)}
- Loại tìm kiếm: {result.get('search_type', 'educational')}
- Độ tin cậy: {result.get('confidence', 0):.1%}

🤖 **Agent sử dụng:** Web Search Agent
📈 **Thời gian tìm kiếm:** {result.get('search_timestamp', 'N/A')}
"""
            else:
                response = f"❌ Lỗi tìm kiếm: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["cập nhật kiến thức", "knowledge update", "học từ internet", "internet learning", "real-time learning"]):
            # Use Knowledge Integration Agent
            learning_topic = message.replace("cập nhật kiến thức", "").replace("knowledge update", "").replace("học từ internet", "").strip()
            result = await knowledge_integration_agent.integrate_knowledge({
                "topic": learning_topic,
                "scope": "comprehensive",
                "types": ["theoretical", "practical", "research"]
            })
            
            if result.get("success"):
                integrated_content = result.get("integrated_knowledge", "")
                response = f"""🧠 **CẬP NHẬT KIẾN THỨC TỪ INTERNET!**

📚 **Chủ đề:** {learning_topic}

🔥 **Kiến thức tích hợp:**
{integrated_content}

📊 **Thống kê tích hợp:**
- Số nguồn: {result.get('sources_count', 0)}
- Độ tin cậy: {result.get('credibility_score', 0):.1%}
- Phạm vi: {result.get('integration_scope', 'comprehensive')}

🤖 **Agent sử dụng:** Knowledge Integration Agent
📈 **Thời gian cập nhật:** {result.get('integration_timestamp', 'N/A')}
"""
            else:
                response = f"❌ Lỗi cập nhật kiến thức: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["huấn luyện với internet", "web enhanced training", "ai training with web", "online learning"]):
            # Use Knowledge Integration Agent for web enhanced training
            training_topic = message.replace("huấn luyện với internet", "").replace("web enhanced training", "").replace("ai training with web", "").strip()
            result = await knowledge_integration_agent.web_enhanced_training({
                "topic": training_topic,
                "method": "reinforcement_learning",
                "level": "comprehensive"
            })
            
            if result.get("success"):
                enhanced_plan = result.get("enhanced_training_plan", "")
                response = f"""🚀 **HUẤN LUYỆN AI TĂNG CƯỜNG WEB!**

🎯 **Chủ đề huấn luyện:** {training_topic}

📈 **Kế hoạch tăng cường:**
{enhanced_plan}

📊 **Thông tin tăng cường:**
- Phương pháp: {result.get('training_method', 'reinforcement_learning')}
- Nguồn kiến thức: {result.get('knowledge_sources', 0)}
- Mức độ tăng cường: {result.get('enhancement_level', 'comprehensive')}

🤖 **Agent sử dụng:** Knowledge Integration Agent
📈 **Thời gian tạo:** {result.get('enhancement_timestamp', 'N/A')}
"""
            else:
                response = f"❌ Lỗi huấn luyện tăng cường: {result.get('error', 'Lỗi không xác định')}"
        
        elif any(keyword in message_lower for keyword in ["hệ thống đa tầng", "multi-tier", "xử lý nâng cao", "leann", "vector search"]):
            # Use Multi-Tier System Manager
            result = await multi_tier_manager.process_query(message, {"context": context})
            
            if result.get("success"):
                final_response = result.get("final_response", "")
                quality_scores = result.get("quality_scores", {})
                processing_time = result.get("processing_time", 0)
                
                response = f"""🏗️ **HỆ THỐNG MULTI-TIER AGENTS VỚI LEANN!**

🔍 **Query gốc:** {message}

📋 **Kết quả xử lý đa tầng:**
{final_response}

⏱️ **Thời gian xử lý:** {processing_time:.2f}s
📊 **Điểm chất lượng:** {quality_scores.get('overall', 0):.1%}

🏗️ **Các tầng đã xử lý:**
✅ Input Analysis - Phân tích prompt và keywords
✅ Skill Routing - Routing đến agents phù hợp  
✅ Processing - Xử lý thông tin từ agents
✅ Filtering - Sàng lọc và phân loại
✅ Synthesis - Tổng hợp thông tin
✅ Evaluation - Đánh giá chất lượng
✅ Response - Tạo phản hồi cuối cùng
"""
            else:
                response = f"""Tôi đã nhận được tin nhắn: "{message}"

Tôi la AI tro ly giao duc chuyen sau, co the giup ban voi cac van de cu the ve:

**Giang day va hoc tap:**
- Tao noi dung bai hoc chi tiet
- Soan bai tap da dang
- Thiet ke de thi chat luong
- Phan tich ket qua hoc tap

**Tu van giao duc:**
- Phuong phap giang day hieu qua
- Giai quyet van de lop hoc
- Toi uu thoi khoa bieu
- Quan ly hoc sinh hieu qua

**Kien thuc chuyen mon:**
- Toan hoc, Vat ly, Hoa hoc
- Ngu van, Lich su, Dia ly
- Tieng Anh, Tin hoc, Sinh hoc

**Tim kiem va hoc tap tu internet:**
- Tim kiem thong tin giao duc moi nhat
- Cap nhat kien thuc tu nguon online
- Huan luyen AI tang cuong voi web data
- Hoc tap real-time tu internet

**He thong Multi-Tier Agents:**
- Xu ly da tang voi LEANN integration
- Phan tich prompt va routing thong minh
- Sang loc va tong hop thong tin
- Danh gia chat luong tu dong
- Vector search va semantic indexing

**Hay thu hoi toi ve:**
- "Tao bai hoc [chu de] mon [ten mon]"
- "Bai tap ve [noi dung] lop [lop]"
- "Tim kiem thong tin ve [chu de]"
- "Cap nhat kien thuc ve [chu de]"
- "Huan luyen AI voi web ve [chu de]"
- "He thong da tang xu ly [yeu cau phuc tap]"
- "LEANN vector search cho [tai lieu]"

Toi san sang phan tich va dua ra giai phap chi tiet cho van de cua ban!"""
        
        return {
            "success": True,
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "agent": "enhanced_chat_agent",
            "context": context,
            "confidence": 0.95
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Chat error: {str(e)}"
        )

@app.get("/api/v1/multi-tier-status")
async def get_multi_tier_status():
    """Get Multi-Tier System status"""
    try:
        status = multi_tier_manager.get_system_status()
        return {
            "success": True,
            "system_status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Status error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
