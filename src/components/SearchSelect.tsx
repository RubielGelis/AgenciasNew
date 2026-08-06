'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Check } from 'lucide-react'

interface SearchSelectProps {
    options: any[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
    labelKey?: string;
    secondaryKey?: string; 
    hasError?: boolean;
    className?: string;
}

export function SearchSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Seleccionar...", 
    disabled = false, 
    labelKey = "name", 
    secondaryKey = "code",
    hasError = false,
    className = ""
}: SearchSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedOption = options.find(o => String(o.id) === String(value) || String(o.code) === String(value) || String(o.document) === String(value) || (secondaryKey && o[secondaryKey] && String(o[secondaryKey]) === String(value)));

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter(o => 
            (o[labelKey] && String(o[labelKey]).toLowerCase().includes(lowerTerm)) ||
            (o[secondaryKey] && String(o[secondaryKey]).toLowerCase().includes(lowerTerm))
        );
    }, [options, searchTerm, labelKey, secondaryKey]);

    return (
        <>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                className={className || `w-full h-11 sm:h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 sm:px-4 border outline-none flex items-center justify-between text-left focus:ring-2 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'} ${hasError ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-950/30' : 'border-zinc-200 dark:border-zinc-700'}`}
            >
                <span className="truncate text-xs sm:text-sm font-medium dark:text-white">
                    {selectedOption 
                        ? `${selectedOption[labelKey]}${selectedOption[secondaryKey] ? ` - ${selectedOption[secondaryKey]}` : ''}` 
                        : <span className="text-zinc-400">{placeholder}</span>
                    }
                </span>
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
                        >
                            <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={`Buscar por nombre o código...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-white text-sm sm:text-base"
                                />
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto flex-1 p-2">
                                {filteredOptions.length === 0 ? (
                                    <div className="text-center p-8 text-zinc-500 text-sm">No se encontraron resultados</div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredOptions.map(opt => {
                                            const isSelected = String(opt.id) === String(value) || String(opt.code) === String(value);
                                            return (
                                                <button
                                                    key={opt.id || opt.code || Math.random()}
                                                    type="button"
                                                    onClick={() => {
                                                        onChange(opt.code && value === String(opt.code) ? String(opt.code) : String(opt.id || opt.code));
                                                        setIsOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl flex items-center justify-between group transition-colors ${
                                                        isSelected 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
                                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="text-xs sm:text-sm">{opt[labelKey]}</div>
                                                        {opt[secondaryKey] && (
                                                            <div className="text-[10px] sm:text-xs opacity-60 mt-0.5">{opt[secondaryKey]}</div>
                                                        )}
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
