
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Prisma DMMF models:')
    console.log(Object.keys(prisma._baseDmmf.modelNames))
    const comboProductModel = prisma._baseDmmf.datamodel.models.find(m => m.name === 'ComboProduct')
    console.log('ComboProduct fields:')
    console.log(comboProductModel.fields.map(f => f.name))
}

main().catch(console.error)
