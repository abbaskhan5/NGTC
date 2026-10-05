import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const employeesRouter = Router();

// GET /api/v1/employees
employeesRouter.get('/', requireAuth, requirePermission('employees.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { department, status, search } = req.query;
    const query: any = {};
    if (department && department !== 'all') query.department = department;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { employeeId: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { jobTitle: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.employees.find(query, { sort: { employeeId: 1 } });

    res.json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/employees
employeesRouter.post('/', requireAuth, requirePermission('employees.create'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, department, jobTitle, branchId, salarySAR, hireDate } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Employee name and corporate email are required' });
      return;
    }

    const branch = branchId ? await db.branches.findById(branchId) : null;
    const empId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmployee = await db.employees.insertOne({
      id: `emp-${Date.now().toString(36)}`,
      employeeId: empId,
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '+966 50 000 0000',
      department: department || 'Operations',
      jobTitle: jobTitle || 'Operations Associate',
      branchId: branchId || 'br-riyadh',
      branchName: branch ? branch.name : 'Riyadh Central HQ',
      status: 'active',
      salarySAR: Number(salarySAR) || 7500,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    await recordAudit(
      req,
      'employees',
      'CREATE_EMPLOYEE',
      newEmployee.id,
      newEmployee.name,
      `Onboarded employee ${newEmployee.name} (${newEmployee.employeeId})`
    );

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully',
      data: newEmployee,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/employees/:id
employeesRouter.put('/:id', requireAuth, requirePermission('employees.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await db.employees.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const updated = await db.employees.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'employees',
      'UPDATE_EMPLOYEE',
      id,
      employee.name,
      `Updated employee record (${Object.keys(req.body).join(', ')})`
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/employees/:id
employeesRouter.delete('/:id', requireAuth, requirePermission('employees.delete'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await db.employees.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    await db.employees.deleteOne({ id });

    await recordAudit(
      req,
      'employees',
      'DELETE_EMPLOYEE',
      id,
      employee.name,
      `Terminated/deleted employee record for ${employee.name} (${employee.employeeId})`
    );

    res.json({
      success: true,
      message: 'Employee record removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
