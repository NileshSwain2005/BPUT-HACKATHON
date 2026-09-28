import React, { useEffect, useState } from 'react';
import { orgsApi } from '../../lib/api';
import { Building2, Plus, Edit2, Network, Globe, Mail, Phone, MapPin, ChevronRight, Layers } from 'lucide-react';

const ORG_TYPES = ['HOLDING', 'SUBSIDIARY', 'JOINT_VENTURE', 'DIVISION', 'SPV'];

export default function OrganizationSetup() {
  const [organizations, setOrganizations] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'tree'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'SUBSIDIARY',
    parentId: '',
    cin: '',
    pan: '',
    website: '',
    address: '',
    city: '',
    state: '',
    email: '',
    phone: '',
    description: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      orgsApi.list({ limit: 100 }),
      orgsApi.tree(),
    ])
      .then(([lRes, tRes]) => {
        setOrganizations(lRes.data.organizations || []);
        setTreeData(tRes.data.tree || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setForm({
      name: '',
      type: 'SUBSIDIARY',
      parentId: '',
      cin: '',
      pan: '',
      website: '',
      address: '',
      city: '',
      state: '',
      email: '',
      phone: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (org) => {
    setEditingOrg(org);
    setForm({
      name: org.name || '',
      type: org.type || 'SUBSIDIARY',
      parentId: org.parentId || '',
      cin: org.cin || '',
      pan: org.pan || '',
      website: org.website || '',
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      email: org.email || '',
      phone: org.phone || '',
      description: org.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await orgsApi.update(editingOrg.id, {
          name: form.name,
          website: form.website,
          address: form.address,
          city: form.city,
          state: form.state,
          email: form.email,
          phone: form.phone,
          description: form.description,
        });
      } else {
        await orgsApi.create({
          ...form,
          parentId: form.parentId || null,
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save organization');
    }
  };

  const renderTree = (nodes, depth = 0) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', paddingLeft: depth > 0 ? '1.5rem' : 0 }}>
        {nodes.map(node => (
          <div key={node.id} className="card" style={{ padding: '1rem', borderLeft: depth > 0 ? '3px solid var(--color-brand-500)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <Building2 size={20} className="text-brand" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{node.name}</div>
                  <div className="text-secondary" style={{ fontSize: '.75rem' }}>
                    Type: <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{node.type.toLowerCase().replace('_', ' ')}</span>
                    {node.cin && ` • CIN: ${node.cin}`}
                  </div>
                </div>
              </div>
              <button onClick={() => handleOpenEdit(node)} className="btn btn-secondary btn-sm" style={{ padding: '.25rem .5rem' }}>
                <Edit2 size={13} /> Edit
              </button>
            </div>
            {node.children && node.children.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Organization Setup</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Configure enterprise entities, holding structures, operating subsidiaries, and legal registries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')}
            className="btn btn-secondary btn-md"
          >
            {viewMode === 'list' ? <Network size={16} /> : <Layers size={16} />}
            {viewMode === 'list' ? 'Hierarchy Tree' : 'Table View'}
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-md">
            <Plus size={16} /> Add Entity
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : viewMode === 'tree' ? (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Enterprise Hierarchy</h3>
          {treeData.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hierarchy records found.
            </div>
          ) : (
            renderTree(treeData)
          )}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>Entities & Subsidiaries ({organizations.length})</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '.75rem 1rem' }}>Entity Name</th>
                  <th style={{ padding: '.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '.75rem 1rem' }}>Parent Entity</th>
                  <th style={{ padding: '.75rem 1rem' }}>CIN / PAN</th>
                  <th style={{ padding: '.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '.75rem 1rem' }}>Linked Projects</th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <Building2 size={16} className="text-brand" /> {org.name}
                      </div>
                      {org.website && (
                        <a href={org.website} target="_blank" rel="noreferrer" className="text-secondary" style={{ fontSize: '.75rem' }}>
                          {org.website}
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <span className="badge badge-primary">{org.type}</span>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>{org.parent?.name || <em className="text-secondary">Root (Parent)</em>}</td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div>CIN: {org.cin || '-'}</div>
                      <div className="text-secondary" style={{ fontSize: '.75rem' }}>PAN: {org.pan || '-'}</div>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      {org.city ? `${org.city}, ${org.state || ''}` : '-'}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <span className="badge badge-neutral">{org._count?.projects || 0} projects</span>
                    </td>
                    <td style={{ padding: '.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(org)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '.3rem .6rem' }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingOrg ? 'Edit Organization' : 'Register Legal Entity'}
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
                <label className="form-label">Legal Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. PRAVAAH Energy Ltd."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Entity Type *</label>
                  <select
                    className="form-control"
                    disabled={!!editingOrg}
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    {ORG_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Parent Entity</label>
                  <select
                    className="form-control"
                    disabled={!!editingOrg}
                    value={form.parentId}
                    onChange={e => setForm({ ...form, parentId: e.target.value })}
                  >
                    <option value="">None (Top-Level Entity)</option>
                    {organizations.filter(o => !editingOrg || o.id !== editingOrg.id).map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Corporate CIN</label>
                  <input
                    type="text"
                    disabled={!!editingOrg}
                    className="form-control"
                    placeholder="L12345MH2020PLC000000"
                    value={form.cin}
                    onChange={e => setForm({ ...form, cin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    disabled={!!editingOrg}
                    className="form-control"
                    placeholder="AAAAA0000A"
                    value={form.pan}
                    onChange={e => setForm({ ...form, pan: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Official Website</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="esg@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">State / Region</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Registered Office Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingOrg ? 'Save Changes' : 'Create Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
