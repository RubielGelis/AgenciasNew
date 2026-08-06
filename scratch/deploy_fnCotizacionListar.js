require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const file = 'SQL/Function/fnCotizacionListar.sql';
    console.log(`Executing ${file}...`);
    const fullPath = path.join(__dirname, '..', file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    
    // We execute the SQL on the DB.
    // In PostgreSQL, to execute multiple statements (DROP + CREATE), 
    // prisma.$executeRawUnsafe is perfect.
    await prisma.$executeRawUnsafe(sql);
    console.log(`Successfully executed and updated ${file}`);
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
