'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, Calendar, Building2, RefreshCw } from 'lucide-react';

interface LicenseInfo {
    isLicensed: boolean;
    isExpired: boolean;
    expirationDate: string | null;
    daysRemaining: number | null;
    clientName: string | null;
    nit: string | null;
    status: 'ACTIVE' | 'WARNING' | 'EXPIRED' | 'UNLICENSED';
}

export default function LicenseStatusCard() {
    const [info, setInfo] = useState<LicenseInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [updating, setUpdating] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/config/license');
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
            }
        } catch (e) {
            console.error('Error fetching license status:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.trim()) return;

        setUpdating(true);
        setMsg(null);

        try {
            const res = await fetch('/api/config/license', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: newKey.trim() })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error al renovar clave');

            setMsg({ type: 'success', text: '¡Licencia renovada con éxito!' });
            setNewKey('');
            setShowKeyInput(false);
            fetchStatus();
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl flex items-center gap-3 text-slate-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consultando estado de la licencia...</span>
            </div>
        );
    }

    if (!info) return null;

    const isWarn = info.status === 'WARNING';
    const isExp = info.isExpired || info.status === 'EXPIRED';

    return (
        <div className={`p-5 rounded-2xl border transition-all ${
            isExp
                ? 'bg-rose-950/20 border-rose-500/40'
                : isWarn
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-800/40 border-slate-700/60'
        }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                        isExp
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : isWarn
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {isExp ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-100 text-base">Licencia de Funcionamiento Korex</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isExp
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : isWarn
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                                {isExp ? 'Expirada' : isWarn ? 'Por Vencer' : 'Activa'}
                            </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            {info.clientName && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                    {info.clientName} (NIT: {info.nit})
                                </span>
                            )}

                            {info.expirationDate && (
                                <span className="flex items-center gap-1 font-medium text-slate-300">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    Vence: {info.expirationDate}
                                    {info.daysRemaining !== null && (
                                        <span className={info.daysRemaining <= 15 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                                            ({info.daysRemaining < 0 ? 'Vencida hace ' + Math.abs(info.daysRemaining) + ' días' : info.daysRemaining + ' días restantes'})
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="self-start sm:self-center text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{showKeyInput ? 'Ocultar' : 'Renovar Licencia'}</span>
                </button>
            </div>

            {/* Formulario desplegable para renovar clave */}
            {showKeyInput && (
                <form onSubmit={handleUpdate} className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">Pegar nueva clave de licencia (generada por el proveedor):</label>
                        <textarea
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="KOR1.eyJjIjoi..."
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {msg && (
                        <div className={`text-xs p-2 rounded ${msg.type === 'success' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                            {msg.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={updating || !newKey.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium py-1.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                        {updating && <RefreshCw className="w-3 h-3 animate-spin" />}
                        <span>Aplicar Licencia</span>
                    </button>
                </form>
            )}
        </div>
    );
}
