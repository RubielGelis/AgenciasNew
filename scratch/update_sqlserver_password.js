const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`UPDATE public."SystemParameter" SET value = '111985' WHERE code = 'ClaveSQLServer'`);
    console.log('Successfully updated ClaveSQLServer password parameter. Rows affected:', res.rowCount);
  } catch (err) {
    console.error("Update Error:", err);
  }
  await client.end();
}

run().catch(console.error);
