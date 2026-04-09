import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnProductoListar()`
        );
        return NextResponse.json(results)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving products' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, type, description, basePrice, cost, billingConcept, serviceType } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spProductoCrear($1::TEXT, $2::TEXT, $3::TEXT, $4::FLOAT, $5::FLOAT, $6::TEXT, $7::TEXT, $8::INT, $9::INT, $10::TEXT)`,
            code || null,
            type,
            description,
            parseFloat(basePrice?.toString() || '0'),
            parseFloat(cost?.toString() || '0'),
            billingConcept || null,
            serviceType || null,
            actingUserId,
            0, // p_product_id
            '' // p_mensaje_resultado
        );

        const dbProductId = results[0]?.p_product_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbProductId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating product');
        }

        const product = { id: dbProductId, description };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'PRODUCT', description: `Producto ${product.description} creado (SP).`, metadata: product });
        });

        return NextResponse.json({ message: 'Producto creado', product })
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Error creating product: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, code, type, description, basePrice, cost, billingConcept, serviceType } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spProductoActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TEXT, $5::FLOAT, $6::FLOAT, $7::TEXT, $8::TEXT, $9::INT, $10::TEXT)`,
            parseInt(id),
            code || null,
            type,
            description,
            parseFloat(basePrice?.toString() || '0'),
            parseFloat(cost?.toString() || '0'),
            billingConcept || null,
            serviceType || null,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        const product = { id, description };

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'PRODUCT', description: `Producto ${product.description} actualizado (SP).`, metadata: product });
        });

        return NextResponse.json({ message: 'Producto actualizado', product })
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ message: 'Error updating product: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spProductoEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'PRODUCT', description: `Producto con ID ${id} eliminado (SP).` });
        });

        return NextResponse.json({ message: 'Producto eliminado' })
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: 'Error deleting product: ' + error.message }, { status: 500 })
    }
}
