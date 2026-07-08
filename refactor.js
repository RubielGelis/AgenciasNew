const fs = require('fs');

const invoiceFormPath = 'src/app/dashboard/invoices/new/invoice-form.tsx';
let content = fs.readFileSync(invoiceFormPath, 'utf8');

const mapStartString = '{formData.items.map((item, index) => (';
const mapStartIndex = content.indexOf(mapStartString);

if (mapStartIndex === -1) {
    console.error('Could not find start of map');
    process.exit(1);
}

let openBrackets = 0;
let mapEndIndex = -1;
let started = false;

for (let i = mapStartIndex; i < content.length; i++) {
    if (content[i] === '(') {
        openBrackets++;
        started = true;
    } else if (content[i] === ')') {
        openBrackets--;
    }
    
    if (started && openBrackets === 0) {
        mapEndIndex = i + 1;
        break;
    }
}

if (mapEndIndex === -1) {
    console.error('Could not find end of map');
    process.exit(1);
}

const mapBlock = content.substring(mapStartIndex, mapEndIndex);
const innerJsxMatch = mapBlock.match(/\{formData\.items\.map\(\(item, index\) => \(([\s\S]+)\)\)\}/);
if (!innerJsxMatch) {
    console.error('Could not extract inner JSX');
    process.exit(1);
}
let innerJsx = innerJsxMatch[1];

const importStatement = "import InvoiceProductRow from './InvoiceProductRow';\nimport GlobalPaymentModal from './GlobalPaymentModal';\n";
content = content.replace("import { SearchSelect } from '@/components/SearchSelect'", "import { SearchSelect } from '@/components/SearchSelect'\n" + importStatement);

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

content = content.substring(0, mapStartIndex) + replacementBlock + content.substring(mapEndIndex);

content = content.replace('const [saving, setSaving] = useState(false)', 'const [saving, setSaving] = useState(false)\n    const [isGlobalPaymentOpen, setIsGlobalPaymentOpen] = useState(false)\n');

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
content = content.replace('const handleSave = async (e: React.FormEvent, downloadPdf = false) => {', distributionFunc + '\n    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {');

const globalButtonHtml = `
                                        <div className="mt-4">
                                            <button type="button" onClick={() => setIsGlobalPaymentOpen(true)} className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold rounded-xl border border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Distribuir Pago Global
                                            </button>
                                        </div>
`;

// It might fail if the replace target is not exactly right, let's use a safe replace
content = content.replace(
    '<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>',
    '<p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>' + globalButtonHtml
);

content = content.replace('</form >', '</form>\n            <GlobalPaymentModal isOpen={isGlobalPaymentOpen} onClose={() => setIsGlobalPaymentOpen(false)} totalAmount={total} onApplyPayment={applyGlobalPayment} />');

fs.writeFileSync(invoiceFormPath, content);
console.log('Updated invoice-form.tsx');

const rowComponentCode = `import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SearchSelect } from '@/components/SearchSelect'
import { Trash2, DollarSign, Calculator, Plus, CreditCard } from 'lucide-react'
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
            ` + innerJsx.replace(/key=\{index\}/, '') + `
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

let finalRowCode = rowComponentCode.replace('{/* Product Taxes Row */}', paymentsButton + '\n                                        {/* Product Taxes Row */}');

fs.writeFileSync('src/app/dashboard/invoices/new/InvoiceProductRow.tsx', finalRowCode);
console.log('Created InvoiceProductRow.tsx');
