import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables if running locally or in development
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

import { db } from './db.js';
import { seedDatabase } from './seed.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { notificationsRouter } from './routes/notifications.js';
import { auditLogsRouter } from './routes/auditLogs.js';
import { usersRouter } from './routes/users.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { driversRouter } from './routes/drivers.js';
import { contractsRouter } from './routes/contracts.js';
import { tripsRouter } from './routes/trips.js';
import { searchRouter } from './routes/search.js';
import { seedRouter } from './routes/seed.js';
import { employeesRouter } from './routes/employees.js';
import { payrollRouter } from './routes/payroll.js';
import { settingsRouter } from './routes/settings.js';
import { rolesRouter } from './routes/roles.js';

let dbInitPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await db.connectMongo();
        await seedDatabase();
        console.log('[NGTC ERP] Database initialized & synchronized');
      } catch (err) {
        console.error('[NGTC ERP] Database initialization notice:', err);
      }
    })();
  }
  return dbInitPromise;
}

export const app = express();

// CORS Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigin = process.env.CLIENT_URL || process.env.APP_URL || '*';
  const reqOrigin = req.headers.origin;

  if (allowedOrigin === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (reqOrigin && (reqOrigin === allowedOrigin || allowedOrigin.split(',').map(s => s.trim()).includes(reqOrigin))) {
    res.header('Access-Control-Allow-Origin', reqOrigin);
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigin.split(',')[0].trim());
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Request logger for API calls
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/v1')) {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
    });
  }
  next();
});

// Database lazy initializer middleware (ensures DB is ready before request processing)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/v1') || req.url === '/health') {
    try {
      await ensureDbInitialized();
    } catch (e) {
      console.error('[NGTC ERP] Init error:', e);
    }
  }
  next();
});

// Router for API v1
const v1Router = express.Router();
v1Router.use('/auth', authRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/audit-logs', auditLogsRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/vehicles', vehiclesRouter);
v1Router.use('/drivers', driversRouter);
v1Router.use('/contracts', contractsRouter);
v1Router.use('/trips', tripsRouter);
v1Router.use('/employees', employeesRouter);
v1Router.use('/payroll', payrollRouter);
v1Router.use('/settings', settingsRouter);
v1Router.use('/roles', rolesRouter);
v1Router.use('/search', searchRouter);
v1Router.use('/seed', seedRouter);

// System & Database status
v1Router.get('/system/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      database: db.status,
      time: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
      storageProvider: process.env.STORAGE_PROVIDER || 'local',
      storageBucket: process.env.STORAGE_BUCKET || 'ngtc-documents',
    },
  });
});

// Health check endpoint
const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    system: 'NGTC ERP v1.0.0',
    database: db.status.connected ? db.status.provider : 'offline',
  });
};

// Mount endpoints under /api/v1 and /v1 (and direct /api/health)
app.use('/api/v1', v1Router);
app.use('/v1', v1Router);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

export default app;
