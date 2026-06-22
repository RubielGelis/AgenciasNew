import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idIni = searchParams.get('idIni');
        const idFin = searchParams.get('idFin');

        if (!idIni || !idFin) {
            return NextResponse.json({ error: 'idIni and idFin are required' }, { status: 400 });
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnRptCotizacion"($1, $2)`,
            parseInt(idIni), parseInt(idFin)
        );

        // Convert bytea logo to base64 string
        const formattedResults = results.map(row => ({
            ...row,
            logo: row.logo ? `data:image/png;base64,${Buffer.from(row.logo).toString('base64')}` : null
        }));

        return NextResponse.json(formattedResults);
    } catch (error: any) {
        console.error('Error executing fnRptCotizacion:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
