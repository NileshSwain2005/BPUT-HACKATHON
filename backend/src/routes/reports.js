const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/brsr-summary
router.get('/brsr-summary', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId } = req.query;
    const period = reportingPeriodId
      ? await prisma.reportingPeriod.findUnique({ where: { id: reportingPeriodId }, include: { organization: true } })
      : await prisma.reportingPeriod.findFirst({ where: { isCurrent: true }, include: { organization: true } });

    if (!period) return res.status(404).json({ success: false, message: 'No reporting period found' });

    const responses = await prisma.bRSRResponse.findMany({
      where: { reportingPeriodId: period.id },
      include: {
        question: { include: { section: true, principle: true } },
        evidenceLinks: { include: { evidence: { select: { id: true, title: true, status: true } } } },
      },
      orderBy: [{ question: { sectionId: 'asc' } }, { question: { orderIndex: 'asc' } }],
    });

    const bySection = responses.reduce((acc, r) => {
      const sec = r.question.section?.code || 'UNKNOWN';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(r);
      return acc;
    }, {});

    const metrics = await prisma.eSGMetricValue.findMany({
      where: { reportingPeriodId: period.id },
      include: { metric: true, project: { select: { id: true, name: true } } },
    });

    res.json({ success: true, report: { period, bySection, metrics, generatedAt: new Date() } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reports/esg-kpi
router.get('/esg-kpi', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId, projectId } = req.query;
    const where = {};
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (projectId) where.projectId = projectId;

    const values = await prisma.eSGMetricValue.findMany({
      where,
      include: {
        metric: true,
        project: { select: { id: true, name: true, code: true } },
        reportingPeriod: { select: { id: true, name: true } },
      },
    });

    const byCategory = values.reduce((acc, v) => {
      const cat = v.metric.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(v);
      return acc;
    }, {});

    res.json({ success: true, report: { values, byCategory, generatedAt: new Date() } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
