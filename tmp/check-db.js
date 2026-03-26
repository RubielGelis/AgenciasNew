const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });
pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`,
    (err, res) => {
        if (err) { console.error('DB ERROR:', err.message); process.exit(1); } 
        res.rows.forEach(r => console.log(r.table_name));
        pool.end();
    }
);
