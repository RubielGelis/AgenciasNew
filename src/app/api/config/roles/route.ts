import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const roles = await prisma.role.findMany()
        return NextResponse.json(roles)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching roles' }, { status: 500 })
    }
}
