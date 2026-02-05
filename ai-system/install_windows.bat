@echo off
REM EduManager AI System Installation Script for Windows
REM Usage: install_windows.bat

echo 🚀 Installing EduManager AI System...
echo ==================================

REM Check Python
echo 🐍 Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo ✅ Python %python_version% detected

REM Remove existing virtual environment
if exist ".venv" (
    echo 📦 Removing existing virtual environment...
    rmdir /s /q .venv
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing Python requirements...
if exist "requirements-complete.txt" (
    pip install -r requirements-complete.txt
    if errorlevel 1 (
        echo ❌ Failed to install requirements
        pause
        exit /b 1
    )
) else (
    echo ❌ requirements-complete.txt not found!
    pause
    exit /b 1
)

REM Download spaCy model
echo 🧠 Downloading spaCy model...
python -m spacy download en_core_web_sm

REM Download NLTK data
echo 📖 Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # EduManager AI System Configuration
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo ANTHROPIC_API_KEY=your_anthropic_api_key_here
        echo REDIS_URL=redis://localhost:6379
        echo ENVIRONMENT=development
        echo LOG_LEVEL=INFO
    ) > .env
    echo ✅ .env file created. Please update with your API keys.
)

REM Create startup script
echo 🚀 Creating startup script...
(
    echo @echo off
    echo REM EduManager AI System Startup Script
    echo.
    echo echo 🚀 Starting EduManager AI System...
    echo.
    echo REM Activate virtual environment
    echo call .venv\Scripts\activate.bat
    echo.
    echo REM Check if Ollama is running
    echo tasklist /FI "IMAGENAME eq ollama.exe" 2^>NUL ^| find /I "ollama.exe" ^>NUL
    echo if errorlevel 1 (
    echo     echo ⚠️  Ollama is not running. Please start it.
    echo )
    echo.
    echo REM Start the server
    echo echo 🌐 Starting server on http://localhost:8000
    echo python main.py
) > start.bat

REM Create test script
echo 🧪 Creating test script...
(
    echo @echo off
    echo REM EduManager AI System Test Script
    echo.
    echo echo 🧪 Testing EduManager AI System...
    echo.
    echo REM Activate virtual environment
    echo call .venv\Scripts\activate.bat
    echo.
    echo REM Test core dependencies
    echo echo 🔍 Testing core dependencies...
    echo python -c "import fastapi, uvicorn, pandas, numpy, torch, transformers; print('✅ Core dependencies OK')" 2^>NUL ^|^| echo ❌ Core dependencies failed
    echo.
    echo REM Test AI libraries
    echo echo 🤖 Testing AI libraries...
    echo python -c "import langchain, langgraph, chromadb, spacy, nltk; print('✅ AI libraries OK')" 2^>NUL ^|^| echo ❌ AI libraries failed
    echo.
    echo REM Test visualization
    echo echo 📊 Testing visualization...
    echo python -c "import matplotlib, seaborn, plotly; print('✅ Visualization libraries OK')" 2^>NUL ^|^| echo ❌ Visualization libraries failed
    echo.
    echo REM Test system
    echo echo 🖥️  Testing system...
    echo python main.py --test 2^>NUL ^&^& echo ✅ System test passed ^|^| echo ❌ System test failed
    echo.
    echo echo 🎯 Test complete!
) > test.bat

echo.
echo ✅ Installation complete!
echo ==================================
echo.
echo 📋 Next steps:
echo 1. Update .env file with your API keys
echo 2. Install Ollama: https://ollama.ai/download
echo 3. Pull models: ollama pull llama3:8b-instruct
echo 4. Start system: start.bat
echo 5. Test system: test.bat
echo 6. Open browser: http://localhost:8000
echo 7. View docs: http://localhost:8000/docs
echo.
echo 🎉 EduManager AI System is ready to use!
pause
