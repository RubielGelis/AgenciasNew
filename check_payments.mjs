import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new',
});

async function run() {
  await client.connect();
  
  const payload = {
    "clientId": 1,
    "currency": "COP",
    "exchangeRate": 1,
    "totalAmount": 100,
    "branchId": 1,
    "commissionPercentage": 0,
    "retentionPercentage": 0,
    "state": "NUEVO",
    "items": [
      {
        "ticketCode": "TEST_PAYMENTS_FINAL",
        "quantity": 1,
        "price": 100,
        "payments": [
          {
            "amount": 100,
            "paymentMethod": "Efectivo",
            "reference": "TEST",
            "date": "2026-06-30T00:00:00Z"
          }
        ]
      }
    ]
  };

  try {
    const res = await client.query('CALL public.spInvoicesCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)', [JSON.stringify(payload), 1, 0, '']);
    console.log("SP Result:", res.rows);
  } catch (err) {
    console.error("SP Error:", err);
  }

  const res = await client.query('SELECT * FROM "InvoicesProductPayment"');
  console.log("Payments count:", res.rowCount);
  console.log("Payments:", res.rows);
  
  await client.end();
}

run().catch(console.error);
