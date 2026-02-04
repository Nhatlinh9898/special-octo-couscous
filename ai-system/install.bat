@echo off
REM AI System Installation Script for Windows
REM Cài đặt hệ thống AI agents trên Windows

echo ========================================
echo AI System Installation for Windows
echo ========================================
echo.

REM Kiểm tra Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+ first.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python detected
python --version

REM Tạo virtual environment
if not exist ".venv" (
    echo 🔧 Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Kích hoạt virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

REM Cập nhật pip
echo 📦 Updating pip...
python -m pip install --upgrade pip

REM Cài đặt requirements
echo 📦 Installing requirements...
python -m pip install -r requirements.txt --no-cache-dir
if errorlevel 1 (
    echo ❌ Failed to install requirements
    pause
    exit /b 1
)
echo ✅ Requirements installed

REM Cài đặt công cụ bổ sung
echo 🔧 Installing additional tools...
python -m pip install wheel setuptools jupyter ipywidgets

REM Cài đặt spaCy models
echo 🧠 Installing spaCy models...
python -m spacy download en_core_web_sm
python -m spacy download en_core_web_md

REM Cài đặt NLTK data
echo 📚 Installing NLTK data...
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True); nltk.download('maxent_ne_chunker', quiet=True); nltk.download('words', quiet=True)"

REM Tạo file .env
if not exist ".env" (
    if exist ".env.example" (
        echo 📝 Creating .env file...
        copy .env.example .env >nul
        echo ✅ .env file created
        echo ⚠️  Please update .env file with your API keys
    )
)

REM Kiểm tra cài đặt
echo 🔍 Verifying installation...
python -c "
import sys
packages = ['fastapi', 'uvicorn', 'pydantic', 'transformers', 'torch', 'chromadb', 'sentence_transformers', 'langchain', 'openai', 'numpy', 'pandas', 'matplotlib', 'seaborn', 'plotly', 'nltk', 'spacy', 'scikit-learn']
failed = []
for package in packages:
    try:
        __import__(package)
        print(f'  ✅ {package}')
    except ImportError:
        print(f'  ❌ {package}')
        failed.append(package)

if failed:
    print(f'\\n❌ Failed packages: {', '.join(failed)}')
    sys.exit(1)
else:
    print('\\n✅ All packages installed successfully')
"

if errorlevel 1 (
    echo ❌ Installation verification failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 AI System Installation Complete!
echo ========================================
echo.
echo 📋 Next Steps:
echo 1. Virtual environment is activated
echo 2. Update .env file with your API keys
echo 3. Run: python main.py
echo 4. Access: http://localhost:8000
echo.
echo 🚀 To start the AI system:
echo    call .venv\Scripts\activate.bat
echo    python main.py
echo.
pause
