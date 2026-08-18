require('dotenv').config();
const { Client } = require('pg');

async function fixPrintCustomizationSeq() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log("Fixing QuotationPrintCustomization sequence default...");
        await client.query(`
            CREATE SEQUENCE IF NOT EXISTS public."QuotationPrintCustomization_id_seq";
            ALTER TABLE public."QuotationPrintCustomization" ALTER COLUMN id SET DEFAULT nextval('public."QuotationPrintCustomization_id_seq"'::regclass);
            ALTER SEQUENCE public."QuotationPrintCustomization_id_seq" OWNED BY public."QuotationPrintCustomization".id;
        `);
        console.log("Sequence default fixed successfully!");

        const res = await client.query(`
            SELECT column_name, column_default 
            FROM information_schema.columns 
            WHERE table_name='QuotationPrintCustomization' AND column_name='id';
        `);
        console.log("Verified QuotationPrintCustomization.id default:", res.rows[0]);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

fixPrintCustomizationSeq();
