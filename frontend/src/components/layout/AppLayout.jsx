import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Shield } from 'lucide-react';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        {/* Organization Header Bar (MEIL) + TopNav wrapped for sticky behavior */}
        <div className="sticky-header-wrapper">
          <div className="org-header-bar">
            <div className="org-header-left">
              <img src="/meil-logo.svg" alt="MEIL" className="org-header-logo" />
              <div className="org-header-divider" />
              <div>
                <div className="org-header-label">ORGANIZATION</div>
                <div className="org-header-title">Megha Engineering &amp; Infrastructures Limited</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: '#15803d', fontWeight: 700 }}>
                <Shield size={13} /> Enterprise ESG Desk
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>SEBI BRSR Core Aligned</span>
            </div>
          </div>
          <TopNav onMenuToggle={() => setMobileOpen(o => !o)} />
        </div>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
