/**
 * Async Handler Middleware
 * Wrapper để xử lý async errors trong Express routes
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper để catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
