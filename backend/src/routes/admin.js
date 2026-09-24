const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES } = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/stats  — platform-wide stats
router.get('/stats', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER', 'EXECUTIVE'), async (req, res) => {
  try {
    const [users, orgs, projects, documents, evidence, metrics] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.organization.groupBy({ by: ['type'], _count: true }),
      prisma.project.groupBy({ by: ['status'], _count: true }),
      prisma.document.count(),
      prisma.evidence.groupBy({ by: ['status'], _count: true }),
      prisma.eSGMetricValue.count(),
    ]);
    res.json({ success: true, stats: { users, organizations: orgs, projects, documents, evidence, metrics } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/dashboard  — executive dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId } = req.query;
    const rp = reportingPeriodId ? { id: reportingPeriodId } : await prisma.reportingPeriod.findFirst({ where: { isCurrent: true } });

    const [totalProjects, activeProjects, totalUsers, totalDocs, totalEvidence, verifiedEvidence, totalMetrics, brsrByStatus, recentAudit] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.document.count(),
      prisma.evidence.count(),
      prisma.evidence.count({ where: { status: 'VERIFIED' } }),
      prisma.eSGMetricValue.count(),
      prisma.bRSRResponse.groupBy({ by: ['status'], where: rp ? { reportingPeriodId: rp.id } : {}, _count: true }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, role: true } } } }),
    ]);

    const totalQuestions = await prisma.bRSRQuestion.count();
    const brsrTotal = brsrByStatus.reduce((a, b) => a + b._count, 0);

    res.json({
      success: true,
      dashboard: {
        currentPeriod: rp,
        projects: { total: totalProjects, active: activeProjects },
        users: { total: totalUsers },
        documents: { total: totalDocs },
        evidence: { total: totalEvidence, verified: verifiedEvidence, pct: totalEvidence ? Math.round((verifiedEvidence / totalEvidence) * 100) : 0 },
        metrics: { total: totalMetrics },
        brsr: { totalQuestions, totalResponses: brsrTotal, missing: totalQuestions - brsrTotal, completionPct: Math.round((brsrTotal / totalQuestions) * 100), byStatus: brsrByStatus },
        recentActivity: recentAudit,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
