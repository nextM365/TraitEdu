import crypto from 'crypto';

const sessions = new Map();

export function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
    schoolId: user.schoolId,
    branchId: user.branchId,
    studentId: user.studentId,
    teacherId: user.teacherId,
    name: user.name,
    tenantName: user.tenantName,
    databaseSchoolId: user.databaseSchoolId,
    databaseBranchId: user.databaseBranchId,
    student: user.student,
    teacher: user.teacher,
  });
  return token;
}

export function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const session = token && sessions.get(token);
  if (!session) return res.status(401).json({ message: 'Please sign in.' });
  req.auth = session;
  next();
}

export function destroySession(token) {
  if (token) sessions.delete(token.replace(/^Bearer\s+/i, ''));
}
