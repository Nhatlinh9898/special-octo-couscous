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
            "course_catalog": ComprehensiveCourseCatalogAgent()
        }
    
    def get_agent(self, agent_name: str):
        return self.agents.get(agent_name)

# Initialize agent manager
agent_manager = AgentManager()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
