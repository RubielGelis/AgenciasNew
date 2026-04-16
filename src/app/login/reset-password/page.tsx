'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Lock, Loader2, Check, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    if (!token) {
        return (
            <div className="text-center">
                <div className="text-red-500 font-bold mb-4 text-lg">Enlace inválido</div>
                <p className="text-zinc-500 mb-6">El enlace de recuperación no contiene un token válido.</p>
                <Link href="/login" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                </Link>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al actualizar contraseña')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
            >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">¡Contraseña Actualizada!</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Tu contraseña ha sido cambiada correctamente. Serás redirigido al inicio de sesión en unos segundos...</p>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <ShieldCheck className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Nueva Contraseña</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Crea una contraseña segura para tu cuenta</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nueva Contraseña</label>
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

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Restablecer Contraseña'}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-950">
            {/* Decorative gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Texture overlay */}
            <div className="absolute inset-x-0 inset-y-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="z-10 w-full px-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
                    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            <footer className="absolute bottom-10 text-zinc-600 dark:text-zinc-500 text-sm">
                &copy; {new Date().getFullYear()} KoreX. Todos los derechos reservados.
            </footer>
        </main>
    )
}
