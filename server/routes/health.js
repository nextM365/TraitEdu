import { Router } from 'express';
import { checkDatabase } from '../db/pool.js';
import { getDatabaseAuthStats } from '../repositories/auth.repository.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [database, authentication] = await Promise.all([checkDatabase(), getDatabaseAuthStats()]);
    res.json({ status: 'ok', api: 'online', database: 'online', ...database, authentication });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      api: 'online',
      database: 'offline',
      message: error instanceof Error ? error.message : 'Database connection failed.',
    });
  }
});

export default router;
