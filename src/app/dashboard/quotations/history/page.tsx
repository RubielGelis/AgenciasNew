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
    Receipt,
    Copy,
    CopyPlus,
    FileSpreadsheet,
    ArrowUp,
    ArrowDown,
    MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import QuotationInvoiceModal from '../QuotationInvoiceModal'

export default function QuotationsHistoryPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<any[]>([])
    const [states, setStates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [duplicatingId, setDuplicatingId] = useState<number | null>(null)
    
    // Filtros de búsqueda
    const [filterReferencia, setFilterReferencia] = useState('')
    const [filterFechaDesde, setFilterFechaDesde] = useState('')
    const [filterFechaHasta, setFilterFechaHasta] = useState('')
    const [filterCliente, setFilterCliente] = useState('')
    const [filterElaboradoPor, setFilterElaboradoPor] = useState('')
    const [filterMontoTotal, setFilterMontoTotal] = useState('')
    const [filterEstado, setFilterEstado] = useState('')
    const [filterReserva, setFilterReserva] = useState('')
    const [filterPasajero, setFilterPasajero] = useState('')

    // Ordenamiento por ID (Por defecto DESC por ID de mayor a menor)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [invoiceQuotationId, setInvoiceQuotationId] = useState<number | null>(null)
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

    const fetchQuotations = async (filters?: {
        referencia?: string;
        fechaDesde?: string;
        fechaHasta?: string;
        cliente?: string;
        elaboradoPor?: string;
        montoTotal?: string;
        estado?: string;
        reserva?: string;
        pasajero?: string;
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
                if (filters.reserva) params.append('reserva', filters.reserva)
                if (filters.pasajero) params.append('pasajero', filters.pasajero)
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
            estado: filterEstado,
            reserva: filterReserva,
            pasajero: filterPasajero
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
        setFilterReserva('')
        setFilterPasajero('')
        fetchQuotations({})
    }

    useEffect(() => {
        fetchQuotations()
    }, [])

    // Aplicar ordenamiento por ID
    const sortedQs = [...quotations].sort((a, b) => {
        if (sortDirection === 'asc') return a.id - b.id
        return b.id - a.id
    })

    const filteredQs = sortedQs

    const handleToggleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    }

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

    // Copiar resultado completo a Excel (Portapapeles TSV/HTML)
    const handleCopyToClipboard = () => {
        const listToCopy = selectedIds.length > 0
            ? filteredQs.filter(q => selectedIds.includes(q.id))
            : filteredQs;

        if (listToCopy.length === 0) {
            alert('No hay cotizaciones para copiar.')
            return
        }

        const headers = ['ID', 'No. Interno', 'Fecha', 'Reserva / Localizador', 'Cliente', 'Pasajero / Titular', 'Elaborado por', 'Proveedor', 'Noches', 'Monto Total', 'Moneda', 'Estado']
        
        const rows = listToCopy.map(q => [
            q.id,
            q.internalNumber || '',
            format(new Date(q.createdAt || new Date()), 'dd/MM/yyyy'),
            q.reservationCode || '',
            q.clientName || '',
            q.passengerName || 'Mismo titular',
            q.userName || '',
            q.providerName || '',
            q.nights || 1,
            q.totalAmount,
            q.currency || 'USD',
            q.state || 'NUEVO'
        ])

        const tsvContent = [
            headers.join('\t'),
            ...rows.map(row => row.join('\t'))
        ].join('\n')

        const htmlContent = `
            <table>
                <thead>
                    <tr>${headers.map(h => `<th style="background-color:#f4f4f5;font-weight:bold;">${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        `

        try {
            const blobText = new Blob([tsvContent], { type: 'text/plain' })
            const blobHtml = new Blob([htmlContent], { type: 'text/html' })
            const clipboardItem = new ClipboardItem({
                'text/plain': blobText,
                'text/html': blobHtml
            })
            navigator.clipboard.write([clipboardItem]).then(() => {
                alert(`✅ ${listToCopy.length} cotización(es) copiada(s) al portapapeles. ¡Puedes pegarlas directamente en Excel (Ctrl+V)!`)
            }).catch(() => {
                navigator.clipboard.writeText(tsvContent)
                alert(`✅ ${listToCopy.length} cotización(es) copiada(s) al portapapeles. ¡Puedes pegarlas directamente en Excel (Ctrl+V)!`)
            })
        } catch (err) {
            navigator.clipboard.writeText(tsvContent)
            alert(`✅ ${listToCopy.length} cotización(es) copiada(s) al portapapeles. ¡Puedes pegarlas directamente en Excel (Ctrl+V)!`)
        }
    }

    // Exportar a Excel (.xlsx)
    const handleDownloadExcel = () => {
        const listToDownload = selectedIds.length > 0
            ? filteredQs.filter(q => selectedIds.includes(q.id))
            : filteredQs;

        if (listToDownload.length === 0) {
            alert('No hay cotizaciones para exportar a Excel.')
            return
        }

        const dataForExcel = listToDownload.map(q => ({
            'Referencia ID': q.id,
            'No. Interno': q.internalNumber || '',
            'Fecha': format(new Date(q.createdAt || new Date()), 'dd/MM/yyyy'),
            'Reserva / Localizador': q.reservationCode || '',
            'Cliente': q.clientName || '',
            'Pasajero / Titular': q.passengerName || 'Mismo titular',
            'Elaborado por': q.userName || '',
            'Proveedor': q.providerName || '',
            'Noches': q.nights || 1,
            'Monto Total': parseFloat(q.totalAmount) || 0,
            'Moneda': q.currency || 'USD',
            'Estado': q.state || 'NUEVO'
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotizaciones')
        XLSX.writeFile(workbook, `Historial_Cotizaciones_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`)
    }

    // Exportar a Zeus ERP
    const handleExportZeus = async () => {
        if (selectedIds.length === 0) {
            alert('Por favor selecciona al menos una cotización para exportar a Zeus ERP.')
            return
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch('/api/quotations/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    userId: user.id || 1,
                    exportType: 'QUOTATION'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("ERROR DE EXPORTACIÓN ZEUS ERP:\n" + (data.message || "Error desconocido") + (data.details ? "\nDetalles: " + data.details : ""));
                return;
            }

            if (data.success) {
                let detalle = "✅ EXPORTACIÓN A ZEUS ERP EXITOSA\n\n";
                if (data.spResult && data.spResult.length > 0) {
                    detalle += "Resultado por cotización:\n";
                    data.spResult.forEach((row: any) => {
                        detalle += `  • ${row.Cotizacion}: ${row.Estado}${row.IdProcesado ? ' (ID SQL: ' + row.IdProcesado + ')' : ''}\n`;
                    });
                } else {
                    detalle += "Cotización enviada a SQL Server correctamente.";
                }
                alert(detalle);
                fetchQuotations();
            } else {
                alert("❌ ERROR EN ZEUS ERP:\n" + data.message);
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

    const handleDuplicate = async (id: number) => {
        if (!confirm(`¿Estás seguro de duplicar la cotización #${id}? Se generará una nueva cotización idéntica con un nuevo consecutivo para que puedas editarla.`)) return;
        setDuplicatingId(id);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`/api/quotations/${id}/duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id?.toString() || '1'
                }
            });
            const data = await res.json();
            if (res.ok && data.newQuotationId) {
                alert(`✅ Cotización duplicada exitosamente. Se ha creado la nueva cotización #${data.newQuotationId}. Redirigiendo a la pantalla de edición...`);
                router.push(`/dashboard/quotations/${data.newQuotationId}/edit`);
            } else {
                alert(`❌ Error al duplicar cotización: ${data.message}`);
            }
        } catch (error: any) {
            console.error('Error duplicating quotation:', error);
            alert('Ocurrió un error al duplicar la cotización.');
        } finally {
            setDuplicatingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 max-w-[1700px] mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <FileText className="w-7 h-7 text-blue-600 shrink-0" /> Historial de Cotizaciones
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs md:text-sm mt-0.5">Consulta y administra todas las cotizaciones emitidas</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={handleExportZeus}
                        className="px-4 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md font-bold transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
                        title="Exportar cotizaciones seleccionadas a Zeus ERP"
                    >
                        <Download className="w-4 h-4" /> Exportar Zeus ERP
                    </button>

                    <Link href="/dashboard/quotations/new">
                        <button className="px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-bold transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95">
                            Nueva Cotización <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </header>

            {/* Filtros Avanzados */}
            <div className="bg-white dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h2 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Filtros de Búsqueda</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {/* Referencia */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Referencia / ID</label>
                        <input
                            type="text"
                            placeholder="Ej. 5 o 01-10..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterReferencia}
                            onChange={(e) => setFilterReferencia(e.target.value)}
                        />
                    </div>

                    {/* Reserva / Localizador */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Reserva / Localizador</label>
                        <input
                            type="text"
                            placeholder="Ej. ABC123..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterReserva}
                            onChange={(e) => setFilterReserva(e.target.value)}
                        />
                    </div>

                    {/* Pasajero */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Pasajero</label>
                        <input
                            type="text"
                            placeholder="Nombre del pasajero..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterPasajero}
                            onChange={(e) => setFilterPasajero(e.target.value)}
                        />
                    </div>
                    
                    {/* Cliente */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Cliente</label>
                        <input
                            type="text"
                            placeholder="Nombre del cliente..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterCliente}
                            onChange={(e) => setFilterCliente(e.target.value)}
                        />
                    </div>

                    {/* Elaborado por */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Elaborado por</label>
                        <input
                            type="text"
                            placeholder="Nombre vendedor..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterElaboradoPor}
                            onChange={(e) => setFilterElaboradoPor(e.target.value)}
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Estado</label>
                        <select
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-2.5 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-semibold"
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
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Fecha Desde</label>
                        <input
                            type="date"
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterFechaDesde}
                            onChange={(e) => setFilterFechaDesde(e.target.value)}
                        />
                    </div>

                    {/* Fecha Hasta */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Fecha Hasta</label>
                        <input
                            type="date"
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterFechaHasta}
                            onChange={(e) => setFilterFechaHasta(e.target.value)}
                        />
                    </div>

                    {/* Monto Total */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Monto Total</label>
                        <input
                            type="number"
                            placeholder="Monto exacto..."
                            className="h-9 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700/50 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-200 font-medium"
                            value={filterMontoTotal}
                            onChange={(e) => setFilterMontoTotal(e.target.value)}
                        />
                    </div>

                    {/* Acciones de Filtro */}
                    <div className="flex items-end gap-2 h-9 mt-auto col-span-2 sm:col-span-1 lg:col-span-1">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 h-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        >
                            <Search className="w-3.5 h-3.5" /> Buscar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="h-full px-3 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenedor de Tabla con Barra de Herramientas de Exportación */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
                {/* Barra Superior de Herramientas Excel */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span>Total cotizaciones: <strong className="text-blue-600 dark:text-blue-400 font-black text-sm">{filteredQs.length}</strong></span>
                        {selectedIds.length > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] font-bold">
                                {selectedIds.length} seleccionada(s)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyToClipboard}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                            title="Copiar cotizaciones al portapapeles para pegar en Excel (Ctrl+V)"
                        >
                            <Copy className="w-3.5 h-3.5" /> Copiar a Excel
                        </button>

                        <button
                            onClick={handleDownloadExcel}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                            title="Descargar archivo Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx)
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
                    </div>
                ) : filteredQs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-zinc-400">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-300 mb-1">No hay cotizaciones</h3>
                        <p className="text-xs">Aún no se ha emitido ninguna o no coincide con la búsqueda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40">
                                <tr>
                                    <th className="px-4 py-3.5 w-10 border-b border-zinc-200 dark:border-zinc-800">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedIds.length === filteredQs.length && filteredQs.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th 
                                        onClick={handleToggleSort} 
                                        className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 cursor-pointer hover:text-blue-600 transition-colors select-none whitespace-nowrap"
                                        title="Hacer clic para alternar orden por Referencia / ID"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Referencia / ID</span>
                                            {sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Reserva / Localizador</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Fecha</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Cliente</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Elaborado por</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Monto Total</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Estado</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 text-right whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredQs.map((q) => (
                                    <tr key={q.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all ${selectedIds.includes(q.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedIds.includes(q.id)}
                                                onChange={() => handleSelectOne(q.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-zinc-900 dark:text-white text-xs md:text-sm">
                                                #{q.id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs md:text-sm">
                                                {q.reservationCode || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                                                <Calendar className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                                {format(new Date(q.createdAt || new Date()), 'dd/MM/yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs md:text-sm leading-tight">{q.clientName}</div>
                                            <div className="text-[11px] text-zinc-400 font-medium">Pax: {q.passengerName || 'Mismo titular'}</div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                {q.userName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums text-xs md:text-sm">
                                                ${parseFloat(q.totalAmount).toLocaleString()} <span className="text-[10px] opacity-75 font-bold">{q.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                q.state === 'ENVIADO' 
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                            }`}>
                                                {q.state || 'NUEVO'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === q.id ? null : q.id);
                                                }}
                                                className="p-1.5 px-3 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                                                title="Opciones de cotización"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                                <span>Acciones</span>
                                            </button>

                                            <AnimatePresence>
                                                {activeMenuId === q.id && (
                                                    <>
                                                        {/* Backdrop invisible para cerrar el menú al hacer clic fuera */}
                                                        <div
                                                            className="fixed inset-0 z-20 cursor-default"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                            }}
                                                        />
                                                        
                                                        {/* Menú Flotante de Acciones */}
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            transition={{ duration: 0.12 }}
                                                            className="absolute right-4 top-12 z-30 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 space-y-0.5 text-left"
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    handleDuplicate(q.id);
                                                                }}
                                                                disabled={duplicatingId === q.id}
                                                                className="w-full px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {duplicatingId === q.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                                                ) : (
                                                                    <CopyPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                                )}
                                                                <span>Duplicar Cotización</span>
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    setInvoiceQuotationId(q.id);
                                                                    setIsInvoiceModalOpen(true);
                                                                }}
                                                                className="w-full px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                                                            >
                                                                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                                <span>Facturar Cotización</span>
                                                            </button>

                                                            <Link
                                                                href={`/dashboard/quotations/print?idIni=${q.id}&idFin=${q.id}`}
                                                                target="_blank"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                                                            >
                                                                <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                                <span>Imprimir Cotización</span>
                                                            </Link>

                                                            <Link
                                                                href={`/dashboard/quotations/${q.id}/edit`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                                                            >
                                                                <Edit className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <span>Editar Cotización</span>
                                                            </Link>

                                                            <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1" />

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    handleDelete(q.id);
                                                                }}
                                                                className="w-full px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                                                                <span>Eliminar Cotización</span>
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
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

