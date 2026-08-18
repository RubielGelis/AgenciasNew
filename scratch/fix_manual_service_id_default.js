require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, column_default, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='QuotationManualService' AND column_name='id'
        `);
        console.log("Current column_default for id:", res.rows[0]?.column_default);

        // Ensure sequence exists and column default is set to nextval
        await client.query(`
            CREATE SEQUENCE IF NOT EXISTS public."QuotationManualService_id_seq";
            ALTER TABLE public."QuotationManualService" ALTER COLUMN id SET DEFAULT nextval('public."QuotationManualService_id_seq"'::regclass);
            ALTER SEQUENCE public."QuotationManualService_id_seq" OWNED BY public."QuotationManualService".id;
        `);
        console.log("Fixed sequence and DEFAULT nextval for QuotationManualService.id!");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

main();
