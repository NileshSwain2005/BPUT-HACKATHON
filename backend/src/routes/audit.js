const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, MANAGER_ROLES } = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { userId, action, entityType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip: (+page - 1) * +limit, take: +limit,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ success: true, logs, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
