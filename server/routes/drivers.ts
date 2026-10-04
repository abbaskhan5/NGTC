import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const driversRouter = Router();

// GET /api/v1/drivers
driversRouter.get('/', requireAuth, requirePermission('drivers.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, branchId } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { driverCode: { $regex: String(search), $options: 'i' } },
        { iqamaNumber: { $regex: String(search), $options: 'i' } },
        { phone: { $regex: String(search), $options: 'i' } },
        { licenseNumber: { $regex: String(search), $options: 'i' } },
        { assignedVehicleNumber: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.drivers.find(query, { sort: { driverCode: 1 } });

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

// POST /api/v1/drivers
driversRouter.post('/', requireAuth, requirePermission('drivers.create'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      nameAr,
      phone,
      nationality,
      iqamaNumber,
      iqamaExpiry,
      licenseNumber,
      licenseType,
      licenseExpiry,
      branchId,
      assignedVehicleId,
    } = req.body;

    if (!name || !phone || !iqamaNumber || !licenseNumber || !branchId) {
      res.status(400).json({ success: false, message: 'Missing required driver fields' });
      return;
    }

    const branch = await db.branches.findById(branchId);
    let assignedVehicleNumber = undefined;
    if (assignedVehicleId) {
      const v = await db.vehicles.findById(assignedVehicleId);
      if (v) assignedVehicleNumber = v.vehicleNumber;
    }

    const drvNum = Math.floor(100 + Math.random() * 900);
    const newDriver = await db.drivers.insertOne({
      id: `drv-${drvNum}`,
      driverCode: `DRV-${drvNum}`,
      name,
      nameAr: nameAr || name,
      phone,
      nationality: nationality || 'Saudi',
      iqamaNumber,
      iqamaExpiry: iqamaExpiry || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      licenseNumber,
      licenseType: licenseType || 'Heavy Vehicle',
      licenseExpiry: licenseExpiry || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      medicalExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      assignedVehicleId,
      assignedVehicleNumber,
      branchId,
      branchName: branch?.name || 'Riyadh Central HQ',
      experienceYears: 5,
      status: 'active',
      performanceScore: 92,
      completedTripsCount: 0,
      violationsCount: 0,
    });

    await recordAudit(
      req,
      'drivers',
      'ONBOARD_DRIVER',
      newDriver.id,
      `${newDriver.driverCode} - ${newDriver.name}`,
      `Onboarded captain ${newDriver.name} with ${newDriver.licenseType} license`
    );

    res.status(201).json({
      success: true,
      message: 'Driver onboarded successfully',
      data: newDriver,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
