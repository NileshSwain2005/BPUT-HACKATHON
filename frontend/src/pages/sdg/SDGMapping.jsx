import React, { useEffect, useState } from 'react';
import { sdgApi, projectsApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { SDG_COLORS } from '../../lib/utils';
import { Globe, Plus, Trash2 } from 'lucide-react';

const SDG_NAMES = {
  1:'No Poverty',2:'Zero Hunger',3:'Good Health',4:'Quality Education',5:'Gender Equality',
  6:'Clean Water',7:'Clean Energy',8:'Decent Work',9:'Innovation',10:'Reduced Inequalities',
  11:'Sustainable Cities',12:'Responsible Consumption',13:'Climate Action',14:'Life Below Water',
  15:'Life on Land',16:'Peace & Justice',17:'Partnerships',
};

export default function SDGMapping() {
  const { hasMinRole } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [summary, setSummary] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([sdgApi.list(), sdgApi.summary(), projectsApi.list({ limit: 100 })])
      .then(([m, s, p]) => { setMappings(m.data.mappings); setSummary(s.data.summary); setProjects(p.data.projects); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deletMapping = async (id) => {
    if (!confirm('Delete this SDG mapping?')) return;
    await sdgApi.delete(id);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>SDG Mapping</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>Align organizational activities to the UN Sustainable Development Goals</p>
        </div>
        {hasMinRole('DATA_CONTRIBUTOR') && (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-md"><Plus size={17} /> Add Mapping</button>
        )}
      </div>

      {/* SDG wheel / grid */}
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700 }}>SDG Coverage ({summary.length} / 17 aligned)</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '.75rem' }}>
            {Array.from({ length: 17 }, (_, i) => i + 1).map(n => {
              const inSummary = summary.find(s => s.sdgNumber === n);
              const color = SDG_COLORS[n];
              return (
                <div key={n} style={{
                  padding: '.875rem .5rem', borderRadius: 12, textAlign: 'center',
                  background: inSummary ? `${color}20` : 'var(--bg-raised)',
                  border: `1.5px solid ${inSummary ? color : 'var(--border-color)'}`,
                  opacity: inSummary ? 1 : 0.5, transition: 'all .2s',
                }}>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem', color: inSummary ? color : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>{n}</div>
                  <div style={{ fontSize: '.62rem', color: inSummary ? color : 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{SDG_NAMES[n]}</div>
                  {inSummary && <div style={{ fontSize: '.6rem', fontWeight: 700, color, marginTop: 4 }}>{inSummary.count} activity</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mappings table */}
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700 }}>Activity Mappings</div><span className="badge badge-brand">{mappings.length}</span></div>
        <div style={{ overflowX: 'auto' }}>
          {mappings.length === 0 ? (
            <div className="empty-state"><Globe size={36} style={{ color: 'var(--text-muted)' }} /><p className="text-secondary">No SDG mappings yet</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>SDG</th><th>Activity</th><th>Description</th><th>Project</th><th>Contribution</th><th></th></tr></thead>
              <tbody>
                {mappings.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: SDG_COLORS[m.sdgNumber], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '.8rem', flexShrink: 0 }}>
                          {m.sdgNumber}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{m.sdgName}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '.875rem' }}>{m.activity}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-secondary)', maxWidth: 200 }} className="truncate-2">{m.description || '—'}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{m.project?.name || '—'}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{m.contribution || '—'}</td>
                    <td>
                      {hasMinRole('GROUP_ESG_MANAGER') && (
                        <button onClick={() => deletMapping(m.id)} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && <AddSDGModal projects={projects} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}

function AddSDGModal({ projects, onClose, onSaved }) {
  const [form, setForm] = useState({ sdgNumber: '', activity: '', description: '', contribution: '', target: '', projectId: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.sdgNumber || !form.activity) return;
    setSaving(true);
    try { await sdgApi.create(form); onSaved(); } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-md">
        <div className="modal-header"><h3 style={{ fontWeight: 700 }}>Add SDG Mapping</h3><button className="btn btn-ghost btn-icon-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label form-required">SDG Number</label>
              <select className="form-select" value={form.sdgNumber} onChange={e => set('sdgNumber', e.target.value)}>
                <option value="">Select SDG</option>
                {Array.from({ length: 17 }, (_, i) => i + 1).map(n => <option key={n} value={n}>SDG {n} — {SDG_NAMES[n]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project</label>
              <select className="form-select" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                <option value="">Not project-specific</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label form-required">Activity</label>
            <input className="form-input" value={form.activity} onChange={e => set('activity', e.target.value)} placeholder="e.g. Solar power plant reducing emissions" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contribution Description</label>
            <input className="form-input" value={form.contribution} onChange={e => set('contribution', e.target.value)} placeholder="How does this activity contribute to the SDG?" />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={submit} className="btn btn-primary btn-md" disabled={saving || !form.sdgNumber || !form.activity}>
            {saving ? <span className="spinner spinner-sm" /> : null} Add Mapping
          </button>
        </div>
      </div>
    </div>
  );
}
