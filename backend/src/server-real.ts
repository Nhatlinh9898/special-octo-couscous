import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

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

// Import routes (commented out until database is ready)
// import authRoutes from '@/routes/auth';
// import userRoutes from '@/routes/users-real';
// import schoolRoutes from '@/routes/schools-real';

// API Routes (will be enabled when database is ready)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/schools', schoolRoutes);

// Placeholder routes for testing
app.get('/api/v1/users', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users API - Database integration pending',
    data: {
      endpoints: [
        'GET /api/v1/users/profile',
        'PUT /api/v1/users/profile',
        'PUT /api/v1/users/password',
        'GET /api/v1/users',
        'GET /api/v1/users/:id',
        'PUT /api/v1/users/:id',
        'DELETE /api/v1/users/:id',
      ],
    },
  });
});

app.get('/api/v1/schools', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Schools API - Database integration pending',
    data: {
      endpoints: [
        'GET /api/v1/schools',
        'GET /api/v1/schools/:id',
        'POST /api/v1/schools',
        'PUT /api/v1/schools/:id',
        'DELETE /api/v1/schools/:id',
        'GET /api/v1/schools/:id/statistics',
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
      },
      authentication: {
        type: 'Bearer Token',
        description: 'Include JWT token in Authorization header',
      },
    },
  });
});

// 404 handler
app.use('*', notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(Number(PORT), HOST, () => {
  console.log(`🚀 EduManager Backend Server running on http://${HOST}:${PORT}`);
  console.log(`📚 API Version: v1.0.0`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health Check: http://${HOST}:${PORT}/health`);
  console.log(`🔗 API Test: http://${HOST}:${PORT}/api/v1/test`);
  console.log(`📖 API Docs: http://${HOST}:${PORT}/api/v1/docs`);
  console.log(`🔐 Authentication: Ready (JWT)`);
  console.log(`🗄️  Database: Prisma + PostgreSQL (pending connection)`);
  console.log(`⚡ Cache: Redis (pending connection)`);
});

export default app;
