import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`);
  if (ENV.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
