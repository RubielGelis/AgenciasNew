const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const jsonBody = JSON.stringify({clientId: 1, currency: "USD", items: [{productId: 1, mainTaxId: 1, quantity: 1, price: 100}]})
  const results = await prisma.$queryRawUnsafe(`CALL public.spCotizacionCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)`, jsonBody, 1, 0, '')
  console.log('results for crear:', results)
}
main().catch(console.error).finally(()=>prisma.$disconnect())
