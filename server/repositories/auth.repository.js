import argon2 from 'argon2';
import pool from '../db/pool.js';

const roleMap = {
  GLOBAL_ADMIN: 'global_admin',
  SCHOOL_ADMIN: 'school_admin',
  BRANCH_ADMIN: 'branch_admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
};

export async function listDatabaseSchools() {
  const result = await pool.query(`
    SELECT s.id, s.tenant_id, s.code, s.name,
           COALESCE(json_agg(json_build_object(
             'id', b.id, 'schoolId', b.school_id, 'code', b.code, 'name', b.name, 'address', b.address
           ) ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL), '[]') AS branches
    FROM schools s
    LEFT JOIN branches b ON b.school_id=s.id AND b.status='ACTIVE'
    WHERE s.status='ACTIVE'
    GROUP BY s.id ORDER BY s.name
  `);
  return result.rows.map(row => ({
    id: row.id, tenantId: row.tenant_id, code: row.code, name: row.name, branches: row.branches,
  }));
}

export async function authenticateDatabaseUser({ loginId, password, schoolId, branchId }) {
  const result = await pool.query(`
    SELECT u.id AS database_user_id, u.login_id, u.password_hash, u.display_name,
           u.role, u.status, u.tenant_id, u.school_id, u.branch_id,
           st.student_code, st.full_name AS student_name, st.status AS student_status,
           tr.employee_code, tr.full_name AS teacher_name,
           c.name AS class_name, sec.name AS section_name, g.full_name AS parent_name,
           t.name AS tenant_name, s.name AS school_name, s.code AS school_code,
           b.name AS branch_name, b.code AS branch_code
    FROM users u
    JOIN tenants t ON t.id = u.tenant_id
    LEFT JOIN schools s ON s.id = u.school_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN students st ON st.user_id = u.id
    LEFT JOIN teachers tr ON tr.user_id = u.id
    LEFT JOIN student_enrollments en ON en.student_id=st.id AND en.status='ACTIVE'
    LEFT JOIN sections sec ON sec.id=en.section_id
    LEFT JOIN classes c ON c.id=sec.class_id
    LEFT JOIN student_guardians sg ON sg.student_id=st.id AND sg.is_primary=true
    LEFT JOIN guardians g ON g.id=sg.guardian_id
    WHERE lower(u.login_id) = lower($1)
      AND u.status = 'ACTIVE'
      AND (u.role = 'GLOBAL_ADMIN' OR (u.school_id = $2 AND u.branch_id = $3))
    ORDER BY CASE WHEN u.role = 'GLOBAL_ADMIN' THEN 0 ELSE 1 END
    LIMIT 1
  `, [String(loginId ?? '').trim(), schoolId, branchId]);

  const user = result.rows[0];
  if (!user || !(await argon2.verify(user.password_hash, String(password ?? '')))) return null;

  await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.database_user_id]);
  return {
    databaseUserId: user.database_user_id,
    id: user.login_id,
    name: user.display_name,
    role: roleMap[user.role],
    databaseTenantId: user.tenant_id,
    databaseSchoolId: user.school_id,
    databaseBranchId: user.branch_id,
    studentId: user.student_code,
    teacherId: user.employee_code,
    student: user.student_code ? {
      id: user.student_code, schoolId: user.school_id, className: user.class_name,
      grade: user.class_name, section: user.section_name, name: user.student_name,
      status: user.student_status === 'ACTIVE' ? 'Active' : user.student_status,
      parentName: user.parent_name,
    } : undefined,
    teacher: user.employee_code ? {
      id: user.employee_code, schoolId: user.school_id, name: user.teacher_name,
      subject: '', specializations: [], email: '', assignments: [], duties: [], schedule: [],
    } : undefined,
    tenantName: user.tenant_name,
    schoolName: user.school_name,
    schoolCode: user.school_code,
    branchName: user.branch_name,
    branchCode: user.branch_code,
  };
}

export async function getDatabaseAuthStats() {
  const result = await pool.query(`
    SELECT count(*)::int AS users,
           count(*) FILTER (WHERE status='ACTIVE')::int AS active_users,
           max(last_login_at) AS last_login_at
    FROM users
  `);
  return result.rows[0];
}
