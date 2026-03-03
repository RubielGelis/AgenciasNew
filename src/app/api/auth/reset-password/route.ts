import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ message: 'Token and password are required' }, { status: 400 })
        }

        // Usamos queryRaw para saltar la validación del esquema que a veces se queda cacheada
        const users = await prisma.$queryRaw<any[]>`
            SELECT * FROM "User" 
            WHERE "resetPasswordToken" = ${token} 
            AND "resetPasswordExpires" > NOW()
            LIMIT 1
        `
        const user = users[0]

        if (!user) {
            return NextResponse.json({ message: 'El enlace de recuperación es inválido o ha expirado' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.$executeRaw`
            UPDATE "User" 
            SET "passwordHash" = ${passwordHash},
                "resetPasswordToken" = NULL,
                "resetPasswordExpires" = NULL
            WHERE "id" = ${user.id}
        `

        return NextResponse.json({ message: 'Tu contraseña ha sido actualizada con éxito' })
    } catch (error: any) {
        console.error('Reset password error:', error)

        return NextResponse.json({ message: 'Error interno del servidor', detail: error.message }, { status: 500 })
    }
}
