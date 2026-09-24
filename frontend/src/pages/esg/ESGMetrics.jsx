import React, { useEffect, useState } from 'react';
import { esgApi, projectsApi, brsrApi } from '../../lib/api';
import { formatNumber, ROLE_LABELS } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, CheckCircle, Clock, Search, Filter, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  ENVIRONMENT: '#2a9d7c', ENERGY: '#f59e0b', WATER: '#3b82f6',
  EMISSIONS: '#ef4444', WASTE: '#8b5cf6', EMPLOYEE: '#10b981',
  HEALTH_SAFETY: '#dc2626', GOVERNANCE: '#6366f1', COMMUNITY: '#ec4899',
};

export default function ESGMetrics() {
  const { hasMinRole } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [values, setValues] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('values');

  useEffect(() => {
    Promise.all([
      esgApi.listMetrics(),
      brsrApi.getPeriods(),
      projectsApi.list({ limit: 100 }),
    ]).then(([m, p, pr]) => {
      setMetrics(m.data.metrics);
      setPeriods(p.data.periods);
      setProjects(pr.data.projects);
      if (p.data.periods.length > 0) {
        const curr = p.data.periods.find(p => p.isCurrent) || p.data.periods[0];
        setSelectedPeriod(curr.id);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    esgApi.listValues({ reportingPeriodId: selectedPeriod, projectId: selectedProject || undefined, ...(category ? {} : {}) })
      .then(r => setValues(r.data.values));
  }, [selectedPeriod, selectedProject, category]);

  const byCategory = metrics.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const chartData = Object.entries(byCategory).map(([cat, ms]) => ({
    category: cat.replace('_', ' '),
    total: ms.length,
    filled: values.filter(v => ms.some(m => m.id === v.metricId)).length,
    color: CATEGORY_COLORS[cat] || '#64748b',
  }));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>ESG Metrics</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>{metrics.length} metric definitions · {values.length} data points entered</p>
        </div>
        {hasMinRole('DATA_CONTRIBUTOR') && (
          <a href="/esg-metrics/entry" className="btn btn-primary btn-md"><BarChart3 size={17} /> Enter Data</a>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ maxWidth: 220 }} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
          {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: 220 }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700 }}>Metric Coverage by Category</div></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10 }} />
              <Bar dataKey="total" name="Total Metrics" radius={[4,4,0,0]}>
                {chartData.map((d, i) => <Cell key={i} fill={`${d.color}40`} />)}
              </Bar>
              <Bar dataKey="filled" name="Data Entered" radius={[4,4,0,0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Values table */}
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700 }}>Metric Values</div>
          <span className="badge badge-brand">{values.length} entries</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {values.length === 0 ? (
            <div className="empty-state"><TrendingUp size={40} style={{ color: 'var(--text-muted)' }} /><div><h3>No data entered yet</h3><p className="text-secondary">Submit metric values for the selected period</p></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Category</th>
                  <th>Project</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {values.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{v.metric?.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.metric?.code}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '.75rem', fontWeight: 600, padding: '.2rem .6rem', borderRadius: 99, background: `${CATEGORY_COLORS[v.metric?.category] || '#64748b'}18`, color: CATEGORY_COLORS[v.metric?.category] || 'var(--text-muted)' }}>
                        {v.metric?.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>{v.project?.name}</td>
                    <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{formatNumber(v.value)}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{v.metric?.unit || v.unit || '—'}</td>
                    <td>
                      {v.isVerified || v.workflowStatus === 'PUBLISHED' ? (
                        <span className="badge badge-green"><CheckCircle size={10} /> Published & Verified</span>
                      ) : v.workflowStatus === 'PM_APPROVED' ? (
                        <span className="badge badge-blue"><Clock size={10} /> PM Validated</span>
                      ) : v.workflowStatus === 'REVIEWER_APPROVED' ? (
                        <span className="badge badge-blue"><Clock size={10} /> Reviewer Approved</span>
                      ) : v.workflowStatus === 'BU_APPROVED' ? (
                        <span className="badge badge-blue"><Clock size={10} /> BU Approved</span>
                      ) : v.workflowStatus === 'SUBSIDIARY_APPROVED' ? (
                        <span className="badge badge-blue"><Clock size={10} /> Subsidiary Approved</span>
                      ) : v.workflowStatus === 'GROUP_APPROVED' ? (
                        <span className="badge badge-green"><Clock size={10} /> Group Approved</span>
                      ) : v.workflowStatus === 'SUBMITTED' ? (
                        <span className="badge badge-yellow"><Clock size={10} /> Submitted to PM</span>
                      ) : v.workflowStatus === 'REVISION_REQUESTED' ? (
                        <span className="badge badge-red">Revision Needed</span>
                      ) : (
                        <span className="badge badge-gray">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
