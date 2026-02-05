# 🤖 Backend AI Integration Guide
# Hướng dẫn kết nối Backend TypeScript với Hệ thống AI Python

## 📋 Tổng quan

EduManager Backend đã được tích hợp với AI System thông qua AI Bridge Service, cho phép:
- **Content Generation** - Tạo bài học, bài tập, bài thi, quiz tự động
- **Academic Services** - Quản lý khóa học, thông tin sinh viên
- **ServiceNexus Integration** - Phân tích dữ liệu, visualization, big data processing
- **Quality Assessment** - Đánh giá chất lượng nội dung giáo dục

---

## 🏗️ Kiến trúc Integration

```
Frontend (React) ←→ Backend (TypeScript) ←→ AI Bridge Service ←→ AI System (Python)
     ↓                    ↓                        ↓                    ↓
  UI Components      REST API              HTTP Requests        FastAPI Server
  User Actions     Validation &           Error Handling        AI Agents
  Data Display     Business Logic         Logging &            Content Generation
                    Authentication        Monitoring           Data Processing
```

---

## 🚀 Quick Start

### 1. **Khởi động AI System**
```bash
cd ai-system
python main.py
# AI System sẽ chạy trên http://localhost:8000
```

### 2. **Khởi động Backend**
```bash
cd backend
npm install
npm run dev
# Backend sẽ chạy trên http://localhost:3001
```

### 3. **Test Integration**
```bash
cd backend
node test_ai_integration.js
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── ai-bridge.service.ts     # AI Bridge Service
│   ├── routes/
│   │   └── ai.ts                    # AI Routes
│   ├── config/
│   │   └── config.ts                # Configuration
│   ├── middleware/
│   │   └── async.ts                 # Async Handler
│   └── utils/
│       └── logger.ts                # Logging Utility
├── .env.example                     # Environment Variables
├── test_ai_integration.js           # Integration Tests
└── AI_INTEGRATION_README.md         # This file
```

---

## 🔧 Configuration

### **Environment Variables**
```bash
# AI System Integration
AI_BASE_URL="http://localhost:8000"
AI_TIMEOUT="30000"
AI_RETRY_ATTEMPTS="3"
AI_RETRY_DELAY="1000"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Ollama Configuration
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3:8b-instruct"
```

### **Cấu hình trong config.ts**
```typescript
export const config = {
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000')
  }
};
```

---

## 🌐 API Endpoints

### **Health & Status**
- `GET /api/ai/health` - Health check cho AI Bridge
- `GET /api/ai/status` - Status của AI System

### **Content Generation**
- `POST /api/ai/content/lesson` - Tạo bài học
- `POST /api/ai/content/exercise` - Tạo bài tập
- `POST /api/ai/content/exam` - Tạo bài thi
- `POST /api/ai/content/quiz` - Tạo quiz
- `POST /api/ai/content/personalize` - Cá nhân hóa nội dung
- `POST /api/ai/content/assess-quality` - Đánh giá chất lượng
- `GET /api/ai/content/templates` - Lấy templates

### **Academic Services**
- `GET /api/ai/courses/:code` - Lấy thông tin khóa học
- `GET /api/ai/courses` - Lấy danh sách khóa học
- `GET /api/ai/students/:id/info` - Lấy thông tin sinh viên
- `GET /api/ai/students/:id/progress` - Lấy tiến độ học tập

### **ServiceNexus Integration**
- `POST /api/ai/education/analyze` - Phân tích dữ liệu giáo dục
- `POST /api/ai/education/workflow` - Thực thi workflow
- `POST /api/ai/education/visualize` - Tạo visualization
- `POST /api/ai/education/big-data` - Xử lý big data
- `GET /api/ai/integration/status` - Integration status

---

## 📝 Usage Examples

### **Tạo bài học**
```javascript
const lessonRequest = {
  topic: "Introduction to Machine Learning",
  subject: "Computer Science",
  level: "intermediate",
  duration: 60,
  objectives: [
    "Understand basic ML concepts",
    "Identify different ML algorithms",
    "Apply ML to simple problems"
  ]
};

const response = await fetch('/api/ai/content/lesson', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(lessonRequest)
});

const result = await response.json();
```

### **Tạo bài tập**
```javascript
const exerciseRequest = {
  topic: "Linear Regression",
  type: "practice",
  difficulty: "medium",
  count: 5
};

const response = await fetch('/api/ai/content/exercise', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(exerciseRequest)
});
```

### **Phân tích dữ liệu giáo dục**
```javascript
const analysisRequest = {
  data_type: "student_performance",
  data: {
    students: [
      { id: 1, name: "John Doe", grades: [85, 90, 78, 92] },
      { id: 2, name: "Jane Smith", grades: [95, 88, 91, 87] }
    ]
  },
  analysis_type: "performance_summary"
};

const response = await fetch('/api/ai/education/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analysisRequest)
});
```

---

## 🧪 Testing

### **Run Integration Tests**
```bash
cd backend
node test_ai_integration.js
```

### **Test Categories**
1. **Health Checks** - Backend và AI System status
2. **Content Generation** - Lesson, exercise, quiz, exam generation
3. **Quality Assessment** - Content quality evaluation
4. **Academic Services** - Course và student information
5. **ServiceNexus Integration** - Data analysis và visualization

### **Expected Results**
```
🎯 Success Rate: 100%
✅ Passed: 11/11
🎉 AI Integration is working great!
```

---

## 🔍 Error Handling

### **Common Errors**

#### **1. AI System Not Running**
```
❌ AI System health check failed: connect ECONNREFUSED
⚠️  Make sure AI System is running on port 8000
```
**Solution:** Start AI System
```bash
cd ai-system
python main.py
```

#### **2. Invalid Request**
```
❌ Content generation failed: Validation failed
```
**Solution:** Check request body format
```javascript
// Valid request
{
  topic: "Required field",
  // ... other fields
}
```

#### **3. AI Service Timeout**
```
❌ AI Service timeout after 30000ms
```
**Solution:** Increase timeout or check AI System performance
```bash
# Update .env
AI_TIMEOUT="60000"
```

---

## 📊 Monitoring & Logging

### **Logging Levels**
- `error` - Errors và failures
- `warn` - Warnings và issues
- `info` - General information
- `debug` - Detailed debugging

### **Log Locations**
- **Console** - Real-time logs during development
- **Files** - `logs/error.log`, `logs/combined.log`
- **AI Bridge** - All AI requests/responses logged

### **Monitoring Metrics**
- Request/response times
- Success/failure rates
- AI processing time
- Error frequency

---

## 🔒 Security

### **Authentication**
- AI endpoints require authentication
- JWT token validation
- Rate limiting applied

### **Data Validation**
- Input validation với express-validator
- Sanitization của user input
- SQL injection prevention

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Configurable limits
- Automatic blocking of abusive requests

---

## 🚀 Performance Optimization

### **Caching**
- Response caching for repeated requests
- Template caching
- AI model response caching

### **Connection Pooling**
- HTTP connection reuse
- Keep-alive connections
- Timeout management

### **Async Processing**
- Non-blocking AI requests
- Background processing
- Queue management

---

## 🔧 Troubleshooting

### **Check Connection Status**
```bash
# Test AI System
curl http://localhost:8000/health

# Test Backend
curl http://localhost:3001/health

# Test AI Bridge
curl http://localhost:3001/api/ai/status
```

### **Debug Mode**
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

### **Common Issues**

#### **Port Conflicts**
```bash
# Check port usage
netstat -an | grep :8000
netstat -an | grep :3001

# Kill processes
kill -9 <PID>
```

#### **Environment Issues**
```bash
# Check .env file
cat .env

# Reload environment
source .env
```

#### **Dependency Issues**
```bash
# Reinstall dependencies
npm install
npm run build
```

---

## 📚 Advanced Features

### **Custom AI Agents**
```typescript
// Add new AI agent
await aiBridgeService.callAIAgent('custom_agent', {
  task: 'custom_task',
  data: customData
});
```

### **Batch Processing**
```typescript
// Process multiple requests
const requests = [
  { topic: "Math", type: "lesson" },
  { topic: "Science", type: "exercise" }
];

const results = await Promise.all(
  requests.map(req => aiBridgeService.generateLesson(req))
);
```

### **Streaming Responses**
```typescript
// Handle streaming AI responses
const response = await aiBridgeService.streamResponse(request);
for await (const chunk of response) {
  console.log(chunk);
}
```

---

## 🔄 Future Enhancements

### **Planned Features**
- [ ] WebSocket support for real-time AI responses
- [ ] Advanced caching strategies
- [ ] Load balancing for multiple AI instances
- [ ] GraphQL API support
- [ ] Advanced monitoring dashboard

### **Integration Roadmap**
1. **Phase 1** - Basic AI integration ✅
2. **Phase 2** - Advanced features and optimization
3. **Phase 3** - Scalability and performance
4. **Phase 4** - Production deployment

---

## 📞 Support

### **Getting Help**
1. **Check logs** - Review error messages
2. **Run tests** - `node test_ai_integration.js`
3. **Check documentation** - AI System docs
4. **Community support** - GitHub issues

### **Reporting Issues**
When reporting issues, include:
- Error messages
- Request/response logs
- Environment details
- Steps to reproduce

---

## 🎉 Summary

Backend AI Integration provides:
- **🤖 Seamless AI Integration** - Connect TypeScript backend với Python AI System
- **📚 Rich Content Generation** - Tạo nội dung giáo dục tự động
- **🔍 Advanced Analytics** - Phân tích dữ liệu và visualization
- **⚡ High Performance** - Optimized requests và responses
- **🔒 Enterprise Security** - Authentication, validation, rate limiting
- **📊 Full Monitoring** - Logging, metrics, error tracking

Hệ thống đã sẵn sàng để phát triển và triển khai production! 🚀
