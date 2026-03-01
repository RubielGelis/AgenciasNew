import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            clientId,
            providerId,
            hotelId,
            branchId,
            implantId,
            checkIn,
            checkOut,
            currency,
            exchangeRate,
            paxAdults,
            paxChildren,
            paxDocument,
            commissionPercentage,
            chargesAndTaxes,
            totalAmount,
            items,
            sellerId,
            ticketPrinterId
        } = body

        // Calculate nights
        const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

        // Generate internal number (Simplified: QUO-YYYYMMDD-RAND)
        const internalNumber = `QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`

        const allTaxes = await prisma.chargeAndTax.findMany();

        const quotation = await prisma.quotation.create({
            data: {
                internalNumber,
                clientId: parseInt(clientId),
                providerId: parseInt(providerId),
                hotelId: parseInt(hotelId),
                branchId: parseInt(branchId),
                implantId: parseInt(implantId),
                checkInDate: new Date(checkIn),
                checkOutDate: new Date(checkOut),
                nights: nights > 0 ? nights : 1,
                currency,
                exchangeRate: parseFloat(exchangeRate),
                paxAdults: parseInt(paxAdults),
                paxChildren: parseInt(paxChildren),
                paxDocument,
                sellerId: sellerId ? parseInt(sellerId) : null,
                ticketPrinterId: ticketPrinterId ? parseInt(ticketPrinterId) : null,
                commissionPercentage: parseFloat(commissionPercentage),
                chargesAndTaxes: parseFloat(chargesAndTaxes),
                baseCommissionable: 0, // Should calculate from items
                totalAmount: parseFloat(totalAmount),
                products: {
                    create: items.filter((item: any) => item.productId).map((item: any) => {
                        const taxesToApply = (item.appliedTaxes || []).map((taxPayload: { id: number, amount: number }) => {
                            const master = allTaxes.find((t: any) => t.id === taxPayload.id);
                            if (!master) return null;
                            return {
                                chargeAndTaxId: master.id,
                                valueSnapshot: master.value,
                                valueTypeSnapshot: master.valueType,
                                explicitAmount: taxPayload.amount
                            };
                        }).filter(Boolean);

                        return {
                            productId: parseInt(item.productId),
                            quantity: parseInt(item.quantity),
                            price: parseFloat(item.price),
                            appliedTaxes: taxesToApply.length > 0 ? {
                                create: taxesToApply
                            } : undefined
                        };
                    })
                }
            }
        })

        return NextResponse.json({ message: 'Cotización guardada con éxito', quotation })
    } catch (error: any) {
        console.error('Error saving quotation:', error)
        return NextResponse.json({ message: error.message || 'Error al guardar la cotización' }, { status: 500 })
    }
}
