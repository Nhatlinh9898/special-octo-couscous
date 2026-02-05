/**
 * AI Integration Test Script for Backend
 * Kiểm tra kết nối giữa Backend TypeScript và AI System Python
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const AI_BASE_URL = 'http://localhost:8000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test functions
async function testBackendHealth() {
  log('Testing Backend Health...', colors.cyan);
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      logSuccess('Backend is healthy');
      logInfo(`Version: ${response.data.version}`);
      logInfo(`Environment: ${response.data.environment}`);
      return true;
    }
  } catch (error) {
    logError(`Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testAIHealth() {
  log('Testing AI System Health...', colors.cyan);
  try {
    const response = await axios.get(`${AI_BASE_URL}/health`);
    if (response.status === 200) {
      logSuccess('AI System is healthy');
      logInfo(`Version: ${response.data.version}`);
      return true;
    }
  } catch (error) {
    logError(`AI System health check failed: ${error.message}`);
    logWarning('Make sure AI System is running on port 8000');
    return false;
  }
}

async function testAIBridgeStatus() {
  log('Testing AI Bridge Status...', colors.cyan);
  try {
    const response = await axios.get(`${BACKEND_URL}/api/ai/status`);
    if (response.status === 200) {
      logSuccess('AI Bridge is working');
      logInfo(`Status: ${response.data.data.status}`);
      logInfo(`AI URL: ${response.data.data.ai_url}`);
      return true;
    }
  } catch (error) {
    logError(`AI Bridge status check failed: ${error.message}`);
    return false;
  }
}

async function testContentGeneration() {
  log('Testing Content Generation...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/content/lesson`, {
      topic: "Introduction to JavaScript",
      subject: "Computer Science",
      level: "beginner",
      duration: 60,
      objectives: [
        "Understand basic JavaScript syntax",
        "Learn variables and data types",
        "Write simple functions"
      ]
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Content generation working');
      logInfo(`Processing time: ${response.data.data.processing_time}ms`);
      logInfo(`Confidence: ${response.data.data.confidence}`);
      return true;
    }
  } catch (error) {
    logError(`Content generation test failed: ${error.message}`);
    return false;
  }
}

async function testExerciseGeneration() {
  log('Testing Exercise Generation...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/content/exercise`, {
      topic: "Mathematical Equations",
      type: "practice",
      difficulty: "medium",
      count: 5
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Exercise generation working');
      logInfo(`Generated ${response.data.data.exercises?.length || 0} exercises`);
      return true;
    }
  } catch (error) {
    logError(`Exercise generation test failed: ${error.message}`);
    return false;
  }
}

async function testQuizGeneration() {
  log('Testing Quiz Generation...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/content/quiz`, {
      topic: "World History",
      type: "quick",
      count: 10,
      time_limit: 15
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Quiz generation working');
      logInfo(`Generated quiz with ${response.data.data.quiz?.questions?.length || 0} questions`);
      return true;
    }
  } catch (error) {
    logError(`Quiz generation test failed: ${error.message}`);
    return false;
  }
}

async function testQualityAssessment() {
  log('Testing Quality Assessment...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/content/assess-quality`, {
      content: "This is a sample educational content about machine learning. It covers basic concepts including supervised learning, unsupervised learning, and neural networks. The content is designed for beginners and includes practical examples.",
      content_type: "lesson",
      criteria: ["clarity", "accuracy", "engagement", "appropriateness"]
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Quality assessment working');
      logInfo(`Overall score: ${response.data.data.assessment?.overall_assessment?.score || 'N/A'}`);
      return true;
    }
  } catch (error) {
    logError(`Quality assessment test failed: ${error.message}`);
    return false;
  }
}

async function testAcademicAgent() {
  log('Testing Academic Agent...', colors.cyan);
  try {
    const response = await axios.get(`${BACKEND_URL}/api/ai/courses/CS101`);
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Academic agent working');
      logInfo(`Course info retrieved successfully`);
      return true;
    }
  } catch (error) {
    logError(`Academic agent test failed: ${error.message}`);
    return false;
  }
}

async function testServiceNexusIntegration() {
  log('Testing ServiceNexus Integration...', colors.cyan);
  try {
    const response = await axios.get(`${BACKEND_URL}/api/ai/integration/status`);
    
    if (response.status === 200) {
      logSuccess('ServiceNexus integration working');
      logInfo(`Integration status retrieved`);
      return true;
    }
  } catch (error) {
    logError(`ServiceNexus integration test failed: ${error.message}`);
    return false;
  }
}

async function testEducationDataAnalysis() {
  log('Testing Education Data Analysis...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/education/analyze`, {
      data_type: "student_performance",
      data: {
        students: [
          { id: 1, name: "John Doe", grades: [85, 90, 78, 92] },
          { id: 2, name: "Jane Smith", grades: [95, 88, 91, 87] }
        ]
      },
      analysis_type: "performance_summary"
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Education data analysis working');
      logInfo(`Analysis completed successfully`);
      return true;
    }
  } catch (error) {
    logError(`Education data analysis test failed: ${error.message}`);
    return false;
  }
}

async function testVisualization() {
  log('Testing Visualization Generation...', colors.cyan);
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ai/education/visualize`, {
      data: {
        labels: ["Math", "Science", "English", "History"],
        values: [85, 92, 78, 88]
      },
      chart_type: "bar",
      options: {
        title: "Student Performance by Subject"
      }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Visualization generation working');
      logInfo(`Chart generated successfully`);
      return true;
    }
  } catch (error) {
    logError(`Visualization generation test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting AI Integration Tests', colors.bright + colors.magenta);
  log('=====================================', colors.bright + colors.magenta);
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'AI System Health', fn: testAIHealth },
    { name: 'AI Bridge Status', fn: testAIBridgeStatus },
    { name: 'Content Generation', fn: testContentGeneration },
    { name: 'Exercise Generation', fn: testExerciseGeneration },
    { name: 'Quiz Generation', fn: testQuizGeneration },
    { name: 'Quality Assessment', fn: testQualityAssessment },
    { name: 'Academic Agent', fn: testAcademicAgent },
    { name: 'ServiceNexus Integration', fn: testServiceNexusIntegration },
    { name: 'Education Data Analysis', fn: testEducationDataAnalysis },
    { name: 'Visualization Generation', fn: testVisualization }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test "${test.name}" crashed: ${error.message}`);
      failed++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  log('\n📊 Test Results Summary', colors.bright + colors.cyan);
  log('========================', colors.bright + colors.cyan);
  logSuccess(`Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    logError(`Failed: ${failed}/${tests.length}`);
  }
  
  const successRate = (passed / tests.length) * 100;
  log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`, 
    successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red);
  
  if (successRate >= 80) {
    log('\n🎉 AI Integration is working great!', colors.green + colors.bright);
    log('\n📋 Next steps:', colors.blue);
    log('1. Start building frontend components', colors.blue);
    log('2. Implement authentication middleware', colors.blue);
    log('3. Add database integration', colors.blue);
    log('4. Deploy to production', colors.blue);
  } else if (successRate >= 60) {
    log('\n⚠️  AI Integration is partially working', colors.yellow + colors.bright);
    log('\n🔧 Troubleshooting tips:', colors.blue);
    log('1. Make sure AI System is running on port 8000', colors.blue);
    log('2. Check environment variables in .env file', colors.blue);
    log('3. Verify network connectivity', colors.blue);
    log('4. Check AI System logs', colors.blue);
  } else {
    log('\n❌ AI Integration needs attention', colors.red + colors.bright);
    log('\n🚨 Critical issues:', colors.blue);
    log('1. Start AI System: python ai-system/main.py', colors.blue);
    log('2. Start Backend: npm run dev', colors.blue);
    log('3. Check configuration files', colors.blue);
    log('4. Verify dependencies are installed', colors.blue);
  }
  
  process.exit(successRate >= 60 ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n🛑 Tests interrupted by user', colors.yellow);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Tests terminated', colors.yellow);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner crashed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testBackendHealth,
  testAIHealth,
  testAIBridgeStatus,
  testContentGeneration,
  testExerciseGeneration,
  testQuizGeneration,
  testQualityAssessment,
  testAcademicAgent,
  testServiceNexusIntegration,
  testEducationDataAnalysis,
  testVisualization
};
