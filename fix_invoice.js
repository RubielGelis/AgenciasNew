const fs = require('fs');

const quotationFormPath = 'src/app/dashboard/quotations/new/quotation-form.tsx';
const invoiceFormPath = 'src/app/dashboard/invoices/new/invoice-form.tsx';

// 1. Read quotation-form
let qContent = fs.readFileSync(quotationFormPath, 'utf8');

// 2. Rename Quotation to Invoice
let iContent = qContent.replace(/Quotation/g, 'Invoice')
                       .replace(/quotation/g, 'invoice')
                       .replace(/Cotizaci/g, 'Facturaci')
                       .replace(/cotizaci/g, 'facturaci')
                       .replace(/Cotización/g, 'Factura')
                       .replace(/cotización/g, 'factura')
                       .replace(/Cotizaciones/g, 'Facturas')
                       .replace(/cotizaciones/g, 'facturas');

// Adjust API endpoint manually
iContent = iContent.replace('/api/invoices/', '/api/invoices/');

// Add import for GlobalPaymentModal and InvoiceProductRow
iContent = iContent.replace("import { SearchSelect } from '@/components/SearchSelect'", "import { SearchSelect } from '@/components/SearchSelect'\nimport GlobalPaymentModal from './GlobalPaymentModal';\nimport InvoiceProductRow from './InvoiceProductRow';");

// Find the map block by finding exact strings
const mapStartString = '{formData.items.map((item, index) => (';
const mapEndString = '                                    </motion.div>\n                                ))}';

const mapStartIndex = iContent.indexOf(mapStartString);
const mapEndIndex = iContent.indexOf(mapEndString, mapStartIndex) + mapEndString.length;

if (mapStartIndex === -1 || mapEndIndex < mapStartString.length) {
    console.error('Failed to find map block');
    process.exit(1);
}

const mapBlock = iContent.substring(mapStartIndex, mapEndIndex);

// Extract inner JSX by removing the map wrapping
let innerJsx = mapBlock.substring(mapStartString.length, mapBlock.length - mapEndString.length + '                                    </motion.div>'.length);
// Remove the motion.div wrapper from innerJsx to just return the fragments, or keep motion.div inside InvoiceProductRow
// Actually we can keep motion.div inside InvoiceProductRow!
innerJsx = innerJsx.replace(/key=\{index\}/, ''); 

// 3. Inject new fields (Services, Tickets) into the innerJsx
const checkOutField = `
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Check-Out</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs p-1"
                                                        value={item.checkOut}
                                                        onChange={(e) => updateItem(index, 'checkOut', e.target.value)}
                                                    />
                                                </div>`;

const newFieldsHtml = `
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Servicios Incluidos</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.servicios || ''} onChange={(e) => updateItem(index, 'servicios', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Descripción Extra</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.descripcion || ''} onChange={(e) => updateItem(index, 'descripcion', e.target.value)} />
                                                </div>`;
                                                
innerJsx = innerJsx.replace(checkOutField, checkOutField + newFieldsHtml);

const ticketFieldsHtml = `
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
                                            )}
`;
const reservationCodeEnd = `                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.reservationCode} onChange={(e) => updateItem(index, 'reservationCode', e.target.value)} />
                                                </div>
                                            </div>`;
                                            
innerJsx = innerJsx.replace(reservationCodeEnd, reservationCodeEnd + "\n" + ticketFieldsHtml);

// Add the payment button right before the Product Taxes Row
const paymentsButton = `
                                            <div className="col-span-12 mt-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Pagos Registrados</p>
                                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Total: \${itemTotal.toLocaleString()} | Pagado: \${totalPaid.toLocaleString()}</p>
                                                </div>
                                                <button type="button" onClick={() => setIsPaymentModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all">
                                                    <CreditCard className="w-3.5 h-3.5" /> Administrar Pagos
                                                </button>
                                            </div>
`;
innerJsx = innerJsx.replace('{/* Product Taxes Row */}', paymentsButton + '\n                                        {/* Product Taxes Row */}');

// Create InvoiceProductRow.tsx
const rowComponentCode = `import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchSelect } from '@/components/SearchSelect'
import { Trash2, DollarSign, Calculator, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import ItemPaymentModal from './ItemPaymentModal'

export default function InvoiceProductRow({ item, index, data, updateItem, removeItem, handleCalculateTaxes }: any) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const itemCost = (item.price * item.quantity) || 0;
    const taxesCost = (item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
    const itemTotal = itemCost + taxesCost;
    const totalPaid = (item.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0);

    return (
        <>
            ` + innerJsx + `
            <ItemPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                productName={item._productName || 'Producto sin nombre'}
                itemTotal={itemTotal}
                payments={item.payments || []}
                onUpdatePayments={(payments) => updateItem(index, 'payments', payments)}
            />
        </>
    )
}
`;
fs.writeFileSync('src/app/dashboard/invoices/new/InvoiceProductRow.tsx', rowComponentCode);
console.log('Created InvoiceProductRow.tsx');

// Replace mapBlock in invoice-form.tsx with the component
const replacementBlock = `{formData.items.map((item, index) => (
                                    <InvoiceProductRow
                                        key={index}
                                        item={item}
                                        index={index}
                                        data={data}
                                        updateItem={updateItem}
                                        removeItem={removeItem}
                                        handleCalculateTaxes={handleCalculateTaxes}
                                    />
                                ))}`;
                                
iContent = iContent.substring(0, mapStartIndex) + replacementBlock + iContent.substring(mapEndIndex);

// Add global payment logic
iContent = iContent.replace('const [saving, setSaving] = useState(false)', 'const [saving, setSaving] = useState(false)\n    const [isGlobalPaymentOpen, setIsGlobalPaymentOpen] = useState(false)\n');

const distributionFunc = `
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
iContent = iContent.replace('const handleSave = async (e: React.FormEvent, downloadPdf = false) => {', distributionFunc + '\n    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {');

const globalButtonHtml = `
                                        <div className="mt-4">
                                            <button type="button" onClick={() => setIsGlobalPaymentOpen(true)} className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold rounded-xl border border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Distribuir Pago Global
                                            </button>
                                        </div>
`;

iContent = iContent.replace(
    '<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>',
    '<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>' + globalButtonHtml
);

iContent = iContent.replace('</form >', '</form>\n            <GlobalPaymentModal isOpen={isGlobalPaymentOpen} onClose={() => setIsGlobalPaymentOpen(false)} totalAmount={total} onApplyPayment={applyGlobalPayment} />');

fs.writeFileSync(invoiceFormPath, iContent);
console.log('Restored and updated invoice-form.tsx completely.');
