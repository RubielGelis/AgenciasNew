import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const quotations = await prisma.quotation.findMany({
            include: {
                client: true,
                products: {
                    include: {
                        product: true,
                        provider: true,
                        hotel: true,
                        passengers: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return NextResponse.json(quotations)
    } catch (error: any) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json({ message: 'Error al obtener las cotizaciones', details: error.message }, { status: 500 })
    }
}
