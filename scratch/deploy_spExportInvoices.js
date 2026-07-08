const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  try {
    // 1. Drop old SP if it exists
    console.log('Dropping old spExportEnvoices if exists...');
    await client.query('DROP PROCEDURE IF EXISTS public."spExportEnvoices"(text, integer, inout text)');
    await client.query('DROP PROCEDURE IF EXISTS public.spexportenvoices(text, integer, inout text)');
    console.log('Dropped old procedure.');

    // 2. Read new SP
    const spPath = path.join(__dirname, '..', 'SQL', 'SP', 'spExportInvoices.sql');
    console.log('Reading new SP from:', spPath);
    const sql = fs.readFileSync(spPath, 'utf-8');
    await client.query(sql);
    console.log("Deployed spExportInvoices successfully.");
  } catch (err) {
    console.error("Deployment Error:", err);
  }
  await client.end();
}

run().catch(console.error);
