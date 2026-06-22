'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Database, Table as TableIcon, X, Check, Calculator, Download, Play, Save, Loader2, Trash2, PieChart, Edit, Eye, EyeOff, Filter, Search, Printer, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'




// Icon for Users (missing from initial import)
import { Users } from 'lucide-react'

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [modules, setModules] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'list' | 'builder' | 'viewer'>('list')
    
    // Builder State
    const [templateName, setTemplateName] = useState('')
    const [baseTable, setBaseTable] = useState<string>('')
    const [selectedColumns, setSelectedColumns] = useState<any[]>([])
    const [reportFilters, setReportFilters] = useState<any[]>([])
    const [isCustomSql, setIsCustomSql] = useState(false)
    const [customSql, setCustomSql] = useState('')
    const [editingReportId, setEditingReportId] = useState<number | null>(null)
    
    // Manual Filter Modal
    const [isManualFilterModalOpen, setIsManualFilterModalOpen] = useState(false)
    const [manualFilterField, setManualFilterField] = useState('')
    const [manualFilterLabel, setManualFilterLabel] = useState('')
    const [manualFilterType, setManualFilterType] = useState('text')
    const [manualFilterIndex, setManualFilterIndex] = useState<number | null>(null)
    
    // Viewer State
    const [reportResult, setReportResult] = useState<any[]>([])
    const [running, setRunning] = useState(false)
    const [activeReport, setActiveReport] = useState<any>(null)
    const [sorts, setSorts] = useState<any[]>([])
    const [runtimeFilterValues, setRuntimeFilterValues] = useState<Record<string, any>>({})
    const [isRuntimeFilterModalOpen, setIsRuntimeFilterModalOpen] = useState(false)

    // Formula Modal
    const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
    const [formulaAlias, setFormulaAlias] = useState('')
    const [formulaExpression, setFormulaExpression] = useState('')

    // Batch Report Modal State
    const [isBatchReportModalOpen, setIsBatchReportModalOpen] = useState(false)
    const [batchIdIni, setBatchIdIni] = useState('')
    const [batchIdFin, setBatchIdFin] = useState('')

    useEffect(() => {
        fetchReports()
        fetchMetadata()
    }, [])

    const fetchMetadata = async () => {
        try {
            const res = await fetch('/api/reports/metadata')
            if (res.ok) {
                const data = await res.json()
                setModules(data)
            }
        } catch (error) {
            console.error("Error fetching metadata", error)
        }
    }

    const fetchReports = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/reports')
            if (res.ok) {
                const data = await res.json()
                setReports(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching reports", error)
        } finally {
            setLoading(false)
        }
    }

    // Toggle column selection
    const toggleColumn = (tableKey: string, tableAlias: string, col: any, friendlyNamePrefix: string = '') => {
        const colId = `${tableAlias}.${col.id}`;
        const exists = selectedColumns.find(c => c.id === colId);
        if (exists) {
            setSelectedColumns(selectedColumns.filter(c => c.id !== colId));
        } else {
            setSelectedColumns([...selectedColumns, {
                id: colId,
                tableAlias: tableAlias || 't1',
                columnName: col.id,
                alias: friendlyNamePrefix ? `${friendlyNamePrefix} - ${col.name}` : col.name,
                isCalculated: false,
                isVisible: true,
                type: col.type
            }]);
        }
    }

    const addFormula = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formulaAlias || !formulaExpression) return;
        
        setSelectedColumns([...selectedColumns, {
            id: `calc_${Date.now()}`,
            tableAlias: 'calc',
            columnName: 'calc',
            alias: formulaAlias,
            isCalculated: true,
            isVisible: true,
            formulaExpression: formulaExpression
        }]);
        
        setIsFormulaModalOpen(false);
        setFormulaAlias('');
        setFormulaExpression('');
    }

    const removeColumn = (idx: number) => {
        const newCols = [...selectedColumns];
        newCols.splice(idx, 1);
        setSelectedColumns(newCols);
    }

    const editFormula = (idx: number) => {
        const col = selectedColumns[idx];
        setFormulaAlias(col.alias);
        setFormulaExpression(col.formulaExpression || '');
        removeColumn(idx);
        setIsFormulaModalOpen(true);
    }

    const handleEdit = async (reportId: number) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/${reportId}`)
            if (res.ok) {
                const data = await res.json()
                setEditingReportId(reportId)
                setTemplateName(data.name)
                setBaseTable(data.base_table)
                setCustomSql(data.custom_sql || '')
                setIsCustomSql(!!data.custom_sql)
                setSorts(data.sorts.map((s: any) => ({
                    columnExpr: s.column_expr,
                    direction: s.direction
                })))
                setReportFilters(data.filters?.map((f: any) => ({
                    tableAlias: f.table_alias,
                    columnName: f.column_name,
                    filterLabel: f.filter_label,
                    filterType: f.filter_type,
                    operator: f.operator
                })) || [])
                setSelectedColumns(data.columns.map((c: any) => ({
                    id: c.is_calculated ? `calc_${c.id}` : `${c.table_alias}.${c.column_name}`,
                    tableAlias: c.table_alias || 't1',
                    columnName: c.column_name,
                    alias: c.alias,
                    isCalculated: c.is_calculated,
                    isVisible: c.is_visible,
                    formulaExpression: c.formula_expression,
                    type: c.data_type // We might need to ensure this is returned by API
                })))
                setView('builder')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const changeColumnOrder = (idx: number, newPos: number) => {
        if (newPos < 1 || newPos > selectedColumns.length) return;
        const targetIdx = newPos - 1;
        const newCols = [...selectedColumns];
        const [movedCol] = newCols.splice(idx, 1);
        newCols.splice(targetIdx, 0, movedCol);
        setSelectedColumns(newCols);
    }

    const saveTemplate = async () => {
        if (!templateName || (!isCustomSql && (!baseTable || selectedColumns.length === 0))) {
            alert('Debes ponerle nombre al reporte y seleccionar al menos una tabla/columna (o usar un script SQL).');
            return;
        }

        // Determinar relaciones automáticamente basado en las columnas seleccionadas
        const requiredAliases = new Set(selectedColumns.filter(c => !c.isCalculated).map(c => c.tableAlias));
        requiredAliases.delete('t1');
        
        const finalJoins: any[] = [];
        const addedAliases = new Set();

        const processRelation = (table: string, currentRelations: any[], parentAlias: string) => {
            currentRelations.forEach(rel => {
                if (requiredAliases.has(rel.alias) && !addedAliases.has(rel.alias)) {
                    finalJoins.push({
                        tableName: rel.table,
                        alias: rel.alias,
                        joinType: rel.type,
                        joinCondition: rel.condition
                            .replace('{alias}', rel.alias)
                            .replace('{parentAlias}', parentAlias)
                    });
                    addedAliases.add(rel.alias);
                    
                    // Recursively check relations of the table we just joined
                    const nextModule = modules[rel.table];
                    if (nextModule && nextModule.relations) {
                        processRelation(rel.table, nextModule.relations, rel.alias);
                    }
                }
            });
        }

        if (modules[baseTable] && modules[baseTable].relations) {
            processRelation(baseTable, modules[baseTable].relations, 't1');
        }

        const payload = {
            id: editingReportId,
            name: templateName,
            baseTable: baseTable,
            joins: finalJoins,
            sorts: sorts,
            filters: reportFilters,
            custom_sql: isCustomSql ? customSql : null,
            columns: selectedColumns.map((col, index) => ({
                tableAlias: col.tableAlias || null,
                columnName: col.columnName || null,
                alias: col.alias,
                isCalculated: col.isCalculated,
                isVisible: col.isVisible,
                formulaExpression: col.formulaExpression || null,
                sortOrder: index
            }))
        };

        try {
            setRunning(true);
            const res = await fetch('/api/reports', {
                method: editingReportId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                await fetchReports();
                setView('list');
            } else {
                const err = await res.json();
                alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRunning(false);
        }
    }

    const runReport = async (reportId: number) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/${reportId}`)
            if (res.ok) {
                const data = await res.json()
                setActiveReport(data)
                
                if (data.filters && data.filters.length > 0) {
                    setRuntimeFilterValues({})
                    setIsRuntimeFilterModalOpen(true)
                } else {
                    executeReport(reportId, {})
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const executeReport = async (reportId: number, filters: any) => {
        try {
            setRunning(true)
            const res = await fetch(`/api/reports/${reportId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters })
            })
            if (res.ok) {
                const data = await res.json()
                setReportResult(data || [])
                setIsRuntimeFilterModalOpen(false)
                setView('viewer')
            } else {
                const err = await res.json()
                alert(`Error: ${err.message || 'Error al ejecutar el reporte'}`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setRunning(false)
        }
    }

    const exportToExcel = () => {
        if (!reportResult || reportResult.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(reportResult);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, `${activeReport?.name || 'Reporte'}.xlsx`);
    }
    
    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este reporte permanentemente?')) return;
        await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
        fetchReports();
    }

    // Builder helpers
    const currentModule = baseTable ? modules[baseTable] : null;

    return (
        <div className="p-4 md:p-8 max-w-[100rem] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Centro de Reportes</h1>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Extrae inteligencia y analiza tus datos de forma dinámica</p>
                </div>
                
                {view === 'list' && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setBatchIdIni('');
                                setBatchIdFin('');
                                setIsBatchReportModalOpen(true);
                            }}
                            className="px-6 h-14 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl flex items-center gap-2.5 font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                        >
                            <FileText className="w-5 h-5 text-blue-600" />
                            Reporte Dinámico (Lote)
                        </button>
                        <button
                            onClick={() => {
                                setBaseTable('');
                                setSelectedColumns([]);
                                setTemplateName('');
                                setEditingReportId(null);
                                setSorts([]);
                                setReportFilters([]);
                                setView('builder');
                            }}
                            className="px-6 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 font-bold transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Nuevo Reporte
                        </button>
                    </div>
                )}
                {view !== 'list' && (
                    <button onClick={() => setView('list')} className="px-6 h-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-all">
                        Volver a la Lista
                    </button>
                )}
            </header>

            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
                    ) : reports.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-zinc-300 dark:border-zinc-800">
                            Aún no tienes reportes creados.
                        </div>
                    ) : (
                        reports.map(rep => (
                            <div key={rep.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                                    <button onClick={() => runReport(rep.id)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" title="Ejecutar Reporte">
                                        <Play className="w-4 h-4 ml-1" />
                                    </button>
                                    <button onClick={() => handleEdit(rep.id)} className="w-10 h-10 bg-zinc-50 text-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-600 hover:text-white transition-colors" title="Editar Reporte">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(rep.id)} className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center mb-6">
                                    <TableIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">{rep.name}</h3>
                                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 inline-block px-3 py-1 rounded-lg">
                                    Fuente: {modules[rep.base_table]?.name || rep.base_table}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {view === 'builder' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel Izquierdo: Selección de Origen */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-lg font-black mb-6">1. Origen de Datos</h3>
                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={() => setIsCustomSql(false)}
                                    className={cn("flex-1 h-14 rounded-2xl font-bold transition-all border-2", !isCustomSql ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200")}
                                >
                                    Asistente Visual
                                </button>
                                <button 
                                    onClick={() => setIsCustomSql(true)}
                                    className={cn("flex-1 h-14 rounded-2xl font-bold transition-all border-2", isCustomSql ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20" : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200")}
                                >
                                    Script SQL Personalizado
                                </button>
                            </div>

                            {!isCustomSql ? (
                                <div className="space-y-3">
                                    {Object.keys(modules).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => { setBaseTable(key); setSelectedColumns([]) }}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all",
                                                baseTable === key ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800" : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-300"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", baseTable === key ? "bg-blue-100 text-blue-600" : "bg-zinc-200 text-zinc-500")}>
                                                {modules[key].icon || <Database className="w-5 h-5" />}
                                            </div>
                                            <span className="font-bold">{modules[key].name}</span>
                                            {baseTable === key && <Check className="w-5 h-5 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                                            Escribe tu consulta SQL completa. El sistema la ejecutará como fuente de datos.
                                        </p>
                                    </div>
                                    <textarea 
                                        rows={12}
                                        value={customSql}
                                        onChange={(e) => setCustomSql(e.target.value)}
                                        placeholder="SELECT q.*, c.name FROM public.Quotation q JOIN public.Client c ON q.clientId = c.id"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 font-mono text-sm border-none shadow-inner focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                    />
                                    
                                    <div className="pt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest">Filtros para el Script</h4>
                                            <button 
                                                onClick={() => setIsManualFilterModalOpen(true)}
                                                className="flex items-center gap-2 text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Agregar Filtro Manual
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {reportFilters.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase">{f.filterType}</span>
                                                        <span className="text-sm font-bold">{f.filterLabel} <span className="text-zinc-400 font-normal">({f.columnName})</span></span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => {
                                                                setManualFilterField(f.columnName);
                                                                setManualFilterLabel(f.filterLabel);
                                                                setManualFilterType(f.filterType);
                                                                setManualFilterIndex(i);
                                                                setIsManualFilterModalOpen(true);
                                                            }} 
                                                            className="text-blue-500 p-1 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setReportFilters(reportFilters.filter((_, idx) => idx !== i))} className="text-red-500 p-1 hover:bg-red-50 rounded-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(baseTable || isCustomSql) && (
                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-lg font-black mb-4">Guardar Plantilla</h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Nombre del Reporte</label>
                                    <input type="text" placeholder="Ej. Ventas Generales" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-white" required />
                                </div>
                                <button onClick={saveTemplate} disabled={running} className="w-full h-14 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                                    {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Guardar Reporte
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Panel Derecho: Selección de Columnas */}
                    <div className="lg:col-span-2">
                        {baseTable ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/20">
                                    <div>
                                        <h2 className="text-xl font-black">2. Selecciona las Columnas</h2>
                                        <p className="text-zinc-500 text-sm font-medium mt-1">Elige qué información quieres mostrar en las columnas de tu Excel.</p>
                                    </div>
                                    <button onClick={() => setIsFormulaModalOpen(true)} className="px-4 h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                        <Calculator className="w-4 h-4" />
                                        Fórmula Matemática
                                    </button>
                                </div>
                                <div className="p-8 space-y-8">
                                    
                                    {/* Tabla Base */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Campos de {currentModule.name}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {currentModule.columns.map((col: any) => {
                                                const isSelected = selectedColumns.some(c => c.id === `t1.${col.id}`);
                                                return (
                                                    <button key={`t1.${col.id}`} onClick={() => toggleColumn('t1', 't1', col)} className={cn("p-3 rounded-xl border flex items-center gap-3 text-left transition-colors", isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300")}>
                                                        <div className={cn("w-5 h-5 rounded flex items-center justify-center border", isSelected ? "bg-white/20 border-white/30 text-white" : "border-zinc-300 text-transparent")}>
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-bold text-sm">{col.name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Tablas Relacionadas Recursivas */}
                                    {(() => {
                                        const rendered = new Set();
                                        const toProcess = [{ table: baseTable, alias: 't1' }];
                                        const rows = [];
                                        
                                        while (toProcess.length > 0) {
                                            const current = toProcess.shift()!;
                                            const moduleDef = modules[current.table];
                                            if (!moduleDef || !moduleDef.relations) continue;
                                            
                                            for (const rel of moduleDef.relations) {
                                                if (rendered.has(rel.alias)) continue;
                                                rendered.add(rel.alias);
                                                
                                                const relatedModule = modules[rel.table];
                                                if (!relatedModule) continue;
                                                
                                                rows.push(
                                                    <div key={rel.alias} className="space-y-4 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                        <h4 className="text-sm font-black uppercase tracking-widest text-purple-400">Desde {current.table}: {rel.name}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {relatedModule.columns.map((col: any) => {
                                                                const isSelected = selectedColumns.some(c => c.id === `${rel.alias}.${col.id}`);
                                                                return (
                                                                    <button key={`${rel.alias}.${col.id}`} onClick={() => toggleColumn(rel.table, rel.alias, col, rel.name)} className={cn("p-3 rounded-xl border flex items-center gap-3 text-left transition-colors", isSelected ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300")}>
                                                                        <div className={cn("w-5 h-5 rounded flex items-center justify-center border", isSelected ? "bg-white/20 border-white/30 text-white" : "border-zinc-300 text-transparent")}>
                                                                            <Check className="w-3 h-3" />
                                                                        </div>
                                                                        <span className="font-bold text-sm">{col.name}</span>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                                
                                                // If this relation is selected, we can also explore its relations
                                                if (selectedColumns.some(c => c.tableAlias === rel.alias)) {
                                                    toProcess.push({ table: rel.table, alias: rel.alias });
                                                }
                                            }
                                        }
                                        return rows;
                                    })()}

                                    {/* Ordenamiento de Columnas y Filas */}
                                    <div className="space-y-6 pt-10 border-t-2 border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <h3 className="text-lg font-black">3. Personalización del Reporte</h3>
                                            <p className="text-zinc-500 text-sm font-medium">Configura el orden de las columnas y el ordenamiento de los datos.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Orden de Columnas */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Orden de Columnas (Izquierda a Derecha)</label>
                                                <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                                                    {selectedColumns.map((col, idx) => (
                                                        <div key={col.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                            <input 
                                                                type="number" 
                                                                value={idx + 1} 
                                                                onChange={(e) => changeColumnOrder(idx, parseInt(e.target.value))}
                                                                className="w-12 h-10 bg-white dark:bg-zinc-900 rounded-lg text-center font-bold text-sm border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                                                                min="1"
                                                                max={selectedColumns.length}
                                                            />
                                                            <div className="flex-1 flex flex-col gap-0.5">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Etiqueta / Alias</label>
                                                                    <span className="text-[9px] text-zinc-400 font-mono italic">Origen: {col.tableAlias}.{col.columnName}</span>
                                                                </div>
                                                                <input 
                                                                    type="text"
                                                                    value={col.alias || ''}
                                                                    onChange={(e) => {
                                                                        const newCols = [...selectedColumns];
                                                                        newCols[idx].alias = e.target.value;
                                                                        setSelectedColumns(newCols);
                                                                    }}
                                                                    placeholder="Sin alias"
                                                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const isFilter = reportFilters.some(f => f.tableAlias === col.tableAlias && f.columnName === col.columnName);
                                                                    if (isFilter) {
                                                                        setReportFilters(reportFilters.filter(f => !(f.tableAlias === col.tableAlias && f.columnName === col.columnName)));
                                                                    } else {
                                                                        const type = col.type?.toLowerCase() || '';
                                                                        const isNum = type.includes('int') || type.includes('numeric') || type.includes('decimal') || type.includes('float') || type === 'number';
                                                                        const isDate = type.includes('date') || type.includes('time') || type.includes('timestamp');
                                                                        
                                                                        setReportFilters([...reportFilters, {
                                                                            tableAlias: col.tableAlias || 't1',
                                                                            columnName: col.columnName,
                                                                            filterLabel: col.alias,
                                                                            filterType: isNum ? 'number' : isDate ? 'date' : 'text',
                                                                            operator: (isNum || isDate) ? '=' : 'LIKE'
                                                                        }]);
                                                                    }
                                                                }}
                                                                className={cn("p-2 rounded-lg transition-colors", reportFilters.some(f => f.tableAlias === col.tableAlias && f.columnName === col.columnName) ? "text-purple-600 bg-purple-50" : "text-zinc-400 bg-zinc-100")}
                                                                title="Usar como Filtro en ejecución"
                                                            >
                                                                <Filter className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const newCols = [...selectedColumns];
                                                                    newCols[idx].isVisible = !newCols[idx].isVisible;
                                                                    setSelectedColumns(newCols);
                                                                }}
                                                                className={cn("p-2 rounded-lg transition-colors", col.isVisible ? "text-blue-600 bg-blue-50" : "text-zinc-400 bg-zinc-100")}
                                                                title={col.isVisible ? "Visible en Reporte" : "Oculto (Solo para Joins/Fórmulas)"}
                                                            >
                                                                {col.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            </button>
                                                            {col.isCalculated && (
                                                                <button 
                                                                    onClick={() => editFormula(idx)}
                                                                    className="p-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                                                    title="Editar Fórmula"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => removeColumn(idx)}
                                                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Quitar Columna"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Filtros de Ejecución */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Campos para Filtrar (En Ejecución)</label>
                                                <div className="space-y-3">
                                                    {reportFilters.length === 0 && (
                                                        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 text-xs font-bold uppercase">
                                                            No se han definido filtros
                                                        </div>
                                                    )}
                                                    {reportFilters.map((filter, idx) => (
                                                        <div key={idx} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-black text-purple-600 uppercase">{filter.tableAlias}.{filter.columnName}</span>
                                                                <button onClick={() => setReportFilters(reportFilters.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded-lg"><X className="w-4 h-4" /></button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Etiqueta del Filtro"
                                                                    className="h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 text-xs font-bold border-none outline-none"
                                                                    value={filter.filterLabel}
                                                                    onChange={(e) => {
                                                                        const newFilters = [...reportFilters];
                                                                        newFilters[idx].filterLabel = e.target.value;
                                                                        setReportFilters(newFilters);
                                                                    }}
                                                                />
                                                                <select 
                                                                    className="h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2 border-none outline-none font-bold text-xs"
                                                                    value={filter.filterType}
                                                                    onChange={(e) => {
                                                                        const newFilters = [...reportFilters];
                                                                        newFilters[idx].filterType = e.target.value;
                                                                        setReportFilters(newFilters);
                                                                    }}
                                                                >
                                                                    <option value="text">Texto</option>
                                                                    <option value="date">Fecha</option>
                                                                    <option value="number">Número</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Ordenamiento de Filas (Movido abajo) */}
                                            <div className="space-y-4 lg:col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Ordenamiento de Datos</label>
                                                    <button 
                                                        onClick={() => setSorts([...sorts, { columnExpr: '', direction: 'ASC' }])}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Agregar Criterio
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {sorts.map((sort, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                                            <select 
                                                                className="flex-1 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2 border-none outline-none font-bold text-xs"
                                                                value={sort.columnExpr}
                                                                onChange={(e) => {
                                                                    const newSorts = [...sorts];
                                                                    newSorts[idx].columnExpr = e.target.value;
                                                                    setSorts(newSorts);
                                                                }}
                                                            >
                                                                <option value="">Seleccionar Campo</option>
                                                                {selectedColumns.filter(c => !c.isCalculated).map(c => (
                                                                    <option key={c.id} value={`${c.tableAlias}."${c.columnName}"`}>{c.alias}</option>
                                                                ))}
                                                            </select>
                                                            <select 
                                                                className="w-24 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2 border-none outline-none font-bold text-xs"
                                                                value={sort.direction}
                                                                onChange={(e) => {
                                                                    const newSorts = [...sorts];
                                                                    newSorts[idx].direction = e.target.value;
                                                                    setSorts(newSorts);
                                                                }}
                                                            >
                                                                <option value="ASC">ASC</option>
                                                                <option value="DESC">DESC</option>
                                                            </select>
                                                            <button 
                                                                onClick={() => setSorts(sorts.filter((_, i) => i !== idx))}
                                                                className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                                <TableIcon className="w-16 h-16 text-zinc-300 mb-6" />
                                <h2 className="text-xl font-black text-zinc-400">Selecciona un Origen de Datos</h2>
                                <p className="text-zinc-500 font-medium max-w-sm mt-2">Para empezar a armar tu reporte, elige de dónde quieres sacar la información en el panel izquierdo.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Viewer Panel */}
            {view === 'viewer' && (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[70vh]">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black">{activeReport?.name}</h2>
                            <p className="text-zinc-500 text-sm font-medium">{reportResult.length} registros encontrados</p>
                        </div>
                        <button onClick={exportToExcel} className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                            <Download className="w-4 h-4" /> Exportar a Excel
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-6 custom-scrollbar">
                        {reportResult.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-400 font-bold">No hay datos para mostrar</div>
                        ) : (
                            <table className="w-full border-collapse bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                                <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
                                    <tr>
                                        {Object.keys(reportResult[0]).map(key => (
                                            <th key={key} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 text-left whitespace-nowrap">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {reportResult.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-6 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                                    {val === null ? '-' : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Formula Modal */}
            <AnimatePresence>
                {isFormulaModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black">Campo Calculado / Expresión SQL</h3>
                                <button onClick={() => setIsFormulaModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={addFormula} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Nombre de la Columna (Alias)</label>
                                    <input type="text" placeholder="Ej. Utilidad Total" value={formulaAlias} onChange={e => setFormulaAlias(e.target.value)} className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-white" required />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Expresión SQL</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setFormulaExpression("(t1.precio * 1.15)")} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Ejemplo Mate</button>
                                            <button type="button" onClick={() => setFormulaExpression("CASE WHEN t1.tax = 'IVA' THEN t1.valor ELSE 0 END")} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Ejemplo Lógico</button>
                                        </div>
                                    </div>
                                    <textarea 
                                        rows={4}
                                        placeholder="Escribe tu expresión SQL. Ejemplo: CASE WHEN t1.col = 'A' THEN t1.val1 ELSE t1.val2 END"
                                        value={formulaExpression}
                                        onChange={e => setFormulaExpression(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-5 border-none shadow-inner text-sm font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-white"
                                        required
                                    />
                                    <p className="text-[10px] text-zinc-400 px-1 italic">Puedes usar operadores matemáticos (+, -, *, /) y funciones de PostgreSQL como CASE, COALESCE, etc. Usa los alias de tabla (t1, t_quotation, etc.)</p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Columnas Disponibles (Copiar/Pegar):</p>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                        {selectedColumns.filter(c => !c.isCalculated).map(c => (
                                            <button 
                                                key={c.id}
                                                type="button"
                                                onClick={() => setFormulaExpression(prev => prev + ` ${c.tableAlias}."${c.columnName}"`)}
                                                className="text-[9px] bg-white dark:bg-zinc-800 border border-blue-100 dark:border-blue-900 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                            >
                                                {c.alias} ({c.tableAlias}.{c.columnName})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-colors shadow-xl shadow-blue-500/20">
                                    Guardar Expresión
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Runtime Filter Modal */}
            <AnimatePresence>
                {isRuntimeFilterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">Filtros de Ejecución</h2>
                                    <p className="text-zinc-500 text-sm font-medium">Ingresa los parámetros para este reporte.</p>
                                </div>
                                <button onClick={() => setIsRuntimeFilterModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {activeReport?.filters?.map((f: any) => (
                                    <div key={`${f.table_alias}.${f.column_name}`} className="space-y-2 p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">{f.filter_label || f.column_name}</label>
                                        
                                        {f.filter_type === 'date' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-zinc-400 pl-1">Desde</span>
                                                    <input 
                                                        type="date" 
                                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold text-xs border-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        onChange={(e) => setRuntimeFilterValues({ ...runtimeFilterValues, [`${f.table_alias}.${f.column_name}`]: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-zinc-400 pl-1">Hasta</span>
                                                    <input 
                                                        type="date" 
                                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold text-xs border-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        onChange={(e) => setRuntimeFilterValues({ ...runtimeFilterValues, [`${f.table_alias}.${f.column_name}_to`]: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        ) : f.filter_type === 'number' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-zinc-400 pl-1">Mínimo</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0"
                                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold text-xs border-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        onChange={(e) => setRuntimeFilterValues({ ...runtimeFilterValues, [`${f.table_alias}.${f.column_name}`]: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-zinc-400 pl-1">Máximo</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="99999"
                                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 font-bold text-xs border-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        onChange={(e) => setRuntimeFilterValues({ ...runtimeFilterValues, [`${f.table_alias}.${f.column_name}_to`]: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input 
                                                    type="text" 
                                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-10 pr-4 font-bold text-xs border-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    placeholder={`Buscar por texto...`}
                                                    onChange={(e) => setRuntimeFilterValues({ ...runtimeFilterValues, [`${f.table_alias}.${f.column_name}`]: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
                                <button onClick={() => setIsRuntimeFilterModalOpen(false)} className="flex-1 h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold hover:bg-zinc-100 transition-colors">
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => executeReport(activeReport.id, runtimeFilterValues)}
                                    className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all"
                                    disabled={running}
                                >
                                    {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                    Ejecutar Reporte
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Filtro Manual */}
            <AnimatePresence>
                {isManualFilterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Configurar Filtro</h3>
                                    <button onClick={() => setIsManualFilterModalOpen(false)} className="text-zinc-400 hover:bg-zinc-100 p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nombre del Campo en SQL</label>
                                        <input 
                                            type="text" 
                                            value={manualFilterField}
                                            onChange={(e) => setManualFilterField(e.target.value)}
                                            placeholder="ej: idcliente, fecha, total"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Etiqueta (Lo que verá el usuario)</label>
                                        <input 
                                            type="text" 
                                            value={manualFilterLabel}
                                            onChange={(e) => setManualFilterLabel(e.target.value)}
                                            placeholder="ej: Nombre del Cliente"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Dato</label>
                                        <select 
                                            value={manualFilterType}
                                            onChange={(e) => setManualFilterType(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="text">Texto (Búsqueda parcial)</option>
                                            <option value="number">Número (Rango Mín/Máx)</option>
                                            <option value="date">Fecha (Rango Desde/Hasta)</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (!manualFilterField) return;
                                        const newFilter = {
                                            tableAlias: 't1',
                                            columnName: manualFilterField,
                                            filterLabel: manualFilterLabel || manualFilterField,
                                            filterType: manualFilterType,
                                            operator: (manualFilterType === 'date' || manualFilterType === 'number') ? '=' : 'LIKE'
                                        };

                                        if (manualFilterIndex !== null) {
                                            const newFilters = [...reportFilters];
                                            newFilters[manualFilterIndex] = newFilter;
                                            setReportFilters(newFilters);
                                        } else {
                                            setReportFilters([...reportFilters, newFilter]);
                                        }

                                        setIsManualFilterModalOpen(false);
                                        setManualFilterField('');
                                        setManualFilterLabel('');
                                        setManualFilterType('text');
                                        setManualFilterIndex(null);
                                    }}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
                                >
                                    {manualFilterIndex !== null ? 'Actualizar Filtro' : 'Agregar Filtro al Script'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Reporte Dinámico por Lote */}
            <AnimatePresence>
                {isBatchReportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Reporte por Lote
                                    </h3>
                                    <button 
                                        onClick={() => setIsBatchReportModalOpen(false)} 
                                        className="text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Cotización Inicial (ID)</label>
                                        <input 
                                            type="number" 
                                            value={batchIdIni}
                                            onChange={(e) => setBatchIdIni(e.target.value)}
                                            placeholder="Ej: 1"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Cotización Final (ID)</label>
                                        <input 
                                            type="number" 
                                            value={batchIdFin}
                                            onChange={(e) => setBatchIdFin(e.target.value)}
                                            placeholder="Ej: 10"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button 
                                        onClick={() => {
                                            if (!batchIdIni || !batchIdFin) {
                                                alert("Por favor ingrese el rango completo (ID Inicial e ID Final).");
                                                return;
                                            }
                                            window.open(`/dashboard/quotations/print?idIni=${batchIdIni}&idFin=${batchIdFin}`, '_blank');
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                    >
                                        <Printer className="w-5 h-5" />
                                        Generar Impresión HTML / PDF
                                    </button>

                                    <button 
                                        onClick={() => {
                                            if (!batchIdIni || !batchIdFin) {
                                                alert("Por favor ingrese el rango completo (ID Inicial e ID Final).");
                                                return;
                                            }
                                            window.open(`/api/reports/cotizaciones/export-excel?idIni=${batchIdIni}&idFin=${batchIdFin}`, '_blank');
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                                    >
                                        <FileSpreadsheet className="w-5 h-5" />
                                        Descargar Reporte Excel
                                    </button>

                                    <button 
                                        onClick={() => setIsBatchReportModalOpen(false)}
                                        className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 h-12 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
