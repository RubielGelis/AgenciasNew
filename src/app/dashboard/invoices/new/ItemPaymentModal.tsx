import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, CheckCircle, Trash2, Plus } from 'lucide-react';

interface Payment {
    amount: number;
    paymentMethod: string;
    date: string;
    reference: string;
    creditCardId?: number;
    cardNumber?: string;
    authorizationCode?: string;
    voucher?: string;
    expirationDate?: string;
}

interface ItemPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    itemTotal: number;
    payments: Payment[];
    onUpdatePayments: (payments: Payment[]) => void;
    creditCards: any[];
    paymentsList?: any[];
}

export default function ItemPaymentModal({ isOpen, onClose, productName, itemTotal, payments, onUpdatePayments, creditCards, paymentsList = [] }: ItemPaymentModalProps) {
    const [localPayments, setLocalPayments] = useState<Payment[]>(payments || []);

    if (!isOpen) return null;

    const totalPaid = localPayments.reduce((acc, p) => acc + p.amount, 0);
    const balance = itemTotal - totalPaid;

    const addPayment = () => {
        setLocalPayments([
            ...localPayments,
            { amount: balance > 0 ? balance : 0, paymentMethod: paymentsList && paymentsList.length > 0 ? paymentsList[0].name : 'Efectivo', date: new Date().toISOString().split('T')[0], reference: '' }
        ]);
    };

    const removePayment = (index: number) => {
        setLocalPayments(localPayments.filter((_, i) => i !== index));
    };

    const updatePayment = (index: number, field: keyof Payment, value: any) => {
        const newP = [...localPayments];
        newP[index] = { ...newP[index], [field]: value };
        setLocalPayments(newP);
    };

    const handleSave = () => {
        onUpdatePayments(localPayments);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-500" />
                            Pagos por Producto
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Producto: <span className="font-bold text-zinc-800 dark:text-zinc-200">{productName || 'Sin asignar'}</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Producto</span>
                                <span className="text-sm font-black">${itemTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800/30">
                                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Pagado</span>
                                <span className="text-sm font-black text-emerald-600">${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className={`px-4 py-2 rounded-xl shadow-sm border ${balance > 0 ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800/30' : 'bg-zinc-100 border-zinc-200 text-zinc-400 dark:bg-zinc-800'}`}>
                                <span className="text-[10px] uppercase font-bold block">Saldo</span>
                                <span className="text-sm font-black">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <button type="button" onClick={addPayment} className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all">
                            <Plus className="w-3.5 h-3.5" /> Agregar Pago
                        </button>
                    </div>

                    <div className="space-y-3">
                        {localPayments.length === 0 && (
                            <div className="text-center py-8 text-zinc-400 text-sm font-medium border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                                No se han registrado pagos para este producto.
                            </div>
                        )}
                        {localPayments.map((payment, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col gap-3">
                                <div className="flex items-end gap-3 w-full">
                                    <div className="space-y-1 flex-[1.5]">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Monto</label>
                                        <input type="number" className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs font-bold text-emerald-600" value={payment.amount} onChange={(e) => updatePayment(idx, 'amount', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-1 flex-[2]">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Forma de Pago</label>
                                        <select className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.paymentMethod} onChange={(e) => updatePayment(idx, 'paymentMethod', e.target.value)}>
                                            {paymentsList.length > 0 ? (
                                                paymentsList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                                            ) : (
                                                <>
                                                    <option value="Efectivo">Efectivo</option>
                                                    <option value="Tarjeta de Credito">Tarjeta de Crédito</option>
                                                    <option value="Transferencia">Transferencia</option>
                                                    <option value="Credito">Crédito</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-1 flex-[1.5]">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Fecha</label>
                                        <input type="date" className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.date} onChange={(e) => updatePayment(idx, 'date', e.target.value)} />
                                    </div>
                                    <div className="space-y-1 flex-[2]">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Referencia</label>
                                        <input type="text" placeholder="Ref/Voucher" className="w-full h-9 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.reference} onChange={(e) => updatePayment(idx, 'reference', e.target.value)} />
                                    </div>
                                    <button type="button" onClick={() => removePayment(idx)} className="h-9 px-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {(payment.paymentMethod === 'Tarjeta de Credito' || paymentsList?.find(p => p.name === payment.paymentMethod)?.iscredit) && (
                                    <div className="flex gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Tipo TC</label>
                                            <select className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.creditCardId || ''} onChange={(e) => updatePayment(idx, 'creditCardId', parseInt(e.target.value) || undefined)}>
                                                <option value="">Seleccione...</option>
                                                {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1 flex-[1.5]">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Núm. Tarjeta</label>
                                            <input type="text" placeholder="**** **** **** 1234" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.cardNumber || ''} onChange={(e) => updatePayment(idx, 'cardNumber', e.target.value)} />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Autorización</label>
                                            <input type="text" placeholder="000000" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.authorizationCode || ''} onChange={(e) => updatePayment(idx, 'authorizationCode', e.target.value)} />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Voucher</label>
                                            <input type="text" placeholder="V-12345" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.voucher || ''} onChange={(e) => updatePayment(idx, 'voucher', e.target.value)} />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500">Vencimiento</label>
                                            <input type="text" placeholder="MM/AA" maxLength={5} className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={payment.expirationDate || ''} onChange={(e) => updatePayment(idx, 'expirationDate', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Guardar Pagos
                    </button>
                </div>
            </div>
        </div>
    );
}
