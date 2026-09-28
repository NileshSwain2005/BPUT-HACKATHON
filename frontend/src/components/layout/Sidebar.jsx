import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, BarChart3, ClipboardList, FileText,
  ShieldCheck, Layers, Globe, LineChart, Users, Building2, CalendarRange,
  BookOpen, Target, ScrollText, LogOut,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/utils';

// ─── All possible nav items ────────────────────────────────────────────────
const ALL = {
  dashboard:   { to: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard' },
  projects:    { to: '/projects',                icon: FolderKanban,    label: 'Projects' },
  esgMetrics:  { to: '/esg-metrics',             icon: BarChart3,       label: 'ESG Metrics' },
  esgEntry:    { to: '/esg-metrics/entry',       icon: BarChart3,       label: 'Data Entry' },
  brsr:        { to: '/brsr',                    icon: ClipboardList,   label: 'BRSR Workspace' },
  compliance:  { to: '/compliance',              icon: ShieldCheck,     label: 'Compliance' },
  gapAnalysis: { to: '/compliance/gap-analysis', icon: Layers,          label: 'Gap Analysis' },
  evidence:    { to: '/evidence',                icon: FileText,        label: 'Evidence Center' },
  documents:   { to: '/documents',              icon: BookOpen,        label: 'Documents' },
  sdg:         { to: '/sdg',                    icon: Globe,           label: 'SDG Mapping' },
  reports:     { to: '/reports',                 icon: LineChart,       label: 'Reports' },
  users:       { to: '/admin/users',             icon: Users,           label: 'User Management' },
  orgs:        { to: '/admin/organizations',     icon: Building2,       label: 'Organizations' },
  periods:     { to: '/admin/periods',           icon: CalendarRange,   label: 'Reporting Periods' },
  policies:    { to: '/admin/policies',          icon: BookOpen,        label: 'Policies' },
  targets:     { to: '/admin/targets',           icon: Target,          label: 'ESG Targets' },
  audit:       { to: '/audit',                   icon: ScrollText,      label: 'Audit Log' },
};

// ─── Role → nav sections ──────────────────────────────────────────────────
function getRoleNav(role) {
  const map = {
    SUPER_ADMIN: [
      { label: 'Overview',             items: [ALL.dashboard] },
      { label: 'Projects & Data',      items: [ALL.projects, ALL.esgMetrics] },
      { label: 'BRSR Reporting',       items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence & Docs',      items: [ALL.evidence, ALL.documents] },
      { label: 'Sustainability',        items: [ALL.sdg, ALL.reports] },
      { label: 'Administration',        items: [ALL.users, ALL.orgs, ALL.periods, ALL.policies, ALL.targets, ALL.audit] },
    ],
    ESG_ADMIN: [
      { label: 'Overview',       items: [ALL.dashboard] },
      { label: 'BRSR Reporting', items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence',       items: [ALL.evidence, ALL.documents] },
      { label: 'Sustainability', items: [ALL.sdg, ALL.reports] },
      { label: 'Administration', items: [ALL.users, ALL.orgs, ALL.periods, ALL.policies, ALL.targets] },
    ],
    GROUP_ESG_MANAGER: [
      { label: 'Overview',        items: [ALL.dashboard] },
      { label: 'Projects & Data', items: [ALL.projects, ALL.esgMetrics] },
      { label: 'BRSR Reporting',  items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence',        items: [ALL.evidence, ALL.documents] },
      { label: 'Sustainability',  items: [ALL.sdg, ALL.reports] },
    ],
    SUBSIDIARY_MANAGER: [
      { label: 'Overview',        items: [ALL.dashboard] },
      { label: 'Projects & Data', items: [ALL.projects, ALL.esgMetrics] },
      { label: 'BRSR Reporting',  items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence',        items: [ALL.evidence] },
      { label: 'Reports',         items: [ALL.reports] },
    ],
    BU_MANAGER: [
      { label: 'Overview',         items: [ALL.dashboard] },
      { label: 'Projects & Data',  items: [ALL.projects, ALL.esgMetrics] },
      { label: 'BRSR Reporting',   items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence',         items: [ALL.evidence, ALL.documents] },
      { label: 'Reports & Policy', items: [ALL.reports, ALL.policies, ALL.targets] },
    ],
    PROJECT_MANAGER: [
      { label: 'Overview',          items: [ALL.dashboard] },
      { label: 'My Work',           items: [ALL.projects, ALL.esgMetrics, ALL.esgEntry] },
      { label: 'BRSR & Compliance', items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
      { label: 'Evidence',          items: [ALL.evidence, ALL.documents] },
    ],
    DATA_CONTRIBUTOR: [
      { label: 'Overview',   items: [ALL.dashboard] },
      { label: 'Data Entry', items: [ALL.esgEntry] },
      { label: 'Evidence',   items: [ALL.evidence] },
    ],
    ESG_REVIEWER: [
      { label: 'Overview',          items: [ALL.dashboard] },
      { label: 'Review Queue',      items: [ALL.esgMetrics, ALL.evidence] },
      { label: 'BRSR & Compliance', items: [ALL.brsr, ALL.compliance, ALL.gapAnalysis] },
    ],
    AUDITOR: [
      { label: 'Overview',   items: [ALL.dashboard] },
      { label: 'Audit',      items: [ALL.audit, ALL.evidence, ALL.documents] },
      { label: 'Compliance', items: [ALL.compliance, ALL.reports] },
    ],
    EXECUTIVE: [
      { label: 'Overview',   items: [ALL.dashboard] },
      { label: 'Insights',   items: [ALL.reports, ALL.sdg] },
      { label: 'Compliance', items: [ALL.compliance] },
    ],
    STAKEHOLDER: [
      { label: 'Overview',       items: [ALL.dashboard] },
      { label: 'Public Reports', items: [ALL.reports, ALL.sdg] },
    ],
  };
  return map[role] || map.PROJECT_MANAGER;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const nav = getRoleNav(user?.role);

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 39 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.15rem 1.25rem 1rem', borderBottom: '1px solid #282420', background: '#181614', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <img
              src="/logo.svg"
              alt="PRAVAAH"
              style={{
                width: 36,
                height: 36,
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 6px rgba(104, 211, 145, 0.25))'
              }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: '#f5f2eb', letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                PRAVAAH <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#9e9891' }}>प्रवाह</span>
              </div>
              <div style={{ fontSize: '.68rem', color: '#eab308', fontWeight: 700, letterSpacing: '.02em' }}>MEIL ESG &amp; BRSR PORTAL</div>
              <div style={{ fontSize: '.62rem', color: '#8c857b', fontWeight: 500 }}>Megha Engineering &amp; Infrastructures Ltd.</div>
            </div>
          </div>
        </div>

        {/* User badge */}
        <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #282420', background: '#181614', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#f5f2eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <span style={{ fontSize: '.62rem', color: '#eab308', background: '#2b2824', border: '1px solid #38342f', padding: '1px 8px', borderRadius: 99, marginTop: 2, display: 'inline-block' }}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ flex: '1 1 0%', minHeight: 0, padding: '.75rem', overflowY: 'auto' }}>
          {nav.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '.75rem', borderTop: '1px solid #282420', flexShrink: 0, background: '#181614' }}>
          <button
            onClick={logout}
            className="nav-item"
            style={{ width: '100%', color: '#9e9891', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = '#281e1e'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9e9891'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

