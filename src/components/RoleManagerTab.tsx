'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Plus,
    Edit2,
    Trash2,
    Users,
    X,
    Layers,
    ListFilter,
    Sliders,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Lock
} from 'lucide-react';
import { ALL_MASTER_CODES, ACTION_PERMISSIONS, RolePermissionsMatrix, isSuperAdminRole } from '@/lib/permissions';

interface RoleData {
    id: number;
    name: string;
    description: string;
    permissions: RolePermissionsMatrix;
    userCount: number;
    isSuperAdmin?: boolean;
}

export default function RoleManagerTab() {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [userRole, setUserRole] = useState('');
    const [isRequesterSuperAdmin, setIsRequesterSuperAdmin] = useState(false);

    // Formulario de edición/creación
    const [roleName, setRoleName] = useState('');
    const [roleDesc, setRoleDesc] = useState('');
    const [activeTab, setActiveTab] = useState<'modules' | 'masters' | 'actions'>('modules');
    const [permissions, setPermissions] = useState<RolePermissionsMatrix>({
        modules: {
            quotations: true,
            invoices: true,
            executions: true,
            reports: true,
            config: true,
            manual: true
        },
        masters: ALL_MASTER_CODES.reduce((acc, m) => ({ ...acc, [m.code]: true }), {}),
        actions: ACTION_PERMISSIONS.reduce((acc, a) => ({ ...acc, [a.key]: true }), {})
    });

    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchRoles = async (roleStr: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/config/roles?userRole=${encodeURIComponent(roleStr)}`);
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (e) {
            console.error('Error cargando roles:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let currentRole = '';
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                currentRole = parsed.role || '';
            }
        } catch (e) {
            console.error('Error leyendo usuario:', e);
        }
        setUserRole(currentRole);
        const isSuper = isSuperAdminRole(currentRole);
        setIsRequesterSuperAdmin(isSuper);
        fetchRoles(currentRole);
    }, []);

    const openCreateModal = () => {
        setEditingRole(null);
        setRoleName('');
        setRoleDesc('');
        setPermissions({
            modules: {
                quotations: true,
                invoices: true,
                executions: true,
                reports: true,
                config: true,
                manual: true
            },
            masters: ALL_MASTER_CODES.reduce((acc, m) => ({ ...acc, [m.code]: true }), {}),
            actions: ACTION_PERMISSIONS.reduce((acc, a) => ({ ...acc, [a.key]: true }), {})
        });
        setStatusMsg(null);
        setModalOpen(true);
    };

    const openEditModal = (role: RoleData) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDesc(role.description || '');
        setPermissions(role.permissions);
        setStatusMsg(null);
        setModalOpen(true);
    };

    const togglePermission = (group: 'modules' | 'masters' | 'actions', key: string) => {
        setPermissions(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: !prev[group][key]
            }
        }));
    };

    const toggleAllGroup = (group: 'modules' | 'masters' | 'actions', enable: boolean) => {
        setPermissions(prev => {
            const nextGroup = { ...prev[group] };
            Object.keys(nextGroup).forEach(k => {
                nextGroup[k] = enable;
            });
            return { ...prev, [group]: nextGroup };
        });
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) {
            setStatusMsg({ type: 'error', text: 'El nombre del rol es requerido.' });
            return;
        }

        setSaving(true);
        setStatusMsg(null);

        try {
            const isEdit = Boolean(editingRole);
            const method = isEdit ? 'PUT' : 'POST';
            const body = {
                id: editingRole?.id,
                name: roleName.trim(),
                description: roleDesc.trim(),
                permissions
            };

            const res = await fetch('/api/config/roles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error guardando rol');

            setStatusMsg({ type: 'success', text: isEdit ? 'Rol actualizado con éxito' : 'Rol creado con éxito' });
            setTimeout(() => {
                setModalOpen(false);
                fetchRoles(userRole);
            }, 1000);
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async (role: RoleData) => {
        if (isSuperAdminRole(role.name)) {
            alert('El rol SUPERADMINISTRADOR es un rol protegido del sistema y no puede ser eliminado.');
            return;
        }

        if (!confirm(`¿Está seguro de eliminar el rol '${role.name}'?`)) return;

        try {
            const res = await fetch(`/api/config/roles?id=${role.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error eliminando rol');
            fetchRoles(userRole);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <span>Cargando maestro de roles y permisos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Header y Acción de Crear */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        Maestro de Roles y Control de Acceso (RBAC)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Cree roles personalizados y parametrice permisos sobre módulos, las 25 pestañas maestras y botones de acción.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>+ Crear Nuevo Rol</span>
                </button>
            </div>

            {/* Tabla de Roles Registrados */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Descripción</th>
                                <th className="p-4">Usuarios Asignados</th>
                                <th className="p-4">Permisos Habilitados</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-200">
                            {roles.map((role) => {
                                const isSuper = isSuperAdminRole(role.name);
                                const activeModulesCount = isSuper ? Object.keys(role.permissions.modules || {}).length : Object.values(role.permissions.modules || {}).filter(Boolean).length;
                                const activeMastersCount = isSuper ? Object.keys(role.permissions.masters || {}).length : Object.values(role.permissions.masters || {}).filter(Boolean).length;
                                const activeActionsCount = isSuper ? Object.keys(role.permissions.actions || {}).length : Object.values(role.permissions.actions || {}).filter(Boolean).length;

                                return (
                                    <tr key={role.id} className="hover:bg-slate-800/40 transition-all">
                                        <td className="p-4 font-bold text-white flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                                isSuper ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            }`}>
                                                {role.name}
                                            </span>
                                            {isSuper && (
                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-normal">
                                                    <Lock className="w-3 h-3 text-emerald-400" />
                                                    Acceso Total Incondicional
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 max-w-xs truncate">
                                            {isSuper ? 'Rol Maestro del Sistema con acceso total a todos los menús y permisos futuros.' : (role.description || 'Sin descripción')}
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                                {role.userCount} usuario(s)
                                            </span>
                                        </td>
                                        <td className="p-4 text-[11px] text-slate-400 space-x-2">
                                            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-emerald-400 font-mono">
                                                {isSuper ? '100% Módulos' : `${activeModulesCount} Módulos`}
                                            </span>
                                            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-blue-400 font-mono">
                                                {isSuper ? '100% Maestros' : `${activeMastersCount} Maestros`}
                                            </span>
                                            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-400 font-mono">
                                                {isSuper ? '100% Acciones y Nuevas Op.' : `${activeActionsCount} Botones/Acciones`}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(role)}
                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-all cursor-pointer"
                                                title="Editar Permisos"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRole(role)}
                                                disabled={isSuper || role.userCount > 0}
                                                className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                                                title={isSuper ? 'El rol SuperAdministrador no puede ser eliminado' : role.userCount > 0 ? 'No se puede eliminar rol con usuarios asignados' : 'Eliminar Rol'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Creación / Edición de Permisos */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    {editingRole ? `Editar Permisos del Rol: ${editingRole.name}` : 'Crear Nuevo Rol de Acceso'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Parametrice la matriz de permisos para los usuarios que posean este rol.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cuerpo Modal (Formulario + Pestañas de Permisos) */}
                        <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Campos Básicos Nombre y Descripción */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Nombre del Rol *</label>
                                    <input
                                        type="text"
                                        value={roleName}
                                        onChange={e => setRoleName(e.target.value)}
                                        disabled={editingRole ? isSuperAdminRole(editingRole.name) : false}
                                        placeholder="Ej. Asesor Comercial / Contador / Auxiliar"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Descripción Funcional</label>
                                    <input
                                        type="text"
                                        value={roleDesc}
                                        onChange={e => setRoleDesc(e.target.value)}
                                        placeholder="Breve descripción del alcance del rol..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Pestañas de Selección de Permisos */}
                            <div className="space-y-4">
                                <div className="flex border-b border-slate-800 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('modules')}
                                        className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'modules' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <Layers className="w-4 h-4" />
                                        <span>Módulos Principales</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('masters')}
                                        className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'masters' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <ListFilter className="w-4 h-4" />
                                        <span>Pestañas Maestras ({ALL_MASTER_CODES.length})</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('actions')}
                                        className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'actions' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <Sliders className="w-4 h-4" />
                                        <span>Botones y Acciones Granulares</span>
                                    </button>
                                </div>

                                {/* Botón Seleccionar / Deseleccionar Todo */}
                                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                                    <span>Marque las opciones permitidas para este rol:</span>
                                    <div className="space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleAllGroup(activeTab, true)}
                                            className="text-emerald-400 hover:underline text-[11px]"
                                        >
                                            Habilitar Todos
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleAllGroup(activeTab, false)}
                                            className="text-rose-400 hover:underline text-[11px]"
                                        >
                                            Deshabilitar Todos
                                        </button>
                                    </div>
                                </div>

                                {/* Contenido Pestaña 1: Módulos Principales */}
                                {activeTab === 'modules' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { key: 'quotations', label: 'Cotizaciones', desc: 'Acceso a creación e historial de cotizaciones' },
                                            { key: 'invoices', label: 'Facturación ERP', desc: 'Acceso a historial de facturas e importación Zeus' },
                                            { key: 'executions', label: 'Ejecución de SPs', desc: 'Acceso a consola de ejecución interactiva' },
                                            { key: 'reports', label: 'Reportes Gerenciales', desc: 'Acceso a centro de informes e indicadores' },
                                            { key: 'config', label: 'Maestros / Ajustes', desc: 'Acceso al módulo de configuración del sistema' },
                                            { key: 'manual', label: 'Manual Operativo', desc: 'Acceso al manual interactivo del sitio' }
                                        ].map(m => (
                                            <div key={m.key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-200">{m.label}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isSuperAdminRole(roleName) ? true : Boolean(permissions.modules[m.key])}
                                                    disabled={isSuperAdminRole(roleName)}
                                                    onChange={() => togglePermission('modules', m.key)}
                                                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer mt-0.5"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Contenido Pestaña 2: Pestañas Maestras del Sitio (25 Pestañas) */}
                                {activeTab === 'masters' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                        {ALL_MASTER_CODES.map(m => (
                                            <label key={m.code} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40">
                                                <span className="text-slate-300 font-medium text-[11px]">{m.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={isSuperAdminRole(roleName) ? true : Boolean(permissions.masters[m.code])}
                                                    disabled={isSuperAdminRole(roleName)}
                                                    onChange={() => togglePermission('masters', m.code)}
                                                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Contenido Pestaña 3: Acciones Granulares (Botón Enviar a Zeus, Crear, etc) */}
                                {activeTab === 'actions' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                        {ACTION_PERMISSIONS.map(act => (
                                            <div key={act.key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-blue-400">{act.group}</div>
                                                    <div className="text-xs font-semibold text-slate-200 mt-0.5">{act.label}</div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isSuperAdminRole(roleName) ? true : Boolean(permissions.actions[act.key])}
                                                    disabled={isSuperAdminRole(roleName)}
                                                    onChange={() => togglePermission('actions', act.key)}
                                                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {statusMsg && (
                                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                                    statusMsg.type === 'success' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                                }`}>
                                    {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{statusMsg.text}</span>
                                </div>
                            )}

                            {/* Footer Modal Acciones */}
                            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                                >
                                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{editingRole ? 'Guardar Cambios' : 'Crear Rol'}</span>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
