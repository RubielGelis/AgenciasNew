'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Printer, FileSpreadsheet, ArrowLeft } from 'lucide-react'

interface HtmlReportJson {
    idCotizacion: number;
    html: string;
}

function splitReportHtml(html: string) {
    if (typeof window === 'undefined') return { bodyHtml: html, footerHtml: '' };

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const originalTable = doc.querySelector('.excel-table');
        if (!originalTable) return { bodyHtml: html, footerHtml: '' };

        const colgroup = originalTable.querySelector('colgroup')?.outerHTML || '';
        const rows = Array.from(originalTable.querySelectorAll('tbody tr'));

        let productHeaderIdx = -1;
        let rentabilidadHeaderIdx = -1;

        rows.forEach((row, idx) => {
            const text = row.textContent || '';
            const cleanedText = text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Deducir inicio de productos
            if (productHeaderIdx === -1 && (cleanedText.includes('PROVEEDOR') && cleanedText.includes('DETALLE'))) {
                productHeaderIdx = idx;
            }

            // Deducir inicio de rentabilidad negocio
            if (rentabilidadHeaderIdx === -1 && (cleanedText.includes('RENTABILIDAD NEGOCIO') || cleanedText.includes('RENTABILIDAD'))) {
                rentabilidadHeaderIdx = idx;
            }
        });

        if (productHeaderIdx === -1 && rentabilidadHeaderIdx === -1) {
            return { bodyHtml: html, footerHtml: '' };
        }

        const cabeceraRows: string[] = [];
        const productosRows: string[] = [];
        const rentabilidadRows: string[] = [];

        rows.forEach((row, idx) => {
            const trHtml = row.outerHTML;
            const rowText = (row.textContent || '').trim();

            if (rentabilidadHeaderIdx !== -1 && idx >= rentabilidadHeaderIdx) {
                if (rowText === '' && idx > rentabilidadHeaderIdx) {
                    return;
                }
                rentabilidadRows.push(trHtml);
            } else if (productHeaderIdx !== -1 && idx >= productHeaderIdx) {
                if (rowText === '' && idx > productHeaderIdx) {
                    return;
                }
                productosRows.push(trHtml);
            } else {
                cabeceraRows.push(trHtml);
            }
        });

        const tableCabecera = `
            <table class="excel-table table-cabecera border-collapse table-auto mb-4" style="font-family: Arial, sans-serif; border-spacing: 0; border-collapse: collapse; width: fit-content; max-width: 100%;">
                <tbody>
                    ${cabeceraRows.join('')}
                </tbody>
            </table>
        `;

        // Tabla de productos con table-fixed para mantener alineación de columnas
        const tableProductos = `
            <table class="excel-table table-productos border-collapse table-fixed w-full" style="font-family: Arial, sans-serif; border-spacing: 0; border-collapse: collapse;">
                ${colgroup}
                <tbody>
                    ${productosRows.join('')}
                </tbody>
            </table>
        `;

        let footerHtml = '';
        if (rentabilidadRows.length > 0) {
            footerHtml = `
                <table class="excel-table table-rentabilidad border-collapse table-fixed w-full" style="font-family: Arial, sans-serif; border-spacing: 0; border-collapse: collapse;">
                    ${colgroup}
                    <tbody>
                        ${rentabilidadRows.join('')}
                    </tbody>
                </table>
            `;
        }

        const bodyHtml = `
            <div class="report-header-section">${tableCabecera}</div>
            <div class="report-products-section">${tableProductos}</div>
        `;

        return { bodyHtml, footerHtml };
    } catch (e) {
        console.error("Error splitting report table:", e);
        return { bodyHtml: html, footerHtml: '' };
    }
}

function PrintQuotationsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const idIni = searchParams.get('idIni')
    const idFin = searchParams.get('idFin')
    const formatId = searchParams.get('formatId')

    const [reports, setReports] = useState<HtmlReportJson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!idIni || !idFin) {
            setError("Faltan parámetros idIni o idFin.")
            setLoading(false)
            return
        }

        fetch(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}&format=html${formatId ? `&formatId=${formatId}` : ''}`)
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
    }, [idIni, idFin, formatId])

    const handleExportExcel = () => {
        if (!idIni || !idFin) {
            alert("Faltan parámetros idIni o idFin.")
            return
        }
        window.open(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}${formatId ? `&formatId=${formatId}` : ''}`, '_blank')
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
                .break-after-page {
                    position: relative !important;
                    min-height: 800px !important;
                    box-sizing: border-box !important;
                    padding-bottom: 200px !important; /* Space for footer in screen view */
                }
                .report-footer-wrapper {
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: letter portrait;
                        margin: 10mm 12mm 10mm 12mm; /* Standard page margins */
                    }
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .excel-table {
                        zoom: 69%; /* Fits the letter width perfectly */
                        transform-origin: top left;
                        border-collapse: collapse !important;
                    }
                    .break-after-page {
                        width: 100% !important;
                        height: 259.4mm !important; /* Letter total height minus top/bottom margins (279.4 - 20) */
                        min-height: 259.4mm !important;
                        position: relative !important;
                        box-sizing: border-box !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        padding-bottom: 45mm !important; /* Protect table overlap with the absolute footer */
                        overflow: hidden !important;
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
                        const { bodyHtml, footerHtml } = splitReportHtml(report.html);
                        return (
                            <div 
                                key={idx} 
                                className="bg-white text-black p-8 border border-zinc-200 rounded-2xl print:border-none print:p-0 print:m-0 break-after-page overflow-x-auto"
                            >
                                <h3 className="text-sm font-bold text-zinc-400 mb-4 print:hidden">Cotización #{report.idCotizacion}</h3>
                                <div className="report-body-wrapper" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                                {footerHtml && (
                                    <div className="report-footer-wrapper" dangerouslySetInnerHTML={{ __html: footerHtml }} />
                                )}
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
