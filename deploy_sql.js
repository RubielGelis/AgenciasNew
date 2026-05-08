require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const files = [
      'SQL/Function/fnInterfacesList.sql',
      'SQL/Function/fnMasterList.sql',
      'SQL/SP/spEquivalencesInterfacesCrear.sql',
      'SQL/SP/spEquivalencesInterfacesConsultar.sql',
      'SQL/SP/spEquivalencesInterfacesEliminar.sql'
    ];

    for (const file of files) {
      console.log(`Executing ${file}...`);
      const fullPath = path.join(__dirname, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      
      // Prisma $executeRawUnsafe can execute statements
      await prisma.$executeRawUnsafe(sql);
      console.log(`Successfully executed ${file}`);
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
