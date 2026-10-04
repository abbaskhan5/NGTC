import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const vehiclesRouter = Router();

// GET /api/v1/vehicles
vehiclesRouter.get('/', requireAuth, requirePermission('vehicles.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, vehicleType, branchId, search } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (vehicleType && vehicleType !== 'all') query.vehicleType = vehicleType;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: String(search), $options: 'i' } },
        { plateNumber: { $regex: String(search), $options: 'i' } },
        { make: { $regex: String(search), $options: 'i' } },
        { model: { $regex: String(search), $options: 'i' } },
        { assignedDriverName: { $regex: String(search), $options: 'i' } },
        { projectName: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.vehicles.find(query, { sort: { vehicleNumber: 1 } });
    const branches = await db.branches.find();

    res.json({
      success: true,
      data: {
        items,
        total: items.length,
        branches,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/vehicles
vehiclesRouter.post('/', requireAuth, requirePermission('vehicles.create'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      vehicleNumber,
      plateNumber,
      vehicleType,
      make,
      model,
      year,
      vin,
      color,
      fuelType,
      currentMileage,
      branchId,
      businessUnitId,
      registrationExpiry,
      insuranceExpiry,
      inspectionExpiry,
    } = req.body;

    if (!vehicleNumber || !plateNumber || !vehicleType || !make || !model || !branchId) {
      res.status(400).json({ success: false, message: 'Missing required vehicle fields' });
      return;
    }

    const branch = await db.branches.findById(branchId);
    const newVehicle = await db.vehicles.insertOne({
      id: `veh-${vehicleNumber.replace(/[^0-9]/g, '') || Date.now().toString()}`,
      vehicleNumber,
      plateNumber,
      plateNumberAr: plateNumber,
      vehicleType,
      make,
      model,
      year: Number(year) || 2024,
      vin: vin || `WDB${Date.now()}X`,
      color: color || 'NGTC Pearl Green',
      fuelType: fuelType || 'Diesel',
      currentMileage: Number(currentMileage) || 0,
      branchId,
      branchName: branch?.name || 'Riyadh Central HQ',
      businessUnitId: businessUnitId || 'bu-school',
      status: 'active',
      registrationExpiry: registrationExpiry || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      insuranceExpiry: insuranceExpiry || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      inspectionExpiry: inspectionExpiry || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      gpsDeviceId: `GPS-NGTC-${vehicleNumber.replace(/[^0-9]/g, '')}`,
      gpsStatus: 'idle',
      speedKmh: 0,
      lastGpsUpdate: new Date().toISOString(),
    });

    await recordAudit(
      req,
      'vehicles',
      'REGISTER_VEHICLE',
      newVehicle.id,
      `${newVehicle.vehicleNumber} (${newVehicle.plateNumber})`,
      `Registered new ${newVehicle.make} ${newVehicle.model} under ${branch?.name}`
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: newVehicle,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/vehicles/:id
vehiclesRouter.put('/:id', requireAuth, requirePermission('vehicles.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await db.vehicles.findById(id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    const updated = await db.vehicles.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'vehicles',
      'UPDATE_VEHICLE',
      id,
      vehicle.vehicleNumber,
      `Updated vehicle record (${Object.keys(req.body).join(', ')})`
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
