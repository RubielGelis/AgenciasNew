import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnHotelListar()`
        );
        const hotels = results.map(row => row.fnhotellistar);
        return NextResponse.json(hotels)
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return NextResponse.json({ message: 'Error fetching hotels' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spHotelCrear($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::INT, $6::INT, $7::INT, $8::TEXT)`,
            body.code || null,
            body.name,
            body.category || null,
            body.location || null,
            parseInt(body.providerId),
            actingUserId,
            0, // p_hotel_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_hotel_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating hotel');
        }

        const hotel = { id: dbId, ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Hotel ${hotel.name} creado (SP).`, metadata: hotel });
        });

        return NextResponse.json(hotel)
    } catch (error: any) {
        console.error('Error creating hotel:', error);
        return NextResponse.json({ message: 'Error creating hotel: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spHotelActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::INT, $7::INT, $8::TEXT)`,
            parseInt(body.id),
            body.code || null,
            body.name,
            body.category || null,
            body.location || null,
            parseInt(body.providerId),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const hotel = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Hotel ${hotel.name} actualizado (SP).`, metadata: hotel });
        });

        return NextResponse.json(hotel)
    } catch (error: any) {
        console.error('Error updating hotel:', error);
        return NextResponse.json({ message: 'Error updating hotel: ' + error.message }, { status: 500 })
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
            `CALL public.spHotelEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Hotel con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Hotel deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting hotel:', error);
        return NextResponse.json({ message: 'Error deleting hotel: ' + error.message }, { status: 500 })
    }
}
