import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const sellers = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public.fnSellerListar()`)
        return NextResponse.json(sellers)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching sellers' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spSellerCrear($1::TEXT, $2::TEXT, $3::TEXT, $4::INT, $5::INT, $6::TEXT)`,
            body.code || null,
            body.name,
            body.email || null,
            actingUserId,
            0, // p_seller_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_seller_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating seller');
        }

        const seller = { id: dbId, ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Vendedor ${seller.name} creado (SP).`, metadata: seller });
        });

        return NextResponse.json(seller)
    } catch (error: any) {
        console.error('Error creating seller:', error);
        return NextResponse.json({ message: 'Error al crear vendedor: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spSellerActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::INT, $6::TEXT)`,
            parseInt(body.id),
            body.code || null,
            body.name,
            body.email || null,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const seller = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Vendedor ${seller.name} actualizado (SP).`, metadata: seller });
        });

        return NextResponse.json(seller)
    } catch (error: any) {
        console.error('Error updating seller:', error);
        return NextResponse.json({ message: 'Error al actualizar vendedor: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spSellerEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Vendedor con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Seller deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting seller:', error);
        return NextResponse.json({ message: 'Error al eliminar vendedor: ' + error.message }, { status: 500 })
    }
}
