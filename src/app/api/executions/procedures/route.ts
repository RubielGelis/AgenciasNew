import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const procedures = await prisma.executionProcedure.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(procedures)
    } catch (error: any) {
        console.error('Error fetching execution procedures:', error)
        return NextResponse.json({ message: 'Error fetching procedures', error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, name, spName, description, parameters } = body

        if (!name || !spName) {
            return NextResponse.json({ message: 'El nombre y el SP son obligatorios.' }, { status: 400 })
        }

        if (id) {
            const updated = await prisma.executionProcedure.update({
                where: { id: Number(id) },
                data: {
                    name,
                    spName,
                    description,
                    parameters: parameters ? parameters : []
                }
            })
            return NextResponse.json(updated)
        } else {
            const created = await prisma.executionProcedure.create({
                data: {
                    name,
                    spName,
                    description,
                    parameters: parameters ? parameters : []
                }
            })
            return NextResponse.json(created)
        }
    } catch (error: any) {
        console.error('Error saving execution procedure:', error)
        return NextResponse.json({ message: error.message || 'Error saving procedure' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ message: 'ID es requerido' }, { status: 400 })
        }

        await prisma.executionProcedure.delete({
            where: { id: Number(id) }
        })

        return NextResponse.json({ success: true, message: 'Procedimiento eliminado con éxito' })
    } catch (error: any) {
        console.error('Error deleting execution procedure:', error)
        return NextResponse.json({ message: error.message || 'Error deleting procedure' }, { status: 500 })
    }
}
