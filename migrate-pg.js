const { Client } = require('pg');
const client = new Client('postgresql://postgres:111985@localhost:5432/agencias_new');
client.connect().then(() => {
    return client.query(`
        ALTER TABLE public."InvoicesProductPayment"
        ADD COLUMN IF NOT EXISTS "creditCardId" INT,
        ADD COLUMN IF NOT EXISTS "cardNumber" VARCHAR(20),
        ADD COLUMN IF NOT EXISTS "authorizationCode" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "voucher" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "expirationDate" VARCHAR(10);
    `);
}).then(() => {
    console.log('Migration successful');
    client.end();
}).catch(err => {
    console.error('Error:', err);
    client.end();
});
