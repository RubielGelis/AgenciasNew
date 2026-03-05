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
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const printer = await prisma.ticketPrinter.create({
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Tiqueteador ${printer.name} creado.`, metadata: printer });
        });

        return NextResponse.json(printer)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating ticket printer' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const printer = await prisma.ticketPrinter.update({
            where: { id: body.id },
            data: {
                name: body.name,
                code: body.code || null,
                email: body.email || null
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Tiqueteador ${printer.name} actualizado.`, metadata: printer });
        });

        return NextResponse.json(printer)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error updating ticket printer' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.ticketPrinter.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Tiqueteador con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Ticket printer deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting ticket printer', detail: error.message }, { status: 500 })
    }
}
