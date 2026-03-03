import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving products' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { type, description, basePrice, billingConcept, serviceType } = await req.json()
        const product = await prisma.product.create({
            data: {
                type,
                description,
                basePrice: parseFloat(basePrice.toString()),
                billingConcept: billingConcept || null,
                serviceType: serviceType || null,
            }
        })
        return NextResponse.json({ message: 'Producto creado', product })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating product' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, type, description, basePrice, billingConcept, serviceType } = await req.json()
        const product = await prisma.product.update({
            where: { id },
            data: {
                type,
                description,
                basePrice: parseFloat(basePrice.toString()),
                billingConcept: billingConcept || null,
                serviceType: serviceType || null,
            }
        })
        return NextResponse.json({ message: 'Producto actualizado', product })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating product' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })

        await prisma.product.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Producto eliminado' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting product' }, { status: 500 })
    }
}
