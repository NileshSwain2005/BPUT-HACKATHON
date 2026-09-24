import React, { useEffect, useState } from 'react';
import { evidenceApi, documentsApi, projectsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { EVIDENCE_STATUS_COLORS, formatDate } from '../../lib/utils';
import { Plus, Search, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

export default function EvidenceCenter() {
  const { hasMinRole } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [total, setTotal] = useState(0);

  const load = () => {
    evidenceApi.list({ search: search || undefined, status: statusFilter || undefined, projectId: projectFilter || undefined })
      .then(r => { setEvidence(r.data.evidence); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, projectFilter]);
  useEffect(() => { projectsApi.list({ limit: 100 }).then(r => setProjects(r.data.projects)); }, []);

  const verify = async (id) => {
    await evidenceApi.verify(id);
    load();
  };

  const reject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    await evidenceApi.reject(id, reason);
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Evidence Management</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>{total} evidence records — secure chain of custody for BRSR disclosures</p>
        </div>
        {hasMinRole('DATA_CONTRIBUTOR') && (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-md" style={{ borderRadius: 10, gap: '.5rem' }}>
            <Plus size={17} /> Upload Evidence
          </button>
        )}
      </div>

      {/* Pill tabs matching reference UI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All Evidence
          </button>
          <button
            type="button"
            className={`tab-pill ${statusFilter === 'PENDING_VERIFICATION' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING_VERIFICATION')}
          >
            Pending Review
          </button>
          <button
            type="button"
            className={`tab-pill ${statusFilter === 'VERIFIED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('VERIFIED')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`tab-pill ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected
          </button>
        </div>

        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search evidence…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, borderRadius: 9999, background: '#ffffff' }}
            />
          </div>
          <select className="form-select" style={{ maxWidth: 180, borderRadius: 10, background: '#ffffff' }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ background: '#ffffff', borderRadius: 18, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
          ) : evidence.length === 0 ? (
            <div className="empty-state"><FileText size={40} style={{ color: 'var(--text-muted)' }} /><div><h3>No evidence found</h3><p className="text-secondary">Add evidence items to link to BRSR disclosures</p></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>File Name / Title</th><th>Project</th><th>Document</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {evidence.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        {e.title}
                      </div>
                      {e.description && <div className="text-muted" style={{ fontSize: '.72rem', marginTop: 2, paddingLeft: 24 }}>{e.description}</div>}
                      {e._count?.brsrLinks > 0 && <div style={{ fontSize: '.65rem', color: '#15803d', fontWeight: 600, marginTop: 2, paddingLeft: 24 }}>{e._count.brsrLinks} BRSR link{e._count.brsrLinks > 1 ? 's' : ''}</div>}
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{e.project?.name || '—'}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                      {e.document ? <span>{e.document.name}</span> : '—'}
                    </td>
                    <td>
                      <span className={`badge ${EVIDENCE_STATUS_COLORS[e.status]}`}>
                        {e.status === 'VERIFIED' ? 'Approved' : e.status === 'PENDING_VERIFICATION' ? 'Pending' : e.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{formatDate(e.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '.25rem .75rem', fontSize: '.78rem', borderRadius: 8 }}>
                          View
                        </button>
                        {hasMinRole('ESG_REVIEWER') && e.status !== 'VERIFIED' && e.status !== 'REJECTED' && (
                          <>
                            <button onClick={() => verify(e.id)} className="btn btn-sm" style={{ background: '#def7ec', color: '#15803d', border: '1px solid #bbf7d0', padding: '.25rem .55rem', borderRadius: 8 }} title="Approve">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => reject(e.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '.25rem .55rem', borderRadius: 8 }} title="Reject">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Evidence Modal */}
      {showCreate && <AddEvidenceModal projects={projects} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}

function AddEvidenceModal({ projects, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', projectId: '', pageReference: '', sectionRef: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await evidenceApi.create(form);
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Add Evidence</h3>
          <button className="btn btn-ghost btn-icon-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label form-required">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual ESG Report 2025 — Emissions Section" />
          </div>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-select" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
              <option value="">No specific project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Page Reference</label>
              <input className="form-input" placeholder="e.g. p. 42-45" value={form.pageReference} onChange={e => setForm(f => ({ ...f, pageReference: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Section Reference</label>
              <input className="form-input" placeholder="e.g. 3.2 GHG Emissions" value={form.sectionRef} onChange={e => setForm(f => ({ ...f, sectionRef: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of evidence…" />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={submit} className="btn btn-primary btn-md" disabled={saving || !form.title}>
            {saving ? <span className="spinner spinner-sm" /> : null}
            Add Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
