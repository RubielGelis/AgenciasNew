import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const ticketTypes = await prisma.ticketType.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(ticketTypes)
    } catch (error: any) {
        console.error('Error fetching ticket types:', error)
        return NextResponse.json(
            { message: 'Error al obtener los tipos de tiquete', error: error.message },
            { status: 500 }
        )
    }
}
