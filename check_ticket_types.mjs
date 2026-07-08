import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  
  try {
    const res = await client.query('SELECT * FROM public."TicketType"');
    console.log("Ticket Types:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  }
  
  await client.end();
}

run().catch(console.error);
