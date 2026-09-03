import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const consecutives = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public."fnTransactionConsecutiveListar"()`)
        return NextResponse.json(paginateArray(req, consecutives, c => [
            c.transactionType,
            c.description,
            c.prefix,
            c.branchName,
            c.implantName
        ]))
    } catch (error: any) {
        console.error('Error fetching transaction consecutives:', error)
        return NextResponse.json({ message: 'Error consultando consecutivos de transacciones: ' + error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spTransactionConsecutiveCrear"($1::TEXT, $2::TEXT, $3::TEXT, $4::INT, $5::INT, $6::INT, $7::BOOLEAN, $8::INT, $9::INT, $10::TEXT)`,
            body.transactionType,
            body.description,
            body.prefix || null,
            body.initialNumber ? parseInt(body.initialNumber) : 1,
            body.branchId ? parseInt(body.branchId) : null,
            body.implantId ? parseInt(body.implantId) : null,
            body.isActive !== undefined ? Boolean(body.isActive) : true,
            actingUserId,
            0, // p_consecutivo_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_consecutivo_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error al crear consecutivo de transacción');
        }

        const consecutive = { id: dbId, ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Consecutivo ${consecutive.transactionType} creado (SP).`, metadata: consecutive });
        });

        return NextResponse.json(consecutive)
    } catch (error: any) {
        console.error('Error creating transaction consecutive:', error);
        return NextResponse.json({ message: 'Error al crear consecutivo: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spTransactionConsecutiveActualizar"($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::INT, $6::INT, $7::INT, $8::INT, $9::BOOLEAN, $10::INT, $11::TEXT)`,
            parseInt(body.id),
            body.transactionType,
            body.description,
            body.prefix || null,
            body.initialNumber ? parseInt(body.initialNumber) : 1,
            body.currentNumber ? parseInt(body.currentNumber) : 1,
            body.branchId ? parseInt(body.branchId) : null,
            body.implantId ? parseInt(body.implantId) : null,
            body.isActive !== undefined ? Boolean(body.isActive) : (body.inactive !== undefined ? !body.inactive : true),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const consecutive = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Consecutivo ${consecutive.transactionType} actualizado (SP).`, metadata: consecutive });
        });

        return NextResponse.json(consecutive)
    } catch (error: any) {
        console.error('Error updating transaction consecutive:', error);
        return NextResponse.json({ message: 'Error al actualizar consecutivo: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        if (!id) return NextResponse.json({ message: 'ID de consecutivo obligatorio' }, { status: 400 })

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spTransactionConsecutiveEliminar"($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Consecutivo con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Consecutivo eliminado exitosamente' })
    } catch (error: any) {
        console.error('Error deleting transaction consecutive:', error);
        return NextResponse.json({ message: 'Error al eliminar consecutivo: ' + error.message }, { status: 500 })
    }
}
