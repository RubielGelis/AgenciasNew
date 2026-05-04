import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id_interfaces = searchParams.get('id_interfaces') || 'NULL'
        const id_master = searchParams.get('id_master') || 'NULL'

        const result = await prisma.$queryRawUnsafe(`SELECT * FROM public."fnEquivalencesInterfacesConsultar"(${id_interfaces}, ${id_master})`)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const userId = req.headers.get('X-User-Id') || '1'
        const { id_interfaces, id_master, cd_maestro, cd_codigo, cd_codigoInte } = body

        await prisma.$executeRawUnsafe(
            `CALL public."spEquivalencesInterfacesCrear"($1, $2, $3, $4, $5, $6, null)`,
            Number(id_interfaces), Number(id_master), cd_maestro, cd_codigo, cd_codigoInte || '', Number(userId)
        )
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userId = req.headers.get('X-User-Id') || '1'

        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 })

        await prisma.$executeRawUnsafe(`CALL public."spEquivalencesInterfacesEliminar"($1, $2, null)`, Number(id), Number(userId))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
