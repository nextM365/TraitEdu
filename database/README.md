# TraitEdu database

PostgreSQL 15+ is the recommended primary database. It provides transactions for
admissions and payments, strong relational integrity for school hierarchies, JSONB
for audit snapshots, reporting support, and optional row-level security.

## Apply the schema

```bash
createdb traitedu
psql -d traitedu -f database/001_initial_schema.sql
```

Production credentials should be supplied through environment variables. Never
store plain-text passwords; `users.password_hash` should contain an Argon2id or
bcrypt hash.

## Ownership hierarchy

```text
Tenant
└── School
    └── Branch
        ├── Academic year → Class → Section → Student enrollment
        ├── Teachers → Assignments / Duties / Timetable
        ├── Admissions → Documents → Enrollment
        ├── Exam series → Schedules → Marks → Results
        └── Fee structure → Student account → Installments → Payments
```

Historical facts are not overwritten. Enrollment, marks, results, installments,
payments, and attendance use separate rows per academic year or transaction.

## Tenant isolation

Every operational table contains `tenant_id`. The API must take tenant, school,
and branch scope from the authenticated session—not from client-submitted IDs.
For defense in depth, enable PostgreSQL Row Level Security after the API sets a
transaction-local tenant value:

```sql
SELECT set_config('app.tenant_id', '<tenant-uuid>', true);
```

Example policy:

```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY students_tenant_policy ON students
USING (tenant_id = current_setting('app.tenant_id')::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
```

Apply equivalent policies to every tenant-owned table. A global administrator
should use a separately audited database role or explicit service-layer bypass.

## Recommended application stack

- PostgreSQL 15+
- Prisma or Drizzle for migrations and typed queries
- Argon2id for password hashing
- S3-compatible object storage for documents, photos, and report cards
- Redis for sessions, rate limiting, caching, and background-job coordination
- A job queue for report-card generation, notifications, and fee reminders

The current prototype stores data in server memory. The next migration step is to
replace `server/data/tenants.js` reads and mutations with repositories backed by
this schema.
