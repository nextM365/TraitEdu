import pg from 'pg';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

let pool;

function getConnectionOptions() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    };
  }

  if (isProduction) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_DB_PASSWORD) {
      throw new Error('Production database credentials not configured. Add DATABASE_URL or SUPABASE_URL and SUPABASE_DB_PASSWORD.');
    }

    const supabaseUrl = new URL(process.env.SUPABASE_URL);
    return {
      host: process.env.SUPABASE_DB_HOST ?? `db.${supabaseUrl.hostname.replace('.supabase.co', '')}.supabase.co`,
      port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
      database: process.env.SUPABASE_DB_NAME ?? 'postgres',
      user: process.env.SUPABASE_DB_USER ?? 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    };
  }

  if (!process.env.DATABASE_PASSWORD) {
    throw new Error('Database credentials not configured. Add DATABASE_URL or DATABASE_PASSWORD to .env for development.');
  }

  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? 'traitedu',
    user: process.env.DATABASE_USER ?? 'traitedu_app',
    password: process.env.DATABASE_PASSWORD,
  };
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      ...getConnectionOptions(),
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', error => {
      console.error('Unexpected PostgreSQL pool error:', error.message);
    });
  }
  return pool;
}

export async function checkDatabase() {
  const result = await getPool().query('SELECT current_database() AS database, current_user AS database_user, now() AS server_time');
  return result.rows[0];
}

export default {
  query(...args) {
    return getPool().query(...args);
  },
  async end() {
    if (pool) {
      await pool.end();
      pool = undefined;
    }
  },
};
