import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCellCustomizationConfig, syncCellCustomization } from '@/lib/cell-customization'
import { generateHtmlTemplate } from '@/lib/excel-to-html'
import { logSystemEvent } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const implants = await prisma.$queryRawUnsafe<any[]>(
            `SELECT i.*, 
                    json_build_object('id', b.id, 'code', b.code, 'name', b.name) as branch
             FROM public.fnImplantListar() i
             LEFT JOIN public."Branch" b ON i."branchId" = b.id`
        )
        
        const implantsWithLogo = await Promise.all(implants.map(async i => {
            const physicalConfig = await getCellCustomizationConfig(null, i.id)
            return {
                ...i,
                logo: i.logo ? `data:image/png;base64,${Buffer.from(i.logo).toString('base64')}` : null,
                template: undefined,
                hasTemplate: !!i.template,
                templateConfig: physicalConfig || i.templateConfig,
                // Clean up empty branch objects created by json_build_object on left join mismatch
                branch: i.branch && i.branch.id ? i.branch : null
            }
        }))
        
        return NextResponse.json(paginateArray(req, implantsWithLogo, i => [i.code, i.name]))
    } catch (error: any) {
        console.error('Error in implants GET', error)
        return NextResponse.json({ message: 'Error fetching implants', detail: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        let logoBuffer = null;
        if (body.logo) {
            const base64Data = body.logo.replace(/^data:image\/\w+;base64,/, "");
            logoBuffer = Buffer.from(base64Data, 'base64');
        }

        let templateBuffer = null;
        if (body.template) {
            const cleanBase64 = body.template.split(';base64,').pop() || body.template;
            templateBuffer = Buffer.from(cleanBase64, 'base64');
        }

        // Generate the HTML template *before* calling the stored procedure
        let htmlTemplate = null;
        if (templateBuffer) {
            try {
                htmlTemplate = await generateHtmlTemplate(templateBuffer, body.templateConfig, logoBuffer);
            } catch (htmlErr: any) {
                console.error("Error generating HTML template during implant creation:", htmlErr);
                throw new Error("Error generating HTML template: " + (htmlErr.message || String(htmlErr)));
            }
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spImplantCrear($1::TEXT, $2::TEXT, $3::BYTEA, $4::BYTEA, $5::JSONB, $6::TEXT, $7::INT, $8::INT, $9::INT, $10::TEXT)`,
            body.code,
            body.name,
            logoBuffer,
            templateBuffer,
            body.templateConfig ? body.templateConfig : null,
            htmlTemplate,
            body.branchId ? parseInt(body.branchId) : null,
            actingUserId,
            0, // p_implant_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_implant_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating implant');
        }

        if (body.templateConfig) {
            await syncCellCustomization(null, dbId, body.templateConfig);
        }

        const implant = { id: dbId, ...body };

        logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Implant ${implant.name} creado (SP).`, metadata: implant });

        return NextResponse.json(implant)
    } catch (error: any) {
        console.error('Error creating implant:', error);
        return NextResponse.json({ message: 'Error al crear implant: ' + error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        
        let logoBuffer = null;
        if (body.logo) {
            const base64Data = body.logo.replace(/^data:image\/\w+;base64,/, "");
            logoBuffer = Buffer.from(base64Data, 'base64');
        }

        let templateBuffer = null;
        if (body.template) {
            const cleanBase64 = body.template.split(';base64,').pop() || body.template;
            templateBuffer = Buffer.from(cleanBase64, 'base64');
        }

        // Generate/update HTML template *before* calling the stored procedure
        const dbId = parseInt(body.id);
        let finalLogoBuffer = logoBuffer;
        let finalTemplateBuffer = templateBuffer;
        
        if (!finalTemplateBuffer || !finalLogoBuffer) {
            const current = await prisma.implant.findUnique({
                where: { id: dbId },
                select: { template: true, logo: true }
            });
            if (!finalTemplateBuffer && current?.template) {
                finalTemplateBuffer = Buffer.from(current.template);
            }
            if (!finalLogoBuffer && current?.logo) {
                finalLogoBuffer = Buffer.from(current.logo);
            }
        }

        let htmlTemplate = null;
        if (finalTemplateBuffer) {
            try {
                htmlTemplate = await generateHtmlTemplate(finalTemplateBuffer, body.templateConfig, finalLogoBuffer);
            } catch (htmlErr: any) {
                console.error("Error generating/updating HTML template during implant update:", htmlErr);
                throw new Error("Error generating HTML template: " + (htmlErr.message || String(htmlErr)));
            }
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spImplantActualizar($1::INT, $2::TEXT, $3::TEXT, $4::BYTEA, $5::BYTEA, $6::JSONB, $7::TEXT, $8::INT, $9::INT, $10::TEXT)`,
            dbId,
            body.code,
            body.name,
            logoBuffer,
            templateBuffer,
            body.templateConfig ? body.templateConfig : null,
            htmlTemplate,
            body.branchId ? parseInt(body.branchId) : null,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        if (body.templateConfig) {
            await syncCellCustomization(null, dbId, body.templateConfig);
        }

        const implant = { ...body };

        logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Implant ${implant.name} actualizado (SP).`, metadata: implant });

        return NextResponse.json(implant)
    } catch (error: any) {
        console.error('Error updating implant:', error);
        return NextResponse.json({ message: 'Error al actualizar implant: ' + error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spImplantEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Implant con ID ${id} eliminado (SP).` });

        return NextResponse.json({ message: 'Implant deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting implant:', error);
        return NextResponse.json({ message: 'Error al eliminar implant: ' + error.message }, { status: 500 })
    }
}
