/**
 * AI Routes - Routes cho AI System integration
 * Kết nối backend với EduManager AI System
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { aiBridgeService } from '../services/ai-bridge.service';
import { logger, logRequest, logUserAction } from '../utils/logger';
import { asyncHandler } from '../middleware/async';

const router = Router();

// Middleware để log tất cả AI requests
router.use(logRequest);

/**
 * @route   GET /api/ai/status
 * @desc    Lấy status của AI System
 * @access  Public
 */
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const isConnected = await aiBridgeService.checkConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'AI System is not available',
        data: {
          status: 'disconnected',
          ai_url: aiBridgeService.getAIBaseUrl()
        }
      });
    }

    const aiStatus = await aiBridgeService.getAIStatus();
    
    res.json({
      success: true,
      message: 'AI System is connected',
      data: {
        status: 'connected',
        ai_url: aiBridgeService.getAIBaseUrl(),
        ...aiStatus
      }
    });
  } catch (error) {
    logger.error('AI Status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   GET /api/ai/health
 * @desc    Health check cho AI integration
 * @access  Public
 */
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const isConnected = aiBridgeService.getConnectionStatus();
  
  res.json({
    success: true,
    message: 'AI Bridge Service is running',
    data: {
      status: isConnected ? 'connected' : 'disconnected',
      ai_url: aiBridgeService.getAIBaseUrl(),
      timestamp: new Date().toISOString()
    }
  });
}));

// ==================== CONTENT GENERATION ROUTES ====================

/**
 * @route   POST /api/ai/content/lesson
 * @desc    Tạo bài học với AI
 * @access  Private
 */
router.post('/content/lesson', [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('subject').optional().isString(),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('duration').optional().isInt({ min: 5, max: 180 }),
  body('objectives').optional().isArray()
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.generateLesson(req.body);
    
    // Log user action
    if (req.user) {
      logUserAction(req.user.id, 'generate_lesson', 'ai_content', {
        topic: req.body.topic,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Lesson generated successfully' : 'Failed to generate lesson',
      data: result
    });
  } catch (error) {
    logger.error('Lesson generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lesson',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/content/exercise
 * @desc    Tạo bài tập với AI
 * @access  Private
 */
router.post('/content/exercise', [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('type').optional().isIn(['practice', 'homework', 'assignment']),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('count').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.generateExercise(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'generate_exercise', 'ai_content', {
        topic: req.body.topic,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Exercise generated successfully' : 'Failed to generate exercise',
      data: result
    });
  } catch (error) {
    logger.error('Exercise generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate exercise',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/content/exam
 * @desc    Tạo bài thi với AI
 * @access  Private
 */
router.post('/content/exam', [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('topics').isArray().withMessage('Topics must be an array'),
  body('duration').isInt({ min: 15, max: 240 }),
  body('question_types').isArray().withMessage('Question types must be an array'),
  body('total_points').isInt({ min: 10, max: 500 })
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.generateExam(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'generate_exam', 'ai_content', {
        subject: req.body.subject,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Exam generated successfully' : 'Failed to generate exam',
      data: result
    });
  } catch (error) {
    logger.error('Exam generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate exam',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/content/quiz
 * @desc    Tạo quiz với AI
 * @access  Private
 */
router.post('/content/quiz', [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('type').optional().isIn(['quick', 'formative', 'summative']),
  body('count').isInt({ min: 1, max: 50 }),
  body('time_limit').isInt({ min: 5, max: 120 })
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.generateQuiz(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'generate_quiz', 'ai_content', {
        topic: req.body.topic,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Quiz generated successfully' : 'Failed to generate quiz',
      data: result
    });
  } catch (error) {
    logger.error('Quiz generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/content/personalize
 * @desc    Cá nhân hóa nội dung với AI
 * @access  Private
 */
router.post('/content/personalize', [
  body('content_id').notEmpty().withMessage('Content ID is required'),
  body('student_profile').isObject().withMessage('Student profile is required'),
  body('learning_style').isIn(['visual', 'auditory', 'kinesthetic', 'reading_writing']),
  body('adaptation_level').isIn(['low', 'medium', 'high'])
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.personalizeContent(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'personalize_content', 'ai_content', {
        content_id: req.body.content_id,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Content personalized successfully' : 'Failed to personalize content',
      data: result
    });
  } catch (error) {
    logger.error('Content personalization failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to personalize content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/content/assess-quality
 * @desc    Đánh giá chất lượng nội dung với AI
 * @access  Private
 */
router.post('/content/assess-quality', [
  body('content').notEmpty().withMessage('Content is required'),
  body('content_type').isIn(['lesson', 'exercise', 'exam', 'quiz']),
  body('criteria').optional().isArray()
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.assessContentQuality(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'assess_quality', 'ai_content', {
        content_type: req.body.content_type,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Quality assessment completed' : 'Failed to assess quality',
      data: result
    });
  } catch (error) {
    logger.error('Quality assessment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assess quality',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   GET /api/ai/content/templates
 * @desc    Lấy danh sách templates
 * @access  Private
 */
router.get('/content/templates', asyncHandler(async (req: Request, res: Response) => {
  try {
    const templates = await aiBridgeService.getContentTemplates();
    
    res.json({
      success: true,
      message: 'Templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    logger.error('Get templates failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// ==================== ACADEMIC ROUTES ====================

/**
 * @route   GET /api/ai/courses/:code
 * @desc    Lấy thông tin khóa học
 * @access  Private
 */
router.get('/courses/:code', [
  param('code').notEmpty().withMessage('Course code is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.getCourseInfo(req.params.code);
    
    res.json({
      success: result.success,
      message: result.success ? 'Course info retrieved successfully' : 'Failed to get course info',
      data: result
    });
  } catch (error) {
    logger.error('Get course info failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course info',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   GET /api/ai/courses
 * @desc    Lấy danh sách khóa học
 * @access  Private
 */
router.get('/courses', [
  query('subject').optional().isString(),
  query('level').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const filters = {
      subject: req.query.subject as string,
      level: req.query.level as string,
      page: parseInt(req.query.page as string || '1'),
      limit: parseInt(req.query.limit as string || '20')
    };

    const result = await aiBridgeService.getCourseList(filters);
    
    res.json({
      success: result.success,
      message: result.success ? 'Course list retrieved successfully' : 'Failed to get course list',
      data: result
    });
  } catch (error) {
    logger.error('Get course list failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// ==================== STUDENT ROUTES ====================

/**
 * @route   GET /api/ai/students/:id/info
 * @desc    Lấy thông tin sinh viên
 * @access  Private
 */
router.get('/students/:id/info', [
  param('id').notEmpty().withMessage('Student ID is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.getStudentInfo(req.params.id);
    
    res.json({
      success: result.success,
      message: result.success ? 'Student info retrieved successfully' : 'Failed to get student info',
      data: result
    });
  } catch (error) {
    logger.error('Get student info failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student info',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   GET /api/ai/students/:id/progress
 * @desc    Lấy tiến độ học tập sinh viên
 * @access  Private
 */
router.get('/students/:id/progress', [
  param('id').notEmpty().withMessage('Student ID is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.getStudentProgress(req.params.id);
    
    res.json({
      success: result.success,
      message: result.success ? 'Student progress retrieved successfully' : 'Failed to get student progress',
      data: result
    });
  } catch (error) {
    logger.error('Get student progress failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// ==================== SERVICENEXUS ROUTES ====================

/**
 * @route   POST /api/ai/education/analyze
 * @desc    Phân tích dữ liệu giáo dục
 * @access  Private
 */
router.post('/education/analyze', [
  body('data_type').notEmpty().withMessage('Data type is required'),
  body('data').notEmpty().withMessage('Data is required'),
  body('analysis_type').notEmpty().withMessage('Analysis type is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.analyzeEducationData(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'analyze_education_data', 'ai_analysis', {
        data_type: req.body.data_type,
        analysis_type: req.body.analysis_type,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Data analysis completed' : 'Failed to analyze data',
      data: result
    });
  } catch (error) {
    logger.error('Education data analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze education data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/education/workflow
 * @desc    Thực thi workflow
 * @access  Private
 */
router.post('/education/workflow', [
  body('workflow_name').notEmpty().withMessage('Workflow name is required'),
  body('parameters').isObject().withMessage('Parameters are required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.executeWorkflow(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'execute_workflow', 'ai_workflow', {
        workflow_name: req.body.workflow_name,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Workflow executed successfully' : 'Failed to execute workflow',
      data: result
    });
  } catch (error) {
    logger.error('Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute workflow',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/education/visualize
 * @desc    Tạo visualization
 * @access  Private
 */
router.post('/education/visualize', [
  body('data').notEmpty().withMessage('Data is required'),
  body('chart_type').isIn(['bar', 'line', 'pie', 'scatter', 'heatmap', 'histogram', 'box']),
  body('options').optional().isObject()
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.generateVisualization(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'generate_visualization', 'ai_visualization', {
        chart_type: req.body.chart_type,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Visualization generated successfully' : 'Failed to generate visualization',
      data: result
    });
  } catch (error) {
    logger.error('Visualization generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate visualization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   POST /api/ai/education/big-data
 * @desc    Xử lý big data
 * @access  Private
 */
router.post('/education/big-data', [
  body('data_source').notEmpty().withMessage('Data source is required'),
  body('processing_type').notEmpty().withMessage('Processing type is required'),
  body('parameters').isObject().withMessage('Parameters are required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const result = await aiBridgeService.processBigData(req.body);
    
    if (req.user) {
      logUserAction(req.user.id, 'process_big_data', 'ai_big_data', {
        data_source: req.body.data_source,
        processing_type: req.body.processing_type,
        success: result.success
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Big data processing completed' : 'Failed to process big data',
      data: result
    });
  } catch (error) {
    logger.error('Big data processing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process big data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route   GET /api/ai/integration/status
 * @desc    Lấy integration status
 * @access  Private
 */
router.get('/integration/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const status = await aiBridgeService.getIntegrationStatus();
    
    res.json({
      success: true,
      message: 'Integration status retrieved successfully',
      data: status
    });
  } catch (error) {
    logger.error('Get integration status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get integration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
