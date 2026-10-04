import type { Request, Response } from 'express';
import app, { ensureDbInitialized } from '../server/app.js';

export default async function handler(req: Request, res: Response) {
  // Ensure database is connected and initialized on cold starts
  await ensureDbInitialized();
  return app(req, res);
}
