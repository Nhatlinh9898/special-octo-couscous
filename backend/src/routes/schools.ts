import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'Schools retrieved successfully',
  });
}));

export default router;
