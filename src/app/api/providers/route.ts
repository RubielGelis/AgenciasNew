import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const providers = await prisma.provider.findMany({
            orderBy: { name: 'asc' },
            include: {
                hotels: true
            }
        })
        return NextResponse.json(providers)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching providers' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const provider = await prisma.provider.create({
            data: {
                name: body.name,
                contactInfo: body.contactInfo,
                commissionConfig: body.commissionConfig || {}
            }
        })
        return NextResponse.json(provider)
    } catch (error) {
        return NextResponse.json({ message: 'Error creating provider' }, { status: 500 })
    }
}
