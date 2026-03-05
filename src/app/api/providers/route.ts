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
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const provider = await prisma.provider.create({
            data: {
                name: body.name,
                contactInfo: body.contactInfo,
                commissionConfig: body.commissionConfig || {}
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'PROVIDER', description: `Proveedor ${provider.name} creado.`, metadata: provider });
        });

        return NextResponse.json(provider)
    } catch (error) {
        return NextResponse.json({ message: 'Error creating provider' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const provider = await prisma.provider.update({
            where: { id: body.id },
            data: {
                name: body.name,
                contactInfo: body.contactInfo,
                commissionConfig: body.commissionConfig || {}
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'PROVIDER', description: `Proveedor ${provider.name} actualizado.`, metadata: provider });
        });

        return NextResponse.json(provider)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating provider' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.provider.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'PROVIDER', description: `Proveedor con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Proveedor eliminado' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting provider', detail: error.message }, { status: 500 })
    }
}
