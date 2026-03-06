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
                        appliedTaxes: true,
                        passengers: true
                    }
                } as any
            } as any
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
            sellerId, ticketPrinterId,
            chargesAndTaxes, commissionPercentage
        } = body
        const userIdHeader = request.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        // First, check if quotation exists
        const existing = await prisma.quotation.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ message: 'Cotización no encontrada' }, { status: 404 })

        // Fetch all master taxes to rebuild snapshots
        const allTaxes = await prisma.chargeAndTax.findMany()

        // Validaciones básicas
        const parsedClientId = parseInt(clientId)
        const parsedBranchId = parseInt(branchId)
        const parsedImplantId = parseInt(implantId)

        if (isNaN(parsedClientId) || isNaN(parsedBranchId)) {
            return NextResponse.json({ message: 'Cliente o Sucursal inválidos' }, { status: 400 })
        }

        // Delete existing products for this quotation (Cascade will delete taxes)
        await prisma.quotationProduct.deleteMany({
            where: { quotationId: id }
        })

        // Format new products
        const productsToCreate = items.filter((item: any) => item.productId).map((item: any) => {
            const taxesToApply = (item.appliedTaxes || []).map((taxPayload: any) => {
                const masterId = taxPayload.id || taxPayload.chargeAndTaxId; // Handle both formats
                const master = allTaxes.find((t: any) => t.id === masterId)
                if (!master) return null
                return {
                    chargeAndTaxId: master.id,
                    valueSnapshot: master.value,
                    valueTypeSnapshot: master.valueType,
                    explicitAmount: taxPayload.amount || taxPayload.explicitAmount || 0
                }
            }).filter(Boolean)

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
            }
        })

        // Update basic info and recreate products
        const updatedQuotation = await (prisma.quotation.update({
            where: { id },
            data: {
                client: { connect: { id: parsedClientId } },
                branch: { connect: { id: parsedBranchId } },
                implant: isNaN(parsedImplantId) ? undefined : { connect: { id: parsedImplantId } },
                currency,
                exchangeRate: parseFloat(exchangeRate) || 1,
                seller: sellerId ? { connect: { id: parseInt(sellerId) } } : undefined,
                ticketPrinter: ticketPrinterId ? { connect: { id: parseInt(ticketPrinterId) } } : undefined,
                commissionPercentage: parseFloat(commissionPercentage) || 0,
                chargesAndTaxes: parseFloat(chargesAndTaxes) || 0,
                baseCommissionable: 0,
                totalAmount: parseFloat(totalAmount) || 0,
                products: {
                    create: productsToCreate
                }
            }
        }) as any)

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'UPDATE',
                module: 'QUOTATION',
                description: `Cotización ${updatedQuotation.internalNumber} actualizada manualmente.`,
                metadata: { id: updatedQuotation.id, total: updatedQuotation.totalAmount }
            });
        });

        return NextResponse.json({ message: 'Cotización actualizada', quotation: updatedQuotation })
    } catch (error: any) {
        console.error('Error updating quotation (PUT):', error)
        return NextResponse.json({ message: 'Error al actualizar la cotización: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawId } = await params
        const id = parseInt(rawId)
        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID de cotización inválido' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        const quotation = await prisma.quotation.findUnique({ where: { id }, select: { internalNumber: true } })
        if (!quotation) {
            return NextResponse.json({ message: 'Cotización no encontrada' }, { status: 404 })
        }

        await prisma.quotation.delete({
            where: { id }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'DELETE',
                module: 'QUOTATION',
                description: `Cotización ${quotation.internalNumber} eliminada.`,
                metadata: { id }
            });
        });

        return NextResponse.json({ message: 'Cotización eliminada con éxito' })
    } catch (error: any) {
        console.error('Error deleting quotation:', error)
        return NextResponse.json({ message: 'Error al eliminar la cotización: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}
