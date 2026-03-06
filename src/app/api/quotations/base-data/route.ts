import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        const [clients, providers, branches, implants, products, taxes, sellers, ticketPrinters, variables, currentUser] = await Promise.all([
            prisma.client.findMany({ select: { id: true, name: true, document: true } }),
            prisma.provider.findMany({ include: { hotels: true } }),
            prisma.branch.findMany(),
            prisma.implant.findMany({ select: { id: true, name: true, branchId: true } }),
            prisma.product.findMany(),
            prisma.chargeAndTax.findMany(),
            prisma.seller.findMany(),
            prisma.ticketPrinter.findMany(),
            prisma.masterVariable.findMany(),
            actingUserId ? prisma.user.findUnique({ where: { id: actingUserId } }) : Promise.resolve(null)
        ])

        return NextResponse.json({
            clients,
            providers,
            branches,
            implants,
            products,
            taxes,
            sellers,
            ticketPrinters,
            variables,
            currentUser
        })
    } catch (error: any) {
        console.error('Data fetch error:', error)
        return NextResponse.json({ message: 'Error fetching base data', detail: error?.message || String(error) }, { status: 500 })
    }
}
