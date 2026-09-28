const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, REVIEWER_ROLES, CONTRIBUTOR_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanFloat, cleanDate, cleanId, cleanString, cleanBoolean, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// ── Reporting Periods ─────────────────────────────────────────────────
router.get('/periods', authenticate, async (req, res) => {
  try {
    const periods = await prisma.reportingPeriod.findMany({
      include: { organization: { select: { id: true, name: true } } },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, periods });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/periods', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { name, startDate, endDate, boundary, isActive, isCurrent, organizationId } = req.body;
    const orgId = cleanId(organizationId);
    if (isCurrent && orgId) {
      await prisma.reportingPeriod.updateMany({ where: { organizationId: orgId }, data: { isCurrent: false } });
    } else if (isCurrent) {
      await prisma.reportingPeriod.updateMany({ data: { isCurrent: false } });
    }
    const period = await prisma.reportingPeriod.create({
      data: {
        name: cleanString(name),
        startDate: cleanDate(startDate) || new Date(),
        endDate: cleanDate(endDate) || new Date(),
        boundary: boundary || 'STANDALONE',
        isActive: isActive !== undefined ? cleanBoolean(isActive) : true,
        isCurrent: cleanBoolean(isCurrent) || false,
        organizationId: orgId,
      },
    });
    res.status(201).json({ success: true, period });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/periods/:id', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const existing = await prisma.reportingPeriod.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Reporting period not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};
    if (cleaned.name !== undefined) data.name = cleanString(cleaned.name);
    if (cleaned.startDate !== undefined) data.startDate = cleanDate(cleaned.startDate);
    if (cleaned.endDate !== undefined) data.endDate = cleanDate(cleaned.endDate);
    if (cleaned.boundary !== undefined) data.boundary = cleaned.boundary;
    if (cleaned.isActive !== undefined) data.isActive = cleanBoolean(cleaned.isActive);
    if (cleaned.organizationId !== undefined) data.organizationId = cleanId(cleaned.organizationId);
    if (cleaned.isCurrent !== undefined) {
      data.isCurrent = cleanBoolean(cleaned.isCurrent);
      if (data.isCurrent) {
        await prisma.reportingPeriod.updateMany({
          where: { id: { not: req.params.id }, organizationId: data.organizationId || existing.organizationId },
          data: { isCurrent: false },
        });
      }
    }

    const period = await prisma.reportingPeriod.update({ where: { id: req.params.id }, data });
    res.json({ success: true, period });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BRSR Sections ─────────────────────────────────────────────────────
router.get('/sections', authenticate, async (req, res) => {
  try {
    const sections = await prisma.bRSRSection.findMany({ orderBy: { orderIndex: 'asc' } });
    res.json({ success: true, sections });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BRSR Principles ───────────────────────────────────────────────────
router.get('/principles', authenticate, async (req, res) => {
  try {
    const principles = await prisma.bRSRPrinciple.findMany({ orderBy: { number: 'asc' } });
    res.json({ success: true, principles });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BRSR Questions ────────────────────────────────────────────────────
router.get('/questions', authenticate, async (req, res) => {
  try {
    const { sectionId, principleId, indicatorType, search } = req.query;
    const where = {};
    if (sectionId) where.sectionId = sectionId;
    if (principleId) where.principleId = principleId;
    if (indicatorType) where.indicatorType = indicatorType;
    if (search) where.OR = [{ text: { contains: search, mode: 'insensitive' } }, { questionCode: { contains: search, mode: 'insensitive' } }];
    const questions = await prisma.bRSRQuestion.findMany({
      where,
      include: { section: true, principle: true },
      orderBy: [{ sectionId: 'asc' }, { orderIndex: 'asc' }],
    });
    res.json({ success: true, questions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BRSR Responses ────────────────────────────────────────────────────
router.get('/responses', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId, projectId, sectionId, principleId, status, indicatorType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (sectionId || principleId || indicatorType) {
      where.question = {};
      if (sectionId) where.question.sectionId = sectionId;
      if (principleId) where.question.principleId = principleId;
      if (indicatorType) where.question.indicatorType = indicatorType;
    }
    const [responses, total] = await Promise.all([
      prisma.bRSRResponse.findMany({
        where, skip: (+page - 1) * +limit, take: +limit,
        include: {
          question: { include: { section: true, principle: true } },
          reportingPeriod: { select: { id: true, name: true } },
          project: { select: { id: true, name: true, code: true } },
          evidenceLinks: { include: { evidence: { select: { id: true, title: true, status: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.bRSRResponse.count({ where }),
    ]);
    res.json({ success: true, responses, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/responses/:id', authenticate, async (req, res) => {
  try {
    const r = await prisma.bRSRResponse.findUnique({
      where: { id: req.params.id },
      include: {
        question: { include: { section: true, principle: true } },
        reportingPeriod: true,
        project: { select: { id: true, name: true, code: true } },
        evidenceLinks: { include: { evidence: { include: { document: { select: { id: true, name: true, filePath: true } } } } } },
        reviewHistory: { include: { reviewer: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!r) return res.status(404).json({ success: false, message: 'Response not found' });
    res.json({ success: true, response: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/responses', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const { questionId, reportingPeriodId, projectId, response, numericValue, unit, applicability, naReason, reportingBoundary, notes } = req.body;
    if (!questionId || !reportingPeriodId) return res.status(400).json({ success: false, message: 'questionId and reportingPeriodId required' });
    const pId = cleanId(projectId);
    const numVal = cleanFloat(numericValue);

    const existing = await prisma.bRSRResponse.findFirst({
      where: {
        questionId,
        reportingPeriodId,
        projectId: pId,
      },
    });

    let r;
    if (existing) {
      r = await prisma.bRSRResponse.update({
        where: { id: existing.id },
        data: {
          response: response !== undefined ? cleanString(response) : existing.response,
          numericValue: numVal !== undefined ? numVal : existing.numericValue,
          unit: unit !== undefined ? cleanString(unit) : existing.unit,
          applicability: applicability !== undefined ? cleanBoolean(applicability) : existing.applicability,
          naReason: naReason !== undefined ? cleanString(naReason) : existing.naReason,
          reportingBoundary: reportingBoundary || existing.reportingBoundary,
          notes: notes !== undefined ? cleanString(notes) : existing.notes,
          status: 'DRAFT',
        },
        include: { question: { include: { section: true, principle: true } } },
      });
    } else {
      r = await prisma.bRSRResponse.create({
        data: {
          questionId,
          reportingPeriodId,
          projectId: pId,
          response: cleanString(response),
          numericValue: numVal,
          unit: cleanString(unit),
          applicability: applicability !== undefined ? cleanBoolean(applicability) : true,
          naReason: cleanString(naReason),
          reportingBoundary: reportingBoundary || 'STANDALONE',
          notes: cleanString(notes),
          status: 'DRAFT',
        },
        include: { question: { include: { section: true, principle: true } } },
      });
    }
    await logAction({ userId: req.user.id, action: 'BRSR_RESPONSE_CREATED', entityType: 'BRSRResponse', entityId: r.id, req });
    res.json({ success: true, response: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/responses/:id/submit', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const r = await prisma.bRSRResponse.update({ where: { id: req.params.id }, data: { status: 'PENDING_REVIEW' } });
    await prisma.bRSRReviewHistory.create({ data: { responseId: r.id, reviewerId: req.user.id, action: 'SUBMITTED', notes: req.body.notes } });
    await logAction({ userId: req.user.id, action: 'BRSR_RESPONSE_SUBMITTED', entityType: 'BRSRResponse', entityId: r.id, req });
    res.json({ success: true, response: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/responses/:id/review', authenticate, requireRole(...REVIEWER_ROLES), async (req, res) => {
  try {
    const { action, notes } = req.body;
    const statusMap = { APPROVED: 'VERIFIED', REJECTED: 'REJECTED', REVISION_REQUESTED: 'DRAFT', VERIFIED: 'VERIFIED' };
    const newStatus = statusMap[action];
    if (!newStatus) return res.status(400).json({ success: false, message: 'Invalid review action' });
    const r = await prisma.bRSRResponse.update({ where: { id: req.params.id }, data: { status: newStatus } });
    await prisma.bRSRReviewHistory.create({ data: { responseId: r.id, reviewerId: req.user.id, action, notes } });
    await logAction({ userId: req.user.id, action: 'REVIEW_ACTION', entityType: 'BRSRResponse', entityId: r.id, description: action, req });
    res.json({ success: true, response: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Link evidence to response
router.post('/responses/:id/evidence', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const { evidenceId } = req.body;
    const link = await prisma.bRSRResponseEvidence.upsert({
      where: { responseId_evidenceId: { responseId: req.params.id, evidenceId } },
      update: {},
      create: { responseId: req.params.id, evidenceId },
    });
    res.json({ success: true, link });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/brsr/compliance-summary
router.get('/compliance-summary', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId, projectId } = req.query;
    const where = {};
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (projectId) where.projectId = projectId;

    const totalQuestions = await prisma.bRSRQuestion.count();
    const byStatus = await prisma.bRSRResponse.groupBy({ by: ['status'], where, _count: true });
    const answered = byStatus.find(s => ['ANSWERED', 'VERIFIED', 'PENDING_REVIEW'].includes(s.status))?._count || 0;
    const verified = byStatus.filter(s => s.status === 'VERIFIED').reduce((a, b) => a + b._count, 0);
    const draft = byStatus.filter(s => s.status === 'DRAFT').reduce((a, b) => a + b._count, 0);
    const totalResponses = byStatus.reduce((a, b) => a + b._count, 0);
    const missing = totalQuestions - totalResponses;

    res.json({ success: true, summary: { totalQuestions, totalResponses, missing, draft, verified, byStatus, completionPct: Math.round((totalResponses / totalQuestions) * 100) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
