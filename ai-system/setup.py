#!/usr/bin/env python3
"""
AI System Setup Script
Cài đặt các thư viện cần thiết cho hệ thống AI agents
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Kiểm tra phiên bản Python"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def create_virtual_environment():
    """Tạo virtual environment"""
    venv_path = Path(".venv")
    if not venv_path.exists():
        print("🔧 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", ".venv"], check=True)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")

def activate_virtual_environment():
    """Kích hoạt virtual environment"""
    if os.name == 'nt':  # Windows
        activate_cmd = ".venv\\Scripts\\activate"
    else:  # Unix/Linux/Mac
        activate_cmd = "source .venv/bin/activate"
    
    print(f"🔧 To activate virtual environment, run:")
    print(f"   {activate_cmd}")

def install_requirements():
    """Cài đặt các thư viện từ requirements.txt"""
    print("📦 Installing requirements...")
    
    # Kiểm tra file requirements.txt
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    try:
        # Cài đặt với pip
        subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "-r", "requirements.txt",
            "--upgrade",
            "--no-cache-dir"
        ], check=True)
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def install_additional_tools():
    """Cài đặt các công cụ bổ sung"""
    print("🔧 Installing additional tools...")
    
    additional_packages = [
        "wheel",  # For building packages
        "setuptools",  # For package development
        "pip",  # Ensure latest pip
        "jupyter",  # For notebook support
        "ipywidgets",  # For interactive widgets
    ]
    
    try:
        for package in additional_packages:
            print(f"  Installing {package}...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                package, "--upgrade"
            ], check=True)
        print("✅ Additional tools installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install additional tools: {e}")
        return False

def setup_spacy_models():
    """Cài đặt các mô hình spaCy cần thiết"""
    print("🧠 Installing spaCy models...")
    
    models = ["en_core_web_sm", "en_core_web_md"]
    
    try:
        for model in models:
            print(f"  Installing {model}...")
            subprocess.run([
                sys.executable, "-m", "spacy", "download", model
            ], check=True)
        print("✅ spaCy models installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install spaCy models: {e}")
        return False

def setup_nltk_data():
    """Cài đặt dữ liệu NLTK cần thiết"""
    print("📚 Installing NLTK data...")
    
    nltk_data = [
        "punkt",  # Tokenization
        "stopwords",  # Stop words
        "wordnet",  # WordNet
        "averaged_perceptron_tagger",  # POS tagging
        "maxent_ne_chunker",  # Named entity recognition
        "words"  # Word lists
    ]
    
    try:
        import nltk
        for data in nltk_data:
            print(f"  Downloading {data}...")
            nltk.download(data, quiet=True)
        print("✅ NLTK data installed")
        return True
    except Exception as e:
        print(f"❌ Failed to install NLTK data: {e}")
        return False

def verify_installation():
    """Kiểm tra cài đặt"""
    print("🔍 Verifying installation...")
    
    critical_packages = [
        "fastapi",
        "uvicorn", 
        "pydantic",
        "transformers",
        "torch",
        "chromadb",
        "sentence_transformers",
        "langchain",
        "openai",
        "numpy",
        "pandas",
        "matplotlib",
        "seaborn",
        "plotly",
        "nltk",
        "spacy",
        "scikit-learn"
    ]
    
    failed_packages = []
    
    for package in critical_packages:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package}")
            failed_packages.append(package)
    
    if failed_packages:
        print(f"\n❌ Failed packages: {', '.join(failed_packages)}")
        return False
    else:
        print("\n✅ All critical packages installed successfully")
        return True

def create_environment_file():
    """Tạo file .env mẫu"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from example...")
        with open(env_example, 'r') as f:
            content = f.read()
        with open(env_file, 'w') as f:
            f.write(content)
        print("✅ .env file created")
        print("⚠️  Please update .env file with your API keys and configurations")

def run_tests():
    """Chạy các test cơ bản"""
    print("🧪 Running basic tests...")
    
    try:
        # Test import các module chính
        import fastapi
        import uvicorn
        import pydantic
        import transformers
        import torch
        import chromadb
        import numpy as np
        import pandas as pd
        import matplotlib.pyplot as plt
        import seaborn as sns
        
        print("  ✅ Core imports successful")
        
        # Test basic functionality
        print("  🧮 Testing basic operations...")
        
        # Test numpy
        arr = np.array([1, 2, 3, 4, 5])
        assert arr.mean() == 3.0
        
        # Test pandas
        df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
        assert len(df) == 3
        
        # Test torch
        tensor = torch.tensor([1, 2, 3])
        assert tensor.sum() == 6
        
        print("  ✅ Basic functionality tests passed")
        return True
        
    except Exception as e:
        print(f"  ❌ Test failed: {e}")
        return False

def main():
    """Hàm chính"""
    print("🚀 AI System Setup Starting...")
    print("=" * 50)
    
    # Kiểm tra Python version
    check_python_version()
    
    # Tạo virtual environment
    create_virtual_environment()
    
    # Kích hoạt virtual environment (chỉ hiển thị hướng dẫn)
    activate_virtual_environment()
    
    # Cài đặt requirements
    if not install_requirements():
        print("❌ Setup failed at requirements installation")
        return False
    
    # Cài đặt công cụ bổ sung
    if not install_additional_tools():
        print("⚠️  Some additional tools failed to install")
    
    # Cài đặt spaCy models
    if not setup_spacy_models():
        print("⚠️  spaCy models installation failed")
    
    # Cài đặt NLTK data
    if not setup_nltk_data():
        print("⚠️  NLTK data installation failed")
    
    # Tạo file .env
    create_environment_file()
    
    # Kiểm tra cài đặt
    if not verify_installation():
        print("❌ Setup verification failed")
        return False
    
    # Chạy tests
    if not run_tests():
        print("⚠️  Some tests failed")
    
    print("\n" + "=" * 50)
    print("🎉 AI System Setup Complete!")
    print("\n📋 Next Steps:")
    print("1. Activate virtual environment:")
    if os.name == 'nt':
        print("   .venv\\Scripts\\activate")
    else:
        print("   source .venv/bin/activate")
    print("2. Update .env file with your configurations")
    print("3. Run the AI system: python main.py")
    print("4. Access the web interface at http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
