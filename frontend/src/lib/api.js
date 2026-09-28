import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Typed API helpers ─────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

export const orgsApi = {
  list: (params) => api.get('/organizations', { params }),
  tree: () => api.get('/organizations/tree'),
  get: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.patch(`/organizations/${id}`, data),
};

export const projectsApi = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  stats: (id) => api.get(`/projects/${id}/stats`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  assignUser: (id, userId) => api.post(`/projects/${id}/assign-user`, { userId }),
  removeUser: (id, userId) => api.delete(`/projects/${id}/assign-user/${userId}`),
};

export const esgApi = {
  listMetrics: (params) => api.get('/esg-metrics', { params }),
  getMetric: (id) => api.get(`/esg-metrics/${id}`),
  createMetric: (data) => api.post('/esg-metrics', data),
  listValues: (params) => api.get('/esg-metrics/values', { params }),
  submitValue: (data) => api.post('/esg-metrics/values', data),
  verifyValue: (id, isVerified) => api.patch(`/esg-metrics/values/${id}/verify`, { isVerified }),
  summary: (params) => api.get('/esg-metrics/summary', { params }),
};

export const brsrApi = {
  getPeriods: () => api.get('/brsr/periods'),
  createPeriod: (data) => api.post('/brsr/periods', data),
  getSections: () => api.get('/brsr/sections'),
  getPrinciples: () => api.get('/brsr/principles'),
  getQuestions: (params) => api.get('/brsr/questions', { params }),
  getResponses: (params) => api.get('/brsr/responses', { params }),
  getResponse: (id) => api.get(`/brsr/responses/${id}`),
  saveResponse: (data) => api.post('/brsr/responses', data),
  submitResponse: (id, notes) => api.patch(`/brsr/responses/${id}/submit`, { notes }),
  reviewResponse: (id, action, notes) => api.patch(`/brsr/responses/${id}/review`, { action, notes }),
  linkEvidence: (id, evidenceId) => api.post(`/brsr/responses/${id}/evidence`, { evidenceId }),
  complianceSummary: (params) => api.get('/brsr/compliance-summary', { params }),
};

export const documentsApi = {
  list: (params) => api.get('/documents', { params }),
  get: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const evidenceApi = {
  list: (params) => api.get('/evidence', { params }),
  get: (id) => api.get(`/evidence/${id}`),
  create: (data) => api.post('/evidence', data),
  update: (id, data) => api.patch(`/evidence/${id}`, data),
  verify: (id) => api.patch(`/evidence/${id}/verify`),
  reject: (id, reason) => api.patch(`/evidence/${id}/reject`, { reason }),
  stats: (params) => api.get('/evidence/stats/overview', { params }),
};

export const complianceApi = {
  gapAnalysis: (params) => api.get('/compliance/gap-analysis', { params }),
  dashboard: (params) => api.get('/compliance/dashboard', { params }),
};

export const sdgApi = {
  list: (params) => api.get('/sdg', { params }),
  summary: () => api.get('/sdg/summary'),
  create: (data) => api.post('/sdg', data),
  delete: (id) => api.delete(`/sdg/${id}`),
};

export const reportsApi = {
  brsrSummary: (params) => api.get('/reports/brsr-summary', { params }),
  esgKpi: (params) => api.get('/reports/esg-kpi', { params }),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  dashboard: (params) => api.get('/admin/dashboard', { params }),
};

export const policiesApi = {
  list: (params) => api.get('/policies', { params }),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.patch(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
};

export const targetsApi = {
  list: (params) => api.get('/targets', { params }),
  create: (data) => api.post('/targets', data),
  update: (id, data) => api.patch(`/targets/${id}`, data),
  delete: (id) => api.delete(`/targets/${id}`),
};

export const auditApi = {
  list: (params) => api.get('/audit', { params }),
};

// ── Workflow API (multi-level approval data flow) ─────────────────────────────
export const workflowApi = {
  // Transition a metric value through the approval chain
  // action: 'submit' | 'reviewer_approve' | 'bu_approve' | 'subsidiary_approve' | 'group_approve' | 'publish' | 'reject'
  transition: (metricValueId, action, comment) =>
    api.post(`/workflow/metric-values/${metricValueId}/transition`, { action, comment }),

  // Get pending items for the logged-in role
  pending: (params) => api.get('/workflow/pending', { params }),

  // Aggregated counts by workflow status
  stats: (params) => api.get('/workflow/stats', { params }),
};

