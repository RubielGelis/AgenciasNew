import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limitParam = searchParams.get('limit')
        const limit = limitParam ? parseInt(limitParam) : 100

        const logs = await prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { name: true, email: true } }
            }
        })
        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching system logs:', error)
        return NextResponse.json({ message: 'Error fetching system logs' }, { status: 500 })
    }
}
