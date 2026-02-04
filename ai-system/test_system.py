#!/usr/bin/env python3
"""
AI System Test Script
Kiểm tra toàn bộ hệ thống AI agents và dependencies
"""

import sys
import os
from pathlib import Path

def test_imports():
    """Kiểm tra import các thư viện quan trọng"""
    print("🧪 Testing Imports...")
    print("-" * 40)
    
    critical_packages = [
        # Core Framework
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('pydantic', 'Pydantic'),
        
        # AI/ML Libraries
        ('transformers', 'Transformers'),
        ('torch', 'PyTorch'),
        ('chromadb', 'ChromaDB'),
        ('sentence_transformers', 'Sentence Transformers'),
        ('langchain', 'LangChain'),
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        
        # Data Processing
        ('numpy', 'NumPy'),
        ('pandas', 'Pandas'),
        ('scikit_learn', 'Scikit-learn'),
        
        # Visualization
        ('matplotlib', 'Matplotlib'),
        ('seaborn', 'Seaborn'),
        ('plotly', 'Plotly'),
        
        # NLP
        ('nltk', 'NLTK'),
        ('spacy', 'spaCy'),
        ('textblob', 'TextBlob'),
        
        # Utilities
        ('loguru', 'Loguru'),
        ('cryptography', 'Cryptography'),
    ]
    
    failed_imports = []
    success_imports = []
    
    for package_name, display_name in critical_packages:
        try:
            if package_name == 'scikit_learn':
                import sklearn
            elif package_name == 'sentence_transformers':
                import sentence_transformers
            elif package_name == 'langchain_openai':
                import langchain_openai
            elif package_name == 'langchain_community':
                import langchain_community
            else:
                __import__(package_name)
            
            print(f"✅ {display_name}")
            success_imports.append(package_name)
            
        except ImportError as e:
            print(f"❌ {display_name}: {e}")
            failed_imports.append(package_name)
    
    print(f"\n📊 Import Results:")
    print(f"✅ Success: {len(success_imports)}/{len(critical_packages)}")
    print(f"❌ Failed: {len(failed_imports)}/{len(critical_packages)}")
    
    return len(failed_imports) == 0

def test_ai_agents():
    """Kiểm tra các AI agents"""
    print("\n🤖 Testing AI Agents...")
    print("-" * 40)
    
    agents_dir = Path("agents")
    if not agents_dir.exists():
        print("❌ Agents directory not found")
        return False
    
    agent_files = list(agents_dir.glob("*.py"))
    if not agent_files:
        print("❌ No agent files found")
        return False
    
    print(f"📁 Found {len(agent_files)} agent files")
    
    successful_agents = []
    failed_agents = []
    
    for agent_file in agent_files:
        try:
            # Try to import the agent module
            module_name = agent_file.stem
            spec = __import__(f"agents.{module_name}", fromlist=[module_name])
            
            # Check if it has the expected classes/functions
            print(f"✅ {module_name}")
            successful_agents.append(module_name)
            
        except Exception as e:
            print(f"❌ {module_name}: {e}")
            failed_agents.append(module_name)
    
    print(f"\n📊 Agent Results:")
    print(f"✅ Success: {len(successful_agents)}/{len(agent_files)}")
    print(f"❌ Failed: {len(failed_agents)}/{len(agent_files)}")
    
    return len(failed_agents) == 0

def test_nlp_models():
    """Kiểm tra các mô hình NLP"""
    print("\n🧠 Testing NLP Models...")
    print("-" * 40)
    
    try:
        # Test spaCy
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
            doc = nlp("Hello world!")
            print("✅ spaCy model loaded successfully")
        except Exception as e:
            print(f"❌ spaCy model: {e}")
            return False
        
        # Test NLTK
        import nltk
        try:
            nltk.word_tokenize("Hello world!")
            print("✅ NLTK tokenizer working")
        except Exception as e:
            print(f"❌ NLTK: {e}")
            return False
        
        # Test sentence transformers
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            embeddings = model.encode(["Hello world!"])
            print("✅ Sentence transformers working")
        except Exception as e:
            print(f"❌ Sentence transformers: {e}")
            return False
        
        print("✅ All NLP models working")
        return True
        
    except Exception as e:
        print(f"❌ NLP models error: {e}")
        return False

def test_basic_functionality():
    """Kiểm tra chức năng cơ bản"""
    print("\n⚙️ Testing Basic Functionality...")
    print("-" * 40)
    
    try:
        # Test basic data operations
        import numpy as np
        import pandas as pd
        
        # NumPy operations
        arr = np.array([1, 2, 3, 4, 5])
        assert arr.mean() == 3.0
        print("✅ NumPy operations")
        
        # Pandas operations
        df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
        assert len(df) == 3
        print("✅ Pandas operations")
        
        # PyTorch operations
        import torch
        tensor = torch.tensor([1, 2, 3])
        assert tensor.sum() == 6
        print("✅ PyTorch operations")
        
        # FastAPI basic test
        from fastapi import FastAPI
        app = FastAPI()
        print("✅ FastAPI initialization")
        
        print("✅ All basic functionality tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality error: {e}")
        return False

def test_api_endpoints():
    """Kiểm tra API endpoints (nếu có)"""
    print("\n🌐 Testing API Endpoints...")
    print("-" * 40)
    
    try:
        # Check if main.py exists
        main_file = Path("main.py")
        if not main_file.exists():
            print("⚠️ main.py not found - skipping API test")
            return True
        
        # Try to import main module
        try:
            import main
            print("✅ Main module imported successfully")
            
            # Check if it has FastAPI app
            if hasattr(main, 'app'):
                print("✅ FastAPI app found")
            else:
                print("⚠️ FastAPI app not found in main module")
            
            return True
            
        except Exception as e:
            print(f"❌ Main module import error: {e}")
            return False
            
    except Exception as e:
        print(f"❌ API test error: {e}")
        return False

def generate_report():
    """Tạo báo cáo kiểm tra"""
    print("\n" + "=" * 50)
    print("📋 AI SYSTEM TEST REPORT")
    print("=" * 50)
    
    results = {
        "Imports": test_imports(),
        "AI Agents": test_ai_agents(),
        "NLP Models": test_nlp_models(),
        "Basic Functionality": test_basic_functionality(),
        "API Endpoints": test_api_endpoints(),
    }
    
    print("\n📊 Overall Results:")
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} : {status}")
    
    print(f"\n🎯 Overall Score: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - System is ready!")
        return True
    else:
        print("⚠️ Some tests failed - Check the issues above")
        return False

def main():
    """Hàm chính"""
    print("🚀 AI System Test Starting...")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ Not in AI system directory")
        return False
    
    # Run all tests
    success = generate_report()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Configure .env file with API keys")
        print("2. Run: python main.py")
        print("3. Access: http://localhost:8000")
        print("4. Check API docs: http://localhost:8000/docs")
    else:
        print("\n🔧 Troubleshooting:")
        print("1. Check failed imports above")
        print("2. Install missing packages")
        print("3. Update .env configuration")
        print("4. Re-run this test script")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
