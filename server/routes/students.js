import { Router } from 'express';
import studentData from '../data/studentData.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(studentData);
});

export default router;
