import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const variables = await prisma.masterVariable.findMany({ orderBy: { name: 'asc' } })
        return NextResponse.json(variables)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching variables' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const variable = await prisma.masterVariable.create({
            data: {
                code: body.code,
                name: body.name
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Variable ${variable.name} creada.`, metadata: variable });
        });

        return NextResponse.json(variable)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating variable' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const variable = await prisma.masterVariable.update({
            where: { id: body.id },
            data: {
                code: body.code,
                name: body.name
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Variable ${variable.name} actualizada.`, metadata: variable });
        });

        return NextResponse.json(variable)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error updating variable' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.masterVariable.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Variable con ID ${id} eliminada.` });
        });

        return NextResponse.json({ message: 'Variable deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting variable', detail: error.message }, { status: 500 })
    }
}
