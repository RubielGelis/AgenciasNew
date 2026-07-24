'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Trash2, Plus, ChevronDown, Calendar, Users, Globe, DollarSign, Briefcase, Hotel as HotelIcon, Tag, Tags, Percent, Calculator, ArrowRight, Loader2, FileDown, Paperclip, FileText, Download, X, Printer, CreditCard } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { generateQuotationPDF } from '@/lib/pdf-utils'
import { SearchSelect } from '@/components/SearchSelect'
import ItemPaymentModal from '@/app/dashboard/invoices/new/ItemPaymentModal'


interface QuotationFormData {
    clientId: string;
    branchId: string;
    implantId: string;
    currency: string;
    exchangeRate: number;
    sellerId: string;
    ticketPrinterId: string;
    commissionPercentage: number;
    chargesAndTaxes: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
        cost: number;
        providerId: string;
        prestadoraId: string;
        checkIn: string;
        checkOut: string;
        paxAdults: number;
        paxChildren: number;
        destination: string;
        serviceType: string;
        reservationCode: string;
        service?: string;
        servicios?: string;
        descripcion?: string;
        passengers: { name: string, document: string }[];
        sellerCommission: number;
        ticketPrinterCommission: number;
        mainTaxId?: number;
        appliedTaxes: { id?: number, name?: string, amount: number }[],
        variables: { id?: number, masterVariableId: number, value: string }[];
        payments?: { amount: number, paymentMethod: string, date: string, reference: string, creditCardId?: number, cardNumber?: string, authorizationCode?: string, voucher?: string, expirationDate?: string }[];
        isPaymentModalOpen?: boolean;
        comboId?: number;
        inNationality?: number;
        _productName?: string;
        _providerName?: string;
        _prestadoraName?: string;
    }[];
    selectedCombos?: { id: number, name: string }[];
    state: string;
}

export default function QuotationForm({ quotationId }: { quotationId?: string }) {
    const [data, setData] = useState<any>(null)
    const [formData, setFormData] = useState<QuotationFormData>({
        clientId: '',
        branchId: '',
        implantId: '',
        currency: 'USD',
        exchangeRate: 1,
        sellerId: '',
        ticketPrinterId: '',
        commissionPercentage: 10,
        chargesAndTaxes: 0,
        items: [],
        selectedCombos: [],
        state: 'Nuevo'
    })
    const [saving, setSaving] = useState(false)
    const [attachments, setAttachments] = useState<any[]>([])
    const [uploadingAttachment, setUploadingAttachment] = useState(false)
    const router = useRouter()

    const handleSave = async (e: React.FormEvent, downloadPdf = false) => {
        e.preventDefault();
        // Synchronously open a blank window if printing, to bypass browser popup blockers
        const printWindow = downloadPdf ? window.open('about:blank', '_blank') : null;
        setSaving(true)
        try {
            const payload = {
                ...formData,
                clientId: formData.clientId || null,
                branchId: formData.branchId || null,
                implantId: formData.implantId || null,
                sellerId: formData.sellerId || null,
                ticketPrinterId: formData.ticketPrinterId || null,
                totalAmount: total,
                combos: (formData.selectedCombos || []).map(c => ({ comboId: c.id })),
                items: formData.items.map(item => {
                    const taxes: any[] = [];

                    // Add main tax if exists
                    if (item.mainTaxId) {
                        const amount = item.price * item.quantity;
                        taxes.push({ chargeAndTaxId: item.mainTaxId, explicitAmount: amount });
                    }

                    // Add secondary taxes
                    (item.appliedTaxes || []).forEach(t => {
                        const taxId = t.id || (t as any).chargeAndTaxId;
                        if (taxId && taxId !== item.mainTaxId) {
                            taxes.push({ chargeAndTaxId: taxId, explicitAmount: t.amount });
                        }
                    });

                    return {
                        ...item,
                        productId: item.productId || null,
                        providerId: item.providerId || null,
                        prestadoraId: item.prestadoraId || null,
                        cost: item.cost || 0,
                        service: item.service || item.servicios || '',
                        servicios: item.servicios || item.service || '',
                        payments: Array.isArray(item.payments) ? item.payments : [],
                        appliedTaxes: taxes,
                        variables: item.variables || []
                    };
                })
            }

            const endpoint = quotationId ? `/api/quotations/${quotationId}` : '/api/quotations';
            const method = quotationId ? 'PUT' : 'POST';
            const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error al guardar')

            if (downloadPdf && printWindow) {
                try {
                    const targetId = result.quotation?.id || quotationId;
                    if (targetId) {
                        printWindow.location.href = `/dashboard/quotations/print?idIni=${targetId}&idFin=${targetId}`;
                    } else {
                        printWindow.close();
                    }
                } catch (printErr) {
                    console.error('Error opening print page:', printErr);
                    printWindow.close();
                }
            } else {
                if (printWindow) printWindow.close();
                const successMessage = result.message || 'Cotización guardada exitosamente';
                alert(successMessage);
            }

            router.push('/dashboard')
        } catch (err: any) {
            if (printWindow) {
                try { printWindow.close(); } catch (e) {}
            }
            console.error(err)
            alert(err.message || 'Ocurrió un error al guardar la cotización')
        } finally {
            setSaving(false)
        }
    }

    const fetchAttachments = async () => {
        if (!quotationId) return
        try {
            const res = await fetch(`/api/quotations/${quotationId}/attachments`)
            if (res.ok) {
                const data = await res.json()
                setAttachments(data)
            }
        } catch (err) {
            console.error("Error fetching attachments:", err)
        }
    }

    const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !quotationId) return

        setUploadingAttachment(true)
        try {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = async () => {
                const base64 = reader.result as string
                const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await fetch(`/api/quotations/${quotationId}/attachments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': loggedUser.id?.toString() || ''
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        fileUrl: base64
                    })
                })

                if (res.ok) {
                    fetchAttachments()
                } else {
                    const result = await res.json()
                    alert(result.message || 'Error al cargar adjunto')
                }
            }
        } catch (err) {
            console.error(err)
            alert('Error al procesar el archivo')
        } finally {
            setUploadingAttachment(false)
            e.target.value = ''
        }
    }

    const handleDeleteAttachment = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este adjunto?')) return
        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            const res = await fetch(`/api/quotations/${quotationId}/attachments?attachmentId=${id}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': loggedUser.id?.toString() || ''
                }
            })
            if (res.ok) {
                fetchAttachments()
            }
        } catch (err) {
            console.error(err)
            alert('Error al eliminar adjunto')
        }
    }

    const handleDownloadAttachment = (attachment: any) => {
        const link = document.createElement('a')
        link.href = attachment.fileUrl
        link.download = attachment.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Get unique taxes that have been applied anywhere, and sum their amounts
    const taxSummary = React.useMemo(() => {
        const summary: Record<string, number> = {}
        if (!data?.taxes) return summary;

        formData.items.forEach(item => {
            // All charges and taxes are now consolidated in appliedTaxes
            (item.appliedTaxes || []).forEach(tax => {
                const rawTaxId = (tax as any).id ?? (tax as any).chargeAndTaxId;
                const taxId = rawTaxId != null ? Number(rawTaxId) : null;
                const master = data.taxes.find((t: any) => Number(t.id) === taxId);
                const name = master ? master.name : ((tax as any).name || 'Otros');
                summary[name] = (summary[name] || 0) + (tax.amount || 0);
            });
        });
        return summary;
    }, [formData.items, data?.taxes]);

    const total = Object.values(taxSummary).reduce((sum, val) => sum + val, 0);

    const handleCalculateTaxes = (index: number) => {
        const item = formData.items[index];
        if (!item.mainTaxId || item.price <= 0) {
            alert("Selecciona un Cargo Principal y escribe su valor primero antes de calcular.");
            return;
        }
        const baseValue = item.price * item.quantity;
        const newAppliedTaxes = item.appliedTaxes.map((taxApp: any) => {
            const rawTaxId = taxApp.id ?? taxApp.chargeAndTaxId;
            const taxId = rawTaxId != null ? Number(rawTaxId) : null;
            const taxMaster = data.taxes.find((t: any) => Number(t.id) === taxId);
            if (taxMaster && taxMaster.valueType === 'PERCENTAGE') {
                return { ...taxApp, amount: parseFloat(((baseValue * taxMaster.value) / 100).toFixed(2)) };
            }
            return taxApp;
        });
        updateItem(index, 'appliedTaxes', newAppliedTaxes);
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const loggedUserCache = JSON.parse(localStorage.getItem('user') || '{}');
                const baseRes = await fetch('/api/quotations/base-data', {
                    headers: { 'X-User-Id': loggedUserCache.id?.toString() || '' }
                })
                const baseData = await baseRes.json()
                if (baseRes.ok && baseData?.clients) {
                    setData(baseData)
                } else {
                    console.error("No valid data received from base-data:", baseData)
                    setData({ clients: [], providers: [], prestadoras: [], branches: [], implants: [], products: [], taxes: [], sellers: [], ticketPrinters: [], variables: [], combos: [] })
                }

                if (!quotationId) {
                    try {
                        const defaultUser = baseData?.currentUser || loggedUserCache;
                        setFormData((prev: any) => ({
                            ...prev,
                            branchId: defaultUser.branchId?.toString() || '',
                            implantId: defaultUser.implantId?.toString() || '',
                            ticketPrinterId: defaultUser.ticketPrinterId?.toString() || ''
                        }));
                    } catch (e) {
                        // Ignore parse error
                    }
                }

                if (quotationId) {
                    fetchAttachments()
                    const qRes = await fetch(`/api/quotations/${quotationId}`)
                    if (qRes.ok) {
                        const qData = await qRes.json()
                        setFormData({
                            clientId: qData.clientId?.toString() || '',
                            branchId: qData.branchId?.toString() || '',
                            implantId: qData.implantId?.toString() || '',
                            currency: qData.currency || 'USD',
                            exchangeRate: qData.exchangeRate,
                            sellerId: qData.sellerId?.toString() || '',
                            ticketPrinterId: qData.ticketPrinterId?.toString() || '',
                            commissionPercentage: qData.commissionPercentage || 0,
                            chargesAndTaxes: qData.chargesAndTaxes || 0,
                            state: qData.state || 'Nuevo',
                            items: (qData.products || []).map((p: any) => {
                                const safeAppliedTaxes = Array.isArray(p.appliedTaxes) ? p.appliedTaxes : [];
                                const safeVariables = Array.isArray(p.variables) ? p.variables : [];

                                const mainTaxId = p.mainTaxId;

                                // Inferir el precio desde el monto del cargo principal guardado
                                const mainTaxEntry = safeAppliedTaxes.find((t: any) => t.chargeAndTaxId === mainTaxId);
                                let inferredPrice = p.price;
                                if (mainTaxEntry && mainTaxEntry.explicitAmount != null) {
                                    inferredPrice = mainTaxEntry.explicitAmount / (p.quantity || 1);
                                }

                                return {
                                    productId: p.productId?.toString() || '',
                                    quantity: p.quantity,
                                    price: inferredPrice,
                                    cost: p.cost || 0,
                                    providerId: p.providerId?.toString() || '',
                                    prestadoraId: p.prestadoraId?.toString() || '',
                                    checkIn: p.checkInDate ? new Date(p.checkInDate).toISOString().split('T')[0] : '',
                                    checkOut: p.checkOutDate ? new Date(p.checkOutDate).toISOString().split('T')[0] : '',
                                    paxAdults: p.paxAdults || 1,
                                    paxChildren: p.paxChildren || 0,
                                    destination: p.destination || '',
                                    serviceType: p.serviceType || '',
                                    reservationCode: p.reservationCode || '',
                                    service: p.service || p.servicios || '',
                                    servicios: p.servicios || p.service || '',
                                    descripcion: p.descripcion || '',
                                    passengers: Array.isArray(p.passengers) ? p.passengers : [],
                                    payments: Array.isArray(p.payments) ? p.payments : [],
                                    sellerCommission: p.sellerCommission || 0,
                                    ticketPrinterCommission: p.ticketPrinterCommission || 0,
                                    mainTaxId,
                                    inNationality: p.inNationality || 1,
                                    // Info extra para renderizado si el maestro no carga a tiempo
                                    _productName: p.product?.description,
                                    _providerName: p.provider?.name,
                                    _prestadoraName: p.prestadora?.name,
                                    appliedTaxes: safeAppliedTaxes.map((t: any) => ({
                                        chargeAndTaxId: t.chargeAndTaxId,
                                        amount: t.explicitAmount ?? 0
                                    })),
                                    variables: safeVariables.map((v: any) => ({
                                        id: v.id,
                                        masterVariableId: v.masterVariableId,
                                        value: v.value
                                    }))
                                }
                            }) || [],
                            selectedCombos: qData.combos?.map((c: any) => ({ id: c.comboId, name: c.combo?.name })) || []
                        })
                    }
                }
            } catch (err) {
                console.error("Failed to load generic or quotation data", err);
                setData({ clients: [], providers: [], prestadoras: [], branches: [], implants: [], products: [], taxes: [], sellers: [], ticketPrinters: [], variables: [], combos: [] })
            }
        }
        loadInitialData()
    }, [quotationId])

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, {
                productId: '', quantity: 1, price: 0, cost: 0,
                providerId: '', prestadoraId: '', checkIn: '', checkOut: '',
                paxAdults: 1, paxChildren: 0, destination: '', serviceType: '', reservationCode: '', descripcion: '', passengers: [{ name: '', document: '' }],
                sellerCommission: 0, ticketPrinterCommission: 0,
                appliedTaxes: [],
                variables: [],
                inNationality: 1
            }]
        })
    }

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        })
    }

    const addCombo = (comboId: number) => {
        const combo = data.combos.find((c: any) => c.id === comboId);
        if (!combo) return;

        // Prevent duplicate combos if needed, or just add products again
        const alreadyIn = formData.selectedCombos?.find(c => c.id === comboId);
        if (alreadyIn) {
            alert("Este combo ya ha sido agregado.");
            return;
        }

        const newItemsFromCombo = combo.products.map((cp: any) => {
            // Usar mainTaxId directamente desde el combo guardado en BD
            const mainTaxId: number | undefined = cp.mainTaxId || undefined;

            // Incluir TODOS los taxes en appliedTaxes (incluido el cargo principal)
            // igual a como funcionan los ítems creados manualmente
            const appliedTaxes = (cp.appliedTaxes || []).map((t: any) => ({
                id: t.chargeAndTaxId,
                amount: t.amount
            }));

            return {
                productId: cp.productId.toString(),
                quantity: 1,
                price: cp.price,
                cost: cp.product?.cost || 0,
                providerId: cp.providerId?.toString() || '',
                prestadoraId: cp.prestadoraId?.toString() || '',
                checkIn: cp.checkInDate ? new Date(cp.checkInDate).toISOString().split('T')[0] : '',
                checkOut: cp.checkOutDate ? new Date(cp.checkOutDate).toISOString().split('T')[0] : '',
                paxAdults: cp.paxAdults || 1,
                paxChildren: cp.paxChildren || 0,
                destination: '',
                serviceType: '',
                reservationCode: '',
                descripcion: '',
                passengers: [],
                sellerCommission: 0,
                ticketPrinterCommission: 0,
                mainTaxId,
                appliedTaxes,
                variables: [],
                comboId: combo.id,
                inNationality: cp.inNationality || 1
            };
        });

        let newCurrency = formData.currency;
        let newExchangeRate = formData.exchangeRate;
        if (combo.currencyId && data.currencies) {
            const comboCurrency = data.currencies.find((c: any) => c.id === combo.currencyId);
            if (comboCurrency) {
                newCurrency = comboCurrency.code;
                newExchangeRate = comboCurrency.exchangeRate;
            }
        }

        setFormData({
            ...formData,
            currency: newCurrency,
            exchangeRate: newExchangeRate,
            items: [...formData.items, ...newItemsFromCombo],
            selectedCombos: [...(formData.selectedCombos || []), { id: combo.id, name: combo.name }]
        });
    }

    const removeCombo = (comboId: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter(item => item.comboId !== comboId),
            selectedCombos: (formData.selectedCombos || []).filter(c => c.id !== comboId)
        });
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items]
        const item = { ...newItems[index], [field]: value }

        // AUTO-RECALCULATE: Manejo de cambios en Cantidad, Precio o Cargo Principal
        if (field === 'quantity' || field === 'price' || field === 'mainTaxId') {
            const oldItem = newItems[index];
            const newItem = { ...oldItem, [field]: value };
            const oldQty = oldItem.quantity || 1;
            const newQty = newItem.quantity || 1;
            const ratio = field === 'quantity' ? newQty / oldQty : 1;

            const baseValue = (newItem.price || 0) * newQty;
            const mainTaxIdNum = newItem.mainTaxId != null ? Number(newItem.mainTaxId) : null;

            newItem.appliedTaxes = (oldItem.appliedTaxes || []).map((t: any) => {
                const rawTaxId = t.id ?? t.chargeAndTaxId;
                const taxId = rawTaxId != null ? Number(rawTaxId) : null;

                // 1. El Cargo principal siempre escala proporcionalmente al precio total
                if (mainTaxIdNum != null && taxId === mainTaxIdNum) {
                    return { ...t, amount: baseValue };
                }

                // 2. Los impuestos porcentuales se recalculan sobre la nueva base (Precio Unitario * Cantidad)
                const taxMaster = data?.taxes?.find((m: any) => Number(m.id) === taxId);
                if (taxMaster && taxMaster.valueType === 'PERCENTAGE') {
                    return { ...t, amount: parseFloat(((baseValue * taxMaster.value) / 100).toFixed(2)) };
                }

                // 3. Otros cargos (fijos o manuales): 
                // Si cambió la cantidad, escalan proporcionalmente (Ej: $10 -> $20 si duplicas)
                // Si cambió el precio, se mantienen (Ej: un cargo fijo de $10 no depende del precio del producto)
                if (field === 'quantity') {
                    return { ...t, amount: parseFloat((t.amount * ratio).toFixed(2)) };
                }

                return t;
            });

            newItems[index] = newItem;
            setFormData({ ...formData, items: newItems });
            return; // Salir aquí ya que ya actualizamos el estado
        }

        newItems[index] = item
        setFormData({ ...formData, items: newItems })
    }

    if (!data) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    )

    return (
        <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">
                        {quotationId ? `Cotización #${quotationId}` : 'Generar Cotización'}
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Completa los detalles para tu cliente</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSave(e as any, true)}
                        disabled={saving}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        title="Imprimir Cotización"
                    >
                        <Printer className="w-5 h-5" />
                        Imprimir
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section: Client & Origin */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                            <Users className="w-5 h-5 text-blue-500" />
                            Cliente y Origen
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Cliente</label>
                                <SearchSelect
                                    options={data.clients}
                                    value={formData.clientId}
                                    onChange={(val) => setFormData({ ...formData, clientId: val })}
                                    placeholder="Seleccionar Cliente"
                                    secondaryKey="document"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Vendedor</label>
                                <SearchSelect
                                    options={data.sellers || []}
                                    value={formData.sellerId}
                                    onChange={(val) => setFormData({ ...formData, sellerId: val })}
                                    placeholder="Seleccionar Vendedor"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Sucursal</label>
                                <SearchSelect
                                    options={data.branches}
                                    value={formData.branchId}
                                    onChange={(val) => setFormData({ ...formData, branchId: val, implantId: '' })}
                                    placeholder="Sel. Sucursal"
                                    secondaryKey="code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Implant</label>
                                <SearchSelect
                                    options={data.implants.filter((i: any) => i.branchId?.toString() === formData.branchId)}
                                    value={formData.implantId}
                                    onChange={(val) => setFormData({ ...formData, implantId: val })}
                                    disabled={!formData.branchId}
                                    placeholder="Sel. Implant"
                                    secondaryKey="code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Tiqueteador</label>
                                <SearchSelect
                                    options={data.ticketPrinters || []}
                                    value={formData.ticketPrinterId}
                                    onChange={(val) => setFormData({ ...formData, ticketPrinterId: val })}
                                    placeholder="Sel. Tiqueteador"
                                    secondaryKey="code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Moneda a Cotizar</label>
                                <select
                                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.currency}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        const curr = data.currencies?.find((c: any) => c.code === code);
                                        setFormData({
                                            ...formData,
                                            currency: code,
                                            exchangeRate: curr ? curr.exchangeRate : 1
                                        });
                                    }}
                                >
                                    {(data.currencies || [{ code: 'USD', name: 'Dólar Estadounidense' }]).map((c: any) => (
                                        <option key={c.id || c.code} value={c.code}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-500">Estado de Cotización</label>
                                <select
                                    className={cn(
                                        "w-full h-12 rounded-xl px-4 border outline-none font-bold focus:ring-2 transition-all",
                                        formData.state === 'ENVIADO' 
                                            ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500" 
                                            : "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                                    )}
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                >
                                    <option value="Nuevo">NUEVO</option>
                                    <option value="ENVIADO">ENVIADO</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Combos */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                <Briefcase className="w-5 h-5 text-purple-500" />
                                Combos de Venta
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-[300px]">
                                    <SearchSelect
                                        options={(data.combos || []).map((c: any) => ({...c, cuposText: c.cupos != null ? `${c.cupos} cupos` : 'Sin límite'}))}
                                        value=""
                                        onChange={(val) => {
                                            if (val) addCombo(parseInt(val));
                                        }}
                                        placeholder="+ Agregar un Combo..."
                                        secondaryKey="cuposText"
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.selectedCombos && formData.selectedCombos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.selectedCombos.map(combo => (
                                    <div key={combo.id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-xl border border-purple-100 dark:border-purple-800 text-xs font-bold animate-in fade-in zoom-in duration-300">
                                        <Briefcase className="w-3 h-3" />
                                        {combo.name}
                                        <button
                                            type="button"
                                            onClick={() => removeCombo(combo.id)}
                                            className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-xs italic">No has seleccionado ningún combo para esta cotización.</p>
                        )}
                    </div>



                    {/* Section: Products Grid */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                <Tag className="w-5 h-5 text-emerald-500" />
                                Desglose de Productos
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-emerald-600 font-bold flex items-center gap-1 hover:underline text-sm"
                            >
                                <Plus className="w-4 h-4" /> Agregar Producto
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {formData.items.length === 0 && (
                                    <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400">
                                        No hay productos agregados.
                                    </div>
                                )}
                                {formData.items.map((item, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={index}
                                        className="grid grid-cols-12 gap-4 items-end bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <div className="col-span-12 md:col-span-3 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Producto</label>
                                            <SearchSelect
                                                options={data.products || []}
                                                value={item.productId}
                                                onChange={(val) => {
                                                    const p = data.products.find((prod: any) => prod.id.toString() === val);
                                                    const newItems = [...formData.items];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        productId: val,
                                                        price: 0,
                                                        cost: p?.cost || 0
                                                    };
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                placeholder="Seleccionar Producto"
                                                labelKey="description"
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-sm"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-6 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] uppercase font-bold text-zinc-400">Cargo Principal / Valor Total (Sumatoria)</label>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 h-11 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-800 outline-none text-xs font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500"
                                                    value={item.mainTaxId || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                        const master = data.taxes.find((t: any) => t.id === val);
                                                        const newItems = [...formData.items];
                                                        const currentItem = newItems[index];

                                                        let nextTaxes = [...(currentItem.appliedTaxes || [])];
                                                        let newPrice = currentItem.price;

                                                        if (val) {
                                                            const existingTaxIdx = nextTaxes.findIndex((t: any) => (t.id || t.chargeAndTaxId) === val);
                                                            if (existingTaxIdx !== -1) {
                                                                newPrice = nextTaxes[existingTaxIdx].amount / (currentItem.quantity || 1);
                                                            } else {
                                                                newPrice = master ? master.value : currentItem.price;
                                                                const initialAmount = master ? (master.valueType === 'PERCENTAGE' ? (newPrice * currentItem.quantity * master.value / 100) : master.value * currentItem.quantity) : 0;
                                                                nextTaxes.push({ id: val, amount: initialAmount });
                                                            }
                                                        }

                                                        newItems[index] = {
                                                            ...currentItem,
                                                            mainTaxId: val,
                                                            price: newPrice,
                                                            appliedTaxes: nextTaxes
                                                        };
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                >
                                                    <option value="">Selecciona Master...</option>
                                                    {(data.taxes || []).map((t: any) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                                                </select>

                                                <div className="relative w-40">
                                                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                                                    <input
                                                        type="number"
                                                        className="w-full h-11 bg-white dark:bg-zinc-900 rounded-lg pl-7 pr-2 border border-blue-200 dark:border-blue-800 outline-none text-sm font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                                                        value={((item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0)).toFixed(2)}
                                                        onChange={(e) => {
                                                            const newTotal = parseFloat(e.target.value) || 0;
                                                            const currentTaxes = item.appliedTaxes || [];
                                                            const currentTotal = currentTaxes.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

                                                            // Calculate how much we need to add to the main tax
                                                            const diff = newTotal - currentTotal;

                                                            const mainTaxIdNum = item.mainTaxId != null ? Number(item.mainTaxId) : null;
                                                            const mainTax = currentTaxes.find((t: any) => {
                                                                const rawId = t.id ?? t.chargeAndTaxId;
                                                                return rawId != null && Number(rawId) === mainTaxIdNum;
                                                            });

                                                            if (mainTax) {
                                                                const newMainAmount = (mainTax.amount || 0) + diff;
                                                                updateItem(index, 'price', newMainAmount / (item.quantity || 1));
                                                            } else {
                                                                updateItem(index, 'price', newTotal / (item.quantity || 1));
                                                            }
                                                        }}
                                                        placeholder="V. Total"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Per-Product Details Row */}
                                        <div className="col-span-12 mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3">Detalles de Proveedor y Pasajero</p>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-2 grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-bold text-zinc-400">Proveedor</label>
                                                        <SearchSelect
                                                            options={data.providers || []}
                                                            value={item.providerId}
                                                            onChange={(val) => updateItem(index, 'providerId', val)}
                                                            placeholder="Sel. Proveedor"
                                                            secondaryKey="code"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-bold text-zinc-400">Nacionalidad</label>
                                                        <select
                                                            className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                                                            value={item.inNationality || 1}
                                                            onChange={(e) => updateItem(index, 'inNationality', parseInt(e.target.value))}
                                                        >
                                                            <option value={1}>Nacional</option>
                                                            <option value={2}>Internacional</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Prestadora</label>
                                                    <SearchSelect
                                                        options={data.prestadoras || []}
                                                        value={item.prestadoraId}
                                                        onChange={(val) => updateItem(index, 'prestadoraId', val)}
                                                        placeholder="Sel. Prestadora"
                                                        secondaryKey="code"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Check-In</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs p-1"
                                                        value={item.checkIn}
                                                        onChange={(e) => updateItem(index, 'checkIn', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Check-Out</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs p-1"
                                                        value={item.checkOut}
                                                        onChange={(e) => updateItem(index, 'checkOut', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Adultos</label>
                                                    <input type="number" min="1" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.paxAdults} onChange={(e) => updateItem(index, 'paxAdults', parseInt(e.target.value))} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Niños</label>
                                                    <input type="number" min="0" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.paxChildren} onChange={(e) => updateItem(index, 'paxChildren', parseInt(e.target.value))} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Destino</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.destination} onChange={(e) => updateItem(index, 'destination', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Servicio / Tipo</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.serviceType} onChange={(e) => updateItem(index, 'serviceType', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-zinc-400">Reservación</label>
                                                    <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={item.reservationCode} onChange={(e) => updateItem(index, 'reservationCode', e.target.value)} />
                                                </div>
                                                 <div className="space-y-1 md:col-span-2">
                                                     <label className="text-[10px] uppercase font-bold text-blue-500">Servicio</label>
                                                     <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.servicios || item.service || ''} onChange={(e) => { updateItem(index, 'servicios', e.target.value); updateItem(index, 'service', e.target.value); }} placeholder="Servicio (ej. Desayuno incluido, Traslado VIP)..." />
                                                 </div>
                                                 <div className="space-y-1 md:col-span-2">
                                                     <label className="text-[10px] uppercase font-bold text-blue-500">Descripción Manual</label>
                                                     <input type="text" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs" value={item.descripcion || ''} onChange={(e) => updateItem(index, 'descripcion', e.target.value)} placeholder="Descripción manual del producto..." />
                                                 </div>
                                            </div>

                                            <div className="col-span-12 mt-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                 <div>
                                                     <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Pagos Registrados</p>
                                                     <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                         Total: ${((item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0) || (item.price || 0) * (item.quantity || 1)).toLocaleString(undefined, {minimumFractionDigits: 2})} | Pagado: ${((item.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                     </p>
                                                 </div>
                                                 <button type="button" onClick={() => updateItem(index, 'isPaymentModalOpen', true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all">
                                                     <CreditCard className="w-3.5 h-3.5" /> Administrar Pagos
                                                 </button>
                                             </div>
                                             <ItemPaymentModal
                                                 isOpen={item.isPaymentModalOpen || false}
                                                 onClose={() => updateItem(index, 'isPaymentModalOpen', false)}
                                                 productName={item.productId ? (data?.products?.find((p:any) => p.id.toString() === item.productId?.toString())?.description || 'Producto') : 'Producto sin nombre'}
                                                 itemTotal={(item.appliedTaxes || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0) || (item.price || 0) * (item.quantity || 1)}
                                                 payments={item.payments || []}
                                                 onUpdatePayments={(payments) => updateItem(index, 'payments', payments)}
                                                 creditCards={data?.creditCards || []}
                                                 paymentsList={data?.payments || []}
                                             />

                                            {/* Dynamic Passengers Array - Visible only if NOT a combo item */}
                                            {!item.comboId && (
                                                <div className="mt-4 space-y-2">
                                                    <p className="text-[10px] uppercase font-bold text-zinc-400 flex justify-between items-center">
                                                        Detalle de Pasajeros
                                                        <button type="button" onClick={() => {
                                                            const p = [...(item.passengers || [])];
                                                            p.push({ name: '', document: '' });
                                                            updateItem(index, 'passengers', p);
                                                        }} className="text-blue-500 font-medium hover:underline lowercase text-xs flex items-center gap-1">+ agregar pasajero</button>
                                                    </p>
                                                    {(item.passengers || []).map((pax: any, pIdx: number) => (
                                                        <div key={pIdx} className="flex gap-2">
                                                            <input type="text" placeholder="Nombre" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={pax.name} onChange={(e) => {
                                                                const newPass = [...item.passengers];
                                                                newPass[pIdx] = { ...pax, name: e.target.value };
                                                                updateItem(index, 'passengers', newPass);
                                                            }} />
                                                            <input type="text" placeholder="Documento" className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs" value={pax.document} onChange={(e) => {
                                                                const newPass = [...item.passengers];
                                                                newPass[pIdx] = { ...pax, document: e.target.value };
                                                                updateItem(index, 'passengers', newPass);
                                                            }} />
                                                            <button type="button" onClick={() => {
                                                                const newPass = item.passengers.filter((_: any, idx: number) => idx !== pIdx);
                                                                updateItem(index, 'passengers', newPass);
                                                            }} className="text-red-400 p-2 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-orange-500 dark:text-orange-400">Costo ($)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-orange-200 dark:border-orange-800 outline-none text-xs font-bold text-orange-600 dark:text-orange-400 focus:ring-1 focus:ring-orange-400"
                                                        value={item.cost ?? 0}
                                                        onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Com. Vend. ($)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs font-bold"
                                                        value={item.sellerCommission}
                                                        onChange={(e) => updateItem(index, 'sellerCommission', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Com. Tiq. ($)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs font-bold"
                                                        value={item.ticketPrinterCommission}
                                                        onChange={(e) => updateItem(index, 'ticketPrinterCommission', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Taxes Row */}
                                        <div className="col-span-12 mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3 flex items-center justify-between">
                                                <span>Cargos e Impuestos Adicionales</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCalculateTaxes(index)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs transition-all flex items-center gap-1 shadow-sm"
                                                >
                                                    <Calculator className="w-3 h-3" /> Calcular Impuestos (%)
                                                </button>
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                {data.taxes.length === 0 && (
                                                    <span className="text-xs text-zinc-400 font-medium">No hay cargos maestros configurados.</span>
                                                )}

                                                {/* Render all taxes (Now including Principal for easier editing) */}
                                                {(data.taxes || []).map((tax: any) => {
                                                    const taxIdNum = Number(tax.id);
                                                    const appliedTax = item.appliedTaxes?.find((t: any) => {
                                                        const rawId = (t as any).id ?? (t as any).chargeAndTaxId;
                                                        return rawId != null && Number(rawId) === taxIdNum;
                                                    });
                                                    const isChecked = !!appliedTax;
                                                    const isPrincipal = item.mainTaxId != null && Number(item.mainTaxId) === taxIdNum;

                                                    return (
                                                        <div key={tax.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                            <div className="flex items-center gap-2 min-w-[200px]">
                                                                <label className={cn(
                                                                    "flex items-center gap-2 cursor-pointer text-sm font-bold flex-1",
                                                                    isPrincipal ? "text-blue-600 dark:text-blue-400" : (isChecked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400")
                                                                )}>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            const currentTaxes = item.appliedTaxes || [];
                                                                            const taxIdNum = Number(tax.id);
                                                                            const mainTaxIdNum = item.mainTaxId != null ? Number(item.mainTaxId) : null;

                                                                            if (checked) {
                                                                                let initialAmount = 0;
                                                                                const baseValue = item.price * item.quantity;
                                                                                if (tax.valueType === 'PERCENTAGE') {
                                                                                    initialAmount = (baseValue * tax.value) / 100;
                                                                                } else {
                                                                                    initialAmount = tax.value * item.quantity;
                                                                                }
                                                                                const nextTaxes = [...currentTaxes, { id: taxIdNum, amount: initialAmount }];

                                                                                // AUTO-PROMOTE to principal if none exists
                                                                                if (mainTaxIdNum === null) {
                                                                                    const newItems = [...formData.items];
                                                                                    const newPrice = initialAmount / (item.quantity || 1);
                                                                                    newItems[index] = { ...item, mainTaxId: taxIdNum, price: newPrice, appliedTaxes: nextTaxes };
                                                                                    setFormData({ ...formData, items: newItems });
                                                                                } else {
                                                                                    updateItem(index, 'appliedTaxes', nextTaxes);
                                                                                }
                                                                            } else {
                                                                                const nextTaxes = currentTaxes.filter((t: any) => {
                                                                                    const rawId = t.id ?? t.chargeAndTaxId;
                                                                                    return rawId != null && Number(rawId) !== taxIdNum;
                                                                                });
                                                                                if (mainTaxIdNum === taxIdNum) {
                                                                                    const newItems = [...formData.items];
                                                                                    newItems[index] = { ...item, mainTaxId: undefined, appliedTaxes: nextTaxes };
                                                                                    setFormData({ ...formData, items: newItems });
                                                                                } else {
                                                                                    updateItem(index, 'appliedTaxes', nextTaxes);
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span>{tax.name} {isPrincipal && <span className="text-[9px] bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded ml-1 uppercase">Principal</span>}</span>
                                                                    <span className="opacity-50 text-[10px] ml-auto">({tax.valueType === 'PERCENTAGE' ? `${tax.value}%` : `$${tax.value}`})</span>
                                                                </label>
                                                            </div>

                                                            {isChecked && (
                                                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 py-1">
                                                                    <span className="text-xs font-bold text-zinc-500">Valor Cobrado:</span>
                                                                    <div className="relative w-32">
                                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className={cn(
                                                                                "w-full h-8 bg-white dark:bg-zinc-900 rounded-lg pl-7 pr-3 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all",
                                                                                tax.isEditable === false && !isPrincipal && "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-800"
                                                                            )}
                                                                            value={appliedTax.amount}
                                                                            disabled={tax.isEditable === false && !isPrincipal}
                                                                            onChange={(e) => {
                                                                                const val = parseFloat(e.target.value) || 0;
                                                                                const taxIdNum = Number(tax.id);
                                                                                const mainTaxIdNum = item.mainTaxId != null ? Number(item.mainTaxId) : null;

                                                                                // Si estoy editando el rubro que es principal, actualizar por precio
                                                                                if (mainTaxIdNum === taxIdNum) {
                                                                                    updateItem(index, 'price', val / (item.quantity || 1));
                                                                                } else {
                                                                                    // Si es un rubro secundario, solo actualizar su monto
                                                                                    const newTaxes = (item.appliedTaxes || []).map((t: any) => {
                                                                                        const rawId = t.id ?? t.chargeAndTaxId;
                                                                                        return rawId != null && Number(rawId) === taxIdNum ? { ...t, amount: val } : t;
                                                                                    });
                                                                                    updateItem(index, 'appliedTaxes', newTaxes);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-[10px] text-zinc-400 leading-tight md:ml-2">
                                                                        Puedes modificar este valor <br className="hidden md:block" /> manualmente.
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Additional Variables Row - Visible only if NOT a combo item */}
                                        {!item.comboId && (
                                            <div className="col-span-12 mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3">
                                                    Variables Adicionales (Maestro)
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {(!data.variables || data.variables.length === 0) && (
                                                        <span className="text-xs text-zinc-400 font-medium">No hay variables adicionales configuradas.</span>
                                                    )}

                                                    {data.variables?.map((vMaster: any) => {
                                                        const assigned = item.variables?.find((v: any) => v.masterVariableId === vMaster.id);
                                                        const isSelected = !!assigned;

                                                        return (
                                                            <div key={vMaster.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                                <div className="flex items-center gap-2 min-w-[200px]">
                                                                    <label className={cn(
                                                                        "flex items-center gap-2 cursor-pointer text-sm font-bold flex-1",
                                                                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"
                                                                    )}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                            checked={isSelected}
                                                                            onChange={(e) => {
                                                                                const checked = e.target.checked;
                                                                                const currentVars = item.variables || [];
                                                                                if (checked) {
                                                                                    updateItem(index, 'variables', [...currentVars, { masterVariableId: vMaster.id, value: '' }]);
                                                                                } else {
                                                                                    updateItem(index, 'variables', currentVars.filter((v: any) => v.masterVariableId !== vMaster.id));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <span>{vMaster.name}</span>
                                                                        <span className="opacity-50 text-[10px] ml-auto">({vMaster.code})</span>
                                                                    </label>
                                                                </div>

                                                                {isSelected && (
                                                                    <div className="flex-1 border-l border-zinc-200 dark:border-zinc-700 pl-4 py-1">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={`Ingresar valor para ${vMaster.name}`}
                                                                            className="w-full h-8 bg-white dark:bg-zinc-900 rounded-lg px-3 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                                                                            value={assigned.value}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                const newVars = (item.variables || []).map((v: any) =>
                                                                                    v.masterVariableId === vMaster.id ? { ...v, value: val } : v
                                                                                );
                                                                                updateItem(index, 'variables', newVars);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Guests */}
                <div className="space-y-8">
                    {/* Pricing & Summary */}
                    <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl shadow-zinc-900/40 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 bg-blue-600/10 blur-[60px] rounded-full" />

                        <h3 className="text-lg font-bold relative z-10 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-400" />
                            Resumen de Cargos e Impuestos
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Moneda</label>
                                    <select
                                        className="w-full h-11 bg-zinc-800 rounded-xl px-3 border border-zinc-700 outline-none text-sm font-bold"
                                        value={formData.currency}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            const curr = data.currencies?.find((c: any) => c.code === code);
                                            setFormData({
                                                ...formData,
                                                currency: code,
                                                exchangeRate: curr ? curr.exchangeRate : formData.exchangeRate
                                            });
                                        }}
                                    >
                                        {(data.currencies || []).map((c: any) => (
                                            <option key={c.id || c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tasa Cambio</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 bg-zinc-800 rounded-xl px-3 border border-zinc-700 outline-none text-sm font-bold text-right"
                                        value={formData.exchangeRate}
                                        onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Comisión (%)</label>
                                    <input
                                        type="number"
                                        className="w-full h-11 bg-zinc-800 rounded-xl px-3 border border-zinc-700 outline-none text-sm font-bold text-right"
                                        value={formData.commissionPercentage}
                                        onChange={(e) => setFormData({ ...formData, commissionPercentage: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 pt-4">
                                {Object.entries(taxSummary).length === 0 && (
                                    <div className="text-zinc-500 text-sm font-medium text-center pb-4">Aún no se han configurado cargos en los productos.</div>
                                )}
                                {Object.entries(taxSummary).map(([name, amount]) => (
                                    <div key={name} className="flex justify-between items-center text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3">
                                        <span className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-400" />
                                            {name}
                                        </span>
                                        <span className="text-white">${amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Final Math */}
                            <div className="pt-8 space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-bold">Costo Real Total</span>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-emerald-400">
                                            ${total.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] uppercase text-zinc-500 mt-1">Suma exacta en {formData.currency}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {quotationId && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-2 dark:text-white">
                                    <Paperclip className="w-4 h-4 text-blue-500" />
                                    Adjuntos
                                </h3>
                                <label className="cursor-pointer bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all hover:bg-blue-100">
                                    {uploadingAttachment ? <Loader2 className="animate-spin w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                    Cargar
                                    <input type="file" className="hidden" onChange={handleUploadAttachment} disabled={uploadingAttachment} />
                                </label>
                            </div>

                            {attachments.length === 0 ? (
                                <div className="text-center py-6 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                    <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-2" />
                                    <p className="text-zinc-400 text-[10px]">Sin documentos.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attachments.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group">
                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                                <div className="overflow-hidden">
                                                    <p className="text-[11px] font-bold truncate dark:text-white" title={att.fileName}>{att.fileName}</p>
                                                    <p className="text-[9px] text-zinc-400">{(att.fileSize / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadAttachment(att)}
                                                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAttachment(att.id)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-red-400"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form >
    )
}
