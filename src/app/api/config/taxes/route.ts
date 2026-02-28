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
