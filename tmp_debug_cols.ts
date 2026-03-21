
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Combo' AND table_schema = 'public'
        `;
        console.log('Columns for Combo:', JSON.stringify(results, null, 2));
    } catch (error: any) {
        console.error('Error executing query:', error.message);
    }
}

main().catch(e => console.error(e));
