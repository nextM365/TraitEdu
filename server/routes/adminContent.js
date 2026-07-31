import { Router } from 'express';
import { getBranchContent, students, users } from '../data/tenants.js';

const router = Router();
const allowedModules = new Set([
  'announcements', 'achievements', 'examResults', 'fees', 'attendance',
  'opinionPolls', 'parentConcerns', 'busTracking', 'wellness', 'gatePass', 'events',
  'teachers', 'studentFeedback',
  'admissions', 'examManagement',
]);

router.use((req, res, next) => {
  if (!['branch_admin', 'school_admin'].includes(req.auth.role)) {
    return res.status(403).json({ message: 'School administrator access is required.' });
  }
  next();
});

router.get('/', (req, res) => {
  res.json(getBranchContent(req.auth.branchId));
});

router.put('/:module', (req, res) => {
  const moduleName = req.params.module;
  if (!allowedModules.has(moduleName)) {
    return res.status(404).json({ message: 'Unknown content module.' });
  }
  if (!Object.hasOwn(req.body ?? {}, 'content')) {
    return res.status(400).json({ message: 'Content is required.' });
  }
  if (moduleName === 'teachers' && req.body.credentials?.teacherId && req.body.credentials?.loginId) {
    const credentials = req.body.credentials;
    const duplicate = users.find(user =>
      user.branchId === req.auth.branchId &&
      user.id.toLowerCase() === credentials.loginId.toLowerCase() &&
      user.teacherId !== credentials.teacherId
    );
    if (duplicate) return res.status(409).json({ message: 'That login ID is already used in this branch.' });
    const existingLogin = users.find(user => user.branchId === req.auth.branchId && user.role === 'teacher' && user.teacherId === credentials.teacherId);
    if (!existingLogin && !credentials.password) {
      return res.status(400).json({ message: 'A temporary password is required for a new teacher.' });
    }
  }
  const branchContent = getBranchContent(req.auth.branchId);
  branchContent[moduleName] = req.body.content;
  if (moduleName === 'teachers' && Array.isArray(req.body.content)) {
    const teacherIds = new Set(req.body.content.map(item => item.id));
    for (let index = users.length - 1; index >= 0; index -= 1) {
      const user = users[index];
      if (user.role === 'teacher' && user.branchId === req.auth.branchId && !teacherIds.has(user.teacherId)) {
        users.splice(index, 1);
      }
    }
    const credentials = req.body.credentials;
    if (credentials?.teacherId && credentials?.loginId) {
      const duplicate = users.find(user =>
        user.branchId === req.auth.branchId &&
        user.id.toLowerCase() === credentials.loginId.toLowerCase() &&
        user.teacherId !== credentials.teacherId
      );
      if (duplicate) return res.status(409).json({ message: 'That login ID is already used in this branch.' });
      let teacherUser = users.find(user => user.branchId === req.auth.branchId && user.role === 'teacher' && user.teacherId === credentials.teacherId);
      if (!teacherUser) {
        if (!credentials.password) return res.status(400).json({ message: 'A temporary password is required for a new teacher.' });
        teacherUser = { role: 'teacher', schoolId: req.auth.schoolId, branchId: req.auth.branchId, teacherId: credentials.teacherId };
        users.push(teacherUser);
      }
      teacherUser.id = credentials.loginId;
      teacherUser.enabled = credentials.enabled !== false;
      if (credentials.password) teacherUser.password = credentials.password;
    }
  }
  if (moduleName === 'admissions' && Array.isArray(req.body.content)) {
    const admissionStages = [
      'Admission Enquiry', 'Online Admission Form', 'Document Upload', 'Admission Review',
      'Entrance Test / Interview', 'Admission Approved', 'Fee Payment', 'Student Enrollment',
      'Generate Admission Number', 'Generate Student ID', 'Create Parent Account',
      'Create Student Login', 'Student Dashboard',
    ];
    const reached = (item, stage) => admissionStages.indexOf(item.status) >= admissionStages.indexOf(stage);
    req.body.content
      .filter(item => (reached(item, 'Student Enrollment') || item.status === 'Enrolled') && item.studentId && item.studentName)
      .forEach(item => {
        const existing = students.find(student => student.branchId === req.auth.branchId && student.id === item.studentId);
        const studentRecord = {
          id: item.studentId,
          schoolId: req.auth.schoolId,
          branchId: req.auth.branchId,
          className: item.className,
          grade: item.className,
          section: item.section,
          name: item.studentName,
          status: 'Active',
          parentName: item.parentName,
        };
        if (existing) Object.assign(existing, studentRecord);
        else students.push(studentRecord);

        if (reached(item, 'Create Parent Account') && item.parentLoginId && item.parentTemporaryPassword) {
          let parentUser = users.find(user => user.branchId === req.auth.branchId && user.role === 'parent' && user.studentId === item.studentId);
          if (!parentUser) {
            parentUser = { role: 'parent', schoolId: req.auth.schoolId, branchId: req.auth.branchId, studentId: item.studentId };
            users.push(parentUser);
          }
          Object.assign(parentUser, { id: item.parentLoginId, password: item.parentTemporaryPassword, name: item.parentName, enabled: true });
        }

        if (reached(item, 'Student Enrollment') && item.studentLoginId && item.studentTemporaryPassword) {
          let studentUser = users.find(user => user.branchId === req.auth.branchId && user.role === 'student' && user.studentId === item.studentId);
          if (!studentUser) {
            studentUser = { role: 'student', schoolId: req.auth.schoolId, branchId: req.auth.branchId, studentId: item.studentId };
            users.push(studentUser);
          }
          Object.assign(studentUser, { id: item.studentLoginId, password: item.studentTemporaryPassword, enabled: true });
        }
      });
  }
  res.json({ module: moduleName, content: branchContent[moduleName] });
});

export default router;
