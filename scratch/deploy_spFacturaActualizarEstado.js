const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  try {
    const spPath = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturaActualizarEstado.sql');
    console.log('Reading SP from:', spPath);
    const sql = fs.readFileSync(spPath, 'utf-8');
    await client.query(sql);
    console.log("Deployed spFacturaActualizarEstado successfully.");
  } catch (err) {
    console.error("Deployment Error:", err);
  }
  await client.end();
}

run().catch(console.error);
