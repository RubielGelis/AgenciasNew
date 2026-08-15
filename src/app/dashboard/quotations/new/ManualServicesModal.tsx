'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Calculator, Building2, Wrench, DollarSign, TrendingUp } from 'lucide-react'

export interface ManualServiceItem {
    id?: number;
    providerName: string;
    serviceName: string;
    cost: number;
    salePrice: number;
    utility: number;
}

interface ManualServicesModalProps {
    isOpen: boolean;
    onClose: () => void;
    services: ManualServiceItem[];
    onChange: (services: ManualServiceItem[]) => void;
    currency?: string;
}

export default function ManualServicesModal({
    isOpen,
    onClose,
    services,
    onChange,
    currency = 'COP'
}: ManualServicesModalProps) {
    if (!isOpen) return null;

    const handleAddService = () => {
        const newService: ManualServiceItem = {
            providerName: '',
            serviceName: '',
            cost: 0,
            salePrice: 0,
            utility: 0
        };
        onChange([...services, newService]);
    };

    const handleRemoveService = (index: number) => {
        const updated = services.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handleItemChange = (index: number, field: keyof ManualServiceItem, value: any) => {
        const updated = [...services];
        const current = { ...updated[index] };

        if (field === 'providerName' || field === 'serviceName') {
            current[field] = value;
        } else if (field === 'cost' || field === 'salePrice') {
            const numVal = parseFloat(value) || 0;
            current[field] = numVal;
            // Recalculate utility = salePrice - cost
            current.utility = (field === 'salePrice' ? numVal : current.salePrice) - (field === 'cost' ? numVal : current.cost);
        }

        updated[index] = current;
        onChange(updated);
    };

    const totalCost = services.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const totalSale = services.reduce((sum, item) => sum + (Number(item.salePrice) || 0), 0);
    const totalUtility = services.reduce((sum, item) => sum + (Number(item.utility) || 0), 0);

    const formatCurrency = (val: number) => {
        return val.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    Servicios y Proveedores Manuales
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        {services.length} {services.length === 1 ? 'casilla' : 'casillas'}
                                    </span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Digite el proveedor, servicio, costo y precio de venta. La utilidad se calculará automáticamente.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-4">
                        {services.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400">
                                <Building2 className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No se han ingresado casillas manuales</p>
                                <p className="text-xs text-zinc-400 mt-1">Haga clic en el botón "+ Agregar Casilla" para iniciar el llenado manual.</p>
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4" /> Agregar Casilla
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {services.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-12 gap-3 items-end p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 transition-all hover:border-emerald-500/30"
                                    >
                                        {/* Row counter */}
                                        <div className="col-span-12 md:col-span-1 text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                                            #{index + 1}
                                        </div>

                                        {/* Nombre Proveedor */}
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <Building2 className="w-3 h-3 text-zinc-400" />
                                                Nombre Proveedor
                                            </label>
                                            <input
                                                type="text"
                                                value={item.providerName}
                                                onChange={(e) => handleItemChange(index, 'providerName', e.target.value)}
                                                placeholder="Ej. Aviatur, Hotel Plaza..."
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>

                                        {/* Servicio */}
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <Wrench className="w-3 h-3 text-zinc-400" />
                                                Servicio
                                            </label>
                                            <input
                                                type="text"
                                                value={item.serviceName}
                                                onChange={(e) => handleItemChange(index, 'serviceName', e.target.value)}
                                                placeholder="Ej. Tiquetes, Hospedaje, Tour..."
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>

                                        {/* Costo */}
                                        <div className="col-span-12 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-zinc-400" />
                                                Costo
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.cost || ''}
                                                onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>

                                        {/* Precio Venta */}
                                        <div className="col-span-12 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                                Precio Venta
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.salePrice || ''}
                                                onChange={(e) => handleItemChange(index, 'salePrice', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                                            />
                                        </div>

                                        {/* Utilidad (Calculada) */}
                                        <div className="col-span-12 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-blue-500" />
                                                Utilidad
                                            </label>
                                            <div className={`w-full text-xs rounded-xl px-3 py-2 font-bold border ${
                                                item.utility < 0
                                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                    : 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                            }`}>
                                                $ {formatCurrency(item.utility || 0)}
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="col-span-12 md:col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveService(index)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                                title="Eliminar casilla"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer / Totals & Actions */}
                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Summary cards */}
                        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 min-w-[120px]">
                                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Costo</span>
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">$ {formatCurrency(totalCost)}</span>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 min-w-[120px]">
                                <span className="text-[10px] uppercase font-bold text-emerald-500 block">Total Venta</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$ {formatCurrency(totalSale)}</span>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 min-w-[120px]">
                                <span className="text-[10px] uppercase font-bold text-blue-500 block">Total Utilidad</span>
                                <span className={`text-xs font-bold ${totalUtility < 0 ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                                    $ {formatCurrency(totalUtility)}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <button
                                type="button"
                                onClick={handleAddService}
                                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all"
                            >
                                <Plus className="w-4 h-4" /> Agregar Casilla
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                Guardar y Cerrar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
