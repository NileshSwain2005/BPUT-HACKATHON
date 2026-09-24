import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, User, Lock, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

const QUICK_LOGINS = [
  { label: 'Super Admin', email: 'superadmin@pravaah.in', color: '#1b365d' },
  { label: 'ESG Admin', email: 'esgadmin@pravaah.in', color: '#0284c7' },
  { label: 'Group ESG Mgr', email: 'groupesg@pravaah.in', color: '#15803d' },
  { label: 'Subsidiary Mgr', email: 'subsidiary@pravaah.in', color: '#0d9488' },
  { label: 'BU Manager', email: 'bumanager@pravaah.in', color: '#0369a1' },
  { label: 'Project Manager', email: 'projectmgr@pravaah.in', color: '#b45309' },
  { label: 'ESG Reviewer', email: 'reviewer@pravaah.in', color: '#059669' },
  { label: 'Data Contributor', email: 'contributor@pravaah.in', color: '#c2410c' },
  { label: 'Auditor', email: 'auditor@pravaah.in', color: '#334155' },
  { label: 'Executive', email: 'executive@pravaah.in', color: '#4338ca' },
  { label: 'Stakeholder', email: 'stakeholder@pravaah.in', color: '#64748b' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials or try demo login.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (ql) => {
    setEmail(ql.email);
    setPassword('Pravaah@123');
    setError('');
    setLoading(true);
    try {
      await login(ql.email, 'Pravaah@123');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ── Organization Header Bar (MEIL) ─────────────────────────────── */}
      <header className="org-header-bar" style={{ padding: '0.6rem 2rem' }}>
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
            <Shield size={13} /> Enterprise Single Sign-On
          </span>
          <Link to="/" style={{ color: '#1c1917', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
            <ArrowLeft size={13} /> Back to Public Portal
          </Link>
        </div>
      </header>

      {/* ── Main Body Container ───────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          width: '100%', maxWidth: 1040,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem', alignItems: 'center',
        }}>
          {/* Left Panel: Official Branding & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
              <img
                src="/logo.svg"
                alt="PRAVAAH"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: 'contain',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 2px 8px rgba(21, 128, 61, 0.2))'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: '#1c1917', letterSpacing: '-.02em' }}>
                    PRAVAAH
                  </span>
                  <span style={{ fontSize: '.95rem', fontWeight: 700, color: '#78716c' }}>
                    प्रवाह
                  </span>
                </div>
                <div style={{ fontSize: '.72rem', color: '#15803d', fontWeight: 700, letterSpacing: '.02em' }}>
                  NATIONAL ESG & BRSR DISCLOSURE PORTAL
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: '#1c1917', fontFamily: 'var(--font-display)', lineHeight: 1.25, marginBottom: '.75rem' }}>
                Secure Official Access for Listed Entities & Value Chains
              </h2>
              <p style={{ color: '#57534e', lineHeight: 1.65, fontSize: '.925rem' }}>
                National electronic registry for filing, reviewing, and auditing Business Responsibility and Sustainability Reports (BRSR) under SEBI Listing Regulations.
              </p>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#292524' }}>
                <CheckCircle2 size={16} color="#15803d" />
                <span>256-Bit TLS Regulatory Encryption Standard</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#292524' }}>
                <CheckCircle2 size={16} color="#15803d" />
                <span>SEBI BRSR Core Mandated Indicators Aligned</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#292524' }}>
                <CheckCircle2 size={16} color="#15803d" />
                <span>Tamper-evident Immutable Audit Logging</span>
              </div>
            </div>

            {/* Quick Demo Role Logins */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 14, border: '1px solid #e7e1d5' }}>
              <p style={{ fontSize: '.75rem', color: '#1c1917', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.65rem' }}>
                Quick Demonstration Access (Password: Pravaah@123)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {QUICK_LOGINS.map(ql => (
                  <button
                    key={ql.label}
                    type="button"
                    onClick={() => quickLogin(ql)}
                    style={{
                      padding: '.35rem .75rem',
                      background: '#faf7f2', border: `1px solid #d8d2c5`,
                      borderRadius: 8, color: ql.color, fontSize: '.75rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ede8df'; e.currentTarget.style.borderColor = ql.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#faf7f2'; e.currentTarget.style.borderColor = '#d8d2c5'; }}
                  >
                    {ql.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Official Login Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e7e1d5',
            borderRadius: 18,
            padding: '2.25rem',
            boxShadow: '0 4px 20px rgba(45, 35, 25, 0.05)',
          }}>
            <div style={{ borderBottom: '1px solid #ede8df', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#1c1917' }}>
                Portal Sign In / पोर्टल साइन-इन
              </h3>
              <p style={{ color: '#78716c', fontSize: '.85rem', marginTop: '.25rem' }}>
                Enter your authorized credentials or select a demonstration role.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem', borderRadius: 8, fontSize: '.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Official Email ID *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="user@pravaah.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Access Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', marginTop: '.5rem', borderRadius: 10, justifyContent: 'center' }}
              >
                {loading ? <span className="spinner spinner-sm" /> : null}
                {loading ? 'Authenticating…' : 'Secure Portal Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #ede8df', textAlign: 'center' }}>
              <p style={{ color: '#8c857b', fontSize: '.75rem', lineHeight: 1.5 }}>
                Unauthorized access to this regulatory disclosure platform is prohibited under the Information Technology Act.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#faf7f2', borderTop: '1px solid #e7e1d5', padding: '1rem 2rem', textAlign: 'center', fontSize: '.75rem', color: '#8c857b' }}>
        © 2025 PRAVAAH ESG Platform • Megha Engineering &amp; Infrastructures Limited (MEIL).
      </footer>
    </div>
  );
}
