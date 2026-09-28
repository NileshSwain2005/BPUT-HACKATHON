const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../middleware/audit');

const router = express.Router();
const prisma = new PrismaClient();

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { organization: { select: { id: true, name: true, type: true } } },
    });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await logAction({ userId: user.id, action: 'USER_LOGIN', description: `User ${user.email} logged in`, req });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, accessToken, refreshToken, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload.userId, stored.user.role);
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { token: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Logout error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: { select: { id: true, name: true, type: true } },
        projectAssignments: { include: { project: { select: { id: true, name: true, code: true, status: true } } } },
      },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
    res.json({ success: true, message: 'Password changed successfully. Please login again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

module.exports = router;
