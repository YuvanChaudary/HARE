import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRecord, UserProfile, AuthSession, JwtUserPayload } from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  private collectionName = 'users';

  /**
   * Finds a user by unique business email address (case-insensitive).
   */
  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const users = await storage.readCollection<UserRecord>(this.collectionName);
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    return found || null;
  }

  /**
   * Finds a user by unique identifier.
   */
  public async findUserById(userId: string): Promise<UserRecord | null> {
    const users = await storage.readCollection<UserRecord>(this.collectionName);
    const found = users.find((u) => u.user_id === userId);
    return found || null;
  }

  /**
   * Generates a signed, verifiable JSON Web Token (JWT).
   */
  public generateToken(user: UserProfile): { token: string; expires_at_utc: string } {
    const payload: JwtUserPayload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
      org_id: user.organization_id,
      assigned_worksite_id: user.assigned_worksite_id,
    };

    // Calculate expiration timestamp
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    const decoded = jwt.decode(token) as { exp?: number };
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    return { token, expires_at_utc: expiresAt };
  }

  /**
   * Verifies and decodes a signed JWT.
   */
  public verifyToken(token: string): JwtUserPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtUserPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(
          'AUTHENTICATION_REQUIRED',
          'Authentication token has expired. Please log in again.',
          401,
          false
        );
      }
      throw new AppError(
        'AUTHENTICATION_INVALID',
        'Invalid or corrupted authentication token signature.',
        401,
        false
      );
    }
  }

  /**
   * Authenticates user via email and password, issuing a signed AuthSession.
   */
  public async login(email: string, password: string): Promise<AuthSession> {
    if (!email || !password) {
      throw new AppError(
        'INVALID_REQUEST',
        'Email and password are required credentials.',
        400
      );
    }

    const userRecord = await this.findUserByEmail(email);
    if (!userRecord || !userRecord.is_active) {
      // Uniform timing check to prevent account enumeration
      await bcrypt.compare(password, '$2a$10$invalidhashpaddingforconstanttimetestxxxx');
      throw new AppError(
        'AUTHENTICATION_INVALID',
        'Invalid email or password combination.',
        401,
        false
      );
    }

    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      throw new AppError(
        'AUTHENTICATION_INVALID',
        'Invalid email or password combination.',
        401,
        false
      );
    }

    const userProfile: UserProfile = {
      user_id: userRecord.user_id,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role,
      organization_id: userRecord.organization_id,
      assigned_worksite_id: userRecord.assigned_worksite_id,
    };

    const { token, expires_at_utc } = this.generateToken(userProfile);

    return {
      token,
      user: userProfile,
      expires_at_utc,
    };
  }

  /**
   * Retrieves public profile for an authenticated user.
   */
  public async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new AppError('RESOURCE_NOT_FOUND', 'User profile not found.', 404);
    }

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization_id: user.organization_id,
      assigned_worksite_id: user.assigned_worksite_id,
    };
  }
}

export const authService = new AuthService();
