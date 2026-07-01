import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const invoices = await prisma.invoices.findMany({
            orderBy: { date: 'desc' },
            take: 100
        });

        const clientIds = [...new Set(invoices.map(i => i.clientId))];
        const sellerIds = [...new Set(invoices.map(i => i.sellerId).filter(Boolean))];
        const branchIds = [...new Set(invoices.map(i => i.branchId))];

        const [clients, sellers, branches] = await Promise.all([
            prisma.client.findMany({ where: { id: { in: clientIds } } }),
            prisma.seller.findMany({ where: { id: { in: sellerIds as number[] } } }),
            prisma.branch.findMany({ where: { id: { in: branchIds } } })
        ]);

        const formattedHistory = invoices.map(inv => {
            const client = clients.find(c => c.id === inv.clientId);
            const seller = sellers.find(s => s.id === inv.sellerId);
            const branch = branches.find(b => b.id === inv.branchId);

            return {
                id: inv.id,
                invoiceNumber: inv.internalNumber,
                date: inv.date,
                clientName: client?.name || 'Consumidor Final',
                document: client?.document || '',
                amount: inv.totalAmount || 0,
                currency: inv.currency,
                state: inv.state || 'NUEVO',
                sellerName: seller?.name || '',
                branchName: branch?.name || '',
                itemsCount: 0 // Cannot easily count without relations, set to 0 for now
            };
        });

        return NextResponse.json(formattedHistory)
    } catch (error) {
        console.error('Error fetching invoice history:', error)
        return NextResponse.json({ message: 'Error fetching history' }, { status: 500 })
    }
}
