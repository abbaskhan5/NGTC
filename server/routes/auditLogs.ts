import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission } from '../middleware/auth.js';

export const auditLogsRouter = Router();

// GET /api/v1/audit-logs
auditLogsRouter.get('/', requireAuth, requirePermission('audit.read'), async (req: AuthRequest, res: Response) => {
  try {
    const { module, search, limit = 50, skip = 0 } = req.query;
    const query: any = {};
    if (module && module !== 'all') {
      query.module = module;
    }
    if (search) {
      query.$or = [
        { userName: { $regex: String(search), $options: 'i' } },
        { action: { $regex: String(search), $options: 'i' } },
        { entityDescription: { $regex: String(search), $options: 'i' } },
        { details: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await db.auditLogs.find(query, {
      sort: { timestamp: -1 },
      skip: Number(skip),
      limit: Number(limit),
    });

    const total = await db.auditLogs.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
