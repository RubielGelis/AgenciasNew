import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
            clientId, branchId, implantId,
            currency, exchangeRate,
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

            const nights = (item.checkIn && item.checkOut)
                ? Math.max(1, Math.ceil((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
                : null;

            return {
                productId: parseInt(item.productId),
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                providerId: item.providerId ? parseInt(item.providerId) : null,
                hotelId: item.hotelId ? parseInt(item.hotelId) : null,
                checkInDate: item.checkIn ? new Date(item.checkIn) : null,
                checkOutDate: item.checkOut ? new Date(item.checkOut) : null,
                nights,
                passengers: item.passengers || [],
                paxAdults: item.paxAdults ? parseInt(item.paxAdults) : 0,
                paxChildren: item.paxChildren ? parseInt(item.paxChildren) : 0,
                serviceType: item.serviceType || null,
                destination: item.destination || null,
                reservationCode: item.reservationCode || null,
                sellerCommission: item.sellerCommission ? parseFloat(item.sellerCommission) : null,
                ticketPrinterCommission: item.ticketPrinterCommission ? parseFloat(item.ticketPrinterCommission) : null,
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
                branchId: parseInt(branchId),
                implantId: parseInt(implantId),
                currency,
                exchangeRate: parseFloat(exchangeRate),
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
