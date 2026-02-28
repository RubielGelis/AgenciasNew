'use client'

import React, { useRef, useState } from 'react'
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'

export default function ExcelImport() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importing, setImporting] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        setStatus(null)

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)

                console.log('Excel Data:', data)

                // En un escenario real, enviaríamos esto a un API
                // const res = await fetch('/api/quotations/import', { method: 'POST', body: JSON.stringify(data) })

                // Simulación de éxito
                setTimeout(() => {
                    setImporting(false)
                    setStatus({ type: 'success', message: `Se procesaron ${data.length} registros exitosamente.` })
                }, 1500)

            } catch (err) {
                setImporting(false)
                setStatus({ type: 'error', message: 'Error al procesar el archivo Excel.' })
            }
        }
        reader.readAsBinaryString(file)
    }

    const downloadTemplate = () => {
        const templateData = [
            { Cliente: 'Nombre', Documento: '12345', Producto: 'ALIMENTACION', Cantidad: 1, Precio: 100 },
        ]
        const ws = XLSX.utils.json_to_sheet(templateData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template')
        XLSX.writeFile(wb, 'plantilla_cotizacion.xlsx')
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Importación Masiva</h3>
                    <p className="text-zinc-500 text-sm">Carga cotizaciones desde un archivo Excel (.xlsx)</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:underline text-sm"
                >
                    <FileDown className="w-4 h-4" /> Descargar Plantilla
                </button>
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all group"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                />

                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {importing ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8 text-blue-600" />
                    )}
                </div>

                <p className="font-bold text-zinc-900 dark:text-white">
                    {importing ? 'Procesando archivo...' : 'Haz clic para cargar Excel'}
                </p>
                <p className="text-zinc-500 text-sm mt-1">O arrastra y suelta el archivo aquí</p>
            </div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "p-4 rounded-xl flex items-center gap-3",
                        status.type === 'success' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"
                    )}
                >
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{status.message}</span>
                </motion.div>
            )}
        </div>
    )
}
