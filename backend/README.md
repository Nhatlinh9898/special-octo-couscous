# EduManager Backend API

🎓 **Nền tảng quản lý giáo dục thông minh - Backend API**

## 📋 Mô tả

EduManager Backend là một API RESTful mạnh mẽ được xây dựng với Node.js, Express, TypeScript và Prisma. Nó cung cấp đầy đủ tính năng quản lý giáo dục bao gồm quản lý người dùng, trường học, lớp học, học sinh, môn học, lịch học, điểm số, điểm danh, tài chính và nhiều hơn nữa.

## 🚀 Tính năng

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student, Parent)
- Password hashing với bcrypt
- Refresh token support
- Session management

### 👥 User Management
- Multi-role user system
- Profile management
- Password change
- User search và filtering
- School-based user organization

### 🏫 School Management
- School creation và management
- School statistics và analytics
- Multi-school support
- School settings configuration

### 👨‍🎓 Student Management
- Student registration và management
- Class assignment
- Parent-student relationships
- Academic tracking
- Emergency contact management

### 📚 Academic Management
- Subject management
- Class management
- Schedule management
- Grade management
- Attendance tracking

### 💰 Financial Management
- Invoice generation
- Payment tracking
- Financial reports
- Tuition management

### 📱 Communication
- Messaging system
- Notifications
- Real-time updates với Socket.IO

### 🤖 AI Integration
- Student performance analysis
- Risk assessment
- Personalized recommendations
- Learning analytics

## 🛠️ Công nghệ

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston
- **Real-time:** Socket.IO
- **Documentation:** Auto-generated API docs

## 📦 Cài đặt

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis (optional, cho caching)
- Git

### 1. Clone repository
```bash
git clone <repository-url>
cd edumanager/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
```

Cấu hình các biến môi trường trong file `.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/edumanager"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

### 4. Database setup

#### Option A: Automatic setup (recommended)
```bash
node scripts/setup-database.js
```

#### Option B: Manual setup
```bash
# Tạo database
createdb edumanager

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database với sample data
npx prisma db seed
```

### 5. Start server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
Include JWT token trong Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout

#### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Change password
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

#### Schools
- `GET /schools` - Get all schools
- `GET /schools/:id` - Get school by ID
- `POST /schools` - Create school (Admin)
- `PUT /schools/:id` - Update school (Admin)
- `DELETE /schools/:id` - Delete school (Admin)
- `GET /schools/:id/statistics` - Get school statistics

#### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Classes
- `GET /classes` - Get all classes
- `GET /classes/:id` - Get class by ID
- `POST /classes` - Create class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

#### Subjects
- `GET /subjects` - Get all subjects
- `GET /subjects/:id` - Get subject by ID
- `POST /subjects` - Create subject
- `PUT /subjects/:id` - Update subject
- `DELETE /subjects/:id` - Delete subject

### Documentation Endpoints
- `GET /docs` - Complete API documentation
- `GET /database/status` - Database status
- `GET /database/setup` - Setup instructions

## 🔑 Test Credentials

Sau khi chạy seed script, bạn có thể sử dụng các tài khoản sau:

```
Admin: admin@edumanager.demo / admin123
Teacher: math.teacher@edumanager.demo / teacher123
Teacher: science.teacher@edumanager.demo / teacher123
Parent: parent@edumanager.demo / parent123
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### API Test
```bash
curl http://localhost:3001/api/v1/test
```

### Database Status
```bash
curl http://localhost:3001/api/v1/database/status
```

### API Documentation
```bash
curl http://localhost:3001/api/v1/docs
```

## 📊 Database Schema

### Core Tables
- **users** - User management
- **schools** - School information
- **classes** - Class management
- **students** - Student information
- **subjects** - Subject management
- **schedules** - Class schedules
- **grades** - Grade management
- **attendance** - Attendance tracking
- **invoices** - Financial management
- **messages** - Communication
- **notifications** - System notifications
- **ai_analyses** - AI-powered analytics

### Relationships
- Users belong to Schools
- Students belong to Classes
- Classes belong to Schools
- Teachers teach Subjects
- Students take Subjects
- Classes have Schedules

## 🔧 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linting
```

### Prisma Commands
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio    # Open database viewer
npx prisma db seed   # Seed database
```

## 🛡️ Security

- JWT-based authentication
- Password hashing với bcrypt
- Rate limiting
- CORS configuration
- Security headers với Helmet
- Input validation
- SQL injection prevention với Prisma
- XSS protection

## 📝 Logging

Winston logger với các levels:
- Error: Lỗi hệ thống
- Warn: Cảnh báo
- Info: Thông tin chung
- Debug: Debug information
- HTTP: HTTP requests

Logs được lưu trong:
- Console output
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/edumanager"
REDIS_URL="redis://host:6379"
JWT_SECRET="production-jwt-secret"
JWT_REFRESH_SECRET="production-refresh-secret"
CORS_ORIGIN="https://yourdomain.com"
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Nếu bạn có bất kỳ câu hỏi nào, vui lòng:
1. Kiểm tra [API Documentation](http://localhost:3001/api/v1/docs)
2. Xem [Database Status](http://localhost:3001/api/v1/database/status)
3. Chạy setup script: `node scripts/setup-database.js`
4. Contact development team

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI integration
- **v1.2.0** - Enhanced security features
- **v1.3.0** - Real-time communication

---

**🎓 EduManager - Nền tảng giáo dục thông minh cho tương lai!**
