
import prisma from './src/lib/prisma';

async function main() {
    try {
        const results: any[] = await prisma.$queryRaw`SELECT * FROM public.fnComboListar()`;
        console.log(JSON.stringify(results, null, 2));
    } catch (error: any) {
        console.error('Error executing query:', error.message);
    }
}

main().catch(e => console.error(e));
