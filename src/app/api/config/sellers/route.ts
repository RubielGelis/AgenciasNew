import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const sellers = await prisma.seller.findMany({ orderBy: { name: 'asc' } })
        return NextResponse.json(sellers)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching sellers' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const seller = await prisma.seller.create({
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })
        return NextResponse.json(seller)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error creating seller' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const seller = await prisma.seller.update({
            where: { id: body.id },
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })
        return NextResponse.json(seller)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating seller' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.seller.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Seller deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting seller', detail: error.message }, { status: 500 })
    }
}
