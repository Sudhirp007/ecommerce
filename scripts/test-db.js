require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing!');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const rows = await sql`SELECT version(), current_database(), now() AS server_time`;
    console.log('--- NEON DATABASE CONNECTION VERIFIED ---');
    console.log('Database Name:', rows[0].current_database);
    console.log('Server Time:  ', rows[0].server_time);
    console.log('Version:      ', rows[0].version);
    console.log('Status:        ONLINE & OPERATIONAL');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
