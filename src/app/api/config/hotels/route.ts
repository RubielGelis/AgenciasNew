import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const hotels = await prisma.hotel.findMany({
            include: { provider: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(hotels)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching hotels' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const hotel = await prisma.hotel.create({
            data: {
                code: body.code || null,
                name: body.name,
                category: body.category || null,
                location: body.location || null,
                providerId: parseInt(body.providerId)
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Hotel ${hotel.name} creado.`, metadata: hotel });
        });

        return NextResponse.json(hotel)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error creating hotel' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const hotel = await prisma.hotel.update({
            where: { id: body.id },
            data: {
                code: body.code || null,
                name: body.name,
                category: body.category || null,
                location: body.location || null,
                providerId: parseInt(body.providerId)
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Hotel ${hotel.name} actualizado.`, metadata: hotel });
        });

        return NextResponse.json(hotel)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating hotel' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.hotel.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Hotel con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Hotel deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting hotel', detail: error.message }, { status: 500 })
    }
}
