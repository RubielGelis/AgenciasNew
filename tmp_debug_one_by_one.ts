
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Combo' AND table_schema = 'public'
        `;
        results.forEach(r => console.log('COL:' + r.column_name));
    } catch (error: any) {
        console.error('Error executing query:', error.message);
    }
}

main().catch(e => console.error(e));
