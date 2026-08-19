import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('q')?.trim() || '';
        const state = searchParams.get('state')?.trim() || '';
        const branchId = searchParams.get('branchId') ? parseInt(searchParams.get('branchId')!) : 0;

        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnPreCotizacionListar"($1, $2, $3)`,
            search ? search : null,
            state ? state : null,
            branchId ? branchId : null
        );

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error invocando fnPreCotizacionListar():', error);
        return NextResponse.json({ message: 'Error al consultar pre-cotizaciones: ' + (error.message || '') }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userIdHeader = req.headers.get('X-User-Id');
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : (body.userId || 1);

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spPreCotizacionCrear"($1::JSONB, $2::INT, NULL, NULL, NULL)`,
            JSON.stringify(body),
            actingUserId
        );

        const preQuotationId = results[0]?.p_pre_quotation_id;
        const consecutivo = results[0]?.p_consecutivo;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!preQuotationId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error al crear pre-cotización');
        }

        return NextResponse.json({
            message: message || `Pre-Cotización #${consecutivo} creada correctamente`,
            preQuotation: { id: preQuotationId, consecutivo }
        });
    } catch (error: any) {
        console.error('Error invocando spPreCotizacionCrear:', error);
        return NextResponse.json({ message: error.message || 'Error al crear pre-cotización' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { preQuotationId, quotationId, noticeResponse } = body;
        const userIdHeader = req.headers.get('X-User-Id');
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : (body.userId || 1);

        if (!preQuotationId) {
            return NextResponse.json({ message: 'ID de pre-cotización requerido' }, { status: 400 });
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spPreCotizacionConvertir"($1::INT, $2::INT, $3::INT, $4::TEXT, NULL)`,
            Number(preQuotationId),
            quotationId ? Number(quotationId) : null,
            actingUserId,
            noticeResponse ? String(noticeResponse) : null
        );

        const message = results[0]?.p_mensaje_resultado || 'Pre-Cotización actualizada correctamente';

        return NextResponse.json({ message });
    } catch (error: any) {
        console.error('Error invocando spPreCotizacionConvertir:', error);
        return NextResponse.json({ message: error.message || 'Error al actualizar pre-cotización' }, { status: 500 });
    }
}
