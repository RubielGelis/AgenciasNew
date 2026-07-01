import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, CheckCircle } from 'lucide-react';

interface GlobalPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onApplyPayment: (amount: number, method: string, date: string, reference: string, ccData?: { creditCardId?: number, cardNumber?: string, authorizationCode?: string, voucher?: string, expirationDate?: string }) => void;
    creditCards: any[];
    paymentsList?: any[];
}

export default function GlobalPaymentModal({ isOpen, onClose, totalAmount, onApplyPayment, creditCards, paymentsList = [] }: GlobalPaymentModalProps) {
    const [amount, setAmount] = useState(totalAmount);
    const [method, setMethod] = useState(paymentsList && paymentsList.length > 0 ? paymentsList[0].name : 'Efectivo');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState('');
    const [creditCardId, setCreditCardId] = useState<number | undefined>();
    const [cardNumber, setCardNumber] = useState('');
    const [authorizationCode, setAuthorizationCode] = useState('');
    const [voucher, setVoucher] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        onApplyPayment(amount, method, date, reference, method === 'Tarjeta de Credito' ? { creditCardId, cardNumber, authorizationCode, voucher, expirationDate } : undefined);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full ${(method === 'Tarjeta de Credito' || paymentsList?.find(p => p.name === method)?.iscredit) ? 'max-w-2xl' : 'max-w-md'} shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        Pago Global
                    </h3>
                    <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-sm text-zinc-500 mb-6">
                    Ingresa el pago por el valor total de la factura. El monto se prorrateará automáticamente entre todos los productos de la factura.
                </p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Monto Total a Pagar</label>
                            <input
                                type="number"
                                className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 outline-none text-lg font-black text-emerald-600"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                <CreditCard className="w-3 h-3" /> Forma de Pago
                            </label>
                            <select
                                className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 outline-none text-sm font-medium"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                            >
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Fecha
                            </label>
                            <input
                                type="date"
                                className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 outline-none text-sm font-medium"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Referencia</label>
                            <input
                                type="text"
                                placeholder="Ref / Voucher"
                                className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 outline-none text-sm font-medium"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                    </div>

                    {(method === 'Tarjeta de Credito' || paymentsList?.find(p => p.name === method)?.iscredit) && (
                        <div className="flex gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="space-y-1 col-span-3 sm:col-span-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Tipo TC</label>
                                <select className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={creditCardId || ''} onChange={(e) => setCreditCardId(parseInt(e.target.value) || undefined)}>
                                    <option value="">Seleccione...</option>
                                    {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 col-span-3 sm:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Núm. Tarjeta</label>
                                <input type="text" placeholder="**** **** **** 1234" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Autorización</label>
                                <input type="text" placeholder="000000" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={authorizationCode} onChange={(e) => setAuthorizationCode(e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Voucher</label>
                                <input type="text" placeholder="V-12345" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={voucher} onChange={(e) => setVoucher(e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Vencimiento</label>
                                <input type="text" placeholder="MM/AA" maxLength={5} className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-700 outline-none text-xs" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button type="button"
                        onClick={handleApply}
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Aplicar Pago y Distribuir
                    </button>
                </div>
            </div>
        </div>
    );
}
