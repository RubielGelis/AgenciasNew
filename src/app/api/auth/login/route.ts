import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()
        const targetEmail = email?.toLowerCase()

        if (!targetEmail || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: targetEmail },
            include: { role: true },
        })

        if (!user) {
            return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
            return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 })
        }

        // In a real app we'd set a JWT or Session cookie here
        // For now, we'll return user info to confirm it works
        const response = NextResponse.json({
            message: 'Acceso concedido',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                branchId: user.branchId,
                implantId: user.implantId,
                ticketPrinterId: user.ticketPrinterId,
                canEditReports: user.canEditReports ?? false
            },
        })

        // (Dummy) Set a simple session cookie if needed
        // response.cookies.set('authenticated', 'true', { httpOnly: true, path: '/' })

        // Log the successful login
        import('@/lib/logger').then(({ registerLog }) => {
            registerLog(user.id, 'USER', 'LOGIN', `El usuario ${user.name} ha iniciado sesión.`, { email: user.email, role: user.role.name });
        }).catch(err => console.error(err));

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
    }
}
