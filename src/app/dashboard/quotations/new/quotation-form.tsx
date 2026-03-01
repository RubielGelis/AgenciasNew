'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Trash2, Plus, ChevronDown, Calendar, Users, Globe, DollarSign, Briefcase, Hotel as HotelIcon, Tag, Tags, Percent, Calculator, ArrowRight, Loader2, FileDown } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { generateQuotationPDF } from '@/lib/pdf-utils'

interface QuotationFormData {
    clientId: string;
    providerId: string;
    hotelId: string;
    branchId: string;
    implantId: string;
    checkIn: string;
    checkOut: string;
    currency: string;
    exchangeRate: number;
    paxAdults: number;
    paxChildren: number;
    paxDocument: string;
    sellerId: string;
    ticketPrinterId: string;
    commissionPercentage: number;
    chargesAndTaxes: number;
    items: { productId: string; quantity: number; price: number; mainTaxId?: number; appliedTaxes: { id: number, amount: number }[] }[];
}

export default function QuotationForm({ quotationId }: { quotationId?: string }) {
    const [data, setData] = useState<any>(null)
    const [formData, setFormData] = useState<QuotationFormData>({
        clientId: '',
        providerId: '',
        hotelId: '',
        branchId: '',
        implantId: '',
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
        currency: 'USD',
        exchangeRate: 1,
        paxAdults: 1,
        paxChildren: 0,
        paxDocument: '',
        sellerId: '',
        ticketPrinterId: '',
        commissionPercentage: 10,
        chargesAndTaxes: 0,
        items: []
    })
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {
        if (e) e.preventDefault()
        if (!formData.clientId || !formData.providerId || !formData.hotelId || !formData.branchId || !formData.implantId || formData.items.length === 0 || formData.items.some(i => !i.productId)) {
            alert('Por favor completa los campos requeridos (Cliente, Proveedor, Hotel, Sucursal, Implant) y asegúrate de seleccionar un producto válido en el desglose.')
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...formData,
                commissionPercentage: 0,
                chargesAndTaxes: 0,
                totalAmount: total,
                items: formData.items.map(item => {
                    const taxes = [...(item.appliedTaxes || [])];
                    if (item.mainTaxId && !taxes.find(t => t.id === item.mainTaxId)) {
                        taxes.push({ id: item.mainTaxId, amount: item.price * item.quantity });
                    } else if (item.mainTaxId) {
                        const existing = taxes.find(t => t.id === item.mainTaxId);
                        if (existing) existing.amount = item.price * item.quantity;
                    }
                    return { ...item, appliedTaxes: taxes };
                })
            }

            const endpoint = quotationId ? `/api/quotations/${quotationId}` : '/api/quotations';
            const method = quotationId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error al guardar')

            if (downloadPdf) {
                // Enrich data with names for the PDF
                const client = data.clients.find((c: any) => c.id.toString() === formData.clientId)
                const provider = data.providers.find((p: any) => p.id.toString() === formData.providerId)
                const hotel = provider?.hotels.find((h: any) => h.id.toString() === formData.hotelId)

                const pdfData = {
                    ...formData,
                    internalNumber: result.quotation.internalNumber,
                    clientName: client?.name,
                    clientDocument: client?.document,
                    providerName: provider?.name,
                    hotelName: hotel?.name,
                    nights: differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)),
                    totalAmount: total,
                    taxSummary: taxSummary,
                    items: formData.items.map(item => ({
                        ...item,
                        productDescription: data.products.find((p: any) => p.id.toString() === item.productId)?.description
                    }))
                }
                generateQuotationPDF(pdfData)
            }

            alert('Cotización guardada exitosamente')
            router.push('/dashboard')
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Ocurrió un error al guardar la cotización')
        } finally {
            setSaving(false)
        }
    }

    // Get unique taxes that have been applied anywhere, and sum their amounts
    const taxSummary = React.useMemo(() => {
        const summary: Record<string, number> = {}
        if (!data?.taxes) return summary;

        formData.items.forEach(item => {
            // Include main tax
            if (item.mainTaxId) {
                const master = data.taxes.find((t: any) => t.id === item.mainTaxId);
                if (master) {
                    summary[master.name] = (summary[master.name] || 0) + (item.price * item.quantity);
                }
            }

            // Include applied taxes
            (item.appliedTaxes || []).forEach(tax => {
                const master = data.taxes.find((t: any) => t.id === tax.id);
                if (master && item.mainTaxId !== tax.id) {
                    summary[master.name] = (summary[master.name] || 0) + (tax.amount || 0);
                }
            })
        });
        return summary;
    }, [formData.items, data?.taxes]);

    const total = Object.values(taxSummary).reduce((sum, val) => sum + val, 0);

    const handleCalculateTaxes = (index: number) => {
        const item = formData.items[index];
        if (!item.mainTaxId || item.price <= 0) {
            alert("Selecciona un Cargo Principal y escribe su valor primero antes de calcular.");
            return;
        }
        const baseValue = item.price * item.quantity;
        const newAppliedTaxes = item.appliedTaxes.map(taxApp => {
            const taxMaster = data.taxes.find((t: any) => t.id === taxApp.id);
            if (taxMaster && taxMaster.valueType === 'PERCENTAGE') {
                return { ...taxApp, amount: (baseValue * taxMaster.value) / 100 };
            }
            return taxApp;
        });
        updateItem(index, 'appliedTaxes', newAppliedTaxes);
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const baseRes = await fetch('/api/quotations/base-data')
                const baseData = await baseRes.json()
                if (baseRes.ok && baseData?.clients) {
                    setData(baseData)
                } else {
                    console.error("No valid data received from base-data:", baseData)
                    setData({ clients: [], providers: [], branches: [], implants: [], products: [], taxes: [], sellers: [], ticketPrinters: [] })
                }

                if (quotationId) {
                    const qRes = await fetch(`/api/quotations/${quotationId}`)
                    if (qRes.ok) {
                        const qData = await qRes.json()
                        setFormData({
                            clientId: qData.clientId?.toString() || '',
                            providerId: qData.providerId?.toString() || '',
                            hotelId: qData.hotelId?.toString() || '',
                            branchId: qData.branchId?.toString() || '',
                            implantId: qData.implantId?.toString() || '',
                            checkIn: qData.checkInDate ? format(new Date(qData.checkInDate), 'yyyy-MM-dd') : '',
                            checkOut: qData.checkOutDate ? format(new Date(qData.checkOutDate), 'yyyy-MM-dd') : '',
                            currency: qData.currency || 'USD',
                            exchangeRate: qData.exchangeRate,
                            paxAdults: qData.paxAdults,
                            paxChildren: qData.paxChildren,
                            paxDocument: qData.paxDocument || '',
                            sellerId: qData.sellerId?.toString() || '',
                            ticketPrinterId: qData.ticketPrinterId?.toString() || '',
                            commissionPercentage: 0,
                            chargesAndTaxes: 0,
                            items: qData.products.map((p: any) => {
                                // Find main tax based on value equality (or arbitrary since we can't perfectly distiguish without new db column, so let's use the first one matching the value)
                                // Actually, let's treat the first active tax equal to price * qty as main tax, or if not found, just don't set mainTaxId
                                // But since it's hard to reliably infer `mainTaxId` from a flattened list without a `isMain` flag in DB, we'll try to find one where explicitAmount === price * quantity
                                let mainTaxId: number | undefined = undefined;
                                const baseVal = p.price * p.quantity;
                                const possibleMain = p.appliedTaxes.find((t: any) => t.explicitAmount === baseVal);
                                if (possibleMain) mainTaxId = possibleMain.chargeAndTaxId;

                                return {
                                    productId: p.productId?.toString() || '',
                                    quantity: p.quantity,
                                    price: p.price,
                                    mainTaxId,
                                    appliedTaxes: p.appliedTaxes.map((t: any) => ({
                                        id: t.chargeAndTaxId,
                                        amount: t.explicitAmount
                                    }))
                                }
                            })
                        })
                    }
                }
            } catch (err) {
                console.error("Failed to load generic or quotation data", err);
            }
        }
        loadInitialData()
    }, [quotationId])

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 1, price: 0, appliedTaxes: [] }]
        })
    }

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        })
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData({ ...formData, items: newItems })
    }

    if (!data) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    )

    return (
        <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Generar Cotización</h2>
                    <p className="text-zinc-500 text-sm mt-1">Completa los detalles para tu cliente</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSave(e as any, true)}
                        disabled={saving}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <FileDown className="w-5 h-5" />
                        PDF
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section: Client & Origin */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                            <Users className="w-5 h-5 text-blue-500" />
                            Cliente y Origen
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Cliente</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                >
                                    <option value="">Seleccionar Cliente</option>
                                    {data.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.document}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Vendedor</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.sellerId}
                                    onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                                >
                                    <option value="">Seleccionar Vendedor</option>
                                    {data.sellers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Sucursal</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                >
                                    <option value="">Sel. Sucursal</option>
                                    {data.branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Implant</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.implantId}
                                    onChange={(e) => setFormData({ ...formData, implantId: e.target.value })}
                                >
                                    <option value="">Sel. Implant</option>
                                    {data.implants.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Tiqueteador</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.ticketPrinterId}
                                    onChange={(e) => setFormData({ ...formData, ticketPrinterId: e.target.value })}
                                >
                                    <option value="">Sel. Tiqueteador</option>
                                    {data.ticketPrinters?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Provider & Hotel */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            Alojamiento y Proveedor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Proveedor</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.providerId}
                                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                                >
                                    <option value="">Seleccionar Proveedor</option>
                                    {data.providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Hotel</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.hotelId}
                                    onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                                    disabled={!formData.providerId}
                                >
                                    <option value="">Seleccionar Hotel</option>
                                    {data.providers.find((p: any) => p.id.toString() === formData.providerId)?.hotels.map((h: any) => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Check-in</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-10 pr-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.checkIn}
                                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Check-out</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-10 pr-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.checkOut}
                                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Products Grid */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                <Tag className="w-5 h-5 text-emerald-500" />
                                Desglose de Productos
                            </h3>
                            <button
                                onClick={addItem}
                                className="text-emerald-600 font-bold flex items-center gap-1 hover:underline text-sm"
                            >
                                <Plus className="w-4 h-4" /> Agregar Producto
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {formData.items.length === 0 && (
                                    <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400">
                                        No hay productos agregados.
                                    </div>
                                )}
                                {formData.items.map((item, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={index}
                                        className="grid grid-cols-12 gap-4 items-end bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Producto</label>
                                            <select
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                value={item.productId}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const p = data.products.find((prod: any) => prod.id.toString() === val);
                                                    const newItems = [...formData.items];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        productId: val,
                                                        price: p ? p.basePrice : 0
                                                    };
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            >
                                                <option value="">Seleccionar</option>
                                                {data.products.map((p: any) => <option key={p.id} value={p.id}>{p.description} (${p.basePrice})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-8 md:col-span-4 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Cargo Principal</label>
                                            <select
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-xs font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500"
                                                value={item.mainTaxId || ''}
                                                onChange={(e) => updateItem(index, 'mainTaxId', parseInt(e.target.value))}
                                            >
                                                <option value="">Selecciona Master...</option>
                                                {data.taxes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-10 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Tarifa Unit.</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                                                <input
                                                    type="number"
                                                    className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg pl-7 pr-2 border border-zinc-200 dark:border-zinc-800 outline-none text-sm font-bold"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Product Taxes Row */}
                                        <div className="col-span-12 mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3 flex items-center justify-between">
                                                <span>Cargos e Impuestos Adicionales</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCalculateTaxes(index)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs transition-all flex items-center gap-1 shadow-sm"
                                                >
                                                    <Calculator className="w-3 h-3" /> Calcular Impuestos (%)
                                                </button>
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                {data.taxes.length === 0 && (
                                                    <span className="text-xs text-zinc-400 font-medium">No hay cargos maestros configurados.</span>
                                                )}
                                                {data.taxes.filter((t: any) => t.id !== item.mainTaxId).map((tax: any) => {
                                                    const appliedTax = item.appliedTaxes?.find((t: any) => t.id === tax.id);
                                                    const isChecked = !!appliedTax;
                                                    return (
                                                        <div key={tax.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                            <label
                                                                className={cn(
                                                                    "flex items-center gap-2 cursor-pointer text-sm font-bold min-w-[200px]",
                                                                    isChecked ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"
                                                                )}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked;
                                                                        const currentTaxes = item.appliedTaxes || [];
                                                                        if (checked) {
                                                                            // Calculate initial value based on main charge
                                                                            let initialAmount = 0;
                                                                            const baseValue = item.price * item.quantity;
                                                                            if (tax.valueType === 'PERCENTAGE') {
                                                                                initialAmount = (baseValue * tax.value) / 100;
                                                                            } else {
                                                                                initialAmount = tax.value * item.quantity;
                                                                            }
                                                                            updateItem(index, 'appliedTaxes', [...currentTaxes, { id: tax.id, amount: initialAmount }]);
                                                                        } else {
                                                                            updateItem(index, 'appliedTaxes', currentTaxes.filter((t: any) => t.id !== tax.id));
                                                                        }
                                                                    }}
                                                                />
                                                                <span>{tax.name}</span>
                                                                <span className="opacity-50 text-xs ml-auto">({tax.valueType === 'PERCENTAGE' ? `${tax.value}%` : `$${tax.value}`})</span>
                                                            </label>

                                                            {isChecked && (
                                                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 py-1">
                                                                    <span className="text-xs font-bold text-zinc-500">Valor Cobrado:</span>
                                                                    <div className="relative w-32">
                                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="w-full h-8 bg-white dark:bg-zinc-900 rounded-lg pl-7 pr-3 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                                                            value={appliedTax.amount}
                                                                            onChange={(e) => {
                                                                                const val = parseFloat(e.target.value) || 0;
                                                                                const newTaxes = item.appliedTaxes.map((t: any) => t.id === tax.id ? { ...t, amount: val } : t);
                                                                                updateItem(index, 'appliedTaxes', newTaxes);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-[10px] text-zinc-400 leading-tight md:ml-2">
                                                                        Puedes modificar este valor <br className="hidden md:block" /> manualmente.
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Guests */}
                <div className="space-y-8">
                    {/* Guests */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                            <Users className="w-5 h-5 text-orange-500" />
                            Pasajeros
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Adultos</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-9 pr-3 border border-zinc-200 dark:border-zinc-700 outline-none"
                                        value={formData.paxAdults}
                                        onChange={(e) => setFormData({ ...formData, paxAdults: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Niños</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-9 pr-3 border border-zinc-200 dark:border-zinc-700 outline-none"
                                        value={formData.paxChildren}
                                        onChange={(e) => setFormData({ ...formData, paxChildren: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Documento (Pax 1)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 outline-none"
                                        placeholder="ID Pasajero"
                                        value={formData.paxDocument}
                                        onChange={(e) => setFormData({ ...formData, paxDocument: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Summary */}
                    <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl shadow-zinc-900/40 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 bg-blue-600/10 blur-[60px] rounded-full" />

                        <h3 className="text-lg font-bold relative z-10 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-400" />
                            Resumen de Costos
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Moneda</label>
                                    <select
                                        className="w-full h-11 bg-zinc-800 rounded-xl px-3 border border-zinc-700 outline-none text-sm font-bold"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD - Dólares</option>
                                        <option value="COP">COP - Pesos Col.</option>
                                    </select>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tasa Cambio</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 bg-zinc-800 rounded-xl px-3 border border-zinc-700 outline-none text-sm font-bold text-right"
                                        value={formData.exchangeRate}
                                        onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 pt-4">
                                {Object.entries(taxSummary).length === 0 && (
                                    <div className="text-zinc-500 text-sm font-medium text-center pb-4">Aún no se han configurado cargos en los productos.</div>
                                )}
                                {Object.entries(taxSummary).map(([name, amount]) => (
                                    <div key={name} className="flex justify-between items-center text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3">
                                        <span className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-400" />
                                            {name}
                                        </span>
                                        <span className="text-white">${amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Final Math */}
                            <div className="pt-8 space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-bold">Costo Real Total</span>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-emerald-400">
                                            ${total.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
