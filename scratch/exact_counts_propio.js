const { Client } = require('pg');

const connectionString = "postgresql://postgres:zzeusagencias@localhost:5432/Agencias_Propio?schema=public";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const tables = [
      'Quotation',
      'QuotationProduct',
      'Client',
      'Provider',
      'Prestadora',
      'Product',
      'Invoices',
      'InvoicesProduct',
      'SystemLog',
      'BookingGDS',
      'BookingProductGDS',
      'Airports',
      'Cities',
      'Countries'
    ];

    console.log('Exact row counts in Agencias_Propio:');
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (err) {
        console.log(`${table}: Error: ${err.message}`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
