import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const result = await prisma.$queryRawUnsafe(`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'spinvoicescrear'`);
        const result2 = await prisma.$queryRawUnsafe(`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'spinvoicesactualizar'`);
        return NextResponse.json({
            crear: (result as any)[0].pg_get_functiondef,
            actualizar: (result2 as any)[0].pg_get_functiondef
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
