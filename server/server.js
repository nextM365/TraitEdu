import express from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard.js';
import schoolRouter from './routes/school.js';
import teachersRouter from './routes/teachers.js';
import studentsRouter from './routes/students.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);
app.use('/api/school', schoolRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);

app.listen(PORT, () => {
  console.log(`School dashboard API server running on http://localhost:${PORT}`);
});
