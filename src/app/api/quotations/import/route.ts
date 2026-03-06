import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const rows = await req.json()
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ message: 'El archivo está vacío o no es válido' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        // Preload master data to resolve names/documents to IDs
        const [clients, branches, implants, sellers, ticketPrinters, products, providers, hotels, masterTaxes, masterVariables] = await Promise.all([
            prisma.client.findMany(),
            prisma.branch.findMany(),
            prisma.implant.findMany(),
            prisma.seller.findMany(),
            prisma.ticketPrinter.findMany(),
            prisma.product.findMany(),
            prisma.provider.findMany(),
            prisma.hotel.findMany(),
            prisma.chargeAndTax.findMany(),
            prisma.masterVariable.findMany()
        ])

        // Agrupar filas por Grupo_Cotizacion
        const groups: Record<string, any[]> = {}
        rows.forEach((row, index) => {
            const groupKey = row.Grupo_Cotizacion ? String(row.Grupo_Cotizacion).trim() : `row_${index}`
            if (!groups[groupKey]) groups[groupKey] = []
            groups[groupKey].push(row)
        })

        const createdQuotationIds: number[] = []

        // Procesar cada grupo como una cotización
        for (const [groupKey, groupRows] of Object.entries(groups)) {
            // Tomar los datos de cabecera de la primera fila del grupo
            const headerRow = groupRows[0]

            const clientDoc = headerRow.Cliente_Documento?.toString().trim()
            const client = clients.find(c => c.document === clientDoc)
            if (!client) {
                console.warn(`Cliente con documento ${clientDoc} no encontrado para grupo ${groupKey}. Saltando...`)
                continue
            }

            const branchInfo = headerRow.Sucursal_Nombre?.toString().trim().toLowerCase()
            let branch = branches.find(b => b.name.toLowerCase() === branchInfo)
            if (!branch && branches.length > 0) branch = branches[0] // Fallback to first branch if missing

            if (!branch) {
                console.warn(`Sucursal no encontrada y no hay fallback. Saltando grupo ${groupKey}.`)
                continue
            }

            const implant = implants.find(i => i.name.toLowerCase() === headerRow.Implant_Nombre?.toString().trim().toLowerCase())
            const seller = sellers.find(s => s.name.toLowerCase() === headerRow.Vendedor_Nombre?.toString().trim().toLowerCase())
            const ticketPrinter = ticketPrinters.find(t => t.name.toLowerCase() === headerRow.Tiqueteador_Nombre?.toString().trim().toLowerCase())

            const internalNumber = `QUO-IMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`

            const currency = headerRow.Moneda?.toString().trim().toUpperCase() || 'USD'
            const exchangeRate = parseFloat(headerRow.Tasa_Cambio) || 1
            const commissionPercentage = parseFloat(headerRow.Comision_Global_Pct) || 0
            const chargesAndTaxes = parseFloat(headerRow.Cargos_A_Cotizacion) || 0

            // Procesar productos
            const productsPayload = groupRows.map(row => {
                const prodDesc = row.Producto_Descripcion?.toString().trim().toLowerCase()
                let product = products.find(p => p.description.toLowerCase() === prodDesc)
                if (!product && products.length > 0) {
                    product = products[0] // fallback if unknown
                }

                if (!product) return null

                const provider = providers.find(p => p.name.toLowerCase() === row.Proveedor_Nombre?.toString().trim().toLowerCase())
                const hotel = hotels.find(h => h.name.toLowerCase() === row.Hotel_Nombre?.toString().trim().toLowerCase())

                // Parse applied taxes "NAME:AMOUNT|NAME:AMOUNT"
                const taxesPayload: any[] = []
                if (row.Impuestos_Nombres_Y_Valores) {
                    const pairs = String(row.Impuestos_Nombres_Y_Valores).split('|')
                    pairs.forEach(pair => {
                        const parts = pair.split(':')
                        const tName = parts[0]
                        const tAmt = parts[1]
                        if (tName) {
                            const taxMatch = masterTaxes.find(t => t.name.toLowerCase() === tName.trim().toLowerCase())
                            if (taxMatch) {
                                taxesPayload.push({
                                    chargeAndTaxId: taxMatch.id,
                                    valueSnapshot: taxMatch.value,
                                    valueTypeSnapshot: taxMatch.valueType,
                                    explicitAmount: tAmt ? parseFloat(tAmt) : 0
                                })
                            }
                        }
                    })
                }

                // Parse variables "CODE:VALUE|CODE:VALUE"
                const variablesPayload: any[] = []
                if (row.Variables_Codigos_Y_Valores) {
                    const pairs = String(row.Variables_Codigos_Y_Valores).split('|')
                    pairs.forEach(pair => {
                        const parts = pair.split(':')
                        const vCode = parts[0]
                        const vValue = parts[1]
                        if (vCode) {
                            const varMatch = masterVariables.find(v => v.code.toLowerCase() === vCode.trim().toLowerCase())
                            if (varMatch) {
                                variablesPayload.push({
                                    masterVariableId: varMatch.id,
                                    value: vValue ? vValue.trim() : ''
                                })
                            }
                        }
                    })
                }

                // Parse passengers "NAME:DOC|NAME:DOC"
                const passPayload: any[] = []
                if (row.Pasajeros) {
                    const passList = String(row.Pasajeros).split('|')
                    passList.forEach(pass => {
                        const parts = pass.split(':')
                        const pName = parts[0]
                        const pDoc = parts[1]
                        if (pName) {
                            passPayload.push({
                                name: pName.trim(),
                                document: pDoc ? pDoc.trim() : ''
                            })
                        }
                    })
                }

                const price = parseFloat(row.Precio_Unitario) || product.basePrice || 0;
                const quantity = parseInt(row.Cantidad) || 1;
                const checkInDate = row.CheckIn ? new Date(row.CheckIn) : null;
                const checkOutDate = row.CheckOut ? new Date(row.CheckOut) : null;
                const nights = (checkInDate && checkOutDate) ? Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))) : null;

                return {
                    productId: product.id,
                    quantity,
                    price,
                    providerId: provider?.id,
                    hotelId: hotel?.id,
                    checkInDate: checkInDate && !isNaN(checkInDate.getTime()) ? checkInDate : null,
                    checkOutDate: checkOutDate && !isNaN(checkOutDate.getTime()) ? checkOutDate : null,
                    nights,
                    paxAdults: parseInt(row.Pax_Adultos) || 1,
                    paxChildren: parseInt(row.Pax_Ninos) || 0,
                    destination: row.Destino?.toString(),
                    serviceType: row.Tipo_Servicio?.toString(),
                    reservationCode: row.Codigo_Reserva?.toString(),
                    sellerCommission: row.Comision_Vendedor_Producto ? parseFloat(row.Comision_Vendedor_Producto) : null,
                    ticketPrinterCommission: row.Comision_Tiqueteador_Producto ? parseFloat(row.Comision_Tiqueteador_Producto) : null,

                    appliedTaxes: taxesPayload.length > 0 ? { create: taxesPayload } : undefined,
                    variables: variablesPayload.length > 0 ? { create: variablesPayload } : undefined,
                    passengers: passPayload.length > 0 ? { create: passPayload } : undefined
                }
            }).filter(Boolean);

            if (productsPayload.length === 0) continue;

            let totalTemp = chargesAndTaxes;
            productsPayload.forEach((p: any) => {
                totalTemp += p.price * p.quantity;
                if (p.appliedTaxes?.create) {
                    p.appliedTaxes.create.forEach((t: any) => {
                        totalTemp += t.explicitAmount || 0;
                    })
                }
            })

            const createdQuo = await prisma.quotation.create({
                data: {
                    internalNumber,
                    currency,
                    exchangeRate,
                    commissionPercentage,
                    chargesAndTaxes,
                    totalAmount: totalTemp,
                    baseCommissionable: 0,
                    client: { connect: { id: client.id } },
                    branch: { connect: { id: branch.id } },
                    implant: implant ? { connect: { id: implant.id } } : undefined,
                    seller: seller ? { connect: { id: seller.id } } : undefined,
                    ticketPrinter: ticketPrinter ? { connect: { id: ticketPrinter.id } } : undefined,
                    products: {
                        create: productsPayload as any
                    }
                }
            })

            createdQuotationIds.push(createdQuo.id)

            if (actingUserId) {
                import('@/lib/logger').then(({ logSystemEvent }) => {
                    logSystemEvent({
                        userId: actingUserId,
                        action: 'IMPORT',
                        module: 'QUOTATION',
                        description: `Cotización ${createdQuo.internalNumber} importada masivamente.`,
                        metadata: { id: createdQuo.id, total: createdQuo.totalAmount }
                    });
                });
            }
        }

        return NextResponse.json({ message: 'Importación finalizada', importedCount: createdQuotationIds.length })
    } catch (error: any) {
        console.error('Import error:', error)
        return NextResponse.json({ message: 'Error durante la importación', error: error.message }, { status: 500 })
    }
}
