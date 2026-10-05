import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth, requirePermission, recordAudit } from '../middleware/auth.js';

export const settingsRouter = Router();

// GET /api/v1/settings
settingsRouter.get('/', requireAuth, requirePermission('settings.manage'), async (req: AuthRequest, res: Response) => {
  try {
    let settingsDoc = await db.settings.findOne({ id: 'system_settings' });
    if (!settingsDoc) {
      settingsDoc = await db.settings.insertOne({
        id: 'system_settings',
        companyName: 'National Group for Transportation & Contracting (NGTC)',
        companyNameAr: 'المجموعة الوطنية للنقل والمقاولات',
        vatNumber: '310294857200003',
        commercialRegistration: '1010394857',
        defaultCurrency: 'SAR',
        vatRatePercent: 15,
        telemetryRefreshIntervalSec: 15,
        speedLimitWarningKmh: 100,
        maintenanceAlertKm: 5000,
        istimaraExpiryNoticeDays: 30,
        mvpiExpiryNoticeDays: 30,
        sessionTimeoutMinutes: 60,
      });
    }

    res.json({
      success: true,
      data: settingsDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/settings
settingsRouter.put('/', requireAuth, requirePermission('settings.manage'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.settings.updateOne({ id: 'system_settings' }, req.body);

    await recordAudit(
      req,
      'settings',
      'UPDATE_SETTINGS',
      'system_settings',
      'Enterprise Settings',
      `Super Admin modified enterprise settings: ${Object.keys(req.body).join(', ')}`
    );

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
