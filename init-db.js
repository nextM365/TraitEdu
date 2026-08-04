import pkg from 'pg';
const { Client, Pool } = pkg;

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'girinadhuni',
  password: ' ',
};

async function initDatabase() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create user
    try {
      await client.query('CREATE USER traitedu_app WITH PASSWORD \'Trait@1234\'');
      console.log('Created user traitedu_app');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('User traitedu_app already exists');
      } else {
        throw err;
      }
    }

    // Create database
    try {
      await client.query('CREATE DATABASE traitedu OWNER traitedu_app');
      console.log('Created database traitedu');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('Database traitedu already exists');
      } else {
        throw err;
      }
    }

    // Grant privileges
    await client.query('GRANT ALL PRIVILEGES ON DATABASE traitedu TO traitedu_app');
    console.log('Granted privileges to traitedu_app');

    await client.end();
    console.log('Database initialization complete');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

initDatabase();
