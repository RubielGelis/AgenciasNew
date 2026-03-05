import prisma from '@/lib/prisma'

export async function logSystemEvent(params: {
    userId?: number;
    action: string;
    module: string;
    description: string;
    metadata?: any;
}) {
    try {
        await prisma.systemLog.create({
            data: {
                userId: params.userId || null,
                action: params.action,
                module: params.module,
                description: params.description,
                metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null
            }
        });
    } catch (error) {
        console.error('Failed to log system event:', error);
    }
}
