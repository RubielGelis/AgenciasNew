import crypto from 'crypto';
import prisma from '@/lib/prisma';

const SECRET_KEY = process.env.LICENSE_SECRET || process.env.NEXTAUTH_SECRET || 'Korex_Master_License_Secret_Key_2026_Secure';

export interface LicensePayload {
    client: string;
    nit: string;
    expirationDate: string; // YYYY-MM-DD
    issuedDate: string;
}

export interface LicenseVerificationResult {
    isValid: boolean;
    payload?: LicensePayload;
    error?: string;
}

export interface LicenseStatus {
    isLicensed: boolean;
    isExpired: boolean;
    expirationDate: string | null;
    daysRemaining: number | null;
    clientName: string | null;
    nit: string | null;
    status: 'ACTIVE' | 'WARNING' | 'EXPIRED' | 'UNLICENSED';
}

/**
 * Valida un token de licencia HMAC SHA256
 */
export function verifyLicenseKey(licenseKey: string): LicenseVerificationResult {
    if (!licenseKey || typeof licenseKey !== 'string') {
        return { isValid: false, error: 'Clave de licencia vacía o con formato inválido' };
    }

    const parts = licenseKey.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'KOR1') {
        return { isValid: false, error: 'Formato de clave de licencia desconocido' };
    }

    const [, payloadBase64, signature] = parts;

    try {
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(payloadBase64)
            .digest('hex');

        // Comparación segura
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return { isValid: false, error: 'La firma de la clave de licencia es inválida o fue alterada' };
        }

        const decodedJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
        const rawPayload = JSON.parse(decodedJson);

        if (!rawPayload.c || !rawPayload.n || !rawPayload.e) {
            return { isValid: false, error: 'Contenido de la clave incompleto' };
        }

        return {
            isValid: true,
            payload: {
                client: rawPayload.c,
                nit: rawPayload.n,
                expirationDate: rawPayload.e,
                issuedDate: rawPayload.i || ''
            }
        };
    } catch (err: any) {
        return { isValid: false, error: 'Error al decodificar la licencia: ' + err.message };
    }
}

/**
 * Obtiene el estado actual de la licencia guardada en la Base de Datos
 */
export async function getStoredLicenseStatus(): Promise<LicenseStatus> {
    try {
        const paramKey = await prisma.systemParameter.findUnique({
            where: { code: 'LICENSE_KEY' }
        });

        if (!paramKey || !paramKey.value) {
            return {
                isLicensed: false,
                isExpired: true,
                expirationDate: null,
                daysRemaining: null,
                clientName: null,
                nit: null,
                status: 'UNLICENSED'
            };
        }

        const verification = verifyLicenseKey(paramKey.value);
        if (!verification.isValid || !verification.payload) {
            return {
                isLicensed: false,
                isExpired: true,
                expirationDate: null,
                daysRemaining: null,
                clientName: null,
                nit: null,
                status: 'UNLICENSED'
            };
        }

        const { client, nit, expirationDate } = verification.payload;
        const targetExpDate = new Date(`${expirationDate}T23:59:59.999Z`);
        const now = new Date();

        const diffTime = targetExpDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining < 0;

        let status: 'ACTIVE' | 'WARNING' | 'EXPIRED' | 'UNLICENSED' = 'ACTIVE';
        if (isExpired) {
            status = 'EXPIRED';
        } else if (daysRemaining <= 15) {
            status = 'WARNING';
        }

        return {
            isLicensed: true,
            isExpired,
            expirationDate,
            daysRemaining,
            clientName: client,
            nit,
            status
        };
    } catch (error) {
        console.error('Error al consultar estado de licencia:', error);
        return {
            isLicensed: false,
            isExpired: false, // Evitar bloqueo completo ante falla temporal de BD si no es intencional
            expirationDate: null,
            daysRemaining: null,
            clientName: null,
            nit: null,
            status: 'UNLICENSED'
        };
    }
}

/**
 * Registra o actualiza la clave de licencia en la Base de Datos
 */
export async function applyLicenseKey(licenseKey: string, actingUserId: number = 1) {
    const verification = verifyLicenseKey(licenseKey);
    if (!verification.isValid || !verification.payload) {
        throw new Error(verification.error || 'Clave de licencia inválida');
    }

    const { client, nit, expirationDate } = verification.payload;

    // Actualizar en SystemParameter usando Prisma upsert
    await prisma.systemParameter.upsert({
        where: { code: 'LICENSE_KEY' },
        update: { value: licenseKey.trim(), name: 'Clave de Licencia del Sistema' },
        create: { code: 'LICENSE_KEY', name: 'Clave de Licencia del Sistema', value: licenseKey.trim() }
    });

    await prisma.systemParameter.upsert({
        where: { code: 'LICENSE_EXPIRATION_DATE' },
        update: { value: expirationDate, name: 'Fecha de Expiración de Licencia' },
        create: { code: 'LICENSE_EXPIRATION_DATE', name: 'Fecha de Expiración de Licencia', value: expirationDate }
    });

    // Registrar en SystemLog
    try {
        const { logSystemEvent } = await import('@/lib/logger');
        await logSystemEvent({
            userId: actingUserId,
            action: 'UPDATE',
            module: 'LICENSE',
            description: `Licencia actualizada para ${client} (NIT ${nit}) activa hasta ${expirationDate}.`,
            metadata: { client, nit, expirationDate }
        });
    } catch (e) {
        console.error('Error al registrar log de licencia:', e);
    }

    return verification.payload;
}
