/**
 * Test AI Routes - Bản test đơn giản không cần types phức tạp
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/ai/health
 */
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI Bridge Service is running',
    data: {
      status: 'connected',
      ai_url: 'http://localhost:8000',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   POST /api/ai/content/lesson
 */
router.post('/content/lesson', async (req: Request, res: Response) => {
  try {
    // Simple forward to AI System
    const axios = require('axios');
    const response = await axios.post('http://localhost:8000/api/v1/content/generate/lesson', req.body);
    
    res.json({
      success: true,
      message: 'Lesson generated successfully',
      data: response.data
    });
  } catch (error: any) {
    console.error('Lesson generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lesson',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;
