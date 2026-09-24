import React, { useEffect, useState } from 'react';
import { usersApi, orgsApi } from '../../lib/api';
import { ROLES, formatRole, formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Search, Edit2, ShieldAlert, CheckCircle2, XCircle, Filter, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DATA_CONTRIBUTOR',
    organizationId: '',
    designation: '',
    department: '',
    phone: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      usersApi.list({ search: search || undefined, role: roleFilter || undefined, limit: 100 }),
      orgsApi.list({ limit: 100 }),
    ])
      .then(([uRes, oRes]) => {
        setUsers(uRes.data.users || []);
        setOrganizations(oRes.data.organizations || []);
        if (oRes.data.organizations?.length > 0 && !form.organizationId) {
          setForm(f => ({ ...f, organizationId: oRes.data.organizations[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'DATA_CONTRIBUTOR',
      organizationId: organizations[0]?.id || '',
      designation: '',
      department: '',
      phone: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'DATA_CONTRIBUTOR',
      organizationId: user.organization?.id || '',
      designation: user.designation || '',
      department: user.department || '',
      phone: user.phone || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          name: form.name,
          role: form.role,
          organizationId: form.organizationId || null,
          designation: form.designation,
          department: form.department,
          phone: form.phone,
        });
      } else {
        await usersApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleToggleActive = async (user) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    const confirmMsg = user.isActive ? `Deactivate ${user.name}?` : `Reactivate ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.update(user.id, { isActive: true });
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>User Management</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Manage platform accounts, role-based access control, and organization assignments
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary btn-md">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '.5rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Filter size={16} className="text-secondary" />
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles (11)</option>
              {Object.keys(ROLES).map(r => (
                <option key={r} value={r}>{formatRole(r)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Registered Users ({users.length})</div>
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
                  <th style={{ padding: '.75rem 1rem' }}>User</th>
                  <th style={{ padding: '.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '.75rem 1rem' }}>Organization</th>
                  <th style={{ padding: '.75rem 1rem' }}>Department / Title</th>
                  <th style={{ padding: '.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '.75rem 1rem' }}>Last Login</th>
                  <th style={{ padding: '.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="text-secondary" style={{ fontSize: '.75rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <span className="badge badge-primary">{formatRole(u.role)}</span>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>{u.organization?.name || '-'}</td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div>{u.designation || '-'}</div>
                      <div className="text-secondary" style={{ fontSize: '.75rem' }}>{u.department}</div>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      {u.isActive ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }} className="text-secondary">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td style={{ padding: '.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '.3rem .6rem' }}
                          title="Edit user"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`btn ${u.isActive ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                          style={{ padding: '.3rem .6rem' }}
                          title={u.isActive ? 'Deactivate user' : 'Reactivate user'}
                        >
                          {u.isActive ? <Trash2 size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingUser ? 'Edit User' : 'Create New Platform User'}
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
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  className="form-control"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    {Object.keys(ROLES).map(r => (
                      <option key={r} value={r}>{formatRole(r)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Organization</label>
                  <select
                    className="form-control"
                    value={form.organizationId}
                    onChange={e => setForm({ ...form, organizationId: e.target.value })}
                  >
                    <option value="">None</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Designation / Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
