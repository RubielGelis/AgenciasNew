import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results = await prisma.product.findMany({
            orderBy: { id: 'desc' }
        });
        return NextResponse.json(results)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving products' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, type, description, basePrice, cost, billingConcept, serviceType, flightItinerary, classItinerary, airlineItinerary, ticketTypeId } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const product = await prisma.product.create({
            data: {
                code: code || null,
                type,
                description,
                basePrice: parseFloat(basePrice?.toString() || '0'),
                cost: parseFloat(cost?.toString() || '0'),
                billingConcept: billingConcept || null,
                serviceType: serviceType || null,
                flightItinerary: flightItinerary || null,
                classItinerary: classItinerary || null,
                airlineItinerary: airlineItinerary || null,
                ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
            }
        });

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'PRODUCT', description: `Producto ${product.description} creado.`, metadata: product });
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
        const { id, code, type, description, basePrice, cost, billingConcept, serviceType, flightItinerary, classItinerary, airlineItinerary, ticketTypeId } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                code: code || null,
                type,
                description,
                basePrice: parseFloat(basePrice?.toString() || '0'),
                cost: parseFloat(cost?.toString() || '0'),
                billingConcept: billingConcept || null,
                serviceType: serviceType || null,
                flightItinerary: flightItinerary || null,
                classItinerary: classItinerary || null,
                airlineItinerary: airlineItinerary || null,
                ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
            }
        });

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'PRODUCT', description: `Producto ${product.description} actualizado.`, metadata: product });
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

        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'PRODUCT', description: `Producto con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Producto eliminado' })
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: 'Error deleting product: ' + error.message }, { status: 500 })
    }
}
