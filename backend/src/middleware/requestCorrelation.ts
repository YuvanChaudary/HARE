import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      correlationId: string;
    }
  }
}

/**
 * Middleware: Attaches request_id and correlation_id matching docs/70_API_CONTRACTS.md
 */
export function requestCorrelation(req: Request, res: Response, next: NextFunction): void {
  const incomingReqId = req.header('X-Request-Id');
  const incomingCorrId = req.header('X-Correlation-Id');

  req.requestId = incomingReqId || `req_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  req.correlationId = incomingCorrId || `corr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  res.setHeader('X-Request-Id', req.requestId);
  res.setHeader('X-Correlation-Id', req.correlationId);

  next();
}
