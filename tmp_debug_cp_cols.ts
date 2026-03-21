
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`
            SELECT column_name, table_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'ComboProduct'
            ORDER BY column_name
        `;
        console.log(results.map(r => r.column_name).join(', '));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main().catch(e => console.error(e));
