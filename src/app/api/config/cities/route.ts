import { paginateArray } from '@/lib/pagination'
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const records = await prisma.$queryRawUnsafe('SELECT * FROM public."fnCityListar"()');
        return NextResponse.json(paginateArray(req, records as any[], (c: any) => [c.code, c.name, c.iata, c.countryName]));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('X-User-Id') ? parseInt(req.headers.get('X-User-Id') as string) : 0;
        const body = await req.json();

        const p_code = body.code !== undefined ? (typeof body.code === 'string' ? "'" + body.code.replace(/'/g, "''") + "'" : body.code) : null;
        const p_name = body.name !== undefined ? (typeof body.name === 'string' ? "'" + body.name.replace(/'/g, "''") + "'" : body.name) : null;
        const p_countriesId = body.countriesId !== undefined && body.countriesId !== '' ? body.countriesId : null;
        const p_statecode = body.statecode !== undefined && body.statecode !== '' ? "'" + String(body.statecode).replace(/'/g, "''") + "'" : null;
        const p_iata = body.iata !== undefined && body.iata !== '' ? "'" + String(body.iata).replace(/'/g, "''") + "'" : null;

        const query = `CALL public."spCityCrear"(${p_code}, ${p_name}, ${p_countriesId}, ${p_statecode}, ${p_iata}, ${userId}, null, null)`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';
        const newId = result[0]?.p_id;

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: newId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = req.headers.get('X-User-Id') ? parseInt(req.headers.get('X-User-Id') as string) : 0;
        const body = await req.json();

        const p_id = body.id;
        const p_code = body.code !== undefined ? (typeof body.code === 'string' ? "'" + body.code.replace(/'/g, "''") + "'" : body.code) : null;
        const p_name = body.name !== undefined ? (typeof body.name === 'string' ? "'" + body.name.replace(/'/g, "''") + "'" : body.name) : null;
        const p_countriesId = body.countriesId !== undefined && body.countriesId !== '' ? body.countriesId : null;
        const p_statecode = body.statecode !== undefined && body.statecode !== '' ? "'" + String(body.statecode).replace(/'/g, "''") + "'" : null;
        const p_iata = body.iata !== undefined && body.iata !== '' ? "'" + String(body.iata).replace(/'/g, "''") + "'" : null;

        const query = `CALL public."spCityActualizar"(${p_id}, ${p_code}, ${p_name}, ${p_countriesId}, ${p_statecode}, ${p_iata}, ${userId}, null)`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        if (body.isActive !== undefined || body.inactive !== undefined) {
            const isAct = body.isActive !== undefined ? Boolean(body.isActive) : !body.inactive;
            await prisma.$executeRawUnsafe(`UPDATE public."Cities" SET "isActive" = $1 WHERE id = $2`, isAct, parseInt(p_id));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = req.headers.get('X-User-Id') ? parseInt(req.headers.get('X-User-Id') as string) : 0;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const query = `CALL public."spCityEliminar"(${id}, ${userId}, null)`;
        const result: any = await prisma.$queryRawUnsafe(query);
        const mensaje = result[0]?.p_mensaje_resultado || 'ERROR: No message';

        if (!mensaje.startsWith('SUCCESS')) {
            return NextResponse.json({ error: mensaje }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
