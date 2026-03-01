import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        appliedTaxes: true
                    }
                }
            }
        })

        if (!quotation) {
            return NextResponse.json({ message: 'Cotización no encontrada' }, { status: 404 })
        }

        return NextResponse.json(quotation)
    } catch (error: any) {
        console.error('Error fetching quotation:', error)
        return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const body = await request.json()
        const {
            clientId, providerId, hotelId, branchId, implantId,
            checkIn, checkOut, currency, exchangeRate,
            paxAdults, paxChildren, paxDocument,
            items, totalAmount,
            sellerId, ticketPrinterId
        } = body

        // First, check if quotation exists
        const existing = await prisma.quotation.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ message: 'Cotización no encontrada' }, { status: 404 })

        // Fetch all master taxes to rebuild snapshots
        const allTaxes = await prisma.chargeAndTax.findMany()

        // Delete existing products for this quotation (Cascade will delete taxes)
        await prisma.quotationProduct.deleteMany({
            where: { quotationId: id }
        })

        // Format new products
        const productsToCreate = items.filter((item: any) => item.productId).map((item: any) => {
            const taxesToApply = (item.appliedTaxes || []).map((taxPayload: { id: number, amount: number }) => {
                const master = allTaxes.find((t: any) => t.id === taxPayload.id)
                if (!master) return null
                return {
                    chargeAndTaxId: master.id,
                    valueSnapshot: master.value,
                    valueTypeSnapshot: master.valueType,
                    explicitAmount: taxPayload.amount
                }
            }).filter(Boolean)

            return {
                productId: parseInt(item.productId),
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                appliedTaxes: taxesToApply.length > 0 ? {
                    create: taxesToApply
                } : undefined
            }
        })

        // Update basic info and recreate products
        const updatedQuotation = await prisma.quotation.update({
            where: { id },
            data: {
                clientId: parseInt(clientId),
                providerId: parseInt(providerId),
                hotelId: parseInt(hotelId),
                branchId: parseInt(branchId),
                implantId: parseInt(implantId),
                checkInDate: new Date(checkIn),
                checkOutDate: new Date(checkOut),
                currency,
                exchangeRate: parseFloat(exchangeRate),
                paxAdults: parseInt(paxAdults),
                paxChildren: parseInt(paxChildren),
                paxDocument,
                sellerId: sellerId ? parseInt(sellerId) : null,
                ticketPrinterId: ticketPrinterId ? parseInt(ticketPrinterId) : null,
                totalAmount: parseFloat(totalAmount),
                products: {
                    create: productsToCreate
                }
            }
        })

        return NextResponse.json({ message: 'Cotización actualizada', quotation: updatedQuotation })
    } catch (error: any) {
        console.error('Error updating quotation:', error)
        return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 })
    }
}
