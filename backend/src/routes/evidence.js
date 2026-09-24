const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, REVIEWER_ROLES, CONTRIBUTOR_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanId, cleanString, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/evidence
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, status, documentId, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (documentId) where.documentId = documentId;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const [evidence, total] = await Promise.all([
      prisma.evidence.findMany({
        where, skip: (+page - 1) * +limit, take: +limit,
        include: {
          document: { select: { id: true, name: true, documentType: true } },
          project: { select: { id: true, name: true, code: true } },
          reviewer: { select: { id: true, name: true } },
          _count: { select: { brsrLinks: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evidence.count({ where }),
    ]);
    res.json({ success: true, evidence, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/evidence/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ev = await prisma.evidence.findUnique({
      where: { id: req.params.id },
      include: {
        document: true,
        project: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        brsrLinks: { include: { response: { include: { question: { select: { questionCode: true, text: true } } } } } },
        metricValues: { include: { metric: { select: { code: true, name: true } } } },
      },
    });
    if (!ev) return res.status(404).json({ success: false, message: 'Evidence not found' });
    res.json({ success: true, evidence: ev });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/evidence
router.post('/', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const { title, description, documentId, projectId, pageReference, sectionRef, notes } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title required' });
    const ev = await prisma.evidence.create({
      data: {
        title: cleanString(title),
        description: cleanString(description),
        documentId: cleanId(documentId),
        projectId: cleanId(projectId),
        pageReference: cleanString(pageReference),
        sectionRef: cleanString(sectionRef),
        notes: cleanString(notes),
        status: 'UPLOADED',
      },
    });
    await logAction({ userId: req.user.id, action: 'EVIDENCE_CREATED', entityType: 'Evidence', entityId: ev.id, description: `Created evidence: ${title}`, req });
    res.status(201).json({ success: true, evidence: ev });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/evidence/:id
router.patch('/:id', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const existing = await prisma.evidence.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Evidence not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};
    if (cleaned.title !== undefined) data.title = cleanString(cleaned.title);
    if (cleaned.description !== undefined) data.description = cleanString(cleaned.description);
    if (cleaned.pageReference !== undefined) data.pageReference = cleanString(cleaned.pageReference);
    if (cleaned.sectionRef !== undefined) data.sectionRef = cleanString(cleaned.sectionRef);
    if (cleaned.notes !== undefined) data.notes = cleanString(cleaned.notes);
    if (cleaned.documentId !== undefined) data.documentId = cleanId(cleaned.documentId);
    if (cleaned.projectId !== undefined) data.projectId = cleanId(cleaned.projectId);

    const ev = await prisma.evidence.update({ where: { id: req.params.id }, data });
    res.json({ success: true, evidence: ev });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/evidence/:id/verify
router.patch('/:id/verify', authenticate, requireRole(...REVIEWER_ROLES), async (req, res) => {
  try {
    const ev = await prisma.evidence.update({
      where: { id: req.params.id },
      data: { status: 'VERIFIED', reviewerId: req.user.id, verifiedAt: new Date(), rejectionReason: null },
    });
    await logAction({ userId: req.user.id, action: 'EVIDENCE_VERIFIED', entityType: 'Evidence', entityId: ev.id, req });
    res.json({ success: true, evidence: ev });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/evidence/:id/reject
router.patch('/:id/reject', authenticate, requireRole(...REVIEWER_ROLES), async (req, res) => {
  try {
    const { reason } = req.body;
    const ev = await prisma.evidence.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', reviewerId: req.user.id, rejectionReason: reason },
    });
    await logAction({ userId: req.user.id, action: 'EVIDENCE_REJECTED', entityType: 'Evidence', entityId: ev.id, description: reason, req });
    res.json({ success: true, evidence: ev });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/evidence/stats/overview
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = projectId ? { projectId } : {};
    const byStatus = await prisma.evidence.groupBy({ by: ['status'], where, _count: true });
    const total = byStatus.reduce((a, b) => a + b._count, 0);
    res.json({ success: true, stats: { total, byStatus } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
