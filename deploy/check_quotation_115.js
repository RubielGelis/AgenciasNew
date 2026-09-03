const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
c.connect().then(async () => {
    const qRes = await c.query('SELECT id, "totalAmount", "costoTotal", "valorBase", "utilidad" FROM public."Quotation" WHERE id = 115');
    console.log('Quotation 115 record in DB:', qRes.rows[0]);

    const qpRes = await c.query('SELECT id, price, cost FROM public."QuotationProduct" WHERE "quotationId" = 115');
    console.log('Quotation 115 QuotationProduct:', qpRes.rows);

    const qptRes = await c.query(`
        SELECT qpt.id, qpt."chargeAndTaxId", qpt.amount, qpt."explicitAmount", ct.name, ct.type, ct."valueType", ct."targetTaxId"
        FROM public."QuotationProductTax" qpt
        JOIN public."ChargeAndTax" ct ON ct.id = qpt."chargeAndTaxId"
        WHERE qpt."quotationProductId" IN (SELECT id FROM public."QuotationProduct" WHERE "quotationId" = 115)
    `);
    console.log('Quotation 115 QuotationProductTax:', qptRes.rows);

    const rptRes = await c.query('SELECT * FROM public."fnRptCotizacion"(115, 115)');
    console.log('fnRptCotizacion output for 115:');
    if (rptRes.rows.length > 0) {
        const row = rptRes.rows[0];
        console.log('Header valorBase:', row.valorBase);
        console.log('Header costoTotal:', row.costoTotal);
        console.log('Header utilidad:', row.utilidad);
        console.log('Item tarifaNeta:', row.tarifaNeta);
        console.log('Item adicionalesServ:', row.adicionalesServ);
        console.log('Item impuestos:', row.impuestos);
        console.log('Item total:', row.total);
    }
}).finally(() => c.end());
