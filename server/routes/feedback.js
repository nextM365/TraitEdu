import { Router } from 'express';
import crypto from 'crypto';
import { students, getBranchContent } from '../data/tenants.js';

const router = Router();

router.get('/', (req, res) => {
  if (!['teacher', 'branch_admin', 'school_admin'].includes(req.auth.role)) {
    return res.status(403).json({ message: 'Teacher or administrator access is required.' });
  }
  const content = getBranchContent(req.auth.branchId);
  if (['branch_admin', 'school_admin'].includes(req.auth.role)) return res.json(content.studentFeedback);

  const teacher = content.teachers.find(item => item.id === req.auth.teacherId);
  const assignedStudentIds = students
    .filter(student => student.branchId === req.auth.branchId && teacher?.assignments.some(
      assignment => assignment.className === student.className && assignment.section === student.section
    ))
    .map(student => student.id);
  res.json(content.studentFeedback.filter(item => assignedStudentIds.includes(item.studentId)));
});

router.post('/', (req, res) => {
  if (req.auth.role !== 'student') {
    return res.status(403).json({ message: 'Only students can submit feedback.' });
  }
  const message = String(req.body?.message ?? '').trim();
  if (!message) return res.status(400).json({ message: 'Feedback is required.' });
  const student = students.find(item => item.branchId === req.auth.branchId && item.id === req.auth.studentId);
  const feedback = {
    id: crypto.randomUUID(),
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    section: student.section,
    message,
    createdAt: new Date().toISOString(),
    status: 'New',
  };
  getBranchContent(req.auth.branchId).studentFeedback.unshift(feedback);
  res.status(201).json(feedback);
});

export default router;
