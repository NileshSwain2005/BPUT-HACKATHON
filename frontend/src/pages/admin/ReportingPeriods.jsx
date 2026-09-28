import React, { useEffect, useState } from 'react';
import { brsrApi, orgsApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Calendar, Plus, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ReportingPeriods() {
  const [periods, setPeriods] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: 'FY 2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    boundary: 'STANDALONE',
    organizationId: '',
    isActive: true,
    isCurrent: false,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      brsrApi.getPeriods(),
      orgsApi.list({ limit: 100 }),
    ])
      .then(([pRes, oRes]) => {
        setPeriods(pRes.data.periods || []);
        const orgs = oRes.data.organizations || [];
        setOrganizations(orgs);
        if (orgs.length > 0 && !form.organizationId) {
          setForm(f => ({ ...f, organizationId: orgs[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await brsrApi.createPeriod({
        ...form,
        organizationId: form.organizationId || null,
      });
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reporting period');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Reporting Periods</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Configure financial years, regulatory submission cycles, and reporting boundaries
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-md">
          <Plus size={16} /> Add Cycle
        </button>
      </div>

      {/* Grid of Periods */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {periods.map(period => (
            <div
              key={period.id}
              className="card"
              style={{
                border: period.isCurrent ? '2px solid var(--color-brand-500)' : undefined,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {period.isCurrent && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--color-brand-500)', color: '#fff',
                  fontSize: '.7rem', fontWeight: 700, padding: '.2rem .8rem',
                  borderBottomLeftRadius: 8
                }}>
                  ACTIVE DISCLOSURE CYCLE
                </div>
              )}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: period.isCurrent ? 'var(--color-brand-100)' : 'var(--bg-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: period.isCurrent ? 'var(--color-brand-600)' : 'var(--text-secondary)'
                  }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{period.name}</h3>
                    <div className="text-secondary" style={{ fontSize: '.8rem' }}>
                      {period.organization?.name || 'All Entities'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.85rem', background: 'var(--bg-raised)', padding: '.75rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Timeline:</span>
                    <span style={{ fontWeight: 600 }}>{formatDate(period.startDate)} &rarr; {formatDate(period.endDate)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Boundary:</span>
                    <span className="badge badge-neutral">{period.boundary}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Status:</span>
                    <span>
                      {period.isActive ? (
                        <span className="badge badge-success">Accepting Entries</span>
                      ) : (
                        <span className="badge badge-neutral">Archived / Closed</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Create Reporting Cycle</div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Period Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2025-26"
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Entity Scope *</label>
                <select
                  className="form-control"
                  required
                  value={form.organizationId}
                  onChange={e => setForm({ ...form, organizationId: e.target.value })}
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Disclosure Boundary *</label>
                <select
                  className="form-control"
                  value={form.boundary}
                  onChange={e => setForm({ ...form, boundary: e.target.value })}
                >
                  <option value="STANDALONE">Standalone Entity</option>
                  <option value="CONSOLIDATED">Consolidated Group</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={e => setForm({ ...form, isCurrent: e.target.checked })}
                  />
                  <span>Set as Current / Default reporting period</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Allow metric entries and responses (Active)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
