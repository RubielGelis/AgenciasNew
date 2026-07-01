import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const creditCards = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public."fnCreditCardListar"()`)
        return NextResponse.json(creditCards)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching credit cards' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spCreditCardCrear"($1::TEXT, $2::TEXT, $3::TEXT, $4::INT, $5::INT, $6::TEXT)`,
            body.code || null,
            body.name,
            body.type || null,
            actingUserId,
            0, // p_card_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_card_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating credit card');
        }

        const creditCard = { id: dbId, ...body, inactive: false };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Tarjeta de Crédito ${creditCard.name} creada (SP).`, metadata: creditCard });
        });

        return NextResponse.json(creditCard)
    } catch (error: any) {
        console.error('Error creating credit card:', error);
        return NextResponse.json({ message: 'Error al crear tarjeta de crédito: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spCreditCardActualizar"($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::BOOLEAN, $6::INT, $7::TEXT)`,
            parseInt(body.id),
            body.code || null,
            body.name,
            body.type || null,
            body.inactive === true,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const creditCard = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Tarjeta de Crédito ${creditCard.name} actualizada (SP).`, metadata: creditCard });
        });

        return NextResponse.json(creditCard)
    } catch (error: any) {
        console.error('Error updating credit card:', error);
        return NextResponse.json({ message: 'Error al actualizar tarjeta de crédito: ' + error.message }, { status: 500 })
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
            `CALL public."spCreditCardEliminar"($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Tarjeta de Crédito con ID ${id} eliminada (SP).` });
        });

        return NextResponse.json({ message: 'Credit card deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting credit card:', error);
        return NextResponse.json({ message: 'Error al eliminar tarjeta de crédito: ' + error.message }, { status: 500 })
    }
}
