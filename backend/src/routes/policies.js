const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, MANAGER_ROLES } = require('../middleware/rbac');
const { cleanDate, cleanBoolean, cleanString, stripMetadata } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { principleCode, isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (principleCode) where.principlesCovered = { has: principleCode };
    const policies = await prisma.policy.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, policies });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authenticate, requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { name, description, principlesCovered, policyOwner, approvedDate, reviewDate, documentUrl, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name required' });

    const policy = await prisma.policy.create({
      data: {
        name: cleanString(name),
        description: cleanString(description),
        principlesCovered: Array.isArray(principlesCovered) ? principlesCovered : [],
        policyOwner: cleanString(policyOwner),
        approvedDate: cleanDate(approvedDate),
        reviewDate: cleanDate(reviewDate),
        documentUrl: cleanString(documentUrl),
        isActive: isActive !== undefined ? cleanBoolean(isActive) : true,
      },
    });
    res.status(201).json({ success: true, policy });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id', authenticate, requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const existing = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Policy not found' });

    const cleaned = stripMetadata(req.body);
    const data = {};

    if (cleaned.name !== undefined) data.name = cleanString(cleaned.name);
    if (cleaned.description !== undefined) data.description = cleanString(cleaned.description);
    if (cleaned.principlesCovered !== undefined) {
      data.principlesCovered = Array.isArray(cleaned.principlesCovered) ? cleaned.principlesCovered : [];
    }
    if (cleaned.policyOwner !== undefined) data.policyOwner = cleanString(cleaned.policyOwner);
    if (cleaned.approvedDate !== undefined) data.approvedDate = cleanDate(cleaned.approvedDate);
    if (cleaned.reviewDate !== undefined) data.reviewDate = cleanDate(cleaned.reviewDate);
    if (cleaned.documentUrl !== undefined) data.documentUrl = cleanString(cleaned.documentUrl);
    if (cleaned.isActive !== undefined) data.isActive = cleanBoolean(cleaned.isActive);

    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, policy });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER'), async (req, res) => {
  try {
    await prisma.policy.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Policy deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
