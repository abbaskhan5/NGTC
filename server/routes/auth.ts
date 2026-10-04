import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { AuthRequest, generateToken, requireAuth, recordAudit } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: 'Account is suspended or deactivated' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Fetch user's role and permissions
    const role = await db.roles.findById(user.roleId);
    const permissions = role ? role.permissions : [];

    // Update last login
    await db.users.updateOne({ id: user.id }, { lastLogin: new Date().toISOString() });

    const token = generateToken(user, permissions);

    await recordAudit(
      req,
      'auth',
      'USER_LOGIN',
      user.id,
      user.name,
      `User ${user.email} authenticated successfully (${role?.name || 'User'})`
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
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
    res.status(500).json({ success: false, message: error.message || 'Authentication error' });
  }
});

// POST /api/v1/auth/switch-demo (Easily switch active persona during development)
authRouter.post('/switch-demo', async (req: AuthRequest, res: Response) => {
  try {
    const { roleCode } = req.body;
    let targetEmail = 'admin@ngtc.sa';

    if (roleCode === 'GENERAL_MANAGER') targetEmail = 'manager@ngtc.sa';
    else if (roleCode === 'FLEET_MANAGER') targetEmail = 'fleet@ngtc.sa';
    else if (roleCode === 'OPERATIONS_MANAGER') targetEmail = 'operations@ngtc.sa';
    else if (roleCode === 'FINANCE_MANAGER') targetEmail = 'finance@ngtc.sa';
    else if (roleCode === 'HR_MANAGER') targetEmail = 'hr@ngtc.sa';
    else if (roleCode === 'DRIVER') targetEmail = 'driver@ngtc.sa';

    const user = await db.users.findOne({ email: targetEmail });
    if (!user) {
      res.status(404).json({ success: false, message: `Demo user for role ${roleCode} not found` });
      return;
    }

    const role = await db.roles.findById(user.roleId);
    const permissions = role ? role.permissions : [];
    const token = generateToken(user, permissions);

    res.json({
      success: true,
      message: `Switched demo identity to ${role?.name}`,
      data: {
        token,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
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

// GET /api/v1/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    const role = await db.roles.findById(user.roleId);
    const permissions = role ? role.permissions : [];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
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

// POST /api/v1/auth/change-password
authRouter.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password required' });
      return;
    }

    const user = await db.users.findById(req.user!.id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.users.updateOne({ id: user.id }, { passwordHash: newHash });

    await recordAudit(
      req,
      'auth',
      'CHANGE_PASSWORD',
      user.id,
      user.name,
      'User updated account credentials'
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
