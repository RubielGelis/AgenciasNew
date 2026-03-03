import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const quotations = await prisma.quotation.findMany({
            orderBy: { date: 'desc' },
            include: {
                client: { select: { name: true, document: true } },
                products: {
                    include: {
                        product: true,
                        provider: { select: { name: true } }
                    }
                }
            }
        })

        // Map data safely for the frontend list
        const formatted = quotations.map(q => {
            const firstProd = q.products[0];
            return {
                id: q.id,
                internalNumber: q.internalNumber,
                clientName: q.client?.name || 'Cliente desconocido',
                providerName: firstProd?.provider?.name || 'Proveedor Desconocido',
                createdAt: q.date,
                totalAmount: q.totalAmount,
                currency: q.currency,
                status: 'DRAFT', // using default status 
                nights: firstProd?.nights || 1
            }
        })

        return NextResponse.json(formatted)
    } catch (error: any) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json({ message: 'Error retrieving quotations history', details: error.message }, { status: 500 })
    }
}
