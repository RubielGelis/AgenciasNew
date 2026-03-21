
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`
            SELECT column_name, table_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name IN ('Quotation', 'Combo')
            ORDER BY table_name, column_name
        `;
        results.forEach(r => console.log(`${r.table_name}: ${r.column_name}`));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main().catch(e => console.error(e));
