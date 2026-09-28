const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, MANAGER_ROLES, CONTRIBUTOR_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanFloat, cleanId, cleanString } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/esg-metrics  — metric definitions
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }];
    const metrics = await prisma.eSGMetric.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/esg-metrics/values  — metric values (with filters)
router.get('/values', authenticate, async (req, res) => {
  try {
    const { projectId, reportingPeriodId, metricId, category, isVerified, page = 1, limit = 50 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (metricId) where.metricId = metricId;
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';
    if (category) where.metric = { category };

    const [values, total] = await Promise.all([
      prisma.eSGMetricValue.findMany({
        where, skip: (+page - 1) * +limit, take: +limit,
        include: {
          metric: true,
          project: { select: { id: true, name: true, code: true } },
          reportingPeriod: { select: { id: true, name: true } },
          evidence: { select: { id: true, title: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eSGMetricValue.count({ where }),
    ]);
    res.json({ success: true, values, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/esg-metrics/summary  — aggregated by category for dashboard
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId, projectId } = req.query;
    const where = {};
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (projectId) where.projectId = projectId;
    const [total, verified, byCategory] = await Promise.all([
      prisma.eSGMetricValue.count({ where }),
      prisma.eSGMetricValue.count({ where: { ...where, isVerified: true } }),
      prisma.eSGMetricValue.groupBy({ by: [], where, _count: true }),
    ]);
    res.json({ success: true, summary: { total, verified, pending: total - verified } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/esg-metrics (admin)
router.post('/', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { code, name, description, category, unit, dataType, frequency, sdgIds, brsr_mapping } = req.body;
    if (!code || !name || !category) return res.status(400).json({ success: false, message: 'code, name, category required' });
    const metric = await prisma.eSGMetric.create({ data: { code, name, description, category, unit, dataType, frequency, sdgIds: sdgIds || [], brsr_mapping } });
    res.status(201).json({ success: true, metric });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Metric code already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/esg-metrics/values  — enter a metric value
router.post('/values', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const { metricId, projectId, reportingPeriodId, value, textValue, unit, notes, evidenceId, submitForReview, workflowStatus } = req.body;
    if (!metricId || !projectId || !reportingPeriodId) return res.status(400).json({ success: false, message: 'metricId, projectId, reportingPeriodId required' });
    const cleanNum = cleanFloat(value);
    const isPM = req.user.role === 'PROJECT_MANAGER';
    const now = new Date();

    const isSubmitting = submitForReview === true || workflowStatus === 'SUBMITTED' || workflowStatus === 'PM_APPROVED';
    // Contributor submitting -> SUBMITTED (flows to Project Manager)
    // Project Manager submitting directly -> PM_APPROVED (flows to ESG Reviewer)
    let targetStatus = 'DRAFT';
    if (isSubmitting) {
      targetStatus = isPM ? 'PM_APPROVED' : 'SUBMITTED';
    } else if (workflowStatus) {
      targetStatus = workflowStatus;
    }

    const updateData = {
      value: cleanNum,
      textValue: cleanString(textValue),
      unit: cleanString(unit),
      notes: cleanString(notes),
      evidenceId: cleanId(evidenceId),
      isVerified: false,
      workflowStatus: targetStatus,
      lastActionBy: req.user.name || req.user.email,
      lastActionAt: now,
      ...(isSubmitting ? {
        submittedBy: req.user.name || req.user.email,
        submittedAt: now,
        reviewerComment: null,
      } : {}),
    };

    const createData = {
      metricId,
      projectId,
      reportingPeriodId,
      value: cleanNum,
      textValue: cleanString(textValue),
      unit: cleanString(unit),
      notes: cleanString(notes),
      evidenceId: cleanId(evidenceId),
      workflowStatus: targetStatus,
      submittedBy: req.user.name || req.user.email,
      submittedAt: isSubmitting ? now : null,
      lastActionBy: req.user.name || req.user.email,
      lastActionAt: now,
    };

    const mv = await prisma.eSGMetricValue.upsert({
      where: { metricId_projectId_reportingPeriodId: { metricId, projectId, reportingPeriodId } },
      update: updateData,
      create: createData,
      include: { metric: true, project: true, reportingPeriod: true },
    });
    await logAction({
      userId: req.user.id,
      action: isSubmitting ? 'METRIC_VALUE_SUBMITTED' : 'METRIC_VALUE_SAVED_DRAFT',
      entityType: 'ESGMetricValue',
      entityId: mv.id,
      description: `Metric value ${mv.value ?? mv.textValue} for ${mv.metric?.name} (${mv.project?.name}) saved with status ${mv.workflowStatus}`,
      req,
    });
    res.json({ success: true, metricValue: mv });
  } catch (err) {
    console.error('Error entering metric value:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/esg-metrics/values/:id/verify
router.patch('/values/:id/verify', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER', 'ESG_REVIEWER'), async (req, res) => {
  try {
    const { isVerified } = req.body;
    const mv = await prisma.eSGMetricValue.update({
      where: { id: req.params.id },
      data: { isVerified: !!isVerified, verifiedBy: isVerified ? req.user.name : null, verifiedAt: isVerified ? new Date() : null },
    });
    res.json({ success: true, metricValue: mv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/esg-metrics/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const metric = await prisma.eSGMetric.findUnique({ where: { id: req.params.id }, include: { values: { include: { project: { select: { id: true, name: true } }, reportingPeriod: { select: { id: true, name: true } } }, take: 20, orderBy: { createdAt: 'desc' } } } });
    if (!metric) return res.status(404).json({ success: false, message: 'Metric not found' });
    res.json({ success: true, metric });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
