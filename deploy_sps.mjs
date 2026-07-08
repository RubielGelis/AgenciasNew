import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  
  try {
    const spCrear = fs.readFileSync(path.join(__dirname, 'SQL', 'SP', 'spInvoicesCrear.sql'), 'utf-8');
    const spActualizar = fs.readFileSync(path.join(__dirname, 'SQL', 'SP', 'spInvoicesActualizar.sql'), 'utf-8');
    
    await client.query(spCrear);
    console.log("Deployed spInvoicesCrear successfully.");
    
    await client.query(spActualizar);
    console.log("Deployed spInvoicesActualizar successfully.");
  } catch (err) {
    console.error("Deployment Error:", err);
  }
  
  await client.end();
}

run().catch(console.error);
