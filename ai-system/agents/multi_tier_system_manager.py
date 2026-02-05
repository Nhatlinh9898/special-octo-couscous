"""
Multi-Tier Agent System Manager
Điều phối toàn bộ hệ thống multi-tier agents với LEANN integration
"""

from typing import Dict, Any, List, Optional, Tuple
import json
import asyncio
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import uuid
import logging

from .multi_tier_agent_system import (
    TierLevel, AgentTask, LEANNIntegrationAgent, InputAnalysisAgent,
    SkillRoutingAgent, ProcessingAgent, FilteringAgent, SynthesisAgent,
    EvaluationAgent, ResponseAgent
)

class TaskStatus(Enum):
    """Trạng thái của task"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"

class SystemState(Enum):
    """Trạng thái của hệ thống"""
    IDLE = "idle"
    PROCESSING = "processing"
    EVALUATING = "evaluating"
    RETRYING = "retrying"
    ERROR = "error"

@dataclass
class ProcessingPipeline:
    """Đại diện một pipeline xử lý multi-tier"""
    pipeline_id: str
    original_query: str
    tasks: List[AgentTask] = field(default_factory=list)
    current_tier: TierLevel = TierLevel.INPUT_ANALYSIS
    state: SystemState = SystemState.IDLE
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    final_result: Dict[str, Any] = field(default_factory=dict)
    error_log: List[str] = field(default_factory=list)

class MultiTierAgentSystemManager:
    """Manager điều phối hệ thống multi-tier agents"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize all tier agents
        self.leann_agent = LEANNIntegrationAgent()
        self.input_analysis_agent = InputAnalysisAgent()
        self.skill_routing_agent = SkillRoutingAgent()
        self.processing_agent = ProcessingAgent()
        self.filtering_agent = FilteringAgent()
        self.synthesis_agent = SynthesisAgent()
        self.evaluation_agent = EvaluationAgent()
        self.response_agent = ResponseAgent()
        
        # System state
        self.current_pipelines: Dict[str, ProcessingPipeline] = {}
        self.system_state = SystemState.IDLE
        self.max_concurrent_pipelines = 5
        
        # Performance metrics
        self.metrics = {
            "total_processed": 0,
            "successful_pipelines": 0,
            "failed_pipelines": 0,
            "average_processing_time": 0.0,
            "retry_count": 0
        }
    
    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý query qua hệ thống multi-tier agents"""
        
        if context is None:
            context = {}
        
        # Create pipeline
        pipeline_id = str(uuid.uuid4())
        pipeline = ProcessingPipeline(
            pipeline_id=pipeline_id,
            original_query=query
        )
        
        self.current_pipelines[pipeline_id] = pipeline
        self.system_state = SystemState.PROCESSING
        
        try:
            # Process through all tiers
            result = await self.execute_pipeline(pipeline)
            
            # Update metrics
            self.metrics["total_processed"] += 1
            if result.get("success", False):
                self.metrics["successful_pipelines"] += 1
            else:
                self.metrics["failed_pipelines"] += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Pipeline {pipeline_id} failed: {str(e)}")
            pipeline.error_log.append(str(e))
            pipeline.state = SystemState.ERROR
            
            return {
                "success": False,
                "error": str(e),
                "pipeline_id": pipeline_id,
                "query": query
            }
        finally:
            # Clean up old pipelines
            await self.cleanup_pipelines()
    
    async def execute_pipeline(self, pipeline: ProcessingPipeline) -> Dict[str, Any]:
        """Thực thi pipeline qua các tier"""
        
        pipeline.started_at = datetime.now()
        
        try:
            # Tier 1: Input Analysis
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Input Analysis")
            analysis_result = await self.tier_input_analysis(pipeline)
            if not analysis_result.get("success", False):
                return await self.handle_failure(pipeline, analysis_result, "input_analysis")
            
            # Tier 2: Skill Routing
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Skill Routing")
            routing_result = await self.tier_skill_routing(pipeline, analysis_result)
            if not routing_result.get("success", False):
                return await self.handle_failure(pipeline, routing_result, "skill_routing")
            
            # Tier 3: Processing
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Processing")
            processing_result = await self.tier_processing(pipeline, routing_result)
            if not processing_result.get("success", False):
                return await self.handle_failure(pipeline, processing_result, "processing")
            
            # Tier 4: Filtering
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Filtering")
            filtering_result = await self.tier_filtering(pipeline, processing_result)
            if not filtering_result.get("success", False):
                return await self.handle_failure(pipeline, filtering_result, "filtering")
            
            # Tier 5: Synthesis
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Synthesis")
            synthesis_result = await self.tier_synthesis(pipeline, filtering_result)
            if not synthesis_result.get("success", False):
                return await self.handle_failure(pipeline, synthesis_result, "synthesis")
            
            # Tier 6: Evaluation
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Evaluation")
            evaluation_result = await self.tier_evaluation(pipeline, synthesis_result)
            
            # Check if evaluation passed
            if not evaluation_result.get("success", False) or not evaluation_result.get("is_acceptable", False):
                return await self.handle_failure(pipeline, evaluation_result, "evaluation")
            
            # Tier 7: Response Generation
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Starting Response Generation")
            response_result = await self.tier_response(pipeline, evaluation_result)
            
            # Pipeline completed successfully
            pipeline.completed_at = datetime.now()
            pipeline.state = SystemState.IDLE
            pipeline.final_result = response_result
            
            processing_time = (pipeline.completed_at - pipeline.started_at).total_seconds()
            self.update_average_processing_time(processing_time)
            
            return {
                "success": True,
                "pipeline_id": pipeline.pipeline_id,
                "query": pipeline.original_query,
                "final_response": response_result.get("final_response", ""),
                "processing_time": processing_time,
                "quality_scores": evaluation_result.get("quality_scores", {}),
                "tiers_completed": [
                    "input_analysis", "skill_routing", "processing", 
                    "filtering", "synthesis", "evaluation", "response"
                ],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            pipeline.error_log.append(str(e))
            pipeline.state = SystemState.ERROR
            raise
    
    async def tier_input_analysis(self, pipeline: ProcessingPipeline) -> Dict[str, Any]:
        """Tier 1: Input Analysis"""
        
        pipeline.current_tier = TierLevel.INPUT_ANALYSIS
        
        # Create analysis task
        task = AgentTask(
            task_id=f"analysis_{pipeline.pipeline_id}",
            tier_level=TierLevel.INPUT_ANALYSIS,
            task_type="prompt_analysis",
            data={
                "prompt": pipeline.original_query,
                "depth": "comprehensive"
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute analysis
        result = await self.input_analysis_agent.analyze_prompt(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_skill_routing(self, pipeline: ProcessingPipeline, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 2: Skill Routing"""
        
        pipeline.current_tier = TierLevel.SKILL_ROUTING
        
        # Create routing task
        task = AgentTask(
            task_id=f"routing_{pipeline.pipeline_id}",
            tier_level=TierLevel.SKILL_ROUTING,
            task_type="task_routing",
            data={
                "keywords": analysis_result.get("keywords", []),
                "intent": analysis_result.get("intent", "general"),
                "query_type": analysis_result.get("query_type", "general"),
                "complexity": analysis_result.get("complexity", "medium")
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute routing
        result = await self.skill_routing_agent.route_task(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_processing(self, pipeline: ProcessingPipeline, routing_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 3: Processing"""
        
        pipeline.current_tier = TierLevel.PROCESSING
        
        # Get selected agents from routing
        selected_agents = routing_result.get("selected_agents", [])
        
        # Execute skill agents in parallel
        agent_results = []
        
        # Simulate calling selected agents
        for agent_name in selected_agents[:2]:  # Limit for demo
            agent_result = {
                "agent": agent_name,
                "content": f"Processed content from {agent_name} for query: {pipeline.original_query[:50]}...",
                "confidence": 0.85,
                "processed_at": datetime.now().isoformat()
            }
            agent_results.append(agent_result)
        
        # Create processing task
        task = AgentTask(
            task_id=f"processing_{pipeline.pipeline_id}",
            tier_level=TierLevel.PROCESSING,
            task_type="information_processing",
            data={
                "agent_results": agent_results,
                "processing_type": "comprehensive"
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute processing
        result = await self.processing_agent.process_information(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_filtering(self, pipeline: ProcessingPipeline, processing_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 4: Filtering"""
        
        pipeline.current_tier = TierLevel.FILTERING
        
        # Get processed data
        processed_data = processing_result.get("processed_data", [])
        
        # Create filtering task
        task = AgentTask(
            task_id=f"filtering_{pipeline.pipeline_id}",
            tier_level=TierLevel.FILTERING,
            task_type="content_filtering",
            data={
                "content_items": processed_data,
                "filter_criteria": ["relevance", "quality", "uniqueness"]
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute filtering
        result = await self.filtering_agent.filter_content(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_synthesis(self, pipeline: ProcessingPipeline, filtering_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 5: Synthesis"""
        
        pipeline.current_tier = TierLevel.SYNTHESIS
        
        # Get filtered content
        filtered_content = filtering_result.get("filtered_content", [])
        
        # Create synthesis task
        task = AgentTask(
            task_id=f"synthesis_{pipeline.pipeline_id}",
            tier_level=TierLevel.SYNTHESIS,
            task_type="information_synthesis",
            data={
                "filtered_content": filtered_content,
                "synthesis_type": "comprehensive"
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute synthesis
        result = await self.synthesis_agent.synthesize_information(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_evaluation(self, pipeline: ProcessingPipeline, synthesis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 6: Evaluation"""
        
        pipeline.current_tier = TierLevel.EVALUATION
        pipeline.state = SystemState.EVALUATING
        
        # Get synthesis result
        synthesized_result = synthesis_result.get("synthesis_result", "")
        
        # Create evaluation task
        task = AgentTask(
            task_id=f"evaluation_{pipeline.pipeline_id}",
            tier_level=TierLevel.EVALUATION,
            task_type="quality_evaluation",
            data={
                "synthesized_result": synthesized_result,
                "criteria": ["accuracy", "completeness", "coherence", "relevance"]
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute evaluation
        result = await self.evaluation_agent.evaluate_quality(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def tier_response(self, pipeline: ProcessingPipeline, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Tier 7: Response Generation"""
        
        pipeline.current_tier = TierLevel.RESPONSE
        
        # Get evaluation result
        evaluated_result = evaluation_result.get("evaluation_result", "")
        quality_scores = evaluation_result.get("quality_scores", {})
        
        # Create response task
        task = AgentTask(
            task_id=f"response_{pipeline.pipeline_id}",
            tier_level=TierLevel.RESPONSE,
            task_type="response_generation",
            data={
                "evaluated_result": evaluated_result,
                "quality_scores": quality_scores,
                "original_query": pipeline.original_query
            }
        )
        
        pipeline.tasks.append(task)
        
        # Execute response generation
        result = await self.response_agent.generate_response(task.data)
        
        task.result = result
        task.status = TaskStatus.COMPLETED if result.get("success", False) else TaskStatus.FAILED
        
        return result
    
    async def handle_failure(self, pipeline: ProcessingPipeline, failed_result: Dict[str, Any], failed_tier: str) -> Dict[str, Any]:
        """Xử lý khi một tier thất bại"""
        
        pipeline.error_log.append(f"Tier {failed_tier} failed: {failed_result.get('error', 'Unknown error')}")
        
        # Check if we should retry
        if pipeline.retry_count < pipeline.max_retries:
            pipeline.retry_count += 1
            pipeline.state = SystemState.RETRYING
            self.metrics["retry_count"] += 1
            
            self.logger.info(f"Pipeline {pipeline.pipeline_id}: Retrying {failed_tier} (attempt {pipeline.retry_count})")
            
            # Wait a bit before retry
            await asyncio.sleep(1)
            
            # Retry the failed tier
            try:
                if failed_tier == "input_analysis":
                    return await self.tier_input_analysis(pipeline)
                elif failed_tier == "skill_routing":
                    # Need analysis result for routing
                    analysis_result = pipeline.tasks[0].result if pipeline.tasks else {}
                    return await self.tier_skill_routing(pipeline, analysis_result)
                elif failed_tier == "processing":
                    # Need routing result for processing
                    routing_result = pipeline.tasks[1].result if len(pipeline.tasks) > 1 else {}
                    return await self.tier_processing(pipeline, routing_result)
                elif failed_tier == "filtering":
                    # Need processing result for filtering
                    processing_result = pipeline.tasks[2].result if len(pipeline.tasks) > 2 else {}
                    return await self.tier_filtering(pipeline, processing_result)
                elif failed_tier == "synthesis":
                    # Need filtering result for synthesis
                    filtering_result = pipeline.tasks[3].result if len(pipeline.tasks) > 3 else {}
                    return await self.tier_synthesis(pipeline, filtering_result)
                elif failed_tier == "evaluation":
                    # Need synthesis result for evaluation
                    synthesis_result = pipeline.tasks[4].result if len(pipeline.tasks) > 4 else {}
                    return await self.tier_evaluation(pipeline, synthesis_result)
                else:
                    return failed_result
                    
            except Exception as retry_error:
                pipeline.error_log.append(f"Retry failed: {str(retry_error)}")
                return failed_result
        else:
            # Max retries reached, return failure
            pipeline.state = SystemState.ERROR
            return failed_result
    
    async def cleanup_pipelines(self):
        """Dọn dẹp các pipeline cũ"""
        
        current_time = datetime.now()
        pipelines_to_remove = []
        
        for pipeline_id, pipeline in self.current_pipelines.items():
            # Remove pipelines older than 1 hour or completed
            if (pipeline.state == SystemState.IDLE and 
                pipeline.completed_at and 
                (current_time - pipeline.completed_at).total_seconds() > 3600):
                pipelines_to_remove.append(pipeline_id)
        
        for pipeline_id in pipelines_to_remove:
            del self.current_pipelines[pipeline_id]
            self.logger.info(f"Cleaned up pipeline {pipeline_id}")
    
    def update_average_processing_time(self, processing_time: float):
        """Cập nhật thời gian xử lý trung bình"""
        
        if self.metrics["total_processed"] <= 1:
            self.metrics["average_processing_time"] = processing_time
        else:
            # Weighted average
            total = self.metrics["total_processed"] - 1
            current_avg = self.metrics["average_processing_time"]
            self.metrics["average_processing_time"] = (current_avg * total + processing_time) / (total + 1)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Lấy trạng thái hệ thống"""
        
        return {
            "system_state": self.system_state.value,
            "active_pipelines": len(self.current_pipelines),
            "max_concurrent_pipelines": self.max_concurrent_pipelines,
            "metrics": self.metrics.copy(),
            "pipeline_details": {
                pipeline_id: {
                    "original_query": pipeline.original_query[:50] + "...",
                    "current_tier": pipeline.current_tier.value,
                    "state": pipeline.state.value,
                    "retry_count": pipeline.retry_count,
                    "created_at": pipeline.created_at.isoformat(),
                    "tasks_completed": len([t for t in pipeline.tasks if t.status == TaskStatus.COMPLETED])
                }
                for pipeline_id, pipeline in self.current_pipelines.items()
            }
        }
    
    async def shutdown(self):
        """Shutdown hệ thống"""
        
        self.logger.info("Shutting down Multi-Tier Agent System Manager")
        
        # Cancel all active pipelines
        for pipeline in self.current_pipelines.values():
            pipeline.state = SystemState.ERROR
            pipeline.error_log.append("System shutdown")
        
        self.current_pipelines.clear()
        self.system_state = SystemState.IDLE
        
        self.logger.info("Multi-Tier Agent System Manager shutdown complete")
