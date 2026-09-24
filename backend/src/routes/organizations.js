const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, MANAGER_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanId, cleanString, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/organizations
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, parentId, search } = req.query;
    const where = {};
    if (type) where.type = type;
    if (parentId) where.parentId = parentId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orgs = await prisma.organization.findMany({
      where,
      include: { parent: { select: { id: true, name: true } }, _count: { select: { children: true, projects: true, users: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, organizations: orgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/organizations/tree  — full hierarchy
router.get('/tree', authenticate, async (req, res) => {
  try {
    const roots = await prisma.organization.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: { include: { children: true } },
          },
        },
      },
    });
    res.json({ success: true, tree: roots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/organizations/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        projects: { select: { id: true, name: true, code: true, status: true } },
        users: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, organization: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/organizations
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { name, type, parentId, cin, pan, website, address, city, state, email, phone, description } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: 'name and type required' });
    const org = await prisma.organization.create({
      data: {
        name: cleanString(name),
        type,
        parentId: cleanId(parentId),
        cin: cleanString(cin),
        pan: cleanString(pan),
        website: cleanString(website),
        address: cleanString(address),
        city: cleanString(city),
        state: cleanString(state),
        email: cleanString(email),
        phone: cleanString(phone),
        description: cleanString(description),
      },
    });
    await logAction({ userId: req.user.id, action: 'ORG_CREATED', entityType: 'Organization', entityId: org.id, description: `Created org ${name}`, req });
    res.status(201).json({ success: true, organization: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/organizations/:id
router.patch('/:id', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER'), async (req, res) => {
  try {
    const existing = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Organization not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};
    if (cleaned.name !== undefined) data.name = cleanString(cleaned.name);
    if (cleaned.type !== undefined) data.type = cleaned.type;
    if (cleaned.parentId !== undefined) data.parentId = cleanId(cleaned.parentId);
    if (cleaned.cin !== undefined) data.cin = cleanString(cleaned.cin);
    if (cleaned.pan !== undefined) data.pan = cleanString(cleaned.pan);
    if (cleaned.website !== undefined) data.website = cleanString(cleaned.website);
    if (cleaned.address !== undefined) data.address = cleanString(cleaned.address);
    if (cleaned.city !== undefined) data.city = cleanString(cleaned.city);
    if (cleaned.state !== undefined) data.state = cleanString(cleaned.state);
    if (cleaned.email !== undefined) data.email = cleanString(cleaned.email);
    if (cleaned.phone !== undefined) data.phone = cleanString(cleaned.phone);
    if (cleaned.description !== undefined) data.description = cleanString(cleaned.description);

    const org = await prisma.organization.update({ where: { id: req.params.id }, data });
    await logAction({ userId: req.user.id, action: 'ORG_UPDATED', entityType: 'Organization', entityId: org.id, req });
    res.json({ success: true, organization: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
