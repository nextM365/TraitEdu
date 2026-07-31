import { Router } from 'express';
import { branches as legacyBranches } from '../data/tenants.js';
import { createSession, destroySession, requireAuth } from '../middleware/auth.js';
import { authenticateDatabaseUser, listDatabaseSchools } from '../repositories/auth.repository.js';

const router = Router();

router.get('/schools', async (_req, res) => {
  try {
    res.json(await listDatabaseSchools());
  } catch (error) {
    res.status(503).json({ message: `Unable to load schools: ${error.message}` });
  }
});

router.post('/login', async (req, res) => {
  const { schoolId, branchId, userId, password } = req.body ?? {};
  if (!schoolId || !branchId || !userId || !password) {
    return res.status(400).json({ message: 'School, branch, user ID, and password are required.' });
  }
  try {
    const schools = await listDatabaseSchools();
    const selectedSchool = schools.find(item => item.id === schoolId);
    const selectedBranch = selectedSchool?.branches.find(item => item.id === branchId);
    if (!selectedSchool || !selectedBranch) return res.status(400).json({ message: 'Select a valid school and branch.' });

    const user = await authenticateDatabaseUser({ loginId: userId, password, schoolId, branchId });
    if (!user) return res.status(401).json({ message: 'Invalid school, branch, user ID, or password.' });

    const effectiveSchoolId = user.role === 'global_admin' ? selectedSchool.id : user.databaseSchoolId;
    const effectiveBranchId = user.role === 'global_admin' ? selectedBranch.id : user.databaseBranchId;
    const effectiveSchool = schools.find(item => item.id === effectiveSchoolId);
    const effectiveBranch = effectiveSchool?.branches.find(item => item.id === effectiveBranchId);
    if (!effectiveSchool || !effectiveBranch) return res.status(403).json({ message: 'This account is not assigned to the selected school and branch.' });

    // Existing module repositories still use the prototype branch key. Keep it
    // inside the server session while the remaining modules migrate to UUIDs.
    const legacyBranchId = legacyBranches.find(item => item.code === effectiveBranch.code)?.id ?? effectiveBranch.id;
    const sessionUser = {
      ...user,
      tenantId: effectiveSchool.tenantId,
      schoolId: effectiveSchool.id,
      branchId: legacyBranchId,
      databaseSchoolId: effectiveSchool.id,
      databaseBranchId: effectiveBranch.id,
    };
    const profile = {
      id: user.id, name: user.student?.name ?? user.teacher?.name ?? user.name, role: user.role,
      tenantId: effectiveSchool.tenantId, tenantName: user.tenantName,
      schoolId: effectiveSchool.id, schoolName: effectiveSchool.name, schoolCode: effectiveSchool.code,
      branchId: effectiveBranch.id, branchName: effectiveBranch.name, branchCode: effectiveBranch.code,
      student: user.student, teacher: user.teacher,
    };
    res.json({ token: createSession(sessionUser), user: profile });
  } catch (error) {
    console.error('Database login error:', error.message);
    res.status(503).json({ message: 'Authentication service is unavailable.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const schools = await listDatabaseSchools();
    const school = schools.find(item => item.id === req.auth.databaseSchoolId);
    const branch = school?.branches.find(item => item.id === req.auth.databaseBranchId);
    if (!school || !branch) return res.status(401).json({ message: 'Your school assignment is unavailable.' });
    res.json({
      id: req.auth.userId, name: req.auth.student?.name ?? req.auth.teacher?.name ?? req.auth.name,
      role: req.auth.role, tenantId: school.tenantId, tenantName: req.auth.tenantName,
      schoolId: school.id, schoolName: school.name, schoolCode: school.code,
      branchId: branch.id, branchName: branch.name, branchCode: branch.code,
      student: req.auth.student, teacher: req.auth.teacher,
    });
  } catch {
    res.status(503).json({ message: 'Unable to restore the database session.' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  destroySession(req.get('authorization'));
  res.status(204).end();
});

export default router;
