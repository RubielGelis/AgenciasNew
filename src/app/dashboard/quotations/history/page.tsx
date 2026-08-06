'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    FileText,
    Calendar,
    ArrowRight,
    Loader2,
    Download,
    Edit,
    Trash2,
    Printer,
    Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import QuotationInvoiceModal from '../QuotationInvoiceModal'

export default function QuotationsHistoryPage() {
    const [quotations, setQuotations] = useState<any[]>([])
    const [states, setStates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // Filtros de búsqueda
    const [filterReferencia, setFilterReferencia] = useState('')
    const [filterFechaDesde, setFilterFechaDesde] = useState('')
    const [filterFechaHasta, setFilterFechaHasta] = useState('')
    const [filterCliente, setFilterCliente] = useState('')
    const [filterElaboradoPor, setFilterElaboradoPor] = useState('')
    const [filterMontoTotal, setFilterMontoTotal] = useState('')
    const [filterEstado, setFilterEstado] = useState('')

    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [invoiceQuotationId, setInvoiceQuotationId] = useState<number | null>(null)

    const fetchQuotations = async (filters?: {
        referencia?: string;
        fechaDesde?: string;
        fechaHasta?: string;
        cliente?: string;
        elaboradoPor?: string;
        montoTotal?: string;
        estado?: string;
    }) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters) {
                if (filters.referencia) params.append('referencia', filters.referencia)
                if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
                if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
                if (filters.cliente) params.append('cliente', filters.cliente)
                if (filters.elaboradoPor) params.append('elaboradoPor', filters.elaboradoPor)
                if (filters.montoTotal) params.append('montoTotal', filters.montoTotal)
                if (filters.estado) params.append('estado', filters.estado)
            }

            const url = `/api/quotations/history?${params.toString()}`

            const [quoRes, statesRes] = await Promise.all([
                fetch(url).then(res => res.json()),
                fetch('/api/config/quotation-states').then(res => res.json()).catch(() => [])
            ])

            setQuotations(Array.isArray(quoRes) ? quoRes : [])
            if (Array.isArray(statesRes) && statesRes.length > 0) {
                setStates(statesRes)
            } else {
                setStates(prev => prev.length > 0 ? prev : [
                    { code: 'NUEVO', name: 'Nuevo', color: 'blue' },
                    { code: 'ENVIADO', name: 'ENVIADO', color: 'emerald' }
                ])
            }
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApplyFilters = () => {
        fetchQuotations({
            referencia: filterReferencia,
            fechaDesde: filterFechaDesde,
            fechaHasta: filterFechaHasta,
            cliente: filterCliente,
            elaboradoPor: filterElaboradoPor,
            montoTotal: filterMontoTotal,
            estado: filterEstado
        })
    }

    const handleClearFilters = () => {
        setFilterReferencia('')
        setFilterFechaDesde('')
        setFilterFechaHasta('')
        setFilterCliente('')
        setFilterElaboradoPor('')
        setFilterMontoTotal('')
        setFilterEstado('')
        fetchQuotations({})
    }

    useEffect(() => {
        fetchQuotations()
    }, [])

    const filteredQs = quotations

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredQs.map(q => q.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleExport = async () => {
        if (selectedIds.length === 0) {
            alert('Por favor selecciona al menos una cotización para exportar.')
            return
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch('/api/quotations/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds, // Enviamos como arreglo
                    userId: user.id || 1,
                    exportType: 'QUOTATION'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("ERROR DE EXPORTACIÓN:\n" + (data.message || "Error desconocido") + (data.details ? "\nDetalles: " + data.details : ""));
                return;
            }

            if (data.success) {
                // Construir detalle del resultado del SP
                let detalle = "✅ EXPORTACIÓN EXITOSA\n\n";
                if (data.spResult && data.spResult.length > 0) {
                    detalle += "Resultado por cotización:\n";
                    data.spResult.forEach((row: any) => {
                        detalle += `  • ${row.Cotizacion}: ${row.Estado}${row.IdProcesado ? ' (ID SQL: ' + row.IdProcesado + ')' : ''}\n`;
                    });
                } else {
                    detalle += "Cotización enviada a SQL Server correctamente.";
                }
                alert(detalle);
                fetchQuotations(); // Recargar la lista para ver los estados actualizados
            } else {
                alert("❌ ERROR EN SQL SERVER:\n" + data.message);
            }

        } catch (error: any) {
            console.error('Export error:', error);
            alert(`Error crítico al conectar con el servidor: ${error.message}`);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.')) return;
        try {
            const res = await fetch(`/api/quotations/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': JSON.parse(localStorage.getItem('user') || '{}').id?.toString() || ''
                }
            });
            if (res.ok) {
                setQuotations(quotations.filter(q => q.id !== id));
            } else {
                const error = await res.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error deleting quotation:', error);
            alert('Ocurrió un error al eliminar la cotización.');
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-3 tracking-tight">
                        <FileText className="w-9 h-9 text-blue-600" /> Historial de Cotizaciones
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Consulta y administra todas las cotizaciones emitidas</p>
                </div>
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="px-6 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-500/20 font-bold transition-all flex items-center gap-3 shrink-0"
                    >
                        <Download className="w-5 h-5" /> Exportar
                    </motion.button>
                    <Link href="/dashboard/quotations/new">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold transition-all flex items-center gap-3 shrink-0"
                        >
                            Nueva Cotización <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </div>
            </header>

            {/* Filtros Avanzados */}
            <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Filtros de Búsqueda</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Referencia */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Referencia / ID</label>
                        <input
                            type="text"
                            placeholder="Ej. #12 o COT-001..."
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterReferencia}
                            onChange={(e) => setFilterReferencia(e.target.value)}
                        />
                    </div>
                    
                    {/* Cliente */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Cliente</label>
                        <input
                            type="text"
                            placeholder="Nombre del cliente..."
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterCliente}
                            onChange={(e) => setFilterCliente(e.target.value)}
                        />
                    </div>

                    {/* Elaborado por */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Elaborado por</label>
                        <input
                            type="text"
                            placeholder="Nombre del vendedor..."
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterElaboradoPor}
                            onChange={(e) => setFilterElaboradoPor(e.target.value)}
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Estado</label>
                        <select
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-semibold"
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                        >
                            <option value="">TODOS</option>
                            {states.map((s: any) => (
                                <option key={s.id || s.code} value={s.code}>{s.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha Desde */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Fecha Desde</label>
                        <input
                            type="date"
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterFechaDesde}
                            onChange={(e) => setFilterFechaDesde(e.target.value)}
                        />
                    </div>

                    {/* Fecha Hasta */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Fecha Hasta</label>
                        <input
                            type="date"
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterFechaHasta}
                            onChange={(e) => setFilterFechaHasta(e.target.value)}
                        />
                    </div>

                    {/* Monto Total */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Monto Total</label>
                        <input
                            type="number"
                            placeholder="Monto exacto..."
                            className="h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-100 dark:border-zinc-700/50 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterMontoTotal}
                            onChange={(e) => setFilterMontoTotal(e.target.value)}
                        />
                    </div>

                    {/* Acciones de Filtro */}
                    <div className="flex items-end gap-2 h-11 mt-auto">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 h-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Search className="w-4 h-4" /> Buscar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="h-full px-4 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[500px]">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
                    </div>
                ) : filteredQs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] text-zinc-400">
                        <FileText className="w-20 h-20 mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold text-zinc-600 dark:text-zinc-300 mb-2">No hay cotizaciones</h3>
                        <p>Aún no se ha emitido ninguna o no coincide con la búsqueda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                                <tr>
                                    <th className="px-8 py-6 w-10 border-b border-zinc-100 dark:border-zinc-800">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedIds.length === filteredQs.length && filteredQs.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Referencia</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Fecha</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Cliente</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Elaborado por</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Monto Total</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Estado</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredQs.map((q) => (
                                    <tr key={q.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all ${selectedIds.includes(q.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="px-8 py-6">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedIds.includes(q.id)}
                                                onChange={() => handleSelectOne(q.id)}
                                            />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                #{q.id}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                                                <Calendar className="w-4 h-4 opacity-50" />
                                                {format(new Date(q.createdAt || new Date()), 'dd/MM/yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{q.clientName}</div>
                                            <div className="text-xs text-zinc-500 font-medium">Pax: {q.passengerName || 'Mismo titular'}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                {q.userName}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                ${parseFloat(q.totalAmount).toLocaleString()} <span className="text-xs opacity-70">{q.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                                q.state === 'ENVIADO' 
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                            }`}>
                                                {q.state || 'NUEVO'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setInvoiceQuotationId(q.id);
                                                        setIsInvoiceModalOpen(true);
                                                    }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-1 font-bold text-xs"
                                                    title="Facturar Cotización"
                                                >
                                                    <Receipt className="w-5 h-5 text-emerald-600" />
                                                    <span className="hidden xl:inline">Facturar</span>
                                                </button>
                                                <Link
                                                    href={`/dashboard/quotations/print?idIni=${q.id}&idFin=${q.id}`}
                                                    target="_blank"
                                                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                    title="Imprimir Cotización"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/quotations/${q.id}/edit`}
                                                    className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                                                    title="Editar Cotización"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="Eliminar Cotización"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <QuotationInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setInvoiceQuotationId(null);
                }}
                quotationId={invoiceQuotationId}
            />
        </div>
    )
}
