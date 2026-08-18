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
    console.log("Connected to PostgreSQL local database...");

    const rootDir = path.join(__dirname, '..');
    const folders = ['SQL/Function', 'SQL/SP'];

    for (const folder of folders) {
      const dirPath = path.join(rootDir, folder);
      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        console.log(`Deploying ${folder}/${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await client.query(sql);
          console.log(`  [OK] ${file}`);
        } catch (err) {
          console.error(`  [ERROR] ${file}:`, err.message);
        }
      }
    }
    
    console.log("\nFINISHED DEPLOYING ALL SQL FUNCTIONS AND PROCEDURES TO LOCAL POSTGRES.");

  } catch (err) {
    console.error("DEPLOYMENT ERROR:", err);
  } finally {
    await client.end();
  }
}

main();
