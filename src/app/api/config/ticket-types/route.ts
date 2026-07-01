import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const records = await prisma.$queryRawUnsafe('SELECT * FROM public."fnTicketTypeListar"()');
        return NextResponse.json(records);
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
        const p_description = body.description !== undefined && body.description !== '' ? "'" + String(body.description).replace(/'/g, "''") + "'" : 'null';
        const p_isActive = body.isActive !== undefined ? body.isActive : true;

        const query = `CALL public."spTicketTypeCrear"(${p_code}, ${p_name}, ${p_description}, ${p_isActive}, ${userId}, null, null)`;
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
        const p_description = body.description !== undefined && body.description !== '' ? "'" + String(body.description).replace(/'/g, "''") + "'" : 'null';
        const p_isActive = body.isActive !== undefined ? body.isActive : true;

        const query = `CALL public."spTicketTypeActualizar"(${p_id}, ${p_code}, ${p_name}, ${p_description}, ${p_isActive}, ${userId}, null)`;
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

export async function DELETE(req: Request) {
    try {
        const userId = req.headers.get('X-User-Id') ? parseInt(req.headers.get('X-User-Id') as string) : 0;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const query = `CALL public."spTicketTypeEliminar"(${id}, ${userId}, null)`;
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
