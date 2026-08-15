import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await c.connect();
const u = await c.query('SELECT id, name FROM public."User" LIMIT 5');
console.log('Users:', JSON.stringify(u.rows));
const q = await c.query('SELECT id, "quotationNumber", "userId" FROM public."Quotation" WHERE id=3');
console.log('Quotation 3:', JSON.stringify(q.rows));
await c.end();
