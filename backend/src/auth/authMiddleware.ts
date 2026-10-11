import { Request, Response, NextFunction } from 'express';
import { JwtUserPayload, UserRole } from '@hare/shared';
import { authService } from './authService.js';
import { AppError } from '../middleware/errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Enforces "WHO ARE YOU?" via cryptographically verified Bearer JWT.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      'Missing Authorization header. Bearer token required.',
      401,
      false
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      'Malformed Authorization header. Format must be "Bearer <token>".',
      401,
      false
    );
  }

  const token = parts[1];
  const payload = authService.verifyToken(token);
  req.user = payload;

  next();
}

/**
 * Role-Based Authorization Middleware
 * Enforces "WHAT ARE YOU PERMITTED TO DO?" by checking user role against allowed roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        'AUTHENTICATION_REQUIRED',
        'Authentication context missing.',
        401,
        false
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        `Forbidden: Role '${req.user.role}' lacks the required privileges for this action.`,
        403,
        false,
        {
          required_roles: allowedRoles,
          user_role: req.user.role,
        }
      );
    }

    next();
  };
}

/**
 * Worksite Scoping Middleware
 * Strictly confines frontline supervisors to their assigned worksite.
 * Admins and Safety Managers with assigned_worksite_id === 'ALL' bypass single-site confinement.
 */
export function requireWorksiteScope(
  source: 'params' | 'query' | 'body' = 'params',
  fieldName = 'worksiteId'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication context missing.', 401);
    }

    // Cross-site roles (ADMIN, SAFETY_MANAGER with 'ALL')
    if (req.user.assigned_worksite_id === 'ALL') {
      return next();
    }

    let targetWorksite: string | undefined;
    if (source === 'params') {
      targetWorksite = String(req.params[fieldName]);
    } else if (source === 'query') {
      targetWorksite = String(req.query[fieldName]);
    } else if (source === 'body') {
      targetWorksite = req.body?.[fieldName] ? String(req.body[fieldName]) : undefined;
    }

    if (!targetWorksite) {
      return next(); // If no worksite specified in request, let downstream validator handle missing parameter
    }

    if (req.user.assigned_worksite_id !== targetWorksite) {
      throw new AppError(
        'RESOURCE_ACCESS_DENIED',
        `Forbidden: You are assigned to worksite '${req.user.assigned_worksite_id}' and cannot access '${targetWorksite}'.`,
        403,
        false,
        {
          assigned_worksite_id: req.user.assigned_worksite_id,
          target_worksite_id: targetWorksite,
        }
      );
    }

    next();
  };
}

/**
 * Organization Tenant Boundary Middleware
 * Prevents cross-tenant access under all circumstances (docs/83_AUTHORIZATION.md).
 */
export function requireOrgScope(
  source: 'params' | 'query' | 'body' = 'params',
  fieldName = 'orgId'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication context missing.', 401);
    }

    let targetOrg: string | undefined;
    if (source === 'params') {
      targetOrg = String(req.params[fieldName]);
    } else if (source === 'query') {
      targetOrg = String(req.query[fieldName]);
    } else if (source === 'body') {
      targetOrg = req.body?.[fieldName] ? String(req.body[fieldName]) : undefined;
    }

    if (!targetOrg) {
      return next();
    }

    if (req.user.org_id !== targetOrg) {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        'Forbidden: Cross-tenant data access is strictly prohibited.',
        403,
        false,
        {
          user_org_id: req.user.org_id,
          target_org_id: targetOrg,
        }
      );
    }

    next();
  };
}
