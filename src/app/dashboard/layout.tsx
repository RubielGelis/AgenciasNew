'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, FileText, ShoppingCart, Settings, LogOut, Search, PlusCircle, PieChart, Receipt, Shield, Compass, Play, Database, BookOpen, FilePlus, ChevronDown, FileMinus } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface MenuItemData {
    id: number
    code: string
    name: string
    parent: number | null
    action: string
    activo: boolean
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [menuList, setMenuList] = useState<MenuItemData[]>([])
    const [loadingMenu, setLoadingMenu] = useState(true)
    const [isLicenseValid, setIsLicenseValid] = useState<boolean | null>(null)
    const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>({})

    const checkLicenseStatus = () => {
        fetch('/api/config/license')
            .then((res) => res.json())
            .then((data) => {
                if (data.isExpired || !data.isLicensed || data.status === 'EXPIRED' || data.status === 'UNLICENSED') {
                    setIsLicenseValid(false)
                    router.replace('/licencia-expirada')
                } else {
                    setIsLicenseValid(true)
                }
            })
            .catch(() => {
                // Si falla la consulta, no bloquear si es un error de red temporal
                setIsLicenseValid(true)
            })
    }

    const loadMenuData = () => {
        fetch('/api/menu')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load menu')
                return res.json()
            })
            .then((data: MenuItemData[]) => {
                if (Array.isArray(data)) {
                    setMenuList(data)
                }
            })
            .catch((err) => {
                console.error('Error loading menu from DB:', err)
            })
            .finally(() => {
                setLoadingMenu(false)
            })
    }

    useEffect(() => {
        checkLicenseStatus()
        loadMenuData()
        window.addEventListener('menuUpdated', loadMenuData)
        return () => {
            window.removeEventListener('menuUpdated', loadMenuData)
        }
    }, [])

    const handleLogout = () => {
        router.push('/login')
    }

    const defaultMenuItems: MenuItemData[] = [
        { id: 1, code: 'DASHBOARD', name: 'Dashboard', parent: null, action: '/dashboard', activo: true },
        { id: 8, code: 'PRECOTIZACIONES', name: 'Pre-Cotizaciones', parent: null, action: '/dashboard/prequotations', activo: true },
        { id: 2, code: 'COTIZACIONES', name: 'Cotizaciones', parent: null, action: '/dashboard/quotations/history', activo: true },
        { id: 3, code: 'FACTURACION', name: 'Facturación', parent: null, action: '/dashboard/invoices/history', activo: true },
        { id: 4, code: 'NOTAS_CREDITO', name: 'Notas Crédito', parent: null, action: '/dashboard/credit-notes/unreferenced', activo: true },
        { id: 5, code: 'NOTAS_CREDITO_NO_REF', name: 'Notas Crédito No Referenciadas', parent: 4, action: '/dashboard/credit-notes/unreferenced', activo: true },
        { id: 6, code: 'MAESTROS', name: 'Maestros', parent: null, action: '/dashboard/settings', activo: true },
        { id: 7, code: 'REPORTES', name: 'Reportes', parent: null, action: '/dashboard/reports', activo: true },
        { id: 9, code: 'EJECUCIONES', name: 'Ejecuciones', parent: null, action: '/dashboard/executions', activo: true },
        { id: 10, code: 'MANUAL', name: 'Manual Operativo', parent: null, action: '/dashboard/manual', activo: true }
    ]

    const allItems = menuList.length > 0 ? menuList : defaultMenuItems

    // Organizar elementos principales y submenús
    const rootItems = allItems.filter(item => !item.parent)
    const getChildren = (parentId: number) => allItems.filter(item => item.parent === parentId)

    const getMenuIcon = (code: string, action: string) => {
        const uCode = (code || '').toUpperCase()
        const uAction = (action || '').toLowerCase()

        if (uCode.includes('PRECOTIZACION') || uAction.includes('prequotations')) return <FilePlus className="w-5 h-5 text-amber-400" />
        if (uCode.includes('MANUAL') || uAction.includes('manual')) return <BookOpen className="w-5 h-5 text-blue-400" />
        if (uCode.includes('DASHBOARD') || uAction === '/dashboard') return <LayoutDashboard className="w-5 h-5" />
        if (uCode.includes('COTIZACION') || uAction.includes('quotations')) return <FileText className="w-5 h-5" />
        if (uCode.includes('FACTURA') || uAction.includes('invoices')) return <Receipt className="w-5 h-5" />
        if (uCode.includes('NOTAS_CREDITO') || uAction.includes('credit-notes')) return <FileMinus className="w-5 h-5" />
        if (uCode.includes('MAESTRO') || uCode.includes('SETTING') || uAction.includes('settings')) return <Settings className="w-5 h-5" />
        if (uCode.includes('REPORTE') || uAction.includes('reports')) return <PieChart className="w-5 h-5" />
        if (uCode.includes('EJECUCION') || uAction.includes('executions')) return <Play className="w-5 h-5" />
        if (uCode.includes('USER') || uCode.includes('CLIENT')) return <Users className="w-5 h-5" />
        return <Compass className="w-5 h-5" />
    }

    const isItemActive = (action: string) => {
        if (!action || action === '#') return false
        if (action === '/dashboard') return pathname === '/dashboard'
        if (action.includes('/quotations')) return pathname.includes('/dashboard/quotations')
        if (action.includes('/invoices')) return pathname.includes('/dashboard/invoices')
        if (action.includes('/credit-notes')) return pathname.includes('/dashboard/credit-notes')
        if (action.includes('/settings')) return pathname.includes('/dashboard/settings')
        if (action.includes('/reports')) return pathname.includes('/dashboard/reports')
        if (action.includes('/executions')) return pathname.includes('/dashboard/executions')
        if (action.includes('/manual')) return pathname.includes('/dashboard/manual')
        return pathname === action
    }

    const toggleExpand = (id: number) => {
        setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleMenuClick = (e: React.MouseEvent, item: MenuItemData, hasSubmenu: boolean) => {
        if (hasSubmenu) {
            e.preventDefault()
            toggleExpand(item.id)
            return
        }

        const act = item.action ? item.action.trim() : ''
        if (!act || act === '#') {
            e.preventDefault()
            return
        }

        if (act.startsWith('javascript:') || (!act.startsWith('/') && !act.startsWith('http') && !act.startsWith('#'))) {
            e.preventDefault()
            try {
                const cleanCode = act.replace(/^javascript:/i, '')
                new Function(cleanCode)()
            } catch (err) {
                console.error('Error executing menu action script:', err)
            }
            return
        }

        if (!act.startsWith('http')) {
            e.preventDefault()
            router.push(act)
        }
    }

    if (pathname === '/dashboard/quotations/print') {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
                {children}
            </div>
        )
    }

    if (isLicenseValid === false) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
                Redirigiendo a la pantalla de renovación de licencia...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
                            KX
                        </div>
                        <span className="text-xl font-bold dark:text-white">KoreX</span>
                    </div>

                    <nav className="space-y-1">
                        {rootItems.map((item) => {
                            const subItems = getChildren(item.id)
                            const hasSubmenu = subItems.length > 0
                            const isExpanded = expandedMenus[item.id] ?? (hasSubmenu && subItems.some(sub => isItemActive(sub.action)))
                            const active = isItemActive(item.action) || (hasSubmenu && subItems.some(sub => isItemActive(sub.action)))
                            const icon = getMenuIcon(item.code, item.action)
                            const isExternalUrl = item.action.startsWith('http')

                            return (
                                <div key={item.id || item.code} className="space-y-1">
                                    <a
                                        href={item.action}
                                        onClick={(e) => handleMenuClick(e, item, hasSubmenu)}
                                        target={isExternalUrl ? '_blank' : undefined}
                                        rel={isExternalUrl ? 'noopener noreferrer' : undefined}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active
                                            ? 'bg-blue-600/10 text-blue-600 font-semibold'
                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
                                            }`}
                                    >
                                        {icon}
                                        <span className="flex-1 text-left">{item.name}</span>
                                        {hasSubmenu && (
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        )}
                                        {active && !hasSubmenu && (
                                            <motion.div
                                                layoutId="active"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                                            />
                                        )}
                                    </a>

                                    {/* Submenús */}
                                    {hasSubmenu && isExpanded && (
                                        <div className="pl-6 space-y-1">
                                            {subItems.map(subItem => {
                                                const subActive = isItemActive(subItem.action)
                                                return (
                                                    <a
                                                        key={subItem.id || subItem.code}
                                                        href={subItem.action}
                                                        onClick={(e) => handleMenuClick(e, subItem, false)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all cursor-pointer ${subActive
                                                            ? 'bg-blue-600/15 text-blue-600 font-semibold'
                                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                            }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${subActive ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                                                        <span>{subItem.name}</span>
                                                    </a>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
