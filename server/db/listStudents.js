import 'dotenv/config';
import pool from './pool.js';

try {
  const result = await pool.query(`
    SELECT s.student_code, s.admission_number, s.full_name, s.date_of_birth,
           b.name AS branch, ay.name AS academic_year, c.name AS class,
           se.name AS section, e.roll_number, e.status,
           g.full_name AS guardian, g.phone,
           u.login_id, u.status AS login_status, u.last_login_at
    FROM students s
    JOIN branches b ON b.id = s.branch_id
    LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.status = 'ACTIVE'
    LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
    LEFT JOIN sections se ON se.id = e.section_id
    LEFT JOIN classes c ON c.id = se.class_id
    LEFT JOIN student_guardians sg ON sg.student_id = s.id AND sg.is_primary = true
    LEFT JOIN guardians g ON g.id = sg.guardian_id
    LEFT JOIN users u ON u.id = s.user_id
    ORDER BY c.sort_order, se.name, e.roll_number
  `);
  console.table(result.rows);
} finally {
  await pool.end();
}
