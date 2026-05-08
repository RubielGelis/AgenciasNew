const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });
client.connect()
    .then(async () => {
        // Create filters table
        await client.query(`
            CREATE TABLE IF NOT EXISTS public."ReportFilters" (
                id SERIAL PRIMARY KEY,
                report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
                table_alias VARCHAR(20),
                column_name VARCHAR(100) NOT NULL,
                filter_label VARCHAR(150),
                filter_type VARCHAR(50) NOT NULL, -- 'text', 'date', 'number'
                operator VARCHAR(20) DEFAULT '=',
                sort_order INTEGER DEFAULT 0
            );
        `);
        
        const sql = fs.readFileSync('SQL/Function/fnReportDinamic.sql', 'utf8');
        await client.query(sql);
        console.log('Database updated successfully!');
    })
    .catch(err => console.error(err))
    .finally(() => client.end());
