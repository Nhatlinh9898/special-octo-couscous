# 📋 EduManager - Technical Specifications Document

## 🏗️ System Architecture Overview

### 🎯 Architecture Principles
```yaml
Scalability: Microservices-ready architecture
Performance: Sub-200ms API response time
Security: Enterprise-grade security standards
Reliability: 99.9% uptime SLA
Maintainability: Clean code, comprehensive testing
Extensibility: Plugin-based feature modules
```

### 📐 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web Client    │  Mobile Client  │    Desktop Client       │
│   React 19      │ React Native    │      Electron           │
│   TypeScript    │   TypeScript    │      TypeScript         │
└─────────┬───────┴─────────┬───────┴─────────┬───────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                ┌─────────────┴─────────────┐
                │      API Gateway          │
                │   (Express + Rate Limit)  │
                │   (JWT + CORS)            │
                └─────────────┬─────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐
    │   User    │      │ Academic  │      │    AI     │
    │ Service   │      │ Service   │      │ Service   │
    │           │      │           │      │           │
    └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                ┌─────────────┴─────────────┐
                │   Data Layer              │
                │ PostgreSQL + Redis Cache   │
                │ File Storage (AWS S3)     │
                └───────────────────────────┘
```

---

## 🛠️ Technology Stack

### 🎨 Frontend Stack
```yaml
Core Framework:
  - React 19.2.4
  - TypeScript 5.8.2
  - Vite 6.2.0 (Build tool)

State Management:
  - React Context (Current)
  - Zustand (Planned upgrade)
  - React Query (Server state)

UI Framework:
  - Tailwind CSS (Utility-first)
  - Lucide React (Icons)
  - Headless UI (Components)
  - Framer Motion (Animations)

Development Tools:
  - ESLint + Prettier
  - Husky (Git hooks)
  - TypeScript strict mode
  - Vitest (Testing)
```

### ⚙️ Backend Stack (Planned)
```yaml
Core Framework:
  - Node.js 20+ LTS
  - Express.js 4.18+
  - TypeScript 5.8+

Database:
  - PostgreSQL 15+
  - Redis 7+ (Cache)
  - Prisma ORM

Authentication:
  - JWT (Access tokens)
  - Refresh tokens
  - bcrypt (Password hashing)
  - Rate limiting

API Documentation:
  - Swagger/OpenAPI 3.0
  - Postman collection
  - API versioning
```

### 🗄️ Database Schema
```sql
-- Core Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    homeroom_teacher_id INTEGER REFERENCES users(id),
    room VARCHAR(50),
    max_students INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    class_id INTEGER REFERENCES classes(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender student_gender NOT NULL,
    status student_status DEFAULT 'ACTIVE',
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    parent_id INTEGER REFERENCES users(id),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Academic Tables
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 1,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    day_of_week INTEGER NOT NULL,
    period INTEGER NOT NULL,
    room VARCHAR(50),
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- LMS Tables
CREATE TABLE lms_materials (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type material_type NOT NULL,
    file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    posted_by INTEGER REFERENCES users(id),
    deadline TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES lms_materials(id),
    student_id INTEGER REFERENCES students(id),
    submission_url VARCHAR(500),
    score DECIMAL(5,2),
    feedback TEXT,
    status assignment_status DEFAULT 'PENDING',
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Tables
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_type exam_type NOT NULL,
    duration INTEGER NOT NULL,
    total_questions INTEGER DEFAULT 0,
    max_score DECIMAL(5,2) DEFAULT 100,
    scheduled_at TIMESTAMP,
    status exam_status DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    subject_id INTEGER REFERENCES subjects(id),
    exam_id INTEGER REFERENCES exams(id),
    assignment_id INTEGER REFERENCES assignments(id),
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    grade_type grade_type NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance Tables
CREATE TABLE attendance_sessions (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    date DATE NOT NULL,
    period INTEGER,
    teacher_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES attendance_sessions(id),
    student_id INTEGER REFERENCES students(id),
    status attendance_status NOT NULL,
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Finance Tables
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id),
    student_id INTEGER REFERENCES students(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'UNPAID',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Communication Tables
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'TEXT',
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    parent_message_id INTEGER REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Tables
CREATE TABLE ai_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    analysis_type ai_analysis_type NOT NULL,
    input_data JSONB,
    result_data JSONB,
    confidence_score DECIMAL(3,2),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    analysis_id INTEGER REFERENCES ai_analyses(id),
    recommendation_type ai_recommendation_type NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_implemented BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
CREATE TYPE student_gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE student_status AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED');
CREATE TYPE material_type AS ENUM ('VIDEO', 'DOCUMENT', 'ASSIGNMENT', 'QUIZ', 'LINK');
CREATE TYPE assignment_status AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'RETURNED');
CREATE TYPE exam_type AS ENUM ('QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT');
CREATE TYPE exam_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE grade_type AS ENUM ('ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PARTICIPATION');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE message_type AS ENUM ('TEXT', 'FILE', 'IMAGE', 'VOICE');
CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
CREATE TYPE ai_analysis_type AS ENUM ('STUDENT_RISK', 'PERFORMANCE', 'ATTENDANCE_PATTERN', 'LEARNING_STYLE');
CREATE TYPE ai_recommendation_type AS ENUM ('ACADEMIC', 'BEHAVIORAL', 'ADMINISTRATIVE');

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_schedules_class_id ON schedules(class_id);
CREATE INDEX idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses(user_id);
```

---

## 🔌 API Specifications

### 📡 RESTful API Design
```yaml
Base URL: https://api.edumanager.vn/v1
Authentication: Bearer Token (JWT)
Rate Limiting: 1000 requests/hour per user
Pagination: Cursor-based
Response Format: JSON
Error Handling: Standard HTTP status codes
```

### 🔐 Authentication Endpoints
```yaml
POST /auth/login
  Description: User authentication
  Request:
    email: string
    password: string
    remember_me?: boolean
  Response:
    access_token: string
    refresh_token: string
    user: User object
    expires_in: number

POST /auth/refresh
  Description: Refresh access token
  Request:
    refresh_token: string
  Response:
    access_token: string
    expires_in: number

POST /auth/logout
  Description: User logout
  Headers: Authorization: Bearer {token}
  Response: 204 No Content

GET /auth/me
  Description: Get current user info
  Headers: Authorization: Bearer {token}
  Response: User object
```

### 👥 User Management Endpoints
```yaml
GET /users
  Description: List users (paginated)
  Query Parameters:
    page?: number
    limit?: number
    role?: UserRole
    search?: string
  Response: Paginated User list

POST /users
  Description: Create new user
  Request: CreateUserDto
  Response: User object

GET /users/{id}
  Description: Get user by ID
  Response: User object

PUT /users/{id}
  Description: Update user
  Request: UpdateUserDto
  Response: User object

DELETE /users/{id}
  Description: Delete user
  Response: 204 No Content
```

### 🏫 Academic Management Endpoints
```yaml
GET /classes
  Description: List classes
  Query Parameters:
    school_id?: number
    grade_level?: number
    academic_year?: string
  Response: Class[]

POST /classes
  Description: Create new class
  Request: CreateClassDto
  Response: Class object

GET /classes/{id}/students
  Description: Get students in class
  Response: Student[]

GET /schedules
  Description: Get class schedules
  Query Parameters:
    class_id?: number
    teacher_id?: number
    day_of_week?: number
  Response: Schedule[]

POST /schedules
  Description: Create schedule
  Request: CreateScheduleDto
  Response: Schedule object
```

### 📚 LMS Endpoints
```yaml
GET /lms/materials
  Description: List learning materials
  Query Parameters:
    subject_id?: number
    type?: MaterialType
    class_id?: number
  Response: LMSMaterial[]

POST /lms/materials
  Description: Upload new material
  Request: CreateMaterialDto (multipart/form-data)
  Response: LMSMaterial object

GET /lms/assignments
  Description: List assignments
  Query Parameters:
    student_id?: number
    subject_id?: number
    status?: AssignmentStatus
  Response: Assignment[]

POST /lms/assignments/{id}/submit
  Description: Submit assignment
  Request: SubmitAssignmentDto
  Response: Assignment object
```

### 📊 Assessment Endpoints
```yaml
GET /exams
  Description: List exams
  Query Parameters:
    subject_id?: number
    class_id?: number
    status?: ExamStatus
  Response: Exam[]

POST /exams
  Description: Create new exam
  Request: CreateExamDto
  Response: Exam object

GET /grades
  Description: Get student grades
  Query Parameters:
    student_id?: number
    subject_id?: number
    semester?: string
  Response: Grade[]

POST /grades
  Description: Create/update grade
  Request: CreateGradeDto
  Response: Grade object
```

### 📋 Attendance Endpoints
```yaml
GET /attendance/sessions
  Description: List attendance sessions
  Query Parameters:
    class_id?: number
    date?: string
  Response: AttendanceSession[]

POST /attendance/sessions
  Description: Create attendance session
  Request: CreateAttendanceSessionDto
  Response: AttendanceSession object

GET /attendance/sessions/{id}/records
  Description: Get attendance records
  Response: AttendanceRecord[]

POST /attendance/sessions/{id}/records
  Description: Mark attendance
  Request: MarkAttendanceDto
  Response: AttendanceRecord[]
```

### 💰 Finance Endpoints
```yaml
GET /invoices
  Description: List invoices
  Query Parameters:
    student_id?: number
    status?: InvoiceStatus
    due_date?: string
  Response: Invoice[]

POST /invoices
  Description: Create invoice
  Request: CreateInvoiceDto
  Response: Invoice object

POST /invoices/{id}/pay
  Description: Process payment
  Request: ProcessPaymentDto
  Response: Invoice object
```

### 🤖 AI Endpoints
```yaml
POST /ai/analyze/student-risk
  Description: Analyze student risk factors
  Request:
    student_id: number
    analysis_period?: string
  Response: AIAnalysisResult

POST /ai/analyze/performance
  Description: Analyze student performance
  Request:
    student_id?: number
    class_id?: number
    subject_id?: number
  Response: AIAnalysisResult

POST /ai/recommendations
  Description: Get AI recommendations
  Request:
    user_id: number
    type: RecommendationType
  Response: AIRecommendation[]

POST /ai/chat
  Description: AI chat assistant
  Request:
    message: string
    context?: object
  Response: ChatResponse
```

---

## 🔒 Security Specifications

### 🛡️ Security Architecture
```yaml
Authentication:
  - JWT access tokens (15 min expiry)
  - Refresh tokens (7 days expiry)
  - Password hashing (bcrypt, salt rounds 12)
  - Multi-factor authentication (optional)

Authorization:
  - Role-based access control (RBAC)
  - Resource-level permissions
  - API rate limiting
  - IP whitelisting (admin)

Data Protection:
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - PII data masking
  - GDPR compliance

API Security:
  - CORS configuration
  - Input validation & sanitization
  - SQL injection prevention
  - XSS protection
  - CSRF protection
```

### 🔐 Security Implementation
```typescript
// JWT Middleware
interface JWTPayload {
  user_id: number;
  email: string;
  role: UserRole;
  school_id: number;
  permissions: string[];
  iat: number;
  exp: number;
}

// Rate Limiting
const rateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});

// Input Validation
const createClassSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  grade_level: z.number().min(1).max(12),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/),
  homeroom_teacher_id: z.number().optional(),
  room: z.string().max(50).optional(),
  max_students: z.number().min(1).max(100).default(50)
});
```

---

## 📊 Performance Specifications

### ⚡ Performance Targets
```yaml
API Response Time:
  - Simple queries: < 100ms
  - Complex queries: < 500ms
  - File uploads: < 2s
  - AI processing: < 10s

Database Performance:
  - Connection pool: 20 connections
  - Query timeout: 30s
  - Index coverage: > 95%
  - Slow query threshold: 1s

Frontend Performance:
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s
  - Time to Interactive: < 3s
  - Cumulative Layout Shift: < 0.1
```

### 📈 Monitoring & Logging
```yaml
Application Metrics:
  - Request rate per endpoint
  - Response time distribution
  - Error rate by type
  - User engagement metrics

Infrastructure Metrics:
  - CPU usage < 70%
  - Memory usage < 80%
  - Disk usage < 85%
  - Network latency < 50ms

Logging Strategy:
  - Structured JSON logging
  - Log levels: ERROR, WARN, INFO, DEBUG
  - Log aggregation (ELK stack)
  - Alert thresholds
```

---

## 🚀 Deployment Architecture

### 🌐 Production Environment
```yaml
Infrastructure:
  - Container orchestration: Kubernetes
  - Load balancer: NGINX
  - Application servers: Node.js pods
  - Database: PostgreSQL cluster
  - Cache: Redis cluster
  - File storage: AWS S3

CI/CD Pipeline:
  - Source control: GitHub
  - CI: GitHub Actions
  - Container registry: Docker Hub
  - Deployment: ArgoCD
  - Environment: Dev/Staging/Production

Monitoring:
  - APM: DataDog/New Relic
  - Logging: ELK stack
  - Alerting: PagerDuty
  - Uptime: Pingdom
```

### 📦 Deployment Configuration
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edumanager-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: edumanager-api
  template:
    metadata:
      labels:
        app: edumanager-api
    spec:
      containers:
      - name: api
        image: edumanager/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: edumanager-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: edumanager-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 🧪 Testing Strategy

### 📋 Test Coverage Requirements
```yaml
Unit Testing:
  - Coverage target: > 80%
  - Framework: Jest + Vitest
  - Test files: *.test.ts, *.spec.ts
  - Mock strategy: Jest mocks

Integration Testing:
  - API endpoint testing
  - Database integration
  - External service integration
  - Framework: Supertest

E2E Testing:
  - User journey testing
  - Cross-browser testing
  - Mobile responsiveness
  - Framework: Playwright

Performance Testing:
  - Load testing: k6
  - Stress testing: Artillery
  - Database performance: pgbench
  - Frontend performance: Lighthouse
```

### 🧪 Test Implementation Examples
```typescript
// Unit Test Example
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'STUDENT'
    };
    
    const user = await userService.createUser(userData);
    
    expect(user.email).toBe(userData.email);
    expect(user.id).toBeDefined();
    expect(user.password_hash).not.toBe(userData.password);
  });
});

// Integration Test Example
describe('POST /api/users', () => {
  it('should create new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'STUDENT'
      })
      .expect(201);
    
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.id).toBeDefined();
  });
});

// E2E Test Example
test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'admin@school.edu.vn');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');
  
  await expect(page.locator('[data-testid=dashboard]')).toBeVisible();
  await expect(page.locator('[data-testid=user-name]')).toContainText('Admin');
});
```

---

## 📱 Mobile Application Specifications

### 📲 React Native Architecture
```yaml
Technology Stack:
  - React Native 0.72+
  - TypeScript 5.8+
  - Navigation: React Navigation 6
  - State Management: Zustand
  - UI Components: React Native Elements
  - Testing: Jest + Detox

App Structure:
  - Shared components: /components
  - Screens: /screens
  - Navigation: /navigation
  - Services: /services
  - Utils: /utils
  - Types: /types

Features:
  - Offline mode support
  - Push notifications
  - Biometric authentication
  - Camera integration
  - File uploads
  - Real-time updates
```

### 📱 Mobile API Integration
```typescript
// API Service
class ApiService {
  private baseURL = 'https://api.edumanager.vn/v1';
  private token: string | null = null;
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    this.token = data.access_token;
    await SecureStore.setItemAsync('auth_token', this.token);
    
    return data;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  }
}

// Offline Support
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    
    return unsubscribe;
  }, []);
  
  const syncData = async () => {
    if (!isOnline) return;
    
    // Sync pending changes
    const pendingChanges = await AsyncStorage.getItem('pending_changes');
    if (pendingChanges) {
      // Process pending changes
      await AsyncStorage.removeItem('pending_changes');
    }
  };
  
  return { isOnline, syncData };
};
```

---

## 🔄 Migration Strategy

### 📋 Data Migration Plan
```yaml
Phase 1: Backend Migration (Month 1-2)
  - Set up PostgreSQL database
  - Create schema and tables
  - Migrate mock data to production
  - Implement data validation
  - Test data integrity

Phase 2: API Migration (Month 2-3)
  - Replace mock API with real endpoints
  - Implement authentication
  - Add error handling
  - Update frontend to use real API
  - Test integration

Phase 3: Feature Migration (Month 3-4)
  - Migrate all features to backend
  - Implement file uploads
  - Add real-time features
  - Optimize performance
  - User acceptance testing
```

### 🔄 Zero-Downtime Deployment
```yaml
Strategy: Blue-Green Deployment
  - Maintain two identical production environments
  - Deploy new version to green environment
  - Run smoke tests on green
  - Switch traffic from blue to green
  - Keep blue as rollback backup

Database Migration:
  - Use database migrations (Prisma)
  - Backward-compatible changes
  - Transactional migrations
  - Rollback procedures
  - Data validation post-migration
```

---

## 📊 Scalability Planning

### 📈 Horizontal Scaling Strategy
```yaml
Application Layer:
  - Load balancer: NGINX/HAProxy
  - Auto-scaling: Kubernetes HPA
  - Session affinity: Sticky sessions
  - Health checks: Liveness/Readiness probes

Database Layer:
  - Read replicas: 3-5 replicas
  - Connection pooling: PgBouncer
  - Sharding strategy: By school_id
  - Caching: Redis cluster

File Storage:
  - CDN: CloudFlare
  - Object storage: AWS S3
  - Image optimization: Sharp
  - Caching headers: Long-term
```

### 🎯 Performance Optimization
```yaml
Frontend Optimization:
  - Code splitting: React.lazy()
  - Tree shaking: ES6 modules
  - Image optimization: WebP format
  - Caching: Service Worker
  - Bundle size: < 1MB

Backend Optimization:
  - Database indexing: Strategic indexes
  - Query optimization: EXPLAIN ANALYZE
  - Caching strategy: Redis
  - Compression: Gzip/Brotli
  - CDN: Static assets
```

---

## 🎯 Conclusion

This technical specification provides a comprehensive foundation for building EduManager into a scalable, enterprise-ready education management platform. The architecture supports:

- **Scalability**: Microservices-ready, horizontal scaling
- **Performance**: Sub-200ms API response times
- **Security**: Enterprise-grade security standards
- **Maintainability**: Clean code, comprehensive testing
- **Extensibility**: Plugin-based architecture

The specification is designed to evolve with the growing needs of the education sector while maintaining high standards of performance and reliability.

**Next Steps:**
1. Review and approve technical specifications
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish CI/CD pipeline
5. Start development sprints

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: March 2025*
