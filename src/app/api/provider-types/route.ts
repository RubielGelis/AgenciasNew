import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnProviderTypeListar()`
        );
        const items = results.map(row => row.fnprovidertypelistar);
        return NextResponse.json(paginateArray(req, items, p => [p.code, p.name]))
    } catch (error: any) {
        return NextResponse.json({ message: 'Error retrieving provider types: ' + error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name, isAirline, active } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spProviderTypeCrear($1::TEXT, $2::TEXT, $3::BOOLEAN, $4::BOOLEAN, $5::INT, $6::INT, $7::TEXT)`,
            code,
            name,
            Boolean(isAirline),
            active !== undefined ? Boolean(active) : true,
            actingUserId,
            0, // p_prov_type_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_prov_type_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating provider type');
        }

        const providerType = { id: dbId, code, name, isAirline, active };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'PROVIDER_TYPE', description: `Tipo de Proveedor ${name} creado (SP).`, metadata: providerType });
        });

        return NextResponse.json({ message: 'Tipo de Proveedor creado', providerType })
    } catch (error: any) {
        console.error('Error creating provider type:', error);
        return NextResponse.json({ message: 'Error creating provider type: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, code, name, isAirline, active } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        const isAct = body.isActive !== undefined ? Boolean(body.isActive) : (body.inactive !== undefined ? !body.inactive : (active !== undefined ? Boolean(active) : true));

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spProviderTypeActualizar($1::INT, $2::TEXT, $3::TEXT, $4::BOOLEAN, $5::BOOLEAN, $6::INT, $7::TEXT)`,
            parseInt(id),
            code,
            name,
            Boolean(isAirline),
            isAct,
            actingUserId,
            '' // p_mensaje_resultado
        );
        await prisma.$executeRawUnsafe(`UPDATE public."ProviderType" SET "isActive" = $1, "active" = $1 WHERE id = $2`, isAct, parseInt(id));

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const providerType = { id, code, name, isAirline, active: isAct, isActive: isAct };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'PROVIDER_TYPE', description: `Tipo de Proveedor ${name} actualizado (SP).`, metadata: providerType });
        });

        return NextResponse.json({ message: 'Tipo de Proveedor actualizado', providerType })
    } catch (error: any) {
        console.error('Error updating provider type:', error);
        return NextResponse.json({ message: 'Error updating provider type: ' + error.message }, { status: 500 })
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
            `CALL public.spProviderTypeEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'PROVIDER_TYPE', description: `Tipo de Proveedor ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Tipo de Proveedor eliminado exitosamente' })
    } catch (error: any) {
        console.error('Error deleting provider type:', error);
        return NextResponse.json({ message: 'Error deleting provider type: ' + error.message }, { status: 500 })
    }
}
