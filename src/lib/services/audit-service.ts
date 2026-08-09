import { prisma } from '@/lib/prisma';

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('AuditLog creation error:', error);
  }
}
