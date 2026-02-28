'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, FileText, Download, Trash2, Eye, MoreVertical, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { generateQuotationPDF } from '@/lib/pdf-utils'

export default function QuotationsListPage() {
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/quotations/list')
            .then(res => res.json())
            .then(data => {
                setQuotations(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleDownloadPdf = (q: any) => {
        // We need to fetch full data for the PDF or ensure the list has enough
        // For now, let's assume the list has basic info or mock enrichment
        const pdfData = {
            ...q,
            clientName: q.client.name,
            clientDocument: q.client.document,
            providerName: q.provider.name,
            hotelName: q.hotel.name,
            checkIn: format(new Date(q.checkInDate), 'yyyy-MM-dd'),
            checkOut: format(new Date(q.checkOutDate), 'yyyy-MM-dd'),
            items: q.products.map((p: any) => ({
                ...p,
                productDescription: p.product.description
            }))
        }
        generateQuotationPDF(pdfData)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Cotizaciones</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestión y seguimiento de tus ofertas</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/dashboard/quotations/new')}
                    className="px-6 h-14 bg-blue-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Cotización
                </motion.button>
            </header>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-8 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, número o hotel..."
                        className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <button className="h-12 px-6 flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-50 transition-all">
                    <Filter className="w-4 h-4" /> Filtros
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Número</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Fechas</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto"></div></td></tr>
                        ) : quotations.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-zinc-500 font-medium">No se encontraron cotizaciones.</td></tr>
                        ) : (
                            quotations.map((q) => (
                                <tr key={q.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">{q.internalNumber}</div>
                                        <div className="text-[10px] text-zinc-400 mt-0.5">{format(new Date(q.date), 'dd MMM, yyyy')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-900 dark:text-white">{q.client.name}</div>
                                        <div className="text-xs text-zinc-400">{q.hotel.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            {format(new Date(q.checkInDate), 'dd/MM/yy')} - {format(new Date(q.checkOutDate), 'dd/MM/yy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-black text-zinc-900 dark:text-white">
                                            ${q.totalAmount.toLocaleString()} <span className="text-[10px] text-zinc-500 uppercase">{q.currency}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownloadPdf(q)}
                                                className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                            >
                                                <FileDown className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
