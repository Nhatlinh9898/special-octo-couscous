/**
 * Simple AI Bridge Service - Phiên bản đơn giản để fix lỗi
 */

import axios from 'axios';
import { logger } from '../utils/logger';

export interface AIRequest {
  task: string;
  data: Record<string, any>;
  context?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  response?: any;
  confidence?: number;
  processing_time?: number;
  suggestions?: string[];
  error?: string;
}

export interface ContentGenerationRequest {
  topic: string;
  subject?: string;
  level?: string;
  duration?: number;
  objectives?: string[];
  type?: string;
  difficulty?: string;
  count?: number;
}

class SimpleAIBridgeService {
  private aiBaseUrl: string;
  private isConnected: boolean = false;

  constructor() {
    this.aiBaseUrl = process.env.AI_BASE_URL || 'http://localhost:8000';
  }

  /**
   * Kiểm tra kết nối với AI System
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.aiBaseUrl}/health`);
      this.isConnected = response.status === 200;
      
      if (this.isConnected) {
        logger.info('AI System connected successfully');
      }
      
      return this.isConnected;
    } catch (error) {
      logger.error('Failed to connect to AI System:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Lấy status của AI System
   */
  async getAIStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.aiBaseUrl}/api/v1/integration/status`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get AI status:', error);
      throw new Error('Unable to fetch AI status');
    }
  }

  /**
   * Tạo bài học
   */
  async generateLesson(request: ContentGenerationRequest): Promise<AIResponse> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
      }

      const response = await axios.post(
        `${this.aiBaseUrl}/api/v1/content/generate/lesson`,
        {
          task: 'generate_lesson',
          data: request
        }
      );

      return response.data as AIResponse;
    } catch (error: any) {
      logger.error('Lesson generation failed:', error);
      return {
        success: false,
        error: error.message || 'Lesson generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Tạo bài tập
   */
  async generateExercise(request: ContentGenerationRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/api/v1/content/generate/exercise`,
        {
          task: 'generate_exercise',
          data: request
        }
      );

      return response.data as AIResponse;
    } catch (error: any) {
      logger.error('Exercise generation failed:', error);
      return {
        success: false,
        error: error.message || 'Exercise generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Tạo quiz
   */
  async generateQuiz(request: {
    topic: string;
    type: string;
    count: number;
    time_limit: number;
  }): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/api/v1/content/generate/quiz`,
        {
          task: 'generate_quiz',
          data: request
        }
      );

      return response.data as AIResponse;
    } catch (error: any) {
      logger.error('Quiz generation failed:', error);
      return {
        success: false,
        error: error.message || 'Quiz generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Lấy connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Lấy AI base URL
   */
  getAIBaseUrl(): string {
    return this.aiBaseUrl;
  }
}

// Export singleton instance
export const aiBridgeService = new SimpleAIBridgeService();
export default aiBridgeService;
