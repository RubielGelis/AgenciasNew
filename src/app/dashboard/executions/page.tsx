'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Play,
    Database,
    Plus,
    RefreshCw,
    Download,
    Search,
    ChevronDown,
    ChevronUp,
    Filter,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Edit2,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    SlidersHorizontal,
    MoveLeft,
    MoveRight,
    Calculator,
    Table as TableIcon,
    CheckSquare,
    Square,
    Bookmark,
    Save,
    Sparkles
} from 'lucide-react'

interface ProcedureParam {
    name: string
    label: string
    type: 'text' | 'date' | 'select' | 'number'
    lookupType?: string
    section?: string
    placeholder?: string
    defaultValue?: string
    options?: { label: string; value: string }[]
    required?: boolean
}

interface Procedure {
    id: number
    name: string
    spName: string
    description?: string
    parameters: ProcedureParam[]
}

interface ExecutionPreset {
    id: number
    name: string
    procedureId: number
    description?: string
    filterValues?: Record<string, string>
    filterConfig?: { order?: string[]; hidden?: string[] }
    columnConfigs?: ColumnConfig[]
    selectedTotals?: string[]
}

interface LookupItem {
    code: string
    name: string
}

interface ColumnConfig {
    originalKey: string
    customLabel: string
    visible: boolean
}

export default function ExecutionsPage() {
    const [procedures, setProcedures] = useState<Procedure[]>([])
    const [selectedProc, setSelectedProc] = useState<Procedure | null>(null)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    
    // Presets / Saved Executions state
    const [presets, setPresets] = useState<ExecutionPreset[]>([])
    const [selectedPresetId, setSelectedPresetId] = useState<string>('')
    const [showSavePresetModal, setShowSavePresetModal] = useState(false)
    const [presetNameInput, setPresetNameInput] = useState('')
    const [presetDescInput, setPresetDescInput] = useState('')
    const [savingPreset, setSavingPreset] = useState(false)

    // Filter Ordering & Visibility state
    const [orderedParams, setOrderedParams] = useState<ProcedureParam[]>([])
    const [hiddenParamNames, setHiddenParamNames] = useState<Set<string>>(new Set())
    const [showFilterConfig, setShowFilterConfig] = useState(false)

    // UI state
    const [loadingProcs, setLoadingProcs] = useState(true)
    const [executing, setExecuting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [toastMsg, setToastMsg] = useState<string | null>(null)

    // Results state
    const [results, setResults] = useState<any[] | null>(null)
    const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([])
    const [showColConfigModal, setShowColConfigModal] = useState(false)
    const [resultTab, setResultTab] = useState<'data' | 'totals'>('data')
    const [selectedTotals, setSelectedTotals] = useState<Set<string>>(new Set())

    const [executionTime, setExecutionTime] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [exportDelimiter, setExportDelimiter] = useState<',' | ';' | '\t'>(',')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    // Lookup Modal State (Lupa 🔍)
    const [showLookupModal, setShowLookupModal] = useState(false)
    const [lookupTargetParam, setLookupTargetParam] = useState<ProcedureParam | null>(null)
    const [lookupData, setLookupData] = useState<LookupItem[]>([])
    const [loadingLookup, setLoadingLookup] = useState(false)
    const [lookupSearch, setLookupSearch] = useState('')
    const [selectedLookupCodes, setSelectedLookupCodes] = useState<Set<string>>(new Set())

    // Modal state for creating/editing SPs
    const [showProcModal, setShowProcModal] = useState(false)
    const [detectingParams, setDetectingParams] = useState(false)
    const [modalProc, setModalProc] = useState<{
        id?: number
        name: string
        spName: string
        description: string
        parametersJson: string
    }>({
        name: '',
        spName: '',
        description: '',
        parametersJson: '[]'
    })

    // Fetch procedures on mount
    useEffect(() => {
        loadProcedures()
    }, [])

    const loadProcedures = async () => {
        setLoadingProcs(true)
        try {
            const res = await fetch('/api/executions/procedures')
            if (!res.ok) throw new Error('Error al cargar procedimientos')
            const data: Procedure[] = await res.json()
            setProcedures(data)
            
            if (data.length > 0) {
                selectProcedure(data[0])
            } else {
                setSelectedProc(null)
            }
        } catch (err: any) {
            console.error('Error:', err)
            setErrorMsg('No se pudieron cargar los procedimientos almacenados.')
        } finally {
            setLoadingProcs(false)
        }
    }

    const loadPresetsForProcedure = async (procedureId: number) => {
        try {
            const res = await fetch(`/api/executions/presets?procedureId=${procedureId}`)
            if (res.ok) {
                const data: ExecutionPreset[] = await res.json()
                setPresets(data)
            }
        } catch (e) {
            console.error('Error al cargar plantillas:', e)
        }
    }

    const selectProcedure = (proc: Procedure) => {
        setSelectedProc(proc)
        setErrorMsg(null)
        setResults(null)
        setColumnConfigs([])
        setSelectedTotals(new Set())
        setResultTab('data')
        setSelectedPresetId('')

        const params = proc.parameters || []
        
        // Restore custom order & visibility from localStorage if exists
        const savedConfigKey = `ejecuciones_filter_config_${proc.id}`
        const savedConfig = typeof window !== 'undefined' ? localStorage.getItem(savedConfigKey) : null
        
        let initialOrdered: ProcedureParam[] = [...params]
        let initialHidden = new Set<string>()

        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig)
                if (Array.isArray(parsed.order)) {
                    const paramMap = new Map(params.map((p) => [p.name, p]))
                    const reordered: ProcedureParam[] = []
                    parsed.order.forEach((name: string) => {
                        if (paramMap.has(name)) {
                            reordered.push(paramMap.get(name)!)
                            paramMap.delete(name)
                        }
                    })
                    // Add any remaining params
                    paramMap.forEach((p) => reordered.push(p))
                    initialOrdered = reordered
                }
                if (Array.isArray(parsed.hidden)) {
                    initialHidden = new Set(parsed.hidden)
                }
            } catch (e) {
                console.error('Error loading filter config:', e)
            }
        }

        setOrderedParams(initialOrdered)
        setHiddenParamNames(initialHidden)

        // Initialize default parameter values
        const initialVals: Record<string, string> = {}
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const firstDayStr = `${year}-${month}-01`
        const todayStr = `${year}-${month}-${day}`

        params.forEach((p) => {
            let def = p.defaultValue || ''
            if (def === 'FIRST_DAY_OF_MONTH') def = firstDayStr
            if (def === 'TODAY') def = todayStr
            initialVals[p.name] = def
        })
        
        setFilterValues(initialVals)
        loadPresetsForProcedure(proc.id)
    }

    // Delete Registered Stored Procedure
    const handleDeleteProcedure = async (procId: number, procName: string) => {
        if (!confirm(`¿Está seguro de que desea eliminar el Stored Procedure "${procName}"?`)) return

        try {
            const res = await fetch(`/api/executions/procedures?id=${procId}`, { method: 'DELETE' })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Error al eliminar el procedimiento')
            }

            setToastMsg(`Procedimiento "${procName}" eliminado con éxito.`)
            setTimeout(() => setToastMsg(null), 3000)
            await loadProcedures()
        } catch (err: any) {
            alert(err.message)
        }
    }

    // Auto-detect parameters from SQL Server sys.parameters
    const handleDetectParams = async () => {
        if (!modalProc.spName.trim()) {
            alert('Ingrese primero el nombre del Stored Procedure en SQL Server.')
            return
        }

        setDetectingParams(true)
        try {
            const url = `/api/executions/detect-params?spName=${encodeURIComponent(modalProc.spName.trim())}`
            const res = await fetch(url)
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.message || 'No se pudieron detectar los parámetros en SQL Server.')
            }

            setModalProc((prev) => ({
                ...prev,
                parametersJson: JSON.stringify(json.parameters, null, 2)
            }))

            alert(`¡Éxito! Se detectaron ${json.count} parámetros en SQL Server para "${json.spName}".`)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setDetectingParams(false)
        }
    }

    // Apply a Saved Preset
    const applyPreset = (preset: ExecutionPreset) => {
        if (!selectedProc) return
        setSelectedPresetId(preset.id.toString())

        // 1. Restore Filter Values
        if (preset.filterValues && typeof preset.filterValues === 'object') {
            setFilterValues(preset.filterValues)
        }

        // 2. Restore Filter Layout & Visibility
        if (preset.filterConfig) {
            const params = selectedProc.parameters || []
            const orderList = preset.filterConfig.order || []
            const hiddenList = preset.filterConfig.hidden || []

            if (Array.isArray(orderList) && orderList.length > 0) {
                const paramMap = new Map(params.map((p) => [p.name, p]))
                const reordered: ProcedureParam[] = []
                orderList.forEach((name: string) => {
                    if (paramMap.has(name)) {
                        reordered.push(paramMap.get(name)!)
                        paramMap.delete(name)
                    }
                })
                paramMap.forEach((p) => reordered.push(p))
                setOrderedParams(reordered)
            }

            if (Array.isArray(hiddenList)) {
                setHiddenParamNames(new Set(hiddenList))
            }
        }

        // 3. Restore Column Configs if present
        if (Array.isArray(preset.columnConfigs) && preset.columnConfigs.length > 0) {
            setColumnConfigs(preset.columnConfigs)
        }

        // 4. Restore Selected Totals if present
        if (Array.isArray(preset.selectedTotals)) {
            setSelectedTotals(new Set(preset.selectedTotals))
        }

        setToastMsg(`Plantilla "${preset.name}" cargada con éxito.`)
        setTimeout(() => setToastMsg(null), 3000)
    }

    // Save Current Execution Preset to Database
    const handleSavePreset = async () => {
        if (!selectedProc || !presetNameInput.trim()) return

        setSavingPreset(true)
        try {
            const res = await fetch('/api/executions/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: presetNameInput.trim(),
                    procedureId: selectedProc.id,
                    description: presetDescInput.trim(),
                    filterValues,
                    filterConfig: {
                        order: orderedParams.map((p) => p.name),
                        hidden: Array.from(hiddenParamNames)
                    },
                    columnConfigs,
                    selectedTotals: Array.from(selectedTotals)
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Error al guardar la plantilla.')
            }

            const saved = await res.json()
            setShowSavePresetModal(false)
            setPresetNameInput('')
            setPresetDescInput('')
            
            await loadPresetsForProcedure(selectedProc.id)
            setSelectedPresetId(saved.id.toString())
            setToastMsg(`¡Plantilla "${saved.name}" guardada con éxito!`)
            setTimeout(() => setToastMsg(null), 4000)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSavingPreset(false)
        }
    }

    // Delete a Saved Preset
    const handleDeletePreset = async (presetId: number) => {
        if (!confirm('¿Desea eliminar esta plantilla de ejecución guardada?')) return
        try {
            const res = await fetch(`/api/executions/presets?id=${presetId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Error al eliminar la plantilla.')
            
            if (selectedProc) {
                await loadPresetsForProcedure(selectedProc.id)
            }
            setSelectedPresetId('')
        } catch (err: any) {
            alert(err.message)
        }
    }

    // Save Filter Order and Visibility to localStorage
    const saveFilterLayout = (newOrdered: ProcedureParam[], newHidden: Set<string>) => {
        if (!selectedProc) return
        const savedConfigKey = `ejecuciones_filter_config_${selectedProc.id}`
        localStorage.setItem(
            savedConfigKey,
            JSON.stringify({
                order: newOrdered.map((p) => p.name),
                hidden: Array.from(newHidden)
            })
        )
    }

    const moveFilterUp = (index: number) => {
        if (index <= 0) return
        const newOrdered = [...orderedParams]
        const temp = newOrdered[index - 1]
        newOrdered[index - 1] = newOrdered[index]
        newOrdered[index] = temp
        setOrderedParams(newOrdered)
        saveFilterLayout(newOrdered, hiddenParamNames)
    }

    const moveFilterDown = (index: number) => {
        if (index >= orderedParams.length - 1) return
        const newOrdered = [...orderedParams]
        const temp = newOrdered[index + 1]
        newOrdered[index + 1] = newOrdered[index]
        newOrdered[index] = temp
        setOrderedParams(newOrdered)
        saveFilterLayout(newOrdered, hiddenParamNames)
    }

    const toggleFilterVisibility = (paramName: string) => {
        const newHidden = new Set(hiddenParamNames)
        if (newHidden.has(paramName)) {
            newHidden.delete(paramName)
        } else {
            newHidden.add(paramName)
        }
        setHiddenParamNames(newHidden)
        saveFilterLayout(orderedParams, newHidden)
    }

    const handleFilterChange = (name: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [name]: value }))
    }

    const handleResetFilters = () => {
        if (!selectedProc) return
        selectProcedure(selectedProc)
    }

    // Open Lookup Modal (Lupa 🔍)
    const openLookupModal = async (param: ProcedureParam) => {
        if (!param.lookupType) return
        setLookupTargetParam(param)
        setLookupSearch('')
        setShowLookupModal(true)
        
        // Parse currently selected comma-separated values
        const currentVal = filterValues[param.name] || ''
        const existingCodes = currentVal
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        setSelectedLookupCodes(new Set(existingCodes))

        await fetchLookupItems(param.lookupType, '')
    }

    const fetchLookupItems = async (type: string, search: string) => {
        setLoadingLookup(true)
        try {
            const url = `/api/executions/lookup?type=${encodeURIComponent(type)}&search=${encodeURIComponent(search)}`
            const res = await fetch(url)
            if (!res.ok) throw new Error('Error al obtener datos de la tabla')
            const items: LookupItem[] = await res.json()
            setLookupData(items)
        } catch (err: any) {
            console.error('Error lookup:', err)
            setLookupData([])
        } finally {
            setLoadingLookup(false)
        }
    }

    const handleLookupSearchChange = (val: string) => {
        setLookupSearch(val)
        if (lookupTargetParam?.lookupType) {
            fetchLookupItems(lookupTargetParam.lookupType, val)
        }
    }

    const toggleLookupCode = (code: string) => {
        const next = new Set(selectedLookupCodes)
        if (next.has(code)) {
            next.delete(code)
        } else {
            next.add(code)
        }
        setSelectedLookupCodes(next)
    }

    const selectAllLookupCodes = () => {
        const allCodes = new Set(lookupData.map((item) => item.code))
        setSelectedLookupCodes(allCodes)
    }

    const deselectAllLookupCodes = () => {
        setSelectedLookupCodes(new Set())
    }

    const applyLookupSelection = () => {
        if (!lookupTargetParam) return
        const joined = Array.from(selectedLookupCodes).join(',')
        handleFilterChange(lookupTargetParam.name, joined)
        setShowLookupModal(false)
    }

    // Execute Stored Procedure
    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProc) return

        setExecuting(true)
        setErrorMsg(null)
        setSuccessMsg(null)
        setResults(null)

        try {
            const res = await fetch('/api/executions/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spName: selectedProc.spName,
                    parameters: filterValues
                })
            })

            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.message || json.detail || 'Error al ejecutar el Stored Procedure.')
            }

            const rawData = json.data || []
            const rawCols: string[] = json.columns || []

            setResults(rawData)
            setExecutionTime(json.elapsedTimeMs || 0)
            setCurrentPage(1)

            // Setup column configurations if not already loaded from preset
            if (columnConfigs.length === 0) {
                const initialColConfigs: ColumnConfig[] = rawCols.map((col) => ({
                    originalKey: col,
                    customLabel: col,
                    visible: true
                }))
                setColumnConfigs(initialColConfigs)
            }

            // Detect numeric columns for totalization if not set
            if (selectedTotals.size === 0) {
                const numericKeywords = ['tarifa', 'iva', 'total', 'otros', 'descuento', 'ventas', 'combustible', 'comision', 'saldo', 'valor']
                const autoNumericCols = new Set<string>()
                rawCols.forEach((col) => {
                    if (numericKeywords.some((kw) => col.toLowerCase().includes(kw))) {
                        autoNumericCols.add(col)
                    }
                })
                setSelectedTotals(autoNumericCols)
            }

            setSuccessMsg(`Se encontraron ${rawData.length} registros (${json.elapsedTimeMs} ms).`)
        } catch (err: any) {
            console.error('Execution Error:', err)
            setErrorMsg(err.message || 'Error de conexión con SQL Server.')
        } finally {
            setExecuting(false)
        }
    }

    // Visible & Ordered Columns
    const activeColumns = useMemo(() => {
        return columnConfigs.filter((c) => c.visible)
    }, [columnConfigs])

    // Move column left or right
    const moveColumn = (index: number, direction: 'left' | 'right') => {
        const newConfigs = [...columnConfigs]
        const targetIndex = direction === 'left' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newConfigs.length) return
        const temp = newConfigs[targetIndex]
        newConfigs[targetIndex] = newConfigs[index]
        newConfigs[index] = temp
        setColumnConfigs(newConfigs)
    }

    const handleColumnLabelChange = (originalKey: string, newLabel: string) => {
        setColumnConfigs((prev) =>
            prev.map((c) => (c.originalKey === originalKey ? { ...c, customLabel: newLabel } : c))
        )
    }

    const toggleColumnVisibility = (originalKey: string) => {
        setColumnConfigs((prev) =>
            prev.map((c) => (c.originalKey === originalKey ? { ...c, visible: !c.visible } : c))
        )
    }

    // Filter results by search term
    const filteredResults = useMemo(() => {
        if (!results) return []
        if (!searchTerm.trim()) return results

        const term = searchTerm.toLowerCase()
        return results.filter((row) =>
            Object.values(row).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term))
        )
    }, [results, searchTerm])

    // Paginated results
    const paginatedResults = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredResults.slice(start, start + pageSize)
    }, [filteredResults, currentPage, pageSize])

    const totalPages = Math.ceil(filteredResults.length / pageSize) || 1

    // Export Data (CSV / Excel TSV)
    const getFormattedExportData = (delimiter: string) => {
        if (!results || results.length === 0 || activeColumns.length === 0) return ''

        const headers = activeColumns.map((c) => `"${c.customLabel.replace(/"/g, '""')}"`).join(delimiter)
        const rows = filteredResults.map((row) =>
            activeColumns
                .map((col) => {
                    let val = row[col.originalKey]
                    if (val === null || val === undefined) return '""'
                    if (typeof val === 'object') val = JSON.stringify(val)
                    const str = String(val).replace(/"/g, '""')
                    return `"${str}"`
                })
                .join(delimiter)
        )

        return '\uFEFF' + [headers, ...rows].join('\n')
    }

    const handleExport = () => {
        const content = getFormattedExportData(exportDelimiter)
        if (!content) return

        const ext = exportDelimiter === '\t' ? 'xls' : 'csv'
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `${selectedProc?.name || 'reporte'}_${new Date().toISOString().slice(0, 10)}.${ext}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Copy to Clipboard (Format TSV for direct paste into Excel)
    const handleCopyToClipboard = () => {
        if (!results || results.length === 0 || activeColumns.length === 0) return

        const headers = activeColumns.map((c) => c.customLabel).join('\t')
        const rows = filteredResults.map((row) =>
            activeColumns
                .map((col) => {
                    let val = row[col.originalKey]
                    if (val === null || val === undefined) return ''
                    if (typeof val === 'object') return JSON.stringify(val)
                    return String(val).replace(/[\r\n\t]/g, ' ')
                })
                .join('\t')
        )

        const textContent = [headers, ...rows].join('\n')
        navigator.clipboard.writeText(textContent).then(() => {
            setToastMsg('¡Copiado al portapapeles! Abre Excel y presiona Ctrl + V.')
            setTimeout(() => setToastMsg(null), 4000)
        })
    }

    // Calculated Totals Summary
    const totalsSummary = useMemo(() => {
        if (!filteredResults || filteredResults.length === 0) return []

        return Array.from(selectedTotals).map((key) => {
            const colConfig = columnConfigs.find((c) => c.originalKey === key)
            const label = colConfig ? colConfig.customLabel : key

            let sum = 0
            let count = 0
            let min = Infinity
            let max = -Infinity

            filteredResults.forEach((r) => {
                const val = Number(r[key])
                if (!isNaN(val)) {
                    sum += val
                    count++
                    if (val < min) min = val
                    if (val > max) max = val
                }
            })

            const avg = count > 0 ? sum / count : 0

            return {
                key,
                label,
                sum,
                count,
                avg,
                min: min === Infinity ? 0 : min,
                max: max === -Infinity ? 0 : max
            }
        })
    }, [filteredResults, selectedTotals, columnConfigs])

    // Save Procedure Definition Modal
    const handleSaveProc = async () => {
        try {
            let parsedParams = []
            try {
                parsedParams = JSON.parse(modalProc.parametersJson)
            } catch (e) {
                alert('El JSON de parámetros no es válido.')
                return
            }

            const res = await fetch('/api/executions/procedures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: modalProc.id,
                    name: modalProc.name,
                    spName: modalProc.spName,
                    description: modalProc.description,
                    parameters: parsedParams
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Error al guardar el procedimiento')
            }

            setShowProcModal(false)
            await loadProcedures()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const openEditProcModal = (proc: Procedure) => {
        setModalProc({
            id: proc.id,
            name: proc.name,
            spName: proc.spName,
            description: proc.description || '',
            parametersJson: JSON.stringify(proc.parameters, null, 2)
        })
        setShowProcModal(true)
    }

    const openNewProcModal = () => {
        setModalProc({
            name: '',
            spName: 'dbo.[Zeus®spze_NombreDelProcedure]',
            description: '',
            parametersJson: JSON.stringify([], null, 2)
        })
        setShowProcModal(true)
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Play className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Módulo de Ejecuciones SQL Server
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Ejecuta Stored Procedures, guarda plantillas personalizadas y exporta directamente a Excel
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openNewProcModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-medium text-sm transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo SP</span>
                    </button>

                    <button
                        onClick={loadProcedures}
                        className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all cursor-pointer"
                        title="Recargar Procedimientos"
                    >
                        <RefreshCw className={`w-5 h-5 ${loadingProcs ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Procedure Selector & Saved Presets Bar */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
                    {/* SP Selector & Management Actions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Stored Procedure (SQL Server)
                            </label>
                            {selectedProc && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditProcModal(selectedProc)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Editar Definición</span>
                                    </button>
                                    <span className="text-zinc-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProcedure(selectedProc.id, selectedProc.name)}
                                        className="text-xs text-red-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                        title="Eliminar este Stored Procedure de la lista"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Quitar SP</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <select
                                value={selectedProc?.id || ''}
                                onChange={(e) => {
                                    const p = procedures.find((item) => item.id === Number(e.target.value))
                                    if (p) selectProcedure(p)
                                }}
                                className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                            >
                                {procedures.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.spName})
                                    </option>
                                ))}
                            </select>
                            <Database className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5 pointer-events-none" />
                            <ChevronDown className="w-5 h-5 text-zinc-400 absolute right-3 top-3.5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Saved Execution Presets Selector & Actions */}
                    {selectedProc && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Ejecuciones / Plantillas Guardadas</span>
                                <span className="text-[10px] text-zinc-400 font-mono">({presets.length} guardadas)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={selectedPresetId}
                                        onChange={(e) => {
                                            const id = e.target.value
                                            setSelectedPresetId(id)
                                            const found = presets.find((p) => p.id === Number(id))
                                            if (found) applyPreset(found)
                                        }}
                                        className="w-full pl-10 pr-10 py-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-zinc-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Cargar Plantilla Guardada... --</option>
                                        {presets.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                                ⭐ {preset.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Bookmark className="w-5 h-5 text-blue-500 absolute left-3 top-3.5 pointer-events-none" />
                                    <ChevronDown className="w-5 h-5 text-blue-400 absolute right-3 top-3.5 pointer-events-none" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPresetNameInput(`${selectedProc.name} - ${new Date().toLocaleDateString()}`)
                                        setPresetDescInput('')
                                        setShowSavePresetModal(true)
                                    }}
                                    className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
                                    title="Guardar filtros, orden y columnas con un nombre personalizado"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Guardar Ejecución</span>
                                </button>

                                {selectedPresetId && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePreset(Number(selectedPresetId))}
                                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer shrink-0"
                                        title="Eliminar plantilla guardada"
                                    >
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {selectedProc?.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <strong className="text-zinc-700 dark:text-zinc-300">Descripción del SP:</strong> {selectedProc.description}
                    </p>
                )}
            </div>

            {/* Notifications & Toast */}
            {toastMsg && (
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-between font-medium text-sm animate-bounce">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{toastMsg}</span>
                    </div>
                    <button onClick={() => setToastMsg(null)} className="p-1 hover:bg-blue-700 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="space-y-1 text-sm">
                        <span className="font-semibold">Error de Ejecución:</span>
                        <p className="whitespace-pre-wrap font-mono text-xs">{errorMsg}</p>
                    </div>
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                    {executionTime !== null && (
                        <span className="text-xs px-2.5 py-1 bg-emerald-500/20 rounded-full flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" /> {executionTime}ms
                        </span>
                    )}
                </div>
            )}

            {/* Single Screen Filters Container */}
            {selectedProc && (
                <form onSubmit={handleExecute} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden space-y-0">
                    {/* Header Controls for Filters */}
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                Filtros de la Consulta (Pantalla Única)
                            </h2>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                                ({orderedParams.length - hiddenParamNames.size} de {orderedParams.length} visibles)
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilterConfig(!showFilterConfig)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    showFilterConfig
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                                }`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>{showFilterConfig ? 'Cerrar Ajustes Filtros' : 'Organizar y Visibilidad'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Customization Panel (Show/Hide & Order Up/Down) */}
                    {showFilterConfig && (
                        <div className="p-4 bg-zinc-100/70 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
                            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Reordenar Ubicación y Visibilidad de Filtros
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                                {orderedParams.map((p, idx) => {
                                    const isHidden = hiddenParamNames.has(p.name)
                                    return (
                                        <div
                                            key={p.name}
                                            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                                                isHidden
                                                    ? 'bg-zinc-200/50 dark:bg-zinc-800/40 border-zinc-300 dark:border-zinc-700 opacity-60'
                                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFilterVisibility(p.name)}
                                                    className="text-zinc-500 hover:text-blue-600 transition-colors"
                                                    title={isHidden ? 'Mostrar filtro' : 'Ocultar filtro'}
                                                >
                                                    {isHidden ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                                                </button>
                                                <span className={`font-medium truncate ${isHidden ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                    {p.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => moveFilterUp(idx)}
                                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 disabled:opacity-30 cursor-pointer"
                                                    title="Subir posición"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === orderedParams.length - 1}
                                                    onClick={() => moveFilterDown(idx)}
                                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 disabled:opacity-30 cursor-pointer"
                                                    title="Bajar posición"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filter Inputs Grid (Single Screen Layout) */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {orderedParams.map((p) => {
                                if (hiddenParamNames.has(p.name)) return null

                                return (
                                    <div key={p.name} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                                            <span>{p.label}</span>
                                            <span className="text-[10px] text-zinc-400 font-mono">@{p.name}</span>
                                        </label>

                                        {p.type === 'select' ? (
                                            <select
                                                value={filterValues[p.name] ?? ''}
                                                onChange={(e) => handleFilterChange(p.name, e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                                            >
                                                {p.options?.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : p.type === 'date' ? (
                                            <input
                                                type="date"
                                                value={filterValues[p.name] ?? ''}
                                                onChange={(e) => handleFilterChange(p.name, e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <div className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    value={filterValues[p.name] ?? ''}
                                                    onChange={(e) => handleFilterChange(p.name, e.target.value)}
                                                    placeholder={p.placeholder || 'Ingrese valor...'}
                                                    className={`w-full py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                                        p.lookupType ? 'pl-3 pr-9' : 'px-3'
                                                    }`}
                                                />
                                                {p.lookupType && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openLookupModal(p)}
                                                        className="absolute right-1.5 p-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all cursor-pointer"
                                                        title={`Buscar en tabla ${p.lookupType} (Multicheck)`}
                                                    >
                                                        <Search className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                            Restablecer Valores
                        </button>

                        <button
                            type="submit"
                            disabled={executing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {executing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Ejecutando en SQL Server...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-white" />
                                    <span>Ejecutar Consulta</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Results Grid & Export Section */}
            {results !== null && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 p-6">
                    {/* Navigation Tabs (Datos vs Totalizados) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setResultTab('data')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    resultTab === 'data'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                                }`}
                            >
                                <TableIcon className="w-4 h-4" />
                                <span>Datos ({filteredResults.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setResultTab('totals')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    resultTab === 'totals'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                                }`}
                            >
                                <Calculator className="w-4 h-4" />
                                <span>Resumen de Totalizados ({totalsSummary.length})</span>
                            </button>
                        </div>

                        {/* Top Action Tools */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowColConfigModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                                <span>Personalizar Columnas</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyToClipboard}
                                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                title="Copiar filas en formato compatible con Excel"
                            >
                                <Copy className="w-4 h-4 text-emerald-400" />
                                <span>Copiar para Excel</span>
                            </button>

                            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                <select
                                    value={exportDelimiter}
                                    onChange={(e) => setExportDelimiter(e.target.value as any)}
                                    className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 border-none outline-none cursor-pointer"
                                >
                                    <option value=",">CSV (Coma ,)</option>
                                    <option value=";">CSV (Paso ;)</option>
                                    <option value="\t">Excel (TSV)</option>
                                </select>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Descargar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Tab View */}
                    {resultTab === 'data' && (
                        <div className="space-y-4">
                            {/* Search Filter */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        placeholder="Buscar en el resultado..."
                                        className="pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-72"
                                    />
                                </div>
                            </div>

                            {/* Data Table */}
                            {paginatedResults.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="p-3 border-b border-zinc-200 dark:border-zinc-700 text-center w-12 bg-zinc-100 dark:bg-zinc-800">
                                                        #
                                                    </th>
                                                    {activeColumns.map((col) => (
                                                        <th key={col.originalKey} className="p-3 border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap bg-zinc-100 dark:bg-zinc-800">
                                                            {col.customLabel}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 font-mono">
                                                {paginatedResults.map((row, idx) => {
                                                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                                                    return (
                                                        <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                                            <td className="p-3 text-center text-zinc-400 dark:text-zinc-500 font-sans font-medium border-r border-zinc-100 dark:border-zinc-800">
                                                                {rowNum}
                                                            </td>
                                                            {activeColumns.map((col) => {
                                                                const val = row[col.originalKey]
                                                                let display = val === null || val === undefined ? '' : String(val)
                                                                return (
                                                                    <td key={col.originalKey} className="p-3 whitespace-nowrap text-zinc-800 dark:text-zinc-200">
                                                                        {display}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <span>Filas por página:</span>
                                            <select
                                                value={pageSize}
                                                onChange={(e) => {
                                                    setPageSize(Number(e.target.value))
                                                    setCurrentPage(1)
                                                }}
                                                className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                            <span>
                                                Mostrando {(currentPage - 1) * pageSize + 1} a Math.min({currentPage * pageSize}, {filteredResults.length}) de {filteredResults.length}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-center">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-40 transition-all font-semibold cursor-pointer"
                                            >
                                                Anterior
                                            </button>
                                            <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-bold">
                                                Página {currentPage} de {totalPages}
                                            </span>
                                            <button
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-40 transition-all font-semibold cursor-pointer"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-zinc-400 space-y-2">
                                    <p className="text-sm font-medium">No se encontraron registros en el resultado.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dedicated Totals Summary Tab View */}
                    {resultTab === 'totals' && (
                        <div className="space-y-6 py-2">
                            {/* Column Selection for Totals */}
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                                <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-blue-500" />
                                    <span>Seleccionar Columnas a Totalizar</span>
                                </h3>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                                    {columnConfigs.map((col) => {
                                        const isChecked = selectedTotals.has(col.originalKey)
                                        return (
                                            <button
                                                key={col.originalKey}
                                                type="button"
                                                onClick={() => {
                                                    const next = new Set(selectedTotals)
                                                    if (next.has(col.originalKey)) {
                                                        next.delete(col.originalKey)
                                                    } else {
                                                        next.add(col.originalKey)
                                                    }
                                                    setSelectedTotals(next)
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                                    isChecked
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                                                }`}
                                            >
                                                {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                                <span>{col.customLabel}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Summary Cards */}
                            {totalsSummary.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {totalsSummary.map((item) => (
                                        <div key={item.key} className="p-5 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-3">
                                            <div className="border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">
                                                    {item.label}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-mono">@{item.key}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-xs text-zinc-500 font-medium">Suma Total</span>
                                                <div className="text-xl font-extrabold text-zinc-900 dark:text-white font-mono">
                                                    {item.sum.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-700/60 text-zinc-500 font-mono">
                                                <div>
                                                    <span className="text-[10px] text-zinc-400 block uppercase">Promedio</span>
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {item.avg.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-400 block uppercase">Registros</span>
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.count}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-400 block uppercase">Mínimo</span>
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {item.min.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-400 block uppercase">Máximo</span>
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {item.max.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-zinc-400 space-y-2">
                                    <Calculator className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                                    <p className="text-sm font-medium">Seleccione al menos una columna arriba para visualizar sus totalizados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Saving Execution Preset */}
            {showSavePresetModal && selectedProc && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-emerald-500" />
                                <span>Guardar Ejecución Personalizada</span>
                            </h3>
                            <button onClick={() => setShowSavePresetModal(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Nombre de la Plantilla / Ejecución
                                </label>
                                <input
                                    type="text"
                                    value={presetNameInput}
                                    onChange={(e) => setPresetNameInput(e.target.value)}
                                    placeholder="Ej: Ventas Sucursal 01 - Junio"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={presetDescInput}
                                    onChange={(e) => setPresetDescInput(e.target.value)}
                                    placeholder="Detalles de los filtros usados..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                                <p className="font-semibold">Se guardará:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Los valores de los filtros actuales.</li>
                                    <li>El orden y la visibilidad de los filtros.</li>
                                    <li>La configuración y los alias de columnas.</li>
                                    <li>Las columnas seleccionadas para totalizar.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowSavePresetModal(false)}
                                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={savingPreset || !presetNameInput.trim()}
                                onClick={handleSavePreset}
                                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                            >
                                {savingPreset ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Guardar Plantilla</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Lookup / Table Search (Lupa 🔍 con Multicheck) */}
            {showLookupModal && lookupTargetParam && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Search className="w-4 h-4 text-blue-600" />
                                    <span>Buscar en {lookupTargetParam.label}</span>
                                </h3>
                                <p className="text-xs text-zinc-500">Seleccione múltiples registros de la tabla (Multicheck)</p>
                            </div>
                            <button onClick={() => setShowLookupModal(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type="text"
                                value={lookupSearch}
                                onChange={(e) => handleLookupSearchChange(e.target.value)}
                                placeholder="Escriba para buscar código o nombre..."
                                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Actions: Select/Deselect All */}
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {selectedLookupCodes.size} seleccionados
                            </span>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={selectAllLookupCodes} className="hover:underline font-medium cursor-pointer">
                                    Seleccionar Todos
                                </button>
                                <button type="button" onClick={deselectAllLookupCodes} className="hover:underline font-medium text-red-500 cursor-pointer">
                                    Desmarcar Todos
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="max-h-72 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loadingLookup ? (
                                <div className="p-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Consultando tabla en SQL Server...</span>
                                </div>
                            ) : lookupData.length > 0 ? (
                                lookupData.map((item) => {
                                    const checked = selectedLookupCodes.has(item.code)
                                    return (
                                        <div
                                            key={item.code}
                                            onClick={() => toggleLookupCode(item.code)}
                                            className={`flex items-center gap-3 p-3 text-xs cursor-pointer transition-colors ${
                                                checked
                                                    ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {}} // handled by parent onClick
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="font-bold font-mono px-1.5 py-0.5 bg-zinc-200/60 dark:bg-zinc-700/60 rounded text-[11px]">
                                                {item.code}
                                            </span>
                                            <span className="font-medium truncate">{item.name}</span>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-8 text-center text-xs text-zinc-400">
                                    No se encontraron registros para la búsqueda.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowLookupModal(false)}
                                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={applyLookupSelection}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                            >
                                Aplicar Selección ({selectedLookupCodes.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Column Customization (Visibilidad, Renombrar, Reordenar ◀ ▶) */}
            {showColConfigModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                                <span>Personalizar Columnas del Resultado</span>
                            </h3>
                            <button onClick={() => setShowColConfigModal(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                            {columnConfigs.map((col, idx) => (
                                <div
                                    key={col.originalKey}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs gap-3 ${
                                        col.visible
                                            ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm'
                                            : 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => toggleColumnVisibility(col.originalKey)}
                                            className="text-zinc-500 hover:text-blue-600 cursor-pointer"
                                            title={col.visible ? 'Ocultar columna' : 'Mostrar columna'}
                                        >
                                            {col.visible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-400 truncate w-32 shrink-0">
                                            {col.originalKey}
                                        </span>
                                        <input
                                            type="text"
                                            value={col.customLabel}
                                            onChange={(e) => handleColumnLabelChange(col.originalKey, e.target.value)}
                                            placeholder="Nombre de la columna..."
                                            className="flex-1 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => moveColumn(idx, 'left')}
                                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-600 disabled:opacity-30 cursor-pointer"
                                            title="Mover hacia la izquierda"
                                        >
                                            <MoveLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === columnConfigs.length - 1}
                                            onClick={() => moveColumn(idx, 'right')}
                                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-600 disabled:opacity-30 cursor-pointer"
                                            title="Mover hacia la derecha"
                                        >
                                            <MoveRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowColConfigModal(false)}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Creating / Editing SP definition */}
            {showProcModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-600" />
                                <span>{modalProc.id ? 'Editar Stored Procedure' : 'Nuevo Stored Procedure'}</span>
                            </h3>
                            <button
                                onClick={() => setShowProcModal(false)}
                                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Nombre Descriptivo
                                </label>
                                <input
                                    type="text"
                                    value={modalProc.name}
                                    onChange={(e) => setModalProc({ ...modalProc, name: e.target.value })}
                                    placeholder="Ej: Ventas Fare Basis"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Nombre del SP en SQL Server
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={modalProc.spName}
                                        onChange={(e) => setModalProc({ ...modalProc, spName: e.target.value })}
                                        placeholder="Ej: dbo.[Zeus®spze_VentasFareBasis]"
                                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                                    />
                                    <button
                                        type="button"
                                        disabled={detectingParams || !modalProc.spName.trim()}
                                        onClick={handleDetectParams}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                                        title="Consultar sys.parameters en SQL Server para auto-detectar todos los parámetros de este SP"
                                    >
                                        {detectingParams ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                        )}
                                        <span>{detectingParams ? 'Detectando...' : 'Detectar Parámetros de SQL Server'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Descripción
                                </label>
                                <textarea
                                    value={modalProc.description}
                                    onChange={(e) => setModalProc({ ...modalProc, description: e.target.value })}
                                    placeholder="Descripción corta del reporte..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                                    <span>Definición de Parámetros (JSON)</span>
                                    <span className="text-[10px] text-blue-500 font-mono">[{`{ name, label, type, lookupType, section, defaultValue }`}]</span>
                                </label>
                                <textarea
                                    value={modalProc.parametersJson}
                                    onChange={(e) => setModalProc({ ...modalProc, parametersJson: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 bg-zinc-900 text-emerald-400 font-mono border border-zinc-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                            <button
                                onClick={() => setShowProcModal(false)}
                                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSaveProc}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                            >
                                Guardar Procedimiento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
