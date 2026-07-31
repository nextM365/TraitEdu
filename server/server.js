import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dashboardRouter from './routes/dashboard.js';
import schoolRouter from './routes/school.js';
import teachersRouter from './routes/teachers.js';
import studentsRouter from './routes/students.js';
import authRouter from './routes/auth.js';
import adminContentRouter from './routes/adminContent.js';
import feedbackRouter from './routes/feedback.js';
import platformRouter from './routes/platform.js';
import healthRouter from './routes/health.js';
import { requireAuth } from './middleware/auth.js';
import pool from './db/pool.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/content', requireAuth, adminContentRouter);
app.use('/api/feedback', requireAuth, feedbackRouter);
app.use('/api/platform', requireAuth, platformRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/school', requireAuth, schoolRouter);
app.use('/api/teachers', requireAuth, teachersRouter);
app.use('/api/students', requireAuth, studentsRouter);

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
