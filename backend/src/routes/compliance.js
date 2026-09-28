const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/compliance/gap-analysis
router.get('/gap-analysis', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId, principleId, sectionId } = req.query;

    const questionWhere = {};
    if (sectionId) questionWhere.sectionId = sectionId;
    if (principleId) questionWhere.principleId = principleId;

    const questions = await prisma.bRSRQuestion.findMany({
      where: questionWhere,
      include: {
        section: true,
        principle: true,
        responses: {
          where: reportingPeriodId ? { reportingPeriodId } : {},
          include: { evidenceLinks: { include: { evidence: { select: { id: true, status: true } } } } },
        },
      },
      orderBy: [{ sectionId: 'asc' }, { orderIndex: 'asc' }],
    });

    const gaps = questions.map(q => {
      const response = q.responses[0];
      let complianceStatus = 'MISSING';
      let gapReason = 'No response submitted';
      let evidenceStatus = null;

      if (response) {
        if (response.status === 'VERIFIED') {
          const hasEvidence = response.evidenceLinks.length > 0;
          const verifiedEvidence = response.evidenceLinks.filter(l => l.evidence?.status === 'VERIFIED').length;
          if (hasEvidence && verifiedEvidence > 0) { complianceStatus = 'COMPLIANT'; gapReason = null; }
          else if (hasEvidence) { complianceStatus = 'PARTIALLY_COMPLIANT'; gapReason = 'Evidence not yet verified'; }
          else { complianceStatus = 'PARTIALLY_COMPLIANT'; gapReason = 'No evidence linked'; }
        } else if (response.status === 'PENDING_REVIEW') { complianceStatus = 'PENDING_REVIEW'; gapReason = 'Awaiting review'; }
        else if (response.status === 'NOT_APPLICABLE') { complianceStatus = 'NOT_APPLICABLE'; gapReason = response.naReason; }
        else if (response.status === 'DRAFT') { complianceStatus = 'PARTIALLY_COMPLIANT'; gapReason = 'Response in draft'; }
        else if (response.status === 'REJECTED') { complianceStatus = 'INVALID'; gapReason = 'Response rejected'; }
        evidenceStatus = { total: response.evidenceLinks.length, verified: response.evidenceLinks.filter(l => l.evidence?.status === 'VERIFIED').length };
      }

      return {
        questionId: q.id,
        questionCode: q.questionCode,
        questionText: q.text,
        section: q.section?.name,
        sectionCode: q.section?.code,
        principle: q.principle?.code,
        principleName: q.principle?.name,
        indicatorType: q.indicatorType,
        isMandatory: q.isMandatory,
        complianceStatus,
        gapReason,
        responseStatus: response?.status || null,
        evidenceStatus,
      };
    });

    const summary = {
      total: gaps.length,
      COMPLIANT: gaps.filter(g => g.complianceStatus === 'COMPLIANT').length,
      PARTIALLY_COMPLIANT: gaps.filter(g => g.complianceStatus === 'PARTIALLY_COMPLIANT').length,
      MISSING: gaps.filter(g => g.complianceStatus === 'MISSING').length,
      INVALID: gaps.filter(g => g.complianceStatus === 'INVALID').length,
      PENDING_REVIEW: gaps.filter(g => g.complianceStatus === 'PENDING_REVIEW').length,
      NOT_APPLICABLE: gaps.filter(g => g.complianceStatus === 'NOT_APPLICABLE').length,
    };
    summary.completionPct = Math.round(((summary.COMPLIANT + summary.PARTIALLY_COMPLIANT) / summary.total) * 100);

    res.json({ success: true, gaps, summary });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/compliance/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { reportingPeriodId } = req.query;
    const where = reportingPeriodId ? { reportingPeriodId } : {};

    const [totalQuestions, responses, evidenceStats, docCount] = await Promise.all([
      prisma.bRSRQuestion.count(),
      prisma.bRSRResponse.groupBy({ by: ['status'], where, _count: true }),
      prisma.evidence.groupBy({ by: ['status'], _count: true }),
      prisma.document.count(),
    ]);

    const responseMap = Object.fromEntries(responses.map(r => [r.status, r._count]));
    const evidenceMap = Object.fromEntries(evidenceStats.map(e => [e.status, e._count]));
    const totalResponses = responses.reduce((a, b) => a + b._count, 0);

    res.json({
      success: true,
      dashboard: {
        brsr: { totalQuestions, totalResponses, missing: totalQuestions - totalResponses, ...responseMap, completionPct: Math.round((totalResponses / totalQuestions) * 100) },
        evidence: { total: Object.values(evidenceMap).reduce((a, b) => a + b, 0), ...evidenceMap },
        documents: { total: docCount },
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
