const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, MANAGER_ROLES, CONTRIBUTOR_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanFloat, cleanDate, cleanId, cleanString, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { organizationId, status, sector, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    if (sector) where.sector = { contains: sector, mode: 'insensitive' };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }];

    // Non-admin users only see their assigned projects or org projects
    const restrictedRoles = ['PROJECT_MANAGER', 'DATA_CONTRIBUTOR', 'ESG_REVIEWER'];
    if (restrictedRoles.includes(req.user.role)) {
      const assignments = await prisma.projectUser.findMany({ where: { userId: req.user.id }, select: { projectId: true } });
      where.id = { in: assignments.map(a => a.projectId) };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where, skip: (+page - 1) * +limit, take: +limit,
        include: {
          organization: { select: { id: true, name: true, type: true } },
          _count: { select: { documents: true, evidence: true, esgMetricValues: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({ success: true, projects, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        organization: true,
        users: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        sdgMappings: true,
        _count: { select: { documents: true, evidence: true, esgMetricValues: true, brsrResponses: true } },
      },
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects
router.post('/', authenticate, requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { name, code, description, location, state, sector, subsector, startDate, endDate, budget, organizationId } = req.body;
    if (!name || !organizationId) return res.status(400).json({ success: false, message: 'name and organizationId required' });
    const project = await prisma.project.create({
      data: {
        name: cleanString(name),
        code: cleanString(code),
        description: cleanString(description),
        location: cleanString(location),
        state: cleanString(state),
        sector: cleanString(sector),
        subsector: cleanString(subsector),
        startDate: cleanDate(startDate),
        endDate: cleanDate(endDate),
        budget: cleanFloat(budget),
        organizationId: cleanId(organizationId),
      },
    });
    await logAction({ userId: req.user.id, action: 'PROJECT_CREATED', entityType: 'Project', entityId: project.id, description: `Created project ${name}`, req });
    res.status(201).json({ success: true, project });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Project code already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', authenticate, requireRole(...MANAGER_ROLES, 'PROJECT_MANAGER'), async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};

    if (cleaned.name !== undefined) data.name = cleanString(cleaned.name);
    if (cleaned.description !== undefined) data.description = cleanString(cleaned.description);
    if (cleaned.location !== undefined) data.location = cleanString(cleaned.location);
    if (cleaned.state !== undefined) data.state = cleanString(cleaned.state);
    if (cleaned.sector !== undefined) data.sector = cleanString(cleaned.sector);
    if (cleaned.subsector !== undefined) data.subsector = cleanString(cleaned.subsector);
    if (cleaned.status !== undefined) data.status = cleaned.status;
    if (cleaned.startDate !== undefined) data.startDate = cleanDate(cleaned.startDate);
    if (cleaned.endDate !== undefined) data.endDate = cleanDate(cleaned.endDate);
    if (cleaned.budget !== undefined) data.budget = cleanFloat(cleaned.budget);
    if (cleaned.organizationId !== undefined) data.organizationId = cleanId(cleaned.organizationId);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });
    await logAction({ userId: req.user.id, action: 'PROJECT_UPDATED', entityType: 'Project', entityId: project.id, req });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/assign-user
router.post('/:id/assign-user', authenticate, requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { userId } = req.body;
    const assignment = await prisma.projectUser.upsert({
      where: { projectId_userId: { projectId: req.params.id, userId } },
      update: {},
      create: { projectId: req.params.id, userId },
    });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id/assign-user/:userId
router.delete('/:id/assign-user/:userId', authenticate, requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    await prisma.projectUser.deleteMany({ where: { projectId: req.params.id, userId: req.params.userId } });
    res.json({ success: true, message: 'User removed from project' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id/stats
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const [metricCount, verifiedMetrics, evidenceCount, verifiedEvidence, docCount, brsrResponses] = await Promise.all([
      prisma.eSGMetricValue.count({ where: { projectId: req.params.id } }),
      prisma.eSGMetricValue.count({ where: { projectId: req.params.id, isVerified: true } }),
      prisma.evidence.count({ where: { projectId: req.params.id } }),
      prisma.evidence.count({ where: { projectId: req.params.id, status: 'VERIFIED' } }),
      prisma.document.count({ where: { projectId: req.params.id } }),
      prisma.bRSRResponse.groupBy({ by: ['status'], where: { projectId: req.params.id }, _count: true }),
    ]);
    res.json({ success: true, stats: { metricCount, verifiedMetrics, evidenceCount, verifiedEvidence, docCount, brsrResponses } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
