'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, FileText, Download, Trash2, Eye, Edit2, MoreVertical, FileDown, FileCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { generateQuotationPDF } from '@/lib/pdf-utils'

export default function QuotationsListPage() {
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetch('/api/quotations/list')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setQuotations(data)
                } else {
                    console.error("API returned error or non-array:", data)
                    setQuotations([])
                    alert("Error cargando cotizaciones: " + (data?.details || data?.message || "Desconocido"))
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleDownloadPdf = (q: any) => {
        const firstProd = q.products && q.products.length > 0 ? q.products[0] : null;

        const pdfData = {
            ...q,
            clientName: q.client?.name || 'Cliente sin nombre',
            clientDocument: q.client?.document || '',
            providerName: firstProd?.provider?.name || 'Varios/Ninguno',
            hotelName: firstProd?.hotel?.name || 'Varios/Ninguno',
            checkIn: firstProd?.checkInDate ? format(new Date(firstProd.checkInDate), 'yyyy-MM-dd') : '',
            checkOut: firstProd?.checkOutDate ? format(new Date(firstProd.checkOutDate), 'yyyy-MM-dd') : '',
            paxName: firstProd?.passengers?.[0]?.name || 'N/A',
            paxDocument: firstProd?.passengers?.[0]?.document || 'N/A',
            paxAdults: firstProd?.paxAdults || 1,
            paxChildren: firstProd?.paxChildren || 0,
            nights: firstProd?.nights || 0,
            items: (q.products || []).map((p: any) => ({
                ...p,
                productDescription: p.product?.description || ''
            }))
        }
        generateQuotationPDF(pdfData)
    }

    const handleExportXml = async (q: any) => {
        try {
            const loggedUser = JSON.parse(localStorage.getItem('user') || '{"id": 1}');
            const res = await fetch('/api/quotations/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: q.id.toString(),
                    userId: loggedUser.id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error exportando XML');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cotizacion_${q.id}.xml`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error(err);
            alert("Error al exportar XML: " + err.message);
        }
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
                        placeholder="Buscar por cliente, ID o hotel..."
                        className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Referencia</th>
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
                            quotations.filter(q => {
                                const mainProd = q.products.find((p: any) => p.mainTaxId) || (q.products && q.products.length > 0 ? q.products[0] : null);
                                const firstProd = mainProd;
                                const firstPaxName = firstProd?.passengers && Array.isArray(firstProd.passengers) && firstProd.passengers.length > 0 ? firstProd.passengers[0].name : '';
                                return q.id.toString().includes(search) ||
                                    (q.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                                    (firstPaxName && firstPaxName.toLowerCase().includes(search.toLowerCase())) ||
                                    (firstProd?.hotel?.name && firstProd.hotel.name.toLowerCase().includes(search.toLowerCase()))
                            }).map((q) => {
                                const mainProd = q.products.find((p: any) => p.mainTaxId) || (q.products && q.products.length > 0 ? q.products[0] : null);
                                const firstProd = mainProd;
                                return (
                                    <tr key={q.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-blue-600">#{q.id}</div>
                                            <div className="text-[10px] text-zinc-400 mt-0.5">{format(new Date(q.date), 'dd MMM, yyyy')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900 dark:text-white">{q.client?.name}</div>
                                            <div className="text-[10px] text-zinc-500 font-medium">Pax: {(firstProd?.passengers && Array.isArray(firstProd.passengers) && firstProd.passengers.length > 0) ? firstProd.passengers[0].name : 'Mismo titular'}</div>
                                            <div className="text-xs text-zinc-400 mt-1">{firstProd?.hotel?.name || 'Varios/Ninguno'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                {firstProd?.checkInDate ? format(new Date(firstProd.checkInDate), 'dd/MM/yy') : '-'} - {firstProd?.checkOutDate ? format(new Date(firstProd.checkOutDate), 'dd/MM/yy') : '-'}
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
                                                    onClick={() => handleExportXml(q)}
                                                    className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                                    title="Descargar XML (Integración)"
                                                >
                                                    <FileCode className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(q)}
                                                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    <FileDown className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/quotations/${q.id}/edit`)}
                                                    className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                                    title="Editar Cotización"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
