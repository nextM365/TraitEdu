import { Router } from 'express';
import { schools, branches } from '../data/tenants.js';

const router = Router();

router.get('/', (req, res) => {
  const school = schools.find(item => item.id === req.auth.schoolId);
  const branch = branches.find(item => item.id === req.auth.branchId);
  res.json({ ...school, branch });
});

export default router;
