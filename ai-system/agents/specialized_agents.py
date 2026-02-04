"""
Specialized Data Processing Agents
Các agents chuyên biệt cho từng giai đoạn xử lý dữ liệu
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Any, List, Set, Tuple
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import aiofiles
import httpx
from .base_agent import BaseAgent

@dataclass
class DataPacket:
    packet_id: str
    content: Any
    metadata: Dict[str, Any]
    checksum: str
    priority: int
    timestamp: float

class DataReaderAgent(BaseAgent):
    """Agent chuyên đọc dữ liệu từ nhiều nguồn khác nhau"""
    
    def __init__(self):
        super().__init__("data_reader", "llama3:8b-instruct")
        self.description = "Agent chuyên đọc và parse dữ liệu từ nhiều nguồn"
        self.capabilities = [
            "multi_source_reading",
            "data_normalization",
            "format_detection",
            "content_extraction"
        ]
        
        self.supported_formats = [
            "json", "xml", "csv", "txt", "pdf", "html", "api", "database"
        ]
        
        self.reading_strategies = {
            "batch": self.batch_read,
            "streaming": self.streaming_read,
            "parallel": self.parallel_read
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý tác vụ đọc dữ liệu"""
        
        if task == "read_from_sources":
            return await self.read_from_sources(data)
        elif task == "normalize_data":
            return await self.normalize_data(data)
        elif task == "extract_content":
            return await self.extract_content(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def read_from_sources(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đọc dữ liệu từ nhiều nguồn"""
        
        sources = data.get("sources", [])
        reading_config = data.get("config", {})
        strategy = reading_config.get("strategy", "parallel")
        
        reading_function = self.reading_strategies.get(strategy, self.parallel_read)
        
        # Đọc dữ liệu từ các nguồn
        raw_data = await reading_function(sources, reading_config)
        
        # Phân tích và chuẩn hóa
        normalized_data = await self.normalize_data({"raw_data": raw_data})
        
        return self.format_response(
            {
                "sources_count": len(sources),
                "raw_data": raw_data,
                "normalized_data": normalized_data,
                "reading_statistics": await self.calculate_reading_stats(raw_data)
            },
            confidence=0.92,
            suggestions=[
                "Sử dụng caching cho frequently accessed sources",
                "Implement retry mechanism cho unreliable sources",
                "Monitor reading performance và optimize"
            ]
        )
    
    async def parallel_read(self, sources: List[str], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Đọc song song từ nhiều nguồn"""
        
        max_concurrent = config.get("max_concurrent", 10)
        timeout = config.get("timeout", 30)
        
        async def read_single_source(source: str) -> Dict[str, Any]:
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(source)
                    if response.status_code == 200:
                        content_type = response.headers.get("content-type", "")
                        
                        # Detect format
                        data_format = self.detect_format(content_type, source)
                        
                        # Parse content
                        parsed_content = await self.parse_content(response.content, data_format)
                        
                        return {
                            "source": source,
                            "format": data_format,
                            "content": parsed_content,
                            "status": "success",
                            "size": len(response.content),
                            "read_at": time.time()
                        }
                    else:
                        return {
                            "source": source,
                            "status": "error",
                            "error": f"HTTP {response.status_code}",
                            "read_at": time.time()
                        }
                        
            except Exception as e:
                return {
                    "source": source,
                    "status": "error",
                    "error": str(e),
                    "read_at": time.time()
                }
        
        # Execute parallel reads
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def limited_read(source: str):
            async with semaphore:
                return await read_single_source(source)
        
        tasks = [limited_read(source) for source in sources]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [r for r in results if isinstance(r, dict)]
    
    def detect_format(self, content_type: str, source: str) -> str:
        """Phát hiện định dạng dữ liệu"""
        
        content_type = content_type.lower()
        
        if "json" in content_type:
            return "json"
        elif "xml" in content_type:
            return "xml"
        elif "csv" in content_type:
            return "csv"
        elif "html" in content_type:
            return "html"
        elif "pdf" in content_type:
            return "pdf"
        else:
            # Detect from file extension
            if source.endswith(".json"):
                return "json"
            elif source.endswith(".xml"):
                return "xml"
            elif source.endswith(".csv"):
                return "csv"
            elif source.endswith(".html"):
                return "html"
            else:
                return "text"
    
    async def parse_content(self, content: bytes, data_format: str) -> Any:
        """Parse nội dung theo định dạng"""
        
        try:
            if data_format == "json":
                return json.loads(content.decode())
            elif data_format == "xml":
                # Simple XML parsing (would need proper XML parser)
                return {"xml_content": content.decode()}
            elif data_format == "csv":
                # Simple CSV parsing (would need proper CSV parser)
                lines = content.decode().split('\n')
                return {"csv_lines": lines}
            else:
                return {"text_content": content.decode()}
        except Exception as e:
            return {"parse_error": str(e), "raw_content": content.decode()}
    
    async def normalize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Chuẩn hóa dữ liệu"""
        
        raw_data = data.get("raw_data", [])
        normalized_items = []
        
        for item in raw_data:
            if item.get("status") == "success":
                # Extract and normalize content
                normalized_item = {
                    "id": hashlib.md5(item["source"].encode()).hexdigest(),
                    "source": item["source"],
                    "format": item["format"],
                    "content": item["content"],
                    "metadata": {
                        "size": item.get("size", 0),
                        "read_at": item.get("read_at", time.time()),
                        "format": item.get("format", "unknown")
                    },
                    "checksum": hashlib.md5(str(item["content"]).encode()).hexdigest()
                }
                normalized_items.append(normalized_item)
        
        return {
            "total_items": len(normalized_items),
            "items": normalized_items,
            "normalization_stats": await self.calculate_normalization_stats(normalized_items)
        }
    
    async def calculate_reading_stats(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Tính toán thống kê đọc dữ liệu"""
        
        successful_reads = [item for item in raw_data if item.get("status") == "success"]
        failed_reads = [item for item in raw_data if item.get("status") == "error"]
        
        total_size = sum(item.get("size", 0) for item in successful_reads)
        
        return {
            "total_sources": len(raw_data),
            "successful_reads": len(successful_reads),
            "failed_reads": len(failed_reads),
            "success_rate": len(successful_reads) / len(raw_data) if raw_data else 0,
            "total_bytes_read": total_size,
            "average_size": total_size / len(successful_reads) if successful_reads else 0,
            "formats_distribution": self.count_formats(successful_reads)
        }
    
    async def calculate_normalization_stats(self, normalized_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Tính toán thống kê chuẩn hóa"""
        
        return {
            "normalized_items": len(normalized_items),
            "formats": list(set(item.get("format", "unknown") for item in normalized_items)),
            "average_content_size": sum(len(str(item.get("content", ""))) for item in normalized_items) / len(normalized_items) if normalized_items else 0
        }
    
    def count_formats(self, items: List[Dict[str, Any]]) -> Dict[str, int]:
        """Đếm số lượng theo định dạng"""
        
        format_counts = {}
        for item in items:
            format_type = item.get("format", "unknown")
            format_counts[format_type] = format_counts.get(format_type, 0) + 1
        
        return format_counts
    
    async def batch_read(self, sources: List[str], batch_size: int = 10) -> List[Dict[str, Any]]:
        """Đọc dữ liệu theo batch"""
        results = []
        
        for i in range(0, len(sources), batch_size):
            batch = sources[i:i + batch_size]
            batch_results = await self.parallel_read(batch, max_concurrent=batch_size)
            results.extend(batch_results)
        
        return results
    
    async def streaming_read(self, sources: List[str]) -> List[Dict[str, Any]]:
        """Đọc dữ liệu theo streaming"""
        results = []
        
        for source in sources:
            try:
                result = await self.read_single_source(source)
                results.append(result)
            except Exception as e:
                results.append({
                    "source": source,
                    "status": "error",
                    "error": str(e),
                    "read_at": time.time()
                })
        
        return results
    
    async def parallel_read(self, sources: List[str], max_concurrent: int = 5) -> List[Dict[str, Any]]:
        """Đọc dữ liệu song song"""
        import asyncio
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def limited_read(source: str):
            async with semaphore:
                return await self.read_single_source(source)
        
        tasks = [limited_read(source) for source in sources]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [r for r in results if isinstance(r, dict)]
    
    async def read_single_source(self, source: str) -> Dict[str, Any]:
        """Đọc từ một nguồn dữ liệu"""
        try:
            # Simulate reading from source
            if source.startswith("http"):
                async with httpx.AsyncClient() as client:
                    response = await client.get(source)
                    if response.status_code == 200:
                        return {
                            "source": source,
                            "status": "success",
                            "content": response.text,
                            "size": len(response.content),
                            "read_at": time.time()
                        }
                    else:
                        return {
                            "source": source,
                            "status": "error",
                            "error": f"HTTP {response.status_code}",
                            "read_at": time.time()
                        }
            else:
                # Simulate file reading
                return {
                    "source": source,
                    "status": "success",
                    "content": f"Simulated content from {source}",
                    "size": 100,
                    "read_at": time.time()
                }
        except Exception as e:
            return {
                "source": source,
                "status": "error",
                "error": str(e),
                "read_at": time.time()
            }

class DataFilterAgent(BaseAgent):
    """Agent chuyên lọc dữ liệu dựa trên criteria"""
    
    def __init__(self):
        super().__init__("data_filter", "llama3:8b-instruct")
        self.description = "Agent chuyên lọc và làm sạch dữ liệu"
        self.capabilities = [
            "content_filtering",
            "quality_assessment",
            "spam_detection",
            "duplicate_detection"
        ]
        
        self.filter_criteria = {
            "content_quality": {
                "min_length": 50,
                "max_length": 100000,
                "required_fields": ["title", "content"],
                "language_detection": True
            },
            "spam_detection": {
                "check_patterns": True,
                "blacklist_keywords": ["spam", "advertisement"],
                "whitelist_domains": ["edu", "gov", "org"]
            },
            "quality_thresholds": {
                "min_quality_score": 0.6,
                "max_errors": 5,
                "completeness_threshold": 0.7
            }
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý tác vụ lọc dữ liệu"""
        
        if task == "filter_data":
            return await self.filter_data(data)
        elif task == "assess_quality":
            return await self.assess_quality(data)
        elif task == "detect_spam":
            return await self.detect_spam(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def filter_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Lọc dữ liệu theo criteria"""
        
        items = data.get("items", [])
        filter_config = data.get("config", self.filter_criteria)
        
        filtered_items = []
        rejected_items = []
        filter_stats = {
            "total_processed": len(items),
            "passed_filters": 0,
            "rejected": 0,
            "rejection_reasons": {}
        }
        
        for item in items:
            filter_result = await self.apply_filters(item, filter_config)
            
            if filter_result["passed"]:
                filtered_items.append({
                    **item,
                    "filter_metadata": filter_result["metadata"]
                })
                filter_stats["passed_filters"] += 1
            else:
                rejected_items.append({
                    **item,
                    "rejection_reason": filter_result["reason"]
                })
                filter_stats["rejected"] += 1
                
                # Track rejection reasons
                reason = filter_result["reason"]
                filter_stats["rejection_reasons"][reason] = filter_stats["rejection_reasons"].get(reason, 0) + 1
        
        return self.format_response(
            {
                "filtered_items": filtered_items,
                "rejected_items": rejected_items,
                "filter_statistics": filter_stats,
                "filter_efficiency": filter_stats["passed_filters"] / filter_stats["total_processed"] if filter_stats["total_processed"] > 0 else 0
            },
            confidence=0.88,
            suggestions=[
                "Tinh chỉnh filter criteria cho phù hợp",
                "Implement machine learning cho spam detection",
                "Monitor filter performance và adjust"
            ]
        )
    
    async def apply_filters(self, item: Dict[str, Any], filter_config: Dict[str, Any]) -> Dict[str, Any]:
        """Áp dụng các bộ lọc"""
        
        # Content quality filter
        quality_result = await self.check_content_quality(item, filter_config.get("content_quality", {}))
        if not quality_result["passed"]:
            return {"passed": False, "reason": f"Quality: {quality_result['reason']}", "metadata": {}}
        
        # Spam detection
        spam_result = await self.check_spam(item, filter_config.get("spam_detection", {}))
        if not spam_result["passed"]:
            return {"passed": False, "reason": f"Spam: {spam_result['reason']}", "metadata": {}}
        
        # Quality threshold
        threshold_result = await self.check_quality_thresholds(item, filter_config.get("quality_thresholds", {}))
        if not threshold_result["passed"]:
            return {"passed": False, "reason": f"Threshold: {threshold_result['reason']}", "metadata": {}}
        
        return {
            "passed": True,
            "reason": "All filters passed",
            "metadata": {
                "quality_score": quality_result.get("score", 0.8),
                "spam_score": spam_result.get("score", 0.1),
                "threshold_score": threshold_result.get("score", 0.8)
            }
        }
    
    async def check_content_quality(self, item: Dict[str, Any], criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Kiểm tra chất lượng nội dung"""
        
        content = str(item.get("content", ""))
        title = str(item.get("title", ""))
        
        # Length checks
        if len(content) < criteria.get("min_length", 50):
            return {"passed": False, "reason": "Content too short", "score": 0.2}
        
        if len(content) > criteria.get("max_length", 100000):
            return {"passed": False, "reason": "Content too long", "score": 0.3}
        
        # Required fields
        required_fields = criteria.get("required_fields", [])
        for field in required_fields:
            if field not in item or not item[field]:
                return {"passed": False, "reason": f"Missing required field: {field}", "score": 0.4}
        
        # Calculate quality score
        quality_score = 0.8
        
        # Title quality
        if 10 <= len(title) <= 200:
            quality_score += 0.1
        
        # Content structure
        if any(punct in content for punct in [".", "!", "?"]):
            quality_score += 0.1
        
        return {"passed": True, "reason": "Quality OK", "score": min(quality_score, 1.0)}
    
    async def check_spam(self, item: Dict[str, Any], criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Kiểm tra spam"""
        
        content = str(item.get("content", "")).lower()
        source = str(item.get("source", "")).lower()
        
        spam_score = 0.0
        
        # Check blacklist keywords
        blacklist_keywords = criteria.get("blacklist_keywords", [])
        for keyword in blacklist_keywords:
            if keyword in content:
                spam_score += 0.3
        
        # Check whitelist domains
        whitelist_domains = criteria.get("whitelist_domains", [])
        if whitelist_domains:
            is_whitelisted = any(domain in source for domain in whitelist_domains)
            if is_whitelisted:
                spam_score -= 0.2
        
        # Check for spam patterns
        if criteria.get("check_patterns", True):
            # Excessive capitalization
            if content.upper() == content and len(content) > 50:
                spam_score += 0.2
            
            # Excessive punctuation
            if content.count("!") > 3 or content.count("?") > 3:
                spam_score += 0.2
        
        is_spam = spam_score > 0.5
        
        return {
            "passed": not is_spam,
            "reason": "Spam detected" if is_spam else "Not spam",
            "score": spam_score
        }
    
    async def check_quality_thresholds(self, item: Dict[str, Any], thresholds: Dict[str, Any]) -> Dict[str, Any]:
        """Kiểm tra ngưỡng chất lượng"""
        
        # Calculate item quality
        quality_score = await self.calculate_item_quality(item)
        
        # Check minimum quality
        min_quality = thresholds.get("min_quality_score", 0.6)
        if quality_score < min_quality:
            return {"passed": False, "reason": f"Quality score {quality_score} below threshold {min_quality}", "score": quality_score}
        
        return {"passed": True, "reason": "Quality threshold met", "score": quality_score}
    
    async def calculate_item_quality(self, item: Dict[str, Any]) -> float:
        """Tính toán chất lượng item"""
        
        quality_factors = {
            "content_length": min(len(str(item.get("content", ""))) / 1000, 1.0),
            "title_length": min(len(str(item.get("title", ""))) / 50, 1.0),
            "metadata_completeness": len(item.get("metadata", {})) / 10,  # Assume 10 metadata fields max
            "source_reliability": 0.8  # Would be calculated based on source reputation
        }
        
        # Weighted average
        weights = {"content_length": 0.3, "title_length": 0.2, "metadata_completeness": 0.3, "source_reliability": 0.2}
        
        total_score = sum(
            quality_factors[factor] * weights[factor] 
            for factor in quality_factors
        )
        
        return min(total_score, 1.0)

class DataDedupAgent(BaseAgent):
    """Agent chuyên loại bỏ dữ liệu trùng lặp"""
    
    def __init__(self):
        super().__init__("data_dedup", "llama3:8b-instruct")
        self.description = "Agent chuyên phát hiện và loại bỏ dữ liệu trùng lặp"
        self.capabilities = [
            "exact_deduplication",
            "fuzzy_deduplication",
            "semantic_deduplication",
            "content_hashing"
        ]
        
        self.dedup_strategies = {
            "exact": self.exact_deduplication,
            "fuzzy": self.fuzzy_deduplication,
            "semantic": self.semantic_deduplication
        }
        
        # Global dedup cache
        self.global_cache = {}
        self.similarity_threshold = 0.85
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý tác vụ deduplication"""
        
        if task == "deduplicate_data":
            return await self.deduplicate_data(data)
        elif task == "find_similar":
            return await self.find_similar_items(data)
        elif task == "update_cache":
            return await self.update_dedup_cache(data)
        else:
            return self.format_response(f"Task '{task}' not supported", confidence=0.1)
    
    async def deduplicate_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Loại bỏ dữ liệu trùng lặp"""
        
        items = data.get("items", [])
        strategy = data.get("strategy", "exact")
        config = data.get("config", {})
        
        dedup_function = self.dedup_strategies.get(strategy, self.exact_deduplication)
        
        # Apply deduplication
        dedup_result = await dedup_function(items, config)
        
        # Update global cache
        await self.update_global_cache(dedup_result["unique_items"])
        
        return self.format_response(
            {
                "original_count": len(items),
                "unique_count": len(dedup_result["unique_items"]),
                "duplicates_found": len(dedup_result["duplicates"]),
                "deduplication_rate": len(dedup_result["duplicates"]) / len(items) if items else 0,
                "unique_items": dedup_result["unique_items"],
                "duplicates": dedup_result["duplicates"],
                "deduplication_stats": dedup_result["stats"]
            },
            confidence=0.90,
            suggestions=[
                "Sử dụng multiple deduplication strategies cho better accuracy",
                "Implement incremental deduplication cho real-time processing",
                "Tune similarity thresholds cho domain-specific needs"
            ]
        )
    
    async def exact_deduplication(self, items: List[Dict[str, Any]], config: Dict[str, Any]) -> Dict[str, Any]:
        """Exact deduplication dựa trên content hash"""
        
        seen_hashes = set()
        unique_items = []
        duplicates = []
        
        for item in items:
            # Create content hash
            content = f"{item.get('title', '')}{item.get('content', '')}"
            content_hash = hashlib.md5(content.encode()).hexdigest()
            
            if content_hash not in seen_hashes:
                seen_hashes.add(content_hash)
                item["content_hash"] = content_hash
                unique_items.append(item)
            else:
                duplicates.append({
                    **item,
                    "duplicate_of": content_hash,
                    "dedup_type": "exact"
                })
        
        return {
            "unique_items": unique_items,
            "duplicates": duplicates,
            "stats": {
                "strategy": "exact",
                "unique_hashes": len(seen_hashes),
                "cache_hits": 0  # Would track cache hits
            }
        }
    
    async def fuzzy_deduplication(self, items: List[Dict[str, Any]], config: Dict[str, Any]) -> Dict[str, Any]:
        """Fuzzy deduplication dựa trên similarity"""
        
        unique_items = []
        duplicates = []
        similarity_threshold = config.get("similarity_threshold", self.similarity_threshold)
        
        for i, item in enumerate(items):
            is_duplicate = False
            
            # Compare with existing unique items
            for unique_item in unique_items:
                similarity = await self.calculate_similarity(item, unique_item)
                
                if similarity >= similarity_threshold:
                    duplicates.append({
                        **item,
                        "duplicate_of": unique_item.get("id", ""),
                        "similarity": similarity,
                        "dedup_type": "fuzzy"
                    })
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_items.append(item)
        
        return {
            "unique_items": unique_items,
            "duplicates": duplicates,
            "stats": {
                "strategy": "fuzzy",
                "similarity_threshold": similarity_threshold,
                "comparisons_made": len(items) * len(unique_items)
            }
        }
    
    async def semantic_deduplication(self, items: List[Dict[str, Any]], config: Dict[str, Any]) -> Dict[str, Any]:
        """Semantic deduplication dựa trên meaning"""
        
        unique_items = []
        duplicates = []
        
        for item in items:
            # Extract semantic features
            semantic_features = await self.extract_semantic_features(item)
            
            # Check against global cache
            is_duplicate = False
            for cached_hash, cached_item in self.global_cache.items():
                semantic_similarity = await self.calculate_semantic_similarity(
                    semantic_features, cached_item.get("semantic_features", {})
                )
                
                if semantic_similarity >= self.similarity_threshold:
                    duplicates.append({
                        **item,
                        "duplicate_of": cached_item.get("id", ""),
                        "semantic_similarity": semantic_similarity,
                        "dedup_type": "semantic"
                    })
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                item["semantic_features"] = semantic_features
                unique_items.append(item)
        
        return {
            "unique_items": unique_items,
            "duplicates": duplicates,
            "stats": {
                "strategy": "semantic",
                "semantic_threshold": self.similarity_threshold,
                "cache_size": len(self.global_cache)
            }
        }
    
    async def calculate_similarity(self, item1: Dict[str, Any], item2: Dict[str, Any]) -> float:
        """Tính toán similarity giữa 2 items"""
        
        # Simple text similarity (would use more sophisticated methods)
        text1 = f"{item1.get('title', '')} {item1.get('content', '')}"
        text2 = f"{item2.get('title', '')} {item2.get('content', '')}"
        
        # Jaccard similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    async def extract_semantic_features(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Extract semantic features từ item"""
        
        text = f"{item.get('title', '')} {item.get('content', '')}"
        
        # Simple feature extraction (would use NLP models)
        features = {
            "word_count": len(text.split()),
            "char_count": len(text),
            "unique_words": len(set(text.lower().split())),
            "keywords": self.extract_keywords(text),
            "language": self.detect_language(text)
        }
        
        return features
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords từ text"""
        
        # Simple keyword extraction (would use NLP)
        words = text.lower().split()
        # Filter common words and return top keywords
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"}
        keywords = [word for word in words if len(word) > 3 and word not in common_words]
        
        return keywords[:10]  # Return top 10 keywords
    
    def detect_language(self, text: str) -> str:
        """Detect language của text"""
        
        # Simple language detection (would use proper language detection)
        vietnamese_chars = set("àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ")
        
        if any(char in vietnamese_chars for char in text.lower()):
            return "vi"
        else:
            return "en"
    
    async def calculate_semantic_similarity(self, features1: Dict[str, Any], features2: Dict[str, Any]) -> float:
        """Tính toán semantic similarity"""
        
        # Simple semantic similarity based on features
        keyword_overlap = len(set(features1.get("keywords", [])) & set(features2.get("keywords", [])))
        total_keywords = len(set(features1.get("keywords", [])) | set(features2.get("keywords", [])))
        
        keyword_similarity = keyword_overlap / total_keywords if total_keywords > 0 else 0
        
        # Language similarity
        language_similarity = 1.0 if features1.get("language") == features2.get("language") else 0.5
        
        # Length similarity
        length_diff = abs(features1.get("word_count", 0) - features2.get("word_count", 0))
        max_length = max(features1.get("word_count", 1), features2.get("word_count", 1))
        length_similarity = 1.0 - (length_diff / max_length)
        
        # Weighted average
        return (keyword_similarity * 0.5 + language_similarity * 0.3 + length_similarity * 0.2)
    
    async def update_global_cache(self, unique_items: List[Dict[str, Any]]) -> None:
        """Cập nhật global cache"""
        
        for item in unique_items:
            item_id = item.get("id", "")
            if item_id:
                self.global_cache[item_id] = item
    
    async def find_similar_items(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tìm các items tương tự"""
        
        query_item = data.get("query_item", {})
        threshold = data.get("threshold", self.similarity_threshold)
        
        similar_items = []
        
        for cached_item in self.global_cache.values():
            similarity = await self.calculate_similarity(query_item, cached_item)
            
            if similarity >= threshold:
                similar_items.append({
                    **cached_item,
                    "similarity": similarity
                })
        
        # Sort by similarity
        similar_items.sort(key=lambda x: x["similarity"], reverse=True)
        
        return self.format_response(
            {
                "query_item": query_item,
                "similar_items": similar_items,
                "threshold": threshold,
                "found_count": len(similar_items)
            },
            confidence=0.85
        )
    
    async def update_dedup_cache(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật dedup cache"""
        
        new_items = data.get("items", [])
        
        for item in new_items:
            item_id = item.get("id", "")
            if item_id:
                self.global_cache[item_id] = item
        
        return self.format_response(
            {
                "cache_size": len(self.global_cache),
                "items_added": len(new_items),
                "cache_updated": True
            },
            confidence=0.95
        )
