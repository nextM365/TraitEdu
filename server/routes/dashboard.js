import { Router } from 'express';
import dashboardData from '../data/dashboardData.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(dashboardData);
});

export default router;
