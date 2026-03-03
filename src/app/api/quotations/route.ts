import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            clientId,
            branchId,
            implantId,
            currency,
            exchangeRate,
            sellerId,
            ticketPrinterId,
            chargesAndTaxes,
            totalAmount,
            items
        } = body



        // Generate internal number (Simplified: QUO-YYYYMMDD-RAND)
        const internalNumber = `QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`

        const allTaxes = await prisma.chargeAndTax.findMany();

        const quotation = await prisma.quotation.create({
            data: {
                internalNumber,
                clientId: parseInt(clientId),
                branchId: parseInt(branchId),
                implantId: parseInt(implantId),
                currency,
                exchangeRate: parseFloat(exchangeRate),
                sellerId: sellerId ? parseInt(sellerId) : null,
                ticketPrinterId: ticketPrinterId ? parseInt(ticketPrinterId) : null,
                commissionPercentage: parseFloat(body.commissionPercentage || 0),
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
