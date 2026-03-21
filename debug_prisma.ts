import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
console.log('Combo model:', !!prisma.combo)
console.log('ComboProduct model:', !!prisma.comboProduct)
process.exit(0)
