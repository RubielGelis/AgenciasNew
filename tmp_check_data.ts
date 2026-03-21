
import prisma from './src/lib/prisma';

async function main() {
    try {
        const count = await prisma.combo.count();
        console.log('Combo count:', count);
        if (count > 0) {
            const data = await prisma.combo.findFirst();
            console.log('Sample combo:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main().catch(e => console.error(e));
