const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

const sps = [
  'spImportInvoices.sql',
  'spExportInvoices.sql',
  'spInvoicesCrear.sql',
  'spInvoicesActualizar.sql'
];

async function run() {
  await client.connect();
  try {
    for (const sp of sps) {
      const spPath = path.join(__dirname, '..', 'SQL', 'SP', sp);
      console.log('Reading SP from:', spPath);
      const sql = fs.readFileSync(spPath, 'utf-8');
      await client.query(sql);
      console.log(`Deployed ${sp} successfully.`);
    }
  } catch (err) {
    console.error("Deployment Error:", err);
  }
  await client.end();
}

run().catch(console.error);
