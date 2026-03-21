import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnComboListar()`
        );
        const combos = results.map(row => row.fncombolistar);
        return NextResponse.json(combos)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving combos' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name, products } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spComboCrear($1::TEXT, $2::TEXT, $3::JSONB, $4::INT, $5::INT, $6::TEXT)`,
            code,
            name,
            JSON.stringify(products || []),
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
