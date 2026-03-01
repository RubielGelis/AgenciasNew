import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const tiqueteadores = await prisma.ticketPrinter.findMany({ orderBy: { name: 'asc' } })
        return NextResponse.json(tiqueteadores)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching ticket printers' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const tp = await prisma.ticketPrinter.create({
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })
        return NextResponse.json(tp)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error creating ticket printer' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const tp = await prisma.ticketPrinter.update({
            where: { id: body.id },
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })
        return NextResponse.json(tp)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating ticket printer' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.ticketPrinter.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Ticket printer deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting ticket printer', detail: error.message }, { status: 500 })
    }
}
