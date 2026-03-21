
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_name IN ('Combo', 'ComboProduct', 'ComboProductTax') 
            ORDER BY table_name, column_name
        `;
        console.log(JSON.stringify(results, null, 2));
    } catch (error: any) {
        console.error('Error executing query:', error.message);
    }
}

main().catch(e => console.error(e));
