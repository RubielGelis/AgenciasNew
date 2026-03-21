import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, context: any) {
    try {
        const body = await req.json()
        const { code, name, products } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        // En Next.js 15, `params` puede ser una promesa, pero para evitar cualquier problema
        // extraemos el ID directamente de la URL o del body.
        const urlId = req.nextUrl.pathname.split('/').pop();
        let fallbackId = urlId;
        
        try {
            const resolvedParams = await context.params;
            if (resolvedParams?.id) fallbackId = resolvedParams.id;
        } catch(e) {}

        const comboId = body.id ? parseInt(body.id) : parseInt(fallbackId || '');
        
        if (isNaN(comboId)) {
            return NextResponse.json({ message: `ID de combo no válido (Body: ${body.id}, URL: ${urlId})` }, { status: 400 });
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spComboActualizar($1::INT, $2::TEXT, $3::TEXT, $4::JSONB, $5::INT, $6::TEXT)`,
           comboId,
            code,
            name,
            JSON.stringify(products || []),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const combo = { id: comboId, name };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'COMBO', description: `Combo ${combo.name} actualizado (SP).`, metadata: combo });
        });

        return NextResponse.json({ message: 'Combo actualizado', combo })
    } catch (error: any) {
        console.error('Error updating combo:', error);
        return NextResponse.json({ message: 'Error updating combo: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, context: any) {
    try {
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const urlId = req.nextUrl.pathname.split('/').pop();
        let fallbackId = urlId;
        
        try {
            const resolvedParams = await context.params;
            if (resolvedParams?.id) fallbackId = resolvedParams.id;
        } catch(e) {}

        const comboId = parseInt(fallbackId || '');

        if (isNaN(comboId)) {
            return NextResponse.json({ message: `ID de combo no válido (URL: ${urlId})` }, { status: 400 });
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spComboEliminar($1::INT, $2::TEXT)`,
            comboId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'COMBO', description: `Combo con ID ${comboId} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Combo eliminado' })
    } catch (error: any) {
        console.error('Error deleting combo:', error);
        return NextResponse.json({ message: 'Error deleting combo: ' + error.message }, { status: 500 })
    }
}
