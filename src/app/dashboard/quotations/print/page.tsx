'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Printer, FileSpreadsheet, ArrowLeft } from 'lucide-react'

interface HtmlReportJson {
    idCotizacion: number;
    html: string;
}

function PrintQuotationsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const idIni = searchParams.get('idIni')
    const idFin = searchParams.get('idFin')

    const [reports, setReports] = useState<HtmlReportJson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!idIni || !idFin) {
            setError("Faltan parámetros idIni o idFin.")
            setLoading(false)
            return
        }

        fetch(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}&format=html`)
            .then(res => {
                if (!res.ok) throw new Error("Error fetching report data")
                return res.json()
            })
            .then((json: HtmlReportJson[]) => {
                setReports(json);
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
        window.open(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}`, '_blank')
    }

    const handleVolver = () => {
        if (window.opener || window.history.length <= 1) {
            try {
                window.close();
            } catch (e) {
                router.push('/dashboard/quotations');
            }
        } else {
            router.back();
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-950">Cargando reporte...</div>
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 bg-zinc-50 dark:bg-zinc-950">Error: {error}</div>
    }

    if (reports.length === 0) {
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
                        padding: 10mm !important; /* Keep content margin but without headers/footers */
                    }
                    @page {
                        margin: 0; /* Removes browser headers (KoreX, URL) and footers */
                        size: portrait;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .excel-table {
                        zoom: 68%;
                        transform-origin: top left;
                        height: auto !important;
                        border-collapse: collapse !important;
                    }
                    .break-after-page {
                        width: 100% !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .break-after-page:not(:last-child) {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                    .break-after-page:last-child {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                }
            `}} />

            <div className="max-w-[1200px] mx-auto bg-white p-8 rounded-xl shadow-xl print:shadow-none print:p-0">
                
                {/* Print and Navigation Action Bar (hidden during print) */}
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

                {/* Report Content Container */}
                <div className="space-y-16 print:space-y-0">
                    {reports.map((report, idx) => {
                        return (
                            <div 
                                key={idx} 
                                className="bg-white text-black p-8 border border-zinc-200 rounded-2xl print:border-none print:p-0 print:m-0 break-after-page overflow-x-auto"
                            >
                                <h3 className="text-sm font-bold text-zinc-400 mb-4 print:hidden">Cotización #{report.idCotizacion}</h3>
                                <div dangerouslySetInnerHTML={{ __html: report.html }} />
                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}

export default function PrintQuotationsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-950">Cargando reporte...</div>}>
            <PrintQuotationsContent />
        </Suspense>
    )
}
