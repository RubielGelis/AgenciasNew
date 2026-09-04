'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Calendar,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    FileMinus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceRow {
    id_factura: number
    fuente: string
    serie: string
    consecutivo: string
    numero: string
    fecha: string
    fecha_contable: string
    estado: string
    cliente_codigo: string
    cliente_nombre: string
    tercero_codigo: string
    tercero_nombre: string
    fuente_nc?: string | null
    serie_nc?: string | null
    numero_nc?: string | null
    fecha_nc?: string | null
    id_concepto?: number | null
    codigo_concepto?: string | null
    nombre_concepto?: string | null
    id_tipo_concepto?: number | null
    codigo_tipo_concepto?: string | null
    nombre_tipo_concepto?: string | null
    id_sucursal?: number
    id_implante?: number | null
}

interface FilterOptions {
    tiposConcepto: { id: number; codigo: string; nombre: string }[]
    conceptos: { id: number; id_tipo_concepto: number; codigo: string; nombre: string }[]
    clientes: { codigo: string; nombre: string }[]
}

export default function UnreferencedCreditNotesPage() {
    const [invoices, setInvoices] = useState<InvoiceRow[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingFilters, setLoadingFilters] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [observaciones, setObservaciones] = useState('Nota Credito No Referenciada')

    // Paginación (por defecto 1000 en 1000)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(1000)
    const [totalInvoices, setTotalInvoices] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // Filtros
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [selectedCliente, setSelectedCliente] = useState('')
    const [selectedTipoConcepto, setSelectedTipoConcepto] = useState('')
    const [selectedConcepto, setSelectedConcepto] = useState('')

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        tiposConcepto: [],
        conceptos: [],
        clientes: []
    })

    const [resultModal, setResultModal] = useState<{
        open: boolean
        data?: any
    }>({ open: false })

    // Cargar filtros maestros
    useEffect(() => {
        fetch('/api/credit-notes/unreferenced/filters')
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) {
                    setFilterOptions(data)
                }
            })
            .catch(err => console.error('Error loading filter options:', err))
            .finally(() => setLoadingFilters(false))
    }, [])

    // Cargar facturas paginadas
    const fetchInvoices = async (targetPage = page, targetPageSize = pageSize) => {
        setLoading(true)
        setErrorMessage(null)
        try {
            const params = new URLSearchParams()
            params.append('page', targetPage.toString())
            params.append('pageSize', targetPageSize.toString())
            if (fechaDesde) params.append('fechaDesde', fechaDesde)
            if (fechaHasta) params.append('fechaHasta', fechaHasta)
            if (selectedCliente) params.append('cliente', selectedCliente)
            if (selectedTipoConcepto) params.append('idTipoConcepto', selectedTipoConcepto)
            if (selectedConcepto) params.append('idConcepto', selectedConcepto)

            const res = await fetch(`/api/credit-notes/unreferenced/invoices?${params.toString()}`)
            const json = await res.json()

            if (res.ok) {
                if (json && Array.isArray(json.data)) {
                    setInvoices(json.data)
                    setTotalInvoices(json.total || 0)
                    setTotalPages(json.totalPages || 1)
                    setPage(json.page || targetPage)
                } else if (Array.isArray(json)) {
                    setInvoices(json)
                    setTotalInvoices(json.length)
                    setTotalPages(Math.ceil(json.length / targetPageSize) || 1)
                } else {
                    setInvoices([])
                    setTotalInvoices(0)
                    setTotalPages(1)
                }
                setErrorMessage(null)
            } else {
                setInvoices([])
                setTotalInvoices(0)
                setTotalPages(1)
                setErrorMessage(json.message || 'Error al consultar facturas en SQL Server.')
            }
        } catch (error: any) {
            console.error('Error fetching invoices:', error)
            setErrorMessage('Error de comunicación con el servidor: ' + (error.message || error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices(1, pageSize)
    }, [])

    // Handler para aplicar filtros (reinicia a página 1)
    const handleApplyFilters = () => {
        setPage(1)
        fetchInvoices(1, pageSize)
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage)
            fetchInvoices(newPage, pageSize)
        }
    }

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        setPage(1)
        fetchInvoices(1, newSize)
    }

    // Filtrar conceptos según tipo seleccionado
    const availableConceptos = selectedTipoConcepto
        ? filterOptions.conceptos.filter(c => c.id_tipo_concepto === parseInt(selectedTipoConcepto))
        : filterOptions.conceptos

    // Facturas filtradas por término de búsqueda rápido local
    const filteredInvoices = invoices.filter(inv => {
        const term = searchTerm.toLowerCase()
        if (!term) return true
        return (
            (inv.numero && inv.numero.toLowerCase().includes(term)) ||
            (inv.consecutivo && inv.consecutivo.toLowerCase().includes(term)) ||
            (inv.cliente_nombre && inv.cliente_nombre.toLowerCase().includes(term)) ||
            (inv.cliente_codigo && inv.cliente_codigo.toLowerCase().includes(term)) ||
            (inv.nombre_concepto && inv.nombre_concepto.toLowerCase().includes(term)) ||
            (inv.numero_nc && inv.numero_nc.toLowerCase().includes(term))
        )
    })

    // Comprobar si una factura es elegible para crear Nota Crédito
    const isEligible = (inv: InvoiceRow) => {
        const hasNC = inv.numero_nc && inv.numero_nc.trim() !== ''
        const isAnulada = inv.estado && inv.estado.toLowerCase().includes('anulada')
        return !hasNC && !isAnulada
    }

    const eligibleInvoices = filteredInvoices.filter(isEligible)

    const handleSelectAllCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const pageEligibleIds = eligibleInvoices.map(i => i.id_factura)
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageEligibleIds])))
        } else {
            const pageIds = new Set(filteredInvoices.map(i => i.id_factura))
            setSelectedIds(prev => prev.filter(id => !pageIds.has(id)))
        }
    }

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleCreateCreditNotes = async () => {
        if (selectedIds.length === 0) {
            alert('Por favor selecciona al menos una factura para generar la Nota Crédito.')
            return
        }

        const facturasAProcesar = invoices.filter(inv => selectedIds.includes(inv.id_factura))

        if (facturasAProcesar.length === 0) {
            alert('Las facturas seleccionadas no están en la página actual. Se procesarán las facturas visibles seleccionadas.')
            return
        }

        if (!confirm(`¿Estás seguro de generar Notas Crédito para las ${facturasAProcesar.length} facturas seleccionadas?`)) {
            return
        }

        setProcessing(true)
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const res = await fetch('/api/credit-notes/unreferenced/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facturas: facturasAProcesar,
                    userId: user.id || 1,
                    observaciones: observaciones || 'Nota Credito No Referenciada'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                alert('ERROR AL GENERAR NOTAS CRÉDITO:\n' + (data.message || 'Error desconocido'))
                return
            }

            setResultModal({ open: true, data })
            setSelectedIds(prev => prev.filter(id => !facturasAProcesar.some(f => f.id_factura === id)))
            fetchInvoices(page, pageSize)
        } catch (error: any) {
            console.error('Error generating credit notes:', error)
            alert('Error en la comunicación con el servidor: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    const isAllPageSelected = eligibleInvoices.length > 0 && eligibleInvoices.every(i => selectedIds.includes(i.id_factura))

    // Componente reutilizable de barra de paginación
    const renderPaginationControls = (positionLabel: string) => (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="text-zinc-600 dark:text-zinc-400 font-medium">
                    Mostrando <strong className="text-zinc-900 dark:text-zinc-100">{totalInvoices > 0 ? (page - 1) * pageSize + 1 : 0}</strong> - <strong className="text-zinc-900 dark:text-zinc-100">{Math.min(page * pageSize, totalInvoices)}</strong> de <strong className="text-blue-600 font-bold">{totalInvoices.toLocaleString()}</strong> facturas
                </div>
                <div className="text-zinc-300 dark:text-zinc-700 hidden sm:block">|</div>
                <div className="text-zinc-500">
                    Elegibles: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{eligibleInvoices.length}</strong>
                </div>
                <div className="text-zinc-300 dark:text-zinc-700 hidden sm:block">|</div>
                <div className="text-zinc-500">
                    Seleccionadas: <strong className="text-blue-600 font-semibold">{selectedIds.length}</strong>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
                {/* Selector de tamaño de página */}
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-medium">Mostrar:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 shadow-sm cursor-pointer"
                    >
                        <option value={1000}>1,000 por página</option>
                        <option value={500}>500 por página</option>
                        <option value={200}>200 por página</option>
                        <option value={100}>100 por página</option>
                        <option value={50}>50 por página</option>
                    </select>
                </div>

                {/* Botones de navegación Anterior / Siguiente */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={page <= 1 || loading}
                        className="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        title="Primera página"
                    >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Inicio</span>
                    </button>

                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || loading}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        title="Página anterior"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Anterior</span>
                    </button>

                    <div className="px-3 py-1 text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap text-[11px]">
                        Pág. <strong className="text-blue-600 font-bold">{page}</strong> de <strong className="text-zinc-900 dark:text-zinc-100">{totalPages}</strong>
                    </div>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        title="Página siguiente"
                    >
                        <span className="text-[11px] font-semibold">Siguiente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page >= totalPages || loading}
                        className="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        title="Última página"
                    >
                        <span className="hidden sm:inline text-[11px]">Fin</span>
                        <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-xl">
                            <FileMinus className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Notas Crédito No Referenciadas</h1>
                            <p className="text-sm text-zinc-500">
                                Consulta facturas de SQL Server (Agencias) paginadas de 1,000 en 1,000 y genera Notas Crédito en lote
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchInvoices(page, pageSize)}
                        disabled={loading}
                        className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm font-medium"
                        title="Recargar datos"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>

                    <button
                        onClick={handleCreateCreditNotes}
                        disabled={selectedIds.length === 0 || processing}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generando Notas Crédito...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Generar Notas Crédito ({selectedIds.length})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Banner de Error si existe */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                    <div className="flex-1 font-medium">{errorMessage}</div>
                    <button
                        onClick={() => fetchInvoices(page, pageSize)}
                        className="px-3 py-1 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 rounded-lg text-xs font-semibold transition-all"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Filtros de Búsqueda */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>Filtros de Búsqueda (fnFacturacionesListar)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Fecha Desde */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Fecha Desde</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Fecha Hasta */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Fecha Hasta</label>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Cliente */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Cliente</label>
                        <input
                            type="text"
                            placeholder="Buscar por código o nombre..."
                            value={selectedCliente}
                            onChange={(e) => setSelectedCliente(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tipo de Concepto */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de Concepto</label>
                        <select
                            value={selectedTipoConcepto}
                            onChange={(e) => {
                                setSelectedTipoConcepto(e.target.value)
                                setSelectedConcepto('')
                            }}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los tipos</option>
                            {filterOptions.tiposConcepto.map(t => (
                                <option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Concepto Facturación */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Concepto Facturación</label>
                        <select
                            value={selectedConcepto}
                            onChange={(e) => setSelectedConcepto(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los conceptos</option>
                            {availableConceptos.map(c => (
                                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="w-full sm:w-72 relative">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Buscar en esta página..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={() => {
                                setFechaDesde('')
                                setFechaHasta('')
                                setSelectedCliente('')
                                setSelectedTipoConcepto('')
                                setSelectedConcepto('')
                                setSearchTerm('')
                                setPage(1)
                                fetchInvoices(1, pageSize)
                            }}
                            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Observaciones para la Nota Crédito */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg font-bold text-xs">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-950 dark:text-blue-200">Facturas seleccionadas para anulación</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Se ejecutará el SP spza_FacturaRemision_NotaCredito para cada una</p>
                        </div>
                    </div>
                    <div className="w-full md:w-96 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Observación / Motivo de la Nota Crédito..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-medium whitespace-nowrap"
                        >
                            Deseleccionar
                        </button>
                    </div>
                </div>
            )}

            {/* Barra de Paginación Superior */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                {renderPaginationControls('top')}
            </div>

            {/* Tabla de Facturas */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected}
                                        onChange={handleSelectAllCurrentPage}
                                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        title="Seleccionar todas las elegibles de esta página"
                                    />
                                </th>
                                <th className="p-4">Fuente / Serie / Consecutivo</th>
                                <th className="p-4">Número Factura</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Concepto</th>
                                <th className="p-4">Nota Crédito Anulación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
                                            <span className="font-medium text-sm">Consultando lote de facturas en SQL Server...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="w-9 h-9 text-zinc-400" />
                                            <span className="font-medium text-sm">No se encontraron facturas con los filtros seleccionados.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => {
                                    const eligible = isEligible(inv)
                                    const isSelected = selectedIds.includes(inv.id_factura)
                                    const hasNC = inv.numero_nc && inv.numero_nc.trim() !== ''

                                    return (
                                        <tr
                                            key={inv.id_factura}
                                            className={`transition-colors ${isSelected
                                                ? 'bg-blue-50/70 dark:bg-blue-900/20'
                                                : !eligible
                                                    ? 'bg-zinc-50/50 dark:bg-zinc-900/30 opacity-75'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                                                }`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    disabled={!eligible}
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(inv.id_factura)}
                                                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                            </td>

                                            <td className="p-4 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                                                        {inv.fuente || '55'}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                                                        {inv.serie || '00'}
                                                    </span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                        {inv.consecutivo}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">
                                                {inv.numero || `${inv.serie || ''}${inv.consecutivo || ''}`}
                                            </td>

                                            <td className="p-4 text-zinc-600 dark:text-zinc-400">
                                                <div>{inv.fecha ? format(new Date(inv.fecha), 'dd/MM/yyyy') : '-'}</div>
                                                {inv.fecha_contable && (
                                                    <div className="text-[10px] text-zinc-400">
                                                        Cont: {format(new Date(inv.fecha_contable), 'dd/MM/yyyy')}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {inv.estado === 'Anulada' || hasNC ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                                                        <XCircle className="w-3 h-3" />
                                                        Anulada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Facturada
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <div className="font-medium text-zinc-800 dark:text-zinc-200">
                                                    {inv.cliente_nombre || '-'}
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-mono">
                                                    NIT: {inv.cliente_codigo || '-'}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                {inv.nombre_concepto ? (
                                                    <div>
                                                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                                                            {inv.codigo_concepto ? `[${inv.codigo_concepto}] ` : ''}{inv.nombre_concepto}
                                                        </div>
                                                        {inv.nombre_tipo_concepto && (
                                                            <div className="text-[10px] text-blue-600 dark:text-blue-400">
                                                                {inv.nombre_tipo_concepto}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400 italic">General / Múltiple</span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {hasNC ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-mono">
                                                            <span>NC:</span>
                                                            <span>{inv.fuente_nc}-{inv.serie_nc}-{inv.numero_nc}</span>
                                                        </div>
                                                        {inv.fecha_nc && (
                                                            <div className="text-[10px] text-zinc-400">
                                                                {format(new Date(inv.fecha_nc), 'dd/MM/yyyy')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400 text-[11px] italic">Sin Nota Crédito</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer tabla con controles de paginación inferiores */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800">
                    {renderPaginationControls('bottom')}
                </div>
            </div>

            {/* Modal de Resultados */}
            <AnimatePresence>
                {resultModal.open && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold dark:text-white">Procesamiento Completado</h3>
                                    <p className="text-xs text-zinc-500">Resultados de generación en SQL Server y registro en Postgres</p>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Total facturas procesadas:</span>
                                    <strong className="text-zinc-800 dark:text-zinc-200">{resultModal.data?.totalProcesadas || 0}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Notas Crédito generadas en SQL Server:</span>
                                    <strong className="text-emerald-600">{resultModal.data?.exitosasCount || 0}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Registros insertados en Postgres (NotasCreditoNoRef):</span>
                                    <strong className="text-blue-600">{resultModal.data?.pgInsertedCount || 0}</strong>
                                </div>
                                {resultModal.data?.pgResultMsg && (
                                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400">
                                        Estado Postgres: {resultModal.data.pgResultMsg}
                                    </div>
                                )}
                            </div>

                            {/* Detalle por factura */}
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                {resultModal.data?.resultados?.map((r: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl text-xs flex items-center justify-between gap-3 border ${r.estado === 'EXITO'
                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                                            : r.estado === 'OMITIDA'
                                                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300'
                                                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-300'
                                            }`}
                                    >
                                        <div>
                                            <strong>Factura: {r.factura_fuente}-{r.factura_serie}-{r.factura_numero}</strong>
                                            {r.consecutivo_nc && (
                                                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                                                    Nota Crédito: {r.fuente_nc}-{r.serie_nc}-{r.consecutivo_nc}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold">{r.estado}</span>
                                            <div className="text-[10px] text-zinc-500 max-w-xs truncate">{r.mensaje}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                <button
                                    onClick={() => setResultModal({ open: false })}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
                                >
                                    Cerrar y Aceptar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
