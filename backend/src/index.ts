import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';

// Routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import schoolRoutes from '@/routes/schools';
import ktxRoutes from '@/routes/ktx';
import hotelRoutes from '@/routes/hotel';
import { classes, students, subjects, schedules, lms, exams, grades, attendance, finance, messages, notifications } from '@/routes/placeholder';
import aiRoutes from '@/routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/ready', (req, res) => {
  // Check if all services are ready
  res.status(200).json({
    status: 'READY',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // TODO: Check actual DB connection
      redis: 'connected', // TODO: Check actual Redis connection
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/ktx', ktxRoutes);
app.use('/api/v1/hotel', hotelRoutes);
app.use('/api/v1/classes', classes);
app.use('/api/v1/students', students);
app.use('/api/v1/subjects', subjects);
app.use('/api/v1/schedules', schedules);
app.use('/api/v1/lms', lms);
app.use('/api/v1/exams', exams);
app.use('/api/v1/grades', grades);
app.use('/api/v1/attendance', attendance);
app.use('/api/v1/finance', finance);
app.use('/api/v1/messages', messages);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/ai', aiRoutes);

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Handle real-time notifications
  socket.on('send-notification', (data: { userId: string; notification: any }) => {
    const { userId, notification } = data;
    io.to(`user-${userId}`).emit('notification', notification);
  });

  // Handle real-time messages
  socket.on('send-message', (data: { receiverId: string; message: any }) => {
    const { receiverId, message } = data;
    io.to(`user-${receiverId}`).emit('new-message', message);
  });

  // Handle attendance updates
  socket.on('attendance-update', (data: { sessionId: number; studentId: number; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes?: string }) => {
    socket.broadcast.emit('attendance-changed', data);
  });

  // Handle grade updates
  socket.on('grade-update', (data: { studentId: number; grade: any }) => {
    const { studentId, grade } = data;
    io.to(`user-${studentId}`).emit('new-grade', grade);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start server
    server.listen(Number(PORT), HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📚 EduManager Backend API v1.0.0`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export { app, io };
