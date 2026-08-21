import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const client = searchParams.get('client') || null
        const passenger = searchParams.get('passenger') || null
        const record = searchParams.get('record') || null
        const ticket = searchParams.get('ticket') || null
        const airline = searchParams.get('airline') || null

        const rawResults: any = await prisma.$queryRaw`
            SELECT * FROM public.fnReservaBuscarParaFacturar(
                ${client}, 
                ${passenger}, 
                ${record}, 
                ${ticket}, 
                ${airline}
            )
        `

        const data = Array.isArray(rawResults)
            ? rawResults.map((r: any) => r.fnreservabuscarparafacturar)
            : []

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Error fetching bookings for invoicing:', error)
        return NextResponse.json({ success: false, message: error.message || 'Error consultando reservas' }, { status: 500 })
    }
}
