'use client'

import React, { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
    Printer, FileSpreadsheet, ArrowLeft, AlignLeft, AlignCenter, 
    AlignRight, Bold, Trash2, ArrowUp, ArrowDown, Sparkles, 
    Check, Edit3, EyeOff, RotateCcw, HelpCircle
} from 'lucide-react'

interface HtmlReportJson {
    idCotizacion: number;
    html: string;
    isCustomized?: boolean;
}

interface ParsedReport {
    idCotizacion: number;
    bodyHtml: string;
    footerHtml: string;
    isCustomized: boolean;
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

        const footerHtml = rentabilidadRows.length > 0 ? `
            <table class="excel-table table-rentabilidad border-collapse table-fixed w-full" style="font-family: Arial, sans-serif; border-spacing: 0; border-collapse: collapse;">
                ${colgroup}
                <tbody>
                    ${rentabilidadRows.join('')}
                </tbody>
            </table>
        ` : '';

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
    const [parsedReports, setParsedReports] = useState<ParsedReport[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [resetCounter, setResetCounter] = useState(0)
    const [saving, setSaving] = useState(false)

    // Editor Active State
    const [isEditing, setIsEditing] = useState(false)
    const [showHelp, setShowHelp] = useState(true)

    // Stable DOM references to prevent React re-render cycle overrides
    const selectedCellRef = useRef<HTMLElement | null>(null)
    const selectedRowRef = useRef<HTMLElement | null>(null)
    const globalFontRef = useRef<string>('Arial')

    // Load reports and parse them once
    useEffect(() => {
        if (!idIni || !idFin) {
            setError("Faltan parámetros idIni o idFin.")
            setLoading(false)
            return
        }

        setLoading(true)
        fetch(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}&format=html${formatId ? `&formatId=${formatId}` : ''}`)
            .then(res => {
                if (!res.ok) throw new Error("Error fetching report data")
                return res.json()
            })
            .then((json: HtmlReportJson[]) => {
                setReports(json);
                const parsed = json.map(r => {
                    if (r.isCustomized) {
                        return {
                            idCotizacion: r.idCotizacion,
                            bodyHtml: r.html,
                            footerHtml: '',
                            isCustomized: true
                        };
                    } else {
                        const { bodyHtml, footerHtml } = splitReportHtml(r.html);
                        return {
                            idCotizacion: r.idCotizacion,
                            bodyHtml,
                            footerHtml,
                            isCustomized: false
                        };
                    }
                });
                setParsedReports(parsed);
                setLoading(false);
                setIsEditing(false);
                selectedCellRef.current = null;
                selectedRowRef.current = null;
            })
            .catch(err => {
                console.error(err)
                setError(err.message)
                setLoading(false)
            })
    }, [idIni, idFin, formatId, resetCounter])

    // Enable/disable toolbar buttons directly in the DOM (pure CSS pointer-events blocker)
    const updateToolbarUI = (hasSelection: boolean) => {
        const cellButtons = document.querySelectorAll('.cell-ctrl-btn')
        cellButtons.forEach((btn: any) => {
            if (hasSelection) {
                btn.classList.remove('editor-btn-disabled')
            } else {
                btn.classList.add('editor-btn-disabled')
            }
        })
        
        const rowButtons = document.querySelectorAll('.row-ctrl-btn')
        rowButtons.forEach((btn: any) => {
            if (hasSelection) {
                btn.classList.remove('editor-btn-disabled')
            } else {
                btn.classList.add('editor-btn-disabled')
            }
        })
    }

    // Attach click/focus event listeners and contenteditable post-render
    useEffect(() => {
        if (loading || parsedReports.length === 0) return

        const tables = document.querySelectorAll('.excel-table')

        const handleCellSelect = (e: Event) => {
            const cell = e.currentTarget as HTMLTableCellElement
            if (cell) {
                // Remove highlight from previous cell and row
                const prevActive = document.querySelector('.active-editor-cell')
                if (prevActive) prevActive.classList.remove('active-editor-cell')
                
                const prevRowActive = document.querySelector('.active-editor-row')
                if (prevRowActive) prevRowActive.classList.remove('active-editor-row')

                cell.classList.add('active-editor-cell')
                selectedCellRef.current = cell

                const row = cell.closest('tr')
                if (row) {
                    row.classList.add('active-editor-row')
                    selectedRowRef.current = row
                }

                // Enable toolbar controls directly in DOM
                updateToolbarUI(true)
            }
        }

        tables.forEach(table => {
            const cells = table.querySelectorAll('td')
            cells.forEach(cell => {
                if (isEditing) {
                    cell.setAttribute('contenteditable', 'true')
                    cell.addEventListener('click', handleCellSelect)
                    cell.addEventListener('focus', handleCellSelect)
                } else {
                    cell.removeAttribute('contenteditable')
                    cell.removeEventListener('click', handleCellSelect)
                    cell.removeEventListener('focus', handleCellSelect)
                }
            })
        })

        // Clean up highlights if edit mode is turned off
        if (!isEditing) {
            const prevActive = document.querySelector('.active-editor-cell')
            if (prevActive) prevActive.classList.remove('active-editor-cell')
            const prevRowActive = document.querySelector('.active-editor-row')
            if (prevRowActive) prevRowActive.classList.remove('active-editor-row')
            selectedCellRef.current = null
            selectedRowRef.current = null
            updateToolbarUI(false)
        }

        return () => {
            tables.forEach(table => {
                const cells = table.querySelectorAll('td')
                cells.forEach(cell => {
                    cell.removeEventListener('click', handleCellSelect)
                    cell.removeEventListener('focus', handleCellSelect)
                })
            })
        }
    }, [isEditing, loading, parsedReports])

    // Toggle editor mode
    const handleToggleEdit = () => {
        setIsEditing(!isEditing)
    }

    // Direct DOM styling handlers (acting on the stable ref)
    const toggleBold = () => {
        const cell = selectedCellRef.current
        if (!cell) return
        const isBold = cell.style.fontWeight === 'bold' || cell.style.fontWeight === '700'
        cell.style.fontWeight = isBold ? 'normal' : 'bold'
    }

    const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
        const cell = selectedCellRef.current
        if (!cell) return
        cell.style.textAlign = align
    }

    const changeFontSize = (delta: number) => {
        const cell = selectedCellRef.current
        if (!cell) return
        const currentSize = window.getComputedStyle(cell).fontSize
        const sizeNum = parseFloat(currentSize) || 12
        cell.style.fontSize = `${sizeNum + delta}px`
    }

    const moveRow = (direction: 'up' | 'down') => {
        const row = selectedRowRef.current
        if (!row) return
        const parent = row.parentNode
        if (!parent) return

        if (direction === 'up' && row.previousElementSibling) {
            parent.insertBefore(row, row.previousElementSibling)
        } else if (direction === 'down' && row.nextElementSibling) {
            parent.insertBefore(row.nextElementSibling, row)
        }
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }

    const hideRow = () => {
        const row = selectedRowRef.current
        if (!row) return
        if (confirm('¿Desea ocultar esta fila del reporte? (Se mantendrá oculta al imprimir/guardar PDF)')) {
            row.style.display = 'none'
            selectedRowRef.current = null
            selectedCellRef.current = null
            updateToolbarUI(false)
        }
    }

    const handleFontChange = (font: string) => {
        globalFontRef.current = font
        // Apply directly to DOM to avoid full React re-render layout overwrite
        const tables = document.querySelectorAll('.excel-table')
        tables.forEach((table: any) => {
            table.style.setProperty('font-family', `${font}, Arial, sans-serif`, 'important')
        })
    }

    // Save modified HTML permanently in DB for this quotation
    const handleSaveChanges = async () => {
        setSaving(true)
        try {
            for (const report of parsedReports) {
                const container = document.getElementById(`report-container-${report.idCotizacion}`)
                if (!container) continue

                const bodyEl = container.querySelector('.report-body-wrapper')
                const footerEl = container.querySelector('.report-footer-wrapper')

                if (!bodyEl) continue

                const bodyClone = bodyEl.cloneNode(true) as HTMLElement
                const footerClone: HTMLElement | null = footerEl ? (footerEl.cloneNode(true) as HTMLElement) : null

                // Clean up active classes and contenteditable from clones before saving
                const nodesToClean: (HTMLElement | null)[] = [bodyClone, footerClone]
                nodesToClean.forEach((node: HTMLElement | null) => {
                    if (!node) return
                    node.querySelectorAll('td').forEach((cell: any) => {
                        cell.removeAttribute('contenteditable')
                        cell.classList.remove('active-editor-cell')
                    })
                    node.querySelectorAll('tr').forEach((row: any) => {
                        row.classList.remove('active-editor-row')
                    })
                })

                // Combine them to save as customization
                const savedHtml = `<div class="report-body-wrapper">${bodyClone.innerHTML}</div>` + 
                                  (footerClone ? `<div class="report-footer-wrapper">${footerClone.innerHTML}</div>` : '')

                const res = await fetch('/api/quotations/print-customization', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quotationId: report.idCotizacion,
                        html: savedHtml
                    })
                })

                if (!res.ok) {
                    const errJson = await res.json()
                    throw new Error(errJson.message || 'Error al guardar')
                }
            }

            alert('¡Diseño y cambios guardados correctamente de forma permanente!')
            setIsEditing(false)
            selectedCellRef.current = null
            selectedRowRef.current = null
        } catch (err: any) {
            console.error(err)
            alert('Error al guardar cambios: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

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
                .excel-table {
                    font-family: ${globalFontRef.current}, Arial, sans-serif !important;
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
                .excel-table * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
                
                /* Editor styling - hidden when printing */
                @media screen {
                    .active-editor-cell {
                        outline: 2px solid #3b82f6 !important;
                        background-color: rgba(59, 130, 246, 0.08) !important;
                        box-shadow: inset 0 0 0 1px #3b82f6 !important;
                    }
                    .active-editor-row {
                        background-color: rgba(59, 130, 246, 0.02) !important;
                        border-left: 3px solid #3b82f6 !important;
                    }
                    [contenteditable="true"] {
                        transition: all 0.15s ease;
                    }
                    [contenteditable="true"]:hover {
                        outline: 1px dashed #3b82f6 !important;
                        cursor: text;
                    }
                    [contenteditable="true"]:focus {
                        outline: 2px solid #2563eb !important;
                        background-color: rgba(37, 99, 235, 0.05) !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                    }
                    
                    /* Custom editor button disabled selector */
                    .editor-btn-disabled {
                        opacity: 0.3 !important;
                        pointer-events: none !important;
                        cursor: not-allowed !important;
                    }
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
                
                {/* Print, Editor, and Navigation Action Bar (hidden during print) */}
                <div className="flex flex-col gap-4 mb-8 print:hidden bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    
                    {/* Top Row: Navigation and Actions */}
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handleVolver}
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-black flex items-center gap-2 transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleEdit}
                                className={`px-5 h-11 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                                    isEditing 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20' 
                                    : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                                }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {isEditing ? 'Desactivar Editor' : 'Activar Diseñador / Editor'}
                            </button>

                            {isEditing && (
                                <button 
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-11 rounded-xl font-black flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 text-sm disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            )}

                            <button 
                                onClick={handleExportExcel}
                                className="bg-emerald-600 text-white px-5 h-11 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Descargar EXCEL
                            </button>
                            
                            <button 
                                onClick={() => window.print()}
                                className="bg-blue-600 text-white px-5 h-11 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir / Guardar PDF
                            </button>
                        </div>
                    </div>

                    {/* Editor Toolbar (Only visible when Editor Mode is active) */}
                    {isEditing && (
                        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Global Options */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                    Tipografía:
                                </span>
                                <select
                                    defaultValue={globalFontRef.current}
                                    onChange={(e) => handleFontChange(e.target.value)}
                                    className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                >
                                    <option value="Arial">Arial (Por defecto)</option>
                                    <option value="Inter">Inter (Moderna)</option>
                                    <option value="Georgia">Georgia (Elegante)</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New (Monospaced)</option>
                                    <option value="system-ui">Sistema (San Francisco/Segoe UI)</option>
                                </select>
                                
                                <button
                                    onClick={() => {
                                        if (confirm('¿Desea restaurar el reporte a su estado original? Se perderán todos los textos y estilos modificados localmente.')) {
                                            setResetCounter(prev => prev + 1);
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 h-9 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold transition-all border border-red-100 dark:border-red-900/35"
                                    title="Restaurar valores de base de datos"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Restaurar
                                </button>
                            </div>

                            {/* Active Cell Options */}
                            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Formato Celda:</span>
                                
                                <button
                                    onClick={toggleBold}
                                    className="cell-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Negrita"
                                >
                                    <Bold className="w-4 h-4" />
                                </button>

                                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700"></div>

                                <button
                                    onClick={() => setAlign('left')}
                                    className="cell-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Alinear a la Izquierda"
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setAlign('center')}
                                    className="cell-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Centrar"
                                >
                                    <AlignCenter className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setAlign('right')}
                                    className="cell-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Alinear a la Derecha"
                                >
                                    <AlignRight className="w-4 h-4" />
                                </button>

                                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700"></div>

                                <button
                                    onClick={() => changeFontSize(1)}
                                    className="cell-ctrl-btn editor-btn-disabled px-2 py-1 rounded-lg text-xs font-bold transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Aumentar Tamaño Letra"
                                >
                                    A+
                                </button>

                                <button
                                    onClick={() => changeFontSize(-1)}
                                    className="cell-ctrl-btn editor-btn-disabled px-2 py-1 rounded-lg text-xs font-bold transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Disminuir Tamaño Letra"
                                >
                                    A-
                                </button>
                            </div>

                            {/* Active Row Options */}
                            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Fila:</span>
                                
                                <button
                                    onClick={() => moveRow('up')}
                                    className="row-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Subir Fila"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => moveRow('down')}
                                    className="row-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-800 dark:text-zinc-200"
                                    title="Bajar Fila"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={hideRow}
                                    className="row-ctrl-btn editor-btn-disabled p-2 rounded-lg transition-all text-zinc-500 hover:text-red-600"
                                    title="Ocultar fila completa"
                                >
                                    <EyeOff className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    )}

                    {/* Quick Helper Notice */}
                    {isEditing && showHelp && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border border-blue-100 dark:border-blue-900/50">
                            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <span className="font-bold">Guía Rápida del Diseñador:</span>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                                    <li>Haz **un solo clic** en cualquier celda para escribir y cambiar su contenido.</li>
                                    <li>Selecciona una celda para activar las opciones de formato en la barra superior (Negrita, alineación, tamaño de letra, mover fila u ocultarla).</li>
                                    <li>Haz clic en **"Guardar Cambios"** (botón azul de la barra superior) para guardar tus ediciones de forma permanente.</li>
                                    <li>Cuando estés listo, haz clic en **"Imprimir / Guardar PDF"** para imprimir tu diseño final.</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowHelp(false)} className="text-blue-500 hover:text-blue-700 font-bold">Entendido</button>
                        </div>
                    )}
                </div>

                {/* Report Content Container */}
                <div className="space-y-16 print:space-y-0">
                    {parsedReports.map((report) => {
                        return (
                            <div 
                                key={report.idCotizacion} 
                                className="bg-white text-black p-8 border border-zinc-200 rounded-2xl print:border-none print:p-0 print:m-0 break-after-page overflow-x-auto relative"
                                id={`report-container-${report.idCotizacion}`}
                            >
                                <h3 className="text-sm font-bold text-zinc-400 mb-4 print:hidden">Cotización #{report.idCotizacion}</h3>
                                <div className="report-body-wrapper" dangerouslySetInnerHTML={{ __html: report.bodyHtml }} />
                                {report.footerHtml && (
                                    <div className="report-footer-wrapper" dangerouslySetInnerHTML={{ __html: report.footerHtml }} />
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
