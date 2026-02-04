#!/bin/bash
# AI System Installation Script for Linux/Mac
# Cài đặt hệ thống AI agents trên Linux/Mac

set -e  # Exit on any error

echo "========================================"
echo "AI System Installation for Linux/Mac"
echo "========================================"
echo

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+ first."
    echo "Ubuntu/Debian: sudo apt-get install python3 python3-pip python3-venv"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

echo "✅ Python3 detected"
python3 --version

# Kiểm tra pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip3."
    echo "Ubuntu/Debian: sudo apt-get install python3-pip"
    echo "CentOS/RHEL: sudo yum install python3-pip"
    echo "macOS: python3 -m ensurepip --upgrade"
    exit 1
fi

echo "✅ pip3 detected"

# Tạo virtual environment
if [ ! -d ".venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Kích hoạt virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Cập nhật pip
echo "📦 Updating pip..."
pip install --upgrade pip

# Cài đặt requirements
echo "📦 Installing requirements..."
pip install -r requirements.txt --no-cache-dir
echo "✅ Requirements installed"

# Cài đặt công cụ bổ sung
echo "🔧 Installing additional tools..."
pip install wheel setuptools jupyter ipywidgets

# Cài đặt spaCy models
echo "🧠 Installing spaCy models..."
python -m spacy download en_core_web_sm
python -m spacy download en_core_web_md

# Cài đặt NLTK data
echo "📚 Installing NLTK data..."
python -c "
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('maxent_ne_chunker', quiet=True)
nltk.download('words', quiet=True)
"

# Tạo file .env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env file with your API keys"
fi

# Kiểm tra cài đặt
echo "🔍 Verifying installation..."
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

echo
echo "========================================"
echo "🎉 AI System Installation Complete!"
echo "========================================"
echo
echo "📋 Next Steps:"
echo "1. Activate virtual environment:"
echo "   source .venv/bin/activate"
echo "2. Update .env file with your API keys"
echo "3. Run: python main.py"
echo "4. Access: http://localhost:8000"
echo
echo "🚀 To start the AI system:"
echo "   source .venv/bin/activate"
echo "   python main.py"
echo

# Tạo alias cho dễ sử dụng
if [ -f ~/.bashrc ]; then
    echo "🔧 Creating alias in ~/.bashrc..."
    echo "alias ai-system='cd $(pwd) && source .venv/bin/activate && python main.py'" >> ~/.bashrc
    echo "✅ Alias added. Use 'ai-system' to start the system."
fi

if [ -f ~/.zshrc ]; then
    echo "🔧 Creating alias in ~/.zshrc..."
    echo "alias ai-system='cd $(pwd) && source .venv/bin/activate && python main.py'" >> ~/.zshrc
    echo "✅ Alias added. Use 'ai-system' to start the system."
fi

echo "🎯 Installation completed successfully!"
