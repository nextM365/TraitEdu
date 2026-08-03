import app from './app.js';
import pool from './db/pool.js';

const PORT = Number(process.env.PORT ?? 4000);

const server = app.listen(PORT, () => {
  console.log(`School dashboard API server running on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing API and database connections.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
