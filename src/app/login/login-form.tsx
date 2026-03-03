'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, User, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [view, setView] = useState<'login' | 'forgot'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error en el inicio de sesión')
            }

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMsg(null)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message + (data.detail ? ` (detalle: ${data.detail})` : ''))
            }

            setSuccessMsg(data.message)
            // No cambiamos el view inmediatamente para que el usuario vea el mensaje
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (view === 'forgot') {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white text-center">Recuperar Contraseña</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center">Ingresa tu email para recibir instrucciones</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
                            {error}
                            <div className="text-[10px] mt-1 opacity-70">Error detectado. Intenta de nuevo.</div>
                            {/* Mostrar detalle si existe para depuración */}
                            {typeof error === 'string' && error.includes('detalle:') && (
                                <div className="text-[10px] text-zinc-500 mt-2 break-all">{error}</div>
                            )}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-emerald-500 text-sm text-center bg-emerald-500/10 py-3 px-4 rounded-xl font-medium">
                            {successMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-purple-500/30 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Enlace'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setView('login')
                            setError(null)
                            setSuccessMsg(null)
                        }}
                        className="w-full text-zinc-500 dark:text-zinc-400 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        Volver al inicio de sesión
                    </button>
                </form>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                    <LogIn className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Bienvenido</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Accede a tu panel de agencias</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Contraseña</label>
                        <button
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}
                </button>
            </form>
        </motion.div>
    )
}
