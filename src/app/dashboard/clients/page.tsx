'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, User, Mail, MapPin, Trash2, Edit2, Loader2, X, Check, Database, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Client {
    id: number;
    name: string;
    document: string;
    contactInfo: string | null;
    address: string | null;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: '',
        document: '',
        contactInfo: '',
        address: ''
    })

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients')
            const data = await res.json()
            setClients(data)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (client?: Client) => {
        if (client) {
            setEditingClient(client)
            setFormData({
                name: client.name,
                document: client.document,
                contactInfo: client.contactInfo || '',
                address: client.address || ''
            })
        } else {
            setEditingClient(null)
            setFormData({ name: '', document: '', contactInfo: '', address: '' })
        }
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return

        try {
            const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Error al eliminar')
            await fetchClients()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/clients', {
                method: editingClient ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingClient ? { ...formData, id: editingClient.id } : formData)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            await fetchClients()
            setIsModalOpen(false)
            setFormData({ name: '', document: '', contactInfo: '', address: '' })
            setEditingClient(null)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.document.includes(search)
    )

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'clientes')

        try {
            const res = await fetch('/api/config/bulk-upload', {
                method: 'POST',
                body: formData
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error en la carga masiva')

            alert(result.message + (result.errors ? '\nErrores:\n' + result.errors.join('\n') : ''))
            await fetchClients()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Clientes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestión de base de datos de pasajeros</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleBulkUpload}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('/api/config/templates?type=clientes')}
                        className="px-6 h-14 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all disabled:opacity-50"
                        title="Descargar Plantilla Excel"
                    >
                        <Download className="w-5 h-5" />
                        Plantilla
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-6 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Database className="w-5 h-5" />}
                        Carga Masiva
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal()}
                        className="px-6 h-14 bg-blue-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Cliente
                    </motion.button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
                    ))
                ) : filteredClients.map((client) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={client.id}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(client)}
                                    className="p-2 text-zinc-400 hover:text-blue-500 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:scale-110 transition-transform"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(client.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:scale-110 transition-transform"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">{client.name}</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <span className="font-bold text-zinc-400">ID:</span> {client.document}
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm truncate">
                                <Mail className="w-4 h-4" /> {client.contactInfo || 'Sin contacto'}
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm truncate">
                                <MapPin className="w-4 h-4" /> {client.address || 'Sin dirección'}
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] rounded-full -mr-10 -mt-10" />
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
                                    {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-zinc-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Nombre Completo</label>
                                        <input
                                            required
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ej. Juan Pérez"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Documento de Identidad</label>
                                        <input
                                            required
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ej. 12345678"
                                            value={formData.document}
                                            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Información de Contacto</label>
                                        <input
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Email o Teléfono"
                                            value={formData.contactInfo}
                                            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500">Dirección</label>
                                        <input
                                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Dirección física"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                        className="flex-[1.5] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                                        {editingClient ? 'Actualizar' : 'Guardar'} Cliente
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
