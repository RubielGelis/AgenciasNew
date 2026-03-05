'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    Users,
    Building2,
    Tags,
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
    TerminalSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'usuarios' | 'sucursales' | 'implants' | 'impuestos' | 'vendedores' | 'tiqueteadores' | 'hoteles' | 'logs';

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
    const [hotels, setHotels] = useState<any[]>([])
    const [providers, setProviders] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])

    // Form states
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [u, r, b, i, t, v, tp, h, provs, systemLogs] = await Promise.all([
                fetch('/api/config/users').then(res => res.json()),
                fetch('/api/config/roles').then(res => res.json()),
                fetch('/api/config/branches').then(res => res.json()),
                fetch('/api/config/implants').then(res => res.json()),
                fetch('/api/config/taxes').then(res => res.json()),
                fetch('/api/config/sellers').then(res => res.json()),
                fetch('/api/config/ticket-printers').then(res => res.json()),
                fetch('/api/config/hotels').then(res => res.json()),
                fetch('/api/providers').then(res => res.json()),
                fetch('/api/config/logs').then(res => res.json())
            ])
            setUsers(u)
            setRoles(r)
            setBranches(b)
            setImplants(i)
            setTaxes(t || [])
            setSellers(v || [])
            setTicketPrinters(tp || [])
            setHotels(h || [])
            setProviders(provs || [])
            setLogs(systemLogs || [])
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (item?: any) => {
        if (item) {
            setFormData({ ...item })
        } else {
            if (activeTab === 'usuarios') {
                setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '' })
            } else if (activeTab === 'impuestos') {
                setFormData({ name: '', type: 'TAX', valueType: 'PERCENTAGE', value: '', isEditable: true })
            } else if (activeTab === 'vendedores' || activeTab === 'tiqueteadores') {
                setFormData({ code: '', name: '', email: '' })
            } else if (activeTab === 'hoteles') {
                setFormData({ name: '', category: '', location: '', providerId: '' })
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
                        activeTab === 'hoteles' ? '/api/config/hotels' :
                            activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
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

    const handleDelete = async (id: number) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`)) return

        const endpoint = activeTab === 'usuarios' ? '/api/config/users' :
            activeTab === 'sucursales' ? '/api/config/branches' :
                activeTab === 'impuestos' ? '/api/config/taxes' :
                    activeTab === 'vendedores' ? '/api/config/sellers' :
                        activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
                            activeTab === 'hoteles' ? '/api/config/hotels' :
                                '/api/config/implants'

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const res = await fetch(`${endpoint}?id=${id}`, {
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
                                {activeTab === 'usuarios' ? 'Nuevo Usuario' : activeTab === 'sucursales' ? 'Nueva Sucursal' : activeTab === 'impuestos' ? 'Nuevo Cargo/Impuesto' : activeTab === 'vendedores' ? 'Nuevo Vendedor' : activeTab === 'tiqueteadores' ? 'Nuevo Tiqueteador' : activeTab === 'hoteles' ? 'Nuevo Hotel' : 'Nuevo Implant'}
                            </motion.button>
                        </>
                    )}
                </div>
            </header>

            {/* Tabs Layout */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl mb-8 shadow-sm">
                <TabButton active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} icon={<Users className="w-4 h-4" />} label="Usuarios" />
                <TabButton active={activeTab === 'sucursales'} onClick={() => setActiveTab('sucursales')} icon={<Building2 className="w-4 h-4" />} label="Sucursales" />
                <TabButton active={activeTab === 'implants'} onClick={() => setActiveTab('implants')} icon={<Database className="w-4 h-4" />} label="Implants" />
                <TabButton active={activeTab === 'impuestos'} onClick={() => setActiveTab('impuestos')} icon={<Tags className="w-4 h-4" />} label="Cargos e Impuestos" />
                <TabButton active={activeTab === 'vendedores'} onClick={() => setActiveTab('vendedores')} icon={<UserCheck className="w-4 h-4" />} label="Vendedores" />
                <TabButton active={activeTab === 'tiqueteadores'} onClick={() => setActiveTab('tiqueteadores')} icon={<Printer className="w-4 h-4" />} label="Tiqueteadores" />
                <TabButton active={activeTab === 'hoteles'} onClick={() => setActiveTab('hoteles')} icon={<HotelIcon className="w-4 h-4" />} label="Hoteles" />
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
                                    ) : activeTab === 'hoteles' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Hotel</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Proveedor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Categoría</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'logs' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Acción / Módulo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Detalle del Evento</th>
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
                                {activeTab === 'usuarios' && users.map(user => (
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
                                {activeTab === 'hoteles' && hotels.map(hotel => (
                                    <tr key={hotel.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{hotel.name}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300">
                                            {hotel.provider?.name || <span className="text-zinc-400 text-xs italic">Sin proveedor</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-100 dark:border-amber-900/30">
                                                {hotel.category || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(hotel)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(hotel.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {((activeTab === 'vendedores' ? sellers : activeTab === 'tiqueteadores' ? ticketPrinters : activeTab === 'sucursales' ? branches : activeTab === 'implants' ? implants : []) || []).map(item => (
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
                            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        {activeTab === 'usuarios' ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black dark:text-white">{formData.id ? 'Editar' : 'Nuevo'} {activeTab === 'usuarios' ? 'Usuario' : activeTab === 'sucursales' ? 'Sucursal' : activeTab === 'impuestos' ? 'Cargo/Impuesto' : activeTab === 'vendedores' ? 'Vendedor' : activeTab === 'tiqueteadores' ? 'Tiqueteador' : activeTab === 'hoteles' ? 'Hotel' : 'Implant'}</h3>
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
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Rol de Usuario</label>
                                            <select
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={formData.roleId}
                                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                            >
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </div>
                                    </>
                                ) : activeTab === 'impuestos' ? (
                                    <>
                                        <Input label="Nombre (Ej. IVA 19%, Fee Bancario)" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. IVA 19%" />

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
                                ) : activeTab === 'hoteles' ? (
                                    <>
                                        <Input label="Nombre del Hotel" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Decameron San Luis" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Estrellas/Cat." value={formData.category || ''} onChange={(v: string) => setFormData({ ...formData, category: v })} placeholder="Ej. 4*" />
                                            <Input label="Ubicación" value={formData.location || ''} onChange={(v: string) => setFormData({ ...formData, location: v })} placeholder="Ej. San Andrés, Colombia" />
                                        </div>
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
                                ) : (
                                    <>
                                        <Input label="Código Único" value={formData.code} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG-01" />
                                        <Input label="Nombre / Descripción" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Sede Norte Bogotá" />
                                        {activeTab === 'implants' && (
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
