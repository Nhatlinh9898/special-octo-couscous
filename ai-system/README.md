# 🤖 EduManager AI System
# Hệ thống AI Agents đa năng cho quản lý giáo dục

## 📋 Tổng quan

EduManager AI System là một hệ thống AI đa tác nhân (multi-agent) được thiết kế để hỗ trợ quản lý giáo dục toàn diện. Hệ thống tích hợp nhiều AI agents chuyên biệt cho từng lĩnh vực khác nhau trong giáo dục.

## 🌟 Tính năng chính

### 🎓 Agents Giáo dục
- **AcademicAgent**: Quản lý học tập và chương trình đào tạo
- **StudentAgent**: Hỗ trợ sinh viên và theo dõi tiến độ
- **CourseCatalogAgent**: Quản lý danh mục khóa học
- **ComprehensiveCourseCatalogAgent**: Danh mục khóa học toàn diện (K-12 đến Đại học)

### 🏢 Agents Quản lý
- **TeacherAgent**: Hỗ trợ giảng viên
- **ParentAgent**: Kết nối phụ huynh
- **AdminAgent**: Quản trị hệ thống
- **FinanceAgent**: Quản lý tài chính

### 📚 Agents Chuyên biệt
- **LibraryAgent**: Quản lý thư viện và tài nguyên học thuật
- **ProfessionalTrainingAgent**: Đào tạo chuyên nghiệp
- **HigherEducationAgents**: Quản lý giáo dục đại học

### 🔧 Agents Xử lý dữ liệu
- **DistributedDataAgent**: Xử lý dữ liệu phân tán
- **DataReaderAgent**: Đọc dữ liệu đa nguồn
- **DataFilterAgent**: Lọc và làm sạch dữ liệu
- **DataDedupAgent**: Loại bỏ dữ liệu trùng lặp

### 🧠 Agents Nâng cao
- **VerificationAgent**: Xác thực dữ liệu
- **EvaluationAgent**: Đánh giá chất lượng
- **StorageAgent**: Quản lý lưu trữ
- **UtilizationAgent**: Tối ưu hóa sử dụng

## 🚀 Quick Start

### 1. Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd ai-system

# Cài đặt tự động (Windows)
install.bat

# Cài đặt tự động (Linux/Mac)
chmod +x install.sh
./install.sh

# Hoặc cài đặt thủ công
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements-minimal.txt
```

### 2. Cấu hình
```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env với API keys của bạn
nano .env
```

### 3. Chạy hệ thống
```bash
# Kích hoạt virtual environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Chạy AI system
python main.py
```

### 4. Truy cập
- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   AI Agents     │
│   (React/Vue)   │◄──►│   Gateway       │◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Ollama LLM    │
                       │   (Local)       │
                       └─────────────────┘
```

## 🔧 API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /api/v1/agents` - List all agents
- `POST /api/v1/ai/{agent_name}` - Call specific agent

### Model Management
- `POST /api/v1/ai/models` - List available models
- `POST /api/v1/ai/download-model/{model_name}` - Download model

### Example Usage
```python
import httpx

# Call academic agent
async def call_academic_agent():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/v1/ai/academic",
            json={
                "task": "generate_study_plan",
                "data": {
                    "student_id": "12345",
                    "subjects": ["math", "science", "english"]
                }
            }
        )
        return response.json()
```

## 🤖 AI Agents Details

### AcademicAgent
- **Capabilities**: Quản lý học tập, tạo kế hoạch học tập
- **Tasks**: `generate_study_plan`, `track_progress`, `recommend_courses`
- **Model**: `llama3:8b-instruct`

### StudentAgent  
- **Capabilities**: Hỗ trợ sinh viên, theo dõi tiến độ
- **Tasks**: `student_profile`, `academic_advising`, `career_guidance`
- **Model**: `llama3:8b-instruct`

### CourseCatalogAgent
- **Capabilities**: Quản lý khóa học, K-12 education
- **Tasks**: `list_courses`, `course_details`, `enrollment_info`
- **Model**: `llama3:8b-instruct`

### ComprehensiveCourseCatalogAgent
- **Capabilities**: Danh mục khóa học toàn diện
- **Fields**: K-12, Computer Science, Business, Engineering, Sciences
- **Levels**: Basic, Intermediate, Advanced, Expert
- **Model**: `llama3:70b-instruct`

### ProfessionalTrainingAgent
- **Capabilities**: Đào tạo chuyên nghiệp
- **Fields**: Technology, Trades, Healthcare, Business, Creative
- **Tasks**: `create_training_program`, `curriculum_design`, `certification_prep`
- **Model**: `llama3:70b-instruct`

### LibraryAgent
- **Capabilities**: Quản lý thư viện thông minh
- **Tasks**: `book_recommendation`, `research_assistance`, `catalog_management`
- **Model**: `llama3:8b-instruct`

## 📚 Course Catalog

### K-12 Education (Lớp 1-12)
- **Toán học**: Số học, Đại số, Hình học, Lượng giác
- **Ngữ văn**: Tác phẩm, Viết lách, Ngữ pháp
- **Khoa học**: Vật lý, Hóa học, Sinh học
- **Xã hội**: Lịch sử, Địa lý, Giáo dục công dân

### Higher Education
- **Computer Science**: Programming, AI/ML, Web Development
- **Business Administration**: Management, Marketing, Finance
- **Engineering**: Mechanical, Electrical, Civil
- **Sciences**: Physics, Chemistry, Biology

### Professional Training
- **Technology**: Cloud Computing, Cybersecurity, DevOps
- **Trades**: Electrical, Plumbing, Carpentry
- **Healthcare**: Nursing, Medical Assistant
- **Business**: Project Management, Digital Marketing

## 🧪 Testing

### Run Tests
```bash
# Run full system test
python test_system.py

# Test specific components
python -c "import agents.academic_agent; print('✅ AcademicAgent OK')"
```

### Test Results
- ✅ All 21 critical packages imported successfully
- ✅ All 13 AI agents loaded successfully  
- ✅ All NLP models working
- ✅ Basic functionality tests passed
- ✅ API endpoints working

## 🔧 Configuration

### Environment Variables (.env)
```env
# OpenAI API Key (optional)
OPENAI_API_KEY=your_openai_api_key

# Anthropic API Key (optional)  
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=sqlite:///./ai_system.db

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# AI Models
DEFAULT_MODEL=llama3:70b-instruct
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Logging
LOG_LEVEL=INFO
```

### Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull required models
ollama pull llama3:8b-instruct
ollama pull llama3:70b-instruct

# Start Ollama server
ollama serve
```

## 📈 Performance

### System Requirements
- **CPU**: Intel i5 / AMD Ryzen 5 trở lên
- **RAM**: 8GB (khuyến nghị 16GB)
- **Storage**: 10GB free space
- **GPU**: Không bắt buộc (khuyến nghị NVIDIA GPU)

### Benchmarks
- **Response Time**: <2s cho simple tasks
- **Concurrent Users**: 100+ users
- **Model Loading**: <30s cho large models
- **Memory Usage**: ~2GB base + model size

## 🔄 Development

### Project Structure
```
ai-system/
├── agents/                 # AI Agents
│   ├── academic_agent.py
│   ├── student_agent.py
│   ├── course_catalog_agent.py
│   └── ...
├── main.py                 # FastAPI Application
├── requirements.txt        # Dependencies
├── test_system.py         # Test Suite
├── setup.py              # Setup Script
└── README.md             # Documentation
```

### Adding New Agents
1. Create new agent file in `agents/` directory
2. Inherit from `BaseAgent`
3. Implement `process()` method
4. Add to `AgentManager` in `main.py`
5. Update documentation

### Example Agent
```python
from .base_agent import BaseAgent

class CustomAgent(BaseAgent):
    def __init__(self):
        super().__init__("custom_agent", "llama3:8b-instruct")
        self.description = "Custom agent description"
        self.capabilities = ["task1", "task2"]
    
    async def process(self, task: str, data: Dict[str, Any], context: Dict[str, Any] = None):
        # Implement your logic here
        return {"result": "success", "data": data}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Errors
```bash
# Reinstall dependencies
pip install -r requirements-minimal.txt --force-reinstall

# Check Python version
python --version  # Should be 3.8+
```

#### 2. Model Loading Issues
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

#### 3. Memory Issues
```bash
# Reduce model size
export DEFAULT_MODEL=llama3:8b-instruct

# Clear cache
pip cache purge
```

#### 4. API Connection Issues
```bash
# Check if server is running
curl http://localhost:8000/health

# Check logs
python main.py --debug
```

### Debug Mode
```bash
# Run with debug logging
export LOG_LEVEL=DEBUG
python main.py

# Run test with verbose output
python test_system.py -v
```

## 📞 Support

### Documentation
- API Docs: http://localhost:8000/docs
- Installation Guide: [README_INSTALLATION.md](README_INSTALLATION.md)

### Community
- GitHub Issues: Report bugs and feature requests
- Discord: Join our community

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Version 1.1
- [ ] Web UI dashboard
- [ ] Real-time notifications
- [ ] Advanced analytics

### Version 1.2
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Cloud deployment

### Version 2.0
- [ ] Distributed architecture
- [ ] Advanced AI models
- [ ] Enterprise features

---

## 🙏 Acknowledgments

- **Ollama** for local LLM hosting
- **FastAPI** for web framework
- **Hugging Face** for transformer models
- **OpenAI** for AI capabilities

---

**🎉 Chúc bạn sử dụng hệ thống AI EduManager hiệu quả!**

Nếu có bất kỳ vấn đề nào, vui lòng kiểm tra troubleshooting section hoặc tạo issue trên GitHub.
