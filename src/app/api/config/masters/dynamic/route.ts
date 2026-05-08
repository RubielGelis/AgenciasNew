import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const table = searchParams.get('table');

        if (!table) {
            return NextResponse.json({ error: 'Table is required' }, { status: 400 });
        }

        // Realizamos la consulta dinámica a la tabla indicada
        // NOTA: Asegúrate de que las tablas estén en el esquema public.
        const results = await prisma.$queryRawUnsafe(`SELECT * FROM public."${table}" ORDER BY id ASC`);
        
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
