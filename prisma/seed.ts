import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // Roles
    const roles = ['ADMIN', 'VENDEDOR', 'OPERADOR']
    console.log('Seed: Upserting roles...')
    for (const name of roles) {
        await prisma.role.upsert({ where: { name }, update: {}, create: { name } })
    }

    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
    if (!adminRole) return

    // Admin User
    const hashedAdminPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@agencia.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@agencia.com',
            passwordHash: hashedAdminPassword,
            roleId: adminRole.id
        }
    })

    // Sample Clients
    console.log('Seed: Creating sample clients...')
    await prisma.client.upsert({
        where: { document: '12345678' },
        update: {},
        create: { name: 'Juan Pérez', document: '12345678', address: 'Calle 123' }
    })
    await prisma.client.upsert({
        where: { document: '87654321' },
        update: {},
        create: { name: 'María García', document: '87654321', address: 'Carrera 45' }
    })

    // Sample Providers & Hotels
    console.log('Seed: Creating sample providers & hotels...')
    const prov1 = await prisma.provider.upsert({
        where: { id: 1 },
        update: {},
        create: { code: 'GHL', name: 'GHL Hoteles', contactInfo: 'ghl@example.com' }
    })
    await prisma.prestadora.upsert({
        where: { id: 1 },
        update: {},
        create: { code: 'GHL-BOG', name: 'GHL Style Bogotá', providerId: prov1.id, location: 'Bogotá', type: 'HOTEL' }
    })

    const prov2 = await prisma.provider.upsert({
        where: { id: 2 },
        update: {},
        create: { code: 'DEC', name: 'Decameron', contactInfo: 'decameron@example.com' }
    })
    await prisma.prestadora.upsert({
        where: { id: 2 },
        update: {},
        create: { code: 'DEC-BARU', name: 'Decameron Barú', providerId: prov2.id, location: 'Cartagena', type: 'HOTEL' }
    })

    // Sample Branches & Implants
    console.log('Seed: Creating branches & implants...')
    await prisma.branch.upsert({ where: { code: 'BOG01' }, update: {}, create: { code: 'BOG01', name: 'Sede Norte Bogotá' } })
    await prisma.implant.upsert({ where: { code: 'IMP01' }, update: {}, create: { code: 'IMP01', name: 'Implant Principal' } })

    // Sample Products
    console.log('Seed: Creating sample products...')
    await prisma.product.upsert({
        where: { id: 1 },
        update: {},
        create: { code: 'AL-DES', type: 'ALIMENTACION', description: 'Desayuno Buffet', basePrice: 15.0 }
    })
    await prisma.product.upsert({
        where: { id: 2 },
        update: {},
        create: { code: 'TR-AERO', type: 'TRANSPORTE', description: 'Traslado Aeropuerto-Hotel', basePrice: 25.0 }
    })
    await prisma.product.upsert({
        where: { id: 3 },
        update: {},
        create: { code: 'OT-SEG', type: 'OTROS', description: 'Seguro de Viaje', basePrice: 10.0 }
    })

    console.log('Seed: Success!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
