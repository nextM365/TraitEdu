import { Router } from 'express';
import { checkDatabase } from '../db/pool.js';
import { getDatabaseAuthStats } from '../repositories/auth.repository.js';

const router = Router();

function getSafeDiagnostics() {
  return {
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
    deploymentUrl: process.env.VERCEL_URL ?? null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseDbPassword: Boolean(process.env.SUPABASE_DB_PASSWORD),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET),
  };
}

router.get('/', async (_req, res) => {
  try {
    const [database, authentication] = await Promise.all([checkDatabase(), getDatabaseAuthStats()]);
    res.json({ status: 'ok', api: 'online', database: 'online', ...database, authentication, diagnostics: getSafeDiagnostics() });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      api: 'online',
      database: 'offline',
      message: error instanceof Error ? error.message : 'Database connection failed.',
      diagnostics: getSafeDiagnostics(),
    });
  }
});

export default router;
