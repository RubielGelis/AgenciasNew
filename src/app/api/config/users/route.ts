import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: { role: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching users' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const passwordHash = await bcrypt.hash(body.password, 10)
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: passwordHash,
                roleId: parseInt(body.roleId)
            }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'CREATE',
                module: 'USER',
                description: `Usuario ${user.name} creado.`,
                metadata: { email: user.email, roleId: user.roleId }
            });
        });

        return NextResponse.json(user)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El correo ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        const data: any = {
            name: body.name,
            email: body.email,
            roleId: parseInt(body.roleId)
        }

        if (body.password) {
            data.passwordHash = await bcrypt.hash(body.password, 10)
        }

        const user = await prisma.user.update({
            where: { id: body.id },
            data
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'UPDATE',
                module: 'USER',
                description: `Usuario ${user.name} actualizado.`,
                metadata: { id: user.id, email: user.email, roleId: user.roleId }
            });
        });

        return NextResponse.json(user)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El correo ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.user.delete({
            where: { id: parseInt(id) }
        })

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'DELETE',
                module: 'USER',
                description: `Usuario con ID ${id} eliminado.`
            });
        });

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting user', detail: error.message }, { status: 500 })
    }
}
