import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, usersApi } from '../../lib/api';
import { formatRole, formatDate } from '../../lib/utils';
import { User, Shield, Building, Mail, Phone, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();

  // Profile details state
  const [name, setName] = useState(user?.name || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await usersApi.update(user.id, { name, designation, department, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      if (refreshUser) await refreshUser();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      setPwdMsg({ type: 'success', text: res.data.message || 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Account Settings & Profile</h2>
        <p className="text-secondary" style={{ fontSize: '.875rem' }}>
          Manage your personal credentials, organizational assignments, and security settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-raised) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-brand-500)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.name}</h3>
              <span className="badge badge-primary">{formatRole(user?.role)}</span>
              {user?.organization && (
                <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                  <Building size={12} /> {user.organization.name}
                </span>
              )}
            </div>
            <div className="text-secondary" style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
              {user?.email} • Member since {formatDate(user?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Personal Details Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <User size={18} className="text-brand" /> Personal Information
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profileMsg.text && (
              <div style={{
                padding: '.75rem', borderRadius: 8, fontSize: '.85rem',
                background: profileMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: profileMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                border: `1px solid ${profileMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
              }}>
                {profileMsg.text}
              </div>
            )}

            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || ''}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Designation / Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="submit" disabled={profileSaving} className="btn btn-primary btn-sm">
                <Save size={15} /> {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Lock size={18} className="text-brand" /> Change Password
            </div>
          </div>
          <form onSubmit={handleChangePassword} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pwdMsg.text && (
              <div style={{
                padding: '.75rem', borderRadius: 8, fontSize: '.85rem',
                background: pwdMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: pwdMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                border: `1px solid ${pwdMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
              }}>
                {pwdMsg.text}
              </div>
            )}

            <div>
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                required
                className="form-control"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">New Password * (Min 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-control"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-control"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button type="submit" disabled={pwdSaving} className="btn btn-primary btn-sm">
                <Lock size={15} /> {pwdSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
