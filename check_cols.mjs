import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  
  try {
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='InvoicesProductPayment'
    `);
    console.log("Columns:", res.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Error:", err);
  }
  
  await client.end();
}

run().catch(console.error);
