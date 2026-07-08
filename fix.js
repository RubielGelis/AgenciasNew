const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/invoices/new/invoice-form.tsx', 'utf-8');
const startMarker = 'items: formData.items.map(item => {';
const endMarker = "                    'Content-Type': 'application/json',";

const correctCode = `items: formData.items.map(item => {
                    const taxes: any[] = [];

                    // Add main tax if exists
                    if (item.mainTaxId) {
                        const amount = item.price * item.quantity;
                        taxes.push({ chargeAndTaxId: item.mainTaxId, explicitAmount: amount });
                    }

                    // Add secondary taxes
                    (item.appliedTaxes || []).forEach(t => {
                        const taxId = t.id || (t as any).chargeAndTaxId;
                        if (taxId && taxId !== item.mainTaxId) {
                            taxes.push({ chargeAndTaxId: taxId, explicitAmount: t.amount });
                        }
                    });

                    return {
                        ...item,
                        productId: item.productId || null,
                        providerId: item.providerId || null,
                        prestadoraId: item.prestadoraId || null,
                        ticketCode: item.ticketCode || null,
                        serviceType: item.serviceType || null,
                        descripcion: item.descripcion || null,
                        cost: item.cost || 0,
                        appliedTaxes: taxes,
                        variables: item.variables || []
                    };
                })
            }

            const endpoint = invoiceId ? \`/api/invoices/\${invoiceId}\` : '/api/invoices';
            const method = invoiceId ? 'PUT' : 'POST';
            const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',`;

const idx1 = content.indexOf(startMarker);
const idx2 = content.indexOf(endMarker, idx1);
if (idx1 !== -1 && idx2 !== -1) {
    content = content.substring(0, idx1) + correctCode + content.substring(idx2 + endMarker.length);
    fs.writeFileSync('src/app/dashboard/invoices/new/invoice-form.tsx', content, 'utf-8');
    console.log('Fixed payload creation block');
} else {
    console.log('Could not find markers');
}
