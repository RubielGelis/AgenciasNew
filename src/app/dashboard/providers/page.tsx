'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Briefcase, Mail, Trash2, Edit2, Loader2, X, Check, Building2, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Provider {
    id: number;
    name: string;
    contactInfo: string | null;
    commissionConfig: any;
    hotels: any[];
}

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        contactInfo: '',
    })

    useEffect(() => {
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/providers')
            const data = await res.json()
            setProviders(data)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (provider?: Provider) => {
        if (provider) {
            setEditingProvider(provider)
            setFormData({
                name: provider.name,
                contactInfo: provider.contactInfo || ''
            })
        } else {
            setEditingProvider(null)
            setFormData({ name: '', contactInfo: '' })
        }
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return

        try {
            const res = await fetch(`/api/providers?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Error al eliminar')
            await fetchProviders()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/providers', {
                method: editingProvider ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProvider ? { ...formData, id: editingProvider.id } : formData)
            })

            if (!res.ok) throw new Error('Error al guardar')

            await fetchProviders()
            setIsModalOpen(false)
            setFormData({ name: '', contactInfo: '' })
            setEditingProvider(null)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Proveedores</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestión de hoteles y mayoristas turísticos</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal()}
                    className="px-6 h-14 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-indigo-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Proveedor
                </motion.button>
            </header>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
                    ))
                ) : filteredProviders.map((provider) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={provider.id}
                        className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(provider)}
                                    className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg bg-zinc-50 dark:bg-zinc-800 transition-transform hover:scale-110"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(provider.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 rounded-lg bg-zinc-50 dark:bg-zinc-800 transition-transform hover:scale-110"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{provider.name}</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                < Mail className="w-4 h-4 text-zinc-400" /> {provider.contactInfo || 'Sin contacto'}
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="text-sm font-medium text-zinc-400">
                                    <span className="text-zinc-900 dark:text-white font-bold">{provider.hotels.length}</span> Hoteles asociados
                                </div>
                                <button className="text-indigo-600 font-bold text-sm hover:underline">Ver Hoteles</button>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                    </motion.div>
                ))}
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 className="text-xl font-bold dark:text-white">
                                    {editingProvider ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-zinc-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Nombre del Proveedor / Mayorista</label>
                                        <input
                                            required
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Ej. Decameron Hoteles"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Información de Contacto</label>
                                        <input
                                            required
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Email de reservas / Teléfono"
                                            value={formData.contactInfo}
                                            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={submitting}
                                        className="flex-[1.5] h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                                        {editingProvider ? 'Actualizar' : 'Guardar'} Proveedor
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
