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
        const branch = await prisma.branch.create({
            data: {
                code: body.code,
                name: body.name
            }
        })
        return NextResponse.json(branch)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating branch' }, { status: 500 })
    }
}
