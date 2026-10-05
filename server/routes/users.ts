import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requireSuperAdmin, recordAudit } from '../middleware/auth.js';

export const usersRouter = Router();

// All user management routes strictly require Super Admin privileges
usersRouter.use(requireAuth);
usersRouter.use(requireSuperAdmin);

// GET /api/v1/users
usersRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const rawUsers = await db.users.find({}, { sort: { createdAt: -1 } });
    const roles = await db.roles.find();
    const branches = await db.branches.find();
    const employees = await db.employees.find();

    const users = rawUsers.map((u: any) => {
      const role = roles.find((r: any) => r.id === u.roleId || r.code === u.role);
      const branch = branches.find((b: any) => b.id === u.branchId);
      const linkedEmployee = employees.find((e: any) => e.employeeId === u.employeeId || e.id === u.employeeId);
      const roleCode = u.role || role?.code || (u.roleName === 'Super Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');

      return {
        id: u.id,
        employeeId: u.employeeId,
        linkedEmployeeName: linkedEmployee ? linkedEmployee.name : undefined,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: roleCode,
        roleId: u.roleId || role?.id || 'role-employee',
        roleName: role ? role.name : u.roleName || (roleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'),
        branchId: u.branchId,
        branchName: branch ? branch.name : u.branchName,
        departmentId: u.departmentId,
        status: u.status || 'active',
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
        employees,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/users (Create Employee/User account)
usersRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, role, roleId, branchId, departmentId, employeeId, password, status } = req.body;

    if (!name || !email || !branchId) {
      res.status(400).json({ success: false, message: 'Name, email, and branch are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.users.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user account with this email address already exists' });
      return;
    }

    const assignedRoleCode = role || (roleId === 'role-super-admin' ? 'SUPER_ADMIN' : 'EMPLOYEE');
    const roles = await db.roles.find();
    const matchedRole = roles.find((r: any) => r.id === roleId || r.code === assignedRoleCode);
    const branch = await db.branches.findById(branchId);

    const tempPassword = password || 'TempPass@2026';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const finalEmployeeId = employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await db.users.insertOne({
      id: `usr-${Date.now().toString(36)}`,
      employeeId: finalEmployeeId,
      name,
      email: normalizedEmail,
      phone: phone || '+966 50 000 0000',
      passwordHash,
      role: assignedRoleCode,
      roleId: matchedRole?.id || (assignedRoleCode === 'SUPER_ADMIN' ? 'role-super-admin' : 'role-employee'),
      roleName: matchedRole?.name || (assignedRoleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee (Read-Only)'),
      branchId,
      branchName: branch?.name || 'Riyadh Central HQ',
      departmentId: departmentId || 'Operations',
      status: status || 'active',
      createdAt: new Date().toISOString(),
    });

    // Check if employee record already exists, if not, create corresponding employee record
    const existingEmp = await db.employees.findOne({ employeeId: finalEmployeeId });
    if (!existingEmp) {
      await db.employees.insertOne({
        id: `emp-${finalEmployeeId.toLowerCase()}`,
        employeeId: finalEmployeeId,
        name,
        email: normalizedEmail,
        phone: phone || '+966 50 000 0000',
        department: departmentId || 'Operations',
        jobTitle: assignedRoleCode === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operations Staff',
        branchId,
        branchName: branch?.name || 'Riyadh Central HQ',
        status: status || 'active',
        salarySAR: 6500,
        hireDate: new Date().toISOString().split('T')[0],
      });
    }

    await recordAudit(
      req,
      'users',
      'CREATE_USER',
      newUser.id,
      newUser.name,
      `Super Admin created user account for ${newUser.email} (${newUser.role}) linked to ${finalEmployeeId}`
    );

    res.status(201).json({
      success: true,
      message: 'Employee user account created successfully',
      data: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        roleName: newUser.roleName,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/users/:id (Update user account)
usersRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, roleId, branchId, departmentId, status, phone, employeeId } = req.body;

    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (departmentId) updates.departmentId = departmentId;
    if (status) updates.status = status;
    if (employeeId) updates.employeeId = employeeId;

    if (role || roleId) {
      const roles = await db.roles.find();
      const matchedRole = roles.find((r: any) => r.id === roleId || r.code === role);
      if (matchedRole) {
        updates.role = matchedRole.code;
        updates.roleId = matchedRole.id;
        updates.roleName = matchedRole.name;
      } else if (role) {
        updates.role = role;
        updates.roleName = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee (Read-Only)';
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
      `Super Admin updated user account (${Object.keys(updates).join(', ')})`
    );

    res.json({
      success: true,
      message: 'User account updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/users/:id/reset-password
usersRouter.post('/:id/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const tempPass = newPassword || 'TempPass@2026';
    const passwordHash = await bcrypt.hash(tempPass, 10);
    await db.users.updateOne({ id }, { passwordHash });

    await recordAudit(
      req,
      'users',
      'RESET_PASSWORD',
      id,
      user.name,
      `Super Admin reset password for ${user.email}`
    );

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/users/:id/status (Activate / Deactivate)
usersRouter.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status.toLowerCase())) {
      res.status(400).json({ success: false, message: "Valid status required ('active', 'inactive', 'suspended')" });
      return;
    }

    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Safety: Protect primary super admin from accidental deactivation
    if (user.email === 'admin@ngtc.sa' && status.toLowerCase() !== 'active') {
      res.status(400).json({ success: false, message: 'Cannot deactivate the primary root Super Admin account' });
      return;
    }

    const updated = await db.users.updateOne({ id }, { status: status.toLowerCase() });

    await recordAudit(
      req,
      'users',
      'CHANGE_STATUS',
      id,
      user.name,
      `Super Admin changed account status of ${user.email} to ${status}`
    );

    res.json({
      success: true,
      message: `Account status set to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/users/:id
usersRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.email === 'admin@ngtc.sa' || user.id === req.user?.id) {
      res.status(400).json({ success: false, message: 'Cannot delete the active primary Super Admin account' });
      return;
    }

    await db.users.deleteOne({ id });

    await recordAudit(
      req,
      'users',
      'DELETE_USER',
      id,
      user.name,
      `Super Admin deleted user account for ${user.email}`
    );

    res.json({
      success: true,
      message: 'User account removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
