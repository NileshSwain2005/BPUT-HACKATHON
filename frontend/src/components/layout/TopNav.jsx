import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { ROLE_LABELS } from '../../lib/utils';

const BREADCRUMB_MAP = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'New Project',
  '/esg-metrics': 'ESG Metrics',
  '/esg-metrics/entry': 'Data Entry',
  '/brsr': 'BRSR Workspace',
  '/evidence': 'Evidence Center',
  '/documents': 'Documents',
  '/compliance': 'Compliance',
  '/compliance/gap-analysis': 'Gap Analysis',
  '/sdg': 'SDG Mapping',
  '/reports': 'Reports',
  '/admin/users': 'User Management',
  '/admin/organizations': 'Organizations',
  '/admin/periods': 'Reporting Periods',
  '/admin/policies': 'Policies',
  '/admin/targets': 'ESG Targets',
  '/audit': 'Audit Log',
  '/profile': 'Profile',
};

export default function TopNav({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const crumbs = location.pathname.split('/').filter(Boolean);
  const currentTitle = BREADCRUMB_MAP[location.pathname] || crumbs[crumbs.length - 1] || 'Dashboard';

  return (
    <header className="topnav">
      {/* Mobile menu toggle */}
      <button className="btn btn-ghost btn-icon" onClick={onMenuToggle} style={{ display: 'none' }} id="mobile-menu-btn">
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {currentTitle}
        </h1>
        {crumbs.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
                <span style={{ fontSize: '.7rem', color: i === crumbs.length - 1 ? 'var(--color-brand-600)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {BREADCRUMB_MAP[`/${crumbs.slice(0, i+1).join('/')}`] || c}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Top Search bar matching reference UI */}
      <div className="topnav-search" style={{ margin: '0 1rem', display: 'flex' }}>
        <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search projects, locations, or anything..." />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.35rem',
          padding: '.25rem .65rem', borderRadius: 8,
          background: '#ede8df', border: '1px solid #d8d2c5',
          fontSize: '.72rem', fontWeight: 700, color: '#1c1917'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803d' }} />
          MCA & SEBI Desk
        </div>


        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 7, height: 7,
            background: '#ef4444', borderRadius: '50%',
            border: '2px solid var(--topnav-bg)',
          }} />
        </button>

        {/* Profile */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/profile')}
          style={{ gap: '.65rem', padding: '.35rem .75rem', borderRadius: 10, background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {ROLE_LABELS[user?.role] || 'User'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
