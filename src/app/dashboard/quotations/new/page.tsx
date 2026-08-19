import React, { Suspense } from 'react'
import QuotationForm from './quotation-form'

export const dynamic = 'force-dynamic'

export default function NewQuotationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Crear Cotización</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestión integral en una sola pantalla</p>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-slate-400">Cargando formulario...</div>}>
                <QuotationForm />
            </Suspense>
        </div>
    )
}
