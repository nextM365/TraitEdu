import { Router } from 'express';
import { getBranchContent } from '../data/tenants.js';

const router = Router();

router.get('/', (req, res) => {
  const teachers = getBranchContent(req.auth.branchId).teachers;
  if (req.auth.role === 'teacher') {
    return res.json(teachers.filter(item => item.id === req.auth.teacherId));
  }
  res.json(teachers);
});

export default router;
