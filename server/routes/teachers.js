import { Router } from 'express';
import teacherData from '../data/teacherData.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(teacherData);
});

export default router;
