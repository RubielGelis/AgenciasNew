import prisma from './src/lib/prisma.js';
const models = [
    'client', 'provider', 'branch', 'implant', 'product', 
    'chargeAndTax', 'seller', 'ticketPrinter', 'masterVariable', 
    'user', 'combo'
];
models.forEach(m => {
    console.log(`${m}: ${typeof prisma[m]}`);
    if (prisma[m] === undefined) {
        console.log(`---> ${m} is UNDEFINED!`);
    }
});
process.exit(0);
