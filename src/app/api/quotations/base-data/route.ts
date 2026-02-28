import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [clients, providers, branches, implants, products] = await Promise.all([
            prisma.client.findMany({ select: { id: true, name: true, document: true } }),
            prisma.provider.findMany({ include: { hotels: true } }),
            prisma.branch.findMany(),
            prisma.implant.findMany(),
            prisma.product.findMany()
        ])

        return NextResponse.json({
            clients,
            providers,
            branches,
            implants,
            products
        })
    } catch (error) {
        console.error('Data fetch error:', error)
        return NextResponse.json({ message: 'Error fetching base data' }, { status: 500 })
    }
}
