// Role hierarchy
export const ROLE_HIERARCHY = {
  STAKEHOLDER: 0, EXECUTIVE: 1, DATA_CONTRIBUTOR: 2, AUDITOR: 3,
  ESG_REVIEWER: 4, PROJECT_MANAGER: 5, BU_MANAGER: 6,
  SUBSIDIARY_MANAGER: 7, GROUP_ESG_MANAGER: 8, ESG_ADMIN: 9, SUPER_ADMIN: 10,
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin', ESG_ADMIN: 'ESG Admin',
  GROUP_ESG_MANAGER: 'Group ESG Manager', SUBSIDIARY_MANAGER: 'Subsidiary Manager',
  BU_MANAGER: 'BU Manager', PROJECT_MANAGER: 'Project Manager',
  DATA_CONTRIBUTOR: 'Data Contributor', ESG_REVIEWER: 'ESG Reviewer',
  AUDITOR: 'Auditor', EXECUTIVE: 'Executive', STAKEHOLDER: 'Stakeholder',
};

export const ROLES = ROLE_LABELS;
export const formatRole = (role) => ROLE_LABELS[role] || (role ? role.replace(/_/g, ' ') : '—');

export const ROLE_COLORS = {
  SUPER_ADMIN: 'badge-purple', ESG_ADMIN: 'badge-blue', GROUP_ESG_MANAGER: 'badge-brand',
  SUBSIDIARY_MANAGER: 'badge-green', BU_MANAGER: 'badge-green', PROJECT_MANAGER: 'badge-blue',
  DATA_CONTRIBUTOR: 'badge-orange', ESG_REVIEWER: 'badge-yellow', AUDITOR: 'badge-gray',
  EXECUTIVE: 'badge-purple', STAKEHOLDER: 'badge-gray',
};

export const hasRole = (userRole, ...roles) => roles.includes(userRole);

export const hasMinRole = (userRole, minRole) =>
  (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minRole] ?? 999);

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN'];
export const MANAGER_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER', 'SUBSIDIARY_MANAGER', 'BU_MANAGER'];
export const REVIEWER_ROLES = ['SUPER_ADMIN', 'ESG_ADMIN', 'GROUP_ESG_MANAGER', 'ESG_REVIEWER'];
export const CONTRIBUTOR_ROLES = [...MANAGER_ROLES, 'PROJECT_MANAGER', 'DATA_CONTRIBUTOR'];

// Format helpers
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const formatNumber = (n, decimals = 2) => n != null ? Number(n).toLocaleString('en-IN', { maximumFractionDigits: decimals }) : '—';
export const formatCurrency = (n) => n != null ? `₹${(n / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` : '—';
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const truncate = (str, n = 50) => str?.length > n ? str.slice(0, n) + '…' : str;

// Status styling
export const RESPONSE_STATUS_COLORS = {
  DRAFT: 'badge-gray', ANSWERED: 'badge-blue', NOT_APPLICABLE: 'badge-orange',
  NOT_AVAILABLE: 'badge-orange', PENDING_REVIEW: 'badge-yellow',
  VERIFIED: 'badge-green', REJECTED: 'badge-red',
};

export const COMPLIANCE_STATUS_COLORS = {
  COMPLIANT: 'badge-green', PARTIALLY_COMPLIANT: 'badge-yellow',
  MISSING: 'badge-red', INVALID: 'badge-red',
  PENDING_REVIEW: 'badge-yellow', NOT_APPLICABLE: 'badge-gray',
};

export const EVIDENCE_STATUS_COLORS = {
  UPLOADED: 'badge-blue', PENDING_VERIFICATION: 'badge-yellow',
  VERIFIED: 'badge-green', REJECTED: 'badge-red',
};

export const PROJECT_STATUS_COLORS = {
  ACTIVE: 'badge-green', COMPLETED: 'badge-blue',
  ON_HOLD: 'badge-yellow', CANCELLED: 'badge-red',
};

// SDG colors
export const SDG_COLORS = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',
  6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',
  11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',
  16:'#00689D',17:'#19486A',
};

// Principle theme colors
export const PRINCIPLE_COLORS = {
  P1:'#7c3aed',P2:'#0891b2',P3:'#059669',P4:'#d97706',
  P5:'#dc2626',P6:'#2a9d7c',P7:'#4f46e5',P8:'#db2777',P9:'#ea580c',
};
