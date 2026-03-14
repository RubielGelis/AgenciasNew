import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string

        if (!file) {
            return NextResponse.json({ message: 'No se subió ningún archivo' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet) as any[]

        let count = 0
        let errors: string[] = []

        for (const item of data) {
            try {
                if (type === 'sucursales') {
                    if (!item.code || !item.name) continue
                    await (prisma.branch as any).upsert({
                        where: { code: item.code.toString() },
                        update: { name: item.name.toString() },
                        create: { code: item.code.toString(), name: item.name.toString() }
                    })
                } else if (type === 'implants') {
                    if (!item.code || !item.name) continue
                    let branchId: number | null = null;
                    if (item.branchCode) {
                        const branch = await prisma.branch.findUnique({ where: { code: item.branchCode.toString() } })
                        if (!branch) {
                            errors.push(`Sucursal con código ${item.branchCode} no encontrada para el implant ${item.code}`)
                            continue
                        }
                        branchId = branch.id;
                    }
                    await (prisma.implant as any).upsert({
                        where: { code: item.code.toString() },
                        update: { name: item.name.toString(), branchId },
                        create: { code: item.code.toString(), name: item.name.toString(), branchId }
                    })
                } else if (type === 'vendedores') {
                    if (!item.name) continue
                    const code = item.code?.toString() || null
                    if (code) {
                        await (prisma.seller as any).upsert({
                            where: { code },
                            update: { name: item.name.toString(), email: item.email?.toString() },
                            create: { code, name: item.name.toString(), email: item.email?.toString() }
                        })
                    } else {
                        await prisma.seller.create({
                            data: { name: item.name.toString(), email: item.email?.toString() }
                        })
                    }
                } else if (type === 'tiqueteadores') {
                    if (!item.name) continue
                    const code = item.code?.toString() || null
                    if (code) {
                        await (prisma.ticketPrinter as any).upsert({
                            where: { code },
                            update: { name: item.name.toString(), email: item.email?.toString() },
                            create: { code, name: item.name.toString(), email: item.email?.toString() }
                        })
                    } else {
                        await prisma.ticketPrinter.create({
                            data: { name: item.name.toString(), email: item.email?.toString() }
                        })
                    }
                } else if (type === 'impuestos') {
                    if (!item.name || !item.type || !item.valueType || item.value === undefined) continue
                    await prisma.chargeAndTax.create({
                        data: {
                            name: item.name.toString(),
                            type: item.type.toString(),
                            valueType: item.valueType.toString(),
                            value: parseFloat(item.value)
                        }
                    })
                } else if (type === 'clientes') {
                    if (!item.document || !item.name) continue
                    await prisma.client.upsert({
                        where: { document: item.document.toString() },
                        update: { name: item.name.toString(), contactInfo: item.contactInfo?.toString(), address: item.address?.toString() },
                        create: { document: item.document.toString(), name: item.name.toString(), contactInfo: item.contactInfo?.toString(), address: item.address?.toString() }
                    })
                } else if (type === 'proveedores') {
                    if (!item.name) continue
                    const code = item.code?.toString() || null
                    if (code) {
                        await prisma.provider.upsert({
                            where: { code },
                            update: { name: item.name.toString(), contactInfo: item.contactInfo?.toString() },
                            create: { code, name: item.name.toString(), contactInfo: item.contactInfo?.toString() }
                        })
                    } else {
                        await prisma.provider.create({
                            data: { name: item.name.toString(), contactInfo: item.contactInfo?.toString() }
                        })
                    }
                } else if (type === 'productos') {
                    if (!item.description || item.basePrice === undefined) continue
                    const code = item.code?.toString() || null
                    if (code) {
                        await (prisma.product as any).upsert({
                            where: { code },
                            update: {
                                type: item.type?.toString() || 'SERVICE',
                                description: item.description.toString(),
                                basePrice: parseFloat(item.basePrice),
                                billingConcept: item.billingConcept?.toString() || null,
                                serviceType: item.serviceType?.toString() || null
                            },
                            create: {
                                code,
                                type: item.type?.toString() || 'SERVICE',
                                description: item.description.toString(),
                                basePrice: parseFloat(item.basePrice),
                                billingConcept: item.billingConcept?.toString() || null,
                                serviceType: item.serviceType?.toString() || null
                            }
                        })
                    } else {
                        await prisma.product.create({
                            data: {
                                type: item.type?.toString() || 'SERVICE',
                                description: item.description.toString(),
                                basePrice: parseFloat(item.basePrice),
                                billingConcept: item.billingConcept?.toString() || null,
                                serviceType: item.serviceType?.toString() || null
                            }
                        })
                    }
                } else if (type === 'hoteles') {
                    if (!item.name || !item.providerName) continue
                    const provider = await prisma.provider.findFirst({
                        where: { name: { contains: item.providerName.toString(), mode: 'insensitive' } }
                    })
                    if (!provider) {
                        errors.push(`Proveedor '${item.providerName}' no encontrado para el hotel ${item.name}`)
                        continue
                    }
                    const code = item.code?.toString() || null
                    if (code) {
                        await (prisma.hotel as any).upsert({
                            where: { code },
                            update: {
                                name: item.name.toString(),
                                category: item.category?.toString() || item.stars?.toString() || '3*',
                                location: item.location?.toString() || null,
                                providerId: provider.id
                            },
                            create: {
                                code,
                                name: item.name.toString(),
                                category: item.category?.toString() || item.stars?.toString() || '3*',
                                location: item.location?.toString() || null,
                                providerId: provider.id
                            }
                        })
                    } else {
                        await prisma.hotel.create({
                            data: {
                                name: item.name.toString(),
                                category: item.category?.toString() || item.stars?.toString() || '3*',
                                location: item.location?.toString() || null,
                                providerId: provider.id
                            }
                        })
                    }
                } else if (type === 'usuarios') {
                    if (!item.email || !item.name) continue
                    const roleName = item.roleName?.toString() || 'Seller'
                    const role = await prisma.role.findFirst({
                        where: { name: { contains: roleName, mode: 'insensitive' } }
                    })
                    if (!role) {
                        errors.push(`Rol '${roleName}' no encontrado para el usuario ${item.name}`)
                        continue
                    }
                    const bcrypt = require('bcryptjs')
                    const hashedPassword = await bcrypt.hash(item.password?.toString() || 'Agencias2024*', 10)
                    await prisma.user.upsert({
                        where: { email: item.email.toString() },
                        update: { name: item.name.toString(), roleId: role.id },
                        create: { email: item.email.toString(), name: item.name.toString(), roleId: role.id, passwordHash: hashedPassword }
                    })
                }
                count++
            } catch (err: any) {
                errors.push(`Error en fila ${count + 1}: ${err.message}`)
            }
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'IMPORT', module: type.toUpperCase(), description: `Importación masiva de ${count} registros en ${type}. ${errors.length} errores.`, metadata: { type, count, errors } });
        });

        return NextResponse.json({
            message: `Importación completada: ${count} registros procesados`,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error('Bulk upload error:', error)
        return NextResponse.json({ message: 'Error interno al procesar el archivo', error: error.message }, { status: 500 })
    }
}
