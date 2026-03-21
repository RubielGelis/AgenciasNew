async function testUpdate() {
  const comboId = 1; // Assuming combo with ID 1 exists
  const payload = {
    code: 'TEST-01',
    name: 'Combo de Prueba Updated',
    products: [
      {
        productId: 1, // Assumes product 1 exists
        quantity: 2,
        price: 500,
        mainTaxId: 1, // Assumes tax 1 exists
        appliedTaxes: [
          { chargeAndTaxId: 1, amount: 500 }
        ]
      }
    ]
  };

  const res = await fetch(`http://localhost:3000/api/combos/${comboId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}

testUpdate().catch(console.error);
