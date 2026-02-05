/**
 * Configuration file for EduManager Backend
 * Cấu hình hệ thống bao gồm AI integration
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface AIConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
  logLevel: string;
}

export const config = {
  // App configuration
  app: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    logLevel: process.env.LOG_LEVEL || 'info'
  } as AppConfig,

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'edumanager',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true'
  } as DatabaseConfig,

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  } as RedisConfig,

  // AI System configuration
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'), // 30 seconds
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000') // 1 second
  } as AIConfig,

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as JWTConfig,

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  } as EmailConfig,

  // File upload configuration
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(','),
    destination: process.env.UPLOAD_DESTINATION || './uploads'
  } as UploadConfig,

  // External services
  services: {
    // Ollama configuration
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3:8b-instruct'
    },

    // OpenAI configuration
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4'
    },

    // Anthropic configuration
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
    }
  }
};

// Validation
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate AI configuration
  if (config.app.nodeEnv === 'production' && !process.env.AI_BASE_URL) {
    console.warn('Warning: AI_BASE_URL not set in production environment');
  }

  // Validate database configuration
  if (config.app.nodeEnv === 'production') {
    if (!config.database.password) {
      throw new Error('Database password is required in production');
    }
    if (!config.database.ssl) {
      console.warn('Warning: Database SSL is disabled in production');
    }
  }
};

export default config;
