'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package,
    Plus,
    Search,
    Trash2,
    Loader2,
    X,
    Check,
    DollarSign,
    Box,
    Edit2,
    Database,
    Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')

    const [editingProduct, setEditingProduct] = useState<any | null>(null)

    // Form
    const [formData, setFormData] = useState({
        type: 'HOTEL',
        description: '',
        basePrice: '',
        billingConcept: '',
        serviceType: ''
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (product?: any) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                type: product.type,
                description: product.description,
                basePrice: product.basePrice.toString(),
                billingConcept: product.billingConcept || '',
                serviceType: product.serviceType || ''
            })
        } else {
            setEditingProduct(null)
            setFormData({ type: 'HOTEL', description: '', basePrice: '', billingConcept: '', serviceType: '' })
        }
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto/servicio?')) return
        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
            fetchProducts()
        } catch (error) {
            alert('Error al eliminar')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/products', {
                method: editingProduct ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProduct ? { ...formData, id: editingProduct.id } : formData)
            })

            if (!res.ok) throw new Error((await res.json()).message)

            await fetchProducts()
            setIsModalOpen(false)
            setFormData({ type: 'HOTEL', description: '', basePrice: '', billingConcept: '', serviceType: '' })
            setEditingProduct(null)
        } catch (error: any) {
            alert(error.message || 'Error al guardar')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'productos')

        try {
            const res = await fetch('/api/config/bulk-upload', {
                method: 'POST',
                body: formData
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error en la carga masiva')

            alert(result.message + (result.errors ? '\nErrores:\n' + result.errors.join('\n') : ''))
            await fetchProducts()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-3 tracking-tight">
                        <Box className="w-9 h-9 text-blue-600" /> Catálogo de Servicios
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Administra los productos base, alojamientos y extras</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            className="h-14 bg-white dark:bg-zinc-900 rounded-2xl pl-12 pr-6 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 font-medium transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                            onClick={() => window.open('/api/config/templates?type=productos')}
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenModal()}
                            className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold transition-all flex items-center gap-3 shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Servicio
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[500px]">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] text-zinc-400">
                        <Package className="w-20 h-20 mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold text-zinc-600 dark:text-zinc-300 mb-2">No hay servicios</h3>
                        <p>No se encontraron productos en el catálogo.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Descripción / Nombre</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Categoría</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Precio Base Neto</th>
                                    <th className="px-8 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-zinc-900 dark:text-white text-base">{product.description}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-black rounded-lg uppercase tracking-wider">
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-emerald-600 tabular-nums">
                                                ${product.basePrice.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black dark:text-white">
                                            {editingProduct ? 'Editar Servicio' : 'Nuevo Servicio'}
                                        </h3>
                                        <p className="text-zinc-500 text-sm font-medium">
                                            {editingProduct ? 'Modifica los parámetros del servicio' : 'Agrega productos base para cotizar'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Categoría del Servicio</label>
                                    <select
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        required
                                    >
                                        <option value="HOTEL">Alojamiento (Hotel)</option>
                                        <option value="TICKET">Tiquete Aéreo / Terrestre</option>
                                        <option value="TRANSPORT">Transporte Interno</option>
                                        <option value="TOUR">Excursión / Tour</option>
                                        <option value="INSURANCE">Seguro Médico / Viaje</option>
                                        <option value="OTHER">Otro Servicio Adicional</option>
                                    </select>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">Nombre / Descripción</label>
                                    <input
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Ej. Habitación Estándar x Noche"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">Precio Base Neto Inicial</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl pl-12 pr-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            required
                                            placeholder="Ej. 120.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-2 pl-2">Nota: Este precio base es referencial y puede alterarse en la cotización.</p>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">Concepto de Facturación</label>
                                    <input
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        value={formData.billingConcept}
                                        onChange={(e) => setFormData({ ...formData, billingConcept: e.target.value })}
                                        placeholder="Concepto libre (opcional)"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">Tipo de Servicio Lib.</label>
                                    <input
                                        className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                        placeholder="Descripción libre (opcional)"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={submitting}
                                        className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-6 h-6" />}
                                        {editingProduct ? 'Actualizar Servicio' : 'Guardar en Catálogo'}
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
