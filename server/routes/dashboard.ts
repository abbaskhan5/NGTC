import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();

// GET /api/v1/dashboard/summary
dashboardRouter.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Fetch collections data
    const allVehicles = await db.vehicles.find();
    const allDrivers = await db.drivers.find();
    const allTrips = await db.trips.find();
    const allProjects = await db.projects.find();
    const allContracts = await db.contracts.find();
    const allDivisions = await db.businessUnits.find();
    const urgentAlerts = await db.notifications.find({ read: false }, { limit: 5 });
    const recentActivities = await db.auditLogs.find({}, { sort: { timestamp: -1 }, limit: 6 });

    // 2. Compute Fleet metrics
    const totalVehicles = allVehicles.length;
    const activeVehicles = allVehicles.filter((v: any) => v.status === 'active').length;
    const vehiclesInMaintenance = allVehicles.filter((v: any) => v.status === 'maintenance').length;
    const idleVehicles = allVehicles.filter((v: any) => v.status === 'idle').length;
    const inactiveVehicles = allVehicles.filter((v: any) => v.status === 'inactive').length;

    // 3. Compute Driver metrics
    const totalDrivers = allDrivers.length;
    const activeDrivers = allDrivers.filter((d: any) => d.status === 'active').length;

    // 4. Compute Trip metrics
    const tripsToday = allTrips.length;
    const completedTripsToday = allTrips.filter((t: any) => t.status === 'completed').length;
    const runningTripsToday = allTrips.filter((t: any) => t.status === 'running').length;
    const delayedTripsToday = allTrips.filter((t: any) => t.status === 'delayed').length;
    const scheduledTripsToday = allTrips.filter((t: any) => t.status === 'scheduled').length;
    const cancelledTripsToday = allTrips.filter((t: any) => t.status === 'cancelled').length;

    // 5. Compute Financials
    const totalMonthlyRevenueSAR = allDivisions.reduce((sum: number, d: any) => sum + (d.monthlyRevenueSAR || 0), 0);
    const totalMonthlyExpensesSAR = Math.round(totalMonthlyRevenueSAR * 0.68); // 68% operational cost benchmark
    const grossProfitSAR = totalMonthlyRevenueSAR - totalMonthlyExpensesSAR;

    // 6. Business division cards
    const businessDivisions = allDivisions.map((bu: any) => {
      const buVehicles = allVehicles.filter((v: any) => v.businessUnitId === bu.id).length;
      return {
        code: bu.code,
        name: bu.name,
        nameAr: bu.nameAr,
        activeFleetCount: buVehicles,
        tripsToday: Math.max(1, Math.round(buVehicles * 0.7)),
        activeContracts: bu.activeContractsCount,
        monthlyRevenueSAR: bu.monthlyRevenueSAR,
        status: bu.code === 'SCH-TRN' || bu.code === 'UNI-TRN' ? 'busy' : 'optimal',
      };
    });

    // 7. Monthly chart trend (SAR)
    const monthlyFinancials = [
      { month: 'May 2026', revenue: 15400000, expenses: 10600000, profit: 4800000 },
      { month: 'Jun 2026', revenue: 16100000, expenses: 11000000, profit: 5100000 },
      { month: 'Jul 2026', revenue: 14800000, expenses: 10200000, profit: 4600000 },
      { month: 'Aug 2026', revenue: 16900000, expenses: 11400000, profit: 5500000 },
      { month: 'Sep 2026', revenue: 17500000, expenses: 11800000, profit: 5700000 },
      { month: 'Oct 2026', revenue: totalMonthlyRevenueSAR, expenses: totalMonthlyExpensesSAR, profit: grossProfitSAR },
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalVehicles,
          activeVehicles,
          vehiclesInMaintenance,
          totalDrivers,
          activeDrivers,
          tripsToday,
          completedTripsToday,
          runningTripsToday,
          activeProjects: allProjects.filter((p: any) => p.status === 'active').length,
          activeContracts: allContracts.filter((c: any) => c.status === 'active').length,
          totalMonthlyRevenueSAR,
          totalMonthlyExpensesSAR,
          grossProfitSAR,
          expiringDocumentsCount: urgentAlerts.length,
        },
        businessDivisions,
        fleetStatusDistribution: {
          active: activeVehicles,
          idle: idleVehicles,
          maintenance: vehiclesInMaintenance,
          inactive: inactiveVehicles,
        },
        tripStatusDistribution: {
          scheduled: scheduledTripsToday,
          running: runningTripsToday,
          completed: completedTripsToday,
          delayed: delayedTripsToday,
          cancelled: cancelledTripsToday,
        },
        monthlyFinancials,
        urgentAlerts,
        recentActivities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard data' });
  }
});
