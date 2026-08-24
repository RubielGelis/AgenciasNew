import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const interfaceIdParam = searchParams.get('interfaceId');

        let whereCondition = '';
        if (interfaceIdParam) {
            whereCondition = `WHERE iep."interfaceId" = ${Number(interfaceIdParam)}`;
        }

        const list: any[] = await prisma.$queryRawUnsafe(`
            SELECT 
                iep.id,
                iep."interfaceId",
                iep."fieldCode",
                iep."fieldName",
                iep.prefix,
                iep.delimiter,
                iep."startPosition",
                iep.length,
                iep."isActive",
                iep."createdAt",
                jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name) as "Interfaces"
            FROM public."InterfaceExtractParam" iep
            LEFT JOIN public."Interfaces" i ON i.id = iep."interfaceId"
            ${whereCondition}
            ORDER BY iep.id ASC
        `);

        return NextResponse.json(list);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { interfaceId, fieldCode, fieldName, prefix, delimiter, startPosition, length, isActive } = body;

        if (!interfaceId || !fieldCode || !fieldName || !prefix) {
            return NextResponse.json({ message: 'La interfaz, código de campo, nombre y prefijo son obligatorios.' }, { status: 400 });
        }

        const newRule = await (prisma as any).interfaceExtractParam.create({
            data: {
                interfaceId: Number(interfaceId),
                fieldCode: fieldCode.trim(),
                fieldName: fieldName.trim(),
                prefix: prefix.trim(),
                delimiter: delimiter ? delimiter.trim() : '-',
                startPosition: startPosition ? Number(startPosition) : 0,
                length: length ? Number(length) : 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true
            }
        });

        return NextResponse.json(newRule, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, interfaceId, fieldCode, fieldName, prefix, delimiter, startPosition, length, isActive } = body;

        if (!id) {
            return NextResponse.json({ message: 'El ID de la regla es obligatorio.' }, { status: 400 });
        }

        const updatedRule = await (prisma as any).interfaceExtractParam.update({
            where: { id: Number(id) },
            data: {
                interfaceId: interfaceId ? Number(interfaceId) : undefined,
                fieldCode: fieldCode ? fieldCode.trim() : undefined,
                fieldName: fieldName ? fieldName.trim() : undefined,
                prefix: prefix ? prefix.trim() : undefined,
                delimiter: delimiter !== undefined ? (delimiter ? delimiter.trim() : '') : undefined,
                startPosition: startPosition !== undefined ? Number(startPosition) : undefined,
                length: length !== undefined ? Number(length) : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined
            }
        });

        return NextResponse.json(updatedRule);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const idParam = searchParams.get('id');

        if (!idParam) {
            return NextResponse.json({ message: 'El ID es obligatorio para eliminar.' }, { status: 400 });
        }

        await (prisma as any).interfaceExtractParam.delete({
            where: { id: Number(idParam) }
        });

        return NextResponse.json({ message: 'Regla eliminada exitosamente.' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
