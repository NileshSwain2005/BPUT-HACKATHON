const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async ({ userId, action, entityType, entityId, description, metadata, req }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        metadata,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { logAction };
