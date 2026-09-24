const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireMinRole, ADMIN_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanId, cleanString, cleanBoolean } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users  (admin only)
router.get('/', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER'), async (req, res) => {
  try {
    const { role, organizationId, isActive, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (organizationId) where.organizationId = organizationId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        select: { id: true, email: true, name: true, role: true, isActive: true, designation: true, department: true, lastLoginAt: true, createdAt: true, organization: { select: { id: true, name: true, type: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, users, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { organization: true, projectAssignments: { include: { project: { select: { id: true, name: true, code: true, status: true } } } } },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users  (admin only)
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { email, password, name, role, organizationId, designation, department, phone } = req.body;
    if (!email || !password || !name || !role) return res.status(400).json({ success: false, message: 'email, password, name, role required' });

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, name, role, organizationId, designation, department, phone },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    await logAction({ userId: req.user.id, action: 'USER_CREATED', entityType: 'User', entityId: user.id, description: `Created user ${user.email}`, req });
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/users/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.id;
    const isAdmin = ADMIN_ROLES.includes(req.user.role);
    if (!isSelf && !isAdmin) return res.status(403).json({ success: false, message: 'Cannot edit other users' });

    const { name, designation, department, phone, role, isActive, organizationId, avatarUrl, password } = req.body;
    const data = {};
    if (name) data.name = cleanString(name);
    if (designation !== undefined) data.designation = cleanString(designation);
    if (department !== undefined) data.department = cleanString(department);
    if (phone !== undefined) data.phone = cleanString(phone);
    if (avatarUrl !== undefined) data.avatarUrl = cleanString(avatarUrl);
    if (password && isSelf) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    if (isAdmin) {
      if (role) data.role = role;
      if (isActive !== undefined) data.isActive = cleanBoolean(isActive);
      if (organizationId !== undefined) data.organizationId = cleanId(organizationId);
      if (password) {
        data.passwordHash = await bcrypt.hash(password, 10);
      }
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, email: true, name: true, role: true, isActive: true, designation: true, department: true, phone: true } });
    await logAction({ userId: req.user.id, action: 'USER_UPDATED', entityType: 'User', entityId: user.id, req });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    await logAction({ userId: req.user.id, action: 'USER_DELETED', entityType: 'User', entityId: req.params.id, req });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
