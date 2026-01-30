import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging helper
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    logger.http(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
};

// Add error logging helper
export const logError = (error: Error, req?: any) => {
  const { method, url, ip } = req || {};
  const errorMessage = `${error.message}\n${error.stack}`;
  
  if (req) {
    logger.error(`${method} ${url} - ${ip} - ${errorMessage}`);
  } else {
    logger.error(errorMessage);
  }
};

// Add performance logging helper
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const message = `${operation} completed in ${duration}ms`;
  
  if (metadata) {
    logger.debug(`${message} - ${JSON.stringify(metadata)}`);
  } else {
    logger.debug(message);
  }
};

// Add user action logging helper
export const logUserAction = (userId: number, action: string, resource: string, metadata?: any) => {
  const message = `User ${userId} performed ${action} on ${resource}`;
  
  if (metadata) {
    logger.info(`${message} - ${JSON.stringify(metadata)}`);
  } else {
    logger.info(message);
  }
};

// Add security logging helper
export const logSecurity = (event: string, details: any, severity: 'warn' | 'error' = 'warn') => {
  const message = `Security Event: ${event} - ${JSON.stringify(details)}`;
  
  if (severity === 'error') {
    logger.error(message);
  } else {
    logger.warn(message);
  }
};

export { logger };
export default logger;
