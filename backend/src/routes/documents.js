const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole, ADMIN_ROLES, CONTRIBUTOR_ROLES } = require('../middleware/rbac');
const { logAction } = require('../middleware/audit');
const { cleanId, cleanString } = require('../utils/sanitize');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || './uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 } });

// GET /api/documents
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, documentType, isProcessed, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (documentType) where.documentType = documentType;
    if (isProcessed !== undefined) where.isProcessed = isProcessed === 'true';
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [docs, total] = await Promise.all([
      prisma.document.findMany({ where, skip: (+page - 1) * +limit, take: +limit, include: { project: { select: { id: true, name: true } }, _count: { select: { evidence: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.document.count({ where }),
    ]);
    res.json({ success: true, documents: docs, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/documents/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id }, include: { project: { select: { id: true, name: true } }, evidence: { include: { brsrLinks: { include: { response: { include: { question: { select: { questionCode: true, text: true } } } } } } } } } });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/documents/upload
router.post('/upload', authenticate, requireRole(...CONTRIBUTOR_ROLES), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { projectId, documentType, description, reportingYear, name } = req.body;
    const doc = await prisma.document.create({
      data: {
        name: cleanString(name) || req.file.originalname,
        originalName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        documentType: documentType || 'OTHER',
        description: cleanString(description),
        reportingYear: cleanString(reportingYear),
        projectId: cleanId(projectId),
      },
    });
    await logAction({ userId: req.user.id, action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: doc.id, description: `Uploaded ${doc.originalName}`, req });
    res.status(201).json({ success: true, document: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/documents/:id
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES, 'GROUP_ESG_MANAGER', 'SUBSIDIARY_MANAGER'), async (req, res) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
