const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // 1. Listar sucursales
    console.log('\n=== SUCURSALES (branches) ===')
    const branches = await prisma.branch.findMany({
        select: { id: true, name: true, template: true, templateConfig: true }
    })
    for (const b of branches) {
        const tpl = b.template ? `SI (${Buffer.from(b.template).length} bytes)` : 'NO'
        const cfg = b.templateConfig ? 'SI' : 'NO'
        console.log(`  [${b.id}] "${b.name}" | template: ${tpl} | templateConfig: ${cfg}`)
    }

    // 2. Listar implants
    console.log('\n=== IMPLANTS ===')
    const implants = await prisma.implant.findMany({
        select: { id: true, name: true, branchId: true, template: true, templateConfig: true }
    })
    for (const i of implants) {
        const tpl = i.template ? `SI (${Buffer.from(i.template).length} bytes)` : 'NO'
        const cfg = i.templateConfig ? 'SI' : 'NO'
        console.log(`  [${i.id}] "${i.name}" (branchId:${i.branchId}) | template: ${tpl} | templateConfig: ${cfg}`)
    }

    // 3. Últimas 10 cotizaciones
    console.log('\n=== ÚLTIMAS 10 COTIZACIONES ===')
    const quotations = await prisma.quotation.findMany({
        orderBy: { id: 'desc' },
        take: 10,
        select: {
            id: true,
            branchId: true,
            implantId: true,
            branch: { select: { id: true, name: true, template: true } },
            implant: { select: { id: true, name: true, template: true } },
        }
    })
    for (const q of quotations) {
        const bName = q.branch?.name || '(ninguna)'
        const iName = q.implant?.name || '(ninguno)'
        const bTpl = q.branch?.template ? 'branch-TPL:SI' : 'branch-TPL:NO'
        const iTpl = q.implant?.template ? 'implant-TPL:SI' : 'implant-TPL:NO'
        console.log(`  #${q.id} | branch:"${bName}" ${bTpl} | implant:"${iName}" ${iTpl}`)
    }

    // 4. Formatos personalizados (QuotationFormat) si existe
    console.log('\n=== FORMATOS PERSONALIZADOS (QuotationFormat) ===')
    try {
        const formats = await prisma.quotationFormat.findMany({
            select: { id: true, name: true, branchId: true, template: true }
        })
        if (formats.length === 0) { console.log('  (vacío)') }
        for (const f of formats) {
            const tpl = f.template ? `SI (${Buffer.from(f.template).length} bytes)` : 'NO'
            console.log(`  [${f.id}] "${f.name}" branchId:${f.branchId} | template: ${tpl}`)
        }
    } catch(e) {
        console.log('  (tabla no encontrada)')
    }
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end() })
