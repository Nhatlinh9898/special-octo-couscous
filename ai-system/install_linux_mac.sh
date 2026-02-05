#!/bin/bash
# EduManager AI System Installation Script for Linux/macOS
# Usage: ./install_linux_mac.sh

set -e  # Exit on any error

echo "🚀 Installing EduManager AI System..."
echo "=================================="

# Check Python version
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -Po '(?<=Python )\d+\.\d+' || echo "0.0")
required_version="3.9"

if [[ $(echo "$python_version >= $required_version" | bc -l 2>/dev/null || echo "0") -eq 0 ]]; then
    echo "❌ Python $required_version+ required. Current: $python_version"
    echo "Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi

echo "✅ Python $python_version detected"

# Check if virtual environment exists
if [ -d ".venv" ]; then
    echo "📦 Virtual environment already exists. Removing old one..."
    rm -rf .venv
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv .venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
python -m pip install --upgrade pip

# Install system dependencies (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Installing system dependencies..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3-dev build-essential libssl-dev libffi-dev
        sudo apt-get install -y libjpeg-dev zlib1g-dev libpng-dev
    elif command -v yum &> /dev/null; then
        sudo yum groupinstall -y "Development Tools"
        sudo yum install -y python3-devel openssl-devel libffi-devel
    fi
fi

# Install requirements
echo "📚 Installing Python requirements..."
if [ -f "requirements-complete.txt" ]; then
    pip install -r requirements-complete.txt
else
    echo "❌ requirements-complete.txt not found!"
    exit 1
fi

# Download spaCy model
echo "🧠 Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Download NLTK data
echo "📖 Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# EduManager AI System Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development
LOG_LEVEL=INFO
EOF
    echo "✅ .env file created. Please update with your API keys."
fi

# Create startup script
echo "🚀 Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash
# EduManager AI System Startup Script

echo "🚀 Starting EduManager AI System..."

# Activate virtual environment
source .venv/bin/activate

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama is not running. Please start it with: ollama serve"
fi

# Start the server
echo "🌐 Starting server on http://localhost:8000"
python main.py
EOF

chmod +x start.sh

# Create test script
echo "🧪 Creating test script..."
cat > test.sh << 'EOF'
#!/bin/bash
# EduManager AI System Test Script

echo "🧪 Testing EduManager AI System..."

# Activate virtual environment
source .venv/bin/activate

# Test core dependencies
echo "🔍 Testing core dependencies..."
python -c "
import fastapi, uvicorn, pandas, numpy, torch, transformers
print('✅ Core dependencies OK')
" || echo "❌ Core dependencies failed"

# Test AI libraries
echo "🤖 Testing AI libraries..."
python -c "
import langchain, langgraph, chromadb, spacy, nltk
print('✅ AI libraries OK')
" || echo "❌ AI libraries failed"

# Test visualization
echo "📊 Testing visualization..."
python -c "
import matplotlib, seaborn, plotly
print('✅ Visualization libraries OK')
" || echo "❌ Visualization libraries failed"

# Test system
echo "🖥️  Testing system..."
python main.py --test 2>/dev/null && echo "✅ System test passed" || echo "❌ System test failed"

echo "🎯 Test complete!"
EOF

chmod +x test.sh

echo ""
echo "✅ Installation complete!"
echo "=================================="
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
echo "3. Pull models: ollama pull llama3:8b-instruct"
echo "4. Start system: ./start.sh"
echo "5. Test system: ./test.sh"
echo "6. Open browser: http://localhost:8000"
echo "7. View docs: http://localhost:8000/docs"
echo ""
echo "🎉 EduManager AI System is ready to use!"
