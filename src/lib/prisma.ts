import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    console.log('--- Instantiating NEW PrismaClient (v15) ---')
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    const prisma = new PrismaClient({
        adapter,
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' }
        ]
    })
 
    // Escuchar eventos de consultas e imprimirlos en la consola
    ;(prisma as any).$on('query', (e: any) => {
        console.log(`[PRISMA_SQL] Consulta: ${e.query} | Params: ${e.params} | Duración: ${e.duration}ms`);
    })
    
    // Debug: check if fields exists
    try {
        const dmmf = (prisma as any)._baseDmmf || (prisma as any)._dmmf
        if (dmmf) {
            const model = dmmf.datamodel.models.find((m: any) => m.name === 'ComboProduct')
            console.log('--- ComboProduct Fields in PrismaClient ---', model?.fields.map((f: any) => f.name))
        }
    } catch (e) {}

    return prisma
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as { prisma_prestadora_v1: PrismaClient | undefined }

const prisma = globalForPrisma.prisma_prestadora_v1 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_prestadora_v1 = prisma
