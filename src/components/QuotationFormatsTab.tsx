'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Download, Upload, Trash2, Edit2, FileText,
    Loader2, Check, X, ChevronDown, Building2, Info,
    ArrowUp, ArrowDown
} from 'lucide-react'

// Campos disponibles para mapeo de celdas (los mismos que usa el configurador de sucursales)
const AVAILABLE_FIELDS: { key: string; label: string; group: string }[] = [
    // Cabecera
    { key: 'asesor', label: 'Asesor', group: 'Cabecera' },
    { key: 'fecha', label: 'Fecha', group: 'Cabecera' },
    { key: 'clienteNombre', label: 'Nombre del Cliente', group: 'Cabecera' },
    { key: 'clienteIdentificacion', label: 'Identificación / NIT', group: 'Cabecera' },
    { key: 'clienteDireccion', label: 'Dirección del Cliente', group: 'Cabecera' },
    { key: 'clienteTelefono', label: 'Teléfono del Cliente', group: 'Cabecera' },
    { key: 'centroCosto', label: 'Centro de Costo', group: 'Cabecera' },
    { key: 'solicita', label: 'Solicita', group: 'Cabecera' },
    { key: 'tCambio', label: 'Tasa de Cambio', group: 'Cabecera' },
    { key: 'descripcionPlan', label: 'Descripción del Plan', group: 'Cabecera' },
    { key: 'fechasViaje', label: 'Fechas de Viaje', group: 'Cabecera' },
    { key: 'hotelesServicios', label: 'Hoteles / Servicios', group: 'Cabecera' },
    { key: 'pasajeros', label: 'Pasajeros', group: 'Cabecera' },
    { key: 'totalAdultos', label: 'Total Adultos', group: 'Cabecera' },
    { key: 'totalNinos', label: 'Total Niños', group: 'Cabecera' },
    { key: 'observaciones', label: 'Observaciones', group: 'Cabecera' },
    { key: 'internalNumber', label: 'Número Interno de Cotización', group: 'Cabecera' },
    { key: 'idCotizacion', label: 'ID de Cotización', group: 'Cabecera' },
    { key: 'vendedor', label: 'Vendedor', group: 'Cabecera' },
    { key: 'logo', label: 'Logo de Sucursal/Implant', group: 'Cabecera' },
    { key: 'currency', label: 'Moneda', group: 'Cabecera' },
    // Financiero cabecera
    { key: 'costoTotal', label: 'Costo Total', group: 'Resumen Financiero' },
    { key: 'valorBase', label: 'Valor Base', group: 'Resumen Financiero' },
    { key: 'utilidad', label: 'Utilidad', group: 'Resumen Financiero' },
    { key: 'totalAmount', label: 'Valor Total', group: 'Resumen Financiero' },
    { key: 'baseCommissionable', label: 'Base Comisionable', group: 'Resumen Financiero' },
    { key: 'commissionPercentage', label: 'Porcentaje de Comisión', group: 'Resumen Financiero' },
    { key: 'comisionFreelanceValue', label: 'Comisión Freelance (Valor)', group: 'Resumen Financiero' },
    { key: 'comisionFreelancePercentage', label: 'Comisión Freelance (%)', group: 'Resumen Financiero' },
    { key: 'comisionPropiaValue', label: 'Comisión Propia (Valor)', group: 'Resumen Financiero' },
    { key: 'comisionPropiaPercentage', label: 'Comisión Propia (%)', group: 'Resumen Financiero' },
    { key: 'comisionTotalPercentage', label: 'Comisión Total (%)', group: 'Resumen Financiero' },
    { key: 'comisionUtilidadPercentage', label: 'Comisión Utilidad (%)', group: 'Resumen Financiero' },
    { key: 'baseComisionable', label: 'Base Comisionable (Reporte)', group: 'Resumen Financiero' },
    { key: 'comisionAsesor', label: 'Comisión del Asesor', group: 'Resumen Financiero' },
    // Por producto
    { key: 'proveedorNombre', label: 'Proveedor Nombre', group: 'Por Producto' },
    { key: 'proveedorNIT', label: 'Proveedor NIT', group: 'Por Producto' },
    { key: 'proveedorContacto', label: 'Proveedor Contacto', group: 'Por Producto' },
    { key: 'prestadoraNombre', label: 'Prestadora Nombre', group: 'Por Producto' },
    { key: 'prestadoraCategoria', label: 'Prestadora Categoría', group: 'Por Producto' },
    { key: 'prestadoraUbicacion', label: 'Prestadora Ubicación', group: 'Por Producto' },
    { key: 'tarifaNeta', label: 'Tarifa Neta', group: 'Por Producto' },
    { key: 'impuestos', label: 'Impuestos', group: 'Por Producto' },
    { key: 'adicionalesServ', label: 'Adicionales de Servicio', group: 'Por Producto' },
    { key: 'comision', label: 'Comisión', group: 'Por Producto' },
    { key: 'descuento', label: 'Descuento', group: 'Por Producto' },
    { key: 'sobrecomision', label: 'Sobrecomisión', group: 'Por Producto' },
    { key: 'fee', label: 'Fee', group: 'Por Producto' },
    { key: 'total', label: 'Total por Producto', group: 'Por Producto' },
    { key: 'precio', label: 'Precio', group: 'Por Producto' },
    { key: 'costo', label: 'Costo del Producto', group: 'Por Producto' },
    { key: 'cantidad', label: 'Cantidad', group: 'Por Producto' },
    { key: 'checkIn', label: 'Fecha Check-In', group: 'Por Producto' },
    { key: 'checkOut', label: 'Fecha Check-Out', group: 'Por Producto' },
    { key: 'noches', label: 'Número de Noches', group: 'Por Producto' },
    { key: 'destino', label: 'Destino', group: 'Por Producto' },
    { key: 'codigoReserva', label: 'Código de Reserva', group: 'Por Producto' },
    { key: 'tipoServicio', label: 'Tipo de Servicio', group: 'Por Producto' },
    { key: 'servicio', label: 'Servicio (Detalle)', group: 'Por Producto' },
    { key: 'descripcion', label: 'Descripción Manual', group: 'Por Producto' },
    { key: 'productDescripcion', label: 'Descripción del Producto', group: 'Por Producto' },
    { key: 'paxAdultos', label: 'Pax Adultos', group: 'Por Producto' },
    { key: 'paxNinos', label: 'Pax Niños', group: 'Por Producto' },
]

const GROUP_ORDER = ['Cabecera', 'Resumen Financiero', 'Por Producto']

interface QuotationFormat {
    id: number
    name: string
    description?: string
    hasTemplate: boolean
    templateConfig?: any
    FormatCellCustomization?: { id: number; code: string; name: string; value?: string }[]
    Branch?: { id: number; name: string; code: string }
    Implant?: { id: number; name: string; code: string }
    createdAt?: string
}

interface QuotationFormatsTabProps {
    branches: { id: number; name: string; code: string }[]
    implants: { id: number; name: string; code: string; branchId?: number }[]
}

function getFieldLabel(key: string): string {
    const f = AVAILABLE_FIELDS.find(f => f.key === key)
    return f ? f.label : key
}

export function QuotationFormatsTab({ branches, implants }: QuotationFormatsTabProps) {
    const [formats, setFormats] = useState<QuotationFormat[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingFormat, setEditingFormat] = useState<QuotationFormat | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)
    const importRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formBranchId, setFormBranchId] = useState<number | ''>('')
    const [formImplantId, setFormImplantId] = useState<number | ''>('')
    const [formTemplate, setFormTemplate] = useState<string | null>(null)
    const [formHasTemplate, setFormHasTemplate] = useState(false)
    const [formTemplateConfig, setFormTemplateConfig] = useState<any>({})
    const [formCellCustomizations, setFormCellCustomizations] = useState<{ code: string; name: string; value: string }[]>([])

    const fetchFormats = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/config/quotation-formats')
            if (res.ok) {
                const data = await res.json()
                setFormats(data)
            }
        } catch (e) {
            console.error('Error fetching formats:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFormats() }, [])

    const openNew = () => {
        setEditingFormat(null)
        setFormName('')
        setFormDescription('')
        setFormBranchId('')
        setFormImplantId('')
        setFormTemplate(null)
        setFormHasTemplate(false)
        setFormTemplateConfig({})
        setFormCellCustomizations([])
        setIsFormOpen(true)
    }

    const openEdit = async (fmt: QuotationFormat) => {
        setEditingFormat(fmt)
        setFormName(fmt.name)
        setFormDescription(fmt.description || '')
        setFormBranchId(fmt.Branch?.id || '')
        setFormImplantId(fmt.Implant?.id || '')
        setFormTemplate(null)
        setFormHasTemplate(fmt.hasTemplate)
        setFormTemplateConfig(fmt.templateConfig || {})
        setFormCellCustomizations((fmt.FormatCellCustomization || []).map(c => ({
            code: c.code,
            name: c.name,
            value: c.value || ''
        })))
        setIsFormOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formName) return
        if (!formBranchId && !formImplantId) {
            alert('Debe seleccionar una Sucursal o un Implant')
            return
        }
        setSubmitting(true)
        try {
            const payload: any = {
                name: formName,
                description: formDescription,
                branchId: formBranchId || null,
                implantId: formImplantId || null,
                templateConfig: formTemplateConfig,
                cellCustomizations: formCellCustomizations.filter(c => c.value.trim()),
            }
            if (formTemplate) payload.template = formTemplate

            const url = editingFormat
                ? `/api/config/quotation-formats/${editingFormat.id}`
                : '/api/config/quotation-formats'
            const method = editingFormat ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Error guardando el formato')
            }

            setIsFormOpen(false)
            fetchFormats()
        } catch (err: any) {
            alert('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`¿Está seguro de eliminar el formato "${name}"? Esta acción no se puede deshacer.`)) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/config/quotation-formats/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Error eliminando')
            fetchFormats()
        } catch (err: any) {
            alert('Error: ' + err.message)
        } finally {
            setDeleting(null)
        }
    }

    const handleExport = async (id: number, name: string) => {
        const res = await fetch(`/api/config/quotation-formats/${id}?export=true`)
        if (!res.ok) { alert('Error exportando'); return }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_')
        a.href = url
        a.download = `formato_${safe}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const data = JSON.parse(text)
            if (!data.name) { alert('Archivo de formato inválido: falta el nombre'); return }

            // Pedir qué sucursal/implant asociar
            const branchName = prompt(
                `Importando formato "${data.name}".\n\nIngrese el ID de la Sucursal a la que desea asociarlo (deje vacío para continuar sin sucursal):`
            )
            const implantName = prompt(`Ingrese el ID del Implant a asociar (deje vacío si no aplica):`)

            const branchId = branchName ? parseInt(branchName) : null
            const implantId = implantName ? parseInt(implantName) : null

            if (!branchId && !implantId) {
                alert('Debe especificar al menos una Sucursal o Implant para importar')
                return
            }

            const res = await fetch('/api/config/quotation-formats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    branchId,
                    implantId,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }

            const result = await res.json()
            alert(result.message)
            fetchFormats()
        } catch (err: any) {
            alert('Error importando: ' + err.message)
        }

        if (importRef.current) importRef.current.value = ''
    }

    // Cell customization management
    const addCellMapping = (key: string, label: string) => {
        if (!key) return
        if (formCellCustomizations.find(c => c.code === key)) return
        setFormCellCustomizations(prev => [...prev, { code: key, name: label, value: '' }])
    }

    const updateCellValue = (idx: number, val: string) => {
        setFormCellCustomizations(prev => prev.map((c, i) =>
            i === idx ? { ...c, value: val.toUpperCase().replace(/[^A-Z0-9]/g, '') } : c
        ))
    }

    const removeCell = (idx: number) => {
        setFormCellCustomizations(prev => prev.filter((_, i) => i !== idx))
    }

    const moveCellUp = (idx: number) => {
        if (idx === 0) return
        setFormCellCustomizations(prev => {
            const arr = [...prev]
            ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
            return arr
        })
    }

    const moveCellDown = (idx: number) => {
        setFormCellCustomizations(prev => {
            if (idx >= prev.length - 1) return prev
            const arr = [...prev]
            ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
            return arr
        })
    }

    const filteredImplants = formBranchId
        ? implants.filter((i: any) => i.branchId === formBranchId || !i.branchId)
        : implants

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Formatos de Cotización</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        Gestione múltiples plantillas Excel con configuraciones de mapeo independientes.
                        Exporte e importe formatos entre bases de datos sin reconfiguración.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        ref={importRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                    <button
                        onClick={() => importRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        Importar JSON
                    </button>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Formato
                    </button>
                </div>
            </div>

            {/* Formats List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : formats.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-semibold">No hay formatos de cotización configurados</p>
                    <p className="text-zinc-400 text-sm mt-1">Crea tu primer formato o importa uno desde un archivo JSON</p>
                    <button
                        onClick={openNew}
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
                    >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Crear Formato
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {formats.map(fmt => (
                        <motion.div
                            key={fmt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-zinc-900 dark:text-white">{fmt.name}</h3>
                                    {fmt.hasTemplate && (
                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                            ✓ Plantilla
                                        </span>
                                    )}
                                    {(fmt.FormatCellCustomization?.length ?? 0) > 0 && (
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {fmt.FormatCellCustomization?.length} celdas
                                        </span>
                                    )}
                                </div>
                                {fmt.description && (
                                    <p className="text-sm text-zinc-500 mt-0.5 truncate">{fmt.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    {fmt.Branch && (
                                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {fmt.Branch.name}
                                        </span>
                                    )}
                                    {fmt.Implant && (
                                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {fmt.Implant.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleExport(fmt.id, fmt.name)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold transition-all"
                                    title="Exportar configuración como JSON"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Exportar
                                </button>
                                <button
                                    onClick={() => openEdit(fmt)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(fmt.id, fmt.name)}
                                    disabled={deleting === fmt.id}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    {deleting === fmt.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                                    {editingFormat ? `Editar: ${editingFormat.name}` : 'Nuevo Formato de Cotización'}
                                </h3>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Nombre del Formato *</label>
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={e => setFormName(e.target.value)}
                                            required
                                            placeholder="Ej. Formato Corporativo, Formato Vacacional..."
                                            className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Descripción (Opcional)</label>
                                        <input
                                            type="text"
                                            value={formDescription}
                                            onChange={e => setFormDescription(e.target.value)}
                                            placeholder="Breve descripción del uso de este formato"
                                            className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Branch / Implant */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Sucursal</label>
                                            <select
                                                value={formBranchId}
                                                onChange={e => { setFormBranchId(e.target.value ? parseInt(e.target.value) : ''); setFormImplantId('') }}
                                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">-- Ninguna --</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Implant (Opcional)</label>
                                            <select
                                                value={formImplantId}
                                                onChange={e => setFormImplantId(e.target.value ? parseInt(e.target.value) : '')}
                                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">-- Ninguno --</option>
                                                {filteredImplants.map((i: any) => (
                                                    <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Template File */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Plantilla Excel (.xlsx, .xls)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={e => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onloadend = () => setFormTemplate(reader.result as string)
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="flex-1 text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                            />
                                            {formHasTemplate && !formTemplate && (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">✓ Guardada</span>
                                            )}
                                            {formTemplate && (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">✓ Nueva</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cell Customizations */}
                                    <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Mapeo de Celdas</label>
                                            <span className="text-xs text-zinc-400">{formCellCustomizations.length} campos configurados</span>
                                        </div>

                                        {formCellCustomizations.length > 0 && (
                                            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                                            <th className="text-left p-3 text-zinc-500 font-bold uppercase tracking-wider">Campo</th>
                                                            <th className="text-left p-3 text-zinc-500 font-bold uppercase tracking-wider w-28">Celda</th>
                                                            <th className="p-3 w-24 text-center text-zinc-500 font-bold uppercase tracking-wider">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                        {formCellCustomizations.map((cell, idx) => (
                                                            <tr key={`${cell.code}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                                                <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">
                                                                    <div>{cell.name}</div>
                                                                    <div className="text-[10px] text-zinc-400 font-mono">{cell.code}</div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <input
                                                                        type="text"
                                                                        value={cell.value}
                                                                        onChange={e => updateCellValue(idx, e.target.value)}
                                                                        placeholder="Ej. B4"
                                                                        className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase focus:ring-1 focus:ring-blue-500 outline-none"
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button type="button" onClick={() => moveCellUp(idx)} disabled={idx === 0}
                                                                            className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-20 disabled:pointer-events-none">
                                                                            <ArrowUp className="w-3 h-3" />
                                                                        </button>
                                                                        <button type="button" onClick={() => moveCellDown(idx)} disabled={idx === formCellCustomizations.length - 1}
                                                                            className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-20 disabled:pointer-events-none">
                                                                            <ArrowDown className="w-3 h-3" />
                                                                        </button>
                                                                        <button type="button" onClick={() => removeCell(idx)}
                                                                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Add field selector */}
                                        <div className="flex items-center gap-3">
                                            <select
                                                id="qf-field-selector"
                                                className="flex-1 h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>-- Seleccionar campo a agregar --</option>
                                                {GROUP_ORDER.map(group => (
                                                    <optgroup key={group} label={group}>
                                                        {AVAILABLE_FIELDS.filter(f => f.group === group).map(f => (
                                                            <option key={f.key} value={`${f.key}|${f.label}`}>{f.label}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const sel = document.getElementById('qf-field-selector') as HTMLSelectElement
                                                    if (!sel?.value) return
                                                    const [key, label] = sel.value.split('|')
                                                    addCellMapping(key, label)
                                                    sel.value = ''
                                                }}
                                                className="px-4 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shrink-0"
                                            >
                                                + Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                                        {editingFormat ? 'Guardar Cambios' : 'Crear Formato'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
