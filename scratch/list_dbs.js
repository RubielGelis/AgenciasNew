const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT datname, pg_size_pretty(pg_database_size(datname)) as size 
      FROM pg_database 
      WHERE datistemplate = false;
    `);
    console.log('Available databases:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error listing databases:', err);
  } finally {
    await client.end();
  }
}

run();
