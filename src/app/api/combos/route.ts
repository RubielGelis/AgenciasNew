import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnComboListar()`
        );
        const combos = results.map(row => row.fncombolistar);
        return NextResponse.json(paginateArray(req, combos, c => [c.code, c.name]))
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving combos' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name, cupos, currencyId, products } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spComboCrear($1::TEXT, $2::TEXT, $3::INT, $4::INT, $5::JSONB, $6::INT, $7::INT, $8::TEXT)`,
            code,
            name,
            parseInt(cupos?.toString() || '0'),
            currencyId || null,
            JSON.stringify((products || []).map((p: any) => ({
                ...p,
                cost: p.cost || 0,
                checkInDate: p.checkInDate || null,
                checkOutDate: p.checkOutDate || null,
                providerId: p.providerId || null,
                prestadoraId: p.prestadoraId || null,
                paxAdults: p.paxAdults || null,
                paxChildren: p.paxChildren || null
            }))),
            actingUserId,
            0, // p_combo_id (INOUT)
            '' // p_mensaje_resultado (INOUT)
        );

        const dbComboId = results[0]?.p_combo_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbComboId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating combo');
        }

        const combo = { id: dbComboId, name };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'COMBO', description: `Combo ${combo.name} creado (SP).`, metadata: combo });
        });

        return NextResponse.json({ message: 'Combo creado', combo })
    } catch (error: any) {
        console.error('Error creating combo:', error);
        return NextResponse.json({ message: 'Error creating combo: ' + error.message }, { status: 500 })
    }
}
