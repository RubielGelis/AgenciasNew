import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return handleExecution(params, '{}')
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await req.json()
    const filterValues = JSON.stringify(body.filters || {})
    return handleExecution(params, filterValues)
}

async function handleExecution(paramsPromise: Promise<{ id: string }>, filterValues: string) {
    try {
        const resolvedParams = await paramsPromise;
        const reportId = Number(resolvedParams.id)
        if (!reportId || isNaN(reportId)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }

        // Ejecutar la función con los valores de filtro
        const result: any = await prisma.$queryRawUnsafe(`
            SELECT public."fnReportDinamic"($1, $2::json) as data
        `, reportId, filterValues)

        let reportData = [];
        if (result && result.length > 0 && result[0].data) {
            reportData = typeof result[0].data === 'string' ? JSON.parse(result[0].data) : result[0].data;
        }

        return NextResponse.json(reportData)
    } catch (error: any) {
        console.error("Report execution error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
