# AI System Installation Guide
# Hướng dẫn cài đặt hệ thống AI Agents

## 📋 Yêu cầu hệ thống

### Phần cứng tối thiểu:
- **CPU:** Intel i5 / AMD Ryzen 5 trở lên
- **RAM:** 8GB (khuyến nghị 16GB)
- **Ổ cứng:** 10GB free space
- **GPU:** Không bắt buộc (khuyến nghị NVIDIA GPU cho ML)

### Phần mềm:
- **Python:** 3.8+ (khuyến nghị 3.9-3.11)
- **Operating System:** Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 🚀 Cài đặt nhanh

### Windows:
```bash
# Chạy file cài đặt tự động
install.bat
```

### Linux/Mac:
```bash
# Chạy file cài đặt tự động
chmod +x install.sh
./install.sh
```

## 📦 Cài đặt thủ công

### 1. Clone repository
```bash
git clone <repository-url>
cd ai-system
```

### 2. Tạo virtual environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Cài đặt dependencies
```bash
# Cập nhật pip
pip install --upgrade pip

# Cài đặt requirements
pip install -r requirements.txt --no-cache-dir

# Cài đặt công cụ bổ sung
pip install wheel setuptools jupyter ipywidgets
```

### 4. Cài đặt mô hình NLP
```bash
# spaCy models
python -m spacy download en_core_web_sm
python -m spacy download en_core_web_md

# NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

### 5. Cấu hình môi trường
```bash
# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa file .env với API keys của bạn
nano .env
```

## 🔧 Cấu hình file .env

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key  
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./ai_system.db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Logging Level
LOG_LEVEL=INFO

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# AI Model Configuration
DEFAULT_MODEL=llama3:70b-instruct
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Vector Database
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

## 🧪 Kiểm tra cài đặt

### Chạy script kiểm tra:
```bash
python setup.py
```

### Kiểm tra thủ công:
```bash
python -c "
import fastapi, uvicorn, pydantic
import transformers, torch, chromadb
import numpy, pandas, matplotlib
print('✅ All packages imported successfully!')
"
```

## 🚀 Chạy hệ thống

### 1. Kích hoạt virtual environment
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac  
source .venv/bin/activate
```

### 2. Chạy ứng dụng
```bash
python main.py
```

### 3. Truy cập web interface
Mở trình duyệt và truy cập: http://localhost:8000

## 📚 Các thư viện chính

### Core Framework:
- **FastAPI:** Web framework cho API
- **Uvicorn:** ASGI server
- **Pydantic:** Data validation

### Machine Learning & AI:
- **Transformers:** Hugging Face models
- **Torch:** PyTorch framework
- **ChromaDB:** Vector database
- **Sentence-Transformers:** Text embeddings
- **LangChain:** LLM framework

### Data Processing:
- **NumPy:** Numerical computing
- **Pandas:** Data manipulation
- **Scikit-learn:** Machine learning

### Visualization:
- **Matplotlib:** Plotting
- **Seaborn:** Statistical visualization
- **Plotly:** Interactive charts

### Text Processing:
- **NLTK:** Natural language processing
- **spaCy:** Advanced NLP
- **TextBlob:** Text processing

### Development Tools:
- **Jupyter:** Interactive notebooks
- **Streamlit:** Web apps
- **Dash:** Analytical web apps

## 🔍 Troubleshooting

### Common Issues:

#### 1. Python version error
```bash
# Kiểm tra phiên bản Python
python --version

# Cài đặt Python 3.8+ nếu cần
# Windows: Download từ python.org
# Ubuntu: sudo apt-get install python3.8
# macOS: brew install python@3.8
```

#### 2. Virtual environment activation failed
```bash
# Windows
# Nếu .venv\Scripts\activate không hoạt động:
.venv\Scripts\activate.bat

# Linux/Mac
# Nếu source .venv/bin/activate không hoạt động:
bash .venv/bin/activate
```

#### 3. Package installation failed
```bash
# Cập nhật pip và setuptools
pip install --upgrade pip setuptools wheel

# Cài đặt lại với --no-cache-dir
pip install -r requirements.txt --no-cache-dir --force-reinstall
```

#### 4. CUDA/GPU issues
```bash
# Kiểm tra CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# Cài đặt PyTorch với CUDA support
# Visit: https://pytorch.org/get-started/
```

#### 5. Memory issues
```bash
# Giảm số lượng worker threads
export OMP_NUM_THREADS=1

# Sử dụng CPU thay vì GPU
export CUDA_VISIBLE_DEVICES=""
```

### Performance Optimization:

#### 1. Enable GPU acceleration
```bash
# Cài đặt CUDA Toolkit (NVIDIA)
# Cài đặt PyTorch với CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### 2. Optimize memory usage
```bash
# Giảm batch size trong file config
# Sử dụng model quantization
# Enable gradient checkpointing
```

#### 3. Use faster embeddings
```bash
# Cài đặt sentence-transformers với GPU support
pip install sentence-transformers[gpu]
```

## 📞 Hỗ trợ

### Documentation:
- API Documentation: http://localhost:8000/docs
- User Guide: [LINK_TO_USER_GUIDE]
- Examples: [LINK_TO_EXAMPLES]

### Community:
- GitHub Issues: [LINK_TO_ISSUES]
- Discord: [LINK_TO_DISCORD]
- Forum: [LINK_TO_FORUM]

### Debug Mode:
```bash
# Chạy với debug mode
python main.py --debug

# Enable verbose logging
export LOG_LEVEL=DEBUG
python main.py
```

## 🔄 Cập nhật hệ thống

### Update dependencies:
```bash
# Cập nhật tất cả packages
pip install --upgrade -r requirements.txt

# Cập nhật specific package
pip install --upgrade transformers torch
```

### Update models:
```bash
# Download latest spaCy models
python -m spacy download en_core_web_lg

# Update NLTK data
python -c "import nltk; nltk.download('all')"
```

## 🧹 Dọn dẹp

### Remove virtual environment:
```bash
# Deactivate first
deactivate

# Remove folder
rm -rf .venv
```

### Clear cache:
```bash
# Clear pip cache
pip cache purge

# Clear Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete
```

## 📝 Ghi chú

- Luôn sử dụng virtual environment để tránh conflicts
- Kiểm tra file .env trước khi chạy hệ thống
- Backup dữ liệu quan trọng trước khi update
- Sử dụng GPU cho performance tốt hơn với ML tasks
- Monitor memory usage khi chạy large models

---

**Chúc bạn cài đặt thành công! 🎉**

Nếu gặp vấn đề, vui lòng kiểm tra troubleshooting section hoặc tạo issue trên GitHub.
