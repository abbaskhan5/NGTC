import { Router, Request, Response } from 'express';
import { seedDatabase } from '../seed.js';

export const seedRouter = Router();

// POST /api/v1/seed/reset
seedRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    await seedDatabase(true);
    res.json({
      success: true,
      message: 'Database successfully re-seeded with realistic Saudi enterprise fleet and operations data',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
