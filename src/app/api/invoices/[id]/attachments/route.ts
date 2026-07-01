import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET attachments for a invoice (Not implemented yet in schema)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return NextResponse.json([])
}

// POST new attachment (Not implemented yet in schema)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return NextResponse.json({ message: 'Attachments for invoices not implemented in schema' }, { status: 501 })
}

// DELETE attachment (Not implemented yet in schema)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    return NextResponse.json({ message: 'Attachments for invoices not implemented in schema' }, { status: 501 })
}
