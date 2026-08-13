import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Obtener la personalización de impresión de una cotización
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const quotationIdStr = searchParams.get('quotationId')
        
        if (!quotationIdStr) {
            return NextResponse.json({ message: 'quotationId es requerido' }, { status: 400 })
        }

        const quotationId = parseInt(quotationIdStr)
        if (isNaN(quotationId)) {
            return NextResponse.json({ message: 'quotationId debe ser un número' }, { status: 400 })
        }

        const customization = await prisma.quotationPrintCustomization.findUnique({
            where: { quotationId }
        })

        return NextResponse.json({ html: customization?.html || null })
    } catch (error: any) {
        console.error('Error fetching print customization:', error)
        return NextResponse.json({ message: 'Error al obtener personalización de impresión', error: error.message }, { status: 500 })
    }
}

// POST: Crear o actualizar la personalización de impresión de una cotización
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { quotationId, html } = body

        if (!quotationId || typeof html !== 'string') {
            return NextResponse.json({ message: 'quotationId y html son requeridos' }, { status: 400 })
        }

        const id = parseInt(quotationId)
        if (isNaN(id)) {
            return NextResponse.json({ message: 'quotationId debe ser un número' }, { status: 400 })
        }

        // Upsert the customization
        const customization = await prisma.quotationPrintCustomization.upsert({
            where: { quotationId: id },
            create: {
                quotationId: id,
                html,
            },
            update: {
                html,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json({ message: 'Personalización de impresión guardada correctamente', id: customization.id })
    } catch (error: any) {
        console.error('Error saving print customization:', error)
        return NextResponse.json({ message: 'Error al guardar la personalización de impresión', error: error.message }, { status: 500 })
    }
}
