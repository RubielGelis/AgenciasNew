import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const parameters = await prisma.systemParameter.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(parameters)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving system parameters' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { code, name, value } = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        
        const parameter = await prisma.systemParameter.create({
            data: {
                code,
                name,
                value
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'PARAMETER', description: `Parámetro ${parameter.name} creado.`, metadata: parameter });
        });

        return NextResponse.json({ message: 'Parámetro creado', parameter })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating parameter' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, code, name, value } = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        
        const parameter = await prisma.systemParameter.update({
            where: { id },
            data: {
                code,
                name,
                value
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'PARAMETER', description: `Parámetro ${parameter.name} actualizado.`, metadata: parameter });
        });

        return NextResponse.json({ message: 'Parámetro actualizado', parameter })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating parameter' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })

        await prisma.systemParameter.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'PARAMETER', description: `Parámetro con ID ${id} eliminado.` });
        });

        return NextResponse.json({ message: 'Parámetro eliminado' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting parameter' }, { status: 500 })
    }
}
