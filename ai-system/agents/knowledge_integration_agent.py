"""
Knowledge Integration Agent - Tích hợp kiến thức từ internet vào AI training
"""

from typing import Dict, Any, List, Optional
import json
import os
import asyncio
from datetime import datetime, timedelta
from .base_agent import BaseAgent
from .web_search_agent import WebSearchAgent

class KnowledgeIntegrationAgent(BaseAgent):
    def __init__(self):
        super().__init__("knowledge_integration_agent", "llama3:8b")
        self.description = "Agent tích hợp kiến thức internet vào AI training system"
        self.capabilities = [
            "knowledge_integration",           # Tích hợp kiến thức
            "web_enhanced_training",          # Huấn luyện tăng cường web
            "real_time_knowledge_update",     # Cập nhật kiến thức real-time
            "content_validation",            # Xác thực nội dung
            "knowledge_graph_building",       # Xây dựng đồ thị kiến thức
            "adaptive_learning",              # Học tập thích ứng
            "source_credibility",             # Độ tin cậy nguồn
            "knowledge_synthesis"             # Tổng hợp kiến thức
        ]
        
        # Initialize web search agent
        self.web_search_agent = WebSearchAgent()
        
        # Knowledge domains
        self.knowledge_domains = {
            "education": ["pedagogy", "curriculum", "assessment", "learning_theories"],
            "technology": ["ai", "machine_learning", "educational_technology", "digital_learning"],
            "science": ["mathematics", "physics", "chemistry", "biology", "computer_science"],
            "research": ["educational_research", "cognitive_science", "learning_analytics"],
            "industry": ["future_trends", "job_market", "skills_demand", "professional_development"]
        }
        
        # Knowledge base
        self.knowledge_base = {
            "static_knowledge": {},  # Knowledge from training data
            "dynamic_knowledge": {}, # Knowledge from web
            "validated_knowledge": {}, # Validated knowledge
            "application_knowledge": {} # Applied knowledge
        }
        
        # Credibility scores
        self.source_credibility = {
            "academic_journals": 0.95,
            "educational_institutions": 0.90,
            "government_sources": 0.85,
            "news_outlets": 0.70,
            "blogs": 0.50,
            "social_media": 0.30
        }

    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process knowledge integration task"""
        
        if task == "knowledge_integration":
            return await self.integrate_knowledge(data)
        elif task == "web_enhanced_training":
            return await self.web_enhanced_training(data)
        elif task == "real_time_knowledge_update":
            return await self.real_time_knowledge_update(data)
        elif task == "knowledge_graph_building":
            return await self.build_knowledge_graph(data)
        elif task == "adaptive_learning":
            return await self.adaptive_learning(data)
        elif task == "content_validation":
            return await self.validate_content(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}

    async def integrate_knowledge(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Integrate knowledge from web sources"""
        
        topic = data.get("topic", "")
        integration_scope = data.get("scope", "comprehensive")
        knowledge_types = data.get("types", ["theoretical", "practical", "research"])
        
        prompt = f"""
        Tích hợp kiến thức web: {topic}
        
        Scope: {integration_scope}
        
        Tạo kế hoạch tích hợp:
1. Tìm kiếm đa nguồn
2. Đánh giá tin cậy
3. Trích xuất nội dung
4. Tổng hợp cấu trúc
5. Xác thực cập nhật
        """
        
        try:
            # Search for information
            search_data = {
                "query": topic,
                "search_type": "comprehensive",
                "max_results": 15
            }
            
            search_results = await self.web_search_agent.web_search(search_data)
            
            if not search_results["success"]:
                return {
                    "success": False,
                    "error": "Web search failed",
                    "topic": topic
                }
            
            # Process and integrate knowledge
            ai_response = await self.call_ollama(prompt)
            
            # Update knowledge base
            self.knowledge_base["dynamic_knowledge"][topic] = {
                "content": ai_response,
                "sources": search_results["search_results"],
                "integration_date": datetime.now(),
                "credibility_score": self.calculate_credibility_score(search_results["search_results"])
            }
            
            return {
                "success": True,
                "topic": topic,
                "integration_scope": integration_scope,
                "integrated_knowledge": ai_response,
                "sources_count": len(search_results["search_results"]),
                "credibility_score": self.calculate_credibility_score(search_results["search_results"]),
                "integration_timestamp": datetime.now().isoformat(),
                "confidence": 0.92
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Knowledge integration failed: {str(e)}",
                "topic": topic
            }

    async def web_enhanced_training(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance AI training with web knowledge"""
        
        training_topic = data.get("topic", "")
        training_method = data.get("method", "reinforcement_learning")
        enhancement_level = data.get("level", "comprehensive")
        
        prompt = f"""
        Huấn luyện AI tăng cường với kiến thức web:
        
        Chủ đề huấn luyện: {training_topic}
        Phương pháp: {training_method}
        Mức độ tăng cường: {enhancement_level}
        
        Huấn luyện tăng cường:
        1. Thu thập kiến thức mới nhất
        2. Cập nhật curriculum huấn luyện
        3. Tích hợp real-world examples
        4. Tối ưu hóa parameters
        5. Đánh giá hiệu suất cải tiến
        """
        
        try:
            # Get latest knowledge
            knowledge_data = {
                "topic": training_topic,
                "scope": "latest_research",
                "types": ["research", "practical", "case_studies"]
            }
            
            knowledge_result = await self.integrate_knowledge(knowledge_data)
            
            if not knowledge_result["success"]:
                return {
                    "success": False,
                    "error": "Knowledge integration failed",
                    "training_topic": training_topic
                }
            
            # Generate enhanced training plan
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "training_topic": training_topic,
                "training_method": training_method,
                "enhancement_level": enhancement_level,
                "enhanced_training_plan": ai_response,
                "knowledge_sources": knowledge_result["sources_count"],
                "enhancement_timestamp": datetime.now().isoformat(),
                "confidence": 0.94
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Web enhanced training failed: {str(e)}",
                "training_topic": training_topic
            }

    async def real_time_knowledge_update(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Real-time knowledge updates"""
        
        update_topics = data.get("topics", [])
        update_frequency = data.get("frequency", "daily")
        update_sources = data.get("sources", ["academic", "news", "research"])
        
        prompt = f"""
        Cập nhật kiến thức real-time:
        
        Chủ đề cập nhật: {update_topics}
        Tần suất: {update_frequency}
        Nguồn cập nhật: {update_sources}
        
        Cập nhật real-time:
        1. Monitor thông tin mới
        2. Filter nội dung liên quan
        3. Validate thông tin
        4. Update knowledge base
        5. Notify changes
        """
        
        try:
            # Collect updates for all topics
            all_updates = {}
            total_sources = 0
            
            for topic in update_topics:
                search_data = {
                    "query": f"{topic} latest research developments",
                    "search_type": "news",
                    "max_results": 5
                }
                
                search_result = await self.web_search_agent.web_search(search_data)
                if search_result["success"]:
                    all_updates[topic] = search_result["search_results"]
                    total_sources += len(search_result["search_results"])
            
            # Generate update plan
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "update_topics": update_topics,
                "update_frequency": update_frequency,
                "update_sources": update_sources,
                "total_updates": len(all_updates),
                "total_sources": total_sources,
                "update_plan": ai_response,
                "update_timestamp": datetime.now().isoformat(),
                "confidence": 0.88
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Real-time knowledge update failed: {str(e)}",
                "topics": update_topics
            }

    async def build_knowledge_graph(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Build knowledge graph from integrated information"""
        
        graph_topic = data.get("topic", "")
        graph_depth = data.get("depth", 3)
        relationship_types = data.get("relationships", ["causal", "hierarchical", "semantic"])
        
        prompt = f"""
        Xây dựng đồ thị kiến thức về: {graph_topic}
        
        Độ sâu đồ thị: {graph_depth}
        Loại quan hệ: {relationship_types}
        
        Xây dựng đồ thị:
        1. Xác định concepts chính
        2. Phân tích quan hệ giữa concepts
        3. Cấu trúc hóa đồ thị
        4. Gán weights và properties
        5. Tạo visualization plan
        """
        
        try:
            # Get comprehensive knowledge
            knowledge_data = {
                "topic": graph_topic,
                "scope": "comprehensive",
                "types": ["theoretical", "practical", "research", "applications"]
            }
            
            knowledge_result = await self.integrate_knowledge(knowledge_data)
            
            if not knowledge_result["success"]:
                return {
                    "success": False,
                    "error": "Knowledge integration failed",
                    "graph_topic": graph_topic
                }
            
            # Build knowledge graph
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "graph_topic": graph_topic,
                "graph_depth": graph_depth,
                "relationship_types": relationship_types,
                "knowledge_graph": ai_response,
                "source_knowledge": knowledge_result["sources_count"],
                "graph_timestamp": datetime.now().isoformat(),
                "confidence": 0.90
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Knowledge graph building failed: {str(e)}",
                "topic": graph_topic
            }

    async def adaptive_learning(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Adaptive learning with web knowledge"""
        
        learning_goal = data.get("goal", "")
        adaptation_strategy = data.get("strategy", "continuous_improvement")
        learning_sources = data.get("sources", ["web", "academic", "industry"])
        
        prompt = f"""
        Học tập thích ứng với kiến thức web:
        
        Mục tiêu học tập: {learning_goal}
        Chiến lược thích ứng: {adaptation_strategy}
        Nguồn học tập: {learning_sources}
        
        Học tập thích ứng:
        1. Phân tích mục tiêu học tập
        2. Thu thập thông tin liên quan
        3. Tối ưu hóa lộ trình học
        4. Cập nhật nội dung real-time
        5. Đánh giá tiến độ
        """
        
        try:
            # Get relevant learning materials
            search_data = {
                "query": f"{learning_goal} best practices methods",
                "search_type": "educational",
                "max_results": 10
            }
            
            search_result = await self.web_search_agent.web_search(search_data)
            
            # Generate adaptive learning plan
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "learning_goal": learning_goal,
                "adaptation_strategy": adaptation_strategy,
                "learning_sources": learning_sources,
                "adaptive_learning_plan": ai_response,
                "available_resources": len(search_result.get("search_results", [])),
                "learning_timestamp": datetime.now().isoformat(),
                "confidence": 0.91
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Adaptive learning failed: {str(e)}",
                "goal": learning_goal
            }

    async def validate_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content credibility"""
        
        content_to_validate = data.get("content", "")
        validation_criteria = data.get("criteria", ["accuracy", "credibility", "recency"])
        
        prompt = f"""
        Xác thực nội dung:
        
        Nội dung: {content_to_validate[:200]}...
        Tiêu chí xác thực: {validation_criteria}
        
        Xác thực nội dung:
        1. Kiểm tra tính chính xác
        2. Đánh giá độ tin cậy nguồn
        3. Xác thực tính cập nhật
        4. Phát hiện bias
        5. Đề xuất cải tiến
        """
        
        try:
            # Search for supporting/contradicting information
            search_data = {
                "query": f"fact check {content_to_validate[:100]}",
                "search_type": "academic",
                "max_results": 5
            }
            
            search_result = await self.web_search_agent.web_search(search_data)
            
            # Validate content
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "content_length": len(content_to_validate),
                "validation_criteria": validation_criteria,
                "validation_result": ai_response,
                "supporting_sources": len(search_result.get("search_results", [])),
                "validation_timestamp": datetime.now().isoformat(),
                "confidence": 0.87
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Content validation failed: {str(e)}",
                "content_length": len(content_to_validate)
            }

    def calculate_credibility_score(self, sources: List[Dict[str, Any]]) -> float:
        """Calculate credibility score for sources"""
        
        if not sources:
            return 0.0
        
        total_score = 0.0
        for source in sources:
            source_type = source.get("source", "").lower()
            relevance = source.get("relevance", 0.5)
            
            # Determine source type and assign credibility
            credibility = 0.5  # default
            if "journal" in source_type or "research" in source_type:
                credibility = self.source_credibility["academic_journals"]
            elif "education" in source_type or "university" in source_type:
                credibility = self.source_credibility["educational_institutions"]
            elif "gov" in source_type:
                credibility = self.source_credibility["government_sources"]
            elif "news" in source_type:
                credibility = self.source_credibility["news_outlets"]
            elif "blog" in source_type:
                credibility = self.source_credibility["blogs"]
            
            total_score += credibility * relevance
        
        return min(total_score / len(sources), 1.0)

    def get_knowledge_base_stats(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        
        return {
            "static_knowledge_size": len(self.knowledge_base["static_knowledge"]),
            "dynamic_knowledge_size": len(self.knowledge_base["dynamic_knowledge"]),
            "validated_knowledge_size": len(self.knowledge_base["validated_knowledge"]),
            "application_knowledge_size": len(self.knowledge_base["application_knowledge"]),
            "last_update": datetime.now().isoformat()
        }
