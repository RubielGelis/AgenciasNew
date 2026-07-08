const fs = require('fs');

const invoiceFormPath = 'src/app/dashboard/invoices/new/invoice-form.tsx';

// 1. Reset from quotation-form.tsx
fs.copyFileSync('src/app/dashboard/quotations/new/quotation-form.tsx', invoiceFormPath);
let content = fs.readFileSync(invoiceFormPath, 'utf8');

// 2. Rename Quotation to Invoice
content = content.replace(/Quotation/g, 'Invoice')
                 .replace(/quotation/g, 'invoice')
                 .replace(/Cotizaci/g, 'Facturaci')
                 .replace(/cotizaci/g, 'facturaci')
                 .replace(/Cotización/g, 'Factura')
                 .replace(/cotización/g, 'factura')
                 .replace(/Cotizaciones/g, 'Facturas')
                 .replace(/cotizaciones/g, 'facturas');

// 3. Fix API URL
content = content.replace('/api/invoices/', '/api/invoices/');

// 4. Add imports
content = content.replace(
    "import { SearchSelect } from '@/components/SearchSelect'",
    "import { SearchSelect } from '@/components/SearchSelect'\nimport GlobalPaymentModal from './GlobalPaymentModal';\nimport ItemPaymentModal from './ItemPaymentModal';\nimport { CreditCard, DollarSign } from 'lucide-react';"
);

// 5. Update Interface
const extraInterface = `        servicios?: string;
        descripcion?: string;
        ticketCode?: string;
        class?: string;
        itinerary?: string;
        ticketTypeId?: number;
        payments?: { amount: number, paymentMethod: string, date: string, reference: string }[];
        isPaymentModalOpen?: boolean;`;
content = content.replace(
    "passengers: { name: string, document: string }[];",
    "passengers?: { name: string, document: string }[];\n" + extraInterface
);

// 6. Global Payment State
content = content.replace(
    "const [saving, setSaving] = useState(false)",
    "const [saving, setSaving] = useState(false)\n    const [isGlobalPaymentOpen, setIsGlobalPaymentOpen] = useState(false)"
);

// 7. applyGlobalPayment Function
const globalPaymentFn = `
    const applyGlobalPayment = (amount: number, method: string, date: string, reference: string) => {
        let remaining = amount;
        const newItems = [...formData.items];
        for (let i = 0; i < newItems.length; i++) {
            if (remaining <= 0) break;
            const itemCost = (newItems[i].price * newItems[i].quantity) || 0;
            const taxesCost = (newItems[i].appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
            const itemTotal = itemCost + taxesCost;
            
            let paymentAmount = itemTotal;
            if (remaining < itemTotal) {
                paymentAmount = remaining;
            }
            if (!newItems[i].payments) newItems[i].payments = [];
            newItems[i].payments.push({ amount: paymentAmount, paymentMethod: method, date, reference });
            remaining -= paymentAmount;
        }
        setFormData({ ...formData, items: newItems });
        alert('Pago global distribuido con éxito.');
    };
`;
content = content.replace(
    "const handleSave = async (e: React.FormEvent, downloadPdf = false) => {",
    globalPaymentFn + "\n    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {"
);

// 8. Add extra fields for Tiquete, Servicios, Descripcion
const fieldsHook = `                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Reservación</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.reservationCode} onChange={(e) => updateItem(index, 'reservationCode', e.target.value)} />
                                                </div>
                                            </div>`;
                                            
const newFieldsHtml = `
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Servicios Incluidos</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.servicios || ''} onChange={(e) => updateItem(index, 'servicios', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Descripción Extra</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.descripcion || ''} onChange={(e) => updateItem(index, 'descripcion', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Reservación</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.reservationCode} onChange={(e) => updateItem(index, 'reservationCode', e.target.value)} />
                                                </div>
                                            </div>

                                            {item.serviceType?.toLowerCase() === 'aire' && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                    <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-2">Campos Especiales Tiquete</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-blue-500">Tiquete (Número)</label>
                                                            <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.ticketCode || ''} onChange={(e) => updateItem(index, 'ticketCode', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-blue-500">Clase</label>
                                                            <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.class || ''} onChange={(e) => updateItem(index, 'class', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-blue-500">Itinerario</label>
                                                            <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.itinerary || ''} onChange={(e) => updateItem(index, 'itinerary', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-blue-500">Tipo de Tiquete</label>
                                                            <select className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.ticketTypeId || ''} onChange={(e) => updateItem(index, 'ticketTypeId', parseInt(e.target.value) || undefined)}>
                                                                <option value="">Seleccione...</option>
                                                                {data.ticketTypes?.map((tt: any) => (
                                                                    <option key={tt.id} value={tt.id}>{tt.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}`;
content = content.replace(fieldsHook, newFieldsHtml);

// 9. Add Item Payment Modal
const paymentRowHook = `                                        {/* Product Taxes Row */}`;
const paymentRowHtml = `
                                            <div className="col-span-12 mt-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Pagos Registrados</p>
                                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                        Total: \${(((item.price * item.quantity) || 0) + ((item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0))).toLocaleString(undefined, {minimumFractionDigits: 2})} | Pagado: \${((item.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => updateItem(index, 'isPaymentModalOpen', true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all">
                                                    <CreditCard className="w-3.5 h-3.5" /> Administrar Pagos
                                                </button>
                                            </div>
                                            <ItemPaymentModal
                                                isOpen={item.isPaymentModalOpen || false}
                                                onClose={() => updateItem(index, 'isPaymentModalOpen', false)}
                                                productName={item.productId ? (data.products?.find((p:any) => p.id.toString() === item.productId?.toString())?.description || 'Producto') : 'Producto sin nombre'}
                                                itemTotal={((item.price * item.quantity) || 0) + ((item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0))}
                                                payments={item.payments || []}
                                                onUpdatePayments={(payments) => updateItem(index, 'payments', payments)}
                                            />
                                            
                                        {/* Product Taxes Row */}`;
content = content.replace(paymentRowHook, paymentRowHtml);

// 10. Add Global Payment Button
const globalBtnHook = `<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>`;
const globalBtnHtml = `<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>
                                        <div className="mt-4">
                                            <button type="button" onClick={() => setIsGlobalPaymentOpen(true)} className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold rounded-xl border border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Distribuir Pago Global
                                            </button>
                                        </div>`;
content = content.replace(globalBtnHook, globalBtnHtml);

// 11. Add Global Payment Modal Render
content = content.replace(
    /return \(\r?\n\s*<form/,
    'return (\n        <>\n        <form'
);
content = content.replace(
    '</form >', 
    '</form>\n            <GlobalPaymentModal isOpen={isGlobalPaymentOpen} onClose={() => setIsGlobalPaymentOpen(false)} totalAmount={total} onApplyPayment={applyGlobalPayment} />\n        </>'
);


// 12. Fix CreditCard and DollarSign imports if duplicated
// Actually we appended it to SearchSelect which is fine.
content = content.replace("import { CreditCard, DollarSign } from 'lucide-react';", "import { CreditCard } from 'lucide-react';");

fs.writeFileSync(invoiceFormPath, content);
console.log('Reset and injected everything successfully.');
