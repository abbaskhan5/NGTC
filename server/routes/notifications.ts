import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { severity, unreadOnly } = req.query;
    const query: any = {};
    if (severity) query.severity = severity;
    if (unreadOnly === 'true') query.read = false;

    const items = await db.notifications.find(query, {
      sort: { createdAt: -1 },
    });

    const unreadCount = await db.notifications.countDocuments({ read: false });

    res.json({
      success: true,
      data: {
        items,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/notifications/:id/read
notificationsRouter.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.notifications.updateOne({ id }, { read: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Marked as read', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/notifications/read-all
notificationsRouter.put('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const unread = await db.notifications.find({ read: false });
    for (const item of unread) {
      await db.notifications.updateOne({ id: item.id }, { read: true });
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
