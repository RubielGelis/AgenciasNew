import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Rutas públicas que NUNCA se bloquean
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/licencia-expirada') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/config/license') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 1. Verificación de Expiración de Licencia mediante Cookie o Parámetro de Encabezado
    const licExpCookie = req.cookies.get('korex_lic_exp')?.value;

    if (licExpCookie) {
        const expDate = new Date(`${licExpCookie}T23:59:59.999Z`);
        const now = new Date();

        if (now > expDate) {
            if (pathname.startsWith('/api')) {
                return NextResponse.json(
                    { message: 'La licencia del sistema ha expirado. Por favor ingrese una nueva clave de renovación.' },
                    { status: 402 } // Payment Required
                );
            }
            return NextResponse.redirect(new URL('/licencia-expirada', req.url));
        }
    }

    // 2. Verificación de Token de Autenticación de Usuario (Si se requiere)
    const authToken = req.cookies.get('auth_token')?.value;
    
    // Si la ruta es del Dashboard y no hay token de autenticación (cuando esté activado auth estricto)
    // Para no interrumpir flujos de desarrollo locales sin login forzado, permitimos navegación si auth_token no es obligatorio en dev
    if (!authToken && process.env.REQUIRE_AUTH === 'true') {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
};
