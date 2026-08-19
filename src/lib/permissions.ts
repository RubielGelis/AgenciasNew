export interface RolePermissionsMatrix {
    modules: Record<string, boolean>;
    masters: Record<string, boolean>;
    actions: Record<string, boolean>;
}

export const ALL_MASTER_CODES: { code: string; label: string }[] = [
    { code: 'User', label: 'Usuarios' },
    { code: 'Branch', label: 'Sucursales' },
    { code: 'Implant', label: 'Implants' },
    { code: 'Client', label: 'Clientes' },
    { code: 'Provider', label: 'Proveedores' },
    { code: 'Prestadora', label: 'Prestadoras y Hoteles' },
    { code: 'Product', label: 'Productos y Catálogo' },
    { code: 'Seller', label: 'Vendedores' },
    { code: 'TicketPrinter', label: 'Tiqueteadores' },
    { code: 'ChargeAndTax', label: 'Cargos e Impuestos' },
    { code: 'Combo', label: 'Combos y Paquetes' },
    { code: 'Currency', label: 'Monedas' },
    { code: 'CreditCard', label: 'Tarjetas de Crédito' },
    { code: 'Payment', label: 'Formas de Pago' },
    { code: 'Countries', label: 'Países' },
    { code: 'Cities', label: 'Ciudades' },
    { code: 'Airports', label: 'Aeropuertos' },
    { code: 'TicketType', label: 'Tipos de Tiquete' },
    { code: 'QuotationState', label: 'Estados de Cotización' },
    { code: 'QuotationFormat', label: 'Formatos de Cotización' },
    { code: 'Equivalences', label: 'Equivalencias' },
    { code: 'MasterVariable', label: 'Variables Adicionales' },
    { code: 'SystemParameter', label: 'Parámetros del Sistema' },
    { code: 'SystemLog', label: 'Logs del Sistema' },
    { code: 'SiteModules', label: 'Módulos del Sitio' },
    { code: 'Role', label: 'Roles y Permisos' }
];

export const ACTION_PERMISSIONS: { key: string; label: string; group: string }[] = [
    // Pre-Cotizaciones
    { key: 'prequotations.create', label: 'Crear Pre-Cotizaciones', group: 'Pre-Cotizaciones' },
    { key: 'prequotations.convert', label: 'Convertir Pre-Cotización a Cotización', group: 'Pre-Cotizaciones' },

    // Cotizaciones
    { key: 'quotations.create', label: 'Crear Nueva Cotización', group: 'Cotizaciones' },
    { key: 'quotations.edit', label: 'Editar Cotizaciones Existentes', group: 'Cotizaciones' },
    { key: 'quotations.duplicate', label: 'Duplicar Cotización', group: 'Cotizaciones' },
    { key: 'quotations.print', label: 'Imprimir PDF / Excel', group: 'Cotizaciones' },
    { key: 'quotations.sendToZeus', label: 'Facturar / Enviar a Zeus ERP', group: 'Cotizaciones' },
    { key: 'quotations.delete', label: 'Eliminar Cotización', group: 'Cotizaciones' },

    // Facturación
    { key: 'invoices.create', label: 'Emitir Facturas', group: 'Facturación ERP' },
    { key: 'invoices.importExcel', label: 'Importar Excel / GDS Masivo', group: 'Facturación ERP' },
    { key: 'invoices.exportZeus', label: 'Exportar Plano Zeus ERP', group: 'Facturación ERP' },

    // Ejecuciones
    { key: 'executions.run', label: 'Ejecutar SPs y Consultas', group: 'Ejecución de SPs' },
    { key: 'executions.savePreset', label: 'Guardar Presets de Prueba', group: 'Ejecución de SPs' },

    // Reportes
    { key: 'reports.view', label: 'Consultar Reportes Gerenciales', group: 'Reportes' },
    { key: 'reports.exportExcel', label: 'Exportar Excel Corporativo', group: 'Reportes' },
    { key: 'reports.editTemplates', label: 'Editar Diseños de Plantilla', group: 'Reportes' }
];

export const DEFAULT_PERMISSIONS: RolePermissionsMatrix = {
    modules: {
        prequotations: true,
        quotations: true,
        invoices: true,
        executions: true,
        reports: true,
        config: true,
        manual: true
    },
    masters: ALL_MASTER_CODES.reduce((acc, m) => ({ ...acc, [m.code]: true }), {}),
    actions: ACTION_PERMISSIONS.reduce((acc, a) => ({ ...acc, [a.key]: true }), {})
};

/**
 * Retorna true si el nombre del rol corresponde a SUPERADMINISTRADOR.
 */
export function isSuperAdminRole(roleName?: string): boolean {
    if (!roleName) return false;
    return roleName.toUpperCase().includes('SUPERADMIN');
}

/**
 * Normaliza y fusiona la matriz de permisos enviada con el catálogo predeterminado.
 * Si se crea una nueva opción o botón en el sistema, se detectará e incluirá automáticamente.
 */
export function normalizeRolePermissions(rawPermissions?: any, roleName?: string): RolePermissionsMatrix {
    // Si es SuperAdministrador, SIEMPRE tiene 100% de permisos activos por defecto
    if (isSuperAdminRole(roleName)) {
        return DEFAULT_PERMISSIONS;
    }

    if (!rawPermissions || typeof rawPermissions !== 'object') {
        return DEFAULT_PERMISSIONS;
    }

    const modules = { ...DEFAULT_PERMISSIONS.modules, ...(rawPermissions.modules || {}) };
    const masters = { ...DEFAULT_PERMISSIONS.masters, ...(rawPermissions.masters || {}) };
    const actions = { ...DEFAULT_PERMISSIONS.actions, ...(rawPermissions.actions || {}) };

    return { modules, masters, actions };
}

/**
 * Verifica si un rol tiene autorización para un módulo, maestro o acción.
 * El rol SUPERADMINISTRADOR SIEMPRE retorna true incondicionalmente.
 */
export function hasPermission(
    permissions: RolePermissionsMatrix | any,
    type: 'module' | 'master' | 'action',
    key: string,
    roleName?: string
): boolean {
    if (isSuperAdminRole(roleName)) {
        return true;
    }
    const norm = normalizeRolePermissions(permissions, roleName);
    if (type === 'module') return norm.modules[key] ?? true;
    if (type === 'master') return norm.masters[key] ?? true;
    if (type === 'action') return norm.actions[key] ?? true;
    return true;
}
