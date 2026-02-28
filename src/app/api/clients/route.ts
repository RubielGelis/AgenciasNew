import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(clients)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching clients' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const client = await prisma.client.create({
            data: {
                name: body.name,
                document: body.document,
                contactInfo: body.contactInfo,
                address: body.address
            }
        })
        return NextResponse.json(client)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'El documento ya está registrado' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error creating client' }, { status: 500 })
    }
}
