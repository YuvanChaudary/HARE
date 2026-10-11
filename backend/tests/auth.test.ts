import { describe, it, expect } from 'vitest';
import { authService } from '../src/auth/authService.js';
import { requireRole, requireWorksiteScope } from '../src/auth/authMiddleware.js';
import { AppError } from '../src/middleware/errorHandler.js';
import { createApp } from '../src/app.js';
import { Request, Response } from 'express';
import request from 'supertest';

describe('Phase 2: Authentication & Authorization Foundation', () => {
  const validPassword = 'HareSafety#2026';

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & LOGIN TESTS
  // --------------------------------------------------------------------------
  describe('Credential Verification & Login', () => {
    it('Authenticates Rahul Kumar (Supervisor) with valid credentials', async () => {
      const session = await authService.login('rahul@site.hare.local', validPassword);
      expect(session.token).toBeDefined();
      expect(session.user.user_id).toBe('usr_sup_rahul');
      expect(session.user.role).toBe('SUPERVISOR');
      expect(session.user.assigned_worksite_id).toBe('WS-BLR-NORTH-04');
    });

    it('Authenticates Ananya Rao (Safety Manager) with cross-site access', async () => {
      const session = await authService.login('ananya@safety.hare.local', validPassword);
      expect(session.user.role).toBe('SAFETY_MANAGER');
      expect(session.user.assigned_worksite_id).toBe('ALL');
    });

    it('Authenticates Vikram Singh (Admin) with organizational authority', async () => {
      const session = await authService.login('vikram@admin.hare.local', validPassword);
      expect(session.user.role).toBe('ADMIN');
      expect(session.user.assigned_worksite_id).toBe('ALL');
    });

    it('Rejects invalid password with 401 AUTHENTICATION_INVALID', async () => {
      await expect(
        authService.login('rahul@site.hare.local', 'WrongPassword123!')
      ).rejects.toThrowError(AppError);

      try {
        await authService.login('rahul@site.hare.local', 'WrongPassword123!');
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('AUTHENTICATION_INVALID');
      }
    });

    it('Rejects unknown email with 401 AUTHENTICATION_INVALID (constant-time defense)', async () => {
      try {
        await authService.login('nonexistent@hare.local', validPassword);
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('AUTHENTICATION_INVALID');
      }
    });

    it('Rejects missing credentials with 400 INVALID_REQUEST', async () => {
      try {
        await authService.login('', '');
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('INVALID_REQUEST');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. JWT TOKEN VALIDATION & TAMPER DEFENSE
  // --------------------------------------------------------------------------
  describe('JWT Verification & Tamper Resistance', () => {
    it('Decodes a freshly generated token with exact claims', async () => {
      const session = await authService.login('rahul@site.hare.local', validPassword);
      const payload = authService.verifyToken(session.token);

      expect(payload.sub).toBe('usr_sup_rahul');
      expect(payload.role).toBe('SUPERVISOR');
      expect(payload.assigned_worksite_id).toBe('WS-BLR-NORTH-04');
    });

    it('Rejects tampered or corrupted JWTs with 401 AUTHENTICATION_INVALID', () => {
      const corruptedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.signature';
      expect(() => authService.verifyToken(corruptedToken)).toThrowError(AppError);

      try {
        authService.verifyToken(corruptedToken);
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('AUTHENTICATION_INVALID');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. ROLE-BASED ACCESS CONTROL (RBAC)
  // --------------------------------------------------------------------------
  describe('RBAC Role Enforcement', () => {
    it('Allows user holding permitted role to proceed', () => {
      const mockReq = {
        user: { sub: 'usr_mgr_ananya', role: 'SAFETY_MANAGER', org_id: 'org_infra_corp' },
      } as Request;
      const mockRes = {} as Response;
      let nextCalled = false;

      const middleware = requireRole('SAFETY_MANAGER', 'ADMIN');
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('Rejects user with insufficient role with 403 AUTHORIZATION_DENIED', () => {
      const mockReq = {
        user: { sub: 'usr_sup_rahul', role: 'SUPERVISOR', org_id: 'org_infra_corp' },
      } as Request;
      const mockRes = {} as Response;

      const middleware = requireRole('SAFETY_MANAGER', 'ADMIN');
      expect(() => middleware(mockReq, mockRes, () => {})).toThrowError(AppError);

      try {
        middleware(mockReq, mockRes, () => {});
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('AUTHORIZATION_DENIED');
        expect(err.details?.user_role).toBe('SUPERVISOR');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. WORKSITE SCOPE CONFINEMENT
  // --------------------------------------------------------------------------
  describe('Worksite Scope Confinement', () => {
    it('Permits supervisor to access their designated worksite', () => {
      const mockReq = {
        user: {
          sub: 'usr_sup_rahul',
          role: 'SUPERVISOR',
          assigned_worksite_id: 'WS-BLR-NORTH-04',
        },
        params: { worksiteId: 'WS-BLR-NORTH-04' },
      } as unknown as Request;
      const mockRes = {} as Response;
      let nextCalled = false;

      const middleware = requireWorksiteScope('params', 'worksiteId');
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('Blocks supervisor from accessing foreign worksite with 403 RESOURCE_ACCESS_DENIED', () => {
      const mockReq = {
        user: {
          sub: 'usr_sup_rahul',
          role: 'SUPERVISOR',
          assigned_worksite_id: 'WS-BLR-NORTH-04',
        },
        params: { worksiteId: 'WS-BLR-SOUTH-02' },
      } as unknown as Request;
      const mockRes = {} as Response;

      const middleware = requireWorksiteScope('params', 'worksiteId');
      expect(() => middleware(mockReq, mockRes, () => {})).toThrowError(AppError);

      try {
        middleware(mockReq, mockRes, () => {});
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('RESOURCE_ACCESS_DENIED');
        expect(err.details?.target_worksite_id).toBe('WS-BLR-SOUTH-02');
      }
    });

    it('Permits Safety Manager (assigned_worksite_id = ALL) to access any worksite', () => {
      const mockReq = {
        user: {
          sub: 'usr_mgr_ananya',
          role: 'SAFETY_MANAGER',
          assigned_worksite_id: 'ALL',
        },
        params: { worksiteId: 'WS-BLR-SOUTH-02' },
      } as unknown as Request;
      const mockRes = {} as Response;
      let nextCalled = false;

      const middleware = requireWorksiteScope('params', 'worksiteId');
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. HTTP ROUTE INTEGRATION & ERROR ENVELOPE CONFORMITY (supertest)
  // --------------------------------------------------------------------------
  describe('HTTP Route Integration & Error Envelope Conformity', () => {
    const app = createApp();

    it('POST /api/v1/auth/login returns 200 with standard single resource envelope', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'rahul@site.hare.local', password: validPassword });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('SUPERVISOR');
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.request_id).toBeDefined();
      expect(res.body.meta.timestamp).toBeDefined();
    });

    it('POST /api/v1/auth/login with bad password returns 401 with standard error envelope', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'rahul@site.hare.local', password: 'BadPassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('AUTHENTICATION_INVALID');
      expect(res.body.error.request_id).toBeDefined();
      expect(res.body.error.timestamp).toBeDefined();
      expect(res.body.error.retryable).toBe(false);
    });

    it('GET /api/v1/auth/me returns 401 AUTHENTICATION_REQUIRED without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('GET /api/v1/auth/me returns 200 with profile when valid token provided', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'rahul@site.hare.local', password: validPassword });

      const token = loginRes.body.data.token;

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user_id).toBe('usr_sup_rahul');
      expect(meRes.body.data.email).toBe('rahul@site.hare.local');
    });

    it('Enforces worksite scope via HTTP: Rahul gets 200 on WS-BLR-NORTH-04 and 403 on WS-BLR-SOUTH-02', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'rahul@site.hare.local', password: validPassword });

      const token = loginRes.body.data.token;

      // Access own worksite
      const allowedRes = await request(app)
        .get('/api/v1/auth/test-scope/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${token}`);

      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.worksite_id).toBe('WS-BLR-NORTH-04');

      // Access foreign worksite
      const forbiddenRes = await request(app)
        .get('/api/v1/auth/test-scope/WS-BLR-SOUTH-02')
        .set('Authorization', `Bearer ${token}`);

      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body.error).toBeDefined();
      expect(forbiddenRes.body.error.code).toBe('RESOURCE_ACCESS_DENIED');
      expect(forbiddenRes.body.error.details.target_worksite_id).toBe('WS-BLR-SOUTH-02');
    });

    it('Safety Manager (ALL) accesses any worksite via HTTP with 200 OK', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ananya@safety.hare.local', password: validPassword });

      const token = loginRes.body.data.token;

      const allowedRes = await request(app)
        .get('/api/v1/auth/test-scope/WS-BLR-SOUTH-02')
        .set('Authorization', `Bearer ${token}`);

      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.worksite_id).toBe('WS-BLR-SOUTH-02');
    });
  });
});
