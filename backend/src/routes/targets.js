const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, MANAGER_ROLES, ADMIN_ROLES } = require('../middleware/rbac');
const { cleanFloat, cleanBoolean, cleanString, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { category, principleCode } = req.query;
    const where = {};
    if (category) where.category = category;
    if (principleCode) where.principleCode = principleCode;
    const targets = await prisma.eSGTarget.findMany({ where, orderBy: { category: 'asc' } });
    res.json({ success: true, targets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authenticate, requireRole(...MANAGER_ROLES, 'PROJECT_MANAGER'), async (req, res) => {
  try {
    const { title, description, targetValue, unit, baseline, baselineYear, targetYear, category, principleCode, currentValue } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title required' });

    const tv = cleanFloat(targetValue);
    const bl = cleanFloat(baseline);
    const cv = cleanFloat(currentValue);
    const progress = tv && cv ? Math.min(100, Math.round((cv / tv) * 100)) : 0;

    const target = await prisma.eSGTarget.create({
      data: {
        title: cleanString(title),
        description: cleanString(description),
        targetValue: tv,
        unit: cleanString(unit),
        baseline: bl,
        baselineYear: cleanString(baselineYear),
        targetYear: cleanString(targetYear),
        category: category || null,
        principleCode: cleanString(principleCode),
        currentValue: cv,
        progress,
        isAchieved: progress >= 100,
      },
    });
    res.status(201).json({ success: true, target });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id', authenticate, requireRole(...MANAGER_ROLES, 'PROJECT_MANAGER'), async (req, res) => {
  try {
    const existing = await prisma.eSGTarget.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Target not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};

    if (cleaned.title !== undefined) data.title = cleanString(cleaned.title);
    if (cleaned.description !== undefined) data.description = cleanString(cleaned.description);
    if (cleaned.unit !== undefined) data.unit = cleanString(cleaned.unit);
    if (cleaned.baselineYear !== undefined) data.baselineYear = cleanString(cleaned.baselineYear);
    if (cleaned.targetYear !== undefined) data.targetYear = cleanString(cleaned.targetYear);
    if (cleaned.category !== undefined) data.category = cleaned.category || null;
    if (cleaned.principleCode !== undefined) data.principleCode = cleanString(cleaned.principleCode);

    if (cleaned.targetValue !== undefined) data.targetValue = cleanFloat(cleaned.targetValue);
    if (cleaned.baseline !== undefined) data.baseline = cleanFloat(cleaned.baseline);
    if (cleaned.currentValue !== undefined) data.currentValue = cleanFloat(cleaned.currentValue);

    const tv = data.targetValue !== undefined ? data.targetValue : existing.targetValue;
    const cv = data.currentValue !== undefined ? data.currentValue : existing.currentValue;
    const progress = tv && cv ? Math.min(100, Math.round((cv / tv) * 100)) : (existing.progress || 0);
    data.progress = progress;

    if (cleaned.isAchieved !== undefined) {
      data.isAchieved = cleanBoolean(cleaned.isAchieved);
    } else {
      data.isAchieved = progress >= 100;
    }

    const target = await prisma.eSGTarget.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, target });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER'), async (req, res) => {
  try {
    await prisma.eSGTarget.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Target deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
