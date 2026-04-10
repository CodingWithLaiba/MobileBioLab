import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// Create a connection to the default 'postgres' database to drop/create our database
const adminPool = new Pool({
  user: process.env.PGUSER || 'postgres', 
  password: process.env.PGPASSWORD || 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: 'postgres' // Connect to default postgres database
});

const DB_NAME = 'mobile_bio_lab';

async function resetDatabase() {
  const client = await adminPool.connect();
  
  try {
    // Terminate all connections to the database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid();
    `, [DB_NAME]);

    // Drop the database if it exists
    console.log(`Dropping database ${DB_NAME}...`);
    await client.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    
    // Create a new database
    console.log(`Creating database ${DB_NAME}...`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    
    console.log(`Database ${DB_NAME} has been reset successfully.`);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    client.release();
    await adminPool.end();
  }
}

resetDatabase();
