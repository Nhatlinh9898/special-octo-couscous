import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const createRoute = () => {
  const router = Router();
  
  router.get('/', asyncHandler(async (_req: any, res: any) => {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Data retrieved successfully',
    });
  }));
  
  return router;
};

// Create all placeholder routes
export const classes = createRoute();
export const students = createRoute();
export const subjects = createRoute();
export const schedules = createRoute();
export const lms = createRoute();
export const exams = createRoute();
export const grades = createRoute();
export const attendance = createRoute();
export const finance = createRoute();
export const messages = createRoute();
export const notifications = createRoute();
export const ai = createRoute();
