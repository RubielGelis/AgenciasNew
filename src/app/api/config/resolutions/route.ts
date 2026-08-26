import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logSystemEvent } from '@/lib/logger'

export const dynamic = 'force-dynamic'

function serializeResolution(row: any) {
    return {
        ...row,
        inicial: row.inicial !== null && row.inicial !== undefined ? String(row.inicial) : null,
        end: row.end !== null && row.end !== undefined ? String(row.end) : null,
    }
}

export async function GET() {
    try {
        const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public.fnResolucionListar()`)
        const sanitized = rows.map(serializeResolution)
        return NextResponse.json(sanitized)
    } catch (error: any) {
        console.error('Error fetching resolutions:', error)
        return NextResponse.json({ message: 'Error al obtener resoluciones: ' + error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const dateVal = body.date ? new Date(body.date) : null
        const expiraVal = body.expira ? new Date(body.expira) : null
        const inicialVal = body.inicial ? BigInt(body.inicial) : null
        const endVal = body.end ? BigInt(body.end) : null

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spResolucionCrear($1::TEXT, $2::TEXT, $3::TIMESTAMPTZ, $4::TIMESTAMPTZ, $5::BIGINT, $6::BIGINT, $7::TEXT, $8::TEXT, $9::INT, $10::INT, $11::BOOLEAN, $12::BOOLEAN, $13::INT, $14::INT, $15::TEXT)`,
            body.code,
            body.name,
            dateVal,
            expiraVal,
            inicialVal,
            endVal,
            body.autoriza || null,
            body.prefijo || null,
            body.alerta ? parseInt(body.alerta) : null,
            body.day ? parseInt(body.day) : null,
            !!body.permitir,
            body.activo !== undefined ? !!body.activo : true,
            actingUserId,
            0,
            ''
        )

        const dbId = results[0]?.p_resolution_id
        const message = results[0]?.p_mensaje_resultado || ''

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creando resolución')
        }

        const resolution = { id: dbId, ...body }
        logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Resolución ${resolution.name} creada (SP).`, metadata: resolution })

        return NextResponse.json(resolution)
    } catch (error: any) {
        console.error('Error creating resolution:', error)
        return NextResponse.json({ message: 'Error al crear resolución: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const dateVal = body.date ? new Date(body.date) : null
        const expiraVal = body.expira ? new Date(body.expira) : null
        const inicialVal = body.inicial ? BigInt(body.inicial) : null
        const endVal = body.end ? BigInt(body.end) : null

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spResolucionActualizar($1::INT, $2::TEXT, $3::TEXT, $4::TIMESTAMPTZ, $5::TIMESTAMPTZ, $6::BIGINT, $7::BIGINT, $8::TEXT, $9::TEXT, $10::INT, $11::INT, $12::BOOLEAN, $13::BOOLEAN, $14::INT, $15::TEXT)`,
            parseInt(body.id),
            body.code,
            body.name,
            dateVal,
            expiraVal,
            inicialVal,
            endVal,
            body.autoriza || null,
            body.prefijo || null,
            body.alerta ? parseInt(body.alerta) : null,
            body.day ? parseInt(body.day) : null,
            !!body.permitir,
            body.activo !== undefined ? !!body.activo : true,
            actingUserId,
            ''
        )

        const message = results[0]?.p_mensaje_resultado || ''
        if (message.startsWith('ERROR')) {
            throw new Error(message)
        }

        logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Resolución ${body.name} actualizada (SP).`, metadata: body })

        return NextResponse.json(body)
    } catch (error: any) {
        console.error('Error updating resolution:', error)
        return NextResponse.json({ message: 'Error al actualizar resolución: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ message: 'ID es requerido' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spResolucionEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            ''
        )

        const message = results[0]?.p_mensaje_resultado || ''
        if (message.startsWith('ERROR')) {
            throw new Error(message)
        }

        logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Resolución con ID ${id} eliminada (SP).` })

        return NextResponse.json({ success: true, message })
    } catch (error: any) {
        console.error('Error deleting resolution:', error)
        return NextResponse.json({ message: 'Error al eliminar resolución: ' + error.message }, { status: 500 })
    }
}
