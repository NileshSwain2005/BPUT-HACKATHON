/**
 * /api/workflow — Multi-level ESG data approval workflow
 *
 * Approval chain (per role):
 *   DATA_CONTRIBUTOR / PROJECT_MANAGER  → submit (DRAFT → SUBMITTED)
 *   ESG_REVIEWER                        → approve (SUBMITTED → REVIEWER_APPROVED) | reject
 *   BU_MANAGER                          → approve (REVIEWER_APPROVED → BU_APPROVED) | reject
 *   SUBSIDIARY_MANAGER                  → approve (BU_APPROVED → SUBSIDIARY_APPROVED) | reject
 *   GROUP_ESG_MANAGER                   → approve (SUBSIDIARY_APPROVED → GROUP_APPROVED) | reject
 *   SUPER_ADMIN / ESG_ADMIN             → publish (GROUP_APPROVED → PUBLISHED) | reject any
 */
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');

const router = express.Router();
const prisma = new PrismaClient();

// ── Allowed transitions per role ──────────────────────────────────────────────
const TRANSITIONS = {
  // Step 1: Contributor or PM submits (DRAFT / REVISION_REQUESTED → SUBMITTED to PM)
  submit: {
    roles: ['DATA_CONTRIBUTOR', 'PROJECT_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['DRAFT', 'REVISION_REQUESTED'],
    to: 'SUBMITTED',
  },
  submit_to_pm: {
    roles: ['DATA_CONTRIBUTOR', 'PROJECT_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['DRAFT', 'REVISION_REQUESTED'],
    to: 'SUBMITTED',
  },
  // Step 2: Project Manager validates contributor data → PM_APPROVED (sends to ESG Reviewer)
  pm_approve: {
    roles: ['PROJECT_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['SUBMITTED', 'DRAFT', 'REVISION_REQUESTED'],
    to: 'PM_APPROVED',
  },
  // Step 3: ESG Reviewer validates evidence & approves → REVIEWER_APPROVED (sends to BU Manager)
  reviewer_approve: {
    roles: ['ESG_REVIEWER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['PM_APPROVED', 'SUBMITTED'],
    to: 'REVIEWER_APPROVED',
  },
  // Step 4: BU Manager approves → BU_APPROVED (sends to Subsidiary Manager)
  bu_approve: {
    roles: ['BU_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['REVIEWER_APPROVED'],
    to: 'BU_APPROVED',
  },
  // Step 5: Subsidiary Manager approves → SUBSIDIARY_APPROVED (sends to Group ESG Manager)
  subsidiary_approve: {
    roles: ['SUBSIDIARY_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['BU_APPROVED'],
    to: 'SUBSIDIARY_APPROVED',
  },
  // Step 6: Group ESG Manager approves → GROUP_APPROVED
  group_approve: {
    roles: ['GROUP_ESG_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['SUBSIDIARY_APPROVED'],
    to: 'GROUP_APPROVED',
  },
  // Step 7: Group ESG Manager or Admin publishes → PUBLISHED (locks data, sets isVerified)
  publish: {
    roles: ['SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER'],
    from: ['SUBSIDIARY_APPROVED', 'GROUP_APPROVED'],
    to: 'PUBLISHED',
  },
  // Rejection / Revision Request: Any reviewer or manager can send back with comments
  reject: {
    roles: ['PROJECT_MANAGER', 'ESG_REVIEWER', 'BU_MANAGER', 'SUBSIDIARY_MANAGER', 'GROUP_ESG_MANAGER', 'SUPER_ADMIN', 'ESG_ADMIN'],
    from: ['SUBMITTED', 'PM_APPROVED', 'REVIEWER_APPROVED', 'BU_APPROVED', 'SUBSIDIARY_APPROVED', 'GROUP_APPROVED'],
    to: 'REVISION_REQUESTED',
  },
};

// POST /api/workflow/metric-values/:id/transition
router.post('/metric-values/:id/transition', authenticate, async (req, res) => {
  try {
    const { action, comment } = req.body;
    const { id } = req.params;
    const role = req.user.role;

    const transition = TRANSITIONS[action];
    if (!transition) {
      return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
    }
    if (!transition.roles.includes(role)) {
      return res.status(403).json({ success: false, message: `Role ${role} cannot perform action: ${action}` });
    }

    const mv = await prisma.eSGMetricValue.findUnique({
      where: { id },
      include: { metric: true, project: true },
    });
    if (!mv) return res.status(404).json({ success: false, message: 'Metric value not found' });

    if (!transition.from.includes(mv.workflowStatus)) {
      return res.status(409).json({
        success: false,
        message: `Cannot ${action}: current status is ${mv.workflowStatus}, expected one of: ${transition.from.join(', ')}`,
      });
    }

    const newStatus = transition.to;
    const now = new Date();

    const updated = await prisma.eSGMetricValue.update({
      where: { id },
      data: {
        workflowStatus: newStatus,
        reviewerComment: comment || null,
        lastActionBy: req.user.name || req.user.email,
        lastActionAt: now,
        // Mark submitted fields on first submission
        ...((action === 'submit' || action === 'submit_to_pm') && !mv.submittedAt
          ? { submittedBy: req.user.name || req.user.email, submittedAt: now }
          : {}),
        // If PM validates, also ensure submittedBy is populated
        ...(action === 'pm_approve' && !mv.submittedBy
          ? { submittedBy: req.user.name || req.user.email, submittedAt: mv.submittedAt || now }
          : {}),
        // Auto-set isVerified on publish
        ...(newStatus === 'PUBLISHED'
          ? { isVerified: true, verifiedBy: req.user.name || req.user.email, verifiedAt: now }
          : {}),
      },
      include: { metric: true, project: true, reportingPeriod: true },
    });

    await logAction({
      userId: req.user.id,
      action: `WORKFLOW_${action.toUpperCase()}`,
      entityType: 'ESGMetricValue',
      entityId: id,
      description: `${action} on ${mv.metric?.name} (${mv.project?.name}) — status: ${mv.workflowStatus} → ${newStatus}${comment ? ` | Comment: ${comment}` : ''}`,
      req,
    });

    res.json({ success: true, metricValue: updated, from: mv.workflowStatus, to: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workflow/pending  — get pending items for the logged-in role
router.get('/pending', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    const { projectId, status, limit = 50, page = 1 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;

    if (status) {
      where.workflowStatus = status;
    } else {
      // Each role sees items appropriate to their workflow stage
      if (role === 'PROJECT_MANAGER') {
        // Project Manager sees SUBMITTED items from contributors (awaiting PM review) + their drafts/revisions
        where.workflowStatus = { in: ['SUBMITTED', 'DRAFT', 'REVISION_REQUESTED'] };
      } else if (role === 'ESG_REVIEWER') {
        // ESG Reviewer sees items validated by PM (PM_APPROVED) or direct submissions
        where.workflowStatus = { in: ['PM_APPROVED', 'SUBMITTED'] };
      } else if (role === 'BU_MANAGER') {
        where.workflowStatus = 'REVIEWER_APPROVED';
      } else if (role === 'SUBSIDIARY_MANAGER') {
        where.workflowStatus = 'BU_APPROVED';
      } else if (role === 'GROUP_ESG_MANAGER') {
        where.workflowStatus = { in: ['SUBSIDIARY_APPROVED', 'GROUP_APPROVED'] };
      } else if (['SUPER_ADMIN', 'ESG_ADMIN'].includes(role)) {
        where.workflowStatus = { in: ['SUBMITTED', 'PM_APPROVED', 'REVIEWER_APPROVED', 'BU_APPROVED', 'SUBSIDIARY_APPROVED', 'GROUP_APPROVED', 'REVISION_REQUESTED'] };
      } else if (role === 'DATA_CONTRIBUTOR') {
        // Contributor sees all their metric entries to track their progress
      } else if (role === 'AUDITOR') {
        // Auditor reads all levels — no status filter
      } else {
        // Executive, Stakeholder see published
        where.workflowStatus = 'PUBLISHED';
      }
    }

    const [items, total] = await Promise.all([
      prisma.eSGMetricValue.findMany({
        where,
        skip: (+page - 1) * +limit,
        take: +limit,
        include: {
          metric: { select: { id: true, name: true, code: true, category: true, unit: true, dataType: true } },
          project: { select: { id: true, name: true, code: true } },
          reportingPeriod: { select: { id: true, name: true } },
          evidence: { select: { id: true, title: true, status: true, evidenceCode: true } },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.eSGMetricValue.count({ where }),
    ]);

    res.json({ success: true, items, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workflow/stats  — counts by workflow status
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { projectId, reportingPeriodId } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;

    const grouped = await prisma.eSGMetricValue.groupBy({
      by: ['workflowStatus'],
      where,
      _count: { workflowStatus: true },
    });

    const stats = {};
    for (const g of grouped) {
      stats[g.workflowStatus] = g._count.workflowStatus;
    }
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
