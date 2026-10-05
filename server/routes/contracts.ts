import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const contractsRouter = Router();

// GET /api/v1/contracts
contractsRouter.get('/', requireAuth, requirePermission('contracts.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, contractType, search } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (contractType && contractType !== 'all') query.contractType = contractType;

    if (search) {
      query.$or = [
        { contractNumber: { $regex: String(search), $options: 'i' } },
        { title: { $regex: String(search), $options: 'i' } },
        { customerName: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.contracts.find(query, { sort: { contractValueSAR: -1 } });

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

// POST /api/v1/contracts
contractsRouter.post('/', requireAuth, requirePermission('contracts.create'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      customerName,
      contractType,
      branchId,
      startDate,
      endDate,
      contractValueSAR,
      billingCycle,
      vehiclesAllocated,
    } = req.body;

    if (!title || !customerName || !contractType || !branchId || !contractValueSAR) {
      res.status(400).json({ success: false, message: 'Missing required contract parameters' });
      return;
    }

    const branch = await db.branches.findById(branchId);
    const contractNum = `CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newContract = await db.contracts.insertOne({
      id: `cnt-${Date.now().toString(36)}`,
      contractNumber: contractNum,
      title,
      customerName,
      contractType,
      branchId,
      branchName: branch?.name || 'Riyadh Central HQ',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      contractValueSAR: Number(contractValueSAR),
      billingCycle: billingCycle || 'Monthly',
      activeProjectsCount: 1,
      vehiclesAllocated: Number(vehiclesAllocated) || 10,
      status: 'active',
      documentsCount: 1,
    });

    await recordAudit(
      req,
      'contracts',
      'CREATE_CONTRACT',
      newContract.id,
      newContract.contractNumber,
      `Executed ${newContract.contractType} contract with ${newContract.customerName} valued at ${newContract.contractValueSAR} SAR`
    );

    res.status(201).json({
      success: true,
      message: 'Contract executed successfully',
      data: newContract,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contracts/:id
contractsRouter.put('/:id', requireAuth, requirePermission('contracts.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await db.contracts.findById(id);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found' });
      return;
    }

    const updated = await db.contracts.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'contracts',
      'UPDATE_CONTRACT',
      id,
      contract.contractNumber,
      `Updated contract terms (${Object.keys(req.body).join(', ')})`
    );

    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contracts/:id/approve
contractsRouter.post('/:id/approve', requireAuth, requirePermission('contracts.approve'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await db.contracts.findById(id);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found' });
      return;
    }

    const updated = await db.contracts.updateOne({ id }, { status: 'active', approvedAt: new Date().toISOString() });

    await recordAudit(
      req,
      'contracts',
      'APPROVE_CONTRACT',
      id,
      contract.contractNumber,
      `Approved contract ${contract.contractNumber}`
    );

    res.json({
      success: true,
      message: 'Contract approved successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contracts/:id
contractsRouter.delete('/:id', requireAuth, requirePermission('contracts.delete'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await db.contracts.findById(id);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found' });
      return;
    }

    await db.contracts.deleteOne({ id });

    await recordAudit(
      req,
      'contracts',
      'DELETE_CONTRACT',
      id,
      contract.contractNumber,
      `Cancelled/deleted contract ${contract.contractNumber}`
    );

    res.json({
      success: true,
      message: 'Contract removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

