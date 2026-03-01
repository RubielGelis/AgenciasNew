import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const taxes = await prisma.chargeAndTax.findMany()
        return NextResponse.json(taxes)
    } catch (error) {
        return NextResponse.json({ message: 'Error al obtener cargos e impuestos' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, type, valueType, value } = await req.json()

        const tax = await prisma.chargeAndTax.create({
            data: {
                name,
                type,
                valueType,
                value: parseFloat(value)
            }
        })
        return NextResponse.json(tax)
    } catch (error) {
        return NextResponse.json({ message: 'Error al crear el cargo o impuesto' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, name, type, valueType, value } = await req.json()
        const tax = await prisma.chargeAndTax.update({
            where: { id },
            data: {
                name,
                type,
                valueType,
                value: parseFloat(value)
            }
        })
        return NextResponse.json(tax)
    } catch (error) {
        return NextResponse.json({ message: 'Error al actualizar el cargo o impuesto' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.chargeAndTax.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Cargo eliminado exitosamente' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error al eliminar el cargo', detail: error.message }, { status: 500 })
    }
}
