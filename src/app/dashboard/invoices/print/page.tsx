'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Printer, FileSpreadsheet, ArrowLeft } from 'lucide-react'

function PrintInvoicesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const idIni = searchParams.get('idIni')
    const idFin = searchParams.get('idFin')

    const [htmlContent, setHtmlContent] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!idIni || !idFin) {
            setError("Faltan parámetros idIni o idFin.")
            setLoading(false)
            return
        }

        fetch(`/api/reports/facturas/export-excel?idIni=${idIni}&idFin=${idFin}&format=html`)
            .then(res => {
                if (!res.ok) throw new Error("Error obteniendo datos de factura")
                return res.text()
            })
            .then((html: string) => {
                setHtmlContent(html);
                setLoading(false);
            })
            .catch(err => {
                console.error(err)
                setError(err.message)
                setLoading(false)
            })
    }, [idIni, idFin])

    const handleExportExcel = () => {
        if (!idIni || !idFin) {
            alert("Faltan parámetros idIni o idFin.")
            return
        }
        window.open(`/api/reports/facturas/export-excel?idIni=${idIni}&idFin=${idFin}`, '_blank')
    }

    const handleVolver = () => {
        if (window.opener || window.history.length <= 1) {
            try {
                window.close();
            } catch (e) {
                router.push('/dashboard/invoices/history');
            }
        } else {
            router.back();
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-950">Cargando formato de factura...</div>
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 bg-zinc-50 dark:bg-zinc-950">Error: {error}</div>
    }

    if (!htmlContent) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-950">No se encontraron datos para el rango especificado.</div>
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-8 print:p-0 print:bg-white text-black">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        padding: 10mm !important;
                    }
                    @page {
                        margin: 0;
                        size: portrait;
                    }
                    .excel-table {
                        zoom: 68%;
                        transform-origin: top left;
                        height: auto !important;
                        border-collapse: collapse !important;
                    }
                }
            `}} />

            <div className="max-w-[1200px] mx-auto bg-white p-8 rounded-xl shadow-xl print:shadow-none print:p-0">
                
                {/* Print and Navigation Action Bar */}
                <div className="flex justify-between items-center mb-8 print:hidden bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <button 
                        onClick={handleVolver}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-bold flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleExportExcel}
                            className="bg-emerald-600 text-white px-5 h-11 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Descargar EXCEL
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="bg-blue-600 text-white px-5 h-11 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir / Guardar PDF
                        </button>
                    </div>
                </div>

                {/* Report HTML Content */}
                <div className="bg-white text-black p-4 border border-zinc-200 rounded-2xl print:border-none print:p-0 print:m-0 overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>

            </div>
        </div>
    )
}

export default function PrintInvoicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-950">Cargando impresión...</div>}>
            <PrintInvoicesContent />
        </Suspense>
    )
}
