import pg from 'pg';
const { Client } = pg;

const pgClient = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgClient.connect();

console.log('=== Actualizando cotización 3 en Postgres con llaves válidas de SQL Server ===');

// 1. Cliente -> document
const customer = await pgClient.query(`
  SELECT id, document FROM public."Client" WHERE id = (SELECT "clientId" FROM public."Quotation" WHERE id = 3)
`);
console.log('Client original de Q3:', customer.rows[0]);
await pgClient.query(`
  UPDATE public."Client" SET "document" = '0000001091' WHERE id = $1
`, [customer.rows[0].id]);

// 2. Vendedor -> Seller
// spExportQuotation hace: JOIN public.Seller s ON q.sellerId = s.id (o similar)
// Buscamos qué vendedor tiene la cotización 3
const q3 = await pgClient.query(`
  SELECT id, "sellerId", "ticketPrinterId", "branchId" FROM public."Quotation" WHERE id = 3
`);
console.log('Quotation 3 metadata:', q3.rows[0]);

if (q3.rows[0].sellerId) {
  await pgClient.query(`
    UPDATE public."Seller" SET "code" = '000' WHERE id = $1
  `, [q3.rows[0].sellerId]);
} else {
  // Si no tiene, le ponemos uno
  const s = await pgClient.query('SELECT id FROM public."Seller" LIMIT 1');
  if (s.rows[0]) {
    await pgClient.query('UPDATE public."Quotation" SET "sellerId" = $1 WHERE id = 3', [s.rows[0].id]);
    await pgClient.query('UPDATE public."Seller" SET "code" = \'000\' WHERE id = $1', [s.rows[0].id]);
  }
}

// 3. Tiqueteador -> TicketPrinter
if (q3.rows[0].ticketPrinterId) {
  await pgClient.query(`
    UPDATE public."TicketPrinter" SET "code" = '01' WHERE id = $1
  `, [q3.rows[0].ticketPrinterId]);
} else {
  const tp = await pgClient.query('SELECT id FROM public."TicketPrinter" LIMIT 1');
  if (tp.rows[0]) {
    await pgClient.query('UPDATE public."Quotation" SET "ticketPrinterId" = $1 WHERE id = 3', [tp.rows[0].id]);
    await pgClient.query('UPDATE public."TicketPrinter" SET "code" = \'01\' WHERE id = $1', [tp.rows[0].id]);
  }
}

// 4. Sucursal -> Branch
if (q3.rows[0].branchId) {
  await pgClient.query(`
    UPDATE public."Branch" SET "code" = '001' WHERE id = $1
  `, [q3.rows[0].branchId]);
}

// 5. Proveedor -> Provider
const qpProviders = await pgClient.query(`
  SELECT DISTINCT p.id, p.code 
  FROM public."QuotationProduct" qp
  JOIN public."Provider" p ON qp."providerId" = p.id
  WHERE qp."quotationId" = 3
`);
console.log('Providers de Q3 en Postgres:', qpProviders.rows);
for (const p of qpProviders.rows) {
  await pgClient.query(`
    UPDATE public."Provider" SET "code" = '0000001091' WHERE id = $1
  `, [p.id]);
}

console.log('Postgres actualizado con éxito.');
await pgClient.end();
