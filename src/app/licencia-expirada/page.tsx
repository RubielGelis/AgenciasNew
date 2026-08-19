'use client';

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function LicenciaExpiradaPage() {
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!licenseKey.trim()) {
            setStatusMessage({ type: 'error', text: 'Por favor ingrese la clave de licencia entregada por el proveedor.' });
            return;
        }

        setLoading(true);
        setStatusMessage(null);

        try {
            const res = await fetch('/api/config/license', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: licenseKey.trim() })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al validar la clave de licencia');
            }

            setStatusMessage({
                type: 'success',
                text: `¡Licencia activada con éxito para ${data.license.client}! Válida hasta ${data.license.expirationDate}. Redirigiendo...`
            });

            // Redirigir inmediatamente al dashboard
            setTimeout(() => {
                window.location.replace('/dashboard');
            }, 1000);
        } catch (err: any) {
            setStatusMessage({
                type: 'error',
                text: err.message || 'La clave de licencia ingresada es inválida o expiró.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
                
                {/* Header Alerta */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-500">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Licencia del Sistema Expirada
                    </h1>
                    <p className="text-sm text-slate-400">
                        El período de funcionamiento contratado para esta versión de Korex ha finalizado o requiere renovación de licencia.
                    </p>
                </div>

                {/* Mensaje Informativo */}
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>¿Cómo renovar el acceso al sistema?</span>
                    </div>
                    <p>
                        Solicite a su proveedor de software la nueva <strong>Clave de Licencia</strong> generada con el programa ejecutable <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">GenerarLicencia.bat</code> y péguela en el recuadro a continuación.
                    </p>
                </div>

                {/* Formulario de Activación */}
                <form onSubmit={handleActivate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-slate-400" />
                            <span>Clave de Licencia (Token):</span>
                        </label>
                        <textarea
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            placeholder="KOR1.eyJjIjoiQWdlbmNp... (Pegue la clave completa entregada por el soporte)"
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-600"
                        />
                    </div>

                    {statusMessage && (
                        <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                                : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                        }`}>
                            {statusMessage.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            )}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Verificando y Activando...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Activar Nueva Licencia</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Soporte */}
                <div className="text-center pt-2 text-[11px] text-slate-500">
                    Soporte Técnico Korex ERP & Agencias | Versión 2026
                </div>

            </div>
        </div>
    );
}
