import express from 'express';
import path from 'path';
import app from './src/server/app';
import { connectMongoDB } from './src/db/mongodb';

async function startLocalServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (mongoUri) {
    console.log('[Database] Connecting to production database...');
    const connected = await connectMongoDB();
    if (!connected) {
      console.error('[Database Error] Failed to connect to MongoDB database.');
    }
  } else {
    console.warn('⚠️ MONGODB_URI / DATABASE_URL not set in environment.');
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DairyOS Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startLocalServer().catch((err) => {
  console.error('[DairyOS Server Fatal Error]', err);
  process.exit(1);
});
