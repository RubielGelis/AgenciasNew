const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT email FROM public."User"');
    console.log('Registered emails:');
    res.rows.forEach(row => console.log(`- ${row.email}`));
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
