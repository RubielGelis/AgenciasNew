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

        const rows: any[] = await prisma.$queryRawUnsafe(
            `SELECT "html" FROM public."QuotationPrintCustomization" WHERE "quotationId" = $1::INT LIMIT 1`,
            quotationId
        );

        return NextResponse.json({ html: rows[0]?.html || null })
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

        // Asegurar que la secuencia, tabla, default autoincremental y restricción UNIQUE existan antes de ejecutar
        await prisma.$executeRawUnsafe(`
            CREATE SEQUENCE IF NOT EXISTS public."QuotationPrintCustomization_id_seq";
            CREATE TABLE IF NOT EXISTS public."QuotationPrintCustomization" (
                id SERIAL PRIMARY KEY,
                "quotationId" INTEGER NOT NULL UNIQUE,
                "html" TEXT NOT NULL,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
            ALTER TABLE public."QuotationPrintCustomization" ALTER COLUMN id SET DEFAULT nextval('public."QuotationPrintCustomization_id_seq"'::regclass);
            ALTER SEQUENCE public."QuotationPrintCustomization_id_seq" OWNED BY public."QuotationPrintCustomization".id;
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuotationPrintCustomization_quotationId_key') THEN
                    ALTER TABLE public."QuotationPrintCustomization" ADD CONSTRAINT "QuotationPrintCustomization_quotationId_key" UNIQUE ("quotationId");
                END IF;
            END $$;
        `);

        // Ejecutar upsert atómico mediante ON CONFLICT
        await prisma.$executeRawUnsafe(
            `INSERT INTO public."QuotationPrintCustomization" ("quotationId", "html", "createdAt", "updatedAt")
             VALUES ($1::INT, $2::TEXT, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT ("quotationId")
             DO UPDATE SET "html" = EXCLUDED."html", "updatedAt" = CURRENT_TIMESTAMP`,
            id,
            html
        );

        return NextResponse.json({ message: 'Personalización de impresión guardada correctamente', quotationId: id })
    } catch (error: any) {
        console.error('Error saving print customization:', error)
        return NextResponse.json({ 
            message: 'Error al guardar la personalización de impresión',
            detail: error?.message || String(error)
        }, { status: 500 })
    }
}
