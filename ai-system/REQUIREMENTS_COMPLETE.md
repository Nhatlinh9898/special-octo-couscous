# 📚 Complete Requirements Guide
# Hướng dẫn cài đặt đầy đủ tất cả thư viện cho EduManager AI System

## 🎯 Overview
File này chứa danh sách đầy đủ tất cả các thư viện cần thiết để chạy EduManager AI System với ServiceNexus Integration trên bất kỳ máy nào.

---

## 🐍 Python Version
- **Required**: Python 3.9+ (khuyến nghị Python 3.11)
- **Check**: `python --version`

---

## 📦 Installation Commands

### 1. **Quick Install (Recommended)**
```bash
# Clone repository
git clone https://github.com/Nhatlinh9898/special-octo-couscous.git
cd special-octo-couscous/ai-system

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install all requirements
pip install -r requirements-complete.txt

# Run system
python main.py
```

### 2. **Manual Install (Step by Step)**
```bash
# 1. Core Web Framework
pip install fastapi uvicorn python-multipart

# 2. Environment & Configuration
pip install python-dotenv pydantic-settings

# 3. HTTP & Async
pip install httpx aiofiles aiohttp aiohappyeyeballs

# 4. Data Processing & Analysis
pip install pandas numpy scipy scikit-learn

# 5. Machine Learning & AI
pip install torch transformers sentence-transformers
pip install openai anthropic
pip install langchain langchain-core langchain-community langchain-openai
pip install langchain-text-splitters langchain-classic
pip install langgraph langgraph-checkpoint langgraph-prebuilt langgraph-sdk

# 6. Vector Database & Search
pip install chromadb redis

# 7. Natural Language Processing
pip install spacy nltk textblob
pip install tiktoken tokenizers

# 8. Data Visualization
pip install matplotlib seaborn plotly

# 9. Web Scraping & Text Processing
pip install beautifulsoup4 requests requests-toolbelt
pip install markdown-it-py

# 10. Database & Storage
pip install sqlalchemy

# 11. Utilities & Tools
pip install pyyaml rich tqdm click
pip install loguru python-json-logger
pip install pywin32  # Windows only
pip install psutil  # System monitoring

# 12. Development & Testing
pip install jupyter jupyterlab notebook
pip install pytest pytest-asyncio

# 13. Cloud & Deployment
pip install kubernetes  # For cloud deployment
pip install prometheus-client  # Monitoring

# 14. Security & Authentication
pip install bcrypt cryptography
pip install argon2-cffi argon2-cffi-bindings
pip install oauthlib requests-oauthlib

# 15. Date & Time
pip install python-dateutil arrow

# 16. File Processing
pip install pillow  # Image processing
pip install openpyxl  # Excel files
pip install python-docx  # Word documents
pip install PyPDF2  # PDF processing

# 17. API & Integration
pip install grpcio  # gRPC support
pip install protobuf  # Protocol buffers
pip install posthog  # Analytics

# 18. Performance & Optimization
pip install orjson ormsgpack  # Fast JSON
pip install uvloop  # Async event loop (Unix only)
```

---

## 📋 Complete Requirements File

### requirements-complete.txt
```txt
# Core Web Framework
fastapi==0.128.1
uvicorn==0.40.0
python-multipart==0.0.22

# Environment & Configuration
python-dotenv==1.2.1
pydantic==2.12.5
pydantic-settings==2.12.0

# HTTP & Async
httpx==0.28.1
aiofiles==25.1.0
aiohttp==3.13.3
aiohappyeyeballs==2.6.1

# Data Processing & Analysis
pandas==3.0.0
numpy==2.3.5
scipy==1.17.0
scikit-learn==1.8.0

# Machine Learning & AI
torch==2.10.0
transformers==5.0.0
sentence-transformers==5.2.2
openai==2.16.0
anthropic==0.77.1

# LangChain Ecosystem
langchain==1.2.8
langchain-core==1.2.8
langchain-community==0.4.1
langchain-openai==1.1.7
langchain-text-splitters==1.1.0
langchain-classic==1.0.1
langgraph==1.0.7
langgraph-checkpoint==4.0.0
langgraph-prebuilt==1.0.7
langgraph-sdk==0.3.3

# Vector Database & Search
chromadb==1.4.1
redis==7.1.0

# Natural Language Processing
spacy==3.8.11
nltk==3.9.2
textblob==0.19.0
tiktoken==0.12.0
tokenizers==0.22.2

# Data Visualization
matplotlib==3.10.8
seaborn==0.13.2
plotly==6.5.2

# Web Scraping & Text Processing
beautifulsoup4==4.14.3
requests==2.32.5
requests-toolbelt==1.0.0
markdown-it-py==4.0.0

# Database & Storage
sqlalchemy==2.0.46

# Utilities & Tools
pyyaml==6.0.3
rich==14.3.2
tqdm==4.67.3
click==8.3.1
loguru==0.7.3
python-json-logger==4.0.0

# System & Platform Specific
psutil==7.2.2
pywin32==308; sys_platform == "win32"

# Development & Testing
jupyter==1.1.1
jupyterlab==4.5.3
notebook==7.5.3
pytest==8.0.0
pytest-asyncio==0.23.0

# Cloud & Deployment
kubernetes==35.0.0
prometheus-client==0.24.1

# Security & Authentication
bcrypt==5.0.0
cryptography==46.0.4
argon2-cffi==25.1.0
argon2-cffi-bindings==25.1.0
oauthlib==3.3.1
requests-oauthlib==2.0.0

# Date & Time
python-dateutil==2.9.0.post0
arrow==1.4.0

# File Processing
pillow==12.1.0
openpyxl==3.1.5
python-docx==1.1.2
PyPDF2==3.0.1

# API & Integration
grpcio==1.76.0
protobuf==6.33.5
posthog==5.4.0

# Performance & Optimization
orjson==3.11.7
ormsgpack==1.12.2
uvloop==0.21.0; sys_platform != "win32"

# Additional Dependencies
typing-extensions==4.15.0
annotated-types==0.7.0
anyio==4.12.1
certifi==2026.1.4
charset-normalizer==3.4.4
click==8.3.1
colorama==0.4.6
distro==1.9.0
filelock==3.20.3
fsspec==2026.1.0
h11==0.16.0
httpcore==1.0.9
idna==3.11
jinja2==3.1.6
markupsafe==3.0.3
packaging==26.0
pydantic-core==2.41.5
sniffio==1.3.0
starlette==0.50.0
typing-inspect==0.9.0
urllib3==2.6.3
watchfiles==1.1.1
websockets==16.0
yarl==1.22.0
```

---

## 🖥️ Platform-Specific Instructions

### Windows
```bash
# Install Visual C++ Build Tools (required for some packages)
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Install system dependencies
pip install pywin32

# Run installation
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-complete.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### Linux (Ubuntu/Debian)
```bash
# Install system dependencies
sudo apt update
sudo apt install python3-dev python3-pip python3-venv
sudo apt install build-essential libssl-dev libffi-dev
sudo apt install libjpeg-dev zlib1g-dev libpng-dev

# Install Python packages
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-complete.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-complete.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

---

## 🔧 External Dependencies

### 1. **Ollama (for Local LLM)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama3:8b-instruct
ollama pull llama3:70b-instruct

# Start server
ollama serve
```

### 2. **Redis (Optional)**
```bash
# Windows
# Download from: https://redis.io/download

# Linux
sudo apt install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

### 3. **Node.js (Optional for frontend)**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or download from: https://nodejs.org/
```

---

## 🚀 Quick Start Script

### install.sh (Linux/macOS)
```bash
#!/bin/bash
echo "🚀 Installing EduManager AI System..."

# Check Python version
python_version=$(python3 --version 2>&1 | grep -Po '(?<=Python )\d+\.\d+')
if [[ $(echo "$python_version >= 3.9" | bc -l) -eq 0 ]]; then
    echo "❌ Python 3.9+ required. Current: $python_version"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing requirements..."
pip install -r requirements-complete.txt

# Download spaCy model
echo "🧠 Downloading spaCy model..."
python -m spacy download en_core_web_sm

echo "✅ Installation complete!"
echo "🎯 Run with: python main.py"
```

### install.bat (Windows)
```batch
@echo off
echo 🚀 Installing EduManager AI System...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv .venv
call .venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing requirements...
pip install -r requirements-complete.txt

REM Download spaCy model
echo 🧠 Downloading spaCy model...
python -m spacy download en_core_web_sm

echo ✅ Installation complete!
echo 🎯 Run with: python main.py
pause
```

---

## 🧪 Verification

### Test Installation
```bash
# Test core dependencies
python -c "import fastapi, uvicorn, pandas, numpy, torch, transformers, openai, anthropic"
echo "✅ Core dependencies OK"

# Test AI libraries
python -c "import langchain, langgraph, chromadb, spacy, nltk"
echo "✅ AI libraries OK"

# Test visualization
python -c "import matplotlib, seaborn, plotly"
echo "✅ Visualization libraries OK"

# Test system
python main.py --test
```

### Check System Health
```bash
# Check if server runs
curl http://localhost:8000/health

# Check API documentation
curl http://localhost:8000/docs

# Check ServiceNexus integration
curl http://localhost:8000/api/v1/integration/status
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **ModuleNotFoundError**
```bash
# Solution: Install missing package
pip install <module_name>

# Or reinstall all requirements
pip install -r requirements-complete.txt --force-reinstall
```

#### 2. **Visual C++ Build Tools Error (Windows)**
```bash
# Solution: Install Visual C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

#### 3. **Memory Error**
```bash
# Solution: Install packages one by one
pip install fastapi
pip install uvicorn
pip install pandas
# ... continue with other packages
```

#### 4. **Permission Error**
```bash
# Solution: Use user install
pip install --user -r requirements-complete.txt
```

#### 5. **Network Error**
```bash
# Solution: Use different index
pip install -r requirements-complete.txt -i https://pypi.org/simple/
```

---

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 4GB (8GB recommended)
- **Storage**: 10GB free space
- **CPU**: 2 cores (4 cores recommended)
- **Python**: 3.9+ (3.11 recommended)

### Recommended Requirements
- **RAM**: 16GB+
- **Storage**: 50GB+ SSD
- **CPU**: 8+ cores
- **GPU**: NVIDIA GPU with CUDA (for ML models)
- **Python**: 3.11

---

## 🌐 Cloud Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements-complete.txt .
RUN pip install -r requirements-complete.txt

COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 📞 Support

### Getting Help
1. **Check logs**: `python main.py --verbose`
2. **Run tests**: `python test_system.py`
3. **Check dependencies**: `pip list`
4. **System info**: `python -c "import sys; print(sys.version)"`

### Community
- **GitHub Issues**: https://github.com/Nhatlinh9898/special-octo-couscous/issues
- **Documentation**: Check README files in each module

---

## 🎯 Summary

Với file requirements-complete.txt này, bạn có thể cài đặt đầy đủ EduManager AI System trên bất kỳ máy nào với:

✅ **Tất cả dependencies** cho web framework, AI/ML, database  
✅ **Cross-platform support** (Windows, Linux, macOS)  
✅ **Installation scripts** cho từng platform  
✅ **Troubleshooting guide** cho common issues  
✅ **Docker support** cho cloud deployment  

Chỉ cần chạy:
```bash
pip install -r requirements-complete.txt
python main.py
```

Và hệ thống sẽ sẵn sàng sử dụng! 🚀
