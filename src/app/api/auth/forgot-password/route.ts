import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ message: 'Email es requerido' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Devuelve el mismo mensaje por seguridad para no revelar si el correo existe
            return NextResponse.json({ message: 'Si el correo está registrado, se ha enviado un enlace de recuperación' })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600000) // 1 hora

        // Usamos executeRaw para saltar la validación del esquema que a veces se queda cacheada
        await prisma.$executeRaw`
            UPDATE "User" 
            SET "resetPasswordToken" = ${token}, 
                "resetPasswordExpires" = ${expires} 
            WHERE "id" = ${user.id}
        `

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login/reset-password?token=${token}`

        // Configuración de Gmail SMTP (Segura con puerto 465)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // TLS/SSL
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        })

        // El preset 'Hotmail' ya incluye el host y puerto correctos para Outlook/MSN

        const mailOptions = {
            from: `"Soporte Agencias New" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Recuperación de Contraseña - Agencias New',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb; text-align: center;">Agencias New</h2>
                    <p>Hola,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablecer Contraseña</a>
                    </div>
                    <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                </div>
            `,
        }

        await transporter.sendMail(mailOptions)

        return NextResponse.json({ message: 'Si el correo está registrado, se ha enviado un enlace de recuperación' })
    } catch (error: any) {
        console.error('Forgot password error:', error)
        const fs = require('fs')
        fs.appendFileSync('debug_api_err.txt', `${new Date().toISOString()} - Forgot Password Error: ${error.message}\n${error.stack}\n\n`)
        return NextResponse.json({ message: 'Error interno del servidor', detail: error.message }, { status: 500 })
    }
}
