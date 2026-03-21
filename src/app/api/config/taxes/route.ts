import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const taxes = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public.fnImpuestoListar()`)
        return NextResponse.json(taxes)
    } catch (error) {
        return NextResponse.json({ message: 'Error al obtener cargos e impuestos' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name, type, valueType, value, isEditable } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spImpuestoCrear($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::DECIMAL, $6::BOOLEAN, $7::INT, $8::INT, $9::TEXT)`,
            code || null,
            name,
            type,
            valueType,
            parseFloat(value),
            isEditable !== undefined ? isEditable : true,
            actingUserId,
            0, // p_tax_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_tax_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating tax');
        }

        const tax = { id: dbId, ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Cargo/Impuesto ${tax.name} creado (SP).`, metadata: tax });
        });

        return NextResponse.json(tax)
    } catch (error: any) {
        console.error('Error creating tax:', error);
        return NextResponse.json({ message: 'Error al crear el cargo o impuesto: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, code, name, type, valueType, value, isEditable } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spImpuestoActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::DECIMAL, $7::BOOLEAN, $8::INT, $9::TEXT)`,
            parseInt(id),
            code || null,
            name,
            type,
            valueType,
            parseFloat(value),
            isEditable !== undefined ? isEditable : true,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const tax = { ...body };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Cargo/Impuesto ${tax.name} actualizado (SP).`, metadata: tax });
        });

        return NextResponse.json(tax)
    } catch (error: any) {
        console.error('Error updating tax:', error);
        return NextResponse.json({ message: 'Error al actualizar el cargo o impuesto: ' + error.message }, { status: 500 })
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
            `CALL public.spImpuestoEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Cargo/Impuesto con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Cargo eliminado exitosamente' })
    } catch (error: any) {
        console.error('Error deleting tax:', error);
        return NextResponse.json({ message: 'Error al eliminar el cargo: ' + error.message }, { status: 500 })
    }
}
