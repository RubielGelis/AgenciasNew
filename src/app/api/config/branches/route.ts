import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } })
        return NextResponse.json(branches)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching branches' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const branch = await prisma.branch.create({
            data: {
                code: body.code,
                name: body.name
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Sucursal ${branch.name} creada.`, metadata: branch });
        });

        return NextResponse.json(branch)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating branch' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const branch = await prisma.branch.update({
            where: { id: body.id },
            data: {
                code: body.code,
                name: body.name
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Sucursal ${branch.name} actualizada.`, metadata: branch });
        });

        return NextResponse.json(branch)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error updating branch' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.branch.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Sucursal con ID ${id} eliminada.` });
        });

        return NextResponse.json({ message: 'Branch deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting branch', detail: error.message }, { status: 500 })
    }
}
