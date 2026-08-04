# Supabase Production Setup Guide

This app supports **dual-database architecture**:
- **Development**: Local PostgreSQL (faster, offline)
- **Production**: Supabase PostgreSQL (managed, scalable)

## Quick Start

### 1. Development Setup (Local PostgreSQL)

Your local development environment is already configured to use PostgreSQL running on `localhost:5432`.

```bash
# Ensure NODE_ENV is set to development
NODE_ENV=development npm run dev

# The app will use DATABASE_* variables from .env
```

### 2. Production Setup (Supabase)

#### Step 1: Prepare Supabase Database Schema

1. Go to your Supabase dashboard: https://pserepeylqabzxrourbv.supabase.co
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy & paste the entire schema from: `database/001_initial_schema.sql`
5. Click **Run**

> The schema creates all tables, functions, indexes, and triggers needed for the app.

#### Step 2: Verify Supabase Credentials in `.env`

Check your `.env` file has these Supabase variables:

```env
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To get these keys:
1. Go to your Supabase project
2. Click **Settings** → **API**
3. Copy the keys and paste them in `.env`

#### Step 3: Deploy to Production

When deploying to production, set:

```bash
NODE_ENV=production npm run server
```

The app will automatically:
- Detect `NODE_ENV=production`
- Use Supabase credentials instead of local PostgreSQL
- Connect to Supabase using the service role key

## How It Works

The app uses smart environment detection in `server/db/pool.js`:

```javascript
if (NODE_ENV === 'production') {
  // Use Supabase
  // Connects to: postgres@supabase-host:5432
  // Auth: Service role key
} else {
  // Use local PostgreSQL
  // Connects to: localhost:5432
  // Auth: Local database credentials
}
```

## Data Migration

### Migrating Existing Data to Supabase

If you have existing data in local PostgreSQL:

```bash
# 1. Backup local data
pg_dump -U traitedu_app -d traitedu > backup.sql

# 2. (Manual) Restore to Supabase using SQL Editor
# - Use Supabase SQL Editor to run your backup SQL
# - Or use pg_restore with Supabase connection string

# 3. Test Supabase connection
NODE_ENV=production npm run server
```

## Environment Variables Reference

| Variable | Development | Production | Purpose |
|----------|-------------|-----------|---------|
| `NODE_ENV` | `development` | `production` | Switches database connection |
| `DATABASE_HOST` | `localhost` | ❌ Not used | Local DB host |
| `DATABASE_USER` | `traitedu_app` | ❌ Not used | Local DB user |
| `DATABASE_PASSWORD` | `Trait@1234` | ❌ Not used | Local DB password |
| `SUPABASE_URL` | Optional | ✅ Required | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | ✅ Required | Supabase service role API key |
| `SESSION_SECRET` | Dev value | ✅ Change it | Session encryption key |

## Troubleshooting

### Connection Timeout to Supabase

**Problem**: `Error: connection to server timed out`

**Solution**:
1. Check your Supabase project is active
2. Verify `SUPABASE_URL` is correct
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid
4. Check your network can reach Supabase (firewall rules)

### Schema Not Found on Supabase

**Problem**: `relation "users" does not exist`

**Solution**:
1. Ensure you ran the schema SQL in Supabase SQL Editor
2. Verify the query ran without errors
3. Check schema is in correct database/schema

### Authentication Errors

**Problem**: `password authentication failed`

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
2. Check key hasn't expired in Supabase dashboard

## Next Steps

1. ✅ Update app code to use both databases (DONE)
2. ⬜ Apply schema to Supabase via SQL Editor
3. ⬜ Set `NODE_ENV=production` and test connection
4. ⬜ Deploy to your production server

## Support

For Supabase issues:
- Documentation: https://supabase.com/docs
- Dashboard: https://pserepeylqabzxrourbv.supabase.co
