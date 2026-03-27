import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const limitParam = searchParams.get('limit')
        const offsetParam = searchParams.get('offset')
        const moduleParam = searchParams.get('module')
        const userIdParam = searchParams.get('userId')

        const limit = limitParam ? parseInt(limitParam) : 100
        const offset = offsetParam ? parseInt(offsetParam) : 0
        const module = moduleParam || null
        const userId = userIdParam ? parseInt(userIdParam) : null

        // Usar la función spLogListar (PostgreSQL) - Sin comillas para insensibilidad a mayúsculas
        let logs = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM sploglistar($1, $2, $3, $4)`,
            limit,
            offset,
            module || null,
            userId || null
        )

        // Si el SP devuelve nada (o falla), intentamos lectura directa como respaldo (fallback)
        if (!logs || logs.length === 0) {
            console.log(`[DEBUG_LOG_API] SP sploglistar no devolvió resultados. Cargando fallback de Prisma.`);
            const fallbackLogs = await prisma.systemLog.findMany({
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            });
            return NextResponse.json(fallbackLogs);
        }

        // Mapear el resultado para que el frontend mantenga el formato { user: { name } }
        const formattedLogs = logs.map(l => ({
            ...l,
            // Postgres suele devolver todo en minúsculas en queryRaw si no se citan las columnas
            user: { name: l.userName || l.username || 'Sistema' },
            createdAt: l.createdAt || l.createdat || new Date()
        }))

        return NextResponse.json(formattedLogs)
    } catch (error: any) {
        console.error('[DEBUG_LOGS] Error al obtener logs:', error.message)
        // Intentar una caída suave (fallback)
        try {
            const fallbackLogs = await prisma.systemLog.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { user: true } });
            return NextResponse.json(fallbackLogs);
        } catch (innerError) {
            return NextResponse.json({ message: 'Error fetching system logs', details: error.message }, { status: 500 })
        }
    }
}
