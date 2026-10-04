import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ngtc-enterprise-jwt-super-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  branchId: string;
  branchName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: any, permissions: string[]): string {
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      branchId: user.branchId,
      branchName: user.branchName,
      permissions,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user exists and is active in database
    const user = await db.users.findById(decoded.id);
    if (!user || user.status !== 'active') {
      res.status(401).json({ success: false, message: 'User account is inactive or revoked' });
      return;
    }

    // Refresh role & permissions from DB in case updated
    const role = await db.roles.findById(user.roleId);
    decoded.permissions = role ? role.permissions : [];
    decoded.roleName = role ? role.name : user.roleName;

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
}

export function requirePermission(permissionRequired: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { permissions } = req.user;
    const hasPermission =
      permissions.includes('*') ||
      permissions.includes(permissionRequired) ||
      permissions.includes(`${permissionRequired.split('.')[0]}.*`);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${permissionRequired}]`,
      });
      return;
    }

    next();
  };
}

export async function recordAudit(
  req: AuthRequest,
  module: 'vehicles' | 'drivers' | 'contracts' | 'trips' | 'users' | 'finance' | 'settings' | 'auth',
  action: string,
  entityId: string,
  entityDescription: string,
  details: string
): Promise<void> {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    await db.auditLogs.insertOne({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'System Guest',
      userRole: req.user?.roleName || 'System',
      action,
      module,
      entityId,
      entityDescription,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
