import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const modules: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM public.fnMenuAll()`)
        const masters: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM public."fnMasterList"()`)
        return NextResponse.json({ modules, masters })
    } catch (error: any) {
        console.error('Error fetching site modules and masters:', error)
        return NextResponse.json({ message: 'Error al consultar módulos y maestros', error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, id, active } = body

        if (!type || !id || active === undefined) {
            return NextResponse.json({ message: 'Parámetros incompletos (type, id, active son requeridos)' }, { status: 400 })
        }

        await prisma.$executeRawUnsafe(
            `CALL public."spSiteModuleMasterToggle"($1, $2, $3)`,
            String(type),
            Number(id),
            Boolean(active)
        )

        return NextResponse.json({ message: 'Estado actualizado correctamente' })
    } catch (error: any) {
        console.error('Error updating site module/master state:', error)
        return NextResponse.json({ message: 'Error al actualizar estado', error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        if (body.action === 'RESET_ALL') {
            await prisma.$executeRawUnsafe(`UPDATE public."Menu" SET activo = true;`)
            await prisma.$executeRawUnsafe(`UPDATE public."Master" SET inactivo = false;`)
            return NextResponse.json({ message: 'Todos los módulos y maestros se han restablecido a ACTIVO' })
        }
        return NextResponse.json({ message: 'Acción no válida' }, { status: 400 })
    } catch (error: any) {
        console.error('Error resetting modules/masters:', error)
        return NextResponse.json({ message: 'Error al restablecer módulos', error: error.message }, { status: 500 })
    }
}
