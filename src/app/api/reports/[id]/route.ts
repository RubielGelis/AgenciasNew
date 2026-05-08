import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const reportId = Number(id)

        const report: any = await prisma.$queryRawUnsafe(`
            SELECT * FROM public."Report" WHERE id = $1
        `, reportId)

        if (!report || report.length === 0) {
            return NextResponse.json({ message: 'Report not found' }, { status: 404 })
        }

        const columns = await prisma.$queryRawUnsafe(`
            SELECT * FROM public."ReportColumns" WHERE report_id = $1 ORDER BY sort_order ASC
        `, reportId)

        const joins = await prisma.$queryRawUnsafe(`
            SELECT * FROM public."ReportJoins" WHERE report_id = $1 ORDER BY sort_order ASC
        `, reportId)

        const sorts = await prisma.$queryRawUnsafe(`
            SELECT * FROM public."ReportSorts" WHERE report_id = $1 ORDER BY sort_order ASC
        `, reportId)

        const filters = await prisma.$queryRawUnsafe(`
            SELECT * FROM public."ReportFilters" WHERE report_id = $1 ORDER BY sort_order ASC
        `, reportId)

        return NextResponse.json({
            ...report[0],
            columns,
            joins,
            sorts,
            filters
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
