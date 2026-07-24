'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Receipt, Loader2 } from 'lucide-react'
import InvoiceForm from '../invoices/new/invoice-form'

interface QuotationInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    quotationId: number | null;
}

export default function QuotationInvoiceModal({
    isOpen,
    onClose,
    quotationId
}: QuotationInvoiceModalProps) {
    const [loading, setLoading] = useState(false)
    const [quotationData, setQuotationData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && quotationId) {
            setLoading(true)
            setError(null)
            fetch(`/api/quotations/${quotationId}/fn-cotizacion`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.message) {
                        setQuotationData(data)
                    } else {
                        setError(data.message || 'Error al consultar fnCotizacion')
                    }
                })
                .catch(err => {
                    console.error("Error calling fnCotizacion:", err)
                    setError('Ocurrió un error al cargar la información de la cotización')
                })
                .finally(() => setLoading(false))
        } else {
            setQuotationData(null)
            setError(null)
        }
    }, [isOpen, quotationId])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-7xl max-h-[92vh] bg-zinc-50 dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                    Facturar Cotización #{quotationId}
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                        Estado: Nuevo
                                    </span>
                                </h2>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Información heredada mediante fnCotizacion. Revisa los datos y haz clic en Guardar para emitir la factura.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                                <p className="font-bold text-sm">Consultando fnCotizacion...</p>
                            </div>
                        ) : error ? (
                            <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-center font-bold text-sm">
                                {error}
                            </div>
                        ) : (
                            <InvoiceForm
                                quotationId={quotationId?.toString()}
                                initialData={quotationData}
                                onCancel={onClose}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
