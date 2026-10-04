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
