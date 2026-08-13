'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
    Printer, FileSpreadsheet, ArrowLeft, AlignLeft, AlignCenter, 
    AlignRight, Bold, ArrowUp, ArrowDown, Sparkles, 
    Check, Edit3, EyeOff, RotateCcw, HelpCircle
} from 'lucide-react'

// ============================================================
// MODULE-LEVEL stable storage: completely bypasses React's
// rendering cycle, so the selected cell is never lost on re-render
// ============================================================
let _activeCell: HTMLElement | null = null
let _activeRow: HTMLElement | null = null

function getActiveCell() { return _activeCell }
function getActiveRow() { return _activeRow }

function setActiveCell(cell: HTMLElement | null, row: HTMLElement | null) {
    // Clear old highlights
    if (_activeCell) _activeCell.classList.remove('active-editor-cell')
    if (_activeRow) _activeRow.classList.remove('active-editor-row')
    
    _activeCell = cell
    _activeRow = row
    
    // Apply new highlights
    if (_activeCell) _activeCell.classList.add('active-editor-cell')
    if (_activeRow) _activeRow.classList.add('active-editor-row')

    // Update status bar in the DOM directly (no React state)
    const dbgEl = document.getElementById('editor-debug-info')
    if (dbgEl) {
        if (cell) {
            const txt = cell.innerText.trim().substring(0, 60)
            const align = cell.style.textAlign || 'heredado'
            const weight = cell.style.fontWeight || 'heredado'
            const size = cell.style.fontSize || 'heredado'
            dbgEl.innerHTML = `<span style="color:#3b82f6;font-weight:700">Celda activa:</span> "${txt}" 
                | <span style="color:#3b82f6;font-weight:700">Alineación:</span> ${align}
                | <span style="color:#3b82f6;font-weight:700">Negrita:</span> ${weight}
                | <span style="color:#3b82f6;font-weight:700">Tamaño:</span> ${size}`
        } else {
            dbgEl.innerHTML = '<span style="color:#71717a">Ninguna celda seleccionada. Haz clic en una celda del reporte para editarla.</span>'
        }
    }

    // Enable/disable toolbar buttons based on selection
    document.querySelectorAll('.cell-ctrl-btn').forEach((btn: any) => {
        if (cell) {
            btn.removeAttribute('data-disabled')
            btn.style.opacity = '1'
            btn.style.pointerEvents = 'auto'
        } else {
            btn.setAttribute('data-disabled', 'true')
            btn.style.opacity = '0.3'
            btn.style.pointerEvents = 'none'
        }
    })
    document.querySelectorAll('.row-ctrl-btn').forEach((btn: any) => {
        if (row) {
            btn.removeAttribute('data-disabled')
            btn.style.opacity = '1'
            btn.style.pointerEvents = 'auto'
        } else {
            btn.setAttribute('data-disabled', 'true')
            btn.style.opacity = '0.3'
            btn.style.pointerEvents = 'none'
        }
    })
}

// ============================================================
// Apply a CSS property recursively to a cell and all children
// ============================================================
function applyStyleRecursive(el: HTMLElement, prop: string, value: string) {
    el.style.setProperty(prop, value, 'important')
    el.querySelectorAll<HTMLElement>('*').forEach(child => {
        child.style.setProperty(prop, value, 'important')
    })
}

// ============================================================
// Interfaces
// ============================================================
interface HtmlReportJson {
    idCotizacion: number;
    html: string;
    isCustomized?: boolean;
}

interface ParsedReport {
    idCotizacion: number;
    bodyHtml: string;    // raw inner HTML (without .report-body-wrapper wrapper)
    footerHtml: string;  // raw inner HTML (without .report-footer-wrapper wrapper)
    isCustomized: boolean;
}

// ============================================================
// HTML splitter (first load, non-customized)
// ============================================================
function splitReportHtml(html: string) {
    if (typeof window === 'undefined') return { bodyHtml: html, footerHtml: '' }

    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const originalTable = doc.querySelector('.excel-table')
        if (!originalTable) return { bodyHtml: html, footerHtml: '' }

        const colgroup = originalTable.querySelector('colgroup')?.outerHTML || ''
        const rows = Array.from(originalTable.querySelectorAll('tbody tr'))

        let productHeaderIdx = -1
        let rentabilidadHeaderIdx = -1

        rows.forEach((row, idx) => {
            const cleanedText = (row.textContent || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            if (productHeaderIdx === -1 && cleanedText.includes('PROVEEDOR') && cleanedText.includes('DETALLE')) {
                productHeaderIdx = idx
            }
            if (rentabilidadHeaderIdx === -1 && (cleanedText.includes('RENTABILIDAD NEGOCIO') || cleanedText.includes('RENTABILIDAD'))) {
                rentabilidadHeaderIdx = idx
            }
        })

        if (productHeaderIdx === -1 && rentabilidadHeaderIdx === -1) return { bodyHtml: html, footerHtml: '' }

        const cabeceraRows: string[] = []
        const productosRows: string[] = []
        const rentabilidadRows: string[] = []

        rows.forEach((row, idx) => {
            const rowText = (row.textContent || '').trim()
            if (rentabilidadHeaderIdx !== -1 && idx >= rentabilidadHeaderIdx) {
                if (rowText === '' && idx > rentabilidadHeaderIdx) return
                rentabilidadRows.push(row.outerHTML)
            } else if (productHeaderIdx !== -1 && idx >= productHeaderIdx) {
                if (rowText === '' && idx > productHeaderIdx) return
                productosRows.push(row.outerHTML)
            } else {
                cabeceraRows.push(row.outerHTML)
            }
        })

        const bodyHtml = `
            <div class="report-header-section">
                <table class="excel-table table-cabecera border-collapse table-auto mb-4" style="font-family:Arial,sans-serif;border-spacing:0;border-collapse:collapse;width:fit-content;max-width:100%">
                    <tbody>${cabeceraRows.join('')}</tbody>
                </table>
            </div>
            <div class="report-products-section">
                <table class="excel-table table-productos border-collapse table-fixed w-full" style="font-family:Arial,sans-serif;border-spacing:0;border-collapse:collapse">
                    ${colgroup}<tbody>${productosRows.join('')}</tbody>
                </table>
            </div>`

        const footerHtml = rentabilidadRows.length > 0 ? `
            <table class="excel-table table-rentabilidad border-collapse table-fixed w-full" style="font-family:Arial,sans-serif;border-spacing:0;border-collapse:collapse">
                ${colgroup}<tbody>${rentabilidadRows.join('')}</tbody>
            </table>` : ''

        return { bodyHtml, footerHtml }
    } catch (e) {
        console.error('Error splitting report table:', e)
        return { bodyHtml: html, footerHtml: '' }
    }
}

// ============================================================
// Main component
// ============================================================
function PrintQuotationsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const idIni = searchParams.get('idIni')
    const idFin = searchParams.get('idFin')
    const formatId = searchParams.get('formatId')

    const [parsedReports, setParsedReports] = useState<ParsedReport[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [resetCounter, setResetCounter] = useState(0)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showHelp, setShowHelp] = useState(true)
    const [globalFont, setGlobalFont] = useState('Arial')

    // Load reports
    useEffect(() => {
        if (!idIni || !idFin) { setError('Faltan parámetros'); setLoading(false); return }

        setLoading(true)
        // Clean up global selection state when reloading
        setActiveCell(null, null)

        fetch(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}&format=html${formatId ? `&formatId=${formatId}` : ''}`)
            .then(res => { if (!res.ok) throw new Error('Error fetching report data'); return res.json() })
            .then((json: HtmlReportJson[]) => {
                const parsed = json.map(r => {
                    if (r.isCustomized) {
                        // Customized: r.html is the raw inner HTML (previously saved without outer wrapper)
                        // OR might be wrapped. Let's strip outer .report-body-wrapper if present.
                        let bodyHtml = r.html
                        let footerHtml = ''
                        try {
                            const p = new DOMParser()
                            const d = p.parseFromString(r.html, 'text/html')
                            const bw = d.querySelector('.report-body-wrapper')
                            const fw = d.querySelector('.report-footer-wrapper')
                            if (bw) bodyHtml = bw.innerHTML
                            if (fw) footerHtml = fw.innerHTML
                            // If no wrappers found, use as-is
                            if (!bw && !fw) { bodyHtml = r.html; footerHtml = '' }
                        } catch(e) {}
                        return { idCotizacion: r.idCotizacion, bodyHtml, footerHtml, isCustomized: true }
                    } else {
                        const { bodyHtml, footerHtml } = splitReportHtml(r.html)
                        return { idCotizacion: r.idCotizacion, bodyHtml, footerHtml, isCustomized: false }
                    }
                })
                setParsedReports(parsed)
                setLoading(false)
                setIsEditing(false)
            })
            .catch(err => { setError(err.message); setLoading(false) })
    }, [idIni, idFin, formatId, resetCounter])

    // Attach/detach cell listeners based on editing mode
    useEffect(() => {
        if (loading || parsedReports.length === 0) return

        const tables = document.querySelectorAll('.excel-table')

        const onCellClick = (e: Event) => {
            const cell = e.currentTarget as HTMLTableCellElement
            setActiveCell(cell, (cell.closest('tr') as HTMLElement | null))
        }

        tables.forEach(table => {
            table.querySelectorAll('td').forEach(cell => {
                if (isEditing) {
                    cell.setAttribute('contenteditable', 'true')
                    cell.addEventListener('click', onCellClick)
                } else {
                    cell.removeAttribute('contenteditable')
                    cell.removeEventListener('click', onCellClick)
                }
            })
        })

        if (!isEditing) setActiveCell(null, null)

        return () => {
            tables.forEach(table => {
                table.querySelectorAll('td').forEach(cell => {
                    cell.removeEventListener('click', onCellClick)
                })
            })
        }
    }, [isEditing, loading, parsedReports])

    // ── Toolbar action handlers ───────────────────────────────
    // All use onMouseDown + e.preventDefault() to prevent focus loss from the cell

    const handleToggleBold = (e: React.MouseEvent) => {
        e.preventDefault()
        const cell = getActiveCell()
        if (!cell) return
        const isBold = window.getComputedStyle(cell).fontWeight === '700' || cell.style.fontWeight === 'bold'
        applyStyleRecursive(cell, 'font-weight', isBold ? 'normal' : 'bold')
        setActiveCell(cell, getActiveRow())  // refresh status bar
    }

    const handleAlign = (e: React.MouseEvent, align: string) => {
        e.preventDefault()
        const cell = getActiveCell()
        if (!cell) return
        applyStyleRecursive(cell, 'text-align', align)
        setActiveCell(cell, getActiveRow())  // refresh status bar
    }

    const handleFontSize = (e: React.MouseEvent, delta: number) => {
        e.preventDefault()
        const cell = getActiveCell()
        if (!cell) return
        const current = parseFloat(window.getComputedStyle(cell).fontSize) || 12
        applyStyleRecursive(cell, 'font-size', `${current + delta}px`)
        setActiveCell(cell, getActiveRow())  // refresh status bar
    }

    const handleMoveRow = (e: React.MouseEvent, dir: 'up' | 'down') => {
        e.preventDefault()
        const row = getActiveRow()
        if (!row || !row.parentNode) return
        if (dir === 'up' && row.previousElementSibling) {
            row.parentNode.insertBefore(row, row.previousElementSibling)
        } else if (dir === 'down' && row.nextElementSibling) {
            row.parentNode.insertBefore(row.nextElementSibling, row)
        }
    }

    const handleHideRow = (e: React.MouseEvent) => {
        e.preventDefault()
        const row = getActiveRow()
        if (!row) return
        if (confirm('¿Ocultar esta fila del reporte?')) {
            row.style.display = 'none'
            setActiveCell(null, null)
        }
    }

    const handleFontChange = (font: string) => {
        setGlobalFont(font)
        document.querySelectorAll('.excel-table').forEach((t: any) => {
            applyStyleRecursive(t, 'font-family', `${font}, Arial, sans-serif`)
        })
    }

    // ── Save changes ─────────────────────────────────────────
    const handleSaveChanges = async () => {
        setSaving(true)
        try {
            for (const report of parsedReports) {
                const container = document.getElementById(`report-container-${report.idCotizacion}`)
                if (!container) continue

                const bodyEl = container.querySelector('.report-body-wrapper')
                const footerEl = container.querySelector('.report-footer-wrapper')
                if (!bodyEl) continue

                // Clone and clean up editor artifacts
                const bodyClone = bodyEl.cloneNode(true) as HTMLElement
                const footerClone = footerEl ? (footerEl.cloneNode(true) as HTMLElement) : null

                ;[bodyClone, footerClone].forEach(node => {
                    if (!node) return
                    node.querySelectorAll('td').forEach((td: any) => {
                        td.removeAttribute('contenteditable')
                        td.classList.remove('active-editor-cell')
                    })
                    node.querySelectorAll('tr').forEach((tr: any) => tr.classList.remove('active-editor-row'))
                })

                // Save INNER html only (no wrapper divs) — prevents double-nesting on re-load
                const savedHtml =
                    `<div class="report-body-wrapper">${bodyClone.innerHTML}</div>` +
                    (footerClone ? `<div class="report-footer-wrapper">${footerClone.innerHTML}</div>` : '')

                const res = await fetch('/api/quotations/print-customization', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quotationId: report.idCotizacion, html: savedHtml })
                })
                if (!res.ok) throw new Error((await res.json()).message || 'Error al guardar')
            }
            alert('¡Diseño guardado correctamente! Los cambios son permanentes.')
            setIsEditing(false)
        } catch (err: any) {
            alert('Error al guardar: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleExportExcel = () => {
        if (!idIni || !idFin) return
        window.open(`/api/reports/cotizaciones/export-excel?idIni=${idIni}&idFin=${idFin}${formatId ? `&formatId=${formatId}` : ''}`, '_blank')
    }

    const handleVolver = () => {
        try { window.close() } catch { router.back() }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Cargando reporte...</div>
    if (error)   return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Error: {error}</div>
    if (parsedReports.length === 0) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Sin datos.</div>

    return (
        <div className="min-h-screen bg-zinc-100 p-8 print:p-0 print:bg-white text-black">
            <style dangerouslySetInnerHTML={{ __html: `
                .excel-table { font-family: ${globalFont}, Arial, sans-serif !important; user-select: text !important; -webkit-user-select: text !important; }
                .excel-table * { user-select: text !important; -webkit-user-select: text !important; }
                .break-after-page { position: relative !important; min-height: 800px !important; padding-bottom: 200px !important; }
                .report-footer-wrapper { position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; }
                @media screen {
                    .active-editor-cell { outline: 2px solid #3b82f6 !important; background: rgba(59,130,246,0.07) !important; }
                    [contenteditable="true"]:hover { outline: 1px dashed #3b82f6 !important; cursor: text; }
                    [contenteditable="true"]:focus { outline: 2px solid #2563eb !important; background: rgba(37,99,235,0.05) !important; }
                }
                @media print {
                    body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { size: letter portrait; margin: 10mm 12mm; }
                    .excel-table { zoom: 69%; border-collapse: collapse !important; }
                    .break-after-page { width:100% !important; height:259.4mm !important; min-height:259.4mm !important; position:relative !important; padding-bottom:45mm !important; overflow:hidden !important; }
                    .break-after-page:not(:last-child) { page-break-after: always !important; }
                    .break-after-page:last-child { page-break-after: avoid !important; }
                }
            `}} />

            <div className="max-w-[1200px] mx-auto bg-white p-8 rounded-xl shadow-xl print:shadow-none print:p-0">

                {/* ── Toolbar ── */}
                <div className="flex flex-col gap-4 mb-8 print:hidden bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-sm">

                    {/* Top row */}
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <button onClick={handleVolver} className="text-zinc-500 hover:text-black font-bold flex items-center gap-2 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </button>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button onClick={() => setIsEditing(v => !v)}
                                className={`px-5 h-11 rounded-xl font-bold flex items-center gap-2 transition-all ${isEditing ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}>
                                <Edit3 className="w-4 h-4" />
                                {isEditing ? 'Desactivar Editor' : 'Activar Diseñador / Editor'}
                            </button>
                            {isEditing && (
                                <button onClick={handleSaveChanges} disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 h-11 rounded-xl font-black flex items-center gap-2 text-sm disabled:opacity-50">
                                    <Check className="w-4 h-4" />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            )}
                            <button onClick={handleExportExcel}
                                className="bg-zinc-700 text-white px-5 h-11 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 text-sm">
                                <FileSpreadsheet className="w-4 h-4" /> Descargar EXCEL
                            </button>
                            <button onClick={() => window.print()}
                                className="bg-blue-600 text-white px-5 h-11 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 text-sm">
                                <Printer className="w-4 h-4" /> Imprimir / PDF
                            </button>
                        </div>
                    </div>

                    {/* Editor toolbar */}
                    {isEditing && (
                        <div className="border-t border-zinc-200 pt-4 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-4">

                                {/* Font selector */}
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    <select value={globalFont} onChange={e => handleFontChange(e.target.value)}
                                        className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="system-ui">Sistema</option>
                                    </select>
                                </div>

                                {/* Cell controls — use onMouseDown + preventDefault so cell never loses focus */}
                                <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Celda:</span>

                                    <button className="cell-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Negrita" onMouseDown={handleToggleBold}>
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-300 mx-0.5" />
                                    <button className="cell-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Izquierda" onMouseDown={e => handleAlign(e, 'left')}>
                                        <AlignLeft className="w-4 h-4" />
                                    </button>
                                    <button className="cell-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Centro" onMouseDown={e => handleAlign(e, 'center')}>
                                        <AlignCenter className="w-4 h-4" />
                                    </button>
                                    <button className="cell-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Derecha" onMouseDown={e => handleAlign(e, 'right')}>
                                        <AlignRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-300 mx-0.5" />
                                    <button className="cell-ctrl-btn px-2 py-1 rounded-lg text-xs font-bold hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Aumentar letra" onMouseDown={e => handleFontSize(e, 1)}>A+</button>
                                    <button className="cell-ctrl-btn px-2 py-1 rounded-lg text-xs font-bold hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Reducir letra" onMouseDown={e => handleFontSize(e, -1)}>A-</button>
                                </div>

                                {/* Row controls */}
                                <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Fila:</span>
                                    <button className="row-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Subir fila" onMouseDown={e => handleMoveRow(e, 'up')}>
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button className="row-ctrl-btn p-2 rounded-lg hover:bg-zinc-200 text-zinc-800 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Bajar fila" onMouseDown={e => handleMoveRow(e, 'down')}>
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button className="row-ctrl-btn p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all" style={{opacity:0.3,pointerEvents:'none'}}
                                        title="Ocultar fila" onMouseDown={handleHideRow}>
                                        <EyeOff className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Reset */}
                                <button onClick={() => {
                                    if (confirm('¿Restaurar el reporte a su estado original? Se perderán los cambios no guardados.'))
                                        setResetCounter(c => c + 1)
                                }} className="flex items-center gap-1 px-3 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                                </button>
                            </div>

                            {/* Status bar — updated directly in DOM, no React state */}
                            <div id="editor-debug-info"
                                className="bg-zinc-100 border border-zinc-200 p-2.5 rounded-xl text-xs text-zinc-500">
                                Ninguna celda seleccionada. Haz clic en una celda del reporte para editarla.
                            </div>
                        </div>
                    )}

                    {/* Quick help */}
                    {isEditing && showHelp && (
                        <div className="bg-blue-50 text-blue-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border border-blue-100">
                            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <b>Guía rápida:</b>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 text-zinc-600">
                                    <li>Haz clic en cualquier celda para seleccionarla (borde azul) y escribir en ella.</li>
                                    <li>Una vez seleccionada, usa los botones de la barra para cambiar alineación, tamaño de letra, negrita o mover la fila.</li>
                                    <li>Cuando termines, pulsa <b>"Guardar Cambios"</b> para que el diseño quede permanente.</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowHelp(false)} className="text-blue-500 hover:text-blue-700 font-bold text-xs">Entendido</button>
                        </div>
                    )}
                </div>

                {/* ── Report Area ── */}
                <div className="space-y-16 print:space-y-0">
                    {parsedReports.map(report => (
                        <div key={report.idCotizacion}
                            id={`report-container-${report.idCotizacion}`}
                            className="bg-white text-black p-8 border border-zinc-200 rounded-2xl print:border-none print:p-0 print:m-0 break-after-page overflow-x-auto relative">
                            <p className="text-xs font-bold text-zinc-400 mb-4 print:hidden">Cotización #{report.idCotizacion}</p>
                            <div className="report-body-wrapper" dangerouslySetInnerHTML={{ __html: report.bodyHtml }} />
                            {report.footerHtml && (
                                <div className="report-footer-wrapper" dangerouslySetInnerHTML={{ __html: report.footerHtml }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function PrintQuotationsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Cargando...</div>}>
            <PrintQuotationsContent />
        </Suspense>
    )
}
