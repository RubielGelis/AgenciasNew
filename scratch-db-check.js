const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
    try {
        console.log("Listing all print customizations...")
        const rows = await prisma.quotationPrintCustomization.findMany()
        rows.forEach(r => {
            console.log(`- Quotation ID: ${r.quotationId}, HTML Length: ${r.html.length}, Updated At: ${r.updatedAt}`)
        })
    } catch (err) {
        console.error("Error listing:", err.message)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
