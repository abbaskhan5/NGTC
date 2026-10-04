import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const usersRouter = Router();

// GET /api/v1/users
usersRouter.get('/', requireAuth, requirePermission('users.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const rawUsers = await db.users.find({}, { sort: { createdAt: -1 } });
    const roles = await db.roles.find();
    const branches = await db.branches.find();

    const users = rawUsers.map((u: any) => {
      const role = roles.find((r: any) => r.id === u.roleId);
      const branch = branches.find((b: any) => b.id === u.branchId);
      return {
        id: u.id,
        employeeId: u.employeeId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        roleId: u.roleId,
        roleName: role ? role.name : u.roleName,
        branchId: u.branchId,
        branchName: branch ? branch.name : u.branchName,
        departmentId: u.departmentId,
        status: u.status,
        avatarUrl: u.avatarUrl,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        users,
        roles,
        branches,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/users
usersRouter.post('/', requireAuth, requirePermission('users.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, roleId, branchId, departmentId, password } = req.body;
    if (!name || !email || !roleId || !branchId) {
      res.status(400).json({ success: false, message: 'Name, email, role, and branch are required' });
      return;
    }

    const existing = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email address already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const role = await db.roles.findById(roleId);
    const branch = await db.branches.findById(branchId);

    const newUser = await db.users.insertOne({
      id: `usr-${Date.now().toString(36)}`,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '+966 50 000 0000',
      passwordHash,
      roleId,
      roleName: role?.name || 'User',
      branchId,
      branchName: branch?.name || 'Riyadh HQ',
      departmentId: departmentId || 'Operations',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    await recordAudit(
      req,
      'users',
      'CREATE_USER',
      newUser.id,
      newUser.name,
      `Created new user account for ${newUser.email} with role ${role?.name}`
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/users/:id
usersRouter.put('/:id', requireAuth, requirePermission('users.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, roleId, branchId, departmentId, status, phone } = req.body;

    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (departmentId) updates.departmentId = departmentId;
    if (status) updates.status = status;

    if (roleId) {
      const role = await db.roles.findById(roleId);
      if (role) {
        updates.roleId = roleId;
        updates.roleName = role.name;
      }
    }

    if (branchId) {
      const branch = await db.branches.findById(branchId);
      if (branch) {
        updates.branchId = branchId;
        updates.branchName = branch.name;
      }
    }

    const updatedUser = await db.users.updateOne({ id }, updates);

    await recordAudit(
      req,
      'users',
      'UPDATE_USER',
      id,
      user.name,
      `Updated user profile: ${JSON.stringify(updates)}`
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
