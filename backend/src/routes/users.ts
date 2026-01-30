import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Placeholder routes - will be implemented later
router.get('/', asyncHandler(async (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'Users retrieved successfully',
  });
}));

export default router;
