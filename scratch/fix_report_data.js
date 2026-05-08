const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const report = await prisma.$queryRawUnsafe(`SELECT id FROM public."Report" WHERE name = 'CotizacionValor'`);
    if (report.length > 0) {
        const id = report[0].id;
        const columns = await prisma.$queryRawUnsafe(\`SELECT id, table_alias, column_name FROM public."ReportColumns" WHERE report_id = \${id}\`);
        console.log("Columns:", JSON.stringify(columns, null, 2));
        
        // Fix incorrect t1 aliases for prestadoraId and quotationId (if common)
        const update = await prisma.$queryRawUnsafe(\`
            UPDATE public."ReportColumns" 
            SET table_alias = 't_quotationproduct' 
            WHERE report_id = \${id} 
            AND column_name = 'prestadoraId' 
            AND table_alias = 't1'
        \`);
        console.log("Fix results:", update);
    } else {
        console.log("Report not found");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
