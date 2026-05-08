import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // 1. Obtener todas las tablas base
        const tables: any = await prisma.$queryRawUnsafe(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT IN ('_prisma_migrations', 'Report', 'ReportColumns', 'ReportJoins')
        `)

        // 2. Obtener todas las columnas
        const columns: any = await prisma.$queryRawUnsafe(`
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY ordinal_position
        `)

        // 3. Obtener relaciones (Foreign Keys)
        const relations: any = await prisma.$queryRawUnsafe(`
            SELECT
                tc.table_name AS source_table, 
                kcu.column_name AS source_column, 
                ccu.table_name AS target_table,
                ccu.column_name AS target_column
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
        `)

        // Estructurar la metadata para el frontend
        const metadata: Record<string, any> = {}

        tables.forEach((t: any) => {
            metadata[t.table_name] = {
                id: t.table_name,
                name: t.table_name, // Usaremos el nombre de la tabla como alias por ahora
                columns: columns
                    .filter((c: any) => c.table_name === t.table_name)
                    .map((c: any) => ({
                        id: c.column_name,
                        name: c.column_name,
                        type: c.data_type
                    })),
                relations: relations
                    .filter((r: any) => r.source_table === t.table_name)
                    .map((r: any) => ({
                        table: r.target_table,
                        alias: `t_${r.target_table.toLowerCase()}`,
                        name: `Relación: ${r.target_table}`,
                        condition: `{parentAlias}."${r.source_column}" = {alias}."${r.target_column}"`,
                        type: 'LEFT JOIN'
                    }))
            }
        })

        return NextResponse.json(metadata)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
