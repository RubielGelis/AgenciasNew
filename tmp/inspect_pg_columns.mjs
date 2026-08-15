import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await c.connect();
const res1 = await c.query('SELECT * FROM public."Client" LIMIT 1');
console.log('Client columns:', Object.keys(res1.rows[0]));
const res2 = await c.query('SELECT * FROM public."User" LIMIT 1');
console.log('User columns:', Object.keys(res2.rows[0]));
await c.end();
