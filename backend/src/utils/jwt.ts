import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  schoolId: number;
  iat?: number;
  exp?: number;
}

export const generateToken = (
  userId: number,
  email: string,
  role: string,
  schoolId: number
): string => {
  try {
    const payload: JWTPayload = {
      userId,
      email,
      role,
      schoolId,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'edumanager',
      audience: 'edumanager-users',
    } as jwt.SignOptions);
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate token');
  }
};

export const generateRefreshToken = (userId: number): string => {
  try {
    const payload = { userId };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'edumanager',
      audience: 'edumanager-refresh',
    } as jwt.SignOptions);
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'edumanager',
      audience: 'edumanager-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string): { userId: number } => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'edumanager',
      audience: 'edumanager-refresh',
    }) as { userId: number };

    return decoded;
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    throw new Error('Invalid refresh token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error('Error decoding JWT token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    logger.error('Error checking token expiration:', error);
    return true;
  }
};
