'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Copy, Check, ChevronDown, ChevronUp, Terminal, Bug } from 'lucide-react';

export interface DiagnosticErrorData {
    title?: string;
    message: string;
    endpoint?: string;
    statusCode?: number;
    timestamp?: string;
    details?: string;
    module?: string;
    action?: string;
}

interface ErrorDiagnosticModalProps {
    isOpen: boolean;
    onClose: () => void;
    errorData: DiagnosticErrorData | null;
}

export default function ErrorDiagnosticModal({ isOpen, onClose, errorData }: ErrorDiagnosticModalProps) {
    const [copied, setCopied] = useState(false);
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    if (!isOpen || !errorData) return null;

    const loggedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const timestamp = errorData.timestamp || new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' });

    const diagnosticText = `==================================================
        DIAGNÓSTICO TÉCNICO KOREX - AGENCIASNEW
==================================================
Fecha/Hora: ${timestamp}
Usuario: ${loggedUser.name || 'Desconocido'} (ID: ${loggedUser.id || 'N/A'})
Módulo: ${errorData.module || 'SISTEMA'}
Acción: ${errorData.action || 'OPERACIÓN'}
Endpoint: ${errorData.endpoint || 'N/A'}
Código Estado: ${errorData.statusCode || 500}
Mensaje Error: ${errorData.message}
${errorData.details ? `Detalle Técnico SQL/Prisma:\n${errorData.details}\n` : ''}Navegador: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido'}
==================================================`;

    const handleCopy = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(diagnosticText);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-red-100 dark:border-red-900/40 relative overflow-hidden">
                {/* Header decorativo superior */}
                <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 absolute top-0 left-0 right-0" />

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Encabezado Principal */}
                <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-red-500 dark:text-red-400 uppercase bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800/40">
                            {errorData.statusCode ? `Error HTTP ${errorData.statusCode}` : 'Error detectado'}
                        </span>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">
                            {errorData.title || 'Ha ocurrido una novedad en el proceso'}
                        </h3>
                    </div>
                </div>

                {/* Mensaje amigable para el usuario */}
                <div className="p-4 bg-red-50/70 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/30 mb-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 leading-relaxed">
                        {errorData.message}
                    </p>
                </div>

                {/* Sección Desplegable de Detalles Técnicos */}
                <div className="mb-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4 text-amber-500" />
                            <span>Detalles Técnicos para Soporte</span>
                        </div>
                        {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showTechnicalDetails && (
                        <div className="p-4 bg-zinc-900 text-zinc-200 text-xs font-mono space-y-2 border-t border-zinc-800 max-h-48 overflow-y-auto">
                            <div><span className="text-zinc-500">Timestamp:</span> {timestamp}</div>
                            {errorData.endpoint && <div><span className="text-zinc-500">Endpoint:</span> {errorData.endpoint}</div>}
                            {errorData.module && <div><span className="text-zinc-500">Módulo:</span> {errorData.module}</div>}
                            {errorData.details && (
                                <div className="pt-2 border-t border-zinc-800">
                                    <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
                                        <Terminal className="w-3 h-3" /> Excepción / SQLERRM:
                                    </div>
                                    <pre className="text-[11px] text-zinc-300 whitespace-pre-wrap break-all bg-black/40 p-2 rounded-lg">
                                        {errorData.details}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                        onClick={handleCopy}
                        className={`flex-1 h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                            copied
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>¡Diagnóstico copiado!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copiar Diagnóstico Completo</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="px-6 h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                    >
                        Entendido / Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
