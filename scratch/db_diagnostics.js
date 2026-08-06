const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env file. process.env.DATABASE_URL is:', process.env.DATABASE_URL);
  process.exit(1);
}

async function run() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // 1. Get database size
    const dbSizeRes = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;`);
    console.log(`Database Size: ${dbSizeRes.rows[0].db_size}\n`);

    // 2. Get table sizes and row counts (approximated or exact)
    console.log('Table sizes and approximate row counts:');
    const tableStatsQuery = `
      SELECT 
        schemaname, 
        relname AS table_name, 
        n_live_tup AS approx_rows,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_size_pretty(pg_relation_size(relid)) AS table_size,
        pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC;
    `;
    const tableStatsRes = await client.query(tableStatsQuery);
    console.table(tableStatsRes.rows);

    // 3. Find slow queries or active queries if any (or query pg_stat_statements if available)
    try {
      console.log('\nChecking for pg_stat_statements extension...');
      const extRes = await client.query("SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'");
      if (extRes.rows.length > 0) {
        console.log('pg_stat_statements is active. Finding top 10 slow queries...');
        const slowQueriesQuery = `
          SELECT query, calls, total_exec_time, mean_exec_time, rows
          FROM pg_stat_statements
          ORDER BY total_exec_time DESC
          LIMIT 10;
        `;
        const slowQueriesRes = await client.query(slowQueriesQuery);
        console.table(slowQueriesRes.rows);
      } else {
        console.log('pg_stat_statements is not enabled.');
      }
    } catch (e) {
      console.log('Could not query pg_stat_statements:', e.message);
    }

    // 4. Index usage statistics
    console.log('\nTable Index Scan Ratios (Lower ratios might indicate missing indexes):');
    const indexUsageQuery = `
      SELECT 
        relname AS table_name, 
        seq_scan, 
        idx_scan,
        CASE WHEN (seq_scan + idx_scan) = 0 THEN 0
             ELSE ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
        END AS index_usage_percent
      FROM pg_stat_user_tables
      ORDER BY seq_scan DESC;
    `;
    const indexUsageRes = await client.query(indexUsageQuery);
    console.table(indexUsageRes.rows);

  } catch (err) {
    console.error('Error during diagnostics:', err);
  } finally {
    await client.end();
  }
}

run();
