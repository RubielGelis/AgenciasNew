import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function ensureDefaultStates() {
    try {
        const count = await (prisma as any).quotationState.count();
        if (count === 0) {
            await (prisma as any).quotationState.createMany({
                data: [
                    { code: 'NUEVO', name: 'Nuevo', color: 'blue' },
                    { code: 'ENVIADO', name: 'ENVIADO', color: 'emerald' }
                ]
            });
        }
    } catch (e) {
        console.error("Failed to seed default quotation states", e);
    }
}

export async function GET(req: NextRequest) {
    try {
        await ensureDefaultStates();
        const results = await (prisma as any).quotationState.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(paginateArray(req, results, (q: any) => [q.name, q.code]))
    } catch (error: any) {
        return NextResponse.json({ message: 'Error retrieving quotation states: ' + error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, name, color } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        if (!code || code.trim() === '') {
            return NextResponse.json({ message: 'El código es obligatorio' }, { status: 400 })
        }
        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 })
        }

        const state = await (prisma as any).quotationState.create({
            data: {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                color: color || 'blue'
            }
        });

        const { logSystemEvent } = await import('@/lib/logger');
        logSystemEvent({ 
            userId: actingUserId, 
            action: 'CREATE', 
            module: 'QUOTATION_STATE', 
            description: `Estado de cotización ${state.name} (${state.code}) creado.`, 
            metadata: state 
        });

        return NextResponse.json({ message: 'Estado creado', state })
    } catch (error: any) {
        console.error('Error creating quotation state:', error);
        return NextResponse.json({ message: 'Error al crear estado: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, code, name, color } = body
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })
        if (!code || code.trim() === '') {
            return NextResponse.json({ message: 'El código es obligatorio' }, { status: 400 })
        }
        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 })
        }

        const isAct = body.isActive !== undefined ? Boolean(body.isActive) : (body.inactive !== undefined ? !body.inactive : undefined);
        const state = await (prisma as any).quotationState.update({
            where: { id: parseInt(id) },
            data: {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                color: color || 'blue',
                isActive: isAct
            }
        });

        const { logSystemEvent } = await import('@/lib/logger');
        logSystemEvent({ 
            userId: actingUserId, 
            action: 'UPDATE', 
            module: 'QUOTATION_STATE', 
            description: `Estado de cotización ${state.name} (${state.code}) actualizado.`, 
            metadata: state 
        });

        return NextResponse.json({ message: 'Estado actualizado', state })
    } catch (error: any) {
        console.error('Error updating quotation state:', error);
        return NextResponse.json({ message: 'Error al actualizar estado: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const deletedState = await (prisma as any).quotationState.delete({
            where: { id: parseInt(id) }
        });

        const { logSystemEvent } = await import('@/lib/logger');
        logSystemEvent({ 
            userId: actingUserId, 
            action: 'DELETE', 
            module: 'QUOTATION_STATE', 
            description: `Estado de cotización con ID ${id} (${deletedState.name}) eliminado.` 
        });

        return NextResponse.json({ message: 'Estado eliminado' })
    } catch (error: any) {
        console.error('Error deleting quotation state:', error);
        return NextResponse.json({ message: 'Error al eliminar estado: ' + error.message }, { status: 500 })
    }
}
