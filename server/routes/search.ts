import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

export const searchRouter = Router();

// GET /api/v1/search?q=query
searchRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      res.json({ success: true, data: { vehicles: [], drivers: [], contracts: [], trips: [], invoices: [] } });
      return;
    }

    const regex = { $regex: q, $options: 'i' };

    const [vehicles, drivers, contracts, trips, invoices] = await Promise.all([
      db.vehicles.find({
        $or: [
          { vehicleNumber: regex },
          { plateNumber: regex },
          { make: regex },
          { model: regex },
        ],
      }, { limit: 5 }),

      db.drivers.find({
        $or: [
          { name: regex },
          { driverCode: regex },
          { iqamaNumber: regex },
          { licenseNumber: regex },
        ],
      }, { limit: 5 }),

      db.contracts.find({
        $or: [
          { contractNumber: regex },
          { title: regex },
          { customerName: regex },
        ],
      }, { limit: 5 }),

      db.trips.find({
        $or: [
          { tripNumber: regex },
          { routeName: regex },
          { vehicleNumber: regex },
          { driverName: regex },
        ],
      }, { limit: 5 }),

      db.invoices.find({
        $or: [
          { invoiceNumber: regex },
          { customerName: regex },
        ],
      }, { limit: 5 }),
    ]);

    res.json({
      success: true,
      data: {
        vehicles,
        drivers,
        contracts,
        trips,
        invoices,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
