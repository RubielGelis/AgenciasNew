const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  try { 
    const res = await prisma.$queryRawUnsafe('SELECT * FROM public."fnAirportListar"()'); 
    console.log(res); 
  } catch (e) { 
    console.error(e); 
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
main();
