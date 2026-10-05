import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import {
  AuthRequest,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  requireAuth,
  recordAudit,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const emailInput = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const passwordInput = typeof req.body?.password === 'string' ? req.body.password : '';
  const rateLimitKey = `${ip}_${emailInput}`;

  // Rate Limiting Check
  const rateCheck = checkLoginRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
    });
    return;
  }

  // Input Validation
  if (!emailInput || !passwordInput) {
    res.status(400).json({
      success: false,
      message: 'Both email and password are required to sign in.',
    });
    return;
  }

  try {
    const user = await db.users.findOne({ email: emailInput });

    // Generic error to prevent email enumeration
    if (!user) {
      recordFailedLogin(rateLimitKey);
      await recordAudit(
        req,
        'auth',
        'LOGIN_FAILED',
        'unknown',
        emailInput,
        `Failed sign-in attempt: account not found for ${emailInput}`
      );
      res.status(401).json({
        success: false,
        message: 'Invalid corporate email or password. Please verify your credentials.',
      });
      return;
    }

    // Check Account Status
    const accountStatus = String(user.status || '').toLowerCase();
    if (accountStatus !== 'active') {
      await recordAudit(
        req,
        'auth',
        'LOGIN_BLOCKED',
        user.id,
        user.name,
        `Blocked sign-in attempt: account status is '${user.status}'`
      );
      res.status(403).json({
        success: false,
        message: 'Your account is deactivated or suspended. Please contact the Super Admin.',
      });
      return;
    }

    // Verify Password
    const passwordValid = await bcrypt.compare(passwordInput, user.passwordHash);
    if (!passwordValid) {
      recordFailedLogin(rateLimitKey);
      await recordAudit(
        req,
        'auth',
        'LOGIN_FAILED',
        user.id,
        user.name,
        `Failed sign-in attempt: invalid password for ${user.email}`
      );
      res.status(401).json({
        success: false,
        message: 'Invalid corporate email or password. Please verify your credentials.',
      });
      return;
    }

    // Reset rate limiter on successful authentication
    resetLoginRateLimit(rateLimitKey);

    // Resolve Role and Permissions
    const role = user.roleId ? await db.roles.findById(user.roleId) : null;
    const roleCode = user.role || role?.code || (user.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
    
    let permissions: string[] = role ? role.permissions : [];
    if (roleCode === 'SUPER_ADMIN') {
      permissions = ['*'];
    } else if (roleCode === 'EMPLOYEE' && permissions.length === 0) {
      permissions = [
        'dashboard.read',
        'employees.read',
        'drivers.read',
        'vehicles.read',
        'contracts.read',
        'projects.read',
        'routes.read',
        'trips.read',
        'finance.read',
        'payroll.read',
        'reports.read',
      ];
    }

    // Update last login timestamp
    const nowIso = new Date().toISOString();
    await db.users.updateOne({ id: user.id }, { lastLogin: nowIso });

    const accessToken = generateAccessToken(user, permissions);
    const refreshToken = generateRefreshToken(user);

    await recordAudit(
      req,
      'auth',
      'LOGIN_SUCCESS',
      user.id,
      user.name,
      `User ${user.email} authenticated successfully with role ${roleCode}`
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleCode,
        roleCode,
        roleName: role ? role.name : user.roleName || (roleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'),
        status: user.status,
        employeeId: user.employeeId,
        phone: user.phone,
        branchId: user.branchId,
        branchName: user.branchName,
        departmentId: user.departmentId,
        avatarUrl: user.avatarUrl,
        lastLogin: nowIso,
      },
      accessToken,
      refreshToken,
      token: accessToken, // backward compatibility
      permissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal authentication error' });
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await db.users.findById(payload.id);
    if (!user || String(user.status || '').toLowerCase() !== 'active') {
      res.status(403).json({ success: false, message: 'User account is no longer active' });
      return;
    }

    const role = user.roleId ? await db.roles.findById(user.roleId) : null;
    const roleCode = user.role || role?.code || (user.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
    let permissions = role ? role.permissions : [];
    if (roleCode === 'SUPER_ADMIN') permissions = ['*'];

    const newAccessToken = generateAccessToken(user, permissions);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken,
    });
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await recordAudit(
      req,
      'auth',
      'LOGOUT',
      req.user.id,
      req.user.name,
      `User ${req.user.email} signed out`
    );
  }
  res.json({ success: true, message: 'Signed out successfully' });
});

// GET /api/v1/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.users.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    const role = user.roleId ? await db.roles.findById(user.roleId) : null;
    const roleCode = user.role || role?.code || (user.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
    let permissions = role ? role.permissions : req.user!.permissions;
    if (roleCode === 'SUPER_ADMIN') permissions = ['*'];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: roleCode,
          roleCode,
          roleId: user.roleId,
          roleName: role ? role.name : user.roleName,
          branchId: user.branchId,
          branchName: user.branchName,
          departmentId: user.departmentId,
          status: user.status,
          avatarUrl: user.avatarUrl,
          lastLogin: user.lastLogin,
        },
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/auth/switch-demo (For development testing)
authRouter.post('/switch-demo', async (req: AuthRequest, res: Response) => {
  try {
    const { roleCode } = req.body;
    let targetEmail = 'admin@ngtc.sa';

    if (roleCode === 'EMPLOYEE') targetEmail = 'employee@ngtc.sa';
    else if (roleCode === 'GENERAL_MANAGER') targetEmail = 'manager@ngtc.sa';
    else if (roleCode === 'FLEET_MANAGER') targetEmail = 'fleet@ngtc.sa';
    else if (roleCode === 'OPERATIONS_MANAGER') targetEmail = 'operations@ngtc.sa';
    else if (roleCode === 'FINANCE_MANAGER') targetEmail = 'finance@ngtc.sa';
    else if (roleCode === 'HR_MANAGER') targetEmail = 'hr@ngtc.sa';
    else if (roleCode === 'DRIVER') targetEmail = 'driver@ngtc.sa';

    let user = await db.users.findOne({ email: targetEmail });
    if (!user && roleCode === 'EMPLOYEE') {
      // Find any user with employee role or create one
      user = await db.users.findOne({ role: 'EMPLOYEE' }) || await db.users.findOne({ email: 'driver@ngtc.sa' });
    }

    if (!user) {
      res.status(404).json({ success: false, message: `Demo user for role ${roleCode} not found` });
      return;
    }

    const role = user.roleId ? await db.roles.findById(user.roleId) : null;
    const finalRoleCode = user.role || role?.code || roleCode;
    let permissions = role ? role.permissions : [];
    if (finalRoleCode === 'SUPER_ADMIN') permissions = ['*'];

    const accessToken = generateAccessToken(user, permissions);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: `Switched demo identity to ${role?.name || user.name}`,
      data: {
        token: accessToken,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: finalRoleCode,
          roleCode: finalRoleCode,
          roleId: user.roleId,
          roleName: role ? role.name : user.roleName,
          branchId: user.branchId,
          branchName: user.branchName,
          departmentId: user.departmentId,
          status: user.status,
          avatarUrl: user.avatarUrl,
        },
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
