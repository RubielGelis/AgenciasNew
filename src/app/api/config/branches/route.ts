import { paginateArray } from '@/lib/pagination'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCellCustomizationConfig, syncCellCustomization } from '@/lib/cell-customization'
import { generateHtmlTemplate } from '@/lib/excel-to-html'
import { logSystemEvent } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const branches = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM public.fnBranchListar()`)
        
        // Convert Buffer/Uint8Array to base64 string for the frontend
        const branchesWithLogo = await Promise.all(branches.map(async b => {
            const physicalConfig = await getCellCustomizationConfig(b.id, null)
            return {
                ...b,
                logo: b.logo ? `data:image/png;base64,${Buffer.from(b.logo).toString('base64')}` : null,
                template: undefined, // remove template binary from list to save payload size
                hasTemplate: !!b.template,
                templateConfig: physicalConfig || b.templateConfig
            }
        }))
        
        return NextResponse.json(paginateArray(req, branchesWithLogo, b => [b.code, b.name]))
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching branches' }, { status: 500 })
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
                console.error("Error generating HTML template during branch creation:", htmlErr);
                throw new Error("Error generating HTML template: " + (htmlErr.message || String(htmlErr)));
            }
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spBranchCrear($1::TEXT, $2::TEXT, $3::BYTEA, $4::BYTEA, $5::JSONB, $6::TEXT, $7::INT, $8::INT, $9::TEXT)`,
            body.code,
            body.name,
            logoBuffer,
            templateBuffer,
            body.templateConfig ? body.templateConfig : null,
            htmlTemplate,
            actingUserId,
            0, // p_branch_id
            '' // p_mensaje_resultado
        );

        const dbId = results[0]?.p_branch_id;
        const message = results[0]?.p_mensaje_resultado || '';

        if (!dbId || message.startsWith('ERROR')) {
            throw new Error(message || 'Error creating branch');
        }

        if (body.templateConfig) {
            await syncCellCustomization(dbId, null, body.templateConfig);
        }

        const branch = { id: dbId, ...body };

        logSystemEvent({ userId: actingUserId, action: 'CREATE', module: 'MASTER_DATA', description: `Sucursal ${branch.name} creada (SP).`, metadata: branch });

        return NextResponse.json(branch)
    } catch (error: any) {
        console.error('Error creating branch:', error);
        return NextResponse.json({ message: 'Error al crear sucursal: ' + error.message }, { status: 500 })
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
            const current = await prisma.branch.findUnique({
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
                console.error("Error generating/updating HTML template during branch update:", htmlErr);
                throw new Error("Error generating HTML template: " + (htmlErr.message || String(htmlErr)));
            }
        }

        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spBranchActualizar($1::INT, $2::TEXT, $3::TEXT, $4::BYTEA, $5::BYTEA, $6::JSONB, $7::TEXT, $8::INT, $9::TEXT)`,
            dbId,
            body.code,
            body.name,
            logoBuffer,
            templateBuffer,
            body.templateConfig ? body.templateConfig : null,
            htmlTemplate,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        if (body.templateConfig) {
            await syncCellCustomization(dbId, null, body.templateConfig);
        }

        const branch = { ...body };

        logSystemEvent({ userId: actingUserId, action: 'UPDATE', module: 'MASTER_DATA', description: `Sucursal ${branch.name} actualizada (SP).`, metadata: branch });

        return NextResponse.json(branch)
    } catch (error: any) {
        console.error('Error updating branch:', error);
        return NextResponse.json({ message: 'Error al actualizar sucursal: ' + error.message }, { status: 500 })
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
            `CALL public.spBranchEliminar($1::INT, $2::INT, $3::TEXT)`,
            parseInt(id),
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';
        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        logSystemEvent({ userId: actingUserId, action: 'DELETE', module: 'MASTER_DATA', description: `Sucursal con ID ${id} eliminada (SP).` });

        return NextResponse.json({ message: 'Branch deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting branch:', error);
        return NextResponse.json({ message: 'Error al eliminar sucursal: ' + error.message }, { status: 500 })
    }
}
