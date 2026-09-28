require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Uploads directory ────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/auth'));
app.use('/api/users',         require('./src/routes/users'));
app.use('/api/organizations', require('./src/routes/organizations'));
app.use('/api/projects',      require('./src/routes/projects'));
app.use('/api/esg-metrics',   require('./src/routes/esgMetrics'));
app.use('/api/brsr',          require('./src/routes/brsr'));
app.use('/api/evidence',      require('./src/routes/evidence'));
app.use('/api/documents',     require('./src/routes/documents'));
app.use('/api/compliance',    require('./src/routes/compliance'));
app.use('/api/sdg',           require('./src/routes/sdg'));
app.use('/api/reports',       require('./src/routes/reports'));
app.use('/api/audit',         require('./src/routes/audit'));
app.use('/api/admin',         require('./src/routes/admin'));
app.use('/api/policies',      require('./src/routes/policies'));
app.use('/api/targets',       require('./src/routes/targets'));
app.use('/api/workflow',      require('./src/routes/workflow'));

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PRAVAAH API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PRAVAAH API running on http://localhost:${PORT}`);
});
