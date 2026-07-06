import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const invoice = await prisma.invoices.findUnique({
            where: { id }
        }) as any;

        if (!invoice) {
            return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 })
        }

        // Manually fetch products because relations aren't in Prisma schema (no DB FKs)
        const productsRaw = await prisma.invoicesProduct.findMany({ where: { invoiceId: id } });
        
        const products = [];
        for (const p of productsRaw) {
            const appliedTaxes = await prisma.invoicesProductTax.findMany({ where: { invoiceProductId: p.id } });
            const passengers = await prisma.invoicesProductPasenger.findMany({ where: { invoiceProductId: p.id } });
            const variables = await prisma.invoicesProductVariable.findMany({ where: { invoiceProductId: p.id } });
            const payments = await prisma.invoicesProductPayment.findMany({ where: { invoiceProductId: p.id } });
            const itinerariesItineraryList = await prisma.invoicesProductItinerary.findMany({ where: { invoiceProductId: p.id }, orderBy: { id: 'asc' } });
            
            // Optionally fetch product, provider, prestadora details if needed
            let productDetails = null;
            if (p.productId) {
                productDetails = await prisma.product.findUnique({ where: { id: p.productId } });
            }
            
            products.push({
                ...p,
                ticketCode: productDetails?.code || null,
                appliedTaxes,
                passengers,
                variables,
                payments,
                itinerariesItineraryList,
                product: productDetails
            });
        }
        invoice.products = products;

        const combosRaw = await prisma.invoicesProductCombo.findMany({ where: { invoiceId: id } });
        const combos = [];
        for (const c of combosRaw) {
             let comboDetails = null;
             if (c.comboId) {
                 comboDetails = await prisma.combo.findUnique({ where: { id: c.comboId } });
             }
             combos.push({
                 ...c,
                 combo: comboDetails
             });
        }
        invoice.combos = combos;

        if (!invoice) {
            return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 })
        }

        return NextResponse.json(invoice)
    } catch (error: any) {
        console.error('Error fetching invoice:', error)
        return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const body = await request.json()
        console.log("PUT INVOICE BODY:", JSON.stringify(body, null, 2));
        const userIdHeader = request.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spInvoicesActualizar($1::INT, $2::JSONB, $3::INT, $4::TEXT)`,
            id,
            JSON.stringify(body),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'UPDATE',
                module: 'INVOICE',
                description: `Factura ${id} actualizada (SP). ${message}`,
                metadata: { id }
            });
        });

        return NextResponse.json({ message: message || 'Factura actualizada', invoice: { id } })
    } catch (error: any) {
        console.error('Error updating invoice (PUT):', error)
        return NextResponse.json({ message: 'Error al actualizar la factura: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID de factura inválido' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spInvoicesEliminar($1::INT, $2::INT, $3::TEXT)`,
            id,
            actingUserId,
            '' // p_mensaje_resultado
        )

        const message = results[0]?.p_mensaje_resultado || ''
        if (message.startsWith('ERROR')) {
            throw new Error(message)
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'DELETE',
                module: 'INVOICE',
                description: `Factura ${id} eliminada (SP). ${message}`,
                metadata: { id }
            });
        });

        return NextResponse.json({ message: message || 'Factura eliminada con éxito' })
    } catch (error: any) {
        console.error('Error deleting invoice:', error)
        return NextResponse.json({ message: 'Error al eliminar la factura: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}
