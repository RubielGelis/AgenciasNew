'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Trash2, Plus, ChevronDown, Calendar, Users, Globe, DollarSign, Briefcase, Hotel as HotelIcon, Tag, Percent, Calculator, ArrowRight, Loader2, FileDown } from 'lucide-react'
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
    commissionPercentage: number;
    chargesAndTaxes: number;
    items: { productId: string; quantity: number; price: number }[];
}

export default function QuotationForm() {
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
        commissionPercentage: 10,
        chargesAndTaxes: 0,
        items: []
    })
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {
        if (e) e.preventDefault()
        if (!formData.clientId || !formData.providerId || !formData.hotelId || formData.items.length === 0) {
            alert('Por favor completa los campos requeridos (Cliente, Proveedor, Hotel y al menos un producto)')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, totalAmount: total })
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

    // Calculations
    const subtotalItems = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const commissionValue = (subtotalItems * formData.commissionPercentage) / 100
    const total = subtotalItems + formData.chargesAndTaxes + (formData.currency === 'USD' ? 0 : 0) // Simplify for now

    useEffect(() => {
        fetch('/api/quotations/base-data')
            .then(res => res.json())
            .then(setData)
    }, [])

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 1, price: 0 }]
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
                                <label className="text-sm font-semibold text-zinc-500">Pax Documento (Principal)</label>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ID del pasajero principal"
                                    value={formData.paxDocument}
                                    onChange={(e) => setFormData({ ...formData, paxDocument: e.target.value })}
                                />
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
                                        <div className="col-span-12 md:col-span-5 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Producto</label>
                                            <select
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Seleccionar</option>
                                                {data.products.map((p: any) => <option key={p.id} value={p.id}>{p.description} (${p.basePrice})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-5 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-5 md:col-span-4 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Precio Unit.</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="number"
                                                    className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg pl-8 pr-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
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
                        <div className="grid grid-cols-2 gap-4">
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

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Comisión General (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="number"
                                        className="w-full h-11 bg-zinc-800 rounded-xl pl-10 pr-4 border border-zinc-700 outline-none text-sm font-bold"
                                        value={formData.commissionPercentage}
                                        onChange={(e) => setFormData({ ...formData, commissionPercentage: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Impuestos y Cargos Adic.</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="number"
                                        className="w-full h-11 bg-zinc-800 rounded-xl pl-10 pr-4 border border-zinc-700 outline-none text-sm font-bold"
                                        value={formData.chargesAndTaxes}
                                        onChange={(e) => setFormData({ ...formData, chargesAndTaxes: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Final Math */}
                            <div className="pt-8 border-t border-zinc-800 space-y-4">
                                <div className="flex justify-between text-zinc-400 font-medium">
                                    <span>Subtotal Items</span>
                                    <span>${subtotalItems.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400 font-medium">
                                    <span>Comisión ({formData.commissionPercentage}%)</span>
                                    <span className="text-emerald-400">+${commissionValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400 font-medium">
                                    <span>Impuestos</span>
                                    <span>${formData.chargesAndTaxes.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                                    <span className="text-lg font-bold">Total Final</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-blue-500">
                                            ${total.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] uppercase text-zinc-500 mt-1">Precio neto en {formData.currency}</p>
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
