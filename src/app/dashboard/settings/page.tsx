'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    Users,
    Building2,
    Tags,
    Tag,
    DollarSign,
    Plus,
    Search,
    Trash2,
    ShieldCheck,
    Mail,
    Key,
    Database,
    Loader2,
    X,
    Check,
    UserCheck,
    Printer,
    Edit2,
    Download,
    Hotel as HotelIcon,
    TerminalSquare,
    Copy,
    ArrowUp,
    ArrowDown,
    FileText,
    Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchSelect } from '@/components/SearchSelect'
import { QuotationFormatsTab } from '@/components/QuotationFormatsTab'

type Tab = 'parametros' | 'usuarios' | 'sucursales' | 'implants' | 'impuestos' | 'vendedores' | 'tiqueteadores' | 'prestadoras' | 'clientes' | 'proveedores' | 'productos' | 'variables' | 'combos' | 'logs' | 'monedas' | 'equivalencias' | 'tarjetas-credito' | 'formas-pago' | 'paises' | 'ciudades' | 'aeropuertos' | 'tipos-tiquetes' | 'estados-cotizacion' | 'formatos-cotizacion';

const AVAILABLE_MANDATORY_FIELDS = [
    { key: 'QuotationProduct.passengers', label: 'Pasajeros (Nombre obligatorio)', group: 'Por Producto' },
    { key: 'QuotationProduct.payments', label: 'Formas de Pago (Al menos un pago registrado)', group: 'Por Producto' },
    { key: 'QuotationProduct.checkInDate', label: 'Fecha de Inicio (Check-In)', group: 'Por Producto' },
    { key: 'QuotationProduct.checkOutDate', label: 'Fecha de Fin (Check-Out)', group: 'Por Producto' },
    { key: 'QuotationProduct.destination', label: 'Destino', group: 'Por Producto' },
    { key: 'QuotationProduct.reservationCode', label: 'Código de Reserva', group: 'Por Producto' },
    { key: 'QuotationProduct.providerId', label: 'Proveedor', group: 'Por Producto' },
    { key: 'QuotationProduct.prestadoraId', label: 'Prestadora / Hotel', group: 'Por Producto' },
    { key: 'QuotationProduct.serviceType', label: 'Clasificación de Servicio', group: 'Por Producto' },
    { key: 'QuotationProduct.cost', label: 'Costo de Producto', group: 'Por Producto' },
    { key: 'QuotationProduct.quantity', label: 'Cantidad', group: 'Por Producto' },
    { key: 'QuotationProduct.price', label: 'Precio de Venta', group: 'Por Producto' },
    { key: 'QuotationProduct.paxAdults', label: 'Pasajeros Adultos', group: 'Por Producto' },
    { key: 'QuotationProduct.paxChildren', label: 'Pasajeros Niños', group: 'Por Producto' },
    { key: 'QuotationProduct.sellerCommission', label: 'Comisión Vendedor', group: 'Por Producto' },
    { key: 'QuotationProduct.ticketPrinterCommission', label: 'Comisión Tiqueteador', group: 'Por Producto' },
    { key: 'QuotationProduct.inNationality', label: 'Nacionalidad', group: 'Por Producto' },
    { key: 'QuotationProduct.service', label: 'Detalle de Servicio', group: 'Por Producto' },
    { key: 'QuotationProduct.description', label: 'Descripción Manual', group: 'Por Producto' },
    { key: 'QuotationProduct.nights', label: 'Noches', group: 'Por Producto' },
    { key: 'Quotation.sellerId', label: 'Vendedor', group: 'Cabecera' },
    { key: 'Quotation.ticketPrinterId', label: 'Tiqueteador', group: 'Cabecera' },
    { key: 'Quotation.clientId', label: 'Cliente', group: 'Cabecera' },
    { key: 'Quotation.branchId', label: 'Sucursal', group: 'Cabecera' },
    { key: 'Quotation.implantId', label: 'Implant', group: 'Cabecera' },
    { key: 'Quotation.currency', label: 'Moneda', group: 'Cabecera' },
    { key: 'Quotation.exchangeRate', label: 'Tasa de Cambio', group: 'Cabecera' },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('usuarios')
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Data states
    const [users, setUsers] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])
    const [implants, setImplants] = useState<any[]>([])
    const [taxes, setTaxes] = useState<any[]>([])
    const [sellers, setSellers] = useState<any[]>([])
    const [ticketPrinters, setTicketPrinters] = useState<any[]>([])
    const [prestadoras, setHotels] = useState<any[]>([])
    const [providers, setProviders] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [variables, setVariables] = useState<any[]>([])
    const [parameters, setParameters] = useState<any[]>([])
    const [combos, setCombos] = useState<any[]>([])
    const [currencies, setCurrencies] = useState<any[]>([])
    const [equivalences, setEquivalences] = useState<any[]>([])
    const [creditCards, setCreditCards] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])
    const [countries, setCountries] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])
    const [airports, setAirports] = useState<any[]>([])
    const [ticketTypes, setTicketTypes] = useState<any[]>([])
    const [quotationStates, setQuotationStates] = useState<any[]>([])
    const [interfacesList, setInterfacesList] = useState<any[]>([])
    const [masterList, setMasterList] = useState<any[]>([])
    const [dynamicMasterOptions, setDynamicMasterOptions] = useState<any[]>([])

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // Copy-template feature state
    const [copyTemplateSrcId, setCopyTemplateSrcId] = useState<string>('')
    const [copyingTemplate, setCopyingTemplate] = useState(false)

    // Form states
    const [formData, setFormData] = useState<any>({})
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const getFieldLabel = (key: string) => {
        const customNames = formData.templateConfig?.__customNames || {};
        if (customNames[key]) return customNames[key];

        const productGenericLabels: Record<string, string> = {
            proveedorNombre: 'Proveedor Nombre',
            proveedorNIT: 'Proveedor NIT',
            proveedorContacto: 'Proveedor Contacto',
            tarifaNeta: 'Tarifa Neta',
            tarifaNetaPago: 'Tarifa Neta Pago',
            impuestos: 'Impuestos',
            impuestosPago: 'Impuestos Pago',
            adicionalesServ: 'Adicionales',
            adicionalesServPago: 'Adicionales Pago',
            comision: 'Comisión',
            descuento: 'Descuento',
            sobrecomision: 'Sobrecomisión',
            fee: 'Fee',
            total: 'Total',
            totalPago: 'Total Pago',
            checkIn: 'Check-In',
            checkOut: 'Check-Out',
            nights: 'Noches',
            destination: 'Destino',
            quantity: 'Cantidad',
            price: 'Precio de Venta',
            cost: 'Costo',
            paxAdultos: 'Adultos',
            paxNinos: 'Niños',
            sellerCommission: 'Comisión Asesor',
            ticketPrinterCommission: 'Comisión Tiqueteador',
            inNationality: 'Nacionalidad',
            servicio: 'Detalle Servicio',
            descripcion: 'Descripción Manual',
            prestadoraNombre: 'Prestadora Nombre',
            prestadoraCategoria: 'Prestadora Categoría',
            prestadoraUbicacion: 'Prestadora Ubicación',
            productDescripcion: 'Producto Descripción',
            productTipo: 'Producto Tipo',
            productCodigo: 'Producto Código',
            productConcepto: 'Producto Concepto',
            productItinerario: 'Producto Itinerario',
            productClase: 'Producto Clase',
            productVuelo: 'Producto Vuelo'
        };

        if (productGenericLabels[key]) {
            return `Producto: ${productGenericLabels[key]}`;
        }

        const dynamicVarMatch = key.match(/^prov(\d+)_(.+)$/);
        if (dynamicVarMatch) {
            const pNum = dynamicVarMatch[1];
            const varCode = dynamicVarMatch[2];
            const v = variables.find(x => x.code === varCode);
            return `Prov ${pNum}: ${v ? v.name : varCode}`;
        }

        const vGen = variables.find(x => x.code === key);
        if (vGen) return `Producto: ${vGen.name}`;

        const prodMatch = key.match(/^(prov|proveedor)(\d+)(.+)$/);
        if (prodMatch) {
            const prefix = prodMatch[1];
            const pNum = prodMatch[2];
            const suffix = prodMatch[3];
            
            const labels: Record<string, string> = {
                Nombre: 'Nombre',
                NIT: 'NIT',
                Contacto: 'Contacto',
                TarifaNeta: 'Tarifa Neta',
                TarifaNetaPago: 'Tarifa Neta Pago',
                Impuestos: 'Impuestos',
                ImpuestosPago: 'Impuestos Pago',
                Adicionales: 'Adicionales',
                AdicionalesPago: 'Adicionales Pago',
                Comision: 'Comisión',
                Descuento: 'Descuento',
                Sobrecomision: 'Sobrecomisión',
                Fee: 'Fee',
                Total: 'Total',
                TotalPago: 'Total Pago',
                checkIn: 'Check-In',
                checkOut: 'Check-Out',
                nights: 'Noches',
                destination: 'Destino',
                quantity: 'Cantidad',
                price: 'Precio de Venta',
                cost: 'Costo',
                paxAdultos: 'Adultos',
                paxNinos: 'Niños',
                sellerCommission: 'Comisión Asesor',
                ticketPrinterCommission: 'Comisión Tiqueteador',
                inNationality: 'Nacionalidad',
                servicio: 'Detalle Servicio',
                descripcion: 'Descripción Manual',
                prestadoraNombre: 'Prestadora Nombre',
                prestadoraCategoria: 'Prestadora Categoría',
                prestadoraUbicacion: 'Prestadora Ubicación',
                productDescripcion: 'Producto Descripción',
                productTipo: 'Producto Tipo',
                productCodigo: 'Producto Código',
                productConcepto: 'Producto Concepto',
                productItinerario: 'Producto Itinerario',
                productClase: 'Producto Clase',
                productVuelo: 'Producto Vuelo'
            };
            const baseName = prefix === 'proveedor' ? `Proveedor ${pNum}` : `Prov ${pNum}`;
            return `${baseName}: ${labels[suffix] || suffix}`;
        }

        const generalLabels: Record<string, string> = {
            idCotizacion: 'ID Cotización',
            internalNumber: 'Número Interno',
            fecha: 'Fecha',
            clienteNombre: 'Cliente Nombre',
            clienteIdentificacion: 'Cliente ID / NIT',
            clienteDireccion: 'Dirección',
            clienteTelefono: 'Teléfono',
            asesor: 'Asesor',
            vendedor: 'Vendedor',
            currency: 'Moneda',
            tCambio: 'Tasa de Cambio',
            comisionTotalPercentage: 'Comisión Total (%)',
            comisionFreelancePercentage: 'Comisión Freelance (%)',
            comisionPropiaPercentage: 'Comisión Propia (%)',
            comisionUtilidadPercentage: 'Comisión Utilidad (%)',
            comisionFreelanceValue: 'Comisión Freelance ($)',
            comisionPropiaValue: 'Comisión Propia ($)',
            costoTotal: 'Resumen: Costo Total',
            valorBase: 'Resumen: Valor Base',
            utilidad: 'Resumen: Utilidad',
            totalAmount: 'Resumen: Valor Facturar / Total',
            state: 'Estado de Cotización',
            descripcionPlan: 'Descripción Plan',
            fechasViaje: 'Fechas Viaje',
            logo: 'Celda Logo',
            observaciones: 'Observaciones',
            pasajeros: 'Pasajeros',
            totalAdultos: 'Total Adultos',
            totalNinos: 'Total Niños',
            destinoCabecera: 'Destino (Cabecera)',
            fechaInicioCabecera: 'Fecha Inicio (Cabecera)',
            fechaFinCabecera: 'Fecha Fin (Cabecera)',
            pasajeroCabecera: 'Pasajero Principal (Cabecera)',
            paxAdultosCabecera: 'Cantidad Adultos (Cabecera)',
            paxNinosCabecera: 'Cantidad Niños (Cabecera)',
            reservacionCabecera: 'Reservación / Localizador (Cabecera)',
            descripcionManualCabecera: 'Descripción Manual (Cabecera)',
            tarifaNeta: 'Total: Tarifa Neta',
            tarifaNetaPago: 'Total: Tarifa Neta Pago',
            impuestos: 'Total: Impuestos',
            impuestosPago: 'Total: Impuestos Pago',
            adicionalesServ: 'Total: Adicionales',
            adicionalesServPago: 'Total: Adicionales Pago',
            comision: 'Total: Comisión',
            descuento: 'Total: Descuento',
            sobrecomision: 'Total: Sobrecomisión',
            fee: 'Total: Fee',
            total: 'Total: Total',
            totalPago: 'Total: Total Pago',
            baseComisionable: 'Base Comisión',
            comisionAsesor: 'Comisión Asesor'
        };

        return generalLabels[key] || key;
    };

    const renderMappingOptions = () => {
        const headerFields = [
            { key: 'idCotizacion', label: 'ID Cotización' },
            { key: 'internalNumber', label: 'Número Interno' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'clienteNombre', label: 'Cliente Nombre' },
            { key: 'clienteIdentificacion', label: 'Cliente ID / NIT' },
            { key: 'clienteDireccion', label: 'Dirección' },
            { key: 'clienteTelefono', label: 'Teléfono' },
            { key: 'asesor', label: 'Asesor' },
            { key: 'vendedor', label: 'Vendedor' },
            { key: 'currency', label: 'Moneda' },
            { key: 'tCambio', label: 'Tasa de Cambio' },
            { key: 'comisionTotalPercentage', label: 'Comisión Total (%)' },
            { key: 'comisionFreelancePercentage', label: 'Comisión Freelance (%)' },
            { key: 'comisionPropiaPercentage', label: 'Comisión Propia (%)' },
            { key: 'comisionUtilidadPercentage', label: 'Comisión Utilidad (%)' },
            { key: 'comisionFreelanceValue', label: 'Comisión Freelance ($)' },
            { key: 'comisionPropiaValue', label: 'Comisión Propia ($)' },
            { key: 'costoTotal', label: 'Resumen: Costo Total' },
            { key: 'valorBase', label: 'Resumen: Valor Base' },
            { key: 'utilidad', label: 'Resumen: Utilidad' },
            { key: 'totalAmount', label: 'Resumen: Valor Facturar / Total' },
            { key: 'state', label: 'Estado de Cotización' },
            { key: 'descripcionPlan', label: 'Descripción Plan' },
            { key: 'fechasViaje', label: 'Fechas Viaje' },
            { key: 'logo', label: 'Celda Logo' },
            { key: 'observaciones', label: 'Observaciones' },
            { key: 'pasajeros', label: 'Pasajeros' },
            { key: 'totalAdultos', label: 'Total Adultos' },
            { key: 'totalNinos', label: 'Total Niños' },
            { key: 'destinoCabecera', label: 'Destino (Cabecera)' },
            { key: 'fechaInicioCabecera', label: 'Fecha Inicio (Cabecera)' },
            { key: 'fechaFinCabecera', label: 'Fecha Fin (Cabecera)' },
            { key: 'pasajeroCabecera', label: 'Pasajero Principal (Cabecera)' },
            { key: 'paxAdultosCabecera', label: 'Cantidad Adultos (Cabecera)' },
            { key: 'paxNinosCabecera', label: 'Cantidad Niños (Cabecera)' },
            { key: 'reservacionCabecera', label: 'Reservación / Localizador (Cabecera)' },
            { key: 'descripcionManualCabecera', label: 'Descripción Manual (Cabecera)' },
            { key: 'tarifaNeta', label: 'Total: Tarifa Neta' },
            { key: 'tarifaNetaPago', label: 'Total: Tarifa Neta Pago' },
            { key: 'impuestos', label: 'Total: Impuestos' },
            { key: 'impuestosPago', label: 'Total: Impuestos Pago' },
            { key: 'adicionalesServ', label: 'Total: Adicionales' },
            { key: 'adicionalesServPago', label: 'Total: Adicionales Pago' },
            { key: 'comision', label: 'Total: Comisión' },
            { key: 'descuento', label: 'Total: Descuento' },
            { key: 'sobrecomision', label: 'Total: Sobrecomisión' },
            { key: 'fee', label: 'Total: Fee' },
            { key: 'total', label: 'Total: Total' },
            { key: 'totalPago', label: 'Total: Total Pago' },
            { key: 'baseComisionable', label: 'Base Comisión' },
            { key: 'comisionAsesor', label: 'Comisión Asesor' }
        ];

        const baseProductFields = [
            { keySuffix: 'Nombre', keyPrefix: 'proveedor', labelSuffix: 'Nombre', labelPrefix: 'Proveedor' },
            { keySuffix: 'NIT', keyPrefix: 'proveedor', labelSuffix: 'NIT', labelPrefix: 'Proveedor' },
            { keySuffix: 'Contacto', keyPrefix: 'proveedor', labelSuffix: 'Contacto', labelPrefix: 'Proveedor' },
            { keySuffix: 'TarifaNeta', keyPrefix: 'prov', labelSuffix: 'Tarifa Neta', labelPrefix: 'Prov' },
            { keySuffix: 'TarifaNetaPago', keyPrefix: 'prov', labelSuffix: 'Tarifa Neta Pago', labelPrefix: 'Prov' },
            { keySuffix: 'Impuestos', keyPrefix: 'prov', labelSuffix: 'Impuestos', labelPrefix: 'Prov' },
            { keySuffix: 'ImpuestosPago', keyPrefix: 'prov', labelSuffix: 'Impuestos Pago', labelPrefix: 'Prov' },
            { keySuffix: 'Adicionales', keyPrefix: 'prov', labelSuffix: 'Adicionales', labelPrefix: 'Prov' },
            { keySuffix: 'AdicionalesPago', keyPrefix: 'prov', labelSuffix: 'Adicionales Pago', labelPrefix: 'Prov' },
            { keySuffix: 'Comision', keyPrefix: 'prov', labelSuffix: 'Comisión', labelPrefix: 'Prov' },
            { keySuffix: 'Descuento', keyPrefix: 'prov', labelSuffix: 'Descuento', labelPrefix: 'Prov' },
            { keySuffix: 'Sobrecomision', keyPrefix: 'prov', labelSuffix: 'Sobrecomisión', labelPrefix: 'Prov' },
            { keySuffix: 'Fee', keyPrefix: 'prov', labelSuffix: 'Fee', labelPrefix: 'Prov' },
            { keySuffix: 'Total', keyPrefix: 'prov', labelSuffix: 'Total', labelPrefix: 'Prov' },
            { keySuffix: 'TotalPago', keyPrefix: 'prov', labelSuffix: 'Total Pago', labelPrefix: 'Prov' },
            { keySuffix: 'checkIn', keyPrefix: 'prov', labelSuffix: 'Check-In', labelPrefix: 'Prov' },
            { keySuffix: 'checkOut', keyPrefix: 'prov', labelSuffix: 'Check-Out', labelPrefix: 'Prov' },
            { keySuffix: 'nights', keyPrefix: 'prov', labelSuffix: 'Noches', labelPrefix: 'Prov' },
            { keySuffix: 'destination', keyPrefix: 'prov', labelSuffix: 'Destino', labelPrefix: 'Prov' },
            { keySuffix: 'quantity', keyPrefix: 'prov', labelSuffix: 'Cantidad', labelPrefix: 'Prov' },
            { keySuffix: 'price', keyPrefix: 'prov', labelSuffix: 'Precio de Venta', labelPrefix: 'Prov' },
            { keySuffix: 'cost', keyPrefix: 'prov', labelSuffix: 'Costo', labelPrefix: 'Prov' },
            { keySuffix: 'paxAdultos', keyPrefix: 'prov', labelSuffix: 'Adultos', labelPrefix: 'Prov' },
            { keySuffix: 'paxNinos', keyPrefix: 'prov', labelSuffix: 'Niños', labelPrefix: 'Prov' },
            { keySuffix: 'sellerCommission', keyPrefix: 'prov', labelSuffix: 'Comisión Asesor', labelPrefix: 'Prov' },
            { keySuffix: 'ticketPrinterCommission', keyPrefix: 'prov', labelSuffix: 'Comisión Tiqueteador', labelPrefix: 'Prov' },
            { keySuffix: 'inNationality', keyPrefix: 'prov', labelSuffix: 'Nacionalidad', labelPrefix: 'Prov' },
            { keySuffix: 'servicio', keyPrefix: 'prov', labelSuffix: 'Detalle Servicio', labelPrefix: 'Prov' },
            { keySuffix: 'descripcion', keyPrefix: 'prov', labelSuffix: 'Descripción Manual', labelPrefix: 'Prov' },
            { keySuffix: 'prestadoraNombre', keyPrefix: 'prov', labelSuffix: 'Prestadora Nombre', labelPrefix: 'Prov' },
            { keySuffix: 'prestadoraCategoria', keyPrefix: 'prov', labelSuffix: 'Prestadora Categoría', labelPrefix: 'Prov' },
            { keySuffix: 'prestadoraUbicacion', keyPrefix: 'prov', labelSuffix: 'Prestadora Ubicación', labelPrefix: 'Prov' },
            { keySuffix: 'productDescripcion', keyPrefix: 'prov', labelSuffix: 'Producto Descripción', labelPrefix: 'Prov' },
            { keySuffix: 'productTipo', keyPrefix: 'prov', labelSuffix: 'Producto Tipo', labelPrefix: 'Prov' },
            { keySuffix: 'productCodigo', keyPrefix: 'prov', labelSuffix: 'Producto Código', labelPrefix: 'Prov' },
            { keySuffix: 'productConcepto', keyPrefix: 'prov', labelSuffix: 'Producto Concepto', labelPrefix: 'Prov' },
            { keySuffix: 'productItinerario', keyPrefix: 'prov', labelSuffix: 'Producto Itinerario', labelPrefix: 'Prov' },
            { keySuffix: 'productClase', keyPrefix: 'prov', labelSuffix: 'Producto Clase', labelPrefix: 'Prov' },
            { keySuffix: 'productVuelo', keyPrefix: 'prov', labelSuffix: 'Producto Vuelo', labelPrefix: 'Prov' },
        ];

        const genericProductFields = [
            { key: 'proveedorNombre', label: 'Proveedor Nombre' },
            { key: 'proveedorNIT', label: 'Proveedor NIT' },
            { key: 'proveedorContacto', label: 'Proveedor Contacto' },
            { key: 'tarifaNeta', label: 'Tarifa Neta' },
            { key: 'tarifaNetaPago', label: 'Tarifa Neta Pago' },
            { key: 'impuestos', label: 'Impuestos' },
            { key: 'impuestosPago', label: 'Impuestos Pago' },
            { key: 'adicionalesServ', label: 'Adicionales' },
            { key: 'adicionalesServPago', label: 'Adicionales Pago' },
            { key: 'comision', label: 'Comisión' },
            { key: 'descuento', label: 'Descuento' },
            { key: 'sobrecomision', label: 'Sobrecomisión' },
            { key: 'fee', label: 'Fee' },
            { key: 'total', label: 'Total' },
            { key: 'totalPago', label: 'Total Pago' },
            { key: 'checkIn', label: 'Check-In' },
            { key: 'checkOut', label: 'Check-Out' },
            { key: 'nights', label: 'Noches' },
            { key: 'destination', label: 'Destino' },
            { key: 'quantity', label: 'Cantidad' },
            { key: 'price', label: 'Precio de Venta' },
            { key: 'cost', label: 'Costo' },
            { key: 'paxAdultos', label: 'Adultos' },
            { key: 'paxNinos', label: 'Niños' },
            { key: 'sellerCommission', label: 'Comisión Asesor' },
            { key: 'ticketPrinterCommission', label: 'Comisión Tiqueteador' },
            { key: 'inNationality', label: 'Nacionalidad' },
            { key: 'servicio', label: 'Detalle Servicio' },
            { key: 'descripcion', label: 'Descripción Manual' },
            { key: 'prestadoraNombre', label: 'Prestadora Nombre' },
            { key: 'prestadoraCategoria', label: 'Prestadora Categoría' },
            { key: 'prestadoraUbicacion', label: 'Prestadora Ubicación' },
            { key: 'productDescripcion', label: 'Producto Descripción' },
            { key: 'productTipo', label: 'Producto Tipo' },
            { key: 'productCodigo', label: 'Producto Código' },
            { key: 'productConcepto', label: 'Producto Concepto' },
            { key: 'productItinerario', label: 'Producto Itinerario' },
            { key: 'productClase', label: 'Producto Clase' },
            { key: 'productVuelo', label: 'Producto Vuelo' }
        ];

        // Ordenamos alfabéticamente por etiqueta
        const sortedHeaderFields = [...headerFields].sort((a, b) => a.label.localeCompare(b.label));
        const sortedGenericProductFields = [...genericProductFields].sort((a, b) => a.label.localeCompare(b.label));
        const sortedBaseProductFields = [...baseProductFields].sort((a, b) => a.labelSuffix.localeCompare(b.labelSuffix));

        return (
            <>
                <optgroup label="Campos Generales (Cabecera)">
                    {sortedHeaderFields.map(f => (
                        <option key={f.key} value={`${f.key}|${f.label}`}>{f.label}</option>
                    ))}
                </optgroup>

                <optgroup label="Campos de Producto (Dinámico / Fila Repetida)">
                    {sortedGenericProductFields.map(f => (
                        <option key={f.key} value={`${f.key}|${f.label}`}>{f.label}</option>
                    ))}
                    {variables && [...variables].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((v: any) => (
                        <option key={v.code} value={`${v.code}|Producto: ${v.name}`}>{v.name}</option>
                    ))}
                </optgroup>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pNum => (
                    <optgroup key={pNum} label={`Producto ${pNum} (Estático)`}>
                        {sortedBaseProductFields.map(f => {
                            const key = `${f.keyPrefix}${pNum}${f.keySuffix}`;
                            const label = `${f.labelPrefix} ${pNum}: ${f.labelSuffix}`;
                            return (
                                <option key={key} value={`${key}|${label}`}>{f.labelSuffix}</option>
                            );
                        })}
                        {variables && [...variables].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((v: any) => {
                            const key = `prov${pNum}_${v.code}`;
                            const label = `Prov ${pNum}: ${v.name}`;
                            return (
                                <option key={key} value={`${key}|${label}`}>{v.name}</option>
                            );
                        })}
                    </optgroup>
                ))}

                <optgroup label="Personalizado">
                    <option value="custom|Personalizado (Ingresar manualmente)">Personalizado (Ingresar manualmente)</option>
                </optgroup>
            </>
        );
    };

    // Reset pagination and search on tab change
    useEffect(() => {
        setCurrentPage(1)
        setSearchTerm('')
        setDebouncedSearchTerm('')
    }, [activeTab])

    // Load initial metadata once on mount
    useEffect(() => {
        fetchMetadata()
    }, [])

    // Load active tab data whenever pagination/search dependencies change
    useEffect(() => {
        fetchActiveTabData(activeTab, currentPage, pageSize, debouncedSearchTerm)
    }, [activeTab, currentPage, pageSize, debouncedSearchTerm])

    const fetchMetadata = async () => {
        try {
            const [resInterfaces, resMasters, resRoles] = await Promise.all([
                fetch('/api/config/interfaces').then(res => res.json()).catch(() => []),
                fetch('/api/config/masters').then(res => res.json()).catch(() => []),
                fetch('/api/config/roles').then(res => res.json()).catch(() => []),
            ]);
            setInterfacesList(Array.isArray(resInterfaces) ? resInterfaces : []);
            setMasterList(Array.isArray(resMasters) ? resMasters : []);
            setRoles(Array.isArray(resRoles) ? resRoles : []);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    }

    const fetchLookupData = async (tab: Tab) => {
        try {
            if (tab === 'aeropuertos') {
                const res = await fetch('/api/config/cities').then(res => res.json());
                setCities(Array.isArray(res) ? res : []);
            } else if (tab === 'prestadoras') {
                const res = await fetch('/api/providers').then(res => res.json());
                setProviders(Array.isArray(res) ? res : []);
            } else if (tab === 'ciudades') {
                const res = await fetch('/api/config/countries').then(res => res.json());
                setCountries(Array.isArray(res) ? res : []);
            } else if (tab === 'paises') {
                const res = await fetch('/api/config/currencies').then(res => res.json());
                setCurrencies(Array.isArray(res) ? res : []);
            } else if (tab === 'productos') {
                const res = await fetch('/api/config/ticket-types').then(res => res.json());
                setTicketTypes(Array.isArray(res) ? res : []);
            } else if (tab === 'usuarios') {
                const [b, i, tp] = await Promise.all([
                    fetch('/api/config/branches').then(res => res.json()),
                    fetch('/api/config/implants').then(res => res.json()),
                    fetch('/api/config/ticket-printers').then(res => res.json()),
                ]);
                setBranches(Array.isArray(b) ? b : []);
                setImplants(Array.isArray(i) ? i : []);
                setTicketPrinters(Array.isArray(tp) ? tp : []);
            } else if (tab === 'clientes' || tab === 'sucursales' || tab === 'implants') {
                const res = await fetch('/api/config/variables').then(res => res.json());
                setVariables(Array.isArray(res) ? res : []);
            }
        } catch (err) {
            console.error("Error fetching lookup data:", err);
        }
    }

    const setTabListState = (tab: Tab, data: any[]) => {
        switch (tab) {
            case 'usuarios': setUsers(data); break;
            case 'sucursales': setBranches(data); break;
            case 'implants': setImplants(data); break;
            case 'impuestos': setTaxes(data); break;
            case 'vendedores': setSellers(data); break;
            case 'tiqueteadores': setTicketPrinters(data); break;
            case 'prestadoras': setHotels(data); break;
            case 'proveedores': setProviders(data); break;
            case 'clientes': setClients(data); break;
            case 'productos': setProducts(data); break;
            case 'variables': setVariables(data); break;
            case 'parametros': setParameters(data); break;
            case 'monedas': setCurrencies(data); break;
            case 'equivalencias': setEquivalences(data); break;
            case 'tarjetas-credito': setCreditCards(data); break;
            case 'formas-pago': setPayments(data); break;
            case 'paises': setCountries(data); break;
            case 'ciudades': setCities(data); break;
            case 'aeropuertos': setAirports(data); break;
            case 'tipos-tiquetes': setTicketTypes(data); break;
            case 'estados-cotizacion': setQuotationStates(data); break;
            case 'combos': setCombos(data); break;
            case 'logs': setLogs(data); break;
        }
    }

    const fetchActiveTabData = async (tab: Tab, pageNum: number, limitNum: number, searchVal: string) => {
        setLoading(true)
        try {
            let endpoint = '';
            switch (tab) {
                case 'usuarios': endpoint = '/api/config/users'; break;
                case 'sucursales': endpoint = '/api/config/branches'; break;
                case 'implants': endpoint = '/api/config/implants'; break;
                case 'impuestos': endpoint = '/api/config/taxes'; break;
                case 'vendedores': endpoint = '/api/config/sellers'; break;
                case 'tiqueteadores': endpoint = '/api/config/ticket-printers'; break;
                case 'prestadoras': endpoint = '/api/config/prestadoras'; break;
                case 'proveedores': endpoint = '/api/providers'; break;
                case 'clientes': endpoint = '/api/clients'; break;
                case 'productos': endpoint = '/api/products'; break;
                case 'variables': endpoint = '/api/config/variables'; break;
                case 'parametros': endpoint = '/api/config/parameters'; break;
                case 'monedas': endpoint = '/api/config/currencies'; break;
                case 'equivalencias': endpoint = '/api/config/equivalences'; break;
                case 'tarjetas-credito': endpoint = '/api/config/credit-cards'; break;
                case 'formas-pago': endpoint = '/api/config/payments'; break;
                case 'paises': endpoint = '/api/config/countries'; break;
                case 'ciudades': endpoint = '/api/config/cities'; break;
                case 'aeropuertos': endpoint = '/api/config/airports'; break;
                case 'tipos-tiquetes': endpoint = '/api/config/ticket-types'; break;
                case 'estados-cotizacion': endpoint = '/api/config/quotation-states'; break;
                case 'combos': endpoint = '/api/combos'; break;
                case 'logs': endpoint = '/api/config/logs'; break;
            }

            if (!endpoint) return;

            const queryParams = new URLSearchParams();
            queryParams.append('page', pageNum.toString());
            queryParams.append('limit', limitNum.toString());
            if (searchVal) {
                queryParams.append('search', searchVal);
            }

            const res = await fetch(`${endpoint}?${queryParams.toString()}`);
            const json = await res.json();

            if (json && typeof json === 'object' && 'data' in json) {
                setTotalItems(json.total || 0);
                setTotalPages(json.totalPages || 1);
                setTabListState(tab, json.data);
            } else {
                const list = Array.isArray(json) ? json : [];
                setTotalItems(list.length);
                setTotalPages(1);
                setTabListState(tab, list);
            }
        } catch (error) {
            console.error('Error fetching active tab data:', error);
            setTabListState(tab, []);
        } finally {
            setLoading(false);
        }
    }

    const fetchData = async () => {
        await fetchActiveTabData(activeTab, currentPage, pageSize, debouncedSearchTerm);
    }

    useEffect(() => {
        if (formData.id_master && activeTab === 'equivalencias') {
            const selectedMaster = masterList.find((m: any) => m.id == formData.id_master);
            if (selectedMaster && selectedMaster.code) {
                fetch(`/api/config/masters/dynamic?table=${selectedMaster.code}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            setDynamicMasterOptions(data);
                        } else {
                            setDynamicMasterOptions([]);
                        }
                    })
                    .catch(() => setDynamicMasterOptions([]));
            } else {
                setDynamicMasterOptions([]);
            }
        } else {
            setDynamicMasterOptions([]);
        }
    }, [formData.id_master, activeTab, masterList]);

    const handleOpenModal = (item?: any) => {
        fetchLookupData(activeTab);
        if (item) {
            if (activeTab === 'combos' && item.products) {
                // Normalizar los tipos de datos de los productos del combo al cargar para editar
                const normalizedProducts = item.products.map((cp: any) => ({
                    ...cp,
                    productId: cp.productId ? parseInt(cp.productId) : '',
                    quantity: parseInt(cp.quantity) || 1,
                    price: parseFloat(cp.price) || 0,
                    cost: parseFloat(cp.cost) || 0,
                    providerId: cp.providerId ? parseInt(cp.providerId) : null,
                    prestadoraId: cp.prestadoraId ? parseInt(cp.prestadoraId) : null,
                    mainTaxId: cp.mainTaxId ? parseInt(cp.mainTaxId) : null,
                    appliedTaxes: (cp.appliedTaxes || []).map((at: any) => ({
                        chargeAndTaxId: parseInt(at.chargeAndTaxId),
                        amount: parseFloat(at.amount) || 0,
                        isMain: at.isMain || false,
                    })),
                    inNationality: cp.inNationality || 1
                }));
                setFormData({ ...item, products: normalizedProducts });
            } else if (activeTab === 'clientes') {
                let mandatoryVars = item.mandatoryVariables;
                if (typeof mandatoryVars === 'string') {
                    try {
                        mandatoryVars = JSON.parse(mandatoryVars);
                    } catch (e) {
                        mandatoryVars = [];
                    }
                }
                if (!Array.isArray(mandatoryVars)) {
                    mandatoryVars = [];
                }
                setFormData({ ...item, mandatoryVariables: mandatoryVars })
            } else if (activeTab === 'productos') {
                let mandatory = item.mandatoryFields;
                if (typeof mandatory === 'string') {
                    try {
                        mandatory = JSON.parse(mandatory);
                    } catch (e) {
                        mandatory = [];
                    }
                }
                if (!Array.isArray(mandatory)) {
                    mandatory = [];
                }
                setFormData({ ...item, mandatoryFields: mandatory })
            } else {
                setFormData({ ...item })
            }

        } else {
            if (activeTab === 'usuarios') {
                setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '', branchId: '', implantId: '', ticketPrinterId: '', canEditReports: false })
            } else if (activeTab === 'impuestos') {
                setFormData({ code: '', name: '', type: 'TAX', valueType: 'PERCENTAGE', value: '', isEditable: true })
            } else if (activeTab === 'vendedores' || activeTab === 'tiqueteadores') {
                setFormData({ code: '', name: '', email: '' })
            } else if (activeTab === 'prestadoras') {
                setFormData({ code: '', name: '', category: '', location: '', providerId: '', type: '' })
            } else if (activeTab === 'clientes') {
                setFormData({ name: '', document: '', contactInfo: '', address: '', mandatoryVariables: [] })
            } else if (activeTab === 'proveedores') {
                setFormData({ code: '', name: '', contactInfo: '' })
            } else if (activeTab === 'productos') {
                setFormData({ code: '', type: 'Servicio', description: '', basePrice: '', cost: '', billingConcept: '', serviceType: '', mandatoryFields: [] })
            } else if (activeTab === 'variables') {
                setFormData({ code: '', name: '' })
            } else if (activeTab === 'monedas') {
                setFormData({ code: '', name: '', exchangeRate: '', decimals: 2 })
            } else if (activeTab === 'combos') {
                setFormData({ code: '', name: '', cupos: 0, currencyId: '', products: [] })
            } else if (activeTab === 'equivalencias') {
                setFormData({ id_interfaces: '', id_master: '', cd_maestro: '', cd_codigo: '', cd_codigoInte: '' })
            } else if (activeTab === 'tarjetas-credito') {
                setFormData({ code: '', name: '', type: 'CC', inactive: false })
            } else if (activeTab === 'formas-pago') {
                setFormData({ code: '', name: '', iscash: false, iscredit: false, inactive: false })
            } else if (activeTab === 'paises') {
                setFormData({ code: '', name: '', dane: '', region: '', prefix: '', curencyId: '' })
            } else if (activeTab === 'ciudades') {
                setFormData({ code: '', name: '', countriesId: '', statecode: '', iata: '' })
            } else if (activeTab === 'aeropuertos') {
                setFormData({ code: '', name: '', citiesId: '' })
            } else if (activeTab === 'tipos-tiquetes') {
                setFormData({ code: '', name: '', description: '', isActive: true })
            } else {
                setFormData({ code: '', name: '' })
            }
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const endpoint = activeTab === 'usuarios' ? '/api/config/users' :
            activeTab === 'sucursales' ? '/api/config/branches' :
                activeTab === 'impuestos' ? '/api/config/taxes' :
                    activeTab === 'vendedores' ? '/api/config/sellers' :
                        activeTab === 'prestadoras' ? '/api/config/prestadoras' :
                            activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
                                activeTab === 'clientes' ? '/api/clients' :
                                    activeTab === 'proveedores' ? '/api/providers' :
                                        activeTab === 'productos' ? '/api/products' :
                                            activeTab === 'variables' ? '/api/config/variables' :
                                                activeTab === 'parametros' ? '/api/config/parameters' :
                                                    activeTab === 'monedas' ? '/api/config/currencies' :
                                                        activeTab === 'equivalencias' ? '/api/config/equivalences' :
                                                            activeTab === 'tarjetas-credito' ? '/api/config/credit-cards' :
                                                                activeTab === 'formas-pago' ? '/api/config/payments' :
                                                                    activeTab === 'paises' ? '/api/config/countries' :
                                                                        activeTab === 'ciudades' ? '/api/config/cities' :
                                                                            activeTab === 'aeropuertos' ? '/api/config/airports' :
                                                                                activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :
                                                                                    activeTab === 'estados-cotizacion' ? '/api/config/quotation-states' :
                                                            activeTab === 'combos' ? (formData.id ? `/api/combos/${formData.id}` : '/api/combos') :
                                                                '/api/config/implants'

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const res = await fetch(endpoint, {
                method: formData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error((await res.json()).message || 'Error')

            await fetchData()
            setIsModalOpen(false)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDuplicateCombo = async (combo: any) => {
        const newCode = prompt(`Introduce el nuevo código para el combo duplicado:`, `${combo.code}_COPY`);
        if (!newCode) return;

        const newName = prompt(`Introduce el nuevo nombre para el combo duplicado:`, `${combo.name} (Copia)`);
        if (!newName) return;

        setSubmitting(true);
        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Clonar datos básicos y productos
        const duplicateData = {
            code: newCode,
            name: newName,
            products: (combo.products || []).map((cp: any) => ({
                productId: cp.productId?.toString(),
                quantity: cp.quantity || 1,
                price: cp.price || 0,
                providerId: cp.providerId?.toString(),
                prestadoraId: cp.prestadoraId?.toString(),
                checkInDate: cp.checkInDate,
                checkOutDate: cp.checkOutDate,
                paxAdults: cp.paxAdults || 1,
                paxChildren: cp.paxChildren || 0,
                mainTaxId: cp.mainTaxId,
                appliedTaxes: (cp.appliedTaxes || []).map((t: any) => ({
                    chargeAndTaxId: t.chargeAndTaxId,
                    amount: t.amount
                }))
            }))
        };

        try {
            const res = await fetch('/api/combos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: JSON.stringify(duplicateData)
            });

            if (!res.ok) throw new Error((await res.json()).message || 'Error al duplicar combo');

            await fetchData();
            alert('Combo duplicado exitosamente');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`)) return

        const endpoint = activeTab === 'usuarios' ? '/api/config/users' :
            activeTab === 'sucursales' ? '/api/config/branches' :
                activeTab === 'impuestos' ? '/api/config/taxes' :
                    activeTab === 'vendedores' ? '/api/config/sellers' :
                        activeTab === 'tiqueteadores' ? '/api/config/ticket-printers' :
                            activeTab === 'prestadoras' ? '/api/config/prestadoras' :
                                activeTab === 'clientes' ? '/api/clients' :
                                    activeTab === 'proveedores' ? '/api/providers' :
                                        activeTab === 'productos' ? '/api/products' :
                                            activeTab === 'variables' ? '/api/config/variables' :
                                                activeTab === 'parametros' ? '/api/config/parameters' :
                                                    activeTab === 'monedas' ? '/api/config/currencies' :
                                                        activeTab === 'equivalencias' ? '/api/config/equivalences' :
                                                            activeTab === 'tarjetas-credito' ? '/api/config/credit-cards' :
                                                                activeTab === 'formas-pago' ? '/api/config/payments' :
                                                                    activeTab === 'paises' ? '/api/config/countries' :
                                                                        activeTab === 'ciudades' ? '/api/config/cities' :
                                                                            activeTab === 'aeropuertos' ? '/api/config/airports' :
                                                                                activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :
                                                                                    activeTab === 'estados-cotizacion' ? '/api/config/quotation-states' :
                                                            activeTab === 'combos' ? `/api/combos/${id}` :
                                                                '/api/config/implants'

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const url = activeTab === 'combos' ? endpoint : `${endpoint}?id=${id}`
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': loggedUser.id?.toString() || ''
                }
            })

            if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar')

            await fetchData()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', activeTab)

        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}')

        try {
            const res = await fetch('/api/config/bulk-upload', {
                method: 'POST',
                headers: {
                    'X-User-Id': loggedUser.id?.toString() || ''
                },
                body: formData
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'Error en la carga masiva')

            alert(result.message + (result.errors ? '\nErrores:\n' + result.errors.join('\n') : ''))
            await fetchData()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" /> Configuración del Sistema
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium font-outfit">Control de acceso, sucursales y parámetros operativos</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleBulkUpload}
                    />
                    {activeTab !== 'logs' && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open(`/api/config/templates?type=${activeTab}`)}
                                disabled={false}
                                className="px-6 h-14 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all disabled:opacity-50"
                                title="Descargar Plantilla Excel"
                            >
                                <Download className="w-5 h-5" />
                                Plantilla
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="px-6 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Database className="w-5 h-5" />}
                                Carga Masiva
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenModal()}
                                className="px-6 h-14 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 text-white rounded-2xl flex items-center gap-3 shadow-xl font-bold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {activeTab === 'usuarios' ? 'Nuevo Usuario' : activeTab === 'sucursales' ? 'Nueva Sucursal' : activeTab === 'impuestos' ? 'Nuevo Cargo/Impuesto' : activeTab === 'vendedores' ? 'Nuevo Vendedor' : activeTab === 'tiqueteadores' ? 'Nuevo Tiqueteador' : activeTab === 'prestadoras' ? 'Nueva Prestadora' : activeTab === 'clientes' ? 'Nuevo Cliente' : activeTab === 'proveedores' ? 'Nuevo Proveedor' : activeTab === 'productos' ? 'Nuevo Producto' : activeTab === 'variables' ? 'Nueva Variable' : activeTab === 'parametros' ? 'Nuevo Parámetro' : activeTab === 'monedas' ? 'Nueva Moneda' : activeTab === 'combos' ? 'Nuevo Combo' : activeTab === 'equivalencias' ? 'Nueva Equivalencia' : activeTab === 'tarjetas-credito' ? 'Nueva Tarjeta' : activeTab === 'formas-pago' ? 'Nueva Forma de Pago' : activeTab === 'paises' ? 'Nuevo País' : activeTab === 'ciudades' ? 'Nueva Ciudad' : activeTab === 'aeropuertos' ? 'Nuevo Aeropuerto' : activeTab === 'tipos-tiquetes' ? 'Nuevo Tipo de Tiquete' : activeTab === 'estados-cotizacion' ? 'Nuevo Estado Cotización' : 'Nuevo Implant'}
                            </motion.button>
                        </>
                    )}
                </div>
            </header>

            {/* Tabs Layout */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl mb-8 shadow-sm">
                <TabButton active={activeTab === 'parametros'} onClick={() => setActiveTab('parametros')} icon={<Settings className="w-4 h-4" />} label="Parámetros" />
                <TabButton active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} icon={<Users className="w-4 h-4" />} label="Usuarios" />
                <TabButton active={activeTab === 'sucursales'} onClick={() => setActiveTab('sucursales')} icon={<Building2 className="w-4 h-4" />} label="Sucursales" />
                <TabButton active={activeTab === 'implants'} onClick={() => setActiveTab('implants')} icon={<Database className="w-4 h-4" />} label="Implants" />
                <TabButton active={activeTab === 'impuestos'} onClick={() => setActiveTab('impuestos')} icon={<Tags className="w-4 h-4" />} label="Cargos e Impuestos" />
                <TabButton active={activeTab === 'vendedores'} onClick={() => setActiveTab('vendedores')} icon={<UserCheck className="w-4 h-4" />} label="Vendedores" />
                <TabButton active={activeTab === 'tiqueteadores'} onClick={() => setActiveTab('tiqueteadores')} icon={<Printer className="w-4 h-4" />} label="Tiqueteadores" />
                <TabButton active={activeTab === 'prestadoras'} onClick={() => setActiveTab('prestadoras')} icon={<HotelIcon className="w-4 h-4" />} label="Prestadoras" />
                <TabButton active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} icon={<Users className="w-4 h-4" />} label="Clientes" />
                <TabButton active={activeTab === 'proveedores'} onClick={() => setActiveTab('proveedores')} icon={<Building2 className="w-4 h-4" />} label="Proveedores" />
                <TabButton active={activeTab === 'productos'} onClick={() => setActiveTab('productos')} icon={<Tags className="w-4 h-4" />} label="Productos" />
                <TabButton active={activeTab === 'variables'} onClick={() => setActiveTab('variables')} icon={<Tags className="w-4 h-4" />} label="Variables Adic." />
                <TabButton active={activeTab === 'combos'} onClick={() => setActiveTab('combos')} icon={<Database className="w-4 h-4" />} label="Combos" />
                <TabButton active={activeTab === 'monedas'} onClick={() => setActiveTab('monedas')} icon={<DollarSign className="w-4 h-4" />} label="Monedas" />
                <TabButton active={activeTab === 'equivalencias'} onClick={() => setActiveTab('equivalencias')} icon={<Tags className="w-4 h-4" />} label="Equivalencias" />
                <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-1 my-2"></div>
                <TabButton active={activeTab === 'tarjetas-credito'} onClick={() => setActiveTab('tarjetas-credito')} icon={<Tags className="w-4 h-4" />} label="Tarjetas de Crédito" />
                <TabButton active={activeTab === 'formas-pago'} onClick={() => setActiveTab('formas-pago')} icon={<Tags className="w-4 h-4" />} label="Formas de Pago" />
                <TabButton active={activeTab === 'paises'} onClick={() => setActiveTab('paises')} icon={<Tags className="w-4 h-4" />} label="Países" />
                <TabButton active={activeTab === 'ciudades'} onClick={() => setActiveTab('ciudades')} icon={<Tags className="w-4 h-4" />} label="Ciudades" />
                <TabButton active={activeTab === 'aeropuertos'} onClick={() => setActiveTab('aeropuertos')} icon={<Tags className="w-4 h-4" />} label="Aeropuertos" />
                <TabButton active={activeTab === 'tipos-tiquetes'} onClick={() => setActiveTab('tipos-tiquetes')} icon={<Tags className="w-4 h-4" />} label="Tipos Tiquete" />
                <TabButton active={activeTab === 'estados-cotizacion'} onClick={() => setActiveTab('estados-cotizacion')} icon={<Tags className="w-4 h-4" />} label="Estados Cotiz." />
                <TabButton active={activeTab === 'formatos-cotizacion'} onClick={() => setActiveTab('formatos-cotizacion')} icon={<FileText className="w-4 h-4" />} label="Formatos Cotiz." />
                <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-1 my-2"></div>
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<TerminalSquare className="w-4 h-4" />} label="Logs del Sistema" />
            </div>

            {/* Barra de Búsqueda */}
            <div className="mb-8 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={`Buscar en ${activeTab === 'usuarios' ? 'Usuarios' : activeTab === 'sucursales' ? 'Sucursales' : activeTab === 'impuestos' ? 'Cargos e Impuestos' : activeTab === 'vendedores' ? 'Vendedores' : activeTab === 'tiqueteadores' ? 'Tiqueteadores' : activeTab === 'prestadoras' ? 'Prestadoras' : activeTab === 'clientes' ? 'Clientes' : activeTab === 'proveedores' ? 'Proveedores' : activeTab === 'productos' ? 'Productos' : activeTab === 'variables' ? 'Variables' : activeTab === 'parametros' ? 'Parámetros' : activeTab === 'monedas' ? 'Monedas' : activeTab === 'combos' ? 'Combos' : activeTab === 'logs' ? 'Logs' : activeTab === 'tarjetas-credito' ? 'Tarjetas' : activeTab === 'formas-pago' ? 'Formas de Pago' : activeTab === 'paises' ? 'Países' : activeTab === 'ciudades' ? 'Ciudades' : activeTab === 'aeropuertos' ? 'Aeropuertos' : activeTab === 'tipos-tiquetes' ? 'Tipos de Tiquete' : activeTab === 'estados-cotizacion' ? 'Estados de Cotización' : 'Implants'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-zinc-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
                {activeTab === 'formatos-cotizacion' ? (
                    <div className="p-8">
                        <QuotationFormatsTab branches={branches} implants={implants} />
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-full p-20">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
                    </div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                                <tr>
                                    {activeTab === 'usuarios' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Rol</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Edición Reportes</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'impuestos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre del Cargo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Valor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Editable</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'vendedores' || activeTab === 'tiqueteadores' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre del {activeTab === 'vendedores' ? 'Vendedor' : 'Tiqueteador'}</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'prestadoras' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Prestadora</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Proveedor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Categoría</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'clientes' || activeTab === 'proveedores' ? (
                                        <>
                                             <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">{activeTab === 'clientes' ? 'Documento' : 'Código'}</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Contacto</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'productos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Descripción</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Costo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Precio Base</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'monedas' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Moneda</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tasa Conv.</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Decimales</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'logs' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Acción / Módulo</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Detalle del Evento</th>
                                        </>
                                    ) : activeTab === 'variables' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código Único</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Variable</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'parametros' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Valor</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'combos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'equivalencias' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Interface</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Maestro</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código Maestro</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código Equiv.</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'tarjetas-credito' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'formas-pago' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'paises' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'ciudades' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'aeropuertos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'tipos-tiquetes' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Descripción</th>
                                            {activeTab === 'implants' && <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Sucursal</th>}
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                                {activeTab === 'usuarios' && (users || []).filter(user => 
                                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(user => (
                                    <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-zinc-900 dark:text-white mb-0.5">{user.name}</div>
                                            <div className="text-zinc-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">
                                                {user.role.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${
                                                user.canEditReports 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                                            }`}>
                                                {user.canEditReports ? 'Permitido' : 'No permitido'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(user)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'impuestos' && taxes.filter(tax => 
                                    tax.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    tax.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(tax => (
                                    <tr key={tax.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{tax.code || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{tax.name}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                {tax.type === 'TAX' ? 'Impuesto' : tax.type === 'CHARGE' ? 'Cargo Adic.' : 'Comisión'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-emerald-600">
                                            {tax.valueType === 'PERCENTAGE' ? `${tax.value}%` : `$${tax.value.toLocaleString()}`}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border",
                                                tax.isEditable
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                                                    : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                                            )}>
                                                {tax.isEditable ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(tax)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(tax.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'prestadoras' && prestadoras.filter(p => 
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(prestadora => (
                                    <tr key={prestadora.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{prestadora.code || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{prestadora.name}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300 text-xs">
                                            {prestadora.provider?.name || <span className="text-zinc-400 text-xs italic">Sin proveedor</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-100 dark:border-amber-900/30">
                                                {prestadora.category || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300 text-xs">
                                            {prestadora.type || '-'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(prestadora)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(prestadora.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'clientes' && (clients || []).filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.document?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.document || item.id || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.name}</td>
                                        <td className="px-8 py-6 text-zinc-500">
                                            {item.email && <div className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                            {item.phone && <div className="text-xs mt-1">{item.phone}</div>}
                                            {item.contactInfo && <div className="text-xs mt-1">{item.contactInfo}</div>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'proveedores' && (providers || []).filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.document || item.code || item.id || '-'}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.name}</td>
                                        <td className="px-8 py-6 text-zinc-500">
                                            {item.email && <div className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                            {item.phone && <div className="text-xs mt-1">{item.phone}</div>}
                                            {item.contactInfo && <div className="text-xs mt-1">{item.contactInfo}</div>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'productos' && (products || []).filter(item => 
                                    item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code || '-'}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.description}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-500">
                                            {item.cost != null ? `$${item.cost.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-8 py-6 font-black text-emerald-600">
                                            ${item.basePrice?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'parametros' && (parameters || []).filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-300">{item.value}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'combos' && (combos || []).filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDuplicateCombo(item)} title="Duplicar Combo" className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"><Copy className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'monedas' && (currencies || []).filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.exchangeRate}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.decimals ?? 2}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'equivalencias' && (equivalences || []).filter(item => 
                                    item.interface_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.master_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.cd_maestro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.cd_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-bold text-zinc-900 dark:text-white">{item.interface_name}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.master_name}</td>
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.cd_maestro}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">{item.cd_codigo}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {((activeTab === 'vendedores' ? sellers : activeTab === 'tiqueteadores' ? ticketPrinters : activeTab === 'sucursales' ? branches : activeTab === 'implants' ? implants : activeTab === 'variables' ? variables : activeTab === 'tarjetas-credito' ? creditCards : activeTab === 'formas-pago' ? payments : activeTab === 'paises' ? countries : activeTab === 'ciudades' ? cities : activeTab === 'aeropuertos' ? airports : activeTab === 'tipos-tiquetes' ? ticketTypes : activeTab === 'estados-cotizacion' ? quotationStates : []) || [])
                                .filter((item: any) => 
                                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-6 font-black text-blue-600 tracking-tighter text-base">{item.code || '-'}</td>
                                        <td className="px-8 py-6">
                                            <div className="text-zinc-600 dark:text-zinc-300 font-bold">{item.name}</div>
                                            {(activeTab === 'vendedores' || activeTab === 'tiqueteadores') && item.email && (
                                                <div className="text-zinc-400 text-xs flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {item.email}</div>
                                            )}
                                        </td>
                                        {activeTab === 'implants' && (
                                            <td className="px-8 py-6">
                                                {item.branch ? (
                                                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                        {item.branch.name}
                                                    </span>
                                                ) : <span className="text-zinc-400 text-xs italic">No asignada</span>}
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'logs' && logs.filter(log => 
                                    log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(log => (
                                    <tr key={log.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all text-sm">
                                        <td className="px-8 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            {log.user ? (
                                                <div className="font-bold text-zinc-900 dark:text-white">{log.user.name}</div>
                                            ) : (
                                                <div className="italic text-zinc-400">Sistema / Automático</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider",
                                                    log.action === 'CREATE' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/40" :
                                                        log.action === 'UPDATE' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/40" :
                                                            log.action === 'DELETE' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-900/40" :
                                                                log.action === 'LOGIN' ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:border-purple-900/40" :
                                                                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                )}>
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{log.module}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="text-zinc-700 dark:text-zinc-300 mb-1">{log.description}</div>
                                            {log.metadata && (
                                                <details className="mt-1">
                                                    <summary className="text-[10px] text-zinc-400 cursor-pointer hover:text-blue-500 font-bold uppercase tracking-widest inline-flex items-center gap-1">Ver Metadata Técnica</summary>
                                                    <pre className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 overflow-x-auto border border-zinc-200 dark:border-zinc-800">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                            Mostrando <span className="font-bold text-zinc-900 dark:text-white">{totalItems === 0 ? 0 : Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span> a <span className="font-bold text-zinc-900 dark:text-white">{Math.min(totalItems, currentPage * pageSize)}</span> de <span className="font-bold text-zinc-900 dark:text-white">{totalItems}</span> registros
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filas por página:</label>
                                <select
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(parseInt(e.target.value))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs rounded-xl shadow-sm transition-all"
                                >
                                    Anterior
                                </button>
                                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-bold px-2">
                                    {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs rounded-xl shadow-sm transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* Modal - Unified for Settings */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "bg-white dark:bg-zinc-900 w-full rounded-[3.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col",
                                activeTab === 'combos' ? "max-w-6xl" : "max-w-xl"
                            )}
                        >
                            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        {activeTab === 'usuarios' ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black dark:text-white">{formData.id ? 'Editar' : 'Nuevo'} {activeTab === 'usuarios' ? 'Usuario' : activeTab === 'sucursales' ? 'Sucursal' : activeTab === 'impuestos' ? 'Cargo/Impuesto' : activeTab === 'vendedores' ? 'Vendedor' : activeTab === 'tiqueteadores' ? 'Tiqueteador' : activeTab === 'prestadoras' ? 'Prestadora' : activeTab === 'clientes' ? 'Cliente' : activeTab === 'proveedores' ? 'Proveedor' : activeTab === 'productos' ? 'Producto' : activeTab === 'variables' ? 'Variable' : activeTab === 'parametros' ? 'Parámetro' : activeTab === 'monedas' ? 'Moneda' : activeTab === 'combos' ? 'Combo' : activeTab === 'equivalencias' ? 'Equivalencia' : activeTab === 'tarjetas-credito' ? 'Tarjeta' : activeTab === 'formas-pago' ? 'Forma de Pago' : activeTab === 'paises' ? 'País' : activeTab === 'ciudades' ? 'Ciudad' : activeTab === 'aeropuertos' ? 'Aeropuerto' : activeTab === 'tipos-tiquetes' ? 'Tipo de Tiquete' : activeTab === 'estados-cotizacion' ? 'Estado de Cotización' : 'Implant'}</h3>
                                        <p className="text-zinc-500 text-sm font-medium">Asigna los parámetros correspondientes</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
                                <div className="flex-1 overflow-y-auto p-10 space-y-6 min-h-0">
                                {activeTab === 'usuarios' ? (
                                    <>
                                        <Input label="Nombre Completo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Alex Smith" />
                                        <Input label="Email de Acceso" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} required type="email" placeholder="email@ejemplo.com" />
                                        <Input label="Contraseña" value={formData.password || ''} onChange={(v: string) => setFormData({ ...formData, password: v })} required={!formData.id} type="password" placeholder={formData.id ? "Dejar vacío para no cambiar" : "Min. 8 caracteres"} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Rol de Usuario</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.roleId || ''}
                                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Seleccionar Rol</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Sucursal</label>
                                                <SearchSelect
                                                    options={branches}
                                                    value={formData.branchId?.toString() || ''}
                                                    onChange={(val) => setFormData({ ...formData, branchId: val })}
                                                    placeholder="Ninguna / No aplica"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Implant Asignado</label>
                                                <SearchSelect
                                                    options={implants}
                                                    value={formData.implantId?.toString() || ''}
                                                    onChange={(val) => setFormData({ ...formData, implantId: val })}
                                                    placeholder="Ninguno / No aplica"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tiqueteador Pred.</label>
                                                <SearchSelect
                                                    options={ticketPrinters}
                                                    value={formData.ticketPrinterId?.toString() || ''}
                                                    onChange={(val) => setFormData({ ...formData, ticketPrinterId: val })}
                                                    placeholder="Ninguno / No aplica"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <label className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.canEditReports || false}
                                                    onChange={(e) => setFormData({ ...formData, canEditReports: e.target.checked })}
                                                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 cursor-pointer"
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                                                        Permitir edición de reportes / cotizaciones (Botón Activar Editor)
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 font-normal">
                                                        Habilita la capacidad de modificar visualmente celdas, estilos y márgenes en los reportes de impresión.
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </>
                                ) : activeTab === 'impuestos' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Código (Ej. IVA_19)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. IVA_19 (Opcional)" />
                                            <Input label="Nombre (Ej. IVA 19%)" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. IVA 19%" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Cargo</label>
                                            <select
                                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="TAX">Impuesto Tributario (Ej. IVA)</option>
                                                <option value="CHARGE">Servicio / Cargo Extra</option>
                                                <option value="COMMISSION">Comisión de Agencia</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Operación</label>
                                                <select
                                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    value={formData.valueType}
                                                    onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                                                >
                                                    <option value="PERCENTAGE">Porcentaje (%)</option>
                                                    <option value="FIXED">Costo Fijo ($)</option>
                                                </select>
                                            </div>
                                            <Input label="Valor" value={formData.value} onChange={(v: string) => setFormData({ ...formData, value: v })} required type="number" step="0.01" placeholder="Ej. 19" />
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                            <input
                                                type="checkbox"
                                                id="isEditable"
                                                className="w-5 h-5 rounded-lg border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={formData.isEditable !== false}
                                                onChange={(e) => setFormData({ ...formData, isEditable: e.target.checked })}
                                            />
                                            <label htmlFor="isEditable" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                                Permitir editar libremente en cotizaciones
                                                <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Si se desactiva, el valor será fijo según este maestro</span>
                                            </label>
                                        </div>
                                    </>
                                ) : activeTab === 'vendedores' || activeTab === 'tiqueteadores' ? (
                                    <>
                                        <Input label="Código" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. VEN-001 (Opcional)" />
                                        <Input label="Nombre del Profesional" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder={`Ej. ${activeTab === 'vendedores' ? 'Pedro Perez' : 'Oficina Principal'}`} />
                                        <Input label="Email de Contacto" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} type="email" placeholder="ejemplo@correo.com (Opcional)" />
                                    </>
                                ) : activeTab === 'prestadoras' ? (
                                    <>
                                        <Input label="Código de la Prestadora" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. P-001 (Opcional)" />
                                        <Input label="Nombre de la Prestadora" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Decameron San Luis" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Estrellas/Cat." value={formData.category || ''} onChange={(v: string) => setFormData({ ...formData, category: v })} placeholder="Ej. 4*" />
                                            <Input label="Ubicación" value={formData.location || ''} onChange={(v: string) => setFormData({ ...formData, location: v })} placeholder="Ej. San Andrés, Colombia" />
                                        </div>
                                        <Input label="Tipo (Texto Abierto)" value={formData.type || ''} onChange={(v: string) => setFormData({ ...formData, type: v })} placeholder="Ej. Alojamiento, Transporte, etc" />
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Proveedor / Operador</label>
                                            <SearchSelect
                                                options={providers}
                                                value={formData.providerId?.toString() || ''}
                                                onChange={(val) => setFormData({ ...formData, providerId: val })}
                                                placeholder="Seleccionar Proveedor"
                                            />
                                        </div>
                                    </>
                                ) : activeTab === 'implants' ? (
                                    <>
                                        <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG-01" />
                                        <Input label="Nombre / Descripción" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Sede Norte Bogotá" />
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Sucursal Asociada</label>
                                            <SearchSelect
                                                options={branches}
                                                value={formData.branchId?.toString() || ''}
                                                onChange={(val) => setFormData({ ...formData, branchId: val })}
                                                placeholder="Seleccionar Sucursal"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Logo de Implant (Opcional)</label>
                                            <div className="flex items-center gap-4">
                                                {formData.logo && (
                                                    <img src={formData.logo} alt="Logo preview" className="w-16 h-16 object-contain bg-white rounded-xl border border-zinc-200" />
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData({ ...formData, logo: reader.result });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                            </div>
                                        </div>

                                        {/* Excel Template and Configuration Section */}
                                        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                                            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                                                Plantilla de Reporte Excel
                                            </h4>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">
                                                    Archivo de Plantilla (.xlsx, .xls)
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <input 
                                                         type="file" 
                                                         id="implant-template-file-input"
                                                         accept=".xlsx,.xls"
                                                         onChange={(e) => {
                                                             const file = e.target.files?.[0];
                                                             if (file) {
                                                                 const reader = new FileReader();
                                                                 reader.onloadend = () => {
                                                                     setFormData({ ...formData, template: reader.result, clearTemplate: false });
                                                                 };
                                                                 reader.readAsDataURL(file);
                                                             }
                                                         }}
                                                         className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                     />
                                                     {formData.hasTemplate && !formData.template && !formData.clearTemplate && (
                                                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md shrink-0">
                                                             ✓ Guardada
                                                         </span>
                                                     )}
                                                     {formData.template && (
                                                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md shrink-0">
                                                             ✓ Nueva
                                                         </span>
                                                     )}
                                                     {((formData.hasTemplate && !formData.clearTemplate) || formData.template) && (
                                                         <button
                                                             type="button"
                                                             onClick={() => {
                                                                 setFormData({ ...formData, template: null, hasTemplate: false, clearTemplate: true });
                                                                 const fileInput = document.getElementById('implant-template-file-input') as HTMLInputElement;
                                                                 if (fileInput) fileInput.value = '';
                                                             }}
                                                             className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold transition-all border border-red-100 shrink-0"
                                                             title="Eliminar plantilla actual de la base de datos"
                                                         >
                                                             <Trash2 className="w-3.5 h-3.5" />
                                                             <span>Eliminar</span>
                                                         </button>
                                                     )}
                                                </div>
                                            </div>

                                            {/* Coordinates Editor */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 block">
                                                    Coordenadas de Celdas (Ej. B4, G4)
                                                </label>
                                                
                                                <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
                                                    <summary className="p-4 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center justify-between dark:text-zinc-300">
                                                        <span>Personalizar Mapeo de Celdas</span>
                                                        <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                                                    </summary>                                                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                                                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead>
                                                                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                                                                        <th className="py-2 px-3">Campo / Descripción</th>
                                                                        <th className="py-2 px-3">Token / Código</th>
                                                                        <th className="py-2 px-3 w-32">Coordenada</th>
                                                                        <th className="py-2 px-3 w-28 text-center">Acción</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                                    {(() => {
                                                                        const config = formData.templateConfig || {};
                                                                        const customNames = config.__customNames || {};
                                                                        const defaultPlaceholders: Record<string, string> = {
                                                                            asesor: "B4", fecha: "G4", clienteNombre: "B7", clienteIdentificacion: "G7",
                                                                            clienteDireccion: "B8", clienteTelefono: "G8", centroCosto: "B9", solicita: "G9",
                                                                            tCambio: "G11", descripcionPlan: "B12", fechasViaje: "G12", hotelesServicios: "A13",
                                                                            pasajeros: "B14", totalAdultos: "C15", totalNinos: "G15", logo: "A1"
                                                                        };

                                                                        let mappedKeys = Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                        if (config && Array.isArray(config.__keysOrder)) {
                                                                            const ordered = config.__keysOrder.filter((k: string) => k in config);
                                                                            const missing = mappedKeys.filter(k => !ordered.includes(k));
                                                                            mappedKeys = [...ordered, ...missing];
                                                                        }
                                                                        
                                                                        const allFields = mappedKeys.map(key => ({
                                                                            key,
                                                                            label: getFieldLabel(key),
                                                                            isCustom: key.startsWith('col_') || !!customNames[key]
                                                                        }));

                                                                        const DEFAULT_CONFIG = defaultPlaceholders as any;

                                                                        return allFields.map((f, idx) => (
                                                                            <tr key={f.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                                                                <td className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                                                                                    {f.isCustom ? (
                                                                                        <input 
                                                                                            type="text"
                                                                                            value={f.label}
                                                                                            onChange={(e) => {
                                                                                                const newNames = { ...customNames, [f.key]: e.target.value };
                                                                                                const newConfig = { ...config, __customNames: newNames };
                                                                                                setFormData({ ...formData, templateConfig: newConfig });
                                                                                            }}
                                                                                            className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                                            placeholder="Nombre del campo"
                                                                                        />
                                                                                    ) : (
                                                                                        <span>{f.label}</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2 px-3 font-mono text-[10px] text-zinc-400">
                                                                                    {f.isCustom ? (
                                                                                        <input 
                                                                                            type="text"
                                                                                            value={f.key}
                                                                                            onChange={(e) => {
                                                                                                const newKey = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                                                                                if (!newKey || newKey === '__customNames') return;
                                                                                                
                                                                                                const newNames = { ...customNames };
                                                                                                const newConfig = { ...config };
                                                                                                
                                                                                                const val = newConfig[f.key];
                                                                                                delete newConfig[f.key];
                                                                                                newConfig[newKey] = val || '';
                                                                                                
                                                                                                const label = newNames[f.key];
                                                                                                delete newNames[f.key];
                                                                                                newNames[newKey] = label || f.label;
                                                                                                
                                                                                                newConfig.__customNames = newNames;
                                                                                                
                                                                                                // Actualizar la clave en __keysOrder
                                                                                                if (Array.isArray(config.__keysOrder)) {
                                                                                                    newConfig.__keysOrder = config.__keysOrder.map((k: string) => k === f.key ? newKey : k);
                                                                                                }
                                                                                                
                                                                                                setFormData({ ...formData, templateConfig: newConfig });
                                                                                            }}
                                                                                            className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                                            placeholder="token"
                                                                                        />
                                                                                    ) : (
                                                                                        <span>{f.key}</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2 px-3">
                                                                                    <input 
                                                                                        type="text"
                                                                                        value={config[f.key] || ''}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                                                            const newConfig = { ...config, [f.key]: val };
                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                        }}
                                                                                        placeholder={DEFAULT_CONFIG[f.key as keyof typeof DEFAULT_CONFIG] || 'A1'}
                                                                                        className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white uppercase"
                                                                                    />
                                                                                </td>
                                                                                <td className="py-2 px-3 text-center">
                                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={idx === 0}
                                                                                            onClick={() => {
                                                                                                const keys = [...mappedKeys];
                                                                                                const temp = keys[idx];
                                                                                                keys[idx] = keys[idx - 1];
                                                                                                keys[idx - 1] = temp;
                                                                                                
                                                                                                const newConfig: any = {};
                                                                                                keys.forEach(k => {
                                                                                                    newConfig[k] = config[k];
                                                                                                });
                                                                                                newConfig.__keysOrder = keys;
                                                                                                if (config.__customNames) newConfig.__customNames = config.__customNames;
                                                                                                if (config.__productFields) newConfig.__productFields = config.__productFields;
                                                                                                setFormData({ ...formData, templateConfig: newConfig });
                                                                                            }}
                                                                                            className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                                                            title="Subir Posición"
                                                                                        >
                                                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={idx === mappedKeys.length - 1}
                                                                                            onClick={() => {
                                                                                                const keys = [...mappedKeys];
                                                                                                const temp = keys[idx];
                                                                                                keys[idx] = keys[idx + 1];
                                                                                                keys[idx + 1] = temp;
                                                                                                
                                                                                                const newConfig: any = {};
                                                                                                keys.forEach(k => {
                                                                                                    newConfig[k] = config[k];
                                                                                                });
                                                                                                newConfig.__keysOrder = keys;
                                                                                                if (config.__customNames) newConfig.__customNames = config.__customNames;
                                                                                                if (config.__productFields) newConfig.__productFields = config.__productFields;
                                                                                                setFormData({ ...formData, templateConfig: newConfig });
                                                                                            }}
                                                                                            className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                                                            title="Bajar Posición"
                                                                                        >
                                                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const newNames = { ...customNames };
                                                                                                delete newNames[f.key];
                                                                                                const newConfig = { ...config };
                                                                                                delete newConfig[f.key];
                                                                                                newConfig.__customNames = newNames;
                                                                                                if (Array.isArray(config.__keysOrder)) {
                                                                                                    newConfig.__keysOrder = config.__keysOrder.filter((k: string) => k !== f.key);
                                                                                                }
                                                                                                setFormData({ ...formData, templateConfig: newConfig });
                                                                                            }}
                                                                                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                                            title="Eliminar del Mapeo"
                                                                                        >
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ));
                                                                    })()}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Agregar Variable de Cotización al Mapeo</span>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1">
                                                                    <select
                                                                        id="field-selector-implant"
                                                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>-- Seleccionar Campo de Cotización --</option>
                                                                        {renderMappingOptions()}
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const selectEl = document.getElementById('field-selector-implant') as HTMLSelectElement;
                                                                        if (!selectEl || !selectEl.value) return;
                                                                        const [key, label] = selectEl.value.split('|');
                                                                        
                                                                        const config = formData.templateConfig || {};
                                                                        const customNames = config.__customNames || {};
                                                                        
                                                                        let finalKey = key;
                                                                        let finalLabel = label;
                                                                        if (key === 'custom') {
                                                                            finalKey = 'col_' + Date.now();
                                                                            finalLabel = 'Nueva Columna';
                                                                        }
                                                                        
                                                                        const newConfig = { ...config, [finalKey]: '' };
                                                                        if (key === 'custom' || !getFieldLabel(finalKey)) {
                                                                            newConfig.__customNames = { ...customNames, [finalKey]: finalLabel };
                                                                        } else if (label) {
                                                                            newConfig.__customNames = { ...customNames, [finalKey]: finalLabel };
                                                                        }
                                                                        
                                                                        let currentKeys = Array.isArray(config.__keysOrder) ? [...config.__keysOrder] : Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                        if (!currentKeys.includes(finalKey)) {
                                                                            currentKeys.push(finalKey);
                                                                        }
                                                                        newConfig.__keysOrder = currentKeys;
                                                                        
                                                                        setFormData({ ...formData, templateConfig: newConfig });
                                                                        selectEl.value = "";
                                                                    }}
                                                                    className="px-4 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                                                                >
                                                                    + Agregar al Mapeo
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const config = formData.templateConfig || {};
                                                                        const customNames = config.__customNames || {};
                                                                        const newId = 'col_' + Date.now();
                                                                        const newConfig = { ...config, [newId]: '' };
                                                                        newConfig.__customNames = { ...customNames, [newId]: 'Nueva Columna' };
                                                                        
                                                                        let currentKeys = Array.isArray(config.__keysOrder) ? [...config.__keysOrder] : Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                        if (!currentKeys.includes(newId)) {
                                                                            currentKeys.push(newId);
                                                                        }
                                                                        newConfig.__keysOrder = currentKeys;
                                                                        
                                                                        setFormData({ ...formData, templateConfig: newConfig });
                                                                    }}
                                                                    className="px-4 h-10 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-all"
                                                                >
                                                                    + Campo Personalizado
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'clientes' || activeTab === 'proveedores' ? (
                                            <>
                                                {activeTab === 'clientes' && <Input label="Documento / NIT" value={formData.document || ''} onChange={(v: string) => setFormData({ ...formData, document: v })} required placeholder="No. de Documento" />}
                                                 {activeTab === 'proveedores' && <Input label="Código del Proveedor" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. AMADEUS" />}
                                                 <Input label="Nombre o Razón Social" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Nombre de Empresa / Persona" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Email de Contacto" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} type="email" placeholder="Opcional" />
                                                    <Input label="Teléfono / Contacto" value={formData.contactInfo || formData.phone || ''} onChange={(v: string) => setFormData({ ...formData, contactInfo: v, phone: v })} placeholder="Opcional" />
                                                </div>
                                                {activeTab === 'clientes' && <Input label="Dirección" value={formData.address || ''} onChange={(v: string) => setFormData({ ...formData, address: v })} placeholder="Opcional" />}
                                                {activeTab === 'clientes' && (
                                                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                                            Variables Adicionales Obligatorias para Cotizaciones
                                                        </h4>
                                                        <p className="text-xs text-zinc-500">
                                                            Selecciona cuáles variables adicionales serán de carácter obligatorio al guardar una cotización para este cliente.
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                                                            {variables && variables.length > 0 ? (
                                                                variables.map((v: any) => {
                                                                    const isChecked = Array.isArray(formData.mandatoryVariables)
                                                                        ? formData.mandatoryVariables.includes(v.id)
                                                                        : false;
                                                                    return (
                                                                        <label key={v.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                                                                checked={isChecked}
                                                                                onChange={(e) => {
                                                                                    const currentMandatory = Array.isArray(formData.mandatoryVariables)
                                                                                        ? [...formData.mandatoryVariables]
                                                                                        : [];
                                                                                    if (e.target.checked) {
                                                                                        if (!currentMandatory.includes(v.id)) {
                                                                                            currentMandatory.push(v.id);
                                                                                        }
                                                                                    } else {
                                                                                        const index = currentMandatory.indexOf(v.id);
                                                                                        if (index > -1) {
                                                                                            currentMandatory.splice(index, 1);
                                                                                        }
                                                                                    }
                                                                                    setFormData({ ...formData, mandatoryVariables: currentMandatory });
                                                                                }}
                                                                            />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">{v.name}</span>
                                                                                <span className="text-[10px] text-zinc-400 font-mono">{v.code}</span>
                                                                            </div>
                                                                        </label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="col-span-2 text-center py-4 text-xs text-zinc-400">
                                                                    No hay variables adicionales configuradas en el sistema.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : activeTab === 'productos' ? (
                                            <>
                                                <Input label="Código del Producto" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} placeholder="Ej. P-001 (Opcional)" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Servicio</label>
                                                        <select
                                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                            value={formData.type || 'Servicio'}
                                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                        >
                                                            <option value="Servicio">Servicio</option>
                                                            <option value="Boleto">Boleto Aéreo</option>
                                                            <option value="Alojamiento">Alojamiento</option>
                                                            <option value="Asistencia">Asistencia Médica</option>
                                                            <option value="Otro">Otro</option>
                                                        </select>
                                                    </div>
                                                    <Input label="Costo ($)" value={formData.cost ?? ''} onChange={(v: string) => setFormData({ ...formData, cost: v === '' ? '' : parseFloat(v) })} type="number" step="0.01" placeholder="0.00" />
                                                    <Input label="Precio Base ($)" value={formData.basePrice ?? ''} onChange={(v: string) => setFormData({ ...formData, basePrice: v === '' ? '' : parseFloat(v) })} type="number" step="0.01" required placeholder="0.00" />
                                                </div>
                                                <Input label="Descripción / Nombre" value={formData.description || ''} onChange={(v: string) => setFormData({ ...formData, description: v })} required placeholder="Ej. Tiquete Aéreo Nacional" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Concepto de Facturación" value={formData.billingConcept || ''} onChange={(v: string) => setFormData({ ...formData, billingConcept: v })} placeholder="Opcional" />
                                                    <Input label="Clasificación Servicio" value={formData.serviceType || ''} onChange={(v: string) => setFormData({ ...formData, serviceType: v })} placeholder="Opcional" />
                                                </div>
                                                {formData.type === 'Boleto' && (
                                                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Itinerario y Tiquete</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Tipo de Tiquete</label>
                                                                <SearchSelect
                                                                    options={ticketTypes}
                                                                    value={formData.ticketTypeId?.toString() || ''}
                                                                    onChange={(val) => setFormData({ ...formData, ticketTypeId: val })}
                                                                    labelKey="name"
                                                                    placeholder="Seleccionar Tipo"
                                                                />
                                                            </div>
                                                            <Input label="Itinerario de Vuelo" value={formData.flightItinerary || ''} onChange={(v: string) => setFormData({ ...formData, flightItinerary: v })} placeholder="Ej. BOG/CTG" />
                                                            <Input label="Itinerario de Clases" value={formData.classItinerary || ''} onChange={(v: string) => setFormData({ ...formData, classItinerary: v })} placeholder="Ej. C/C" />
                                                            <Input label="Itinerario de Aerolínea" value={formData.airlineItinerary || ''} onChange={(v: string) => setFormData({ ...formData, airlineItinerary: v })} placeholder="Ej. AV/AV" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider pl-1 font-title">Campos Obligatorios en Cotización</h4>
                                                    <p className="text-xs text-zinc-400 pl-1">Seleccione qué campos serán obligatorios cuando un asesor agregue este producto a una cotización.</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                                        <div className="space-y-3">
                                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-1">Por Producto</span>
                                                            {AVAILABLE_MANDATORY_FIELDS.filter(f => f.group === 'Por Producto').map(f => {
                                                                const isChecked = (formData.mandatoryFields || []).includes(f.key);
                                                                return (
                                                                    <label key={f.key} className="flex items-center gap-3 cursor-pointer text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 rounded text-blue-600 border-zinc-300 focus:ring-blue-500 bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                                                                            checked={isChecked}
                                                                            onChange={(e) => {
                                                                                let current = [...(formData.mandatoryFields || [])];
                                                                                if (e.target.checked) {
                                                                                    current.push(f.key);
                                                                                } else {
                                                                                    current = current.filter(k => k !== f.key);
                                                                                }
                                                                                setFormData({ ...formData, mandatoryFields: current });
                                                                            }}
                                                                        />
                                                                        {f.label}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="space-y-3">
                                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-1">Cabecera (General)</span>
                                                            {AVAILABLE_MANDATORY_FIELDS.filter(f => f.group === 'Cabecera').map(f => {
                                                                const isChecked = (formData.mandatoryFields || []).includes(f.key);
                                                                return (
                                                                    <label key={f.key} className="flex items-center gap-3 cursor-pointer text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 rounded text-blue-600 border-zinc-300 focus:ring-blue-500 bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                                                                            checked={isChecked}
                                                                            onChange={(e) => {
                                                                                let current = [...(formData.mandatoryFields || [])];
                                                                                if (e.target.checked) {
                                                                                    current.push(f.key);
                                                                                } else {
                                                                                    current = current.filter(k => k !== f.key);
                                                                                }
                                                                                setFormData({ ...formData, mandatoryFields: current });
                                                                            }}
                                                                        />
                                                                        {f.label}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : activeTab === 'monedas' ? (
                                            <>
                                                <Input label="Código de Moneda" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. USD, EUR, PA" />
                                                <Input label="Nombre de la Moneda" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Dólar Estadounidense" />
                                                <Input label="Tasa de Cambio (respecto a moneda base)" value={formData.exchangeRate ?? ''} onChange={(v: string) => setFormData({ ...formData, exchangeRate: v === '' ? '' : parseFloat(v) })} type="number" step="0.0001" required placeholder="Ej. 1.000" />
                                                <Input label="Número de Decimales" value={formData.decimals !== undefined ? formData.decimals : 2} onChange={(v: string) => setFormData({ ...formData, decimals: v === '' ? 2 : parseInt(v) })} type="number" min="0" max="6" step="1" required placeholder="Ej. 2" />
                                            </>
                                        ) : activeTab === 'combos' ? (
                                            <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-10 p-2">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                    <Input label="Código del Combo" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. COMBO-PROMO" />
                                                    <Input label="Nombre del Combo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Paquete Turístico" />
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Cupos Disponibles</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-emerald-600 dark:text-emerald-400"
                                                            value={formData.cupos ?? 0}
                                                            placeholder="0"
                                                            onChange={(e) => setFormData({ ...formData, cupos: parseInt(e.target.value) || 0 })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Moneda del Combo</label>
                                                        <select
                                                            className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                            value={formData.currencyId || ''}
                                                            onChange={(e) => setFormData({ ...formData, currencyId: e.target.value ? parseInt(e.target.value) : null })}
                                                        >
                                                            <option value="">Seleccionar Moneda...</option>
                                                            {currencies.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider pl-1 font-title">Productos del Combo</label>
                                                            <p className="text-[10px] text-zinc-400 pl-1">Define los servicios individuales que componen este paquete</p>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const newProds = [...(formData.products || []), { productId: '', quantity: 1, price: 0, appliedTaxes: [], inNationality: 1 }];
                                                                setFormData({ ...formData, products: newProds });
                                                            }}
                                                            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all border-b-2 border-blue-800 active:translate-y-px"
                                                        >
                                                            <Plus className="w-4 h-4" /> Agregar Producto
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-8">
                                                        {(formData.products || []).map((cp: any, idx: number) => (
                                                        <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 relative group/item">
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newProds = formData.products.filter((_: any, i: number) => i !== idx);
                                                                    setFormData({ ...formData, products: newProds });
                                                                }}
                                                                className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all"
                                                                title="Eliminar producto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>

                                                            {/* Section: Service Info */}
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                    <Tag className="w-3 h-3" /> Información del Servicio
                                                                </label>
                                                                <div className="grid grid-cols-12 gap-4">
                                                                    <div className="col-span-12">
                                                                        <SearchSelect
                                                                            options={products}
                                                                            value={cp.productId?.toString() || ''}
                                                                            onChange={(val) => {
                                                                                const prod = products.find((p: any) => p.id === parseInt(val));
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = {
                                                                                    ...cp,
                                                                                    productId: val,
                                                                                    price: prod?.basePrice || 0,
                                                                                    cost: prod?.cost ?? 0
                                                                                };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                            placeholder="Seleccionar Producto..."
                                                                            labelKey="description"
                                                                            secondaryKey="code"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Section: Prestadora & Dates */}
                                                            <div className="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl space-y-4">
                                                                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                    <HotelIcon className="w-3 h-3" /> Alojamiento y Fechas
                                                                </label>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <div className="space-y-1">
                                                                        <SearchSelect
                                                                            options={providers}
                                                                            value={cp.providerId?.toString() || ''}
                                                                            onChange={(val) => {
                                                                                const numericVal = val ? parseInt(val) : null;
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, providerId: numericVal, prestadoraId: null };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                            placeholder="Sel. Proveedor..."
                                                                            secondaryKey="code"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <SearchSelect
                                                                            options={prestadoras.filter(h => !cp.providerId || h.providerId === cp.providerId)}
                                                                            value={cp.prestadoraId?.toString() || ''}
                                                                            onChange={(val) => {
                                                                                const numericVal = val ? parseInt(val) : null;
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, prestadoraId: numericVal };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                            disabled={!cp.providerId}
                                                                            placeholder="Sel. Prestadora..."
                                                                            secondaryKey="code"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <select 
                                                                            className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-3 border border-zinc-200 dark:border-zinc-700 text-[11px] font-black text-emerald-600 dark:text-emerald-400 outline-none"
                                                                            value={cp.inNationality || 1}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                const newProds = [...formData.products];
                                                                                newProds[idx] = { ...cp, inNationality: val };
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                        >
                                                                            <option value={1}>Nacional</option>
                                                                            <option value={2}>Internacional</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Check-In</label>
                                                                        <input type="date" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold outline-none" value={cp.checkInDate ? cp.checkInDate.split('T')[0] : ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, checkInDate: e.target.value };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Check-Out</label>
                                                                        <input type="date" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold outline-none" value={cp.checkOutDate ? cp.checkOutDate.split('T')[0] : ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, checkOutDate: e.target.value };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Cantidad</label>
                                                                        <input type="number" min="1" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-emerald-500" value={cp.quantity || 1} onChange={(e) => {
                                                                            const val = Math.max(1, parseInt(e.target.value) || 1);
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, quantity: val };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Adultos</label>
                                                                        <input type="number" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-emerald-500" value={cp.paxAdults || ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, paxAdults: parseInt(e.target.value) || 0 };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Niños</label>
                                                                        <input type="number" className="w-full h-10 bg-white dark:bg-zinc-900 rounded-xl px-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold outline-none transition-all focus:ring-1 focus:ring-emerald-500" value={cp.paxChildren || ''} onChange={(e) => {
                                                                            const newProds = [...formData.products];
                                                                            newProds[idx] = { ...cp, paxChildren: parseInt(e.target.value) || 0 };
                                                                            setFormData({ ...formData, products: newProds });
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Section: Values & Taxes */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                                        <DollarSign className="w-3 h-3" /> Valores e Impuestos
                                                                    </label>
                                                                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/10 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-800">
                                                                        <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider">Cargo Principal:</span>
                                                                        <select 
                                                                            className="h-7 bg-transparent text-[10px] font-black text-purple-700 dark:text-purple-300 outline-none border-none cursor-pointer"
                                                                            value={cp.mainTaxId?.toString() || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value ? parseInt(e.target.value) : null;
                                                                                const newProds = [...formData.products];
                                                                                let nextApplied = [...(cp.appliedTaxes || [])];
                                                                                
                                                                                if (val && !nextApplied.some(t => t.chargeAndTaxId === val)) {
                                                                                    const tax = taxes.find(t => t.id === val);
                                                                                    const initialAmount = tax.valueType === 'PERCENTAGE' ? (cp.price * cp.quantity * tax.value / 100) : tax.value * cp.quantity;
                                                                                    nextApplied.push({ chargeAndTaxId: val, amount: initialAmount });
                                                                                }
                                                                                if (val) {
                                                                                    const mainAmount = nextApplied.find(t => t.chargeAndTaxId === val)?.amount || 0;
                                                                                    nextApplied = nextApplied.map(at => {
                                                                                        if (at.chargeAndTaxId === val) return at;
                                                                                        const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                        if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                            return { ...at, amount: (originalTax.value / 100) * mainAmount };
                                                                                        }
                                                                                        return at;
                                                                                    });
                                                                                    // Important: Ensure price is updated to match the new main tax amount
                                                                                    newProds[idx] = { 
                                                                                        ...cp, 
                                                                                        mainTaxId: val, 
                                                                                        price: mainAmount / (cp.quantity || 1),
                                                                                        appliedTaxes: nextApplied 
                                                                                    };
                                                                                } else {
                                                                                    newProds[idx] = { ...cp, mainTaxId: val, appliedTaxes: nextApplied };
                                                                                }
                                                                                setFormData({ ...formData, products: newProds });
                                                                            }}
                                                                        >
                                                                            <option value="">Seleccionar...</option>
                                                                            {taxes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* Left: Total Calculation Area */}
                                                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col justify-center gap-2">
                                                                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Valor Total de Fila (Sumatoria)</label>
                                                                        <div className="relative">
                                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                                                            <input 
                                                                                type="number"
                                                                                className="w-full h-14 bg-white dark:bg-zinc-900 rounded-2xl pl-10 pr-4 text-xl font-black text-blue-600 outline-none border-2 border-blue-200 focus:border-blue-500 shadow-sm text-center"
                                                                                value={((cp.price * cp.quantity) + (cp.appliedTaxes || []).filter((t: any) => t.chargeAndTaxId !== cp.mainTaxId).reduce((acc: number, t: any) => acc + (t.amount || 0), 0)).toFixed(2)}
                                                                                onChange={(e) => {
                                                                                    const newTotal = parseFloat(e.target.value) || 0;
                                                                                    const currentOtherTaxes = (cp.appliedTaxes || []).filter((t: any) => t.chargeAndTaxId !== cp.mainTaxId).reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
                                                                                    const newChargeAmount = newTotal - currentOtherTaxes;
                                                                                    const newProds = [...formData.products];
                                                                                    
                                                                                    let newApplied = (cp.appliedTaxes || []).map((at: any) => {
                                                                                        if (at.chargeAndTaxId === cp.mainTaxId) return { ...at, amount: newChargeAmount };
                                                                                        const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                        if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                            return { ...at, amount: (originalTax.value / 100) * newChargeAmount };
                                                                                        }
                                                                                        return at;
                                                                                    });

                                                                                    newProds[idx] = { 
                                                                                        ...cp, 
                                                                                        price: newChargeAmount / (cp.quantity || 1),
                                                                                        appliedTaxes: newApplied
                                                                                    };
                                                                                    setFormData({ ...formData, products: newProds });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Center: Cost Field */}
                                                                    <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 flex flex-col justify-center gap-2">
                                                                        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest text-center">Costo del Producto ($)</label>
                                                                        <div className="relative">
                                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                className="w-full h-14 bg-white dark:bg-zinc-900 rounded-2xl pl-10 pr-4 text-xl font-black text-orange-600 outline-none border-2 border-orange-200 focus:border-orange-500 shadow-sm text-center"
                                                                                value={cp.cost ?? 0}
                                                                                placeholder="0.00"
                                                                                onChange={(e) => {
                                                                                    const newProds = [...formData.products];
                                                                                    newProds[idx] = { ...cp, cost: parseFloat(e.target.value) || 0 };
                                                                                    setFormData({ ...formData, products: newProds });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Right: Individually applied taxes */}
                                                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                                                        {taxes.map(tax => {
                                                                            const appliedTax = (cp.appliedTaxes || []).find((at: any) => at.chargeAndTaxId === tax.id);
                                                                            const checked = !!appliedTax;
                                                                            return (
                                                                                <div key={tax.id} className={cn(
                                                                                    "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
                                                                                    cp.mainTaxId === tax.id ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800" : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                                                                )}>
                                                                                    <input 
                                                                                        type="checkbox"
                                                                                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                                                                                        checked={checked}
                                                                                        onChange={(e) => {
                                                                                                const newProds = [...formData.products];
                                                                                                let newApplied = [...(cp.appliedTaxes || [])];
                                                                                                if (e.target.checked) {
                                                                                                    const baseForCalc = cp.mainTaxId 
                                                                                                        ? (newApplied.find((at: any) => at.chargeAndTaxId === cp.mainTaxId)?.amount || 0)
                                                                                                        : (cp.price * cp.quantity);
                                                                                                    const initialAmount = tax.valueType === 'PERCENTAGE' ? (baseForCalc * tax.value / 100) : tax.value * cp.quantity;
                                                                                                    newApplied.push({ chargeAndTaxId: tax.id, amount: initialAmount });
                                                                                                } else {
                                                                                                    newApplied = newApplied.filter((at: any) => at.chargeAndTaxId !== tax.id);
                                                                                                }
                                                                                                newProds[idx] = { ...cp, appliedTaxes: newApplied };
                                                                                                setFormData({ ...formData, products: newProds });
                                                                                            }}
                                                                                        />
                                                                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                                                                        <div className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 truncate uppercase mt-0.5">{tax.name}</div>
                                                                                        {checked && (
                                                                                            <div className="relative w-24">
                                                                                                <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-400" />
                                                                                                <input 
                                                                                                    type="number"
                                                                                                    className="w-full h-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg pl-5 pr-2 text-[11px] font-black text-zinc-700 dark:text-zinc-200 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 shadow-inner"
                                                                                                    value={appliedTax.amount || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = parseFloat(e.target.value) || 0;
                                                                                                        const newProds = [...formData.products];
                                                                                                        let newApplied = cp.appliedTaxes.map((at: any) => 
                                                                                                            at.chargeAndTaxId === tax.id ? { ...at, amount: val } : at
                                                                                                        );

                                                                                                        if (cp.mainTaxId === tax.id) {
                                                                                                            newApplied = newApplied.map((at: any) => {
                                                                                                                if (at.chargeAndTaxId === tax.id) return at;
                                                                                                                const originalTax = taxes.find(t => t.id === at.chargeAndTaxId);
                                                                                                                if (originalTax?.valueType === 'PERCENTAGE') {
                                                                                                                    return { ...at, amount: (originalTax.value / 100) * val };
                                                                                                                }
                                                                                                                return at;
                                                                                                            });
                                                                                                        }

                                                                                                        let newPrice = cp.price;
                                                                                                        if (cp.mainTaxId === tax.id) {
                                                                                                            newPrice = val / (cp.quantity || 1);
                                                                                                        }
                                                                                                        newProds[idx] = { ...cp, price: newPrice, appliedTaxes: newApplied };
                                                                                                        setFormData({ ...formData, products: newProds });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : activeTab === 'variables' ? (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. TKT-VUELO" />
                                            <Input label="Nombre de Variable" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Número de Tiquete / Reserva" />
                                        </>
                                    ) : activeTab === 'parametros' ? (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. EMPRESA_NIT" />
                                            <Input label="Nombre descriptivo" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. NIT de la Empresa" />
                                            <Input label="Valor" value={formData.value || ''} onChange={(v: string) => setFormData({ ...formData, value: v })} required placeholder="Ej. 900.000.000-1" />
                                        </>
                                    ) : activeTab === 'equivalencias' ? (
                                        <>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Interface</label>
                                                <SearchSelect 
                                                    options={interfacesList} 
                                                    value={formData.id_interfaces} 
                                                    onChange={(val) => setFormData({ ...formData, id_interfaces: val })}
                                                    labelKey="name"
                                                    placeholder="Seleccionar Interface"
                                                />
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Maestro</label>
                                                <SearchSelect 
                                                    options={masterList} 
                                                    value={formData.id_master} 
                                                    onChange={(val) => {
                                                        setFormData({ ...formData, id_master: val, cd_maestro: '' })
                                                    }}
                                                    labelKey="name"
                                                    placeholder="Seleccionar Maestro"
                                                />
                                            </div>
                                            {(() => {
                                                const selectedMaster = formData.id_master ? masterList.find((m: any) => m.id == formData.id_master) : null;
                                                return (
                                                    <div className="space-y-2 group">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Código Maestro {selectedMaster ? `(${selectedMaster.name})` : ''}</label>
                                                        {selectedMaster && dynamicMasterOptions.length > 0 ? (
                                                            <>
                                                                <SearchSelect 
                                                                    options={dynamicMasterOptions} 
                                                                    value={formData.cd_maestro} 
                                                                    onChange={(val) => {
                                                                        const selectedItem = dynamicMasterOptions.find(o => String(o.id) === String(val) || String(o.code) === String(val) || String(o.document) === String(val));
                                                                        setFormData({ ...formData, cd_maestro: selectedItem?.code || selectedItem?.document || selectedItem?.id?.toString() || '' })
                                                                    }}
                                                                    labelKey="name"
                                                                    secondaryKey={selectedMaster.code === 'Client' ? 'document' : 'code'}
                                                                    placeholder={`Seleccionar registro en ${selectedMaster.name}`}
                                                                />
                                                                {formData.cd_maestro && (
                                                                    <div className="text-[10px] text-blue-600 font-black uppercase">
                                                                        Código interno seleccionado: {formData.cd_maestro}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    className={`w-full h-11 sm:h-12 rounded-xl px-3 sm:px-4 border outline-none flex items-center justify-between text-left text-xs sm:text-sm font-medium ${!selectedMaster ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 cursor-not-allowed' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500'}`}
                                                                    value={formData.cd_maestro || ''}
                                                                    onChange={(e) => setFormData({ ...formData, cd_maestro: e.target.value })}
                                                                    disabled={!selectedMaster}
                                                                    placeholder={selectedMaster ? "Escriba el código del maestro" : "Seleccione un Maestro primero..."}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            <Input label="Código Equivalente" value={formData.cd_codigo || ''} onChange={(v: string) => setFormData({ ...formData, cd_codigo: v })} required placeholder="Ej. BOG" />
                                        </>
                                    ) : activeTab === 'tarjetas-credito' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. VISA" />
                                            <Input label="Nombre de la Tarjeta" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Visa" />
                                        </>
                                    ) : activeTab === 'formas-pago' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. EF" />
                                            <Input label="Nombre de Forma de Pago" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Efectivo" />
                                        </>
                                    ) : activeTab === 'paises' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. CO" />
                                            <Input label="Nombre del País" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Colombia" />
                                        </>
                                    ) : activeTab === 'ciudades' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG" />
                                            <Input label="Nombre de la Ciudad" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Bogotá" />
                                        </>
                                    ) : activeTab === 'aeropuertos' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG" />
                                            <Input label="Nombre del Aeropuerto" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. El Dorado" />
                                        </>
                                    ) : activeTab === 'tipos-tiquetes' ? (
                                        <>
                                            <Input label="Código" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. INTERNACIONAL" />
                                            <Input label="Nombre" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Tiquete Internacional" />
                                            <Input label="Descripción" value={formData.description || ''} onChange={(v: string) => setFormData({ ...formData, description: v })} placeholder="Descripción opcional" />
                                        </>
                                    ) : activeTab === 'estados-cotizacion' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. NUEVO" />
                                            <Input label="Nombre del Estado" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Nuevo" />
                                            <Input label="Color (Opcional)" value={formData.color || ''} onChange={(v: string) => setFormData({ ...formData, color: v })} placeholder="Ej. blue, emerald, red o código hex" />
                                        </>
                                    ) : (
                                        <>
                                            <Input label="Código Único" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG-01" />
                                            <Input label="Nombre / Descripción" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Sede Norte Bogotá" />
                                            {activeTab === 'sucursales' && (
                                                <>
                                                    <div className="space-y-2 mt-4">
                                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Logo de Sucursal (Opcional)</label>
                                                        <div className="flex items-center gap-4">
                                                            {formData.logo && (
                                                                <img src={formData.logo} alt="Logo preview" className="w-16 h-16 object-contain bg-white rounded-xl border border-zinc-200" />
                                                            )}
                                                            <input 
                                                                type="file" 
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setFormData({ ...formData, logo: reader.result });
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Excel Template and Configuration Section */}
                                                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                                                                Plantilla de Reporte Excel
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    id="branch-json-import-input"
                                                                    accept=".json"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const reader = new FileReader();
                                                                        reader.onload = (evt) => {
                                                                            try {
                                                                                const json = JSON.parse(evt.target?.result as string);
                                                                                if (!json.templateConfig && !json.template && !json.cellCustomizations) {
                                                                                    alert('El archivo JSON no contiene una configuración de formato válida.');
                                                                                    return;
                                                                                }

                                                                                let newConfig = { ...(formData.templateConfig || {}), ...(json.templateConfig || {}) };
                                                                                if (Array.isArray(json.cellCustomizations)) {
                                                                                    json.cellCustomizations.forEach((c: any) => {
                                                                                        if (c.code && c.value) {
                                                                                            newConfig[c.code] = c.value;
                                                                                        }
                                                                                    });
                                                                                }

                                                                                setFormData((prev: any) => ({
                                                                                    ...prev,
                                                                                    template: json.template || prev.template,
                                                                                    hasTemplate: !!(json.template || prev.hasTemplate),
                                                                                    templateConfig: newConfig,
                                                                                    clearTemplate: false,
                                                                                }));

                                                                                alert(`✅ Configuración importada correctamente desde "${file.name}".\n\nHaga clic en "Confirmar Registro" o "Guardar" para aplicar los cambios en la sucursal.`);
                                                                            } catch (err: any) {
                                                                                alert('Error al leer el archivo JSON: ' + err.message);
                                                                            }
                                                                        };
                                                                        reader.readAsText(file);
                                                                        e.target.value = '';
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => document.getElementById('branch-json-import-input')?.click()}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 shrink-0"
                                                                    title="Importar plantilla y mapeo de celdas desde un archivo JSON exportado"
                                                                >
                                                                    <Upload className="w-3.5 h-3.5" />
                                                                    <span>Importar JSON</span>
                                                                </button>
                                                                {formData.id && formData.hasTemplate && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={async () => {
                                                                            try {
                                                                                const res = await fetch(`/api/config/branches/${formData.id}?export=true`);
                                                                                if (!res.ok) throw new Error('Error exportando');
                                                                                const blob = await res.blob();
                                                                                const url = URL.createObjectURL(blob);
                                                                                const a = document.createElement('a');
                                                                                const safe = (formData.name || 'sucursal').replace(/[^a-zA-Z0-9_-]/g, '_');
                                                                                a.href = url;
                                                                                a.download = `formato_${safe}.json`;
                                                                                a.click();
                                                                                URL.revokeObjectURL(url);
                                                                            } catch (err: any) {
                                                                                alert('Error al exportar: ' + err.message);
                                                                            }
                                                                        }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all border border-blue-100 shrink-0"
                                                                        title="Exportar configuración como JSON para importar en Formatos de Cotización u otra sucursal"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                        <span>Exportar Configuración</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">
                                                                Archivo de Plantilla (.xlsx, .xls)
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <input 
                                                                     type="file" 
                                                                     id="branch-template-file-input"
                                                                     accept=".xlsx,.xls"
                                                                     onChange={(e) => {
                                                                         const file = e.target.files?.[0];
                                                                         if (file) {
                                                                             const reader = new FileReader();
                                                                             reader.onloadend = () => {
                                                                                 setFormData({ ...formData, template: reader.result, clearTemplate: false });
                                                                             };
                                                                             reader.readAsDataURL(file);
                                                                         }
                                                                     }}
                                                                     className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                                 />
                                                                 {formData.hasTemplate && !formData.template && !formData.clearTemplate && (
                                                                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md shrink-0">
                                                                         ✓ Guardada
                                                                     </span>
                                                                 )}
                                                                 {formData.template && (
                                                                     <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md shrink-0">
                                                                         ✓ Nueva
                                                                     </span>
                                                                 )}
                                                                 {((formData.hasTemplate && !formData.clearTemplate) || formData.template) && (
                                                                     <button
                                                                         type="button"
                                                                         onClick={() => {
                                                                             setFormData({ ...formData, template: null, hasTemplate: false, clearTemplate: true });
                                                                             const fileInput = document.getElementById('branch-template-file-input') as HTMLInputElement;
                                                                             if (fileInput) fileInput.value = '';
                                                                         }}
                                                                         className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold transition-all border border-red-100 shrink-0"
                                                                         title="Eliminar plantilla actual de la base de datos"
                                                                     >
                                                                         <Trash2 className="w-3.5 h-3.5" />
                                                                         <span>Eliminar</span>
                                                                     </button>
                                                                 )}
                                                            </div>
                                                        </div>

                                                        {/* ── Copiar formato desde otra sucursal ── */}
                                                        {formData.id && (
                                                            <div className="border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Copy className="w-4 h-4 text-blue-500" />
                                                                    <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">Copiar formato desde otra sucursal</span>
                                                                </div>
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                    Copia la plantilla Excel y la configuración de celdas de otra sucursal hacia <b>{formData.name}</b>. Esto reemplazará el formato actual de esta sucursal.
                                                                </p>
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <select
                                                                        value={copyTemplateSrcId}
                                                                        onChange={e => setCopyTemplateSrcId(e.target.value)}
                                                                        className="flex-1 min-w-[180px] h-10 px-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    >
                                                                        <option value="">— Seleccionar sucursal origen —</option>
                                                                        {branches
                                                                            .filter((b: any) => b.id !== formData.id && b.hasTemplate)
                                                                            .map((b: any) => (
                                                                                <option key={b.id} value={b.id}>[{b.code}] {b.name}</option>
                                                                            ))
                                                                        }
                                                                    </select>
                                                                    <button
                                                                        type="button"
                                                                        disabled={!copyTemplateSrcId || copyingTemplate}
                                                                        onClick={async () => {
                                                                            if (!copyTemplateSrcId) return
                                                                            const srcBranch = branches.find((b: any) => String(b.id) === String(copyTemplateSrcId))
                                                                            if (!confirm(`¿Copiar el formato de "${srcBranch?.name}" hacia "${formData.name}"?\n\nEsto reemplazará el formato actual de ${formData.name}.`)) return
                                                                            setCopyingTemplate(true)
                                                                            try {
                                                                                const res = await fetch('/api/config/branches/copy-template', {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({
                                                                                        sourceBranchId: parseInt(copyTemplateSrcId),
                                                                                        targetBranchId: formData.id
                                                                                    })
                                                                                })
                                                                                const result = await res.json()
                                                                                if (!res.ok) throw new Error(result.message || 'Error')
                                                                                alert('✅ ' + result.message)
                                                                                setCopyTemplateSrcId('')
                                                                                setFormData({ ...formData, hasTemplate: true })
                                                                            } catch(err: any) {
                                                                                alert('Error: ' + err.message)
                                                                            } finally {
                                                                                setCopyingTemplate(false)
                                                                            }
                                                                        }}
                                                                        className="h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0"
                                                                    >
                                                                        {copyingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                                                                        {copyingTemplate ? 'Copiando...' : 'Copiar Formato'}
                                                                    </button>
                                                                </div>
                                                                {branches.filter((b: any) => b.id !== formData.id && b.hasTemplate).length === 0 && (
                                                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ninguna otra sucursal tiene un formato de plantilla configurado.</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Coordinates Editor */}
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 block">
                                                                Coordenadas de Celdas (Ej. B4, G4)
                                                            </label>
                                                            
                                                            <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
                                                                <summary className="p-4 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center justify-between dark:text-zinc-300">
                                                                    <span>Personalizar Mapeo de Celdas</span>
                                                                    <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                                                                </summary>
                                                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                                                                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                                                        <table className="w-full text-left text-xs border-collapse">
                                                                            <thead>
                                                                                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                                                                                    <th className="py-2 px-3">Campo / Descripción</th>
                                                                                    <th className="py-2 px-3">Token / Código</th>
                                                                                    <th className="py-2 px-3 w-32">Coordenada</th>
                                                                                    <th className="py-2 px-3 w-28 text-center">Acción</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                                                {(() => {
                                                                                    const config = formData.templateConfig || {};
                                                                                    const customNames = config.__customNames || {};
                                                                                    const defaultPlaceholders: Record<string, string> = {
                                                                                        asesor: "B4", fecha: "G4", clienteNombre: "B7", clienteIdentificacion: "G7",
                                                                                        clienteDireccion: "B8", clienteTelefono: "G8", centroCosto: "B9", solicita: "G9",
                                                                                        tCambio: "G11", descripcionPlan: "B12", fechasViaje: "G12", hotelesServicios: "A13",
                                                                                        pasajeros: "B14", totalAdultos: "C15", totalNinos: "G15", logo: "A1"
                                                                                    };

                                                                                    let mappedKeys = Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                                    if (config && Array.isArray(config.__keysOrder)) {
                                                                                        const ordered = config.__keysOrder.filter((k: string) => k in config);
                                                                                        const missing = mappedKeys.filter(k => !ordered.includes(k));
                                                                                        mappedKeys = [...ordered, ...missing];
                                                                                    }
                                                                                    
                                                                                    const allFields = mappedKeys.map(key => ({
                                                                                        key,
                                                                                        label: getFieldLabel(key),
                                                                                        isCustom: key.startsWith('col_') || !!customNames[key]
                                                                                    }));

                                                                                    const DEFAULT_CONFIG = defaultPlaceholders as any;

                                                                                    return allFields.map((f, idx) => (
                                                                                        <tr key={f.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                                                                            <td className="py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                                                                                                {f.isCustom ? (
                                                                                                    <input 
                                                                                                        type="text"
                                                                                                        value={f.label}
                                                                                                        onChange={(e) => {
                                                                                                            const newNames = { ...customNames, [f.key]: e.target.value };
                                                                                                            const newConfig = { ...config, __customNames: newNames };
                                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                                        }}
                                                                                                        className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                                                        placeholder="Nombre del campo"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span>{f.label}</span>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="py-2 px-3 font-mono text-[10px] text-zinc-400">
                                                                                                {f.isCustom ? (
                                                                                                    <input 
                                                                                                        type="text"
                                                                                                        value={f.key}
                                                                                                        onChange={(e) => {
                                                                                                            const newKey = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                                                                                            if (!newKey || newKey === '__customNames') return;
                                                                                                            
                                                                                                            const newNames = { ...customNames };
                                                                                                            const newConfig = { ...config };
                                                                                                            
                                                                                                            const val = newConfig[f.key];
                                                                                                            delete newConfig[f.key];
                                                                                                            newConfig[newKey] = val || '';
                                                                                                            
                                                                                                            const label = newNames[f.key];
                                                                                                            delete newNames[f.key];
                                                                                                            newNames[newKey] = label || f.label;
                                                                                                            
                                                                                                            newConfig.__customNames = newNames;
                                                                                                            
                                                                                                            // Actualizar la clave en __keysOrder
                                                                                                            if (Array.isArray(config.__keysOrder)) {
                                                                                                                newConfig.__keysOrder = config.__keysOrder.map((k: string) => k === f.key ? newKey : k);
                                                                                                            }
                                                                                                            
                                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                                        }}
                                                                                                        className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                                                        placeholder="token"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span>{f.key}</span>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="py-2 px-3">
                                                                                                <input 
                                                                                                    type="text"
                                                                                                    value={config[f.key] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                                                                        const newConfig = { ...config, [f.key]: val };
                                                                                                        setFormData({ ...formData, templateConfig: newConfig });
                                                                                                    }}
                                                                                                    placeholder={DEFAULT_CONFIG[f.key as keyof typeof DEFAULT_CONFIG] || 'A1'}
                                                                                                    className="w-full h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white uppercase"
                                                                                                />
                                                                                            </td>
                                                                                            <td className="py-2 px-3 text-center">
                                                                                                <div className="flex items-center justify-center gap-1.5">
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        disabled={idx === 0}
                                                                                                        onClick={() => {
                                                                                                            const keys = [...mappedKeys];
                                                                                                            const temp = keys[idx];
                                                                                                            keys[idx] = keys[idx - 1];
                                                                                                            keys[idx - 1] = temp;
                                                                                                            
                                                                                                            const newConfig: any = {};
                                                                                                            keys.forEach(k => {
                                                                                                                newConfig[k] = config[k];
                                                                                                            });
                                                                                                            newConfig.__keysOrder = keys;
                                                                                                            if (config.__customNames) newConfig.__customNames = config.__customNames;
                                                                                                            if (config.__productFields) newConfig.__productFields = config.__productFields;
                                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                                        }}
                                                                                                        className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                                                                        title="Subir Posición"
                                                                                                    >
                                                                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        disabled={idx === mappedKeys.length - 1}
                                                                                                        onClick={() => {
                                                                                                            const keys = [...mappedKeys];
                                                                                                            const temp = keys[idx];
                                                                                                            keys[idx] = keys[idx + 1];
                                                                                                            keys[idx + 1] = temp;
                                                                                                            
                                                                                                            const newConfig: any = {};
                                                                                                            keys.forEach(k => {
                                                                                                                newConfig[k] = config[k];
                                                                                                            });
                                                                                                            newConfig.__keysOrder = keys;
                                                                                                            if (config.__customNames) newConfig.__customNames = config.__customNames;
                                                                                                            if (config.__productFields) newConfig.__productFields = config.__productFields;
                                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                                        }}
                                                                                                        className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                                                                        title="Bajar Posición"
                                                                                                    >
                                                                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            const newNames = { ...customNames };
                                                                                                            delete newNames[f.key];
                                                                                                            const newConfig = { ...config };
                                                                                                            delete newConfig[f.key];
                                                                                                            newConfig.__customNames = newNames;
                                                                                                            if (Array.isArray(config.__keysOrder)) {
                                                                                                                newConfig.__keysOrder = config.__keysOrder.filter((k: string) => k !== f.key);
                                                                                                            }
                                                                                                            setFormData({ ...formData, templateConfig: newConfig });
                                                                                                        }}
                                                                                                        className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                                                        title="Eliminar del Mapeo"
                                                                                                    >
                                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ));
                                                                                })()}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block">Agregar Variable de Cotización al Mapeo</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex-1">
                                                                                <select
                                                                                    id="field-selector-branch"
                                                                                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                                                                                    defaultValue=""
                                                                                >
                                                                                    <option value="" disabled>-- Seleccionar Campo de Cotización --</option>
                                                                                    {renderMappingOptions()}
                                                                                </select>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const selectEl = document.getElementById('field-selector-branch') as HTMLSelectElement;
                                                                                    if (!selectEl || !selectEl.value) return;
                                                                                    const [key, label] = selectEl.value.split('|');
                                                                                    
                                                                                    const config = formData.templateConfig || {};
                                                                                    const customNames = config.__customNames || {};
                                                                                    
                                                                                    let finalKey = key;
                                                                                    let finalLabel = label;
                                                                                    if (key === 'custom') {
                                                                                        finalKey = 'col_' + Date.now();
                                                                                        finalLabel = 'Nueva Columna';
                                                                                    }
                                                                                    
                                                                                    const newConfig = { ...config, [finalKey]: '' };
                                                                                    if (key === 'custom' || !getFieldLabel(finalKey)) {
                                                                                        newConfig.__customNames = { ...customNames, [finalKey]: finalLabel };
                                                                                    } else if (label) {
                                                                                        newConfig.__customNames = { ...customNames, [finalKey]: finalLabel };
                                                                                    }
                                                                                    
                                                                                    let currentKeys = Array.isArray(config.__keysOrder) ? [...config.__keysOrder] : Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                                    if (!currentKeys.includes(finalKey)) {
                                                                                        currentKeys.push(finalKey);
                                                                                    }
                                                                                    newConfig.__keysOrder = currentKeys;
                                                                                    
                                                                                    setFormData({ ...formData, templateConfig: newConfig });
                                                                                    selectEl.value = "";
                                                                                }}
                                                                                className="px-4 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                                                                            >
                                                                                + Agregar al Mapeo
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const config = formData.templateConfig || {};
                                                                                    const customNames = config.__customNames || {};
                                                                                    const newId = 'col_' + Date.now();
                                                                                    const newConfig = { ...config, [newId]: '' };
                                                                                    newConfig.__customNames = { ...customNames, [newId]: 'Nueva Columna' };
                                                                                    
                                                                                    let currentKeys = Array.isArray(config.__keysOrder) ? [...config.__keysOrder] : Object.keys(config).filter(k => k !== '__customNames' && k !== '__productFields' && k !== '__keysOrder');
                                                                                    if (!currentKeys.includes(newId)) {
                                                                                        currentKeys.push(newId);
                                                                                    }
                                                                                    newConfig.__keysOrder = currentKeys;
                                                                                    
                                                                                    setFormData({ ...formData, templateConfig: newConfig });
                                                                                }}
                                                                                className="px-4 h-10 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-all"
                                                                            >
                                                                                + Campo Personalizado
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                                </div>
                                <div className="p-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-6 h-6" />}
                                        Confirmar Registro
                                    </button>
                                </div>
                            </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </div>
    )
}

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-8 h-12 rounded-2xl font-bold transition-all text-sm",
                active
                    ? "bg-zinc-900 border border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 text-white shadow-lg shadow-zinc-950/20"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function Input({ label, value, onChange, ...props }: { label: string, value: string, onChange: (v: string) => void, [key: string]: any }) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1 group-focus-within:text-blue-500 transition-colors">{label}</label>
            <input
                className="w-full h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-5 border-none shadow-inner text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        </div>
    )
}
