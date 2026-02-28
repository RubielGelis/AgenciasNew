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
            items
        } = body

        // Calculate nights
        const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

        // Generate internal number (Simplified: QUO-YYYYMMDD-RAND)
        const internalNumber = `QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`

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
                commissionPercentage: parseFloat(commissionPercentage),
                chargesAndTaxes: parseFloat(chargesAndTaxes),
                baseCommissionable: 0, // Should calculate from items
                totalAmount: parseFloat(totalAmount),
                products: {
                    create: items.map((item: any) => ({
                        productId: parseInt(item.productId),
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price)
                    }))
                }
            }
        })

        return NextResponse.json({ message: 'Cotización guardada con éxito', quotation })
    } catch (error) {
        console.error('Error saving quotation:', error)
        return NextResponse.json({ message: 'Error al guardar la cotización' }, { status: 500 })
    }
}
