import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const result = await prisma.$queryRawUnsafe(`SELECT * FROM public."fnMasterList"()`)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
