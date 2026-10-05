import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const tripsRouter = Router();

// GET /api/v1/trips
tripsRouter.get('/', requireAuth, requirePermission('trips.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { tripNumber: { $regex: String(search), $options: 'i' } },
        { routeName: { $regex: String(search), $options: 'i' } },
        { vehicleNumber: { $regex: String(search), $options: 'i' } },
        { driverName: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.trips.find(query, { sort: { scheduledStart: 1 } });

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

// POST /api/v1/trips/:id/status
tripsRouter.post('/:id/status', requireAuth, requirePermission('trips.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, currentLocationName, incidentsReported } = req.body;

    const trip = await db.trips.findById(id);
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const updates: any = { status };
    if (status === 'running' && !trip.actualStart) {
      updates.actualStart = new Date().toTimeString().slice(0, 5);
    }
    if (status === 'completed' && !trip.actualEnd) {
      updates.actualEnd = new Date().toTimeString().slice(0, 5);
    }
    if (currentLocationName) updates.currentLocationName = currentLocationName;
    if (incidentsReported !== undefined) updates.incidentsReported = incidentsReported;

    const updated = await db.trips.updateOne({ id }, updates);

    await recordAudit(
      req,
      'trips',
      'UPDATE_TRIP_STATUS',
      id,
      trip.tripNumber,
      `Changed status of trip ${trip.tripNumber} to ${status}`
    );

    res.json({
      success: true,
      message: `Trip status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/trips
tripsRouter.post('/', requireAuth, requirePermission('trips.create'), async (req: AuthRequest, res: Response) => {
  try {
    const { routeName, vehicleId, driverId, scheduledStart, scheduledEnd } = req.body;
    if (!routeName || !vehicleId || !driverId) {
      res.status(400).json({ success: false, message: 'Route name, vehicle, and driver are required' });
      return;
    }

    const vehicle = await db.vehicles.findById(vehicleId);
    const driver = await db.drivers.findById(driverId);
    const tripNum = `TRP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTrip = await db.trips.insertOne({
      id: `trp-${Date.now().toString(36)}`,
      tripNumber: tripNum,
      routeName,
      vehicleId,
      vehicleNumber: vehicle ? vehicle.vehicleNumber : 'BUS-1001',
      driverId,
      driverName: driver ? driver.name : 'Assigned Captain',
      status: 'scheduled',
      scheduledStart: scheduledStart || '06:30',
      scheduledEnd: scheduledEnd || '07:45',
      passengerCount: 45,
      createdAt: new Date().toISOString(),
    });

    await recordAudit(
      req,
      'trips',
      'CREATE_TRIP',
      newTrip.id,
      newTrip.tripNumber,
      `Dispatched new trip ${newTrip.tripNumber} on route ${routeName}`
    );

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: newTrip,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/trips/:id
tripsRouter.put('/:id', requireAuth, requirePermission('trips.update'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await db.trips.findById(id);
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const updated = await db.trips.updateOne({ id }, req.body);

    await recordAudit(
      req,
      'trips',
      'UPDATE_TRIP',
      id,
      trip.tripNumber,
      `Updated trip details (${Object.keys(req.body).join(', ')})`
    );

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/trips/:id
tripsRouter.delete('/:id', requireAuth, requirePermission('trips.delete'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await db.trips.findById(id);
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    await db.trips.deleteOne({ id });

    await recordAudit(
      req,
      'trips',
      'DELETE_TRIP',
      id,
      trip.tripNumber,
      `Cancelled/deleted trip ${trip.tripNumber}`
    );

    res.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

