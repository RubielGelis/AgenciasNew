import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    let res: any = await prisma.$queryRaw`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'spinvoicescrear'`;
    console.log(res[0].pg_get_functiondef);
    
    let res2: any = await prisma.$queryRaw`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'spinvoicesactualizar'`;
    console.log("----SEP----");
    console.log(res2[0].pg_get_functiondef);
}

run().finally(() => process.exit(0));
