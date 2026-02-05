/**
 * AI Bridge Service - Kết nối Backend TypeScript với Hệ thống AI Python
 * Bridge service để giao tiếp với EduManager AI System
 */

import * as axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

type AxiosInstance = ReturnType<typeof axios.create>;
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}

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

export interface PersonalizationRequest {
  content_id: string;
  student_profile: {
    level: string;
    interests: string[];
    learning_style: string;
  };
  learning_style: string;
  adaptation_level: string;
}

export interface QualityAssessmentRequest {
  content: string;
  content_type: string;
  criteria?: string[];
}

class AIBridgeService {
  private aiClient: AxiosInstance;
  private aiBaseUrl: string;
  private isConnected: boolean = false;

  constructor() {
    this.aiBaseUrl = config.ai.baseUrl || 'http://localhost:8000';
    
    this.aiClient = axios.create({
      baseURL: this.aiBaseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EduManager-Backend/1.0.0'
      }
    });

    // Request interceptor
    this.aiClient.interceptors.request.use(
      (config) => {
        logger.info(`AI Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('AI Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.aiClient.interceptors.response.use(
      (response) => {
        logger.info(`AI Response: ${response.status} ${response.config.url}`, {
          duration: response.headers['x-processing-time']
        });
        return response;
      },
      (error) => {
        logger.error('AI Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Kiểm tra kết nối với AI System
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.aiClient.get('/health');
      this.isConnected = response.status === 200;
      
      if (this.isConnected) {
        logger.info('AI System connected successfully', {
          version: response.data.version,
          environment: response.data.environment
        });
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
      const response: AxiosResponse = await this.aiClient.get('/api/v1/agents/status');
      return response.data;
    } catch (error) {
      logger.error('Failed to get AI status:', error);
      throw new Error('Unable to fetch AI status');
    }
  }

  /**
   * Gửi request đến AI Agent
   */
  async callAIAgent(agentName: string, request: AIRequest): Promise<AIResponse> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
      }

      const response: AxiosResponse<AIResponse> = await this.aiClient.post(
        `/api/v1/agents/${agentName}`,
        request
      );

      return response.data;
    } catch (error) {
      logger.error(`AI Agent call failed (${agentName}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  /**
   * Content Generation Methods
   */

  /**
   * Tạo bài học
   */
  async generateLesson(request: ContentGenerationRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/generate/lesson',
        request
      );

      return response.data;
    } catch (error) {
      logger.error('Lesson generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lesson generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Tạo bài tập
   */
  async generateExercise(request: ContentGenerationRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/generate/exercise',
        {
          task: 'generate_exercise',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Exercise generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Exercise generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Tạo bài thi
   */
  async generateExam(request: {
    subject: string;
    topics: string[];
    duration: number;
    question_types: string[];
    total_points: number;
  }): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/generate/exam',
        {
          task: 'generate_exam',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Exam generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Exam generation failed',
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
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/generate/quiz',
        {
          task: 'generate_quiz',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Quiz generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quiz generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Cá nhân hóa nội dung
   */
  async personalizeContent(request: PersonalizationRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/personalize',
        {
          task: 'personalize_content',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Content personalization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content personalization failed',
        confidence: 0
      };
    }
  }

  /**
   * Đánh giá chất lượng nội dung
   */
  async assessContentQuality(request: QualityAssessmentRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/content/assess-quality',
        {
          task: 'assess_quality',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Quality assessment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quality assessment failed',
        confidence: 0
      };
    }
  }

  /**
   * Lấy danh sách templates
   */
  async getContentTemplates(): Promise<any> {
    try {
      const response: AxiosResponse = await this.aiClient.get(
        '/api/v1/content/templates'
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get content templates:', error);
      throw new Error('Unable to fetch content templates');
    }
  }

  /**
   * ServiceNexus Integration Methods
   */

  /**
   * Phân tích dữ liệu giáo dục
   */
  async analyzeEducationData(request: {
    data_type: string;
    data: any;
    analysis_type: string;
  }): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/education/data-analysis',
        {
          task: 'analyze_data',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Education data analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Data analysis failed',
        confidence: 0
      };
    }
  }

  /**
   * Thực thi workflow
   */
  async executeWorkflow(request: {
    workflow_name: string;
    parameters: Record<string, any>;
  }): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/education/workflow',
        {
          task: 'execute_workflow',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Workflow execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed',
        confidence: 0
      };
    }
  }

  /**
   * Tạo visualization
   */
  async generateVisualization(request: {
    data: any;
    chart_type: string;
    options?: Record<string, any>;
  }): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/education/visualization',
        {
          task: 'generate_visualization',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Visualization generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Visualization generation failed',
        confidence: 0
      };
    }
  }

  /**
   * Xử lý big data
   */
  async processBigData(request: {
    data_source: string;
    processing_type: string;
    parameters: Record<string, any>;
  }): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/education/big-data',
        {
          task: 'process_big_data',
          data: request
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Big data processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Big data processing failed',
        confidence: 0
      };
    }
  }

  /**
   * Lấy integration status
   */
  async getIntegrationStatus(): Promise<any> {
    try {
      const response: AxiosResponse = await this.aiClient.get(
        '/api/v1/integration/status'
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get integration status:', error);
      throw new Error('Unable to fetch integration status');
    }
  }

  /**
   * Academic Agent Methods
   */

  /**
   * Lấy thông tin khóa học
   */
  async getCourseInfo(courseCode: string): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/agents/academic',
        {
          task: 'get_course_info',
          data: { course_code: courseCode }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Get course info failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get course info failed',
        confidence: 0
      };
    }
  }

  /**
   * Lấy danh sách khóa học
   */
  async getCourseList(filters?: Record<string, any>): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/agents/academic',
        {
          task: 'get_course_list',
          data: { filters: filters || {} }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Get course list failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get course list failed',
        confidence: 0
      };
    }
  }

  /**
   * Student Agent Methods
   */

  /**
   * Lấy thông tin sinh viên
   */
  async getStudentInfo(studentId: string): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/agents/student',
        {
          task: 'get_student_info',
          data: { student_id: studentId }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Get student info failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get student info failed',
        confidence: 0
      };
    }
  }

  /**
   * Lấy tiến độ học tập
   */
  async getStudentProgress(studentId: string): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await this.aiClient.post(
        '/api/v1/agents/student',
        {
          task: 'get_progress',
          data: { student_id: studentId }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Get student progress failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get student progress failed',
        confidence: 0
      };
    }
  }

  /**
   * Utility Methods
   */

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

  /**
   * Reset connection
   */
  async resetConnection(): Promise<boolean> {
    this.isConnected = false;
    return await this.checkConnection();
  }
}

// Export singleton instance
export const aiBridgeService = new AIBridgeService();
export default aiBridgeService;
