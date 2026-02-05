/**
 * Simple AI Routes - Phiên bản đơn giản để test
 */

import { Router, Request, Response } from 'express';
import { aiBridgeService } from '../services/ai-bridge-simple.service';

const router = Router();

/**
 * @route   GET /api/ai/health
 * @desc    Health check cho AI Bridge
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isConnected = await aiBridgeService.checkConnection();
    
    res.json({
      success: true,
      message: 'AI Bridge Service is running',
      data: {
        status: isConnected ? 'connected' : 'disconnected',
        ai_url: aiBridgeService.getAIBaseUrl(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/ai/status
 * @desc    Lấy status của AI System
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isConnected = aiBridgeService.getConnectionStatus();
    
    res.json({
      success: true,
      message: 'AI System status retrieved',
      data: {
        status: isConnected ? 'connected' : 'disconnected',
        ai_url: aiBridgeService.getAIBaseUrl()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/ai/content/lesson
 * @desc    Tạo bài học với AI
 */
router.post('/content/lesson', async (req: Request, res: Response) => {
  try {
    const result = await aiBridgeService.generateLesson(req.body);
    
    res.json({
      success: result.success,
      message: result.success ? 'Lesson generated successfully' : 'Failed to generate lesson',
      data: result
    });
  } catch (error) {
    console.error('Lesson generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/ai/content/exercise
 * @desc    Tạo bài tập với AI
 */
router.post('/content/exercise', async (req: Request, res: Response) => {
  try {
    const result = await aiBridgeService.generateExercise(req.body);
    
    res.json({
      success: result.success,
      message: result.success ? 'Exercise generated successfully' : 'Failed to generate exercise',
      data: result
    });
  } catch (error) {
    console.error('Exercise generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate exercise',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/ai/content/quiz
 * @desc    Tạo quiz với AI
 */
router.post('/content/quiz', async (req: Request, res: Response) => {
  try {
    const result = await aiBridgeService.generateQuiz(req.body);
    
    res.json({
      success: result.success,
      message: result.success ? 'Quiz generated successfully' : 'Failed to generate quiz',
      data: result
    });
  } catch (error) {
    console.error('Quiz generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
