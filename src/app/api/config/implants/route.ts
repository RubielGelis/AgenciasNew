import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const implants = await prisma.implant.findMany({
            include: { branch: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(implants)
    } catch (error: any) {
        console.error('Error in implants GET', error)
        return NextResponse.json({ message: 'Error fetching implants', detail: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const implant = await prisma.implant.create({
            data: {
                code: body.code,
                name: body.name,
                branchId: body.branchId ? parseInt(body.branchId) : null
            }
        })
        return NextResponse.json(implant)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error creating implant' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const implant = await prisma.implant.update({
            where: { id: body.id },
            data: {
                code: body.code,
                name: body.name,
                branchId: body.branchId ? parseInt(body.branchId) : null
            }
        })
        return NextResponse.json(implant)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ message: 'El código ya existe' }, { status: 400 })
        return NextResponse.json({ message: 'Error updating implant' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        await prisma.implant.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: 'Implant deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting implant', detail: error.message }, { status: 500 })
    }
}
