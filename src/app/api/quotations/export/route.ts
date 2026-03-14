import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { ids, userId } = await req.json()

        if (!ids) {
            return NextResponse.json({ message: 'No quotation IDs provided' }, { status: 400 })
        }

        // Calling the STORED PROCEDURE
        // No quotes around the procedure name let PG handle the case (will be spexportquotation)
        const result = await prisma.$queryRawUnsafe<any[]>(
            `CALL public.spExportQuotation($1::TEXT, $2::INT, $3::TEXT)`,
            ids,
            Number(userId),
            '' 
        )

        const xmlContent = result[0]?.mensaje_resultado || '';

        if (xmlContent.startsWith('ERROR')) {
            return NextResponse.json({ message: xmlContent }, { status: 500 })
        }

        if (!xmlContent) {
           return NextResponse.json({ message: 'No data returned from procedure' }, { status: 500 })
        }

        return new NextResponse(xmlContent, {
            headers: {
                'Content-Type': 'application/xml',
                'Content-Disposition': `attachment; filename="quotations_export_${new Date().getTime()}.xml"`,
            },
        })
    } catch (error: any) {
        console.error('Error in export API:', error)
        return NextResponse.json({ message: 'Error calling export procedure', details: error.message }, { status: 500 })
    }
}
