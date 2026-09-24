import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '../../lib/api';
import { formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '../../lib/utils';
import { ArrowLeft, MapPin, Building2, Calendar, BarChart3, Users, FileText, Shield, Globe, Edit2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([projectsApi.get(id), projectsApi.stats(id)])
      .then(([p, s]) => { setProject(p.data.project); setStats(s.data.stats); })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;
  if (!project) return null;

  const tabs = ['overview', 'team', 'sdg'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button + header */}
      <div>
        <button onClick={() => navigate('/projects')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{project.name}</h2>
              <span className={`badge ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span>
            </div>
            {project.code && <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--text-muted)', background: 'var(--bg-raised)', padding: '.2rem .6rem', borderRadius: 6 }}>{project.code}</span>}
          </div>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <Link to={`/brsr?projectId=${project.id}`} className="btn btn-secondary btn-sm"><Shield size={15} /> BRSR</Link>
            <Link to={`/esg-metrics?projectId=${project.id}`} className="btn btn-secondary btn-sm"><BarChart3 size={15} /> Metrics</Link>
            <Link to={`/evidence?projectId=${project.id}`} className="btn btn-primary btn-sm"><FileText size={15} /> Evidence</Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Documents', value: stats?.docCount ?? 0, color: '#3b82f6' },
          { label: 'Evidence Items', value: stats?.evidenceCount ?? 0, sub: `${stats?.verifiedEvidence ?? 0} verified`, color: '#2a9d7c' },
          { label: 'ESG Metrics', value: stats?.metricCount ?? 0, sub: `${stats?.verifiedMetrics ?? 0} verified`, color: '#f59e0b' },
          { label: 'BRSR Responses', value: (stats?.brsrResponses?.reduce((a, b) => a + b._count, 0)) ?? 0, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs" style={{ padding: '0 1.5rem' }}>
          {tabs.map(t => <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>)}
        </div>
        <div className="card-body">
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Project Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {[
                    { label: 'Organization', value: project.organization?.name, icon: Building2 },
                    { label: 'Location', value: `${project.location || ''}${project.state ? ', ' + project.state : ''}`, icon: MapPin },
                    { label: 'Sector', value: project.sector, icon: BarChart3 },
                    { label: 'Sub-sector', value: project.subsector },
                    { label: 'Start Date', value: formatDate(project.startDate), icon: Calendar },
                    { label: 'End Date', value: project.endDate ? formatDate(project.endDate) : 'Ongoing' },
                    { label: 'Budget', value: project.budget ? formatCurrency(project.budget) : '—' },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 600, width: 110, flexShrink: 0 }}>{f.label}</span>
                      <span style={{ fontSize: '.875rem', color: 'var(--text-primary)' }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {project.description && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Description</h4>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{project.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Assigned Team Members</h4>
              {project.users?.length === 0 ? (
                <div className="empty-state"><Users size={32} style={{ color: 'var(--text-muted)' }} /><p className="text-secondary">No users assigned to this project</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem' }}>
                  {project.users?.map(pu => (
                    <div key={pu.userId} style={{ padding: '.875rem', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 }}>
                        {pu.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{pu.user?.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{pu.user?.role?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sdg' && (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>SDG Alignments</h4>
              {project.sdgMappings?.length === 0 ? (
                <div className="empty-state"><Globe size={32} style={{ color: 'var(--text-muted)' }} /><p className="text-secondary">No SDG mappings yet. <Link to="/sdg" style={{ color: 'var(--color-brand-600)' }}>Add mappings</Link></p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {project.sdgMappings?.map(s => (
                    <div key={s.id} style={{ padding: '1rem', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#2a9d7c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '.85rem', flexShrink: 0 }}>SDG{s.sdgNumber}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{s.sdgName}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>{s.activity}</div>
                        {s.description && <div style={{ fontSize: '.775rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{s.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
