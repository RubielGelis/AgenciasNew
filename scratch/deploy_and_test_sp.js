const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public" });

async function main() {
    try {
        console.log('--- Deploying updated spInvoicesCrear.sql ---');
        const sqlPath = path.join(__dirname, '..', 'SQL', 'SP', 'spInvoicesCrear.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Successfully deployed spInvoicesCrear.sql to PostgreSQL!');

        // Check initial state of DocumentResolution
        const initialRes = await pool.query('SELECT * FROM public."DocumentResolution" WHERE id = 1');
        const initialNum = initialRes.rows[0]?.currentNumber;
        console.log('Initial DocumentResolution currentNumber:', initialNum);

        // TEST 1: Fail case (Item without product ID and without valid ticketCode)
        console.log('\n--- TEST 1: Attempting to create invoice with INVALID ITEM ---');
        const failPayload = {
            clientId: 11,
            branchId: 8,
            currency: 'COP',
            items: [
                { productId: null, ticketCode: '', description: 'Invalid product item' }
            ]
        };

        const resFail = await pool.query(
            'CALL public.spInvoicesCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)',
            [JSON.stringify(failPayload), 1, 0, '']
        );
        console.log('Result from SP (Fail test):', resFail.rows[0]);

        // Check DocumentResolution after failed attempt
        const postFailRes = await pool.query('SELECT * FROM public."DocumentResolution" WHERE id = 1');
        const postFailNum = postFailRes.rows[0]?.currentNumber;
        console.log('DocumentResolution currentNumber after fail test:', postFailNum);

        if (initialNum === postFailNum) {
            console.log('SUCCESS: Consecutivo WAS NOT CONSUMED on error!');
        } else {
            console.error('FAILURE: Consecutivo was consumed on error!');
        }

        // TEST 2: Success case (Valid item)
        console.log('\n--- TEST 2: Attempting to create invoice with VALID ITEM ---');
        const successPayload = {
            clientId: 11,
            branchId: 8,
            currency: 'COP',
            items: [
                { productId: 1, quantity: 1, price: 50000, cost: 40000, type: 'Terrestre', description: 'Servicio Valido' }
            ]
        };

        const resSuccess = await pool.query(
            'CALL public.spInvoicesCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)',
            [JSON.stringify(successPayload), 1, 0, '']
        );
        console.log('Result from SP (Success test):', resSuccess.rows[0]);

        const newInvoiceId = resSuccess.rows[0]?.p_invoice_id;
        if (newInvoiceId) {
            const invRow = await pool.query('SELECT id, "internalNumber", serie, consecutivo FROM public."Invoices" WHERE id = $1', [newInvoiceId]);
            console.log('Created Invoice details in DB:', invRow.rows[0]);
        }

        // Check DocumentResolution after success attempt
        const postSuccessRes = await pool.query('SELECT * FROM public."DocumentResolution" WHERE id = 1');
        console.log('DocumentResolution currentNumber after success test:', postSuccessRes.rows[0]?.currentNumber);

    } catch (e) {
        console.error('Error during test execution:', e);
    } finally {
        await pool.end();
    }
}

main();
