"""
Multi-Tier Agent System with LEANN Integration
Hệ thống phân tầng agents: Input Analysis → Skill Routing → Processing → Filtering → Synthesis → Evaluation → Response
"""

from typing import Dict, Any, List, Optional, Tuple
import json
import asyncio
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import re

from .base_agent import BaseAgent
from .web_search_agent import WebSearchAgent
from .knowledge_integration_agent import KnowledgeIntegrationAgent
from .enhanced_skills_agent import EnhancedSkillsAgent

class TierLevel(Enum):
    """Các tầng xử lý trong hệ thống"""
    INPUT_ANALYSIS = "input_analysis"
    SKILL_ROUTING = "skill_routing" 
    PROCESSING = "processing"
    FILTERING = "filtering"
    SYNTHESIS = "synthesis"
    EVALUATION = "evaluation"
    RESPONSE = "response"

@dataclass
class AgentTask:
    """Đại diện một task trong hệ thống"""
    task_id: str
    tier_level: TierLevel
    task_type: str
    data: Dict[str, Any]
    priority: int = 1
    dependencies: List[str] = None
    retry_count: int = 0
    max_retries: int = 3
    status: str = "pending"
    result: Dict[str, Any] = None
    error: str = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.created_at is None:
            self.created_at = datetime.now()

class LEANNIntegrationAgent(BaseAgent):
    """Agent tích hợp LEANN vector database cho semantic search"""
    
    def __init__(self):
        super().__init__("leann_integration_agent", "llama3:8b")
        self.description = "Agent tích hợp LEANN cho semantic search và vector indexing"
        self.capabilities = [
            "vector_indexing",              # Indexing documents
            "semantic_search",              # Semantic search
            "document_retrieval",            # Retrieve relevant documents
            "knowledge_graph",              # Build knowledge graphs
            "context_embedding",            # Context embedding
            "similarity_search",            # Similarity search
            "document_clustering",          # Document clustering
            "knowledge_extraction"          # Extract knowledge from documents
        ]
        
        # LEANN configuration
        self.leann_config = {
            "index_path": "./leann_index",
            "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
            "vector_dimension": 384,
            "index_type": "graph_based",
            "compression_ratio": 0.97
        }
        
        # Document store
        self.document_store = {}
        self.vector_index = None
        
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process LEANN integration task"""
        
        if task == "vector_indexing":
            return await self.vector_indexing(data)
        elif task == "semantic_search":
            return await self.semantic_search(data)
        elif task == "document_retrieval":
            return await self.document_retrieval(data)
        elif task == "knowledge_graph":
            return await self.build_knowledge_graph(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def vector_indexing(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Index documents into LEANN vector database"""
        
        documents = data.get("documents", [])
        index_type = data.get("index_type", "educational")
        
        prompt = f"""
        Vector indexing với LEANN:
        
        Documents: {len(documents)}
        Index type: {index_type}
        
        Tạo vector index:
1. Extract text content
2. Generate embeddings
3. Build graph index
4. Optimize storage
5. Enable semantic search
        """
        
        try:
            # Simulate LEANN indexing
            indexed_docs = []
            for i, doc in enumerate(documents[:5]):  # Limit for demo
                indexed_docs.append({
                    "doc_id": f"doc_{i}",
                    "title": doc.get("title", f"Document {i}"),
                    "content": doc.get("content", f"Content {i}"),
                    "embedding": f"vector_{i}_384_dim",
                    "metadata": {
                        "type": index_type,
                        "indexed_at": datetime.now().isoformat()
                    }
                })
            
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "indexed_documents": len(indexed_docs),
                "index_type": index_type,
                "vector_dimension": self.leann_config["vector_dimension"],
                "compression_ratio": self.leann_config["compression_ratio"],
                "indexing_result": ai_response,
                "indexed_docs": indexed_docs,
                "index_timestamp": datetime.now().isoformat(),
                "confidence": 0.91
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Vector indexing failed: {str(e)}",
                "documents_count": len(documents)
            }
    
    async def semantic_search(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform semantic search using LEANN"""
        
        query = data.get("query", "")
        search_type = data.get("search_type", "semantic")
        top_k = data.get("top_k", 10)
        
        prompt = f"""
        Semantic search với LEANN:
        
        Query: {query}
        Search type: {search_type}
        Top K: {top_k}
        
        Thực hiện semantic search:
1. Query embedding
2. Vector similarity search
3. Rank results by relevance
4. Retrieve top documents
5. Return with scores
        """
        
        try:
            # Simulate semantic search
            search_results = []
            for i in range(min(top_k, 5)):
                relevance_score = 0.95 - (i * 0.1)
                search_results.append({
                    "doc_id": f"doc_{i}",
                    "title": f"Relevant Document {i+1} for {query}",
                    "content_snippet": f"This document contains relevant information about {query}...",
                    "relevance_score": relevance_score,
                    "similarity_score": relevance_score,
                    "metadata": {
                        "doc_type": "educational",
                        "source": "leann_index"
                    }
                })
            
            ai_response = await self.call_ollama(prompt)
            
            return {
                "success": True,
                "query": query,
                "search_type": search_type,
                "top_k": top_k,
                "total_results": len(search_results),
                "search_results": search_results,
                "search_analysis": ai_response,
                "search_timestamp": datetime.now().isoformat(),
                "confidence": 0.89
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Semantic search failed: {str(e)}",
                "query": query
            }

class InputAnalysisAgent(BaseAgent):
    """Agent phân tích prompt nhập vào và trích xuất keywords"""
    
    def __init__(self):
        super().__init__("input_analysis_agent", "llama3:8b")
        self.description = "Agent phân tích input và trích xuất keywords cho routing"
        self.capabilities = [
            "prompt_analysis",               # Phân tích prompt
            "keyword_extraction",            # Trích xuất keywords
            "intent_detection",              # Phát hiện intent
            "entity_recognition",            # Nhận diện entities
            "query_classification",          # Phân loại query
            "context_analysis",              # Phân tích context
            "language_detection",            # Phát hiện ngôn ngữ
            "complexity_assessment"          # Đánh giá độ phức tạp
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process input analysis task"""
        
        if task == "prompt_analysis":
            return await self.analyze_prompt(data)
        elif task == "keyword_extraction":
            return await self.extract_keywords(data)
        elif task == "intent_detection":
            return await self.detect_intent(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def analyze_prompt(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Phân tích prompt chi tiết"""
        
        prompt = data.get("prompt", "")
        analysis_depth = data.get("depth", "comprehensive")
        
        # Extract keywords using regex and simple patterns
        keywords = self.extract_keywords_from_text(prompt)
        
        # Detect intent
        intent = self.detect_intent_from_text(prompt)
        
        # Classify query type
        query_type = self.classify_query_type(prompt)
        
        # Assess complexity
        complexity = self.assess_complexity(prompt)
        
        prompt_analysis = f"""
        Phân tích prompt: "{prompt[:100]}..."
        
        Keywords: {keywords}
        Intent: {intent}
        Query type: {query_type}
        Complexity: {complexity}
        
        Phân tích chi tiết:
1. Main topic identification
2. Action verbs extraction
3. Entity recognition
4. Context understanding
5. Response format requirement
        """
        
        try:
            ai_response = await self.call_ollama(prompt_analysis)
            
            return {
                "success": True,
                "original_prompt": prompt,
                "keywords": keywords,
                "intent": intent,
                "query_type": query_type,
                "complexity": complexity,
                "analysis_result": ai_response,
                "analysis_timestamp": datetime.now().isoformat(),
                "confidence": 0.93
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Prompt analysis failed: {str(e)}",
                "prompt": prompt[:100]
            }
    
    def extract_keywords_from_text(self, text: str) -> List[str]:
        """Trích xuất keywords từ text"""
        
        # Simple keyword extraction using patterns
        educational_keywords = [
            "học", "giảng", "dạy", "bài học", "kiến thức", "giáo dục", "đào tạo",
            "sinh viên", "giáo viên", "lớp học", "môn học", "chương trình",
            "ai", "machine learning", "deep learning", "neural network",
            "phân tích", "tìm kiếm", "nghiên cứu", "phát triển", "tối ưu"
        ]
        
        # Find keywords in text
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in educational_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        # Add words that look important (capitalized, long words, etc.)
        words = re.findall(r'\b\w+\b', text)
        for word in words:
            if len(word) > 6 and word.isalpha() and word[0].isupper():
                found_keywords.append(word)
        
        return list(set(found_keywords[:10]))  # Return unique keywords, max 10
    
    def detect_intent_from_text(self, text: str) -> str:
        """Phát hiện intent từ text"""
        
        intent_patterns = {
            "search": ["tìm", "search", "kiếm", "tra cứu", "research"],
            "learn": ["học", "learn", "đọc", "stud", "hiểu"],
            "create": ["tạo", "create", "viết", "soạn", "xây dựng"],
            "analyze": ["phân tích", "analyze", "đánh giá", "evaluate", "analysis"],
            "train": ["huấn luyện", "train", "training", "dạy", "coach"],
            "integrate": ["tích hợp", "integrate", "kết hợp", "combine", "merge"]
        }
        
        text_lower = text.lower()
        
        for intent, patterns in intent_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return intent
        
        return "general"
    
    def classify_query_type(self, text: str) -> str:
        """Phân loại query"""
        
        if any(word in text.lower() for word in ["?", "how", "what", "why", "when", "where"]):
            return "question"
        elif any(word in text.lower() for word in ["tạo", "create", "viết", "soạn"]):
            return "creation"
        elif any(word in text.lower() for word in ["phân tích", "analyze", "đánh giá"]):
            return "analysis"
        elif any(word in text.lower() for word in ["tìm", "search", "kiếm"]):
            return "search"
        else:
            return "general"
    
    def assess_complexity(self, text: str) -> str:
        """Đánh giá độ phức tạp"""
        
        word_count = len(text.split())
        sentence_count = len(re.split(r'[.!?]+', text))
        
        if word_count > 50 or sentence_count > 5:
            return "high"
        elif word_count > 20 or sentence_count > 2:
            return "medium"
        else:
            return "low"

class SkillRoutingAgent(BaseAgent):
    """Agent routing tasks đến appropriate skill agents"""
    
    def __init__(self):
        super().__init__("skill_routing_agent", "llama3:8b")
        self.description = "Agent routing tasks đến skill agents phù hợp"
        self.capabilities = [
            "task_routing",                 # Routing tasks
            "skill_matching",               # Match skills to tasks
            "agent_selection",              # Select appropriate agents
            "load_balancing",               # Load balancing
            "priority_assignment",           # Assign priorities
            "dependency_resolution",        # Resolve dependencies
            "resource_allocation",          # Allocate resources
            "workflow_optimization"        # Optimize workflows
        ]
        
        # Skill agent mappings
        self.skill_mappings = {
            "search": ["web_search_agent", "leann_integration_agent"],
            "learn": ["knowledge_integration_agent", "enhanced_skills_agent"],
            "create": ["content_generation_agent", "enhanced_skills_agent"],
            "analyze": ["advanced_academic_agent", "analytics_agent"],
            "train": ["ai_training_system", "ai_training_pipeline"],
            "integrate": ["universal_skills_agent", "knowledge_integration_agent"]
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process skill routing task"""
        
        if task == "task_routing":
            return await self.route_task(data)
        elif task == "skill_matching":
            return await self.match_skills(data)
        elif task == "agent_selection":
            return await self.select_agents(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def route_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Route task đến appropriate agents"""
        
        keywords = data.get("keywords", [])
        intent = data.get("intent", "general")
        query_type = data.get("query_type", "general")
        complexity = data.get("complexity", "medium")
        
        # Determine primary skill category
        primary_skill = self.determine_primary_skill(keywords, intent, query_type)
        
        # Select agents
        selected_agents = self.skill_mappings.get(primary_skill, ["enhanced_skills_agent"])
        
        # Create routing plan
        routing_prompt = f"""
        Task routing với LEANN:
        
        Keywords: {keywords}
        Intent: {intent}
        Query type: {query_type}
        Complexity: {complexity}
        Primary skill: {primary_skill}
        
        Selected agents: {selected_agents}
        
        Tạo routing plan:
1. Agent selection criteria
2. Task distribution strategy
3. Execution order
4. Dependency management
5. Load balancing
        """
        
        try:
            ai_response = await self.call_ollama(routing_prompt)
            
            return {
                "success": True,
                "keywords": keywords,
                "intent": intent,
                "query_type": query_type,
                "complexity": complexity,
                "primary_skill": primary_skill,
                "selected_agents": selected_agents,
                "routing_plan": ai_response,
                "routing_timestamp": datetime.now().isoformat(),
                "confidence": 0.88
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Task routing failed: {str(e)}",
                "primary_skill": primary_skill
            }
    
    def determine_primary_skill(self, keywords: List[str], intent: str, query_type: str) -> str:
        """Xác định skill chính dựa trên keywords và intent"""
        
        # Priority mapping
        skill_priorities = {
            "search": 0,
            "learn": 0,
            "create": 0,
            "analyze": 0,
            "train": 0,
            "integrate": 0
        }
        
        # Count keyword matches for each skill
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if any(word in keyword_lower for word in ["tìm", "search", "kiếm"]):
                skill_priorities["search"] += 2
            if any(word in keyword_lower for word in ["học", "learn", "đọc"]):
                skill_priorities["learn"] += 2
            if any(word in keyword_lower for word in ["tạo", "create", "viết"]):
                skill_priorities["create"] += 2
            if any(word in keyword_lower for word in ["phân tích", "analyze"]):
                skill_priorities["analyze"] += 2
            if any(word in keyword_lower for word in ["huấn luyện", "train"]):
                skill_priorities["train"] += 2
            if any(word in keyword_lower for word in ["tích hợp", "integrate"]):
                skill_priorities["integrate"] += 2
        
        # Add intent weight
        if intent in skill_priorities:
            skill_priorities[intent] += 3
        
        # Return skill with highest priority
        return max(skill_priorities, key=skill_priorities.get)

class ProcessingAgent(BaseAgent):
    """Agent xử lý thông tin từ các skill agents"""
    
    def __init__(self):
        super().__init__("processing_agent", "llama3:8b")
        self.description = "Agent xử lý thông tin từ skill agents"
        self.capabilities = [
            "information_processing",        # Process information
            "data_transformation",          # Transform data
            "content_generation",           # Generate content
            "knowledge_extraction",         # Extract knowledge
            "pattern_recognition",          # Recognize patterns
            "data_synthesis",               # Synthesize data
            "context_understanding",        # Understand context
            "semantic_analysis"             # Semantic analysis
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process information from skill agents"""
        
        if task == "information_processing":
            return await self.process_information(data)
        elif task == "data_transformation":
            return await self.transform_data(data)
        elif task == "content_generation":
            return await self.generate_content(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def process_information(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Xử lý thông tin từ skill agents"""
        
        agent_results = data.get("agent_results", [])
        processing_type = data.get("processing_type", "comprehensive")
        
        processing_prompt = f"""
        Information processing từ skill agents:
        
        Agent results: {len(agent_results)}
        Processing type: {processing_type}
        
        Xử lý thông tin:
1. Aggregate results from agents
2. Extract key insights
3. Identify patterns
4. Resolve conflicts
5. Generate unified output
        """
        
        try:
            # Process agent results
            processed_data = []
            for result in agent_results[:3]:  # Limit for demo
                processed_data.append({
                    "agent": result.get("agent", "unknown"),
                    "content": result.get("content", ""),
                    "confidence": result.get("confidence", 0.5),
                    "processed_at": datetime.now().isoformat()
                })
            
            ai_response = await self.call_ollama(processing_prompt)
            
            return {
                "success": True,
                "processing_type": processing_type,
                "input_results": len(agent_results),
                "processed_data": processed_data,
                "processing_result": ai_response,
                "processing_timestamp": datetime.now().isoformat(),
                "confidence": 0.87
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Information processing failed: {str(e)}",
                "results_count": len(agent_results)
            }

class FilteringAgent(BaseAgent):
    """Agent sàng lọc và phân loại thông tin"""
    
    def __init__(self):
        super().__init__("filtering_agent", "llama3:8b")
        self.description = "Agent sàng lọc và phân loại thông tin"
        self.capabilities = [
            "content_filtering",            # Filter content
            "information_classification",   # Classify information
            "relevance_scoring",            # Score relevance
            "quality_assessment",           # Assess quality
            "duplicate_detection",          # Detect duplicates
            "bias_detection",               # Detect bias
            "fact_checking",                # Fact checking
            "content_validation"            # Validate content
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process filtering and classification"""
        
        if task == "content_filtering":
            return await self.filter_content(data)
        elif task == "information_classification":
            return await self.classify_information(data)
        elif task == "quality_assessment":
            return await self.assess_quality(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def filter_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sàng lọc nội dung"""
        
        content_items = data.get("content_items", [])
        filter_criteria = data.get("filter_criteria", ["relevance", "quality", "uniqueness"])
        
        filter_prompt = f"""
        Content filtering và classification:
        
        Content items: {len(content_items)}
        Filter criteria: {filter_criteria}
        
        Sàng lọc nội dung:
1. Apply relevance filters
2. Quality assessment
3. Duplicate removal
4. Bias detection
5. Fact checking
        """
        
        try:
            # Filter content
            filtered_items = []
            for item in content_items:
                relevance_score = 0.85  # Simulated
                quality_score = 0.90    # Simulated
                uniqueness_score = 0.95 # Simulated
                
                # Keep items with good scores
                if relevance_score > 0.7 and quality_score > 0.7 and uniqueness_score > 0.7:
                    filtered_items.append({
                        "content": item.get("content", ""),
                        "relevance_score": relevance_score,
                        "quality_score": quality_score,
                        "uniqueness_score": uniqueness_score,
                        "overall_score": (relevance_score + quality_score + uniqueness_score) / 3
                    })
            
            # Sort by overall score
            filtered_items.sort(key=lambda x: x["overall_score"], reverse=True)
            
            ai_response = await self.call_ollama(filter_prompt)
            
            return {
                "success": True,
                "filter_criteria": filter_criteria,
                "input_items": len(content_items),
                "filtered_items": len(filtered_items),
                "filtered_content": filtered_items[:5],  # Top 5 items
                "filtering_result": ai_response,
                "filtering_timestamp": datetime.now().isoformat(),
                "confidence": 0.91
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Content filtering failed: {str(e)}",
                "items_count": len(content_items)
            }

class SynthesisAgent(BaseAgent):
    """Agent tổng hợp thông tin đã sàng lọc"""
    
    def __init__(self):
        super().__init__("synthesis_agent", "llama3:8b")
        self.description = "Agent tổng hợp thông tin từ các nguồn đã lọc"
        self.capabilities = [
            "information_synthesis",        # Synthesize information
            "knowledge_integration",        # Integrate knowledge
            "content_aggregation",          # Aggregate content
            "insight_generation",           # Generate insights
            "pattern_synthesis",            # Synthesize patterns
            "coherent_narrative",           # Create coherent narrative
            "structured_output",            # Create structured output
            "summary_generation"            # Generate summaries
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process synthesis task"""
        
        if task == "information_synthesis":
            return await self.synthesize_information(data)
        elif task == "knowledge_integration":
            return await self.integrate_knowledge(data)
        elif task == "summary_generation":
            return await self.generate_summary(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def synthesize_information(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tổng hợp thông tin"""
        
        filtered_content = data.get("filtered_content", [])
        synthesis_type = data.get("synthesis_type", "comprehensive")
        
        synthesis_prompt = f"""
        Information synthesis với LEANN:
        
        Filtered content: {len(filtered_content)}
        Synthesis type: {synthesis_type}
        
        Tổng hợp thông tin:
1. Identify common themes
2. Extract key insights
3. Resolve contradictions
4. Build coherent narrative
5. Generate structured output
        """
        
        try:
            # Synthesize content
            synthesized_themes = []
            for item in filtered_content:
                content = item.get("content", "")
                if content:
                    synthesized_themes.append({
                        "theme": f"Theme from content: {content[:50]}...",
                        "supporting_evidence": [content],
                        "confidence": item.get("overall_score", 0.8)
                    })
            
            ai_response = await self.call_ollama(synthesis_prompt)
            
            return {
                "success": True,
                "synthesis_type": synthesis_type,
                "input_content": len(filtered_content),
                "synthesized_themes": len(synthesized_themes),
                "synthesis_result": ai_response,
                "themes": synthesized_themes[:3],  # Top 3 themes
                "synthesis_timestamp": datetime.now().isoformat(),
                "confidence": 0.89
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Information synthesis failed: {str(e)}",
                "content_count": len(filtered_content)
            }

class EvaluationAgent(BaseAgent):
    """Agent đánh giá chất lượng kết quả"""
    
    def __init__(self):
        super().__init__("evaluation_agent", "llama3:8b")
        self.description = "Agent đánh giá chất lượng kết quả tổng hợp"
        self.capabilities = [
            "quality_evaluation",           # Evaluate quality
            "accuracy_assessment",          # Assess accuracy
            "completeness_check",           # Check completeness
            "coherence_evaluation",         # Evaluate coherence
            "relevance_validation",         # Validate relevance
            "bias_detection",               # Detect bias
            "fact_verification",            # Verify facts
            "improvement_suggestions"       # Suggest improvements
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process evaluation task"""
        
        if task == "quality_evaluation":
            return await self.evaluate_quality(data)
        elif task == "accuracy_assessment":
            return await self.assess_accuracy(data)
        elif task == "improvement_suggestions":
            return await self.suggest_improvements(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def evaluate_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đánh giá chất lượng kết quả"""
        
        synthesized_result = data.get("synthesized_result", "")
        evaluation_criteria = data.get("criteria", ["accuracy", "completeness", "coherence", "relevance"])
        
        evaluation_prompt = f"""
        Quality evaluation với LEANN:
        
        Synthesized result: {synthesized_result[:200]}...
        Evaluation criteria: {evaluation_criteria}
        
        Đánh giá chất lượng:
1. Accuracy assessment
2. Completeness check
3. Coherence evaluation
4. Relevance validation
5. Overall quality score
        """
        
        try:
            # Simulate evaluation
            quality_scores = {
                "accuracy": 0.88,
                "completeness": 0.85,
                "coherence": 0.92,
                "relevance": 0.90,
                "overall": 0.89
            }
            
            ai_response = await self.call_ollama(evaluation_prompt)
            
            # Determine if quality is acceptable
            is_acceptable = quality_scores["overall"] >= 0.80
            
            return {
                "success": True,
                "evaluation_criteria": evaluation_criteria,
                "quality_scores": quality_scores,
                "is_acceptable": is_acceptable,
                "evaluation_result": ai_response,
                "evaluation_timestamp": datetime.now().isoformat(),
                "confidence": 0.93
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Quality evaluation failed: {str(e)}",
                "criteria": evaluation_criteria
            }

class ResponseAgent(BaseAgent):
    """Agent tạo phản hồi cuối cùng"""
    
    def __init__(self):
        super().__init__("response_agent", "llama3:8b")
        self.description = "Agent tạo phản hồi cuối cùng cho người dùng"
        self.capabilities = [
            "response_generation",          # Generate responses
            "result_formatting",            # Format results
            "user_communication",           # User communication
            "explanation_generation",       # Generate explanations
            "recommendation_provision",     # Provide recommendations
            "follow_up_suggestions",        # Suggest follow-ups
            "interactive_elements",          # Create interactive elements
            "personalized_output"           # Personalized output
        ]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process response generation"""
        
        if task == "response_generation":
            return await self.generate_response(data)
        elif task == "result_formatting":
            return await self.format_results(data)
        elif task == "explanation_generation":
            return await self.generate_explanation(data)
        else:
            return {"success": False, "error": f"Unknown task: {task}"}
    
    async def generate_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo phản hồi cuối cùng"""
        
        evaluated_result = data.get("evaluated_result", "")
        quality_scores = data.get("quality_scores", {})
        original_query = data.get("original_query", "")
        
        response_prompt = f"""
        Generate final response với LEANN:
        
        Original query: {original_query}
        Evaluated result: {evaluated_result[:200]}...
        Quality scores: {quality_scores}
        
        Tạo phản hồi:
1. Address original query directly
2. Present key findings
3. Provide explanations
4. Include recommendations
5. Suggest follow-up actions
        """
        
        try:
            ai_response = await self.call_ollama(response_prompt)
            
            return {
                "success": True,
                "original_query": original_query,
                "final_response": ai_response,
                "quality_scores": quality_scores,
                "response_timestamp": datetime.now().isoformat(),
                "confidence": quality_scores.get("overall", 0.8)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Response generation failed: {str(e)}",
                "query": original_query
            }
