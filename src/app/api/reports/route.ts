import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const reports = await prisma.$queryRawUnsafe(`
            SELECT id, name, base_table, created_at 
            FROM public."Report" 
            ORDER BY id DESC
        `)
        return NextResponse.json(reports)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, baseTable, columns, joins, sorts, filters, custom_sql } = body

        if (!name || (!baseTable && !custom_sql)) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
        }

        if (!custom_sql && (!columns || columns.length === 0)) {
            return NextResponse.json({ message: 'Debes seleccionar al menos una columna' }, { status: 400 })
        }

        // Crear Reporte
        const reportResult: any = await prisma.$queryRawUnsafe(`
            INSERT INTO public."Report" (name, base_table, custom_sql)
            VALUES ($1, $2, $3) RETURNING id
        `, name, baseTable, custom_sql)
        
        const reportId = reportResult[0].id

        // Crear Sorts
        if (sorts && sorts.length > 0) {
            for (let i = 0; i < sorts.length; i++) {
                const s = sorts[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportSorts" (report_id, column_expr, direction, sort_order)
                    VALUES ($1, $2, $3, $4)
                `, reportId, s.columnExpr, s.direction, i)
            }
        }

        // Crear Filtros
        if (filters && filters.length > 0) {
            for (let i = 0; i < filters.length; i++) {
                const f = filters[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportFilters" (report_id, table_alias, column_name, filter_label, filter_type, operator, sort_order)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, reportId, f.tableAlias, f.columnName, f.filterLabel, f.filterType, f.operator, i)
            }
        }

        // Crear Joins si existen
        if (joins && joins.length > 0) {
            for (let i = 0; i < joins.length; i++) {
                const j = joins[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportJoins" (report_id, table_name, alias, join_type, join_condition, sort_order)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, reportId, j.tableName, j.alias, j.joinType, j.joinCondition, i)
            }
        }

        // Crear Columnas
        for (let i = 0; i < columns.length; i++) {
            const c = columns[i];
            await prisma.$executeRawUnsafe(`
                INSERT INTO public."ReportColumns" (report_id, table_alias, column_name, alias, is_calculated, is_visible, formula_expression, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, reportId, c.tableAlias || null, c.columnName || null, c.alias, c.isCalculated, c.isVisible ?? true, c.formulaExpression || null, c.sortOrder)
        }

        return NextResponse.json({ success: true, id: reportId })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, name, baseTable, joins, columns, sorts, filters, custom_sql } = body

        if (!id || !name || (!baseTable && !custom_sql)) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
        }

        if (!custom_sql && (!columns || columns.length === 0)) {
            return NextResponse.json({ message: 'Debes seleccionar al menos una columna' }, { status: 400 })
        }

        const reportId = Number(id)

        // Actualizar Reporte
        await prisma.$executeRawUnsafe(`
            UPDATE public."Report" SET name = $1, base_table = $2, custom_sql = $3 WHERE id = $4
        `, name, baseTable, custom_sql, reportId)
        
        // Limpiar Filtros, Sorts, Joins y Columnas anteriores
        await prisma.$executeRawUnsafe(`DELETE FROM public."ReportFilters" WHERE report_id = $1`, reportId)
        await prisma.$executeRawUnsafe(`DELETE FROM public."ReportSorts" WHERE report_id = $1`, reportId)
        await prisma.$executeRawUnsafe(`DELETE FROM public."ReportJoins" WHERE report_id = $1`, reportId)
        await prisma.$executeRawUnsafe(`DELETE FROM public."ReportColumns" WHERE report_id = $1`, reportId)

        // Crear Sorts nuevos
        if (sorts && sorts.length > 0) {
            for (let i = 0; i < sorts.length; i++) {
                const s = sorts[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportSorts" (report_id, column_expr, direction, sort_order)
                    VALUES ($1, $2, $3, $4)
                `, reportId, s.columnExpr, s.direction, i)
            }
        }

        // Crear Filtros nuevos
        if (filters && filters.length > 0) {
            for (let i = 0; i < filters.length; i++) {
                const f = filters[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportFilters" (report_id, table_alias, column_name, filter_label, filter_type, operator, sort_order)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, reportId, f.tableAlias, f.columnName, f.filterLabel, f.filterType, f.operator, i)
            }
        }

        // Crear Joins nuevos
        if (joins && joins.length > 0) {
            for (let i = 0; i < joins.length; i++) {
                const j = joins[i];
                await prisma.$executeRawUnsafe(`
                    INSERT INTO public."ReportJoins" (report_id, table_name, alias, join_type, join_condition, sort_order)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, reportId, j.tableName, j.alias, j.joinType, j.joinCondition, i)
            }
        }

        // Crear Columnas nuevas
        for (let i = 0; i < columns.length; i++) {
            const c = columns[i];
            await prisma.$executeRawUnsafe(`
                INSERT INTO public."ReportColumns" (report_id, table_alias, column_name, alias, is_calculated, is_visible, formula_expression, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, reportId, c.tableAlias || null, c.columnName || null, c.alias, c.isCalculated, c.isVisible ?? true, c.formulaExpression || null, i)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 })
        
        // As ON DELETE CASCADE is set on ReportJoins and ReportColumns, deleting the Report is enough.
        await prisma.$executeRawUnsafe(`DELETE FROM public."Report" WHERE id = $1`, Number(id))
        
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
