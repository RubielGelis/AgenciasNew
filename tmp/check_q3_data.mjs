import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await c.connect();

// Get quotation 3 client data to find the long field
const q = await c.query(`
  SELECT 
    q.id,
    LENGTH(cl."name") as nombre_len,
    cl."name" as nombre,
    LENGTH(cl."city") as ciudad_len,
    cl."city" as ciudad,
    LENGTH(cl."contact") as contacto_len,
    cl."contact" as contacto,
    LENGTH(cl."address") as dir_len,
    cl."address" as direccion
  FROM public."Quotation" q
  LEFT JOIN public."Customer" cl ON cl.id = q."customerId"
  WHERE q.id = 3
`);
console.log('Quotation 3 client data:');
console.table(q.rows[0]);
await c.end();
