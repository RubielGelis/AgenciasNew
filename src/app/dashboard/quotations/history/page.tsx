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
    Edit
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { generateQuotationPDF } from '@/lib/pdf-utils'

export default function QuotationsHistoryPage() {
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const res = await fetch('/api/quotations/history')
                const data = await res.json()
                setQuotations(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Error fetching history:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchQuotations()
    }, [])

    const filteredQs = quotations.filter(q =>
        q.internalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDownloadPDF = async (q: any) => {
        // En una app real haríamos un fetch a todo el detalle si no vino completo 
        // y se lo pasamos al generateQuotationPDF de la misma forma que en 'nueva'.
        alert('En construcción: La descarga directa requiere traer el detalle completo de productos desde la DB. Se implementará en breve.')
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
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar N° o cliente..."
                            className="h-14 bg-white dark:bg-zinc-900 rounded-2xl pl-12 pr-6 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 font-medium transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Referencia</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Fecha</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Cliente</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Monto Total</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredQs.map((q) => (
                                    <tr key={q.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                {q.internalNumber}
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
                                            <div className="text-xs text-zinc-500">{q.nights} Noches - {q.providerName}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                ${parseFloat(q.totalAmount).toLocaleString()} <span className="text-xs opacity-70">{q.currency}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownloadPDF(q)}
                                                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    href={`/dashboard/quotations/${q.id}/edit`}
                                                    className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                                                    title="Editar Cotización"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
