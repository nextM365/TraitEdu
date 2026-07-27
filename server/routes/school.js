import { Router } from 'express';
import schoolData from '../data/schoolData.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(schoolData);
});

export default router;
