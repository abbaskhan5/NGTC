import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const payrollRouter = Router();

// GET /api/v1/payroll
payrollRouter.get('/', requireAuth, requirePermission('payroll.read'), async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.payroll.find({}, { sort: { month: -1 } });
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

// POST /api/v1/payroll
payrollRouter.post('/', requireAuth, requirePermission('payroll.create'), async (req: AuthRequest, res: Response) => {
  try {
    const { month, totalEmployees, totalAmountSAR } = req.body;
    if (!month || !totalAmountSAR) {
      res.status(400).json({ success: false, message: 'Payroll month and total amount are required' });
      return;
    }

    const batch = await db.payroll.insertOne({
      id: `pay-${Date.now().toString(36)}`,
      month,
      totalEmployees: Number(totalEmployees) || 28,
      totalAmountSAR: Number(totalAmountSAR),
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    });

    await recordAudit(
      req,
      'payroll',
      'CREATE_PAYROLL',
      batch.id,
      batch.month,
      `Generated payroll run for ${batch.month} totaling ${batch.totalAmountSAR} SAR`
    );

    res.status(201).json({
      success: true,
      message: 'Payroll batch generated successfully',
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/payroll/:id
payrollRouter.put('/:id', requireAuth, requirePermission('payroll.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await db.payroll.findById(id);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Payroll batch not found' });
      return;
    }

    const updated = await db.payroll.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'payroll',
      'UPDATE_PAYROLL',
      id,
      batch.month,
      `Updated payroll batch (${Object.keys(req.body).join(', ')})`
    );

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/payroll/:id/approve
payrollRouter.post('/:id/approve', requireAuth, requirePermission('payroll.approve'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await db.payroll.findById(id);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Payroll batch not found' });
      return;
    }

    const updated = await db.payroll.updateOne(
      { id },
      { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: req.user?.name }
    );

    await recordAudit(
      req,
      'payroll',
      'APPROVE_PAYROLL',
      id,
      batch.month,
      `Authorized and approved payroll batch for ${batch.month}`
    );

    res.json({
      success: true,
      message: 'Payroll batch approved for disbursement',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/payroll/:id
payrollRouter.delete('/:id', requireAuth, requirePermission('payroll.delete'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await db.payroll.findById(id);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Payroll batch not found' });
      return;
    }

    await db.payroll.deleteOne({ id });

    await recordAudit(
      req,
      'payroll',
      'DELETE_PAYROLL',
      id,
      batch.month,
      `Cancelled payroll batch for ${batch.month}`
    );

    res.json({
      success: true,
      message: 'Payroll batch removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
