import prisma from '@/lib/prisma';

/**
 * Registra un evento de auditoría en el sistema usando el Stored Procedure spLogRegistrar.
 */
export async function registerLog(
    userId: number | null,
    module: string,
    action: string,
    description: string,
    metadata: any = null
) {
    try {
        console.log(`[AuditLog_DEBUG] Intentando registrar: ${module} - ${action}: ${description}`);
        
        const logEntry = await prisma.systemLog.create({
            data: {
                userId: userId && userId !== 0 ? Number(userId) : null,
                module: module.toUpperCase(),
                action: action.toUpperCase(),
                description,
                metadata: metadata || null
            }
        });

        console.log(`[AuditLog_SUCCESS] Evento registrado ID: ${logEntry.id}`);
        return logEntry;
    } catch (error: any) {
        console.error('[AuditLog_ERROR] Fallo al crear log en Prisma:', error.message);
        if (error.code) console.error('  Code:', error.code);
    }
}

/**
 * Función compatibilidad para soportar compilación Next.js limpia sin refactorizar.
 */
export async function logSystemEvent(params: {
    userId: number | null | undefined,
    action: string,
    module: string,
    description: string,
    metadata?: any
}) {
    return registerLog(params.userId || null, params.module, params.action, params.description, params.metadata);
}
