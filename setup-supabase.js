import pkg from 'pg';
const { Client } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Parse Supabase connection URL
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL not found in .env');
  process.exit(1);
}

// Extract host and port from Supabase URL
const urlObj = new URL(supabaseUrl);
const supabaseHost = urlObj.hostname;

const connectionString = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${supabaseHost}:5432/postgres`
  : null;

if (!connectionString) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.error('   Make sure you have the service_role key in your .env file');
  process.exit(1);
}

async function setupDatabase() {
  let client;
  try {
    console.log('🔌 Connecting to Supabase...');
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', '001_initial_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📝 Applying database schema...');

    // Execute the schema
    await client.query(schema);
    console.log('✅ Database schema applied successfully');

    // Run seed if requested
    const seedPath = path.join(process.cwd(), 'server', 'db', 'seed.js');
    if (fs.existsSync(seedPath) && process.argv.includes('--seed')) {
      console.log('🌱 Seeding database...');
      // Dynamic import of seed script
      const { default: seed } = await import(seedPath);
      if (typeof seed === 'function') {
        await seed();
        console.log('✅ Database seeded successfully');
      }
    }

    console.log('\n✨ Supabase setup complete!');
    console.log('📌 Next steps:');
    console.log('   1. Update .env with SUPABASE_URL and API keys');
    console.log('   2. Set NODE_ENV=production when deploying');
    console.log('   3. Use local PostgreSQL for development');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('SASL')) {
      console.error('\n💡 Tip: Check your SUPABASE_SERVICE_ROLE_KEY in .env');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

setupDatabase();
