const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const keys = Object.keys(prisma);
console.log('Models found:', keys.filter(k => k[0] !== '$' && k[0] !== '_'));
process.exit(0);
