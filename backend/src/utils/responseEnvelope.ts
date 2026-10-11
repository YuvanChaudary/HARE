import { Request } from 'express';
import { ApiResponse } from '@hare/shared';

export function sendSuccess<T>(
  req: Request,
  data: T,
  metaExtra?: { resource_version?: number; count?: number }
): ApiResponse<T> {
  return {
    data,
    meta: {
      request_id: req.requestId || 'req_system',
      timestamp: new Date().toISOString(),
      ...metaExtra,
    },
  };
}
