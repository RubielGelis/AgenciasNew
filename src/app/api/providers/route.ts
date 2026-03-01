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

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const provider = await prisma.provider.update({
            where: { id: body.id },
            data: {
                name: body.name,
                contactInfo: body.contactInfo,
                commissionConfig: body.commissionConfig || {}
            }
        })
        return NextResponse.json(provider)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating provider' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })

        await prisma.provider.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Proveedor eliminado' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting provider', detail: error.message }, { status: 500 })
    }
}
