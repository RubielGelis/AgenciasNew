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

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: passwordHash,
                roleId: parseInt(body.roleId)
            }
        })
        return NextResponse.json(user)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El correo ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 })
    }
}
