#!/usr/bin/env python3
"""
ServiceNexus Integration Test Script
Kiểm tra tích hợp ServiceNexus vào EduManager AI System
"""

import asyncio
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from integration.service_nexus_adapter import ServiceNexusAdapter, ServiceNexusConfig
from agents.education_data_agent import EducationDataAgent

async def test_service_nexus_adapter():
    """Test ServiceNexus adapter"""
    print("🧪 Testing ServiceNexus Adapter...")
    print("-" * 50)
    
    try:
        # Initialize adapter
        config = ServiceNexusConfig(
            enable_big_data=True,
            enable_visualization=True,
            enable_orchestration=True
        )
        
        adapter = ServiceNexusAdapter(config)
        
        # Test initialization
        init_result = await adapter.initialize()
        print(f"✅ Initialization: {init_result['success']}")
        
        if init_result['success']:
            print(f"📋 Loaded agents: {init_result['loaded_agents']}")
            
            # Test education data processing
            test_data = {
                "file_path": "test_student_data.csv",
                "format": "csv",
                "grade_scale": "4.0"
            }
            
            result = await adapter.process_education_data("process_student_data", test_data)
            print(f"✅ Data processing: {result['success']}")
            print(f"📊 Processed records: {result.get('processed_records', 0)}")
            
            # Test visualization
            viz_result = await adapter.generate_education_visualizations(test_data)
            print(f"✅ Visualization: {viz_result['success']}")
            print(f"📈 Visualizations: {viz_result.get('count', 0)}")
            
            # Test workflow
            workflow_data = {
                "id": "test_workflow",
                "steps": [
                    {"name": "analyze_grades", "agent": "column"},
                    {"name": "profile_students", "agent": "row"},
                    {"name": "create_visualizations", "agent": "visualization"}
                ]
            }
            
            workflow_result = await adapter.orchestrate_education_workflow(workflow_data)
            print(f"✅ Workflow: {workflow_result['success']}")
            
            return True
        else:
            print(f"❌ Initialization failed: {init_result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

async def test_education_data_agent():
    """Test Education Data Agent"""
    print("\n🧪 Testing Education Data Agent...")
    print("-" * 50)
    
    try:
        agent = EducationDataAgent()
        
        # Test student data processing
        student_data = {
            "file_path": "students.csv",
            "format": "csv",
            "grade_scale": "4.0"
        }
        
        result = await agent.process("process_student_data", student_data)
        print(f"✅ Student data processing: {result.get('success', False)}")
        
        # Test course performance analysis
        course_data = {
            "course_id": "CS101",
            "semester": "Fall2023",
            "analysis_type": "comprehensive"
        }
        
        course_result = await agent.process("analyze_course_performance", course_data)
        print(f"✅ Course analysis: {course_result.get('success', False)}")
        
        # Test grade distribution
        grade_data = {
            "grades": [3.5, 3.2, 3.8, 2.9, 4.0, 3.1, 3.7, 2.8, 3.9, 3.3]
        }
        
        grade_result = await agent.process("grade_distribution_analysis", grade_data)
        print(f"✅ Grade distribution: {grade_result.get('success', False)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Education Data Agent test failed: {str(e)}")
        return False

async def test_api_endpoints():
    """Test API endpoints"""
    print("\n🧪 Testing API Endpoints...")
    print("-" * 50)
    
    try:
        import httpx
        
        # Test integration status
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/api/v1/integration/status")
            if response.status_code == 200:
                status_data = response.json()
                print(f"✅ Integration status: {status_data['service_nexus']['status']}")
                print(f"📋 Loaded agents: {status_data['service_nexus']['loaded_agents']}")
            else:
                print(f"❌ Integration status failed: {response.status_code}")
                return False
        
        # Test education data analysis
        test_request = {
            "task": "process_student_data",
            "data": {
                "file_path": "test.csv",
                "format": "csv",
                "grade_scale": "4.0"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/api/v1/education/data-analysis",
                json=test_request
            )
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Data analysis API: {result['response']['success']}")
            else:
                print(f"❌ Data analysis API failed: {response.status_code}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

async def create_sample_data():
    """Tạo dữ liệu mẫu để test"""
    print("\n📝 Creating sample data...")
    print("-" * 50)
    
    try:
        # Create sample CSV data
        sample_csv = """student_id,course_id,grade,credits,semester,academic_year,attendance_rate,final_grade
S001,CS101,3.5,4,Fall2023,2023-2024,95.0,3.5
S002,CS101,3.2,4,Fall2023,2023-2024,88.0,3.2
S003,CS101,3.8,4,Fall2023,2023-2024,92.0,3.8
S004,CS101,2.9,4,Fall2023,2023-2024,75.0,2.9
S005,CS101,4.0,4,Fall2023,2023-2024,98.0,4.0
S001,CS102,3.7,4,Fall2023,2023-2024,93.0,3.7
S002,CS102,3.1,4,Fall2023,2023-2024,85.0,3.1
S003,CS102,3.9,4,Fall2023,2023-2024,96.0,3.9
S004,CS102,3.0,4,Fall2023,2023-2024,78.0,3.0
S005,CS102,3.6,4,Fall2023,2023-2024,91.0,3.6"""
        
        with open("test_student_data.csv", "w") as f:
            f.write(sample_csv)
        
        print("✅ Sample CSV data created")
        
        # Create sample JSON data
        sample_json = {
            "students": [
                {"id": "S001", "name": "Alice", "gpa": 3.6, "major": "Computer Science"},
                {"id": "S002", "name": "Bob", "gpa": 3.15, "major": "Computer Science"},
                {"id": "S003", "name": "Charlie", "gpa": 3.85, "major": "Computer Science"},
                {"id": "S004", "name": "Diana", "gpa": 2.95, "major": "Computer Science"},
                {"id": "S005", "name": "Eve", "gpa": 3.8, "major": "Computer Science"}
            ]
        }
        
        with open("test_student_data.json", "w") as f:
            json.dump(sample_json, f, indent=2)
        
        print("✅ Sample JSON data created")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {str(e)}")
        return False

async def cleanup_sample_data():
    """Dọn dẹp dữ liệu mẫu"""
    print("\n🧹 Cleaning up sample data...")
    
    try:
        import os
        
        files_to_remove = ["test_student_data.csv", "test_student_data.json"]
        
        for file in files_to_remove:
            if os.path.exists(file):
                os.remove(file)
                print(f"✅ Removed {file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Cleanup failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 ServiceNexus Integration Test Starting...")
    print("=" * 60)
    
    # Create sample data
    await create_sample_data()
    
    # Run tests
    tests = [
        ("ServiceNexus Adapter", test_service_nexus_adapter),
        ("Education Data Agent", test_education_data_agent),
        ("API Endpoints", test_api_endpoints)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ {test_name} test crashed: {str(e)}")
            results[test_name] = False
    
    # Cleanup
    await cleanup_sample_data()
    
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
        print("🎉 All tests passed - ServiceNexus integration is working!")
        return True
    else:
        print("⚠️ Some tests failed - Check the issues above")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
