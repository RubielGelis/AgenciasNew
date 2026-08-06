require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // File 1
    const file1 = 'SQL/Function/fnCotizacionListar.sql';
    console.log(`Executing ${file1}...`);
    const sql1 = fs.readFileSync(path.join(__dirname, '..', file1), 'utf8');
    await client.query(sql1);
    console.log(`SUCCESS: ${file1} deployed.`);

    // File 2
    const file2 = 'SQL/Function/fnCotizacionHistorial.sql';
    console.log(`Executing ${file2}...`);
    const sql2 = fs.readFileSync(path.join(__dirname, '..', file2), 'utf8');
    await client.query(sql2);
    console.log(`SUCCESS: ${file2} deployed.`);
    
  } catch (err) {
    console.error("DEPLOYMENT ERROR:", err);
  } finally {
    await client.end();
  }
}

main();
