import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await c.connect();

// Find quotations that have payment methods and check data lengths
const q = await c.query(`
  SELECT 
    qp."quotationId" as quotation_id,
    COUNT(qpp.id) as total_formas_pago,
    MAX(LENGTH(cl."city")) as max_ciudad_len,
    MAX(LENGTH(cl."contact")) as max_contacto_len,
    MAX(LENGTH(cl."name")) as max_nombre_len
  FROM public."QuotationProductPayment" qpp
  JOIN public."QuotationProduct" qp ON qp.id = qpp."quotationProductId"
  JOIN public."Quotation" qt ON qt.id = qp."quotationId"
  LEFT JOIN public."Customer" cl ON cl.id = qt."customerId"
  GROUP BY qp."quotationId"
  ORDER BY qp."quotationId"
`);
console.log('Cotizaciones con formas de pago:');
console.table(q.rows);
await c.end();
