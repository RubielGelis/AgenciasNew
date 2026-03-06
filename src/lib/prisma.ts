import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as { prisma_v12: PrismaClient | undefined }

const prisma = globalForPrisma.prisma_v12 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v12 = prisma
