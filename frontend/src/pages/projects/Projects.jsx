import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '../../lib/api';
import { formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, MapPin, Building2, Calendar, BarChart3, FileText, Filter } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];

export default function Projects() {
  const { hasMinRole } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, status: status !== 'ALL' ? status : undefined };
      const { data } = await projectsApi.list(params);
      setProjects(data.projects);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Projects</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>{total} project{total !== 1 ? 's' : ''} in your scope</p>
        </div>
        {hasMinRole('BU_MANAGER') && (
          <Link to="/projects/new" className="btn btn-primary btn-md">
            <Plus size={17} /> New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: '.375rem' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`} style={{ minWidth: 70 }}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="card"><div className="empty-state"><Building2 size={40} style={{ color: 'var(--text-muted)' }} /><div><h3>No projects found</h3><p className="text-secondary">Try adjusting your filters or create a new project</p></div></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {projects.map(p => (
            <div key={p.id} className="card" style={{ cursor: 'pointer', transition: 'transform .2s' }}
              onClick={() => navigate(`/projects/${p.id}`)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {/* Card top color */}
              <div style={{ height: 4, background: `linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))`, borderRadius: '16px 16px 0 0' }} />
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.875rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>{p.name}</div>
                    {p.code && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{p.code}</div>}
                  </div>
                  <span className={`badge ${PROJECT_STATUS_COLORS[p.status]}`}>{p.status}</span>
                </div>

                {p.description && <p className="text-secondary truncate-2" style={{ fontSize: '.825rem', lineHeight: 1.6, marginBottom: '.875rem' }}>{p.description}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                  {p.location && <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><MapPin size={13} color="var(--text-muted)" />{p.location}</div>}
                  {p.sector && <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><Building2 size={13} color="var(--text-muted)" />{p.sector}{p.subsector && ` · ${p.subsector}`}</div>}
                  {p.startDate && <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><Calendar size={13} color="var(--text-muted)" />Started {formatDate(p.startDate)}</div>}
                  {p.budget && <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><BarChart3 size={13} color="var(--text-muted)" />Budget: {formatCurrency(p.budget)}</div>}
                </div>

                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p._count?.documents ?? 0}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Documents</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p._count?.evidence ?? 0}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Evidence</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p._count?.esgMetricValues ?? 0}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Metrics</div>
                  </div>
                </div>

                <div style={{ marginTop: '.875rem' }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>{p.organization?.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
