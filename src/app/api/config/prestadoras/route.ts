import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnPrestadoraListar()`
        );
        const prestadoras = results.map(row => row.fnprestadoralistar);
        return NextResponse.json(prestadoras)
    } catch (error) {
        console.error('Error fetching prestadoras:', error);
        return NextResponse.json({ message: 'Error fetching prestadoras' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spPrestadoraCrear($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::INT, $6::TEXT, $7::INT, $8::INT, $9::TEXT)`,
            body.code || null,
            body.name,
            body.category || null,
            body.location || null,
            parseInt(body.providerId),
            body.type || null,
            actingUserId,
            0, // p_prestadora_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_prestadora_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating prestadora');
        }

        const prestadora = { id: dbId, ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Prestadora ${prestadora.name} creado (SP).`, metadata: prestadora });
        });

        return NextResponse.json(prestadora)
    } catch (error: any) {
        console.error('Error creating prestadora:', error);
        return NextResponse.json({ message: 'Error creating prestadora: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spPrestadoraActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::INT, $7::TEXT, $8::INT, $9::TEXT)`,
            parseInt(body.id),
            body.code || null,
            body.name,
            body.category || null,
            body.location || null,
            parseInt(body.providerId),
            body.type || null,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const prestadora = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Prestadora ${prestadora.name} actualizado (SP).`, metadata: prestadora });
        });

        return NextResponse.json(prestadora)
    } catch (error: any) {
        console.error('Error updating prestadora:', error);
        return NextResponse.json({ message: 'Error updating prestadora: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spPrestadoraEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Prestadora con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Prestadora deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting prestadora:', error);
        return NextResponse.json({ message: 'Error deleting prestadora: ' + error.message }, { status: 500 })
    }
}
