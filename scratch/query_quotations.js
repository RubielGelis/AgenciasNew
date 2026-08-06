require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected.");
    const res = await client.query('SELECT id, "internalNumber", "clientId", "userId", state, "totalAmount" FROM public."Quotation" WHERE id IN (71, 64, 52)');
    console.log("Quotations:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
