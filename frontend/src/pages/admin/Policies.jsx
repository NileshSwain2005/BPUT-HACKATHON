import React, { useEffect, useState } from 'react';
import { policiesApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Plus, Edit2, Trash2, ExternalLink, Filter, CheckCircle2, Clock, FileText } from 'lucide-react';

const BRSR_PRINCIPLES = [
  { code: 'P1', title: 'P1: Ethics, Transparency & Accountability' },
  { code: 'P2', title: 'P2: Sustainable & Safe Goods & Services' },
  { code: 'P3', title: 'P3: Employee Well-being & Human Capital' },
  { code: 'P4', title: 'P4: Stakeholder Engagement & Responsiveness' },
  { code: 'P5', title: 'P5: Human Rights' },
  { code: 'P6', title: 'P6: Protection & Restoration of Environment' },
  { code: 'P7', title: 'P7: Responsible Public & Regulatory Policy' },
  { code: 'P8', title: 'P8: Inclusive Growth & Equitable Development' },
  { code: 'P9', title: 'P9: Consumer Value & Responsible Engagement' },
];

export default function Policies() {
  const { hasMinRole } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [principleFilter, setPrincipleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    principlesCovered: [],
    policyOwner: '',
    approvedDate: '',
    reviewDate: '',
    documentUrl: '',
    isActive: true,
  });

  const loadData = () => {
    setLoading(true);
    policiesApi.list({ principleCode: principleFilter || undefined })
      .then(res => setPolicies(res.data.policies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [principleFilter]);

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setForm({
      name: '',
      description: '',
      principlesCovered: [],
      policyOwner: '',
      approvedDate: '',
      reviewDate: '',
      documentUrl: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPolicy(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      principlesCovered: p.principlesCovered || [],
      policyOwner: p.policyOwner || '',
      approvedDate: p.approvedDate ? p.approvedDate.split('T')[0] : '',
      reviewDate: p.reviewDate ? p.reviewDate.split('T')[0] : '',
      documentUrl: p.documentUrl || '',
      isActive: p.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        principlesCovered: form.principlesCovered || [],
        policyOwner: form.policyOwner,
        approvedDate: form.approvedDate || null,
        reviewDate: form.reviewDate || null,
        documentUrl: form.documentUrl,
        isActive: form.isActive !== false,
      };
      if (editingPolicy) {
        await policiesApi.update(editingPolicy.id, payload);
      } else {
        await policiesApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save policy');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    try {
      await policiesApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  const togglePrinciple = (pCode) => {
    const prev = form.principlesCovered || [];
    if (prev.includes(pCode)) {
      setForm({ ...form, principlesCovered: prev.filter(c => c !== pCode) });
    } else {
      setForm({ ...form, principlesCovered: [...prev, pCode] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Corporate ESG Policies</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Board-approved governance charters, ESG frameworks, and BRSR principle alignments
          </p>
        </div>
        {hasMinRole('BU_MANAGER') && (
          <button onClick={handleOpenCreate} className="btn btn-primary btn-md">
            <Plus size={16} /> Add Policy
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Filter size={16} className="text-secondary" />
            <span className="text-secondary" style={{ fontSize: '.85rem' }}>BRSR Principle:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
              value={principleFilter}
              onChange={e => setPrincipleFilter(e.target.value)}
            >
              <option value="">All Principles (P1 - P9)</option>
              {BRSR_PRINCIPLES.map(p => (
                <option key={p.code} value={p.code}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Corporate Policies ({policies.length})</div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '.75rem 1rem' }}>Policy Title</th>
                  <th style={{ padding: '.75rem 1rem' }}>Covered Principles</th>
                  <th style={{ padding: '.75rem 1rem' }}>Owner</th>
                  <th style={{ padding: '.75rem 1rem' }}>Approved Date</th>
                  <th style={{ padding: '.75rem 1rem' }}>Next Review</th>
                  <th style={{ padding: '.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <FileText size={16} className="text-brand" /> {p.name}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '.75rem', marginTop: '.2rem' }}>
                        {p.description}
                      </div>
                      {p.documentUrl && (
                        <a href={p.documentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '.75rem', display: 'inline-flex', alignItems: 'center', gap: '.25rem', color: 'var(--color-brand-500)', marginTop: '.25rem' }}>
                          View Document <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                        {p.principlesCovered?.map(c => (
                          <span key={c} className="badge badge-neutral" style={{ fontSize: '.7rem', fontWeight: 700 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>{p.policyOwner || '-'}</td>
                    <td style={{ padding: '.75rem 1rem' }} className="text-secondary">{formatDate(p.approvedDate)}</td>
                    <td style={{ padding: '.75rem 1rem' }} className="text-secondary">{formatDate(p.reviewDate)}</td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      {p.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-neutral">Inactive</span>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                        {hasMinRole('BU_MANAGER') && (
                          <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm" style={{ padding: '.3rem .6rem' }}>
                            <Edit2 size={13} />
                          </button>
                        )}
                        {hasMinRole('ESG_ADMIN') && (
                          <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm" style={{ padding: '.3rem .6rem' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingPolicy ? 'Edit Corporate Policy' : 'Register Corporate Policy'}
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
                <label className="form-label">Policy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anti-Bribery & Corruption Policy"
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Summary / Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Covered BRSR Principles</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.4rem', marginTop: '.25rem' }}>
                  {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map(code => {
                    const selected = form.principlesCovered?.includes(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => togglePrinciple(code)}
                        className={`btn ${selected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{ fontSize: '.8rem', padding: '.3rem' }}
                      >
                        Principle {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Policy Owner / Custodian</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Ethics Officer"
                    className="form-control"
                    value={form.policyOwner}
                    onChange={e => setForm({ ...form, policyOwner: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Document Link (URL)</label>
                  <input
                    type="url"
                    placeholder="https://company.com/policy.pdf"
                    className="form-control"
                    value={form.documentUrl}
                    onChange={e => setForm({ ...form, documentUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Approved Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.approvedDate}
                    onChange={e => setForm({ ...form, approvedDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Next Review Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.reviewDate}
                    onChange={e => setForm({ ...form, reviewDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.9rem' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Policy is currently active</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingPolicy ? 'Save Changes' : 'Register Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
