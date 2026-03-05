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
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        const internalNumber = `QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`

        const allTaxes = await prisma.chargeAndTax.findMany();

        const parsedClientId = parseInt(clientId)
        const parsedBranchId = parseInt(branchId)
        const parsedImplantId = parseInt(implantId)

        if (isNaN(parsedClientId) || isNaN(parsedBranchId)) {
            return NextResponse.json({ message: 'Cliente o Sucursal inválidos' }, { status: 400 })
        }

        const quotation = await (prisma.quotation.create({
            data: {
                internalNumber,
                client: { connect: { id: parsedClientId } },
                branch: { connect: { id: parsedBranchId } },
                implant: isNaN(parsedImplantId) ? undefined : { connect: { id: parsedImplantId } },
                currency,
                exchangeRate: parseFloat(exchangeRate) || 1,
                seller: sellerId ? { connect: { id: parseInt(sellerId) } } : undefined,
                ticketPrinter: ticketPrinterId ? { connect: { id: parseInt(ticketPrinterId) } } : undefined,
                commissionPercentage: parseFloat(body.commissionPercentage) || 0,
                chargesAndTaxes: parseFloat(chargesAndTaxes) || 0,
                baseCommissionable: 0,
                totalAmount: parseFloat(totalAmount) || 0,
                products: {
                    create: items.filter((item: any) => item.productId).map((item: any) => {
                        const taxesToApply = (item.appliedTaxes || []).map((taxPayload: any) => {
                            const masterId = taxPayload.id || taxPayload.chargeAndTaxId;
                            const master = allTaxes.find((t: any) => t.id === masterId);
                            if (!master) return null;
                            return {
                                chargeAndTaxId: master.id,
                                valueSnapshot: master.value,
                                valueTypeSnapshot: master.valueType,
                                explicitAmount: taxPayload.amount || taxPayload.explicitAmount || 0
                            };
                        }).filter(Boolean);

                        const nights = (item.checkIn && item.checkOut)
                            ? Math.max(1, Math.ceil((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
                            : null;

                        return {
                            productId: parseInt(item.productId),
                            quantity: parseInt(item.quantity) || 1,
                            price: parseFloat(item.price) || 0,
                            providerId: item.providerId ? parseInt(item.providerId) : null,
                            hotelId: item.hotelId ? parseInt(item.hotelId) : null,
                            checkInDate: item.checkIn ? new Date(item.checkIn) : null,
                            checkOutDate: item.checkOut ? new Date(item.checkOut) : null,
                            nights,
                            passengers: item.passengers && item.passengers.length > 0 ? {
                                create: item.passengers.filter((p: any) => p.name || p.document).map((p: any) => ({
                                    name: p.name || '',
                                    document: p.document || ''
                                }))
                            } : undefined,
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
        }) as any);

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'CREATE',
                module: 'QUOTATION',
                description: `Cotización ${quotation.internalNumber} creada manualmente.`,
                metadata: { id: quotation.id, total: quotation.totalAmount }
            });
        });

        return NextResponse.json({ message: 'Cotización guardada con éxito', quotation })
    } catch (error: any) {
        console.error('Error saving quotation (POST):', error)
        return NextResponse.json({ message: 'Error al guardar la cotización: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}
