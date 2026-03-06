'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, FileText, ShoppingCart, Settings, LogOut, Search, PlusCircle, PieChart } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
        router.push('/login')
    }

    const navItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
        { icon: <FileText className="w-5 h-5" />, label: 'Cotizaciones', href: '/dashboard/quotations/history', active: pathname.includes('/dashboard/quotations') },
        { icon: <PieChart className="w-5 h-5" />, label: 'Reportes', href: '/dashboard/reports', active: pathname === '/dashboard/reports' },

        { icon: <Settings className="w-5 h-5" />, label: 'Configuración', href: '/dashboard/settings', active: pathname === '/dashboard/settings' },
    ]

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
                            AN
                        </div>
                        <span className="text-xl font-bold dark:text-white">Agencias New</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active
                                    ? 'bg-blue-600/10 text-blue-600'
                                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                                {item.active && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
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
