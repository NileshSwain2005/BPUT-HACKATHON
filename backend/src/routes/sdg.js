const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, CONTRIBUTOR_ROLES, ADMIN_ROLES } = require('../middleware/rbac');
const { cleanInt, cleanId, cleanString } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

const SDG_NAMES = {
  1:'No Poverty',2:'Zero Hunger',3:'Good Health & Well-being',4:'Quality Education',
  5:'Gender Equality',6:'Clean Water & Sanitation',7:'Affordable & Clean Energy',
  8:'Decent Work & Economic Growth',9:'Industry, Innovation & Infrastructure',
  10:'Reduced Inequalities',11:'Sustainable Cities & Communities',12:'Responsible Consumption & Production',
  13:'Climate Action',14:'Life Below Water',15:'Life on Land',16:'Peace, Justice & Strong Institutions',17:'Partnerships for the Goals',
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, sdgNumber } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (sdgNumber) where.sdgNumber = +sdgNumber;
    const mappings = await prisma.sDGMapping.findMany({ where, include: { project: { select: { id: true, name: true } } }, orderBy: [{ sdgNumber: 'asc' }] });
    res.json({ success: true, mappings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/summary', authenticate, async (req, res) => {
  try {
    const bySDG = await prisma.sDGMapping.groupBy({ by: ['sdgNumber'], _count: true, orderBy: { sdgNumber: 'asc' } });
    const enriched = bySDG.map(s => ({ sdgNumber: s.sdgNumber, sdgName: SDG_NAMES[s.sdgNumber], count: s._count }));
    res.json({ success: true, summary: enriched, totalMapped: enriched.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authenticate, requireRole(...CONTRIBUTOR_ROLES), async (req, res) => {
  try {
    const { sdgNumber, activity, description, contribution, target, indicator, projectId } = req.body;
    const num = cleanInt(sdgNumber);
    if (!num || !activity) return res.status(400).json({ success: false, message: 'sdgNumber and activity required' });
    const mapping = await prisma.sDGMapping.create({
      data: {
        sdgNumber: num,
        sdgName: SDG_NAMES[num] || `SDG ${num}`,
        activity: cleanString(activity),
        description: cleanString(description),
        contribution: cleanString(contribution),
        target: cleanString(target),
        indicator: cleanString(indicator),
        projectId: cleanId(projectId),
      },
    });
    res.status(201).json({ success: true, mapping });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER'), async (req, res) => {
  try {
    await prisma.sDGMapping.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'SDG mapping deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
