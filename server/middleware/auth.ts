import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ngtc-enterprise-jwt-super-secret-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ngtc-enterprise-refresh-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EMPLOYEE' | string;
  roleId: string;
  roleName: string;
  roleCode: string;
  permissions: string[];
  branchId: string;
  branchName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// In-Memory Login Rate Limiter (Brute Force Protection)
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, firstAttempt: now };

  if (now - record.firstAttempt > WINDOW_MS) {
    record.attempts = 1;
    record.firstAttempt = now;
    delete record.lockedUntil;
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.warn(`[Security Alert] Rate limit triggered for login target: ${key}. Locked for 15 minutes.`);
  }

  loginAttempts.set(key, record);
}

export function resetLoginRateLimit(key: string): void {
  loginAttempts.delete(key);
}

export function generateAccessToken(user: any, permissions: string[]): string {
  const roleCode = user.role || user.roleCode || (user.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: roleCode,
      roleCode,
      roleId: user.roleId || 'role-super-admin',
      roleName: user.roleName || (roleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'),
      branchId: user.branchId || 'br-riyadh',
      branchName: user.branchName || 'Riyadh Central HQ',
      permissions,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generateRefreshToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyRefreshToken(token: string): { id: string; email: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; email: string };
}

// Backward compatibility alias
export const generateToken = generateAccessToken;

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Authorization token missing.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user exists and check account status in real-time
    const user = await db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or removed' });
      return;
    }

    const currentStatus = String(user.status || '').toLowerCase();
    if (currentStatus !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated or suspended. Please contact the Super Admin.',
      });
      return;
    }

    // Refresh role & permissions from DB in case role or permissions updated
    const role = user.roleId ? await db.roles.findById(user.roleId) : null;
    const roleCode = user.role || role?.code || decoded.role || (user.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
    
    let permissions = role ? role.permissions : decoded.permissions || [];
    if (roleCode === 'SUPER_ADMIN') {
      permissions = ['*'];
    }

    req.user = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: roleCode,
      roleCode,
      roleId: user.roleId || role?.id || 'role-employee',
      roleName: role ? role.name : user.roleName || (roleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'),
      permissions,
      branchId: user.branchId || 'br-riyadh',
      branchName: user.branchName || 'Riyadh Central HQ',
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
}

export function isUserSuperAdmin(user?: AuthenticatedUser): boolean {
  if (!user) return false;
  return (
    user.role === 'SUPER_ADMIN' ||
    user.roleCode === 'SUPER_ADMIN' ||
    user.roleName === 'Super Admin' ||
    user.permissions?.includes('*')
  );
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (!isUserSuperAdmin(req.user)) {
    res.status(403).json({
      success: false,
      message: 'HTTP 403 Forbidden: Complete Super Admin authority required for this operation.',
    });
    return;
  }

  next();
}

export function requirePermission(permissionRequired: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // SUPER_ADMIN has unconditional bypass
    if (isUserSuperAdmin(req.user)) {
      return next();
    }

    const { permissions = [] } = req.user;
    const hasPermission =
      permissions.includes('*') ||
      permissions.includes(permissionRequired) ||
      permissions.includes(`${permissionRequired.split('.')[0]}.*`);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `HTTP 403 Forbidden: Missing required permission [${permissionRequired}]. Action denied.`,
      });
      return;
    }

    next();
  };
}

export async function recordAudit(
  req: AuthRequest,
  resource: string,
  action: string,
  recordId: string,
  entityDescription: string,
  details: string
): Promise<void> {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    await db.auditLogs.insertOne({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Unauthenticated Guest',
      userRole: req.user?.roleName || req.user?.role || 'Guest',
      action,
      resource,
      module: resource, // backward compatibility
      entityId: recordId,
      recordId,
      entityDescription,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
