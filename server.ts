import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app, ensureDbInitialized } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Dev server must always run on port 3000 in AI Studio
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const portArg = portIndex !== -1 ? Number(args[portIndex + 1]) : null;
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = portArg || (isProduction && !process.env.DISABLE_HMR ? Number(process.env.PORT) || 8080 : 3000);
  console.log(`[NGTC ERP] Target binding port: ${PORT}`);

  // Warm-up database connection on standalone startup
  try {
    await ensureDbInitialized();
  } catch (err) {
    console.error('[NGTC ERP] Error initializing database:', err);
  }

  // Frontend Integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NGTC ERP] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
