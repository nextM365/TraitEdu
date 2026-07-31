-- TraitEdu multi-tenant school platform
-- PostgreSQL 15+
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL UNIQUE,
  name varchar(180) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  code varchar(40) NOT NULL,
  name varchar(180) NOT NULL,
  address text,
  principal_name varchar(160),
  phone varchar(30),
  email varchar(255),
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  code varchar(40) NOT NULL,
  name varchar(180) NOT NULL,
  address text,
  phone varchar(30),
  email varchar(255),
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid REFERENCES schools(id),
  branch_id uuid REFERENCES branches(id),
  login_id varchar(100) NOT NULL,
  password_hash text NOT NULL,
  display_name varchar(180) NOT NULL,
  email varchar(255),
  phone varchar(30),
  role varchar(30) NOT NULL CHECK (role IN ('GLOBAL_ADMIN','SCHOOL_ADMIN','BRANCH_ADMIN','TEACHER','PARENT','STUDENT')),
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DISABLED','LOCKED')),
  must_change_password boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, school_id, branch_id, login_id)
);

CREATE TABLE academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  name varchar(20) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, name),
  CHECK (end_date > start_date)
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  name varchar(40) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (school_id, name)
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  name varchar(20) NOT NULL,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  UNIQUE (branch_id, academic_year_id, class_id, name)
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  code varchar(30) NOT NULL,
  name varchar(100) NOT NULL,
  subject_type varchar(20) NOT NULL DEFAULT 'SCHOLASTIC' CHECK (subject_type IN ('SCHOLASTIC','CO_SCHOLASTIC')),
  UNIQUE (school_id, code)
);

CREATE TABLE guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  user_id uuid UNIQUE REFERENCES users(id),
  full_name varchar(180) NOT NULL,
  relationship varchar(40) NOT NULL,
  phone varchar(30),
  email varchar(255),
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  user_id uuid UNIQUE REFERENCES users(id),
  admission_number varchar(60) NOT NULL,
  student_code varchar(60) NOT NULL,
  roll_number varchar(30),
  full_name varchar(180) NOT NULL,
  date_of_birth date,
  gender varchar(20),
  photo_url text,
  joining_date date NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','ALUMNI','TRANSFERRED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, admission_number),
  UNIQUE (branch_id, student_code)
);

CREATE TABLE student_guardians (
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  can_pickup boolean NOT NULL DEFAULT true,
  PRIMARY KEY (student_id, guardian_id)
);

CREATE TABLE student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  student_id uuid NOT NULL REFERENCES students(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  roll_number varchar(30),
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PROMOTED','DETAINED','TRANSFERRED','COMPLETED')),
  enrolled_at date NOT NULL DEFAULT current_date,
  UNIQUE (student_id, academic_year_id)
);

CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  user_id uuid UNIQUE REFERENCES users(id),
  employee_code varchar(60) NOT NULL,
  full_name varchar(180) NOT NULL,
  email varchar(255),
  phone varchar(30),
  primary_subject_id uuid REFERENCES subjects(id),
  joining_date date,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','LEFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, employee_code)
);

CREATE TABLE teacher_specializations (
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id),
  PRIMARY KEY (teacher_id, subject_id)
);

CREATE TABLE teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  is_class_teacher boolean NOT NULL DEFAULT false,
  UNIQUE (teacher_id, section_id, subject_id)
);

CREATE TABLE teacher_duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  title varchar(180) NOT NULL,
  description text,
  starts_on date,
  ends_on date,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','CANCELLED'))
);

CREATE TABLE timetable_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room varchar(60),
  CHECK (end_time > start_time)
);

CREATE TABLE admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  application_number varchar(60) NOT NULL,
  student_name varchar(180) NOT NULL,
  date_of_birth date,
  guardian_name varchar(180) NOT NULL,
  guardian_phone varchar(30),
  guardian_email varchar(255),
  requested_class_id uuid REFERENCES classes(id),
  requested_section varchar(20),
  previous_school varchar(180),
  enquiry_source varchar(80),
  current_stage varchar(50) NOT NULL DEFAULT 'ADMISSION_ENQUIRY',
  assessment_required boolean NOT NULL DEFAULT false,
  assessment_type varchar(30),
  assessment_date timestamptz,
  assessment_result varchar(20),
  review_notes text,
  fee_status varchar(20) NOT NULL DEFAULT 'PENDING',
  approved_at timestamptz,
  enrolled_student_id uuid REFERENCES students(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, application_number)
);

CREATE TABLE admission_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  application_id uuid NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
  document_type varchar(80) NOT NULL,
  file_url text,
  status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','UPLOADED','VERIFIED','REJECTED')),
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz
);

CREATE TABLE exam_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  name varchar(100) NOT NULL,
  start_date date,
  end_date date,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, academic_year_id, name)
);

CREATE TABLE exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  series_id uuid NOT NULL REFERENCES exam_series(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES sections(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  exam_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  room varchar(80),
  max_marks numeric(7,2) NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  pass_marks numeric(7,2) NOT NULL DEFAULT 35 CHECK (pass_marks >= 0),
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','COMPLETED')),
  UNIQUE (series_id, section_id, subject_id),
  CHECK (end_time > start_time),
  CHECK (pass_marks <= max_marks)
);

CREATE TABLE grade_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  label varchar(20) NOT NULL,
  minimum_percentage numeric(5,2) NOT NULL,
  maximum_percentage numeric(5,2) NOT NULL,
  result_status varchar(20) NOT NULL DEFAULT 'PASS' CHECK (result_status IN ('PASS','FAIL')),
  UNIQUE (school_id, academic_year_id, label),
  CHECK (minimum_percentage BETWEEN 0 AND 100),
  CHECK (maximum_percentage BETWEEN 0 AND 100),
  CHECK (minimum_percentage <= maximum_percentage)
);

CREATE TABLE student_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  schedule_id uuid NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id),
  marks_obtained numeric(7,2),
  grade varchar(20),
  remarks text,
  attendance_status varchar(20) NOT NULL DEFAULT 'PRESENT' CHECK (attendance_status IN ('PRESENT','ABSENT','EXEMPTED')),
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED')),
  entered_by uuid REFERENCES users(id),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, student_id)
);

CREATE TABLE student_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  series_id uuid NOT NULL REFERENCES exam_series(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id),
  total_marks numeric(10,2) NOT NULL DEFAULT 0,
  obtained_marks numeric(10,2) NOT NULL DEFAULT 0,
  percentage numeric(5,2) NOT NULL DEFAULT 0,
  overall_grade varchar(20),
  result_status varchar(20) NOT NULL CHECK (result_status IN ('PASS','FAIL','WITHHELD')),
  rank integer,
  teacher_comment text,
  school_comment text,
  attendance_percentage numeric(5,2),
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED')),
  generated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE (series_id, student_id)
);

CREATE TABLE fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  name varchar(100) NOT NULL,
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  UNIQUE (branch_id, academic_year_id, class_id, name)
);

CREATE TABLE student_fee_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  student_id uuid NOT NULL REFERENCES students(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  fee_structure_id uuid NOT NULL REFERENCES fee_structures(id),
  gross_amount numeric(12,2) NOT NULL,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  net_amount numeric(12,2) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','PAID','WAIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);

CREATE TABLE fee_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  fee_account_id uuid NOT NULL REFERENCES student_fee_accounts(id) ON DELETE CASCADE,
  label varchar(100) NOT NULL,
  due_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','OVERDUE','WAIVED')),
  UNIQUE (fee_account_id, label)
);

CREATE TABLE fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  fee_account_id uuid NOT NULL REFERENCES student_fee_accounts(id),
  installment_id uuid REFERENCES fee_installments(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_at timestamptz NOT NULL DEFAULT now(),
  method varchar(30) NOT NULL,
  reference_number varchar(120),
  status varchar(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  received_by uuid REFERENCES users(id)
);

CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  student_id uuid NOT NULL REFERENCES students(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  attendance_date date NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('PRESENT','LATE','ABSENT','LEAVE','HOLIDAY')),
  remarks text,
  marked_by uuid REFERENCES users(id),
  UNIQUE (student_id, attendance_date)
);

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  title varchar(200) NOT NULL,
  description text,
  image_url text,
  audience varchar(30) NOT NULL DEFAULT 'ALL',
  class_id uuid REFERENCES classes(id),
  section_id uuid REFERENCES sections(id),
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  published_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  title varchar(200) NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location varchar(180),
  status varchar(20) NOT NULL DEFAULT 'DRAFT',
  created_by uuid REFERENCES users(id)
);

CREATE TABLE event_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type varchar(20) NOT NULL CHECK (media_type IN ('IMAGE','VIDEO','DOCUMENT')),
  caption text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  student_id uuid REFERENCES students(id),
  category varchar(60),
  message text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','IN_REVIEW','RESOLVED','CLOSED')),
  assigned_to uuid REFERENCES users(id),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE parent_concerns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  guardian_id uuid REFERENCES guardians(id),
  student_id uuid REFERENCES students(id),
  title varchar(200) NOT NULL,
  description text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'NEW',
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  registration_number varchar(40) NOT NULL,
  route_name varchar(120) NOT NULL,
  driver_name varchar(160),
  driver_phone varchar(30),
  tracking_device_id varchar(100),
  UNIQUE (branch_id, registration_number)
);

CREATE TABLE student_transport (
  student_id uuid NOT NULL REFERENCES students(id),
  bus_id uuid NOT NULL REFERENCES buses(id),
  pickup_stop varchar(180),
  drop_stop varchar(180),
  active_from date NOT NULL,
  active_to date,
  PRIMARY KEY (student_id, bus_id, active_from)
);

CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  actor_user_id uuid REFERENCES users(id),
  action varchar(80) NOT NULL,
  entity_type varchar(80) NOT NULL,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_scope_role ON users (tenant_id, school_id, branch_id, role);
CREATE INDEX idx_students_branch_name ON students (branch_id, full_name);
CREATE INDEX idx_enrollments_section ON student_enrollments (section_id, status);
CREATE INDEX idx_admissions_branch_stage ON admission_applications (branch_id, current_stage);
CREATE INDEX idx_exam_schedule_section_date ON exam_schedules (section_id, exam_date);
CREATE INDEX idx_marks_student ON student_marks (student_id, status);
CREATE INDEX idx_results_student ON student_results (student_id, status);
CREATE INDEX idx_installments_due_status ON fee_installments (due_date, status);
CREATE INDEX idx_payments_account_date ON fee_payments (fee_account_id, paid_at);
CREATE INDEX idx_attendance_section_date ON attendance_records (section_id, attendance_date);
CREATE INDEX idx_announcements_audience ON announcements (branch_id, status, published_at);
CREATE INDEX idx_audit_tenant_entity ON audit_logs (tenant_id, entity_type, entity_id);

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'tenants','schools','branches','users','academic_years','guardians','students','teachers',
    'admission_applications','exam_series','student_marks','student_results','student_fee_accounts'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END $$;

COMMIT;
