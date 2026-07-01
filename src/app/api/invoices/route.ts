import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spInvoicesCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)`,
            JSON.stringify(body),
            actingUserId,
            0, // p_invoice_id
            '' // p_mensaje_resultado
        );

        const dbInvoiceId = results[0]?.p_invoice_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbInvoiceId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating invoice');
        }

        const invoice = { id: dbInvoiceId };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'CREATE',
                module: 'INVOICE',
                description: `Factura ${dbInvoiceId} creada (SP). ${message}`,
                metadata: { id: dbInvoiceId }
            });
        });

        const finalMessage = message && message !== '' ? message : 'SUCCESS: Factura creada correctamente con ID ' + dbInvoiceId;
        return NextResponse.json({ message: finalMessage, invoice })
    } catch (error: any) {
        console.error('Error saving invoice (POST):', error)
        return NextResponse.json({ message: 'Error al guardar la factura: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}
