import pg from 'pg';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Determine connection options based on environment
let connectionOptions;

if (isProduction) {
  // Production: Use Supabase
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env for production.');
  }

  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  const supabaseHost = supabaseUrl.hostname;

  connectionOptions = {
    host: supabaseHost,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
  };

  console.log(`🔗 Using Supabase for production: ${supabaseHost}`);
} else {
  // Development: Use local PostgreSQL
  if (!process.env.DATABASE_PASSWORD && !process.env.DATABASE_URL) {
    throw new Error('Database credentials not configured. Add DATABASE_PASSWORD or DATABASE_URL to .env for development.');
  }

  connectionOptions = process.env.DATABASE_HOST
    ? {
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT ?? 5432),
        database: process.env.DATABASE_NAME ?? 'traitedu',
        user: process.env.DATABASE_USER ?? 'traitedu_app',
        password: process.env.DATABASE_PASSWORD,
      }
    : { connectionString: process.env.DATABASE_URL };

  console.log('🔗 Using local PostgreSQL for development');
}

const pool = new Pool({
  ...connectionOptions,
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', error => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export async function checkDatabase() {
  const result = await pool.query('SELECT current_database() AS database, current_user AS database_user, now() AS server_time');
  return result.rows[0];
}

export default pool;
