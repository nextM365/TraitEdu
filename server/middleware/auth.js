import crypto from 'crypto';

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7);

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is required in production.');
  }
  return secret ?? 'traitedu-development-session-secret';
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function encodeSession(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token) {
  const [payload, signature] = String(token ?? '').split('.');
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.expiresAt || Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export function createSession(user) {
  return encodeSession({
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
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
}

export function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const session = token && decodeSession(token);
  if (!session) return res.status(401).json({ message: 'Please sign in.' });
  req.auth = session;
  next();
}

export function destroySession(_token) {
  // Tokens are stateless so logout is handled by the client deleting its copy.
}
