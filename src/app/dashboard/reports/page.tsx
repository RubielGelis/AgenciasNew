'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import { TrendingUp, Users, DollarSign, FileText } from 'lucide-react'

const dataSales = [
    { name: 'Ene', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Abr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
]

const dataPie = [
    { name: 'GHL Hoteles', value: 400 },
    { name: 'Decameron', value: 300 },
    { name: 'Hilton', value: 300 },
    { name: 'Otros', value: 200 },
]

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b']

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Reportes Avanzados</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Análisis detallado de tu operación</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card icon={<DollarSign className="text-blue-500" />} label="Ventas Totales" value="$94,200" change="+14% vs mes ant." />
                <Card icon={<Users className="text-purple-500" />} label="Clientes Activos" value="1,240" change="+5% vs mes ant." />
                <Card icon={<FileText className="text-emerald-500" />} label="Cotizaciones Libres" value="48" change="-2% vs mes ant." />
                <Card icon={<TrendingUp className="text-orange-500" />} label="Conversión" value="68%" change="+12% vs mes ant." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Chart */}
                <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xl font-bold mb-8 dark:text-white">Tendencia de Ventas (USD)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataSales}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xl font-bold mb-8 dark:text-white">Distribución por Proveedor</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                            {dataPie.map((entry, idx) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Card({ icon, label, value, change }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                {icon}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{label}</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{value}</div>
            <div className="text-xs font-bold text-emerald-500">{change}</div>
        </motion.div>
    )
}
