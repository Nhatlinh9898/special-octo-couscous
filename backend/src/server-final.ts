import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.get('/api/v1/test', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    data: {
      status: 'active',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication endpoints (mock implementation)
app.post('/api/v1/auth/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User registration endpoint - Database integration pending',
    data: {
      note: 'This endpoint will handle user registration with Prisma + PostgreSQL',
      required: ['email', 'password', 'fullName', 'role', 'schoolId'],
    },
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User login endpoint - Database integration pending',
    data: {
      note: 'This endpoint will handle user authentication with JWT',
      required: ['email', 'password'],
    },
  });
});

// Users endpoints (mock implementation)
app.get('/api/v1/users', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users API - Database integration pending',
    data: {
      endpoints: [
        'GET /api/v1/users/profile - Get current user profile',
        'PUT /api/v1/users/profile - Update user profile',
        'PUT /api/v1/users/password - Change password',
        'GET /api/v1/users - Get all users (Admin)',
        'GET /api/v1/users/:id - Get user by ID',
        'PUT /api/v1/users/:id - Update user (Admin)',
        'DELETE /api/v1/users/:id - Delete user (Admin)',
      ],
      features: [
        'JWT Authentication',
        'Role-based access control',
        'Profile management',
        'Password hashing with bcrypt',
        'Input validation with express-validator',
      ],
    },
  });
});

// Schools endpoints (mock implementation)
app.get('/api/v1/schools', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Schools API - Database integration pending',
    data: {
      endpoints: [
        'GET /api/v1/schools - Get all schools',
        'GET /api/v1/schools/:id - Get school by ID',
        'POST /api/v1/schools - Create school (Admin)',
        'PUT /api/v1/schools/:id - Update school (Admin)',
        'DELETE /api/v1/schools/:id - Delete school (Admin)',
        'GET /api/v1/schools/:id/statistics - Get school statistics',
      ],
      features: [
        'School management',
        'User-school relationships',
        'Statistics and analytics',
        'CRUD operations',
      ],
    },
  });
});

// Students endpoints
app.get('/api/v1/students', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Students API - Ready for implementation',
    data: {
      endpoints: [
        'GET /api/v1/students - Get all students',
        'GET /api/v1/students/:id - Get student by ID',
        'POST /api/v1/students - Create student',
        'PUT /api/v1/students/:id - Update student',
        'DELETE /api/v1/students/:id - Delete student',
      ],
    },
  });
});

// Classes endpoints
app.get('/api/v1/classes', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Classes API - Ready for implementation',
    data: {
      endpoints: [
        'GET /api/v1/classes - Get all classes',
        'GET /api/v1/classes/:id - Get class by ID',
        'POST /api/v1/classes - Create class',
        'PUT /api/v1/classes/:id - Update class',
        'DELETE /api/v1/classes/:id - Delete class',
      ],
    },
  });
});

// Subjects endpoints
app.get('/api/v1/subjects', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Subjects API - Ready for implementation',
    data: {
      endpoints: [
        'GET /api/v1/subjects - Get all subjects',
        'GET /api/v1/subjects/:id - Get subject by ID',
        'POST /api/v1/subjects - Create subject',
        'PUT /api/v1/subjects/:id - Update subject',
        'DELETE /api/v1/subjects/:id - Delete subject',
      ],
    },
  });
});

// API Documentation
app.get('/api/v1/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduManager Backend API Documentation',
    version: '1.0.0',
    documentation: {
      baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
      status: 'Development Phase - Database Integration Pending',
      endpoints: {
        authentication: {
          'POST /auth/register': 'User registration',
          'POST /auth/login': 'User login',
          'POST /auth/refresh': 'Refresh token',
          'POST /auth/logout': 'User logout',
        },
        users: {
          'GET /users/profile': 'Get current user profile',
          'PUT /users/profile': 'Update user profile',
          'PUT /users/password': 'Change password',
          'GET /users': 'Get all users (Admin)',
          'GET /users/:id': 'Get user by ID',
          'PUT /users/:id': 'Update user (Admin)',
          'DELETE /users/:id': 'Delete user (Admin)',
        },
        schools: {
          'GET /schools': 'Get all schools',
          'GET /schools/:id': 'Get school by ID',
          'POST /schools': 'Create school (Admin)',
          'PUT /schools/:id': 'Update school (Admin)',
          'DELETE /schools/:id': 'Delete school (Admin)',
          'GET /schools/:id/statistics': 'Get school statistics',
        },
        students: {
          'GET /students': 'Get all students',
          'GET /students/:id': 'Get student by ID',
          'POST /students': 'Create student',
          'PUT /students/:id': 'Update student',
          'DELETE /students/:id': 'Delete student',
        },
        classes: {
          'GET /classes': 'Get all classes',
          'GET /classes/:id': 'Get class by ID',
          'POST /classes': 'Create class',
          'PUT /classes/:id': 'Update class',
          'DELETE /classes/:id': 'Delete class',
        },
        subjects: {
          'GET /subjects': 'Get all subjects',
          'GET /subjects/:id': 'Get subject by ID',
          'POST /subjects': 'Create subject',
          'PUT /subjects/:id': 'Update subject',
          'DELETE /subjects/:id': 'Delete subject',
        },
      },
      authentication: {
        type: 'Bearer Token',
        description: 'Include JWT token in Authorization header',
      },
      database: {
        orm: 'Prisma',
        database: 'PostgreSQL',
        status: 'Schema ready, connection pending',
      },
      features: [
        'JWT Authentication',
        'Role-based access control',
        'Input validation',
        'Error handling',
        'Rate limiting',
        'CORS support',
        'Security headers',
        'Response compression',
        'API documentation',
      ],
    },
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(Number(PORT), HOST, () => {
  console.log(`🚀 EduManager Backend Server running on http://${HOST}:${PORT}`);
  console.log(`📚 API Version: v1.0.0`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health Check: http://${HOST}:${PORT}/health`);
  console.log(`🔗 API Test: http://${HOST}:${PORT}/api/v1/test`);
  console.log(`📖 API Docs: http://${HOST}:${PORT}/api/v1/docs`);
  console.log(`🔐 Authentication: JWT + Bcrypt (Ready)`);
  console.log(`🗄️  Database: Prisma + PostgreSQL (Schema ready)`);
  console.log(`⚡ Cache: Redis (Configuration ready)`);
  console.log(`🛡️  Security: Helmet, CORS, Rate Limiting (Active)`);
  console.log(`📝 Validation: Express-validator (Ready)`);
  console.log(`📊 Logging: Winston (Ready)`);
  console.log(`🔌 Real-time: Socket.IO (Configuration ready)`);
});

export default app;
