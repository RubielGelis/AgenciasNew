import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(clients)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching clients' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const client = await prisma.client.create({
            data: {
                name: body.name,
                document: body.document,
                contactInfo: body.contactInfo,
                address: body.address
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'CLIENT', description: `Cliente ${client.name} creado.`, metadata: client });
        });

        return NextResponse.json(client)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'El documento ya está registrado' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error creating client' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const client = await prisma.client.update({
            where: { id: body.id },
            data: {
                name: body.name,
                document: body.document,
                contactInfo: body.contactInfo,
                address: body.address
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'CLIENT', description: `Cliente ${client.name} actualizado.`, metadata: client });
        });

        return NextResponse.json(client)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'El documento ya está registrado' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error updating client' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.client.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'CLIENT', description: `Cliente con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Cliente eliminado' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting client', detail: error.message }, { status: 500 })
    }
}
