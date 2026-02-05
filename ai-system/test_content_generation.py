#!/usr/bin/env python3
"""
Content Generation Integration Test Script
Kiểm tra tích hợp Content Generation Agent từ Jubilant Carnival
"""

import asyncio
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from agents.content_generation_agent import ContentGenerationAgent

async def test_content_generation():
    """Test Content Generation Agent"""
    print("🎓 Testing Content Generation Agent...")
    print("-" * 50)
    
    try:
        agent = ContentGenerationAgent()
        print(f"✅ Agent initialized: {agent.description}")
        print(f"📋 Capabilities: {', '.join(agent.capabilities)}")
        
        # Test 1: Generate Lesson
        print("\n1️⃣ Testing Lesson Generation...")
        lesson_data = {
            "topic": "Introduction to Machine Learning",
            "subject": "Computer Science",
            "level": "intermediate",
            "duration": 60,
            "objectives": [
                "Understand basic ML concepts",
                "Identify different ML algorithms",
                "Apply ML to simple problems"
            ]
        }
        
        lesson_result = await agent.process("generate_lesson", lesson_data)
        print(f"✅ Lesson generation: {lesson_result['success']}")
        if lesson_result['success']:
            content = lesson_result['content']
            print(f"   📝 Title: {content.title}")
            print(f"   🎯 Objectives: {len(content.objectives)} objectives")
            print(f"   ⏱️ Duration: {content.duration} minutes")
            print(f"   📊 Quality Score: {content.quality_score}/10")
        
        # Test 2: Generate Exercise
        print("\n2️⃣ Testing Exercise Generation...")
        exercise_data = {
            "topic": "Linear Regression",
            "type": "practice",
            "difficulty": "medium",
            "count": 5
        }
        
        exercise_result = await agent.process("generate_exercise", exercise_data)
        print(f"✅ Exercise generation: {exercise_result['success']}")
        if exercise_result['success']:
            exercises = exercise_result['exercises']
            print(f"   📝 Generated {len(exercises)} exercises")
            print(f"   📊 Metadata: {exercise_result['metadata']}")
        
        # Test 3: Generate Quiz
        print("\n3️⃣ Testing Quiz Generation...")
        quiz_data = {
            "topic": "Python Programming Basics",
            "type": "quick",
            "count": 10,
            "time_limit": 15
        }
        
        quiz_result = await agent.process("generate_quiz", quiz_data)
        print(f"✅ Quiz generation: {quiz_result['success']}")
        if quiz_result['success']:
            quiz = quiz_result['quiz']
            print(f"   📝 Quiz generated successfully")
            print(f"   📊 Metadata: {quiz_result['metadata']}")
        
        # Test 4: Generate Exam
        print("\n4️⃣ Testing Exam Generation...")
        exam_data = {
            "subject": "Data Structures",
            "topics": ["Arrays", "Linked Lists", "Trees", "Graphs"],
            "duration": 120,
            "question_types": ["multiple_choice", "short_answer", "coding"],
            "total_points": 100
        }
        
        exam_result = await agent.process("generate_exam", exam_data)
        print(f"✅ Exam generation: {exam_result['success']}")
        if exam_result['success']:
            exam = exam_result['exam']
            print(f"   📝 Exam generated successfully")
            print(f"   📊 Metadata: {exam_result['metadata']}")
        
        # Test 5: Content Personalization
        print("\n5️⃣ Testing Content Personalization...")
        personalization_data = {
            "content_id": "lesson_sample_001",
            "student_profile": {
                "level": "intermediate",
                "interests": ["AI", "Robotics", "Gaming"],
                "learning_style": "visual"
            },
            "learning_style": "visual",
            "adaptation_level": "medium"
        }
        
        personalization_result = await agent.process("personalize_content", personalization_data)
        print(f"✅ Content personalization: {personalization_result['success']}")
        if personalization_result['success']:
            print(f"   🎯 Personalization factors: {personalization_result['personalization_factors']}")
        
        # Test 6: Quality Assessment
        print("\n6️⃣ Testing Quality Assessment...")
        quality_data = {
            "content": "This is a sample lesson content about machine learning. It covers basic concepts including supervised and unsupervised learning, neural networks, and deep learning fundamentals.",
            "content_type": "lesson",
            "criteria": ["clarity", "accuracy", "engagement", "appropriateness"]
        }
        
        quality_result = await agent.process("assess_quality", quality_data)
        print(f"✅ Quality assessment: {quality_result['success']}")
        if quality_result['success']:
            assessment = quality_result['assessment']
            print(f"   📊 Overall Score: {assessment['overall_assessment']['score']}/10")
            print(f"   💡 Recommendations: {len(assessment.get('recommendations', []))} suggestions")
        
        # Test 7: Template Management
        print("\n7️⃣ Testing Template Management...")
        
        # Get templates
        templates = await agent.process("get_template", {"template_id": "lesson_basic"})
        print(f"✅ Get template: {templates['success']}")
        
        # Create new template
        template_data = {
            "id": "custom_math_template",
            "name": "Custom Math Template",
            "type": "lesson",
            "subject": "mathematics",
            "level": "advanced",
            "structure": {
                "sections": ["theory", "examples", "practice", "applications"],
                "duration_distribution": {"theory": 20, "examples": 15, "practice": 20, "applications": 5}
            },
            "metadata": {"version": "1.0", "author": "Test User"}
        }
        
        create_result = await agent.process("create_template", template_data)
        print(f"✅ Create template: {create_result['success']}")
        if create_result['success']:
            print(f"   📝 Template ID: {create_result['template_id']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

async def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    print("-" * 50)
    
    try:
        import httpx
        
        base_url = "http://localhost:8000"
        
        # Test health check
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/health")
            print(f"✅ Health check: {response.status_code}")
        
        # Test lesson generation endpoint
        lesson_request = {
            "task": "generate_lesson",
            "data": {
                "topic": "Introduction to AI",
                "subject": "Computer Science",
                "level": "beginner",
                "duration": 45
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/api/v1/content/generate/lesson",
                json=lesson_request
            )
            print(f"✅ Lesson API: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   📊 Processing time: {result['processing_time']:.2f}s")
                print(f"   🎯 Confidence: {result['confidence']}")
        
        # Test templates endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/api/v1/content/templates")
            print(f"✅ Templates API: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   📝 Available templates: {result['count']}")
        
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

async def create_sample_usage():
    """Create sample usage documentation"""
    print("\n📚 Creating Sample Usage Documentation...")
    print("-" * 50)
    
    usage_examples = {
        "lesson_generation": {
            "endpoint": "POST /api/v1/content/generate/lesson",
            "example": {
                "task": "generate_lesson",
                "data": {
                    "topic": "Introduction to Neural Networks",
                    "subject": "Computer Science",
                    "level": "intermediate",
                    "duration": 90,
                    "objectives": [
                        "Understand neural network basics",
                        "Identify different network types",
                        "Implement simple neural network"
                    ]
                }
            }
        },
        "exercise_generation": {
            "endpoint": "POST /api/v1/content/generate/exercise",
            "example": {
                "task": "generate_exercise",
                "data": {
                    "topic": "Calculus Derivatives",
                    "type": "homework",
                    "difficulty": "medium",
                    "count": 10
                }
            }
        },
        "quiz_generation": {
            "endpoint": "POST /api/v1/content/generate/quiz",
            "example": {
                "task": "generate_quiz",
                "data": {
                    "topic": "World History",
                    "type": "formative",
                    "count": 20,
                    "time_limit": 30
                }
            }
        },
        "exam_generation": {
            "endpoint": "POST /api/v1/content/generate/exam",
            "example": {
                "task": "generate_exam",
                "data": {
                    "subject": "Physics",
                    "topics": ["Mechanics", "Thermodynamics", "Waves"],
                    "duration": 180,
                    "question_types": ["multiple_choice", "calculation", "essay"],
                    "total_points": 150
                }
            }
        },
        "content_personalization": {
            "endpoint": "POST /api/v1/content/personalize",
            "example": {
                "task": "personalize_content",
                "data": {
                    "content_id": "lesson_123",
                    "student_profile": {
                        "level": "advanced",
                        "interests": ["Space", "Technology", "Innovation"],
                        "learning_style": "kinesthetic"
                    },
                    "learning_style": "kinesthetic",
                    "adaptation_level": "high"
                }
            }
        },
        "quality_assessment": {
            "endpoint": "POST /api/v1/content/assess-quality",
            "example": {
                "task": "assess_quality",
                "data": {
                    "content": "Your educational content here...",
                    "content_type": "lesson",
                    "criteria": ["clarity", "accuracy", "engagement", "appropriateness"]
                }
            }
        }
    }
    
    # Save to file
    with open("content_generation_usage_examples.json", "w") as f:
        json.dump(usage_examples, f, indent=2)
    
    print("✅ Usage examples saved to content_generation_usage_examples.json")
    
    return True

async def main():
    """Main test function"""
    print("🎓 Content Generation Integration Test Starting...")
    print("=" * 60)
    
    # Run tests
    tests = [
        ("Content Generation Agent", test_content_generation),
        ("API Endpoints", test_api_endpoints),
        ("Sample Usage", create_sample_usage)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ {test_name} test crashed: {str(e)}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} : {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall Score: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed - Content Generation integration is working!")
        return True
    else:
        print("⚠️ Some tests failed - Check the issues above")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
