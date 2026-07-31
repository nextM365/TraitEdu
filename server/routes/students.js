import { Router } from 'express';
import { students, getBranchContent } from '../data/tenants.js';

const router = Router();

router.get('/', (req, res) => {
  const schoolStudents = students.filter(item => item.branchId === req.auth.branchId);
  if (['branch_admin', 'school_admin'].includes(req.auth.role)) {
    const className = String(req.query.className ?? '').trim();
    const section = String(req.query.section ?? '').trim();
    return res.json(schoolStudents.filter(item =>
      (!className || item.className === className) &&
      (!section || item.section === section)
    ));
  }
  if (req.auth.role === 'teacher') {
    const teacher = getBranchContent(req.auth.branchId).teachers.find(item => item.id === req.auth.teacherId);
    return res.json(schoolStudents.filter(student =>
      teacher?.assignments.some(assignment =>
        assignment.className === student.className && assignment.section === student.section
      )
    ));
  }
  res.json(schoolStudents.filter(item => item.id === req.auth.studentId));
});

export default router;
