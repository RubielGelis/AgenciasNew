import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

console.log('PrismaClient keys:', Object.keys(new PrismaClient()));
const prismaPath = require.resolve('@prisma/client');
console.log('Prisma Client Path:', prismaPath);

const packageJson = JSON.parse(fs.readFileSync(path.join(path.dirname(prismaPath), 'package.json'), 'utf8'));
console.log('Prisma Client Version:', packageJson.version);

if (new PrismaClient().combo) {
    console.log('Combo exists in Client');
} else {
    console.log('Combo is MISSING from Client');
}
process.exit(0);
