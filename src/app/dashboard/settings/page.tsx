'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    Users,
    Building2,
    Tags,
    Tag,
    DollarSign,
    Plus,
    Search,
    Trash2,
    ShieldCheck,
    Mail,
    Key,
    Database,
    Loader2,
    X,
    Check,
    UserCheck,
    Printer,
    Edit2,
    Download,
    Hotel as HotelIcon,
    TerminalSquare,
    Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'parametros' | 'usuarios' | 'sucursales' | 'implants' | 'impuestos' | 'vendedores' | 'tiqueteadores' | 'prestadoras' | 'clientes' | 'proveedores' | 'productos' | 'variables' | 'combos' | 'logs';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('usuarios')
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Data states
    const [users, setUsers] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])
    const [implants, setImplants] = useState<any[]>([])
    const [taxes, setTaxes] = useState<any[]>([])
    const [sellers, setSellers] = useState<any[]>([])
    const [ticketPrinters, setTicketPrinters] = useState<any[]>([])
    const [prestadoras, setHotels] = useState<any[]>([])
    const [providers, setProviders] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [variables, setVariables] = useState<any[]>([])
    const [parameters, setParameters] = useState<any[]>([])
    const [combos, setCombos] = useState<any[]>([])

    // Form states
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [u, r, b, i, t, v, tp, h, provs, systemLogs, resClients, resProducts, resVariables, resParams, resCombos] = await Promise.all([
                fetch('/api/config/users').then(res => res.json()),
                fetch('/api/config/roles').then(res => res.json()),
                fetch('/api/config/branches').then(res => res.json()),
                fetch('/api/config/implants').then(res => res.json()),
                fetch('/api/config/taxes').then(res => res.json()),
                fetch('/api/config/sellers').then(res => res.json()),
                fetch('/api/config/ticket-printers').then(res => res.json()),
                fetch('/api/config/prestadoras').then(res => res.json()),
                fetch('/api/providers').then(res => res.json()),
                fetch('/api/config/logs').then(res => res.json()),
                fetch('/api/clients').then(res => res.json()),
                fetch('/api/products').then(res => res.json()),
                fetch('/api/config/variables').then(res => res.json()),
                fetch('/api/config/parameters').then(res => res.json()),
                fetch('/api/combos').then(res => res.json())
            ])
            setUsers(Array.isArray(u) ? u : [])
            setRoles(Array.isArray(r) ? r : [])
            setBranches(Array.isArray(b) ? b : [])
            setImplants(Array.isArray(i) ? i : [])
            setTaxes(Array.isArray(t) ? t : [])
            setSellers(Array.isArray(v) ? v : [])
            setTicketPrinters(Array.isArray(tp) ? tp : [])
            setHotels(Array.isArray(h) ? h : [])
            setProviders(Array.isArray(provs) ? provs : [])
            setLogs(Array.isArray(systemLogs) ? systemLogs : [])
            setClients(Array.isArray(resClients) ? resClients : [])
            setProducts(Array.isArray(resProducts) ? resProducts : [])
            setVariables(Array.isArray(resVariables) ? resVariables : [])
            setParameters(Array.isArray(resParams) ? resParams : [])
            setCombos(Array.isArray(resCombos) ? resCombos : [])
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (item?: any) => {
        if (item) {
            if (activeTab === 'combos' && item.products) {
                // Normalizar los tipos de datos de los productos del combo al cargar para editar
                const normalizedProducts = item.products.map((cp: any) => ({
                    ...cp,
                    productId: cp.productId ? parseInt(cp.productId) : '',
                    quantity: parseInt(cp.quantity) || 1,
                    price: parseFloat(cp.price) || 0,
                    providerId: cp.providerId ? parseInt(cp.providerId) : null,
                    prestadoraId: cp.prestadoraId ? parseInt(cp.prestadoraId) : null,
                    mainTaxId: cp.mainTaxId ? parseInt(cp.mainTaxId) : null,
                    appliedTaxes: (cp.appliedTaxes || []).map((at: any) => ({
                        chargeAndTaxId: parseInt(at.chargeAndTaxId),
                        amount: parseFloat(at.amount) || 0,
                        isMain: at.isMain || false,
                    })),
                    inNationality: cp.inNationality || 1
                }));
                setFormData({ ...item, products: normalizedProducts });
            } else {
                setFormData({ ...item })
            }

        } else {
            if (activeTab === 'usuarios') {
                setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '', branchId: '', implantId: '', ticketPrinterId: '' })
            } else if (activeTab === 'impuestos') {
                setFormData({ code: '', name: '', type: 'TAX', valueType: 'PERCENTAGE', value: '', isEditable: true })
            } else if (activeTab === 'vendedores' || activeTab === 'tiqueteadores') {
                setFormData({ code: '', name: '', email: '' })
            } else if (activeTab === 'prestadoras') {
                setFormData({ code: '', name: '', category: '', location: '', providerId: '', type: '' })
            } else if (activeTab === 'clientes') {
                setFormData({ name: '', document: '', contactInfo: '', address: '' })
            } else if (activeTab === 'proveedores') {
                setFormData({ code: '', name: '', contactInfo: '' })
            } else if (activeTab === 'productos') {
                setFormData({ code: '', type: 'Servicio', description: '', basePrice: '', billingConcept: '', serviceType: '' })
            } else if (activeTab === 'variables') {
                setFormData({ code: '', name: '' })
            } else if (activeTab === 'combos') {
                setFormData({ code: '', name: '', products: [] })
            } else {
                setFormData({ code: '', name: '' })
            }
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const endpoint = activeTab === 'usuarios' ? '/api/config/users' :
            activeTab === 'sucursales' ? '/api/config/branches' :
                activeTab === 'impuestos' ? '/api/config/taxes' :
                    activeTab === 'vendedores' ? '/api/config/sellers' :
                        activeTab === 'prestadoras' ? '/api/config/prestadoras' :
                            activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
                                activeTab === 'clientes' ? '/api/clients' :
                                    activeTab === 'proveedores' ? '/api/providers' :
                                        activeTab === 'productos' ? '/api/products' :
                                            activeTab === 'variables' ? '/api/config/variables' :
                                                activeTab === 'parametros' ? '/api/config/parameters' :
                                                    activeTab === 'combos' ? (formData.id ? `/api/combos/${formData.id}` : '/api/combos') :
                                                        '/api/config/implants'

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const res = await fetch(endpoint, {
                method: formData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error((await res.json()).message || 'Error')

            await fetchData()
            setIsModalOpen(false)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDuplicateCombo = async (combo: any) => {
        const newCode = prompt(`Introduce el nuevo código para el combo duplicado:`, `${combo.code}_COPY`);
        if (!newCode) return;

        const newName = prompt(`Introduce el nuevo nombre para el combo duplicado:`, `${combo.name} (Copia)`);
        if (!newName) return;

        setSubmitting(true);
        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Clonar datos básicos y productos
        const duplicateData = {
            code: newCode,
            name: newName,
            products: (combo.products || []).map((cp: any) => ({
                productId: cp.productId,
                quantity: cp.quantity,
                price: cp.price,
                providerId: cp.providerId,
                prestadoraId: cp.prestadoraId,
                mainTaxId: cp.mainTaxId,
                inNationality: cp.inNationality,
                appliedTaxes: (cp.appliedTaxes || []).map((at: any) => ({
                    chargeAndTaxId: at.chargeAndTaxId,
                    amount: at.amount,
                    isMain: at.isMain
                }))
            }))
        };

        try {
            const res = await fetch('/api/combos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: JSON.stringify(duplicateData)
            });

            if (!res.ok) throw new Error((await res.json()).message || 'Error al duplicar');

            await fetchData();
            alert('Combo duplicado exitosamente');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`)) return

        const endpoint = activeTab === 'usuarios' ? '/api/config/users' :
            activeTab === 'sucursales' ? '/api/config/branches' :
                activeTab === 'impuestos' ? '/api/config/taxes' :
                    activeTab === 'vendedores' ? '/api/config/sellers' :
                        activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
                            activeTab === 'prestadoras' ? '/api/config/prestadoras' :
                                activeTab === 'clientes' ? '/api/clients' :
                                    activeTab === 'proveedores' ? '/api/providers' :
                                        activeTab === 'productos' ? '/api/products' :
                                            activeTab === 'variables' ? '/api/config/variables' :
                                                activeTab === 'parametros' ? '/api/config/parameters' :
                                                    activeTab === 'combos' ? `/api/combos/${id}` :
                                                        '/api/config/implants'

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const url = activeTab === 'combos' ? endpoint : `${endpoint}?id=${id}`
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': loggedUser.id?.toString() || ''
                }
            })

            if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar')

            await fetchData()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', activeTab)

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const res = await fetch('/api/config/bulk-upload', {
                method: 'POST',
                headers: {
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: formData
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error en la carga masiva')

            alert(result.message + (result.errors ? '\nErrores:\n' + result.errors.join('\n') : ''))
            await fetchData()
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
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" /> Configuración del Sistema
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium font-outfit">Control de acceso, sucursales y parámetros operativos</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleBulkUpload}
                    />
                    {activeTab !== 'logs' && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open(`/api/config/templates?type=${activeTab}`)}
                                disabled={false}
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
                                className="px-6 h-14 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {activeTab === 'usuarios' ? 'Nuevo Usuario' : activeTab === 'sucursales' ? 'Nueva Sucursal' : activeTab === 'impuestos' ? 'Nuevo Cargo/Impuesto' : activeTab === 'vendedores' ? 'Nuevo Vendedor' : activeTab === 'tiqueteadores' ? 'Nuevo Tiqueteador' : activeTab === 'prestadoras' ? 'Nueva Prestadora' : activeTab === 'clientes' ? 'Nuevo Cliente' : activeTab === 'proveedores' ? 'Nuevo Proveedor' : activeTab === 'productos' ? 'Nuevo Producto' : activeTab === 'variables' ? 'Nueva Variable' : activeTab === 'parametros' ? 'Nuevo Parámetro' : activeTab === 'combos' ? 'Nuevo Combo' : 'Nuevo Implant'}
                            </motion.button>
                        </>
                    )}
                </div>
            </header>

            {/* Tabs Layout */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl mb-8 shadow-sm">
                <TabButton active={activeTab === 'parametros'} onClick={() => setActiveTab('parametros')} icon={<Settings className="w-4 h-4" />} label="Parámetros" />
                <TabButton active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} icon={<Users className="w-4 h-4" />} label="Usuarios" />
                <TabButton active={activeTab === 'sucursales'} onClick={() => setActiveTab('sucursales')} icon={<Building2 className="w-4 h-4" />} label="Sucursales" />
                <TabButton active={activeTab === 'implants'} onClick={() => setActiveTab('implants')} icon={<Database className="w-4 h-4" />} label="Implants" />
                <TabButton active={activeTab === 'impuestos'} onClick={() => setActiveTab('impuestos')} icon={<Tags className="w-4 h-4" />} label="Cargos e Impuestos" />
                <TabButton active={activeTab === 'vendedores'} onClick={() => setActiveTab('vendedores')} icon={<UserCheck className="w-4 h-4" />} label="Vendedores" />
                <TabButton active={activeTab === 'tiqueteadores'} onClick={() => setActiveTab('tiqueteadores')} icon={<Printer className="w-4 h-4" />} label="Tiqueteadores" />
                <TabButton active={activeTab === 'prestadoras'} onClick={() => setActiveTab('prestadoras')} icon={<HotelIcon className="w-4 h-4" />} label="Prestadoras" />
                <TabButton active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} icon={<Users className="w-4 h-4" />} label="Clientes" />
                <TabButton active={activeTab === 'proveedores'} onClick={() => setActiveTab('proveedores')} icon={<Building2 className="w-4 h-4" />} label="Proveedores" />
                <TabButton active={activeTab === 'productos'} onClick={() => setActiveTab('productos')} icon={<Tags className="w-4 h-4" />} label="Productos" />
                <TabButton active={activeTab === 'variables'} onClick={() => setActiveTab('variables')} icon={<Tags className="w-4 h-4" />} label="Variables Adic." />
                <TabButton active={activeTab === 'combos'} onClick={() => setActiveTab('combos')} icon={<Database className="w-4 h-4" />} label="Combos" />
                <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-1 my-2"></div>
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<TerminalSquare className="w-4 h-4" />} label="Logs del Sistema" />
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full p-20">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                                <tr>
                                    {activeTab === 'usuarios' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Rol</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'impuestos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre del Cargo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Valor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Editable</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'vendedores' || activeTab === 'tiqueteadores' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre del {activeTab === 'vendedores' ? 'Vendedor' : 'Tiqueteador'}</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'prestadoras' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Prestadora</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Proveedor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Categoría</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'clientes' || activeTab === 'proveedores' ? (
                                        <>
                                             <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">{activeTab === 'clientes' ? 'Documento' : 'Código'}</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Contacto</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'productos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Descripción</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Precio Base</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'logs' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Acción / Módulo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Detalle del Evento</th>
                                        </>
                                    ) : activeTab === 'variables' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código Único</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Variable</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'parametros' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Valor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'combos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Descripción</th>
                                            {activeTab === 'implants' && <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Sucursal</th>}
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                                {activeTab === 'usuarios' && (users || []).map(user => (
                                    <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-zinc-900 dark:text-white mb-0.5">{user.name}</div>
                                            <div className="text-zinc-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">
                                                {user.role.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(user)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'impuestos' && taxes.map(tax => (
                                    <tr key={tax.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{tax.code || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{tax.name}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                {tax.type === 'TAX' ? 'Impuesto' : tax.type === 'CHARGE' ? 'Cargo Adic.' : 'Comisión'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-emerald-600">
                                            {tax.valueType === 'PERCENTAGE' ? `${tax.value}%` : `$${tax.value.toLocaleString()}`}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border",
                                                tax.isEditable
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                                                    : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                                            )}>
                                                {tax.isEditable ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(tax)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(tax.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'prestadoras' && prestadoras.map(prestadora => (
                                    <tr key={prestadora.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{prestadora.code || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{prestadora.name}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300 text-xs">
                                            {prestadora.provider?.name || <span className="text-zinc-400 text-xs italic">Sin proveedor</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-100 dark:border-amber-900/30">
                                                {prestadora.category || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300 text-xs">
                                            {prestadora.type || '-'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(prestadora)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(prestadora.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'clientes' && (clients || []).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.document || item.id || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.name}</td>
                                        <td className="px-8 py-6 text-zinc-500">
                                            {item.email && <div className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                            {item.phone && <div className="text-xs mt-1">{item.phone}</div>}
                                            {item.contactInfo && <div className="text-xs mt-1">{item.contactInfo}</div>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'proveedores' && (providers || []).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.document || item.code || item.id || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.name}</td>
                                        <td className="px-8 py-6 text-zinc-500">
                                            {item.email && <div className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                            {item.phone && <div className="text-xs mt-1">{item.phone}</div>}
                                            {item.contactInfo && <div className="text-xs mt-1">{item.contactInfo}</div>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'productos' && (products || []).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code || '-'}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.description}</td>
                                        <td className="px-8 py-6 font-black text-emerald-600">
                                            ${item.basePrice?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'parametros' && (parameters || []).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300">{item.value}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'combos' && (combos || []).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDuplicateCombo(item)} title="Duplicar Combo" className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"><Copy className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {((activeTab === 'vendedores' ? sellers : activeTab === 'tiqueteadores' ? ticketPrinters : activeTab === 'sucursales' ? branches : activeTab === 'implants' ? implants : activeTab === 'variables' ? variables : []) || []).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code || '-'}</td>
                                        <td className="px-8 py-6">
                                            <div className="text-zinc-600 dark:text-zinc-300 font-bold">{item.name}</div>
                                            {(activeTab === 'vendedores' || activeTab === 'tiqueteadores') && item.email && (
                                                <div className="text-zinc-400 text-xs flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {item.email}</div>
                                            )}
                                        </td>
                                        {activeTab === 'implants' && (
                                            <td className="px-8 py-6">
                                                {item.branch ? (
                                                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                        {item.branch.name}
                                                    </span>
                                                ) : <span className="text-zinc-400 text-xs italic">No asignada</span>}
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'logs' && logs.map(log => (
                                    <tr key={log.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            {log.user ? (
                                                <div className="font-bold text-zinc-900 dark:text-white">{log.user.name}</div>
                                            ) : (
                                                <div className="italic text-zinc-400">Sistema / Automático</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider",
                                                    log.action === 'CREATE' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/40" :
                                                        log.action === 'UPDATE' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/40" :
                                                            log.action === 'DELETE' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-900/40" :
                                                                log.action === 'LOGIN' ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:border-purple-900/40" :
                                                                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                )}>
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{log.module}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="text-zinc-700 dark:text-zinc-300 mb-1">{log.description}</div>
                                            {log.metadata && (
                                                <details className="mt-1">
                                                    <summary className="text-[10px] text-zinc-400 cursor-pointer hover:text-blue-500 font-bold uppercase tracking-widest inline-flex items-center gap-1">Ver Metadata Técnica</summary>
                                                    <pre className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 overflow-x-auto border border-zinc-200 dark:border-zinc-800">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal - Unified for Settings */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "bg-white dark:bg-zinc-900 w-full rounded-[3.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300",
                                activeTab === 'combos' ? "max-w-6xl" : "max-w-xl"
                            )}
                        >
                            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        {activeTab === 'usuarios' ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black dark:text-white">{formData.id ? 'Editar' : 'Nuevo'} {activeTab === 'usuarios' ? 'Usuario' : activeTab === 'sucursales' ? 'Sucursal' : activeTab === 'impuestos' ? 'Cargo/Impuesto' : activeTab === 'vendedores' ? 'Vendedor' : activeTab === 'tiqueteadores' ? 'Tiqueteador' : activeTab === 'prestadoras' ? 'Prestadora' : activeTab === 'clientes' ? 'Cliente' : activeTab === 'proveedores' ? 'Proveedor' : activeTab === 'productos' ? 'Producto' : activeTab === 'variables' ? 'Variable' : activeTab === 'parametros' ? 'Parámetro' : activeTab === 'combos' ? 'Combo' : 'Implant'}</h3>
                                        <p className="text-zinc-500 text-sm font-medium">Asigna los parámetros correspondientes</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                {activeTab === 'usuarios' ? (
                                    <>
                                        <Input label="Nombre Completo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Alex Smith" />
                                        <Input label="Email de Acceso" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} required type="email" placeholder="email@ejemplo.com" />
                                        <Input label="Contraseña" value={formData.password || ''} onChange={(v: string) => setFormData({ ...formData, password: v })} required={!formData.id} type="password" placeholder={formData.id ? "Dejar vacío para no cambiar" : "Min. 8 caracteres"} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Rol de Usuario</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.roleId || ''}
                                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Seleccionar Rol</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Sucursal</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.branchId || ''}
                                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                                >
                                                    <option value="">Ninguna / No aplica</option>
                                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Implant Asignado</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.implantId || ''}
                                                    onChange={(e) => setFormData({ ...formData, implantId: e.target.value })}
                                                >
                                                    <option value="">Ninguno / No aplica</option>
                                                    {implants.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tiqueteador Pred.</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.ticketPrinterId || ''}
                                                    onChange={(e) => setFormData({ ...formData, ticketPrinterId: e.target.value })}
                                                >
                                                    <option value="">Ninguno / No aplica</option>
                                                    {ticketPrinters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                ) : activeTab === 'impuestos' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Código (Ej. IVA_19)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. IVA_19 (Opcional)" />
                                            <Input label="Nombre (Ej. IVA 19%)" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. IVA 19%" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Cargo</label>
                                            <select
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="TAX">Impuesto Tributario (Ej. IVA)</option>
                                                <option value="CHARGE">Servicio / Cargo Extra</option>
                                                <option value="COMMISSION">Comisión de Agencia</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Operación</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.valueType}
                                                    onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                                                >
                                                    <option value="PERCENTAGE">Porcentaje (%)</option>
                                                    <option value="FIXED">Costo Fijo ($)</option>
                                                </select>
                                            </div>
                                            <Input label="Valor" value={formData.value} onChange={(v: string) => setFormData({ ...formData, value: v })} required type="number" step="0.01" placeholder="Ej. 19" />
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                            <input
                                                type="checkbox"
                                                id="isEditable"
                                                className="w-5 h-5 rounded-lg border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={formData.isEditable !== false}
                                                onChange={(e) => setFormData({ ...formData, isEditable: e.target.checked })}
                                            />
                                            <label htmlFor="isEditable" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                                Permitir editar libremente en cotizaciones
                                                <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Si se desactiva, el valor será fijo según este maestro</span>
                                            </label>
                                        </div>
                                    </>
                                ) : activeTab === 'vendedores' || activeTab === 'tiqueteadores' ? (
                                    <>
                                        <Input label="Código" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. VEN-001 (Opcional)" />
                                        <Input label="Nombre del Profesional" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder={`Ej. ${activeTab === 'vendedores' ? 'Pedro Perez' : 'Oficina Principal'}`} />
                                        <Input label="Email de Contacto" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} type="email" placeholder="ejemplo@correo.com (Opcional)" />
                                    </>
                                ) : activeTab === 'prestadoras' ? (
                                    <>
                                        <Input label="Código de la Prestadora" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. P-001 (Opcional)" />
                                        <Input label="Nombre de la Prestadora" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Decameron San Luis" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Estrellas/Cat." value={formData.category || ''} onChange={(v: string) => setFormData({ ...formData, category: v })} placeholder="Ej. 4*" />
                                            <Input label="Ubicación" value={formData.location || ''} onChange={(v: string) => setFormData({ ...formData, location: v })} placeholder="Ej. San Andrés, Colombia" />
                                        </div>
                                        <Input label="Tipo (Texto Abierto)" value={formData.type || ''} onChange={(v: string) => setFormData({ ...formData, type: v })} placeholder="Ej. Alojamiento, Transporte, etc" />
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Proveedor / Operador</label>
                                            <select
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={formData.providerId || ''}
                                                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                                                required
                                            >
                                                <option value="">Seleccionar Proveedor</option>
                                                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </>
                                ) : activeTab === 'implants' ? (
                                    <>
                                        <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG-01" />
                                        <Input label="Nombre / Descripción" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Sede Norte Bogotá" />
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Sucursal Asociada</label>
                                            <select
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={formData.branchId || ''}
                                                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                            >
                                                <option value="">Seleccionar Sucursal</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'clientes' || activeTab === 'proveedores' ? (
                                            <>
                                                {activeTab === 'clientes' && <Input label="Documento / NIT" value={formData.document || ''} onChange={(v: string) => setFormData({ ...formData, document: v })} required placeholder="No. de Documento" />}
                                                 {activeTab === 'proveedores' && <Input label="Código del Proveedor" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. AMADEUS" />}
                                                 <Input label="Nombre o Razón Social" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Nombre de Empresa / Persona" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Email de Contacto" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} type="email" placeholder="Opcional" />
                                                    <Input label="Teléfono / Contacto" value={formData.contactInfo || formData.phone || ''} onChange={(v: string) => setFormData({ ...formData, contactInfo: v, phone: v })} placeholder="Opcional" />
                                                </div>
                                                {activeTab === 'clientes' && <Input label="Dirección" value={formData.address || ''} onChange={(v: string) => setFormData({ ...formData, address: v })} placeholder="Opcional" />}
                                            </>
                                        ) : activeTab === 'productos' ? (
                                            <>
                                                <Input label="Código del Producto" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. P-001 (Opcional)" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Servicio</label>
                                                        <select
                                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                            value={formData.type || 'Servicio'}
                                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                        >
                                                            <option value="Servicio">Servicio</option>
                                                            <option value="Boleto">Boleto Aéreo</option>
                                                            <option value="Alojamiento">Alojamiento</option>
                                                            <option value="Asistencia">Asistencia Médica</option>
                                                            <option value="Otro">Otro</option>
                                                        </select>
                                                    </div>
                                                    <Input label="Precio Base ($)" value={formData.basePrice ?? ''} onChange={(v: string) => setFormData({ ...formData, basePrice: v === '' ? '' : parseFloat(v) })} type="number" step="0.01" required placeholder="0.00" />
                                                </div>
                                                <Input label="Descripción / Nombre" value={formData.description || ''} onChange={(v: string) => setFormData({ ...formData, description: v })} required placeholder="Ej. Tiquete Aéreo Nacional" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Concepto de Facturación" value={formData.billingConcept || ''} onChange={(v: string) => setFormData({ ...formData, billingConcept: v })} placeholder="Opcional" />
                                                    <Input label="Clasificación Servicio" value={formData.serviceType || ''} onChange={(v: string) => setFormData({ ...formData, serviceType: v })} placeholder="Opcional" />
                                                </div>
                                            </>
                                        ) : activeTab === 'combos' ? (
                                            <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-10 p-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Input label="Código del Combo" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. COMBO-PROMO" />
                                                    <Input label="Nombre del Combo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Paquete Turístico Todo Incluido" />
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider pl-1 font-title">Productos del Combo</label>
                                                            <p className="text-[10px] text-zinc-400 pl-1">Define los servicios individuales que componen este paquete</p>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const newProds = [...(formData.products || []), { productId: '', quantity: 1, price: 0, appliedTaxes: [], inNationality: 1 }];
                                                                setFormData({ ...formData, products: newProds });
                                                            }}
                                                            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all border-b-2 border-blue-800 active:translate-y-px"
                                                        >
                                                            <Plus className="w-4 h-4" /> Agregar Producto
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-8">
                                                        {(formData.products || []).map((cp: any, idx: number) => (
                                                        <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 relative group/item">
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newProds = formData.products.filter((_: any, i: number) => i !== idx);
                                                                    setFormData({ ...formData, products: newProds });
                                                                }}
                                                                className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all"
                                                                title="Eliminar producto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>

                                                            {/* Section: Service Info */}
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                    <Tag className="w-3 h-3" /> Información del Servicio
                                                                </label>
                                                                <div className="grid grid-cols-12 gap-4">
                                                                    <div className="col-span-12">
                                                                        <select 
                                                                            className="w-full h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                                            value={cp.productId?.toString() || ''}
                                                                            onChange={(e) => {
                                                                                const prod = products.find(p => p.id === parseInt(e.target.value));
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, productId: e.target.value, price: prod?.basePrice || 0 };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                            required
                                                                        >
                                                                            <option value="">Seleccionar Producto...</option>
                                                                            {products.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Section: Prestadora & Dates */}
                                                            <div className="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl space-y-4">
                                                                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                    <HotelIcon className="w-3 h-3" /> Alojamiento y Fechas
                                                                </label>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <select 
                                                                            className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none"
                                                                            value={cp.providerId || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value ? parseInt(e.target.value) : null;
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, providerId: val, prestadoraId: null };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                        >
                                                                            <option value="">Sel. Proveedor...</option>
                                                                            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <select 
                                                                            className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none"
                                                                            value={cp.prestadoraId || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value ? parseInt(e.target.value) : null;
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, prestadoraId: val };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                            disabled={!cp.providerId}
                                                                        >
                                                                            <option value="">Sel. Prestadora...</option>
                                                                            {prestadoras.filter(h => !cp.providerId || h.providerId === cp.providerId).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <select 
                                                                            className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 text-[11px] font-black text-emerald-600 dark:text-emerald-400 outline-none"
                                                                            value={cp.inNationality || 1}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, inNationality: val };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                        >
                                                                            <option value={1}>Nacional</option>
                                                                            <option value={2}>Internacional</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Check-In</label>
                                                                        <input type="date" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold outline-none" value={cp.checkInDate ? cp.checkInDate.split('T')[0] : ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, checkInDate: e.target.value };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Check-Out</label>
                                                                        <input type="date" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold outline-none" value={cp.checkOutDate ? cp.checkOutDate.split('T')[0] : ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, checkOutDate: e.target.value };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Adultos</label>
                                                                        <input type="number" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-emerald-500" value={cp.paxAdults || ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, paxAdults: parseInt(e.target.value) || 0 };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Niños</label>
                                                                        <input type="number" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-emerald-500" value={cp.paxChildren || ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, paxChildren: parseInt(e.target.value) || 0 };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Section: Values & Taxes */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                        <DollarSign className="w-3 h-3" /> Valores e Impuestos
                                                                    </label>
                                                                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/10 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-800">
                                                                        <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider">Cargo Principal:</span>
                                                                        <select 
                                                                            className="h-7 bg-transparent text-[10px] font-black text-purple-700 dark:text-purple-300 outline-none border-none cursor-pointer"
                                                                            value={cp.mainTaxId?.toString() || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value ? parseInt(e.target.value) : null;
                                                                                const newProds = [...formData.products];
                                                                                let nextApplied = [...(cp.appliedTaxes || [])];
                                                                                
                                                                                if (val && !nextApplied.some(t => t.chargeAndTaxId === val)) {
                                                                                    const tax = taxes.find(t => t.id === val);
                                                                                    const initialAmount = tax.valueType === 'PERCENTAGE' ? (cp.price * cp.quantity * tax.value / 100) : tax.value * cp.quantity;
                                                                                    nextApplied.push({ chargeAndTaxId: val, amount: initialAmount });
                                                                                }
                                                                                if (val) {
                                                                                    const mainAmount = nextApplied.find(t => t.chargeAndTaxId === val)?.amount || 0;
                                                                                    nextApplied = nextApplied.map(at => {
                                                                                        if (at.chargeAndTaxId === val) return at;
                                                                                        const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                        if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                            return { ...at, amount: (originalTax.value / 100) * mainAmount };
                                                                                        }
                                                                                        return at;
                                                                                    });
                                                                                    // Important: Ensure price is updated to match the new main tax amount
                                                                                    newProds[idx] = { 
                                                                                        ...cp, 
                                                                                        mainTaxId: val, 
                                                                                        price: mainAmount / (cp.quantity || 1),
                                                                                        appliedTaxes: nextApplied 
                                                                                    };
                                                                                } else {
                                                                                    newProds[idx] = { ...cp, mainTaxId: val, appliedTaxes: nextApplied };
                                                                                }
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                        >
                                                                            <option value="">Seleccionar...</option>
                                                                            {taxes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* Left: Total Calculation Area */}
                                                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col justify-center gap-2">
                                                                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Valor Total de Fila (Sumatoria)</label>
                                                                        <div className="relative">
                                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                                                            <input 
                                                                                type="number"
                                                                                className="w-full h-14 bg-white dark:bg-zinc-900 rounded-2xl pl-10 pr-4 text-xl font-black text-blue-600 outline-none border-2 border-blue-200 focus:border-blue-500 shadow-sm text-center"
                                                                                value={((cp.price * cp.quantity) + (cp.appliedTaxes || []).filter((t: any) => t.chargeAndTaxId !== cp.mainTaxId).reduce((acc: number, t: any) => acc + (t.amount || 0), 0)).toFixed(2)}
                                                                                onChange={(e) => {
                                                                                    const newTotal = parseFloat(e.target.value) || 0;
                                                                                    const currentOtherTaxes = (cp.appliedTaxes || []).filter((t: any) => t.chargeAndTaxId !== cp.mainTaxId).reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                                                                                    const newChargeAmount = newTotal - currentOtherTaxes;
                                                                                    const newProds = [...formData.products];
                                                                                    
                                                                                    // Recalculate other percentage-based taxes based on the NEW main charge
                                                                                    let newApplied = (cp.appliedTaxes || []).map((at: any) => {
                                                                                        if (at.chargeAndTaxId === cp.mainTaxId) return { ...at, amount: newChargeAmount };
                                                                                        const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                        if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                            return { ...at, amount: (originalTax.value / 100) * newChargeAmount };
                                                                                        }
                                                                                        return at;
                                                                                    });

                                                                                    newProds[idx] = { 
                                                                                        ...cp, 
                                                                                        price: newChargeAmount / (cp.quantity || 1),
                                                                                        appliedTaxes: newApplied
                                                                                    };
                                                                                    setFormData({ ...formData, products: newProds });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Right: Individually applied taxes */}
                                                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                                                        {taxes.map(tax => {
                                                                            const appliedTax = (cp.appliedTaxes || []).find((at: any) => at.chargeAndTaxId === tax.id);
                                                                            const checked = !!appliedTax;
                                                                            return (
                                                                                <div key={tax.id} className={cn(
                                                                                    "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
                                                                                    cp.mainTaxId === tax.id ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800" : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                                                                )}>
                                                                                    <input 
                                                                                        type="checkbox"
                                                                                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                                                                                        checked={checked}
                                                                                        onChange={(e) => {
                                                                                                const newProds = [...formData.products];
                                                                                                let newApplied = [...(cp.appliedTaxes || [])];
                                                                                                if (e.target.checked) {
                                                                                                    const baseForCalc = cp.mainTaxId 
                                                                                                        ? (newApplied.find((at: any) => at.chargeAndTaxId === cp.mainTaxId)?.amount || 0)
                                                                                                        : (cp.price * cp.quantity);
                                                                                                    const initialAmount = tax.valueType === 'PERCENTAGE' ? (baseForCalc * tax.value / 100) : tax.value * cp.quantity;
                                                                                                    newApplied.push({ chargeAndTaxId: tax.id, amount: initialAmount });
                                                                                                } else {
                                                                                                    newApplied = newApplied.filter((at: any) => at.chargeAndTaxId !== tax.id);
                                                                                                }
                                                                                                newProds[idx] = { ...cp, appliedTaxes: newApplied };
                                                                                                setFormData({ ...formData, products: newProds });
                                                                                            }}
                                                                                        />
                                                                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                                                                        <div className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 truncate uppercase mt-0.5">{tax.name}</div>
                                                                                        {checked && (
                                                                                            <div className="relative w-24">
                                                                                                <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-400" />
                                                                                                <input 
                                                                                                    type="number"
                                                                                                    className="w-full h-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg pl-5 pr-2 text-[11px] font-black text-zinc-700 dark:text-zinc-200 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 shadow-inner"
                                                                                                    value={appliedTax.amount || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = parseFloat(e.target.value) || 0;
                                                                                                        const newProds = [...formData.products];
                                                                                                        let newApplied = cp.appliedTaxes.map((at: any) => 
                                                                                                            at.chargeAndTaxId === tax.id ? { ...at, amount: val } : at
                                                                                                        );

                                                                                                        if (cp.mainTaxId === tax.id) {
                                                                                                            newApplied = newApplied.map((at: any) => {
                                                                                                                if (at.chargeAndTaxId === tax.id) return at;
                                                                                                                const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                                                if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                                                    return { ...at, amount: (originalTax.value / 100) * val };
                                                                                                                }
                                                                                                                return at;
                                                                                                            });
                                                                                                        }

                                                                                                        let newPrice = cp.price;
                                                                                                        if (cp.mainTaxId === tax.id) {
                                                                                                            newPrice = val / (cp.quantity || 1);
                                                                                                        }
                                                                                                        newProds[idx] = { ...cp, price: newPrice, appliedTaxes: newApplied };
                                                                                                        setFormData({ ...formData, products: newProds });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : activeTab === 'variables' ? (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. TKT-VUELO" />
                                            <Input label="Nombre de Variable" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Número de Tiquete / Reserva" />
                                        </>
                                    ) : activeTab === 'parametros' ? (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. EMPRESA_NIT" />
                                            <Input label="Nombre descriptivo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. NIT de la Empresa" />
                                            <Input label="Valor" value={formData.value || ''} onChange={(v: string) => setFormData({ ...formData, value: v })} required placeholder="Ej. 900.000.000-1" />
                                        </>
                                    ) : (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG-01" />
                                            <Input label="Nombre / Descripción" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Sede Norte Bogotá" />
                                        </>
                                    )}
                                </>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 hover:bg-zinc-200 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-6 h-6" />}
                                    Confirmar Registro
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

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-8 h-12 rounded-2xl font-bold transition-all text-sm",
                active
                    ? "bg-zinc-900 border border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 text-white shadow-lg shadow-zinc-950/20"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function Input({ label, value, onChange, ...props }: { label: string, value: string, onChange: (v: string) => void, [key: string]: any }) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">{label}</label>
            <input
                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        </div>
    )
}
