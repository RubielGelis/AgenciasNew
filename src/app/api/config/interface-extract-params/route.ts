import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const interfaceIdParam = searchParams.get('interfaceId');

        let whereClause = {};
        if (interfaceIdParam) {
            whereClause = { interfaceId: Number(interfaceIdParam) };
        }

        const list = await prisma.interfaceExtractParam.findMany({
            where: whereClause,
            include: {
                Interfaces: {
                    select: { id: true, code: true, name: true }
                }
            },
            orderBy: { id: 'asc' }
        });

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

        const newRule = await prisma.interfaceExtractParam.create({
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

        const updatedRule = await prisma.interfaceExtractParam.update({
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

        await prisma.interfaceExtractParam.delete({
            where: { id: Number(idParam) }
        });

        return NextResponse.json({ message: 'Regla eliminada exitosamente.' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
