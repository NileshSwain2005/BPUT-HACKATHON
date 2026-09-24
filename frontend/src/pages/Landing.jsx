import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, BarChart3, FileSearch, Globe, Layers,
  ChevronRight, CheckCircle2, ArrowRight, Zap, Star,
  Building2, ClipboardList, FileText, TrendingUp, Lock, CheckCheck
} from 'lucide-react';

const FEATURES = [
  { icon: ClipboardList, title: 'BRSR Regulatory Workspace', desc: 'Structured digital disclosure for all 9 NGRBC principles across Sections A, B, and C with full evidence linking.', color: '#1b365d' },
  { icon: FileSearch, title: 'Evidence Intelligence', desc: 'Immutable document upload, automatic classification, and chain-of-custody verification for every ESG disclosure.', color: '#0284c7' },
  { icon: Shield, title: 'Compliance & Gap Engine', desc: 'Deterministic gap analysis assessing regulatory readiness against SEBI BRSR Core standards and identifying missing items.', color: '#15803d' },
  { icon: BarChart3, title: 'ESG Quantitative Metrics', desc: 'Scope 1, 2, and 3 emissions, water neutrality, renewable energy, safety incidents, and CSR metrics with period tracking.', color: '#b45309' },
  { icon: Globe, title: 'UN SDG 2030 Alignment', desc: 'Real-time alignment mapping across all 17 Sustainable Development Goals and institutional contributions.', color: '#0d9488' },
  { icon: Layers, title: 'Enterprise Hierarchy', desc: 'Consolidated and standalone reporting across Holding Groups, Operating Subsidiaries, Joint Ventures, and Projects.', color: '#4338ca' },
];

const STATS = [
  { value: '1,000+', label: 'Mandated Listed Entities' },
  { value: '9', label: 'NGRBC Principles' },
  { value: '17', label: 'UN SDGs Mapped' },
  { value: '11', label: 'Role-Based Access Profiles' },
];

const PRINCIPLES = [
  { code: 'P1', name: 'Ethics & Governance', color: '#1b365d' },
  { code: 'P2', name: 'Safe Products', color: '#0284c7' },
  { code: 'P3', name: 'Employee Well-being', color: '#15803d' },
  { code: 'P4', name: 'Stakeholder Engagement', color: '#b45309' },
  { code: 'P5', name: 'Human Rights', color: '#dc2626' },
  { code: 'P6', name: 'Environmental Care', color: '#166534' },
  { code: 'P7', name: 'Policy Engagement', color: '#4338ca' },
  { code: 'P8', name: 'Inclusive Growth', color: '#be185d' },
  { code: 'P9', name: 'Consumer Practices', color: '#c2410c' },
];

const ROLES_DEMO = [
  { role: 'Super Admin',          email: 'superadmin@pravaah.in',  color: '#1b365d' },
  { role: 'ESG Admin',            email: 'esgadmin@pravaah.in',    color: '#0284c7' },
  { role: 'Group ESG Manager',    email: 'groupesg@pravaah.in',    color: '#15803d' },
  { role: 'Subsidiary Manager',   email: 'subsidiary@pravaah.in',  color: '#4338ca' },
  { role: 'BU Manager',           email: 'bumanager@pravaah.in',   color: '#0d9488' },
  { role: 'Project Manager',      email: 'projectmgr@pravaah.in',  color: '#b45309' },
  { role: 'Data Contributor',     email: 'contributor@pravaah.in', color: '#f59e0b' },
  { role: 'ESG Reviewer',         email: 'reviewer@pravaah.in',    color: '#64748b' },
  { role: 'Auditor',              email: 'auditor@pravaah.in',     color: '#334155' },
  { role: 'Executive',            email: 'executive@pravaah.in',   color: '#7c3aed' },
  { role: 'Stakeholder',          email: 'stakeholder@pravaah.in', color: '#16a34a' },
];

export default function Landing() {
  const [ticker, setTicker] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTicker(n => (n + 1) % PRINCIPLES.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'var(--font-sans)', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO — Full-screen video with centered logo & hamburger drawer
      ══════════════════════════════════════════════════════════════ */}
      <section className="landing-hero">

        {/* ── Video Background ── */}
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="/India Gate.mp4" type="video/mp4" />
        </video>

        {/* ── Dark gradient overlay ── */}
        <div className="hero-overlay" />

        {/* ── Subtle grid texture ── */}
        <div className="hero-grid" style={{ opacity: 0.15 }} />

        {/* ══ TOP UTILITY BAR ══════════════════════════════════════════ */}
        <div className="hero-topbar">
          {/* Left: Organization identity (MEIL) */}
          <div className="hero-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
            <div style={{ background: '#ffffff', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
              <img src="/meil-logo.svg" alt="MEIL" style={{ height: 20, width: 'auto', objectFit: 'contain' }} />
            </div>
            <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>ORGANIZATION</span>
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-.01em' }}>Megha Engineering &amp; Infrastructures Limited</span>
            </div>
          </div>

          {/* Right: Utility controls + Hamburger */}
          <div className="hero-topbar-right">
            <a href="#features" style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Skip to main content
            </a>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: '#68d391', fontWeight: 700 }}>
              <Shield size={12} /> Official Portal
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ fontSize: '.72rem', opacity: 0.75 }}>
              <span style={{ fontWeight: 700, cursor: 'pointer' }}>A</span>{' '}
              <span style={{ fontWeight: 700, cursor: 'pointer', fontSize: '.65rem' }}>A</span>{' '}
              <span style={{ fontWeight: 700, cursor: 'pointer', fontSize: '.78rem' }}>A+</span>
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ fontSize: '.72rem', opacity: 0.75 }}><strong>EN</strong> / हि</span>

            {/* ☰ Hamburger Button */}
            <button
              className="hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ══ CENTERED HERO CONTENT ════════════════════════════════════ */}
        <div className="hero-center">

          {/* Logo emblem */}
          <div className="hero-emblem">
            <img src="/logo.svg" alt="PRAVAAH Logo" className="hero-emblem-img" />
          </div>

          {/* Portal name */}
          <h1 className="hero-title">
            PRAVAAH
            <span className="hero-title-devanagari"> प्रवाह</span>
          </h1>

          {/* Indian Tricolor Accent */}
          <div className="hero-tricolor" style={{ display: 'flex', gap: 3, justifyContent: 'center', width: 80, height: 3, margin: '0 auto .75rem' }}>
            <span style={{ flex: 1, background: '#FF9933', borderRadius: 2 }} />
            <span style={{ flex: 1, background: '#FFFFFF', borderRadius: 2 }} />
            <span style={{ flex: 1, background: '#138808', borderRadius: 2 }} />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle">Enterprise ESG &amp; BRSR Disclosure Portal</p>

          {/* Tagline */}
          <p className="hero-tagline">
            From Operational Project Data to Auditable ESG Disclosures —{' '}
            a verified single-window compliance ecosystem for listed entities &amp; regulatory bodies.
          </p>

          {/* CTA Buttons */}
          <div className="hero-ctas">
            <Link to="/login" className="hero-cta-primary">
              Access Reporting Portal <ArrowRight size={17} />
            </Link>
            <a href="#features" className="hero-cta-secondary">
              Explore Platform
            </a>
          </div>

          {/* Stats bar */}
          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat-item">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RIGHT-SIDE NAVIGATION DRAWER ════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`drawer-backdrop${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Panel */}
      <aside className={`nav-drawer${drawerOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <img src="/logo.svg" alt="PRAVAAH" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1c1917', letterSpacing: '-.01em' }}>PRAVAAH</div>
              <div style={{ fontSize: '.65rem', color: '#15803d', fontWeight: 700 }}>MEIL Enterprise ESG &amp; BRSR Portal</div>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        {/* Corporate Accent Line */}
        <div style={{ display: 'flex', height: 3, margin: '0 1.5rem', gap: 3 }}>
          <div style={{ flex: 1, background: '#dc2626', borderRadius: 2 }} />
          <div style={{ flex: 1, background: '#1e3a8a', borderRadius: 2 }} />
        </div>

        {/* Navigation links */}
        <nav className="drawer-nav">
          <p className="drawer-section-label">Navigation</p>
          {[
            { label: 'Features', href: '#features', icon: Layers },
            { label: 'BRSR Framework', href: '#brsr', icon: ClipboardList },
            { label: 'Authorized Roles', href: '#roles', icon: Lock },
            { label: 'Compliance Calendar', href: '#compliance', icon: CheckCheck },
            { label: 'Public Disclosures', href: '#disclosures', icon: FileText },
            { label: 'Helpdesk', href: '#helpdesk', icon: Shield },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              <link.icon size={17} strokeWidth={1.8} />
              {link.label}
              <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </a>
          ))}
        </nav>

        {/* Portal Sign In CTA */}
        <div className="drawer-footer">
          <p className="drawer-section-label">Authorized Access</p>
          <Link
            to="/login"
            className="drawer-signin-btn"
            onClick={() => setDrawerOpen(false)}
          >
            Portal Sign In <ArrowRight size={16} />
          </Link>
          <p className="drawer-footer-note">
            <Shield size={11} color="#15803d" /> Secure SSL-encrypted government portal
          </p>
        </div>
      </aside>

      {/* ── Marquee Principles Bar ─────────────────────────────────── */}
      <section style={{
        background: '#ffffff', padding: '1.25rem 0',
        borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', animation: 'marquee 22s linear infinite', width: 'max-content' }}>
          {[...PRINCIPLES, ...PRINCIPLES].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '.625rem',
              padding: '.45rem 1.15rem',
              background: '#f8fafc', border: `1px solid #cbd5e1`,
              borderRadius: 8, whiteSpace: 'nowrap',
            }}>
              <span style={{ fontWeight: 800, fontSize: '.85rem', color: p.color }}>{p.code}</span>
              <span style={{ fontSize: '.85rem', color: '#1e293b', fontWeight: 600 }}>{p.name}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: '5.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '.8rem', color: '#1b365d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
            REGULATORY COMPLIANCE SYSTEM
          </div>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#0f172a' }}>
            Enterprise Capabilities for ESG Assurance
          </h2>
          <p style={{ color: '#475569', marginTop: '.5rem', fontSize: '1rem', maxWidth: 600, margin: '.5rem auto 0' }}>
            Built around the Business Responsibility and Sustainability Reporting guidelines of SEBI.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${f.color}15`, border: `1.5px solid ${f.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '.5rem', color: '#0f172a' }}>{f.title}</h3>
              <p style={{ color: '#475569', lineHeight: 1.65, fontSize: '.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRSR Architecture ──────────────────────────────────── */}
      <section id="brsr" style={{ padding: '5rem 2rem', background: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '.8rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
                NGRBC PRINCIPLES ARCHITECTURE
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: '#0f172a' }}>
                Mandatory Disclosures Across Sections A, B & C
              </h2>
              <p style={{ color: '#334155', lineHeight: 1.75, marginBottom: '2rem' }}>
                PRAVAAH structures every BRSR disclosure item into verified quantitative metrics and evidence attachments. Both Essential and Leadership Indicators follow standardized multi-tier approval workflows.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {[
                  'Section A — General Disclosures (Listed Entity details & operations)',
                  'Section B — Management & Process Disclosures (Policies & governance)',
                  'Section C — Principle-wise Performance Indicators (P1 to P9)',
                  'SEBI BRSR Core Mandated Key Performance Indicators',
                  'Auditable Chain of Custody & Timestamped Verification Trail',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem', color: '#1e293b' }}>
                    <CheckCheck size={18} color="#15803d" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.875rem' }}>
              {PRINCIPLES.map(p => (
                <div key={p.code} style={{
                  padding: '1.25rem 1rem', borderRadius: 10, textAlign: 'center',
                  background: '#ffffff', border: `1.5px solid #cbd5e1`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: p.color, fontFamily: 'var(--font-display)' }}>{p.code}</div>
                  <div style={{ fontSize: '.75rem', color: '#334155', marginTop: '.25rem', lineHeight: 1.4, fontWeight: 600 }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Credentials / Roles ───────────────────────────── */}
      <section id="roles" style={{ padding: '5.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '.8rem', color: '#1c1917', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
            ROLE-BASED GOVERNANCE
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1c1917' }}>
            Authorized Demonstration Access
          </h2>
          <p style={{ color: '#475569', marginTop: '.5rem' }}>
            Demo credentials for platform stakeholders with default test password: <code style={{ background: '#e2e8f0', color: '#0f172a', padding: '.25rem .5rem', borderRadius: 6, fontSize: '.9rem', fontWeight: 700 }}>Pravaah@123</code>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {ROLES_DEMO.map(r => (
            <div key={r.role} style={{
              padding: '1.25rem 1.5rem',
              background: '#ffffff', border: '1px solid #cbd5e1',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.925rem', color: r.color }}>{r.role}</div>
                <div style={{ fontSize: '.8rem', color: '#64748b', marginTop: '.25rem', fontFamily: 'monospace' }}>{r.email}</div>
              </div>
              <Link to="/login" style={{
                padding: '.4rem .85rem',
                background: '#f1f5f9', border: '1px solid #cbd5e1',
                borderRadius: 6, color: '#1b365d', fontSize: '.75rem', fontWeight: 700,
              }}>
                Sign In →
              </Link>
            </div>
          ))}
        </div>

      </section>

      {/* ── Official Institutional Footer ─────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '2px solid #cbd5e1', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
            <img src="/logo.svg" alt="PRAVAAH" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#1c1917', fontSize: '1.05rem' }}>
                PRAVAAH | प्रवाह
              </div>
              <div style={{ fontSize: '.72rem', color: '#78716c' }}>
                Enterprise ESG &amp; BRSR Disclosure Portal • Megha Engineering &amp; Infrastructures Limited (MEIL)
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '.85rem', color: '#475569', fontWeight: 500 }}>
            <span>SEBI LODR Guidelines</span>
            <span>MCA NGRBC Principles</span>
            <span>Privacy Policy</span>
            <span>Security Assurance</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '1.5rem auto 0', textAlign: 'center', color: '#64748b', fontSize: '.78rem', lineHeight: 1.6 }}>
          © 2025 PRAVAAH Platform. Megha Engineering &amp; Infrastructures Limited (MEIL) Enterprise ESG &amp; BRSR Reporting System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
