'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Save, Loader2, Plus, Trash2, Globe, Plane, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface IntRange {
    min: number
    max: number
    feeUsd: number
    label: string
}

export function AdministrativeFeeTab() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state
    const [feeOw, setFeeOw] = useState<string>('29100')
    const [feeRt, setFeeRt] = useState<string>('52800')
    const [iataRate, setIataRate] = useState<string>('4200')
    const [productId, setProductId] = useState<string>('')
    const [intRanges, setIntRanges] = useState<IntRange[]>([
        { min: 0, max: 354, feeUsd: 15, label: 'Menores o iguales a USD 354' },
        { min: 354.01, max: 590, feeUsd: 28, label: 'Mayores de USD 354 hasta USD 590' },
        { min: 590.01, max: 944, feeUsd: 46, label: 'Mayores de USD 590 hasta USD 944' },
        { min: 944.01, max: 999999, feeUsd: 95, label: 'Mayores de USD 944' }
    ])

    // Param IDs in DB to perform updates
    const [paramIds, setParamIds] = useState<Record<string, number>>({})
    const [productsList, setProductsList] = useState<any[]>([])

    const fetchParametersAndProducts = async () => {
        setLoading(true)
        setMessage(null)
        try {
            // Fetch system parameters
            const resParams = await fetch('/api/config/parameters')
            if (resParams.ok) {
                const data = await resParams.json()
                const items = Array.isArray(data) ? data : (data.items || data.data || [])
                
                const ids: Record<string, number> = {}
                items.forEach((p: any) => {
                    if (p.code) ids[p.code] = p.id
                    if (p.code === 'TARIFA_ADMIN_OW') setFeeOw(p.value || '29100')
                    if (p.code === 'TARIFA_ADMIN_RT') setFeeRt(p.value || '52800')
                    if (p.code === 'TASA_CAMBIO_IATA') setIataRate(p.value || '4200')
                    if (p.code === 'PRODUCTO_TARIFA_ADMINISTRATIVA') setProductId(p.value || '')
                    if (p.code === 'TARIFA_ADMIN_INT_RANGES') {
                        try {
                            const parsed = JSON.parse(p.value)
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                setIntRanges(parsed)
                            }
                        } catch (e) {
                            console.error('Error parsing TARIFA_ADMIN_INT_RANGES JSON:', e)
                        }
                    }
                })
                setParamIds(ids)
            }

            // Fetch products list
            const resProds = await fetch('/api/products')
            if (resProds.ok) {
                const prodData = await resProds.json()
                const prods = Array.isArray(prodData) ? prodData : (prodData.items || prodData.data || [])
                setProductsList(prods)
            }
        } catch (err: any) {
            console.error('Error loading administrative fee settings:', err)
            setMessage({ type: 'error', text: 'Error al cargar la configuración: ' + err.message })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchParametersAndProducts()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const paramsToSave = [
                { code: 'TARIFA_ADMIN_OW', name: 'Tarifa Administrativa Nacional One Way', value: feeOw },
                { code: 'TARIFA_ADMIN_RT', name: 'Tarifa Administrativa Nacional Roundtrip', value: feeRt },
                { code: 'TASA_CAMBIO_IATA', name: 'Tasa de Cambio IATA', value: iataRate },
                { code: 'PRODUCTO_TARIFA_ADMINISTRATIVA', name: 'Producto por Defecto para Tarifa Administrativa', value: productId },
                { code: 'TARIFA_ADMIN_INT_RANGES', name: 'Rangos Tarifa Administrativa Internacional (JSON)', value: JSON.stringify(intRanges) }
            ]

            for (const item of paramsToSave) {
                const existingId = paramIds[item.code]
                if (existingId) {
                    await fetch('/api/config/parameters', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: existingId, ...item })
                    })
                } else {
                    const res = await fetch('/api/config/parameters', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    })
                    if (res.ok) {
                        const newP = await res.json()
                        if (newP.parameter?.id) {
                            paramIds[item.code] = newP.parameter.id
                        }
                    }
                }
            }

            setMessage({ type: 'success', text: 'Parámetros de Tarifa Administrativa guardados correctamente.' })
            fetchParametersAndProducts()
        } catch (err: any) {
            console.error('Error saving administrative fee parameters:', err)
            setMessage({ type: 'error', text: 'Error al guardar la configuración: ' + err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleAddRange = () => {
        const last = intRanges[intRanges.length - 1]
        const newMin = last ? last.max + 0.01 : 0
        setIntRanges([
            ...intRanges,
            { min: Number(newMin.toFixed(2)), max: newMin + 500, feeUsd: 50, label: `Rangos mayores a USD ${newMin}` }
        ])
    }

    const handleRemoveRange = (index: number) => {
        setIntRanges(intRanges.filter((_, i) => i !== index))
    }

    const handleRangeChange = (index: number, field: keyof IntRange, val: any) => {
        const updated = [...intRanges]
        updated[index] = { ...updated[index], [field]: val }
        setIntRanges(updated)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                <p className="text-sm font-medium">Cargando parámetros de Tarifa Administrativa...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Encabezado */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-indigo-600" />
                        Parámetros de Tarifa Administrativa
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Configura los valores cobrados en tiquetes nacionales, rangos internacionales en USD, Tasa IATA y producto maestro por defecto.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
            </div>

            {/* Mensajes de Estado */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Ventas Nacionales */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Plane className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900">Tiquetes Nacionales (COP)</h3>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Tarifa One Way (OW - 1 Trayecto)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                value={feeOw}
                                onChange={(e) => setFeeOw(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="29100"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Cobro fijo adicionado a tiquetes nacionales de un solo trayecto.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Tarifa Roundtrip (RT - 2 o Más Trayectos)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                value={feeRt}
                                onChange={(e) => setFeeRt(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="52800"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Cobro fijo adicionado a tiquetes nacionales ida y vuelta o multicity.</p>
                    </div>
                </div>

                {/* 2. Tasa IATA y Producto Maestro */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <RefreshCw className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900">Tasa de Cambio IATA y Producto Maestro</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Tasa de Cambio IATA (USD a COP)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={iataRate}
                                onChange={(e) => setIataRate(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="4200.00"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Utilizada para calcular el rango en USD y reconvertir el cobro a COP.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                            Producto Maestro Asignado
                        </label>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="">-- Asignación por defecto / Auto (TA) --</option>
                            {productsList.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.name || p.title} ({p.code || `ID ${p.id}`})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Producto asignado automáticamente en la línea de servicio de Tarifa Admin.</p>
                    </div>
                </div>
            </div>

            {/* 3. Rangos Internacionales en USD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h3 className="font-semibold text-slate-900">Tiquetes Internacionales (Rangos en USD)</h3>
                            <p className="text-xs text-slate-500">Evaluación de tarifa base/total del boleto en Dólares (USD) para determinar el cobro.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddRange}
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Rango</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                                <th className="py-2.5 px-3">Etiqueta Descriptiva</th>
                                <th className="py-2.5 px-3">USD Mínimo</th>
                                <th className="py-2.5 px-3">USD Máximo</th>
                                <th className="py-2.5 px-3">Tarifa Cobrada (USD)</th>
                                <th className="py-2.5 px-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {intRanges.map((range, index) => (
                                <tr key={index} className="hover:bg-slate-50/60 transition">
                                    <td className="py-2 px-3">
                                        <input
                                            type="text"
                                            value={range.label}
                                            onChange={(e) => handleRangeChange(index, 'label', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={range.min}
                                            onChange={(e) => handleRangeChange(index, 'min', parseFloat(e.target.value) || 0)}
                                            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={range.max}
                                            onChange={(e) => handleRangeChange(index, 'max', parseFloat(e.target.value) || 0)}
                                            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <div className="relative w-32">
                                            <span className="absolute left-2.5 top-1.5 text-slate-400 font-medium">$</span>
                                            <input
                                                type="number"
                                                step="1"
                                                value={range.feeUsd}
                                                onChange={(e) => handleRangeChange(index, 'feeUsd', parseFloat(e.target.value) || 0)}
                                                className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600 font-bold focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        <button
                                            onClick={() => handleRemoveRange(index)}
                                            type="button"
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                            title="Eliminar rango"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
