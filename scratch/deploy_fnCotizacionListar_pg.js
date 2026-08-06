require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set in env");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const file = 'SQL/Function/fnCotizacionListar.sql';
    console.log(`Reading ${file}...`);
    const fullPath = path.join(__dirname, '..', file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    
    console.log("Running SQL on database...");
    await client.query(sql);
    console.log("SUCCESS: Stored procedure deployed successfully!");
  } catch (err) {
    console.error("DEPLOYMENT ERROR:", err);
  } finally {
    await client.end();
  }
}

main();
