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

                const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await fetch('/api/quotations/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': loggedUser.id?.toString() || ''
                    },
                    body: JSON.stringify(data)
                })

                if (res.ok) {
                    const result = await res.json();
                    let successMsg = `Se importaron ${result.importedCount} cotizaciones exitosamente. `;
                    if (result.createdIds && result.createdIds.length > 0) {
                        successMsg += `IDs creados: ${result.createdIds.join(', ')}. `;
                    }
                    if (result.autoExport) {
                        if (result.autoExport.success) {
                            successMsg += 'Exportadas automáticamente a SQL Server.';
                        } else {
                            successMsg += `No se exportaron a SQL Server (${result.autoExport.message || 'Error'}).`;
                        }
                    }
                    setStatus({ type: 'success', message: successMsg })
                    if (fileInputRef.current) fileInputRef.current.value = ''
                } else {
                    const error = await res.json();
                    setStatus({ type: 'error', message: error.message || 'Error al procesar el archivo Excel.' })
                }
            } catch (err: any) {
                setStatus({ type: 'error', message: err.message || 'Ocurrió un error inesperado al leer el archivo.' })
            } finally {
                setImporting(false)
            }
        }
        reader.readAsBinaryString(file)
    }

    const downloadTemplate = () => {
        const templateData = [
            {
                Grupo_Cotizacion: '1',
                Cliente_Documento: '12345678',
                Sucursal_Codigo: 'BOG01',
                Implant_Codigo: 'IMP01',
                Vendedor_Codigo: 'VEN-001',
                Tiqueteador_Codigo: 'TIQ-001',
                Moneda: 'USD',
                Tasa_Cambio: 4000,
                Comision_Global_Pct: 10,
                Cargos_A_Cotizacion: 0,
                Producto_Codigo: 'AL-DES',
                Proveedor_Codigo: 'GHL',
                Prestadora_Codigo: 'GHL-BOG',
                Impuestos_Nombres_Y_Valores: 'IVA:95.50|FEE:10.00',
                Variables_Codigos_Y_Valores: 'TKT-VUELO:784561|PNR-RESERVA:XYZZ12',
                Pasajeros: 'Juan Perez:12345678|Maria Garcia:87654321',
                Precio_Unitario: 15.0,
                Cantidad: 2,
                CheckIn: '2026-12-01',
                CheckOut: '2026-12-10',
                Pax_Adultos: 2,
                Pax_Ninos: 0,
                Destino: 'BOG',
                Tipo_Servicio: 'ALIMENTACION',
                Reserva: 'RES123',
                Comision_Vendedor_Producto: 0,
                Comision_Tiqueteador_Producto: 0,
                Combo_Codigos: 'COM-001|COM-002',
                Cargo_Principal: ''
            },
            {
                Grupo_Cotizacion: '1',
                Cliente_Documento: '12345678',
                Sucursal_Codigo: 'BOG01',
                Implant_Codigo: 'IMP01',
                Vendedor_Codigo: 'VEN-001',
                Tiqueteador_Codigo: 'TIQ-001',
                Moneda: 'USD',
                Tasa_Cambio: 4000,
                Comision_Global_Pct: 10,
                Cargos_A_Cotizacion: 0,
                Producto_Codigo: 'TR-AERO',
                Proveedor_Codigo: 'DEC',
                Prestadora_Codigo: 'DEC-BARU',
                Impuestos_Nombres_Y_Valores: '',
                Variables_Codigos_Y_Valores: '',
                Pasajeros: '',
                Precio_Unitario: 25.0,
                Cantidad: 1,
                CheckIn: '',
                CheckOut: '',
                Pax_Adultos: 2,
                Pax_Ninos: 0,
                Destino: 'CTG',
                Tipo_Servicio: 'TRANSPORTE',
                Reserva: 'XXL123',
                Comision_Vendedor_Producto: 5,
                Comision_Tiqueteador_Producto: 2,
                Combo_Codigos: '',
                Cargo_Principal: 'IVA-19'
            }
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
