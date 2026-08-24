import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : undefined

        // Defensive check for models
        const requiredModels = ['client', 'provider', 'prestadora', 'branch', 'implant', 'product', 'chargeAndTax', 'seller', 'ticketPrinter', 'masterVariable', 'user', 'combo', 'currency']
        const availableModels = Object.keys(prisma).filter(k => k[0] !== '$' && k[0] !== '_');
        
        for (const model of requiredModels) {
            if (!(prisma as any)[model]) {
                console.warn(`Prisma model "${model}" is undefined in base-data API! Available: ${availableModels.join(', ')}`)
                // We'll continue but this model will return empty array below
            }
        }

        // Seed default states if none exist
        try {
            const stateCount = await (prisma as any).quotationState?.count();
            if (stateCount === 0) {
                await (prisma as any).quotationState?.createMany({
                    data: [
                        { code: 'NUEVO', name: 'Nuevo', color: 'blue' },
                        { code: 'ENVIADO', name: 'ENVIADO', color: 'emerald' }
                    ]
                });
            }
        } catch (e) {
            console.error("Failed to seed default states in base-data", e);
        }

        const [clients, providers, prestadoras, branches, implants, products, taxes, sellers, ticketPrinters, variables, currentUser, combos, currencies, creditCards, payments, quotationStates, parameters] = await Promise.all([
            Promise.resolve([]), // Do not fetch all clients in base data
            (prisma as any).provider?.findMany({ include: { prestadoras: true } }) || Promise.resolve([]),
            (prisma as any).prestadora?.findMany() || Promise.resolve([]),
            (prisma as any).branch?.findMany() || Promise.resolve([]),
            (prisma as any).implant?.findMany({ select: { id: true, code: true, name: true, branchId: true } }) || Promise.resolve([]),
            (prisma as any).product?.findMany() || Promise.resolve([]),
            (prisma as any).chargeAndTax?.findMany() || Promise.resolve([]),
            (prisma as any).seller?.findMany() || Promise.resolve([]),
            (prisma as any).ticketPrinter?.findMany() || Promise.resolve([]),
            (prisma as any).masterVariable?.findMany() || Promise.resolve([]),
            actingUserId ? (prisma as any).user?.findUnique({ where: { id: actingUserId } }) : Promise.resolve(null),
            (prisma as any).combo?.findMany({
                include: {
                    products: {
                        include: {
                            appliedTaxes: {
                                include: { chargeAndTax: true }
                            },
                            product: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            (prisma as any).currency?.findMany() || Promise.resolve([]),
            (prisma as any).creditCard?.findMany() || Promise.resolve([]),
            (prisma as any).payment?.findMany() || Promise.resolve([]),
            (prisma as any).quotationState?.findMany({ orderBy: { id: 'asc' } }) || Promise.resolve([]),
            (prisma as any).systemParameter?.findMany() || Promise.resolve([])
        ])

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validCombos = (combos || []).map((combo: any) => ({
            ...combo,
            products: combo.products.filter((p: any) => !p.checkOutDate || new Date(p.checkOutDate) >= today)
        })).filter((combo: any) => combo.products.length > 0 && (combo.cupos === undefined || combo.cupos === null || combo.cupos > 0));

        const showTotalsParam = await (prisma as any).systemParameter?.findUnique({
            where: { code: 'MOSTRAR_TOTALIZACION_COTIZACION' }
        });
        const showTotals = showTotalsParam ? showTotalsParam.value?.trim().toLowerCase() === 'true' : true;

        return NextResponse.json({
            clients,
            providers,
            prestadoras,
            branches,
            implants,
            products,
            taxes,
            sellers,
            ticketPrinters,
            variables,
            currentUser,
            combos: validCombos,
            currencies,
            creditCards,
            payments,
            quotationStates,
            showTotals,
            parameters
        })
    } catch (error: any) {
        console.error('Data fetch error:', error)
        return NextResponse.json({ message: 'Error fetching base data', detail: error?.message || String(error) }, { status: 500 })
    }
}
