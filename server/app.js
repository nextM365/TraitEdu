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

const app = express();

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

export default app;
