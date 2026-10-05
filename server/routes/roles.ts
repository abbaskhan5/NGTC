import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const rolesRouter = Router();

// GET /api/v1/roles
rolesRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const roles = await db.roles.find();
    const permissions = await db.permissions.find();
    res.json({
      success: true,
      data: {
        roles,
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/roles
rolesRouter.post('/', requireAuth, requirePermission('roles.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Role name and code are required' });
      return;
    }

    const newRole = await db.roles.insertOne({
      id: `role-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      code: code.toUpperCase(),
      description: description || '',
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystem: false,
    });

    await recordAudit(
      req,
      'roles',
      'CREATE_ROLE',
      newRole.id,
      newRole.name,
      `Super Admin created role ${newRole.name} with code ${newRole.code}`
    );

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/roles/:id
rolesRouter.put('/:id', requireAuth, requirePermission('roles.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = await db.roles.findById(id);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }

    if (role.isSystem && req.body.code && req.body.code !== role.code) {
      res.status(400).json({ success: false, message: 'Cannot modify system role code' });
      return;
    }

    const updated = await db.roles.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'roles',
      'UPDATE_ROLE',
      id,
      role.name,
      `Super Admin updated role permissions/settings for ${role.name}`
    );

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/roles/:id
rolesRouter.delete('/:id', requireAuth, requirePermission('roles.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = await db.roles.findById(id);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ success: false, message: 'System roles cannot be deleted' });
      return;
    }

    await db.roles.deleteOne({ id });

    await recordAudit(
      req,
      'roles',
      'DELETE_ROLE',
      id,
      role.name,
      `Super Admin deleted custom role ${role.name}`
    );

    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
