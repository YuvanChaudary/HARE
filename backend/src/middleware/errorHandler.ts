import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@hare/shared';

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public retryable: boolean;
  public details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    retryable = false,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Global Error Handler Middleware
 * Strict adherence to docs/79_ERROR_CONTRACTS.md
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const retryable = isAppError ? err.retryable : false;
  const message = isAppError ? err.message : 'An unexpected internal error occurred.';

  if (statusCode === 500) {
    console.error(`[CRITICAL_500] ${req.method} ${req.url}:`, err);
  }

  const responsePayload: ApiErrorResponse = {
    error: {
      code: errorCode,
      message,
      request_id: req.requestId || 'req_unknown',
      correlation_id: req.correlationId || 'corr_unknown',
      timestamp: new Date().toISOString(),
      retryable,
      ...(isAppError && err.details ? { details: err.details } : {}),
    },
  };

  res.status(statusCode).json(responsePayload);
}
