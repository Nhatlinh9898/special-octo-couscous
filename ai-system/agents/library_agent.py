"""
Library Agent - Agent chuyên quản lý thư viện số và liên kết các nguồn tài liệu miễn phí
"""

from typing import Dict, Any, List
import json
import asyncio
import httpx
from urllib.parse import quote
from .base_agent import BaseAgent

class LibraryAgent(BaseAgent):
    def __init__(self):
        super().__init__("library", "llama3:8b-instruct")
        self.description = "Agent chuyên quản lý thư viện số, tìm kiếm tài liệu và liên kết các nguồn miễn phí"
        self.capabilities = [
            "search_digital_library",
            "recommend_books",
            "manage_reading_lists",
            "connect_free_resources",
            "catalog_management",
            "content_curation",
            "accessibility_support"
        ]
        
        # Free digital libraries and resources
        self.free_libraries = {
            "project_gutenberg": {
                "name": "Project Gutenberg",
                "url": "https://www.gutenberg.org",
                "api_url": "https://gutendex.com/books",
                "description": "60,000+ free ebooks",
                "languages": ["en", "fr", "de", "es", "it", "pt", "vi"]
            },
            "internet_archive": {
                "name": "Internet Archive",
                "url": "https://archive.org",
                "api_url": "https://archive.org/advancedsearch.php",
                "description": "Millions of free books, movies, software",
                "languages": ["all"]
            },
            "open_library": {
                "name": "Open Library",
                "url": "https://openlibrary.org",
                "api_url": "https://openlibrary.org",
                "description": "Open, editable library catalog",
                "languages": ["all"]
            },
            "directory_of_open_access_journals": {
                "name": "DOAJ",
                "url": "https://doaj.org",
                "api_url": "https://doaj.org/api/v1",
                "description": "Directory of Open Access Journals",
                "languages": ["all"]
            },
            "arxiv": {
                "name": "arXiv",
                "url": "https://arxiv.org",
                "api_url": "https://export.arxiv.org/api/query",
                "description": "Free scientific papers",
                "languages": ["en"]
            },
            "vietnamese_sources": {
                "name": "Vietnamese Digital Libraries",
                "sources": [
                    {
                        "name": "Thư viện Quốc gia Việt Nam",
                        "url": "https://nlv.gov.vn",
                        "description": "National Library of Vietnam Digital Collection"
                    },
                    {
                        "name": "Sách Hay Online",
                        "url": "https://sachhayonline.com",
                        "description": "Vietnamese free books online"
                    },
                    {
                        "name": "VnExpress Thư viện",
                        "url": "https://vnexpress.net/thu-vien",
                        "description": "Vietnamese news and articles"
                    }
                ]
            }
        }
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Xử lý các tác vụ liên quan đến thư viện số"""
        
        if task == "search_digital_library":
            return await self.search_digital_library(data)
        elif task == "recommend_books":
            return await self.recommend_books(data)
        elif task == "manage_reading_lists":
            return await self.manage_reading_lists(data)
        elif task == "connect_free_resources":
            return await self.connect_free_resources(data)
        elif task == "catalog_management":
            return await self.catalog_management(data)
        elif task == "content_curation":
            return await self.content_curation(data)
        elif task == "accessibility_support":
            return await self.accessibility_support(data)
        else:
            return self.format_response(
                f"Task '{task}' not supported by Library Agent",
                confidence=0.1
            )
    
    async def search_digital_library(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tìm kiếm tài liệu trong các thư viện số miễn phí"""
        
        query = data.get("query", "")
        subject = data.get("subject", "")
        language = data.get("language", "vi")
        format_type = data.get("format", "all")  # ebook, audiobook, pdf, etc.
        max_results = data.get("max_results", 20)
        
        prompt = f"""
        Bạn là một thủ thư số chuyên nghiệp. Hãy tìm kiếm tài liệu với thông tin:
        
        Từ khóa tìm kiếm: {query}
        Môn học: {subject}
        Ngôn ngữ: {language}
        Định dạng: {format_type}
        Số kết quả tối đa: {max_results}
        
        Hãy tìm kiếm và trả về JSON với cấu trúc:
        {{
            "search_results": [
                {{
                    "title": "tên sách/tài liệu",
                    "author": "tác giả",
                    "source": "nguồn (Project Gutenberg, Internet Archive, etc.)",
                    "url": "link trực tiếp",
                    "download_url": "link tải xuống",
                    "format": "ebook/pdf/audiobook",
                    "language": "ngôn ngữ",
                    "pages": "số trang",
                    "publication_year": "năm xuất bản",
                    "description": "mô tả ngắn",
                    "relevance_score": 0.95,
                    "accessibility": "free/partial_free/premium"
                }}
            ],
            "total_found": 150,
            "search_time": "2.3s",
            "sources_searched": ["Project Gutenberg", "Internet Archive", "Open Library"],
            "recommendations": ["gợi ý tìm kiếm khác"]
        }}
        """
        
        system_prompt = "Bạn là thủ thư số chuyên nghiệp, luôn tìm kiếm tài liệu chính xác và cung cấp thông tin đầy đủ."
        
        response = await self.call_ollama(prompt, system_prompt)
        search_results = self.extract_json_from_response(response)
        
        # Thực hiện tìm kiếm thực tế từ các API
        real_results = await self.search_multiple_sources(query, subject, language, format_type, max_results)
        
        return self.format_response(
            {
                "ai_generated": search_results,
                "real_api_results": real_results,
                "combined_results": self.merge_results(search_results, real_results)
            },
            confidence=0.85,
            suggestions=[
                "Sử dụng bộ lọc nâng cấp để kết quả chính xác hơn",
                "Kiểm tra các định dạng file khác nhau",
                "Xem các tài liệu liên quan được đề xuất"
            ]
        )
    
    async def search_multiple_sources(self, query: str, subject: str, language: str, format_type: str, max_results: int) -> Dict[str, Any]:
        """Tìm kiếm thực tế từ nhiều nguồn"""
        
        results = []
        
        try:
            # Search Project Gutenberg
            gutenberg_results = await self.search_project_gutenberg(query, language, max_results // 4)
            results.extend(gutenberg_results)
            
            # Search Internet Archive
            archive_results = await self.search_internet_archive(query, subject, language, max_results // 4)
            results.extend(archive_results)
            
            # Search Open Library
            openlib_results = await self.search_open_library(query, language, max_results // 4)
            results.extend(openlib_results)
            
            # Search arXiv for academic content
            if subject in ["science", "mathematics", "computer", "physics", "biology"]:
                arxiv_results = await self.search_arxiv(query, max_results // 4)
                results.extend(arxiv_results)
                
        except Exception as e:
            print(f"Error searching sources: {str(e)}")
        
        return {
            "results": results[:max_results],
            "total_sources": len(results),
            "sources": ["Project Gutenberg", "Internet Archive", "Open Library", "arXiv"]
        }
    
    async def search_project_gutenberg(self, query: str, language: str, max_results: int) -> List[Dict]:
        """Tìm kiếm trong Project Gutenberg"""
        try:
            async with httpx.AsyncClient() as client:
                # Search using Gutendex API
                search_url = f"https://gutendex.com/books?search={quote(query)}&languages={language}&limit={max_results}"
                response = await client.get(search_url, timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    books = []
                    
                    for book in data.get("results", []):
                        books.append({
                            "title": book.get("title", ""),
                            "author": ", ".join([author.get("name", "") for author in book.get("authors", [])]),
                            "source": "Project Gutenberg",
                            "url": f"https://www.gutenberg.org/ebooks/{book.get('id')}",
                            "download_url": f"https://www.gutenberg.org/files/{book.get('id')}",
                            "format": "ebook",
                            "language": book.get("languages", ["en"])[0] if book.get("languages") else "en",
                            "pages": str(book.get("formats", {}).get("application/epub+zip", "").count("pages")),
                            "publication_year": book.get("download_count", 0),
                            "description": book.get("subjects", [])[:3],
                            "relevance_score": 0.8,
                            "accessibility": "free"
                        })
                    
                    return books
        except Exception as e:
            print(f"Project Gutenberg search error: {str(e)}")
            return []
    
    async def search_internet_archive(self, query: str, subject: str, language: str, max_results: int) -> List[Dict]:
        """Tìm kiếm trong Internet Archive"""
        try:
            async with httpx.AsyncClient() as client:
                search_query = f"{query} subject:{subject}" if subject else query
                search_url = f"https://archive.org/advancedsearch.php?q={quote(search_query)}&output=json&rows={max_results}"
                
                response = await client.get(search_url, timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    docs = data.get("response", {}).get("docs", [])
                    books = []
                    
                    for doc in docs:
                        books.append({
                            "title": doc.get("title", [""])[0],
                            "author": doc.get("creator", [""])[0] if doc.get("creator") else "",
                            "source": "Internet Archive",
                            "url": f"https://archive.org/details/{doc.get('identifier', '')}",
                            "download_url": f"https://archive.org/download/{doc.get('identifier', '')}",
                            "format": doc.get("format", [""])[0] if doc.get("format") else "mixed",
                            "language": doc.get("language", ["en"])[0] if doc.get("language") else "en",
                            "pages": doc.get("pages", ""),
                            "publication_year": doc.get("year", ""),
                            "description": doc.get("description", [""])[0] if doc.get("description") else "",
                            "relevance_score": 0.75,
                            "accessibility": "free"
                        })
                    
                    return books
        except Exception as e:
            print(f"Internet Archive search error: {str(e)}")
            return []
    
    async def search_open_library(self, query: str, language: str, max_results: int) -> List[Dict]:
        """Tìm kiếm trong Open Library"""
        try:
            async with httpx.AsyncClient() as client:
                search_url = f"https://openlibrary.org/search.json?q={quote(query)}&language={language}&limit={max_results}"
                
                response = await client.get(search_url, timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    docs = data.get("docs", [])
                    books = []
                    
                    for doc in docs:
                        books.append({
                            "title": doc.get("title", ""),
                            "author": ", ".join(doc.get("author_name", [])),
                            "source": "Open Library",
                            "url": f"https://openlibrary.org{doc.get('key', '')}",
                            "download_url": f"https://openlibrary.org{doc.get('key', '')}/borrow",
                            "format": "ebook",
                            "language": doc.get("language", ["en"])[0] if doc.get("language") else "en",
                            "pages": doc.get("number_of_pages", ""),
                            "publication_year": doc.get("first_publish_year", ""),
                            "description": doc.get("first_sentence", [""])[0] if doc.get("first_sentence") else "",
                            "relevance_score": 0.7,
                            "accessibility": "free"
                        })
                    
                    return books
        except Exception as e:
            print(f"Open Library search error: {str(e)}")
            return []
    
    async def search_arxiv(self, query: str, max_results: int) -> List[Dict]:
        """Tìm kiếm trong arXiv cho tài liệu học thuật"""
        try:
            async with httpx.AsyncClient() as client:
                search_url = f"https://export.arxiv.org/api/query?search_query=all:{quote(query)}&start=0&max_results={max_results}"
                
                response = await client.get(search_url, timeout=10.0)
                
                if response.status_code == 200:
                    # Parse XML response (simplified)
                    papers = []
                    
                    # For now, return mock data for arXiv
                    papers.append({
                        "title": f"Research papers related to {query}",
                        "author": "Various researchers",
                        "source": "arXiv",
                        "url": f"https://arxiv.org/search/?query={quote(query)}",
                        "download_url": f"https://arxiv.org/search/?query={quote(query)}",
                        "format": "pdf",
                        "language": "en",
                        "pages": "varies",
                        "publication_year": "2024",
                        "description": f"Academic papers and research related to {query}",
                        "relevance_score": 0.9,
                        "accessibility": "free"
                    })
                    
                    return papers
        except Exception as e:
            print(f"arXiv search error: {str(e)}")
            return []
    
    async def recommend_books(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Đề xuất sách dựa trên sở thích và lịch sử đọc"""
        
        user_id = data.get("user_id", "")
        reading_history = data.get("reading_history", [])
        preferences = data.get("preferences", {})
        current_level = data.get("current_level", "intermediate")
        goals = data.get("goals", [])
        
        prompt = f"""
        Bạn là một chuyên gia推荐 sách. Hãy đề xuất sách dựa trên thông tin:
        
        ID người dùng: {user_id}
        Lịch sử đọc: {reading_history}
        Sở thích: {preferences}
        Trình độ: {current_level}
        Mục tiêu: {goals}
        
        Hãy đề xuất và trả về JSON:
        {{
            "recommendations": [
                {{
                    "title": "tên sách",
                    "author": "tác giả",
                    "isbn": "ISBN",
                    "genre": "thể loại",
                    "reading_level": "beginner/intermediate/advanced",
                    "estimated_reading_time": "thời gian đọc ước tính",
                    "why_recommended": "lý do đề xuất",
                    "similarity_score": 0.85,
                    "source": "nguồn",
                    "availability": "free/partial_free/premium",
                    "rating": 4.5,
                    "topics_covered": ["chủ đề 1", "chủ đề 2"]
                }}
            ],
            "reading_path": [
                {{
                    "step": 1,
                    "book_title": "tên sách",
                    "purpose": "mục đích",
                    "prerequisites": ["kiến thức cần có"]
                }}
            ],
            "personalized_tips": ["lời khuyên cá nhân hóa"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia推荐 sách, luôn đưa ra gợi ý phù hợp và cá nhân hóa."
        
        response = await self.call_ollama(prompt, system_prompt)
        recommendations = self.extract_json_from_response(response)
        
        return self.format_response(
            recommendations,
            confidence=0.88,
            suggestions=[
                "Bắt đầu với sách phù hợp trình độ",
                "Tạo lịch đọc đều đặn",
                "Ghi chú và review sau khi đọc xong"
            ]
        )
    
    async def manage_reading_lists(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Quản lý danh sách đọc của người dùng"""
        
        user_id = data.get("user_id", "")
        action = data.get("action", "create")  # create, update, delete, get
        list_name = data.get("list_name", "")
        books = data.get("books", [])
        
        if action == "create":
            return await self.create_reading_list(user_id, list_name, books)
        elif action == "update":
            return await self.update_reading_list(user_id, list_name, books)
        elif action == "delete":
            return await self.delete_reading_list(user_id, list_name)
        elif action == "get":
            return await self.get_reading_lists(user_id)
        else:
            return self.format_response("Invalid action", confidence=0.1)
    
    async def create_reading_list(self, user_id: str, list_name: str, books: List[Dict]) -> Dict[str, Any]:
        """Tạo danh sách đọc mới"""
        
        prompt = f"""
        Hãy tạo danh sách đọc với thông tin:
        Người dùng: {user_id}
        Tên danh sách: {list_name}
        Sách: {books}
        
        Trả về JSON:
        {{
            "list_id": "unique_id",
            "list_name": "{list_name}",
            "created_date": "2024-02-04",
            "books": books,
            "total_books": len(books),
            "estimated_reading_time": "total hours",
            "reading_plan": [
                {{
                    "week": 1,
                    "books": ["book 1", "book 2"],
                    "goals": ["mục tiêu tuần"]
                }}
            ],
            "progress_tracking": {{
                "completed": 0,
                "in_progress": 0,
                "not_started": len(books)
            }}
        }}
        """
        
        response = await self.call_ollama(prompt)
        reading_list = self.extract_json_from_response(response)
        
        return self.format_response(
            reading_list,
            confidence=0.90,
            suggestions=[
                "Đặt mục tiêu đọc hàng tuần",
                "Theo dõi tiến độ thường xuyên",
                "Chia sẻ danh sách với bạn bè"
            ]
        )
    
    async def connect_free_resources(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Liên kết các tài nguyên miễn phí"""
        
        subject = data.get("subject", "")
        education_level = data.get("education_level", "all")
        resource_type = data.get("resource_type", "all")  # video, article, course, book
        
        prompt = f"""
        Bạn là chuyên gia về tài nguyên giáo dục miễn phí. Hãy tìm và liên kết các tài nguyên với thông tin:
        
        Môn học: {subject}
        Trình độ: {education_level}
        Loại tài nguyên: {resource_type}
        
        Hãy tìm kiếm và trả về JSON:
        {{
            "free_resources": [
                {{
                    "title": "tên tài nguyên",
                    "provider": "nhà cung cấp",
                    "url": "link trực tiếp",
                    "type": "video/article/course/book",
                    "duration": "thời lượng",
                    "difficulty": "beginner/intermediate/advanced",
                    "language": "ngôn ngữ",
                    "description": "mô tả",
                    "topics": ["chủ đề 1", "chủ đề 2"],
                    "certification": "yes/no",
                    "rating": 4.5,
                    "reviews_count": 150
                }}
            ],
            "learning_paths": [
                {{
                    "path_name": "tên lộ trình",
                    "resources": ["resource 1", "resource 2"],
                    "total_duration": "tổng thời gian",
                    "skills_gained": ["kỹ năng 1", "kỹ năng 2"]
                }}
            ],
            "best_for": ["đối tượng phù hợp"],
            "accessibility_features": ["tính năng khuyết tật"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia tài nguyên giáo dục, luôn tìm kiếm các nguồn miễn phí chất lượng cao."
        
        response = await self.call_ollama(prompt, system_prompt)
        resources = self.extract_json_from_response(response)
        
        return self.format_response(
            resources,
            confidence=0.85,
            suggestions=[
                "Kiểm tra các chứng chỉ có sẵn",
                "Tạo lịch học tập từ tài nguyên",
                "Kết hợp nhiều loại tài nguyên"
            ]
        )
    
    async def catalog_management(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Quản lý danh mục thư viện"""
        
        action = data.get("action", "browse")
        category = data.get("category", "all")
        sort_by = data.get("sort_by", "popularity")
        
        prompt = f"""
        Bạn là một thủ thư quản lý danh mục. Hãy {action} danh mục với thông tin:
        
        Hành động: {action}
        Danh mục: {category}
        Sắp xếp: {sort_by}
        
        Trả về JSON:
        {{
            "catalog": [
                {{
                    "category": "danh mục",
                    "subcategory": "danh mục con",
                    "item_count": 150,
                    "popular_items": [
                        {{
                            "title": "tên",
                            "author": "tác giả",
                            "popularity_score": 0.95
                        }}
                    ],
                    "new_additions": [
                        {{
                            "title": "tên mới",
                            "added_date": "2024-02-04"
                        }}
                    ]
                }}
            ],
            "categories": [
                {{
                    "name": "tên danh mục",
                    "description": "mô tả",
                    "item_count": 500
                }}
            ],
            "trending": ["xu hướng 1", "xu hướng 2"]
        }}
        """
        
        response = await self.call_ollama(prompt)
        catalog = self.extract_json_from_response(response)
        
        return self.format_response(
            catalog,
            confidence=0.80,
            suggestions=[
                "Khám phá các danh mục liên quan",
                "Kiểm tra các mục mới thêm",
                "Xem các mục phổ biến"
            ]
        )
    
    async def content_curation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Biên tập nội dung giáo dục"""
        
        topic = data.get("topic", "")
        target_audience = data.get("target_audience", "students")
        content_type = data.get("content_type", "reading_list")
        
        prompt = f"""
        Bạn là một biên tập viên nội dung giáo dục. Hãy biên tập nội dung với thông tin:
        
        Chủ đề: {topic}
        Đối tượng: {target_audience}
        Loại nội dung: {content_type}
        
        Hãy biên tập và trả về JSON:
        {{
            "curated_content": [
                {{
                    "title": "tên nội dung",
                    "description": "mô tả",
                    "content_type": "article/video/book/course",
                    "url": "link",
                    "duration": "thời lượng",
                    "difficulty": "beginner/intermediate/advanced",
                    "learning_objectives": ["mục tiêu 1", "mục tiêu 2"],
                    "prerequisites": ["điều kiện tiên quyết"],
                    "assessment_methods": ["phương pháp đánh giá"],
                    "quality_score": 0.9
                }}
            ],
            "learning_sequence": [
                {{
                    "step": 1,
                    "content": "nội dung bước 1",
                    "estimated_time": "thời gian",
                    "objectives": ["mục tiêu"]
                }}
            ],
            "supplementary_materials": ["tài liệu bổ sung"]
        }}
        """
        
        system_prompt = "Bạn là biên tập viên nội dung chuyên nghiệp, luôn chọn lọc tài liệu chất lượng cao."
        
        response = await self.call_ollama(prompt, system_prompt)
        curated_content = self.extract_json_from_response(response)
        
        return self.format_response(
            curated_content,
            confidence=0.87,
            suggestions=[
                "Theo đúng trình độ học tập",
                "Kết hợp nhiều loại nội dung",
                "Kiểm tra chất lượng trước khi sử dụng"
            ]
        )
    
    async def accessibility_support(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Hỗ trợ truy cập cho người khuyết tật"""
        
        disability_type = data.get("disability_type", "")
        content_format = data.get("content_format", "all")
        
        prompt = f"""
        Bạn là chuyên gia về truy cập cho người khuyết tật. Hãy cung cấp hỗ trợ với thông tin:
        
        Loại khuyết tật: {disability_type}
        Định dạng nội dung: {content_format}
        
        Hãy cung cấp và trả về JSON:
        {{
            "accessibility_features": [
                {{
                    "feature": "tính năng",
                    "description": "mô tả",
                    "supported_formats": ["định dạng hỗ trợ"],
                    "tools_needed": ["công cụ cần thiết"],
                    "setup_instructions": "hướng dẫn thiết lập"
                }}
            ],
            "accessible_resources": [
                {{
                    "title": "tên tài nguyên",
                    "url": "link",
                    "accessibility_level": "high/medium/low",
                    "features": ["tính năng truy cập"],
                    "alternative_formats": ["định dạng thay thế"]
                }}
            ],
            "assistive_technology": [
                {{
                    "technology": "công nghệ hỗ trợ",
                    "description": "mô tả",
                    "compatibility": "tương thích",
                    "cost": "free/paid"
                }}
            ],
            "best_practices": ["thực hành tốt nhất"]
        }}
        """
        
        system_prompt = "Bạn là chuyên gia về truy cập, luôn đảm bảo nội dung phù hợp cho mọi người dùng."
        
        response = await self.call_ollama(prompt, system_prompt)
        accessibility_info = self.extract_json_from_response(response)
        
        return self.format_response(
            accessibility_info,
            confidence=0.90,
            suggestions=[
                "Sử dụng các công cụ hỗ trợ phù hợp",
                "Kiểm tra tính truy cập thường xuyên",
                "Cung cấp nhiều định dạng nội dung"
            ]
        )
    
    def merge_results(self, ai_results: Dict, real_results: Dict) -> Dict[str, Any]:
        """Kết hợp kết quả từ AI và API thực tế"""
        
        merged = {
            "combined_results": [],
            "total_found": 0,
            "sources": []
        }
        
        # Add AI results
        if "search_results" in ai_results:
            merged["combined_results"].extend(ai_results["search_results"])
        
        # Add real API results
        if "results" in real_results:
            merged["combined_results"].extend(real_results["results"])
        
        # Remove duplicates based on title and author
        unique_results = []
        seen = set()
        
        for result in merged["combined_results"]:
            key = f"{result.get('title', '')}_{result.get('author', '')}"
            if key not in seen:
                seen.add(key)
                unique_results.append(result)
        
        merged["combined_results"] = unique_results
        merged["total_found"] = len(unique_results)
        merged["sources"] = ["AI Generated", "Project Gutenberg", "Internet Archive", "Open Library", "arXiv"]
        
        return merged
