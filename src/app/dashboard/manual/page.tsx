'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    ShieldCheck,
    FileText,
    Receipt,
    PlaySquare,
    BarChart3,
    Settings,
    ChevronRight,
    Printer,
    HelpCircle,
    CheckCircle2,
    Code2,
    Lightbulb,
    Layers,
    ListFilter,
    ShieldAlert,
    RefreshCw,
    Info,
    Sliders,
    AlertTriangle,
    FileSpreadsheet
} from 'lucide-react';
import { ManualModule, ManualProcedure } from '@/data/manual/modules';

const ICON_MAP: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    FileText: <FileText className="w-5 h-5 text-blue-400" />,
    Receipt: <Receipt className="w-5 h-5 text-purple-400" />,
    PlaySquare: <PlaySquare className="w-5 h-5 text-amber-400" />,
    BarChart3: <BarChart3 className="w-5 h-5 text-indigo-400" />,
    Settings: <Settings className="w-5 h-5 text-slate-400" />
};

export default function ManualInteractivoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [modules, setModules] = useState<ManualModule[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string>('');
    const [selectedProcedure, setSelectedProcedure] = useState<ManualProcedure | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        let userRole = '';
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                userRole = parsed.role || '';
            }
        } catch (e) {
            console.error('Error leyendo usuario:', e);
        }

        fetch(`/api/manual?role=${encodeURIComponent(userRole)}`)
            .then(res => res.json())
            .then(data => {
                if (data.modules && Array.isArray(data.modules)) {
                    setModules(data.modules);
                    setIsSuperAdmin(Boolean(data.isSuperAdmin));
                    if (data.modules.length > 0) {
                        setSelectedModuleId(data.modules[0].id);
                        if (data.modules[0].procedures.length > 0) {
                            setSelectedProcedure(data.modules[0].procedures[0]);
                        }
                    }
                }
            })
            .catch(err => console.error('Error cargando manual:', err))
            .finally(() => setLoading(false));
    }, []);

    const activeModule = modules.find(m => m.id === selectedModuleId) || modules[0];

    useEffect(() => {
        if (activeModule && activeModule.procedures.length > 0) {
            setSelectedProcedure(activeModule.procedures[0]);
        } else {
            setSelectedProcedure(null);
        }
    }, [selectedModuleId]);

    // Filtrado por búsqueda en tiempo real
    const filteredModules = modules.map(module => {
        if (!searchQuery.trim()) return module;
        const q = searchQuery.toLowerCase().trim();

        const matchedProcedures = module.procedures.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.concept.toLowerCase().includes(q) ||
            (p.code && p.code.toLowerCase().includes(q)) ||
            (p.fields && p.fields.some(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))) ||
            p.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        );

        if (module.title.toLowerCase().includes(q) || module.description.toLowerCase().includes(q) || matchedProcedures.length > 0) {
            return {
                ...module,
                procedures: matchedProcedures.length > 0 ? matchedProcedures : module.procedures
            };
        }
        return null;
    }).filter(Boolean) as ManualModule[];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                    <span>Cargando manual de funcionamiento del sistema...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
            
            {/* Header del Manual */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            Manual de Funcionamiento del Sistema
                            <span className="text-xs font-normal bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                                Edición Descriptiva 2026.1
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Guía explicativa integral del funcionamiento, campos, botones y flujos de las <strong className="text-emerald-400">opciones activas</strong> de Korex ERP & Agencias.
                        </p>
                    </div>
                </div>

                {/* Buscador inteligente */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por opción, campo, botón o SP..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Layout Principal: Menú Módulos + Detalle Explicativo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sidebar Izquierdo: Lista de Módulos Activos */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            <span>Módulos Activos en Sitio ({filteredModules.length})</span>
                        </span>
                        {isSuperAdmin && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                SuperAdmin Mode
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        {filteredModules.map((mod) => {
                            const isSelected = mod.id === selectedModuleId;
                            const isLicensing = mod.id === 'licensing';

                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => setSelectedModuleId(mod.id)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                        isSelected
                                            ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-950/20'
                                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                                            {ICON_MAP[mod.iconName] || <HelpCircle className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold flex items-center gap-1.5">
                                                <span>{mod.title}</span>
                                                {isLicensing && (
                                                    <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 rounded">
                                                        SuperAdmin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400">{mod.category} • {mod.procedures.length} proceso(s)</div>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-400 translate-x-1' : 'text-slate-600'}`} />
                                </button>
                            );
                        })}

                        {filteredModules.length === 0 && (
                            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-xl">
                                No se encontraron módulos activos con el término "{searchQuery}".
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel Derecho: Detalle del Manual de Funcionamiento */}
                <div className="lg:col-span-8 space-y-6">
                    {activeModule ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                            
                            {/* Encabezado del Módulo Seleccionado */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                            {activeModule.category}
                                        </span>
                                        {activeModule.id === 'licensing' && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                                <span>Exclusivo SuperAdministrador</span>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                                        {activeModule.title}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {activeModule.description}
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.print()}
                                    className="self-start sm:self-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-3 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir Capítulo</span>
                                </button>
                            </div>

                            {/* Resumen de Funcionamiento y Concepto General */}
                            <div className="bg-slate-950 border border-blue-500/20 rounded-xl p-4 space-y-2 text-xs text-slate-300">
                                <div className="flex items-center gap-2 font-bold text-blue-400">
                                    <Info className="w-4 h-4" />
                                    <span>Propósito y Concepto Operativo del Módulo</span>
                                </div>
                                <p className="leading-relaxed text-slate-300">
                                    {activeModule.overview}
                                </p>
                            </div>

                            {/* Selector de Procesos / Opciones del Módulo */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Sliders className="w-4 h-4 text-amber-400" />
                                    <span>Opciones y Procesos del Módulo:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeModule.procedures.map((proc, idx) => {
                                        const isSelected = selectedProcedure?.name === proc.name;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedProcedure(proc)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-blue-600 text-white border-blue-500 font-medium shadow-md shadow-blue-600/20'
                                                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                                                }`}
                                            >
                                                {proc.code && (
                                                    <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.2 rounded font-mono text-amber-300">
                                                        {proc.code}
                                                    </span>
                                                )}
                                                <span>{proc.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Detalle Descriptivo de la Opción Seleccionada */}
                                {selectedProcedure && (
                                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-6 mt-4">
                                        
                                        {/* Título y Resumen del Proceso */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-white">{selectedProcedure.name}</h3>
                                                {selectedProcedure.code && (
                                                    <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                                                        {selectedProcedure.code}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-blue-300">{selectedProcedure.summary}</p>
                                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                                                {selectedProcedure.concept}
                                            </p>
                                        </div>

                                        {/* Explicación Detallada de Campos, Botones y Controles */}
                                        {selectedProcedure.fields && selectedProcedure.fields.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                                    <ListFilter className="w-4 h-4 text-emerald-400" />
                                                    <span>Descripción de Campos, Botones y Controles de la Opción:</span>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                                                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                                                            <tr>
                                                                <th className="p-2.5 border-b border-slate-800">Campo / Opción / Botón</th>
                                                                <th className="p-2.5 border-b border-slate-800">Tipo de Control</th>
                                                                <th className="p-2.5 border-b border-slate-800">Funcionamiento y Comportamiento</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                                            {selectedProcedure.fields.map((f, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-900/40">
                                                                    <td className="p-2.5 font-bold text-slate-200">{f.name}</td>
                                                                    <td className="p-2.5 font-mono text-amber-300/90 text-[11px]">{f.type}</td>
                                                                    <td className="p-2.5 text-slate-300 leading-relaxed">{f.description}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reglas de Negocio si aplican */}
                                        {selectedProcedure.businessRules && selectedProcedure.businessRules.length > 0 && (
                                            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs text-amber-300">
                                                <div className="flex items-center gap-2 font-bold text-amber-400">
                                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                                    <span>Reglas de Negocio y Restricciones del Sistema</span>
                                                </div>
                                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                                    {selectedProcedure.businessRules.map((rule, idx) => (
                                                        <li key={idx} className="leading-relaxed">{rule}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Guía Operativa Paso a Paso */}
                                        <div className="space-y-4 pt-2">
                                            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span>Flujo Operativo de Generación y Uso</span>
                                            </div>

                                            <div className="space-y-3">
                                                {selectedProcedure.steps.map((step) => (
                                                    <div key={step.number} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold border border-blue-500/30">
                                                                {step.number}
                                                            </span>
                                                            <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                                                        </div>
                                                        <p className="text-xs text-slate-400 pl-7 leading-relaxed">{step.description}</p>

                                                        {step.codeSnippet && (
                                                            <div className="ml-7 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400 flex items-center gap-2">
                                                                <Code2 className="w-4 h-4 text-slate-500 shrink-0" />
                                                                <span className="select-all">{step.codeSnippet}</span>
                                                            </div>
                                                        )}

                                                        {step.tip && (
                                                            <div className="ml-7 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 text-[11px] text-amber-300 flex items-start gap-1.5">
                                                                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                                <span>{step.tip}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                            No se encontraron módulos activos configurados para su nivel de acceso.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
