import InvoiceForm from './invoice-form'

export default function NewInvoicePage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Crear Factura</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestión integral en una sola pantalla</p>
            </div>

            <InvoiceForm />
        </div>
    )
}
