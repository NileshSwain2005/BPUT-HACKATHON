import React, { useEffect, useState } from 'react';
import { targetsApi } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Target, Plus, Edit2, Trash2, CheckCircle2, Clock, Filter, TrendingUp } from 'lucide-react';

const CATEGORIES = ['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'];

export default function Targets() {
  const { hasMinRole } = useAuth();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'ENVIRONMENTAL',
    principleCode: 'P6',
    baseline: '',
    baselineYear: '2023',
    targetValue: '',
    targetYear: '2030',
    currentValue: '',
    unit: '%',
    isAchieved: false,
  });

  const loadData = () => {
    setLoading(true);
    targetsApi.list({ category: categoryFilter || undefined })
      .then(res => setTargets(res.data.targets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleOpenCreate = () => {
    setEditingTarget(null);
    setForm({
      title: '',
      description: '',
      category: 'ENVIRONMENTAL',
      principleCode: 'P6',
      baseline: '',
      baselineYear: '2023',
      targetValue: '',
      targetYear: '2030',
      currentValue: '',
      unit: '%',
      isAchieved: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTarget(t);
    setForm({
      title: t.title || '',
      description: t.description || '',
      category: t.category || 'ENVIRONMENTAL',
      principleCode: t.principleCode || 'P6',
      baseline: t.baseline ?? '',
      baselineYear: t.baselineYear || '',
      targetValue: t.targetValue ?? '',
      targetYear: t.targetYear || '',
      currentValue: t.currentValue ?? '',
      unit: t.unit || '',
      isAchieved: !!t.isAchieved,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        principleCode: form.principleCode,
        baseline: form.baseline !== '' && form.baseline !== null ? Number(form.baseline) : null,
        baselineYear: form.baselineYear,
        targetValue: form.targetValue !== '' && form.targetValue !== null ? Number(form.targetValue) : null,
        targetYear: form.targetYear,
        currentValue: form.currentValue !== '' && form.currentValue !== null ? Number(form.currentValue) : null,
        unit: form.unit,
        isAchieved: form.isAchieved,
      };
      if (editingTarget) {
        await targetsApi.update(editingTarget.id, payload);
      } else {
        await targetsApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save target');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this target?')) return;
    try {
      await targetsApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete target');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>ESG Targets & Goals</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Set, monitor, and report long-term sustainability commitments and interim milestones
          </p>
        </div>
        {hasMinRole('BU_MANAGER') && (
          <button onClick={handleOpenCreate} className="btn btn-primary btn-md">
            <Plus size={16} /> Add Target
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Filter size={16} className="text-secondary" />
            <span className="text-secondary" style={{ fontSize: '.85rem' }}>Pillar:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Pillars (E, S, G)</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Targets */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {targets.map(target => {
            const pillarColor =
              target.category === 'ENVIRONMENTAL' ? '#10b981' :
              target.category === 'SOCIAL' ? '#3b82f6' : '#8b5cf6';
            const progress = target.progress ?? 0;

            return (
              <div key={target.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem' }}>
                    <span className="badge" style={{ background: `${pillarColor}20`, color: pillarColor, fontWeight: 700 }}>
                      {target.category} {target.principleCode ? `• ${target.principleCode}` : ''}
                    </span>
                    {target.isAchieved ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                        <CheckCircle2 size={12} /> Achieved
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                        <Clock size={12} /> Target {target.targetYear || ''}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '.75rem' }}>{target.title}</h3>
                  {target.description && (
                    <p className="text-secondary" style={{ fontSize: '.8rem', marginTop: '.25rem' }}>
                      {target.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: '.35rem' }}>
                      <span className="text-secondary">Progress</span>
                      <span style={{ fontWeight: 700 }}>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-raised)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, progress))}%`,
                          height: '100%',
                          background: pillarColor,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Numerical stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', marginTop: '1.25rem', textAlign: 'center', background: 'var(--bg-raised)', padding: '.75rem', borderRadius: 8 }}>
                    <div>
                      <div className="text-secondary" style={{ fontSize: '.7rem' }}>Baseline ({target.baselineYear || '-'})</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>
                        {target.baseline !== null ? target.baseline : '-'} {target.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary" style={{ fontSize: '.7rem' }}>Current</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: pillarColor }}>
                        {target.currentValue !== null ? target.currentValue : '-'} {target.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary" style={{ fontSize: '.7rem' }}>Goal ({target.targetYear || '-'})</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>
                        {target.targetValue !== null ? target.targetValue : '-'} {target.unit}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '1.25rem', paddingTop: '.75rem', borderTop: '1px solid var(--border-color)' }}>
                  {hasMinRole('BU_MANAGER') && (
                    <button onClick={() => handleOpenEdit(target)} className="btn btn-secondary btn-sm" style={{ padding: '.3rem .6rem' }}>
                      <Edit2 size={14} /> Update
                    </button>
                  )}
                  {hasMinRole('ESG_ADMIN') && (
                    <button onClick={() => handleDelete(target.id)} className="btn btn-danger btn-sm" style={{ padding: '.3rem .6rem' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingTarget ? 'Update Target' : 'Establish Sustainability Target'}
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Target Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Renewable Electricity Across All Sites"
                  className="form-control"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Description / Strategic Context</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">ESG Pillar *</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">BRSR Principle</label>
                  <input
                    type="text"
                    placeholder="e.g. P6"
                    className="form-control"
                    value={form.principleCode}
                    onChange={e => setForm({ ...form, principleCode: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Measurement Unit</label>
                  <input
                    type="text"
                    placeholder="%, tCO2e, KL, MWh"
                    className="form-control"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Target Year</label>
                  <input
                    type="text"
                    placeholder="2030"
                    className="form-control"
                    value={form.targetYear}
                    onChange={e => setForm({ ...form, targetYear: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Baseline Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={form.baseline}
                    onChange={e => setForm({ ...form, baseline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Baseline Year</label>
                  <input
                    type="text"
                    placeholder="2023"
                    className="form-control"
                    value={form.baselineYear}
                    onChange={e => setForm({ ...form, baselineYear: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Target Goal Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Current Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={form.currentValue}
                    onChange={e => setForm({ ...form, currentValue: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>
                  <input
                    type="checkbox"
                    checked={form.isAchieved}
                    onChange={e => setForm({ ...form, isAchieved: e.target.checked })}
                  />
                  <span>Mark as Officially Achieved</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingTarget ? 'Update Target' : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
