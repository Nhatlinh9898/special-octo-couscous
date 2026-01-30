import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.info('✅ Redis Client Disconnected');
    });

    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('✅ Redis connection verified');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('❌ Redis disconnection failed:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

// Redis utility functions
export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = getRedisClient();
  }

  // Set key with expiration
  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // Get value by key
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  // Delete key
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  // Set hash field
  async hSet(key: string, field: string, value: string): Promise<number> {
    return await this.client.hSet(key, field, value);
  }

  // Get hash field
  async hGet(key: string, field: string): Promise<string | undefined> {
    return await this.client.hGet(key, field);
  }

  // Get all hash fields
  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }

  // Delete hash field
  async hDel(key: string, field: string): Promise<number> {
    return await this.client.hDel(key, field);
  }

  // Add to set
  async sAdd(key: string, member: string): Promise<number> {
    return await this.client.sAdd(key, member);
  }

  // Get all set members
  async sMembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }

  // Remove from set
  async sRem(key: string, member: string): Promise<number> {
    return await this.client.sRem(key, member);
  }

  // Push to list
  async lPush(key: string, element: string): Promise<number> {
    return await this.client.lPush(key, element);
  }

  // Pop from list
  async rPop(key: string): Promise<string | null> {
    return await this.client.rPop(key);
  }

  // Get list length
  async lLen(key: string): Promise<number> {
    return await this.client.lLen(key);
  }

  // Increment value
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  // Increment by value
  async incrBy(key: string, increment: number): Promise<number> {
    return await this.client.incrBy(key, increment);
  }

  // Set with JSON serialization
  async setJSON(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.set(key, jsonString, expireInSeconds);
  }

  // Get with JSON deserialization
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }
}

export const redisService = new RedisService();
export default redisService;
