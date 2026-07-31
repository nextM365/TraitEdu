import 'dotenv/config';
import argon2 from 'argon2';
import pool from './pool.js';

const isProduction = process.env.NODE_ENV === 'production';
const globalPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? (isProduction ? '' : 'global123');
const branchAdminPassword = process.env.SEED_BRANCH_ADMIN_PASSWORD ?? (isProduction ? '' : 'admin123');
const studentPassword = process.env.SEED_STUDENT_PASSWORD ?? (isProduction ? '' : 'student123');
const teacherPassword = process.env.SEED_TEACHER_PASSWORD ?? (isProduction ? '' : 'teacher123');

if (!globalPassword || !branchAdminPassword || !studentPassword || !teacherPassword) {
  throw new Error('Set all SEED_*_PASSWORD variables before seeding production.');
}

async function one(client, text, values = []) {
  const result = await client.query(text, values);
  return result.rows[0];
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const [globalHash, adminHash, studentHash, teacherHash] = await Promise.all([
      argon2.hash(globalPassword),
      argon2.hash(branchAdminPassword),
      argon2.hash(studentPassword),
      argon2.hash(teacherPassword),
    ]);

    const tenant = await one(client, `
      INSERT INTO tenants (code, name) VALUES ('traitedu', 'TraitEdu Education Network')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);

    const school = await one(client, `
      INSERT INTO schools (tenant_id, code, name, address, principal_name, phone, email)
      VALUES ($1, 'E-CHAMPS-1', 'E-CHAMPS Public School', '123 Campus Avenue, Hyderabad',
              'Dr. Kavya Reddy', '+91 90000 12345', 'info@echamps.school')
      ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name, address = EXCLUDED.address, principal_name = EXCLUDED.principal_name,
        phone = EXCLUDED.phone, email = EXCLUDED.email
      RETURNING id
    `, [tenant.id]);

    const branchRows = [
      ['ECH-MAIN', 'E-CHAMPS Main Campus', '123 Campus Avenue, Hyderabad'],
      ['ECH-NORTH', 'E-CHAMPS North Campus', '18 North Avenue, Hyderabad'],
    ];
    const branches = {};
    for (const [code, name, address] of branchRows) {
      branches[code] = await one(client, `
        INSERT INTO branches (tenant_id, school_id, code, name, address)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (school_id, code) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address
        RETURNING id
      `, [tenant.id, school.id, code, name, address]);
    }

    const year = await one(client, `
      INSERT INTO academic_years (tenant_id, school_id, name, start_date, end_date, status)
      VALUES ($1, $2, '2026-27', '2026-06-01', '2027-04-30', 'ACTIVE')
      ON CONFLICT (school_id, name) DO UPDATE SET
        start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, status = EXCLUDED.status
      RETURNING id
    `, [tenant.id, school.id]);

    const classNames = ['1','2','3','4','5','6','7','8','9','10'];
    const classes = {};
    for (const [index, name] of classNames.entries()) {
      classes[name] = await one(client, `
        INSERT INTO classes (tenant_id, school_id, name, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (school_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order
        RETURNING id
      `, [tenant.id, school.id, name, index + 1]);
    }

    const sections = {};
    for (const className of classNames) {
      for (const sectionName of ['A', 'B']) {
        const key = `${className}-${sectionName}`;
        sections[key] = await one(client, `
          INSERT INTO sections (tenant_id, branch_id, academic_year_id, class_id, name, capacity)
          VALUES ($1, $2, $3, $4, $5, 40)
          ON CONFLICT (branch_id, academic_year_id, class_id, name) DO UPDATE SET capacity = EXCLUDED.capacity
          RETURNING id
        `, [tenant.id, branches['ECH-MAIN'].id, year.id, classes[className].id, sectionName]);
      }
    }

    const subjectRows = [
      ['LANG1', 'Language 1 — English'], ['LANG2', 'Language 2 — Hindi'],
      ['MATH', 'Mathematics'], ['SCI', 'Science'], ['SOC', 'Social Studies'],
      ['GK', 'General Knowledge'], ['PT', 'Physical Training'], ['COMP', 'Computer'],
    ];
    const subjects = {};
    for (const [code, name] of subjectRows) {
      subjects[code] = await one(client, `
        INSERT INTO subjects (tenant_id, school_id, code, name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (school_id, code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [tenant.id, school.id, code, name]);
    }

    const existingGlobal = await one(client, `
      SELECT id FROM users WHERE tenant_id = $1 AND role = 'GLOBAL_ADMIN' AND login_id = 'superadmin' LIMIT 1
    `, [tenant.id]);
    if (existingGlobal) {
      await client.query(`UPDATE users SET password_hash=$1, display_name='TraitEdu Global Administrator', status='ACTIVE' WHERE id=$2`, [globalHash, existingGlobal.id]);
    } else {
      await client.query(`
        INSERT INTO users (tenant_id, login_id, password_hash, display_name, role, must_change_password)
        VALUES ($1, 'superadmin', $2, 'TraitEdu Global Administrator', 'GLOBAL_ADMIN', true)
      `, [tenant.id, globalHash]);
    }

    for (const branch of Object.values(branches)) {
      const existingAdmin = await one(client, `
        SELECT id FROM users WHERE tenant_id=$1 AND school_id=$2 AND branch_id=$3
          AND role='BRANCH_ADMIN' AND login_id='admin' LIMIT 1
      `, [tenant.id, school.id, branch.id]);
      if (existingAdmin) {
        await client.query(`UPDATE users SET password_hash=$1, display_name='Branch Administrator', status='ACTIVE' WHERE id=$2`, [adminHash, existingAdmin.id]);
      } else {
        await client.query(`
          INSERT INTO users (tenant_id, school_id, branch_id, login_id, password_hash, display_name, role, must_change_password)
          VALUES ($1, $2, $3, 'admin', $4, 'Branch Administrator', 'BRANCH_ADMIN', true)
        `, [tenant.id, school.id, branch.id, adminHash]);
      }
    }

    const teacherRows = [
      ['T1001', 'Mrs. Anjali Sharma', 'anjali.sharma@echamps.school', 'MATH'],
      ['T1002', 'Mr. Aditya Rao', 'aditya.rao@echamps.school', 'SCI'],
      ['T1003', 'Ms. Kavitha Reddy', 'kavitha.reddy@echamps.school', 'LANG1'],
    ];
    for (const [code, name, email, subjectCode] of teacherRows) {
      const teacher = await one(client, `
        INSERT INTO teachers (tenant_id, school_id, branch_id, employee_code, full_name, email, primary_subject_id, joining_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, '2024-06-01')
        ON CONFLICT (branch_id, employee_code) DO UPDATE SET
          full_name=EXCLUDED.full_name, email=EXCLUDED.email, primary_subject_id=EXCLUDED.primary_subject_id
        RETURNING id
      `, [tenant.id, school.id, branches['ECH-MAIN'].id, code, name, email, subjects[subjectCode].id]);
      let teacherUser = await one(client, `
        SELECT id FROM users WHERE tenant_id=$1 AND school_id=$2 AND branch_id=$3
          AND role='TEACHER' AND lower(login_id)=lower($4) LIMIT 1
      `, [tenant.id, school.id, branches['ECH-MAIN'].id, code]);
      if (teacherUser) {
        await client.query(`UPDATE users SET password_hash=$1, display_name=$2, status='ACTIVE' WHERE id=$3`, [teacherHash, name, teacherUser.id]);
      } else {
        teacherUser = await one(client, `
          INSERT INTO users (tenant_id, school_id, branch_id, login_id, password_hash, display_name, role, email, must_change_password)
          VALUES ($1, $2, $3, $4, $5, $6, 'TEACHER', $7, true) RETURNING id
        `, [tenant.id, school.id, branches['ECH-MAIN'].id, code, teacherHash, name, email]);
      }
      await client.query('UPDATE teachers SET user_id=$1 WHERE id=$2', [teacherUser.id, teacher.id]);
    }

    const studentRows = [
      ['5996024', 'ADM-5996024', 'Jyohan Naidu Girinadhuni', '2010-05-14', '10', 'A', 'G Mallikarjuna', '+91 90000 20001'],
      ['5996025', 'ADM-5996025', 'Aisha Kumar', '2010-08-21', '10', 'A', 'Ravi Kumar', '+91 90000 20002'],
      ['5996026', 'ADM-5996026', 'Rohan Patel', '2010-02-11', '10', 'B', 'Amit Patel', '+91 90000 20003'],
    ];
    for (const [code, admission, name, dob, className, sectionName, guardianName, phone] of studentRows) {
      const student = await one(client, `
        INSERT INTO students (tenant_id, school_id, branch_id, admission_number, student_code, full_name, date_of_birth, joining_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, '2025-06-09')
        ON CONFLICT (branch_id, student_code) DO UPDATE SET
          admission_number=EXCLUDED.admission_number, full_name=EXCLUDED.full_name, date_of_birth=EXCLUDED.date_of_birth
        RETURNING id
      `, [tenant.id, school.id, branches['ECH-MAIN'].id, admission, code, name, dob]);
      let studentUser = await one(client, `
        SELECT id FROM users WHERE tenant_id=$1 AND school_id=$2 AND branch_id=$3
          AND role='STUDENT' AND lower(login_id)=lower($4) LIMIT 1
      `, [tenant.id, school.id, branches['ECH-MAIN'].id, code]);
      if (studentUser) {
        await client.query(`
          UPDATE users SET password_hash=$1, display_name=$2, status='ACTIVE' WHERE id=$3
        `, [studentHash, name, studentUser.id]);
      } else {
        studentUser = await one(client, `
          INSERT INTO users (tenant_id, school_id, branch_id, login_id, password_hash, display_name, role, must_change_password)
          VALUES ($1, $2, $3, $4, $5, $6, 'STUDENT', true) RETURNING id
        `, [tenant.id, school.id, branches['ECH-MAIN'].id, code, studentHash, name]);
      }
      await client.query('UPDATE students SET user_id=$1 WHERE id=$2', [studentUser.id, student.id]);
      const guardian = await one(client, `
        SELECT id FROM guardians WHERE tenant_id=$1 AND branch_id=$2 AND full_name=$3 AND phone=$4 LIMIT 1
      `, [tenant.id, branches['ECH-MAIN'].id, guardianName, phone]) ?? await one(client, `
        INSERT INTO guardians (tenant_id, branch_id, full_name, relationship, phone)
        VALUES ($1, $2, $3, 'Parent', $4) RETURNING id
      `, [tenant.id, branches['ECH-MAIN'].id, guardianName, phone]);
      await client.query(`
        INSERT INTO student_guardians (student_id, guardian_id, is_primary)
        VALUES ($1, $2, true) ON CONFLICT (student_id, guardian_id) DO UPDATE SET is_primary=true
      `, [student.id, guardian.id]);
      await client.query(`
        INSERT INTO student_enrollments (tenant_id, student_id, academic_year_id, section_id, roll_number)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (student_id, academic_year_id) DO UPDATE SET section_id=EXCLUDED.section_id, roll_number=EXCLUDED.roll_number
      `, [tenant.id, student.id, year.id, sections[`${className}-${sectionName}`].id, code.slice(-2)]);
    }

    for (const [label, minimum, maximum, resultStatus] of [
      ['A+', 91, 100, 'PASS'], ['A', 81, 90, 'PASS'], ['B+', 71, 80, 'PASS'],
      ['B', 61, 70, 'PASS'], ['C', 51, 60, 'PASS'], ['D', 35, 50, 'PASS'], ['Fail', 0, 34, 'FAIL'],
    ]) {
      await client.query(`
        INSERT INTO grade_rules (tenant_id, school_id, academic_year_id, label, minimum_percentage, maximum_percentage, result_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (school_id, academic_year_id, label) DO UPDATE SET
          minimum_percentage=EXCLUDED.minimum_percentage, maximum_percentage=EXCLUDED.maximum_percentage, result_status=EXCLUDED.result_status
      `, [tenant.id, school.id, year.id, label, minimum, maximum, resultStatus]);
    }

    await client.query('COMMIT');
    console.log('Database seed completed.');
    console.log('Tenant: TraitEdu Education Network');
    console.log('School: E-CHAMPS Public School');
    console.log('Branches: ECH-MAIN, ECH-NORTH');
    console.log('Development logins seeded: superadmin, branch admins, and students (passwords read from environment/default local values).');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(error => {
  console.error('Database seed failed:', error.message);
  process.exit(1);
});
