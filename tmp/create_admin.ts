import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' }
    })

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
    console.log('User admin@agencia.com created/updated')
}

main().catch(console.error).finally(() => prisma.$disconnect())
