// Role hierarchy — higher index = more access
const ROLE_HIERARCHY = {
  STAKEHOLDER: 0,
  EXECUTIVE: 1,
  DATA_CONTRIBUTOR: 2,
  AUDITOR: 3,
  ESG_REVIEWER: 4,
  PROJECT_MANAGER: 5,
  BU_MANAGER: 6,
  SUBSIDIARY_MANAGER: 7,
  GROUP_ESG_MANAGER: 8,
  ESG_ADMIN: 9,
  SUPER_ADMIN: 10,
};

// Require that the user has AT LEAST one of the listed roles
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: 'Insufficient permissions for this action' });
};

// Require minimum role level
const requireMinRole = (minRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  const userLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
  const minLevel = ROLE_HIERARCHY[minRole] ?? 999;
  if (userLevel >= minLevel) return next();
  return res.status(403).json({ success: false, message: 'Insufficient permissions' });
};

const ADMIN_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN'];
const MANAGER_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER', 'SUBSIDIARY_MANAGER', 'BU_MANAGER'];
const REVIEWER_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER', 'ESG_REVIEWER'];
const CONTRIBUTOR_ROLES = [...MANAGER_ROLES, 'PROJECT_MANAGER', 'DATA_CONTRIBUTOR'];
const READ_ROLES = Object.keys(ROLE_HIERARCHY);

module.exports = { requireRole, requireMinRole, ADMIN_ROLES, MANAGER_ROLES, REVIEWER_ROLES, CONTRIBUTOR_ROLES, READ_ROLES, ROLE_HIERARCHY };
