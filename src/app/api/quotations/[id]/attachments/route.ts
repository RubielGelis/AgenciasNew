import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET attachments for a quotation
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: quotationId } = await context.params
        const attachmentsRaw = await prisma.attachment.findMany({
            where: { quotationId: parseInt(quotationId) },
            orderBy: { createdAt: 'desc' }
        })
        const attachments = attachmentsRaw.map(att => ({
            ...att,
            fileUrl: `data:${att.fileType};base64,${Buffer.from(att.fileContent).toString('base64')}`
        }))
        return NextResponse.json(attachments)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching attachments', error: error.message }, { status: 500 })
    }
}

// POST new attachment (Base64 for simplicity as requested, no external storage configured)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: quotationId } = await context.params
        const body = await request.json()
        const { fileName, fileType, fileSize, fileUrl } = body
        // fileUrl is Base64 string from frontend FileReader.readAsDataURL
        const base64Data = fileUrl.split(';base64,').pop()
        if (!base64Data) throw new Error('Invalid file content')
        const buffer = Buffer.from(base64Data, 'base64')

        const attachment = await prisma.attachment.create({
            data: {
                quotationId: parseInt(quotationId),
                fileName,
                fileType,
                fileSize,
                fileContent: buffer
            }
        })

        const userIdHeader = request.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'UPDATE',
                module: 'QUOTATION',
                description: `Adjunto ${fileName} cargado a la cotización ID ${quotationId}.`,
                metadata: { quotationId, attachmentId: attachment.id }
            });
        });

        return NextResponse.json(attachment)
    } catch (error: any) {
        return NextResponse.json({ message: 'Error uploading attachment', error: error.message }, { status: 500 })
    }
}

// DELETE attachment
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { searchParams } = new URL(request.url)
        const attachmentId = searchParams.get('attachmentId')
        if (!attachmentId) return NextResponse.json({ message: 'Missing attachmentId' }, { status: 400 })

        const attachment = await prisma.attachment.delete({
            where: { id: parseInt(attachmentId) }
        })

        const userIdHeader = request.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'UPDATE',
                module: 'QUOTATION',
                description: `Adjunto ${attachment.fileName} eliminado de la cotización ID ${context.params.then(p => p.id)}.`,
                metadata: { attachmentId }
            });
        });

        return NextResponse.json({ message: 'Attachment deleted' })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting attachment', error: error.message }, { status: 500 })
    }
}
