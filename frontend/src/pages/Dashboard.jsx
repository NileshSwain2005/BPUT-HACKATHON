import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminApi, brsrApi, projectsApi,
  evidenceApi, auditApi, workflowApi,
} from '../lib/api';

// ─── Real-time polling hook (30s interval) ────────────────────────────────────
function usePoll(fetchFn, deps = [], interval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetchFn().then(r => { setData(r); setLoading(false); }).catch(() => setLoading(false));
  }, deps); // eslint-disable-line
  useEffect(() => { load(); const t = setInterval(load, interval); return () => clearInterval(t); }, [load, interval]);
  return { data, loading, reload: load };
}
import { formatDateTime, ROLE_LABELS, ROLE_COLORS } from '../lib/utils';
import {
  FolderKanban, FileText, Shield, BarChart3, CheckCircle, AlertTriangle,
  Clock, TrendingUp, Users, Building2, Globe, ArrowRight, Layers,
  ClipboardList, ScrollText, Target, BookOpen, Inbox, Upload,
  LineChart, ShieldCheck, XCircle, FileCheck, Activity, Eye, Sliders,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from 'recharts';

const TREND = [
  { month: 'Apr', scope1: 420, scope2: 1100 },
  { month: 'May', scope1: 395, scope2: 1050 },
  { month: 'Jun', scope1: 380, scope2: 980 },
  { month: 'Jul', scope1: 410, scope2: 1120 },
  { month: 'Aug', scope1: 355, scope2: 900 },
  { month: 'Sep', scope1: 330, scope2: 850 },
];
const PC = ['#15803d', '#f59e0b', '#ef4444', '#78716c'];

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
function WelcomeBanner({ role, name, subtitle, cta, ctaTo, gradient }) {
  const bg = gradient || 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #15803d 100%)';
  return (
    <div style={{
      background: bg,
      borderRadius: 16,
      padding: '1.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(28,25,23,.18)',
      border: '1px solid rgba(255,255,255,.12)',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>
          <span>{ROLE_LABELS[role] || role}</span>
          <span style={{ color: 'rgba(255,255,255,.4)' }}>•</span>
          <span>MEIL Enterprise Portal</span>
        </div>
        <h2 style={{ color: 'white', fontSize: '1.45rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '.35rem', lineHeight: 1.25 }}>
          Welcome back, {name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,.82)', fontSize: '.875rem', lineHeight: 1.45 }}>{subtitle}</p>
      </div>
      {cta && ctaTo && (
        <Link to={ctaTo} className="btn" style={{ background: '#fff', color: '#1c1917', fontWeight: 700, gap: '.5rem', position: 'relative', zIndex: 1, flexShrink: 0, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
          {cta} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = '#1c1917', to }) {
  const inner = (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.2, marginTop: '.25rem' }}>{value}</div>
          <div style={{ fontSize: '.72rem', color: sub?.includes('vs') || sub?.includes('verified') ? '#15803d' : 'var(--text-muted)', fontWeight: sub?.includes('vs') ? 600 : 400, marginTop: '.25rem' }}>{sub}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <style>{`.stat-card::before{background:${color}!important}`}</style>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

function QA({ to, icon: Icon, label, desc, color = '#1c1917' }) {
  return (
    <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '.8rem', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color={color} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
      </div>
      <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </Link>
  );
}

function WorkflowBar({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap', padding: '.75rem 1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, fontSize: '.75rem', boxShadow: 'var(--shadow-card)' }}>
      <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '.06em', marginRight: '.4rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
        <Sliders size={12} color="#1c1917" /> Workflow Lifecycle:
      </span>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          {i > 0 && <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
          <span style={{ fontWeight: 600, color: i === 0 ? '#1c1917' : 'var(--text-secondary)', background: i === 0 ? 'var(--bg-raised)' : 'transparent', padding: i === 0 ? '.2rem .55rem' : '0', borderRadius: 6, whiteSpace: 'nowrap' }}>
            {step}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: 'var(--bg-raised)' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '.75rem 1.25rem', textAlign: 'left', fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function Prog({ v }) {
  const c = v >= 80 ? '#15803d' : v >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      <div style={{ width: 60, height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 99 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '.78rem', color: 'var(--text-primary)' }}>{v}%</span>
    </div>
  );
}

const TD = ({ children, style }) => <td style={{ padding: '.75rem 1.25rem', ...style }}>{children}</td>;

// ─── Reusable Enterprise ESG Approval Pipeline ────────────────────────────────
function EnterpriseWorkflowPipeline() {
  const { data: statsData, reload: reloadStats } = usePoll(() => workflowApi.stats().then(r => r.data), []);
  const { data: wfData, reload: reloadQueue } = usePoll(() => workflowApi.pending({ limit: 50 }).then(r => r.data), []);
  const stats = statsData?.stats || {};
  const items = wfData?.items || [];

  const reloadAll = () => { reloadStats(); reloadQueue(); };

  const advance = async (item) => {
    const nextMap = {
      DRAFT: 'submit',
      SUBMITTED: 'pm_approve',
      PM_APPROVED: 'reviewer_approve',
      REVIEWER_APPROVED: 'bu_approve',
      BU_APPROVED: 'subsidiary_approve',
      SUBSIDIARY_APPROVED: 'group_approve',
      GROUP_APPROVED: 'publish',
    };
    const action = nextMap[item.workflowStatus] || 'pm_approve';
    try {
      await workflowApi.transition(item.id, action);
      reloadAll();
    } catch(e) {
      alert(e.response?.data?.message || 'Action failed');
    }
  };

  const publishDirect = async (id) => {
    if (!window.confirm('Directly publish and officially lock this ESG data point?')) return;
    try {
      await workflowApi.transition(id, 'publish');
      reloadAll();
    } catch(e) {
      alert(e.response?.data?.message || 'Publish failed');
    }
  };

  const rejectItem = async (id) => {
    const comment = window.prompt('Reason for revision request:');
    if (comment === null) return;
    try {
      await workflowApi.transition(id, 'reject', comment);
      reloadAll();
    } catch(e) {
      alert(e.response?.data?.message || 'Reject failed');
    }
  };

  const stages = [
    { key: 'DRAFT', label: '1. Contributor', count: stats.DRAFT || 0, color: '#78716c' },
    { key: 'SUBMITTED', label: '2. PM Validation', count: stats.SUBMITTED || 0, color: '#f59e0b' },
    { key: 'PM_APPROVED', label: '3. ESG Reviewer', count: stats.PM_APPROVED || 0, color: '#6366f1' },
    { key: 'REVIEWER_APPROVED', label: '4. BU Manager', count: stats.REVIEWER_APPROVED || 0, color: '#0284c7' },
    { key: 'BU_APPROVED', label: '5. Subsidiary Mgr', count: stats.BU_APPROVED || 0, color: '#1b365d' },
    { key: 'SUBSIDIARY_APPROVED', label: '6. Group ESG Mgr', count: stats.SUBSIDIARY_APPROVED || 0, color: '#8b5cf6' },
    { key: 'GROUP_APPROVED', label: '7. Ready to Publish', count: stats.GROUP_APPROVED || 0, color: '#0d9488' },
    { key: 'PUBLISHED', label: '8. Published', count: stats.PUBLISHED || 0, color: '#15803d' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Enterprise ESG Approval Hierarchy & Data Pipeline</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Real-time 7-stage workflow tracking: Contributor → PM → Reviewer → BU → Subsidiary → Group → Published</div>
        </div>
        <button onClick={reloadAll} className="btn btn-ghost btn-sm">↻ Refresh Live Pipeline</button>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '.6rem' }}>
          {stages.map((st) => (
            <div key={st.key} style={{
              background: 'var(--bg-raised)',
              border: `1px solid ${st.count > 0 ? st.color : 'var(--border-color)'}`,
              borderRadius: 10,
              padding: '.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '.25rem',
            }}>
              <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{st.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: st.count > 0 ? st.color : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {st.count}
              </div>
              <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>{st.key}</div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div>
            <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Items Currently in Approval Pipeline ({items.length})</span>
              <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Admin Override Authority</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <THead cols={['Metric', 'Project', 'Value', 'Current Level', 'Entered By', 'Reviewer Query', 'Admin Actions']} />
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                      <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                      <TD style={{ fontFamily: 'monospace' }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                      <TD><span className="badge badge-blue" style={{ fontSize: '.67rem' }}>{item.workflowStatus}</span></TD>
                      <TD style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>{item.submittedBy || item.lastActionBy || '—'}</TD>
                      <TD style={{ fontSize: '.75rem', color: item.reviewerComment ? '#ef4444' : 'var(--text-muted)' }}>
                        {item.reviewerComment ? `💬 ${item.reviewerComment}` : '—'}
                      </TD>
                      <TD>
                        <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                          {item.workflowStatus !== 'PUBLISHED' && (
                            <button onClick={() => advance(item)} className="btn btn-sm" style={{ background: '#1b365d', color: '#fff', fontSize: '.68rem', padding: '.2rem .5rem' }}>
                              Advance ➔
                            </button>
                          )}
                          <button onClick={() => publishDirect(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.68rem', padding: '.2rem .5rem' }}>
                            Publish ✓
                          </button>
                          <button onClick={() => rejectItem(item.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.68rem', padding: '.2rem .5rem' }}>
                            Reject
                          </button>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 1. SUPER_ADMIN Dashboard ────────────────────────────────────────────────
function SuperAdminDash() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [brsr, setBrsr] = useState(null);
  useEffect(() => {
    Promise.all([adminApi.dashboard().catch(() => null), brsrApi.complianceSummary().catch(() => null)])
      .then(([d, b]) => { setData(d?.data?.dashboard); setBrsr(b?.data?.summary); });
  }, []);
  const s = data || {};
  const pie = [
    { name: 'Verified', value: brsr?.verified || 24 },
    { name: 'Pending', value: Math.max(0, (brsr?.totalResponses || 38) - (brsr?.verified || 24)) },
    { name: 'Missing', value: brsr?.missing || 12 },
    { name: 'Draft', value: brsr?.draft || 8 },
  ];
  const subData = [
    { name: 'MEIL Infra', brsr: 82, ev: 78 },
    { name: 'MEIL Power', brsr: 67, ev: 55 },
    { name: 'MEIL Energy', brsr: 91, ev: 88 },
    { name: 'MEIL Mining', brsr: 74, ev: 70 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Platform-wide governance. Monitor compliance, manage user access, and configure organizational hierarchy across all entities." cta="User Management" ctaTo="/admin/users" />
      <WorkflowBar steps={['Platform Setup', 'User Management', 'Metric Configuration', 'System Monitoring', 'Enterprise Reporting']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Users}        label="Total Users"     value={s.users?.total ?? 11}             sub="across all 11 roles"     color="#1c1917" to="/admin/users" />
        <StatCard icon={Building2}    label="Organizations"   value={s.orgs?.total ?? 6}               sub="group, subs & BUs"       color="#0284c7" to="/admin/organizations" />
        <StatCard icon={FolderKanban} label="Active Projects" value={s.projects?.active ?? 3}          sub={`${s.projects?.total ?? 3} total`} color="#15803d" to="/projects" />
        <StatCard icon={Shield}       label="BRSR Completion" value={`${s.brsr?.completionPct ?? 68}%`} sub="across all entities"   color="#8b5cf6" to="/brsr" />
        <StatCard icon={FileText}     label="Evidence Items"  value={s.evidence?.total ?? 24}          sub={`${s.evidence?.verified ?? 18} verified`} color="#3b82f6" to="/evidence" />
        <StatCard icon={Activity}     label="Data Points"     value={s.metrics?.total ?? 11}           sub="ESG values submitted"    color="#f59e0b" to="/esg-metrics" />
      </div>

      {/* Enterprise Multi-Level Workflow Pipeline Tracker */}
      <EnterpriseWorkflowPipeline />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Subsidiary BRSR Readiness</div><div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>BRSR % vs Evidence %</div></div><Link to="/compliance" className="btn btn-ghost btn-sm">View All</Link></div>
          <div className="card-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.8rem' }} />
                <Bar dataKey="brsr" name="BRSR %" fill="#15803d" radius={[4,4,0,0]} />
                <Bar dataKey="ev" name="Evidence %" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>BRSR Status</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pie.map((_, i) => <Cell key={i} fill={PC[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.brsr?.completionPct ?? 68}%</div>
                <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>Complete</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', width: '100%' }}>
              {pie.map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: PC[i] }} /><span style={{ color: 'var(--text-secondary)' }}>{c.name}</span></div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Platform Administration</div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '.75rem' }}>
          <QA to="/admin/users"         icon={Users}      label="User Management"       desc="Create, assign & revoke user access"       color="#1c1917" />
          <QA to="/admin/organizations" icon={Building2}  label="Organization Hierarchy" desc="Configure groups, subsidiaries & BUs"      color="#0284c7" />
          <QA to="/admin/periods"       icon={Clock}      label="Reporting Periods"      desc="Configure fiscal years & deadlines"        color="#15803d" />
          <QA to="/esg-metrics"         icon={BarChart3}  label="Metric Configuration"  desc="Define ESG indicators & validation rules"  color="#f59e0b" />
          <QA to="/audit"               icon={ScrollText} label="System Audit Log"       desc="Platform-wide activity trail"              color="#64748b" />
          <QA to="/reports"             icon={TrendingUp} label="Enterprise Reports"     desc="Consolidated BRSR & ESG group reports"     color="#8b5cf6" />
        </div>
      </div>
    </div>
  );
}

// ─── 2. ESG_ADMIN Dashboard ──────────────────────────────────────────────────
function ESGAdminDash() {
  const { user } = useAuth();
  const [brsr, setBrsr] = useState(null);
  useEffect(() => {
    brsrApi.complianceSummary().catch(() => null).then(b => setBrsr(b?.data?.summary));
  }, []);

  const pData = [
    { p: 'P1 Ethics', comp: 85 },
    { p: 'P2 Safe Prod', comp: 72 },
    { p: 'P3 Employees', comp: 90 },
    { p: 'P4 Stakeholders', comp: 65 },
    { p: 'P5 Human Rts', comp: 80 },
    { p: 'P6 Environment', comp: 58 },
    { p: 'P7 Policy Adv', comp: 70 },
    { p: 'P8 Inclusive', comp: 76 },
    { p: 'P9 Consumers', comp: 82 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="ESG and BRSR Core system configuration. Map indicator standards (SEBI P1–P9, GRI, SASB, TCFD), define approval chains, and prepare filings." cta="BRSR Workspace" ctaTo="/brsr" gradient="linear-gradient(135deg, #0d5a3e 0%, #1b365d 70%, #1e40af 100%)" />
      <WorkflowBar steps={['Framework Config', 'Indicator Mapping', 'Cycle Management', 'Workflow Setup', 'Compliance Rules', 'Regulatory Filing']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Shield}       label="BRSR Principles"  value="9 / 9"                          sub="SEBI Core principles"     color="#15803d" to="/brsr" />
        <StatCard icon={ClipboardList} label="Core Indicators" value="128"                            sub="active indicators mapped" color="#1b365d" to="/brsr" />
        <StatCard icon={Clock}        label="Active Cycles"    value="1 Active"                       sub="FY 2024-25 reporting"     color="#f59e0b" to="/admin/periods" />
        <StatCard icon={Globe}        label="Frameworks"       value="4 Mapped"                       sub="BRSR, GRI, SASB, TCFD"    color="#0284c7" to="/compliance" />
        <StatCard icon={FileCheck}    label="Validation Rules" value="32 Rules"                       sub="automated boundary checks" color="#8b5cf6" to="/esg-metrics" />
        <StatCard icon={Activity}     label="Filing Readiness" value={`${brsr?.completionPct ?? 68}%`} sub="pre-submission verification" color="#0d9488" to="/reports" />
      </div>

      {/* Enterprise Multi-Level Workflow Pipeline Tracker */}
      <EnterpriseWorkflowPipeline />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div><div style={{ fontWeight: 700, fontSize: '.95rem' }}>BRSR Principle-Wise Compliance (P1 – P9)</div><div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>SEBI Core indicator completeness percentage</div></div><Link to="/brsr" className="btn btn-ghost btn-sm">Full Matrix</Link></div>
          <div className="card-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="p" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.8rem' }} />
                <Bar dataKey="comp" name="Completeness %" fill="#0d5a3e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Reporting Cycle Info</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            <div style={{ padding: '.85rem', borderRadius: 8, background: 'rgba(21,128,61,.08)', border: '1px solid rgba(21,128,61,.2)' }}>
              <div style={{ fontSize: '.72rem', color: '#15803d', fontWeight: 800 }}>ACTIVE CYCLE</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '.2rem' }}>FY 2024-25 (Annual)</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>Deadline: 31 Oct 2025 • Status: In Progress</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Review Approval Chain:</span>
                <span style={{ fontWeight: 700, color: '#1b365d' }}>3-Level Configured</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Assurance Standard:</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>SEBI Core Format</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Export Format:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>XBRL & PDF Package</span>
              </div>
            </div>
            <Link to="/admin/periods" className="btn btn-sm" style={{ background: '#1b365d', color: '#fff', justifyContent: 'center' }}>
              Manage Cycles
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>ESG System Operations</div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '.75rem' }}>
          <QA to="/brsr"                    icon={ClipboardList} label="Configure BRSR Matrix"    desc="Map indicators to Principles 1–9"    color="#0d5a3e" />
          <QA to="/admin/periods"           icon={Clock}         label="Reporting Cycles"         desc="Open/close periods & set deadlines"  color="#1b365d" />
          <QA to="/esg-metrics"             icon={BarChart3}     label="Indicator Data Fields"    desc="Configure ESG metric parameters"     color="#0284c7" />
          <QA to="/compliance/gap-analysis" icon={Layers}        label="Compliance Gap Analysis"  desc="Identify missing SEBI disclosures"   color="#ef4444" />
          <QA to="/admin/policies"          icon={BookOpen}      label="Corporate ESG Policies"   desc="Manage statutory policy standards"   color="#8b5cf6" />
          <QA to="/reports"                 icon={TrendingUp}    label="Regulatory Filing Package" desc="Generate official SEBI submission"  color="#15803d" />
        </div>
      </div>
    </div>
  );
}

// ─── 3. GROUP_ESG_MANAGER Dashboard ──────────────────────────────────────────
function GroupManagerDash() {
  const { user } = useAuth();
  const [brsr, setBrsr] = useState(null);
  const { data: wfData, reload: reloadWf } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const pendingCount = wfData?.total || 0;
  const pendingItems = wfData?.items || [];
  useEffect(() => { brsrApi.complianceSummary().catch(() => null).then(b => setBrsr(b?.data?.summary)); }, []);

  const approve = async (id) => {
    try { await workflowApi.transition(id, 'group_approve'); reloadWf(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };
  const publish = async (id) => {
    if (!window.confirm('Publish this metric value? This locks the data and marks it officially verified for enterprise BRSR reporting.')) return;
    try { await workflowApi.transition(id, 'publish'); reloadWf(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };
  const reject = async (id) => {
    const comment = window.prompt('Reason for revision / rejection:');
    if (comment === null) return;
    try { await workflowApi.transition(id, 'reject', comment); reloadWf(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  const rows = [
    { name: 'MEIL Energy', sub: 18, pen: 3,  brsr: 85 },
    { name: 'MEIL Infra',  sub: 12, pen: 7,  brsr: 63 },
    { name: 'MEIL Mining', sub: 20, pen: 0,  brsr: 92 },
    { name: 'MEIL Power',  sub: 9,  pen: 11, brsr: 45 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Enterprise-level ESG oversight. Review subsidiary submissions, identify risks, and approve or publish official group disclosures." cta="Review Submissions" ctaTo="/brsr" gradient="linear-gradient(135deg,#0f294a 0%,#1b365d 50%,#0d9488 100%)" />
      <WorkflowBar steps={['Group Dashboard', 'Review Submissions', 'Risk Analysis', 'Approve / Publish', 'Group Reporting', 'Improvement Programs']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Building2}     label="Subsidiaries"      value={4}                                sub="under your oversight"  color="#0284c7" to="/projects" />
        <StatCard icon={Clock}         label="Pending Approvals" value={pendingCount}                    sub="subsidiary-approved items" color="#f59e0b" to="/brsr" />
        <StatCard icon={Shield}        label="Group BRSR %"      value={`${brsr?.completionPct ?? 71}%`} sub="consolidated progress" color="#15803d" to="/brsr" />
        <StatCard icon={Globe}         label="SDGs Aligned"      value={14}                              sub="of 17 goals mapped"    color="#0d9488" to="/sdg" />
        <StatCard icon={AlertTriangle} label="Risk Alerts"       value={3}                               sub="subsidiaries at risk"  color="#ef4444" to="/compliance/gap-analysis" />
      </div>

      {/* Live Approval & Publishing Queue for Group Manager */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Subsidiary Submissions — Awaiting Group ESG Approval & Publishing</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Review subsidiary-approved data points. Approve for group inclusion or Publish for official reporting.</div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <span className="badge badge-yellow">{pendingCount} Pending</span>
            <button onClick={reloadWf} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>
        {pendingItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>
            🎉 All subsidiary submissions have been processed. No items pending Group approval.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <THead cols={['Metric', 'Subsidiary / Project', 'Value', 'Status', 'Submitted By', 'Actions']} />
              <tbody>
                {pendingItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                    <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                    <TD style={{ fontFamily: 'monospace' }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                    <TD><span className="badge badge-blue" style={{ fontSize: '.67rem' }}>{item.workflowStatus}</span></TD>
                    <TD style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{item.submittedBy || item.lastActionBy || '—'}</TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                        {item.workflowStatus === 'SUBSIDIARY_APPROVED' && (
                          <button onClick={() => approve(item.id)} className="btn btn-sm" style={{ background: '#1b365d', color: '#fff', fontSize: '.7rem', padding: '.25rem .6rem' }}>Approve</button>
                        )}
                        <button onClick={() => publish(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.7rem', padding: '.25rem .6rem' }}>Publish ✓</button>
                        <button onClick={() => reject(item.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.7rem', padding: '.25rem .6rem' }}>Reject</button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Subsidiary Submission Status</div><Link to="/compliance" className="btn btn-ghost btn-sm">Full Report</Link></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <THead cols={['Subsidiary', 'Submitted', 'Pending', 'BRSR Progress', 'Status']} />
              <tbody>
                {rows.map(r => (
                  <tr key={r.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{r.name}</TD>
                    <TD style={{ color: '#15803d', fontWeight: 600 }}>{r.sub}</TD>
                    <TD style={{ color: r.pen > 5 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{r.pen}</TD>
                    <TD><Prog v={r.brsr} /></TD>
                    <TD><span className={`badge ${r.brsr >= 80 ? 'badge-green' : r.brsr >= 60 ? 'badge-yellow' : 'badge-red'}`}>{r.brsr >= 80 ? 'On Track' : r.brsr >= 60 ? 'At Risk' : 'Critical'}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Quick Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            <QA to="/brsr"                    icon={ClipboardList} label="Review BRSR Submissions" desc="Approve or reject subsidiary data"        color="#8b5cf6" />
            <QA to="/compliance/gap-analysis" icon={Layers}        label="Risk & Gap Analysis"     desc="Identify compliance gaps"                  color="#ef4444" />
            <QA to="/sdg"                     icon={Globe}         label="SDG Alignment Map"       desc="Group-level SDG contributions"             color="#0d9488" />
            <QA to="/reports"                 icon={TrendingUp}    label="Group ESG Report"        desc="Board & SEBI-ready consolidated report"    color="#1b365d" />
            <QA to="/esg-metrics"             icon={BarChart3}     label="ESG KPI Dashboard"       desc="Monitor group-level metrics"               color="#0284c7" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. SUBSIDIARY_MANAGER Dashboard ─────────────────────────────────────────
function SubsidiaryDash() {
  const { user } = useAuth();
  const { data: wfData, reload } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const pending = wfData?.items || [];
  const total = wfData?.total || 0;

  const approve = async (id) => {
    try { await workflowApi.transition(id, 'subsidiary_approve'); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };
  const reject = async (id) => {
    const comment = window.prompt('Reason for rejection (optional):');
    try { await workflowApi.transition(id, 'reject', comment || ''); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Manage ESG data for your subsidiary. Review BU-approved submissions and forward consolidated data to Group ESG Manager." cta="Review BU Data" ctaTo="/projects" gradient="linear-gradient(135deg,#1b365d 0%,#15803d 100%)" />
      <WorkflowBar steps={['Subsidiary Dashboard', 'Review BU Data', 'Monitor KPIs', 'Address Gaps', 'Submit to Group', 'Subsidiary Reporting']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Inbox}         label="Pending Approvals" value={total} sub="BU-approved items"         color="#f59e0b" to="/esg-metrics" />
        <StatCard icon={Building2}     label="Business Units"   value={3}     sub="reporting to you"          color="#1b365d" to="/projects" />
        <StatCard icon={FileText}      label="Evidence Items"   value={19}    sub="12 verified"               color="#3b82f6" to="/evidence" />
        <StatCard icon={AlertTriangle} label="KPI Alerts"       value={2}     sub="thresholds exceeded"       color="#ef4444" to="/compliance/gap-analysis" />
      </div>
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>BU-Approved Items — Awaiting Subsidiary Approval</div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <span className="badge badge-yellow">{total} Pending</span>
            <button onClick={reload} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>
        {pending.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>🎉 All BU-approved data has been processed.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <THead cols={['Metric', 'Project', 'Value', 'Submitted By', 'Status', 'Actions']} />
              <tbody>
                {pending.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                    <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                    <TD style={{ fontFamily: 'monospace' }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                    <TD style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{item.submittedBy || '—'}</TD>
                    <TD><span className="badge badge-blue" style={{ fontSize: '.67rem' }}>{item.workflowStatus}</span></TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button onClick={() => approve(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.7rem', padding: '.25rem .6rem' }}>Approve</button>
                        <button onClick={() => reject(item.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.7rem', padding: '.25rem .6rem' }}>Reject</button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Quick Actions</div></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
          <QA to="/projects"                icon={FolderKanban}  label="Review BU Projects" desc="See all BU project data"        color="#1b365d" />
          <QA to="/esg-metrics"             icon={BarChart3}     label="Monitor KPIs"       desc="Energy, water, waste, safety"   color="#0284c7" />
          <QA to="/brsr"                    icon={ClipboardList} label="Submit to Group"    desc="Forward approved BRSR data"     color="#8b5cf6" />
          <QA to="/compliance/gap-analysis" icon={Layers}        label="Address Gaps"       desc="BRSR & SDG compliance alerts"  color="#ef4444" />
          <QA to="/reports"                 icon={TrendingUp}    label="Subsidiary Report"  desc="Leadership & board reporting"   color="#15803d" />
        </div>
      </div>
    </div>
  );
}

// ─── 5. BU_MANAGER Dashboard ─────────────────────────────────────────────────
function BUManagerDash() {
  const { user } = useAuth();
  const { data: wfData, reload } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const pending = wfData?.items || [];
  const total = wfData?.total || 0;

  const approve = async (id) => {
    try { await workflowApi.transition(id, 'bu_approve'); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };
  const reject = async (id) => {
    const comment = window.prompt('Reason for rejection (optional):');
    try { await workflowApi.transition(id, 'reject', comment || ''); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Manage ESG data for your business unit. Consolidate project submissions and approve reviewer-verified data before escalation to Subsidiary." cta="View Projects" ctaTo="/projects" gradient="linear-gradient(135deg,#0f294a 0%,#0284c7 100%)" />
      <WorkflowBar steps={['BU Dashboard', 'Review Project Data', 'Performance Comparison', 'Standardization', 'Submit to Subsidiary', 'BU Reporting']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Inbox}        label="Pending Approvals" value={total}   sub="reviewer-approved items"  color="#f59e0b" to="/esg-metrics" />
        <StatCard icon={Shield}       label="BU Compliance"     value="71%"     sub="BRSR readiness"           color="#15803d" to="/compliance" />
        <StatCard icon={FileText}     label="Evidence Files"    value={14}      sub="9 verified"               color="#3b82f6" to="/evidence" />
        <StatCard icon={Target}       label="ESG Targets"       value={8}       sub="4 on track"               color="#8b5cf6" to="/admin/targets" />
      </div>
      <div className="card">
        <div className="card-header">
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Reviewer-Approved Items — Awaiting BU Approval</div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <span className="badge badge-yellow">{total} Pending</span>
            <button onClick={reload} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>
        {pending.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>🎉 No pending items — all reviewer-approved data has been processed.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <THead cols={['Metric', 'Project', 'Value', 'Submitted By', 'Status', 'Actions']} />
              <tbody>
                {pending.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                    <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                    <TD style={{ fontFamily: 'monospace' }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                    <TD style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{item.submittedBy || '—'}</TD>
                    <TD><span className="badge badge-blue" style={{ fontSize: '.67rem' }}>{item.workflowStatus}</span></TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button onClick={() => approve(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.7rem', padding: '.25rem .6rem' }}>Approve</button>
                        <button onClick={() => reject(item.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.7rem', padding: '.25rem .6rem' }}>Reject</button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Quick Actions</div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '.75rem' }}>
          <QA to="/projects"        icon={FolderKanban}  label="Review Project Data"   desc="All project ESG submissions"      color="#1b365d" />
          <QA to="/esg-metrics"     icon={BarChart3}     label="Performance Comparison" desc="Compare project ESG metrics"       color="#0284c7" />
          <QA to="/brsr"            icon={ClipboardList} label="Submit to Subsidiary"   desc="Forward BU-level BRSR data"       color="#8b5cf6" />
          <QA to="/admin/policies"  icon={BookOpen}      label="BU Policies"            desc="ESG policies & standards"         color="#15803d" />
          <QA to="/admin/targets"   icon={Target}        label="ESG Targets"            desc="Track BU sustainability goals"    color="#f59e0b" />
        </div>
      </div>
    </div>
  );
}

// ─── 6. PROJECT_MANAGER Dashboard ────────────────────────────────────────────
function ProjectManagerDash() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [brsr, setBrsr] = useState(null);
  const [ev, setEv] = useState(null);
  const { data: wfData, reload: reloadWf } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const pendingItems = wfData?.items || [];

  const submittedCount = pendingItems.filter(i => i.workflowStatus === 'SUBMITTED').length;
  const pmApprovedCount = pendingItems.filter(i => i.workflowStatus === 'PM_APPROVED').length;

  useEffect(() => {
    Promise.all([
      projectsApi.list({ limit: 5 }).catch(() => null),
      brsrApi.complianceSummary().catch(() => null),
      evidenceApi.stats().catch(() => null),
    ]).then(([p, b, e]) => { setProjects(p?.data?.projects || []); setBrsr(b?.data?.summary); setEv(e?.data); });
  }, []);

  const validateAndSubmitToReviewer = async (id) => {
    try {
      await workflowApi.transition(id, 'pm_approve');
      reloadWf();
    } catch(e) {
      alert(e.response?.data?.message || 'Failed to validate and submit data to ESG Reviewer');
    }
  };

  const requestRevision = async (id) => {
    const comment = window.prompt('Revision query / note for data contributor:');
    if (comment === null) return;
    try {
      await workflowApi.transition(id, 'reject', comment);
      reloadWf();
    } catch(e) {
      alert(e.response?.data?.message || 'Failed to send revision request');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Review and validate ESG data from Data Contributors. Validate metrics, verify evidence attachments, and submit to the ESG Reviewer." cta="Enter ESG Data" ctaTo="/esg-metrics/entry" gradient="linear-gradient(135deg,#15803d 0%,#1b365d 100%)" />
      <WorkflowBar steps={['Contributor Input', 'Review & Validate Data', 'Verify Evidence', 'Submit to ESG Reviewer', 'Fix Anomaly / Query', 'Monitor Project Status']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={FolderKanban}  label="My Projects"            value={projects.length || 3}  sub="assigned to you"        color="#1b365d" to="/projects" />
        <StatCard icon={Inbox}         label="Awaiting PM Validation" value={submittedCount}        sub="contributor submissions" color="#f59e0b" to="/esg-metrics" />
        <StatCard icon={CheckCircle}   label="Validated by PM"        value={pmApprovedCount}       sub="in ESG Reviewer queue"  color="#0284c7" to="/esg-metrics" />
        <StatCard icon={FileText}      label="Evidence Uploaded"      value={ev?.total || 12}       sub={`${ev?.verified || 8} verified`} color="#3b82f6" to="/evidence" />
        <StatCard icon={AlertTriangle} label="Needs Revision"         value={pendingItems.filter(i => i.workflowStatus === 'REVISION_REQUESTED').length} sub="revisions requested" color="#ef4444" to="/esg-metrics" />
      </div>

      {/* Project Contributor Data & Submission Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Contributor Submissions — Awaiting Project Manager Validation</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Validate contributor data, ensure evidence is attached, and submit to the ESG Reviewer.</div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <span className="badge badge-yellow">{submittedCount} Awaiting Validation</span>
            <button onClick={reloadWf} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>
        {pendingItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>
            No pending project entries. Contributors have not submitted entries yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <THead cols={['Metric', 'Project', 'Value', 'Evidence', 'Workflow Status', 'Submitted By', 'Reviewer Query / Note', 'Actions']} />
              <tbody>
                {pendingItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                    <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                    <TD style={{ fontFamily: 'monospace' }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                    <TD>
                      {item.evidence ? (
                        <Link to="/evidence" className="badge badge-green" style={{ textDecoration: 'none', fontSize: '.7rem' }}>📎 Attached</Link>
                      ) : (
                        <Link to="/evidence" className="badge badge-yellow" style={{ textDecoration: 'none', fontSize: '.7rem' }}>+ Attach</Link>
                      )}
                    </TD>
                    <TD>
                      <span className={`badge ${
                        item.workflowStatus === 'SUBMITTED' ? 'badge-yellow' :
                        item.workflowStatus === 'PM_APPROVED' ? 'badge-blue' :
                        item.workflowStatus === 'REVIEWER_APPROVED' ? 'badge-green' :
                        item.workflowStatus === 'REVISION_REQUESTED' ? 'badge-red' : 'badge-gray'
                      }`} style={{ fontSize: '.68rem' }}>
                        {item.workflowStatus === 'SUBMITTED' ? 'Awaiting PM Review' :
                         item.workflowStatus === 'PM_APPROVED' ? 'PM Validated' :
                         item.workflowStatus === 'REVIEWER_APPROVED' ? 'Reviewer Approved' :
                         item.workflowStatus}
                      </span>
                    </TD>
                    <TD style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{item.submittedBy || '—'}</TD>
                    <TD style={{ fontSize: '.75rem', maxWidth: 180 }}>
                      {item.reviewerComment ? (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>💬 {item.reviewerComment}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        {item.workflowStatus === 'SUBMITTED' ? (
                          <>
                            <button onClick={() => validateAndSubmitToReviewer(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.72rem', padding: '.25rem .6rem' }}>
                              Validate & Submit ➔
                            </button>
                            <button onClick={() => requestRevision(item.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.72rem', padding: '.25rem .6rem' }}>
                              Request Revision
                            </button>
                          </>
                        ) : ['DRAFT', 'REVISION_REQUESTED'].includes(item.workflowStatus) ? (
                          <button onClick={() => validateAndSubmitToReviewer(item.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.72rem', padding: '.25rem .6rem' }}>
                            Validate & Submit ➔
                          </button>
                        ) : item.workflowStatus === 'PM_APPROVED' ? (
                          <span style={{ fontSize: '.72rem', color: '#0284c7', fontWeight: 600 }}>In Reviewer Queue</span>
                        ) : (
                          <span style={{ fontSize: '.72rem', color: '#15803d', fontWeight: 600 }}>Reviewer Approved ✓</span>
                        )}
                        <Link to="/esg-metrics/entry" className="btn btn-ghost btn-sm" style={{ fontSize: '.7rem', padding: '.25rem .5rem' }}>Edit</Link>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div><div style={{ fontWeight: 700, fontSize: '.95rem' }}>GHG Emissions Trend</div><div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Scope 1 & 2 — tCO₂e</div></div><Link to="/esg-metrics" className="btn btn-ghost btn-sm">View All</Link></div>
          <div className="card-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TREND}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2a9d7c" stopOpacity={0.3} /><stop offset="95%" stopColor="#2a9d7c" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10 }} formatter={(v, n) => [`${v} tCO\u2082e`, n === 'scope1' ? 'Scope 1' : 'Scope 2']} />
                <Area type="monotone" dataKey="scope1" stroke="#2a9d7c" fill="url(#g1)" strokeWidth={2} name="scope1" />
                <Area type="monotone" dataKey="scope2" stroke="#3b82f6" fill="url(#g2)" strokeWidth={2} name="scope2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Quick Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            <QA to="/esg-metrics/entry"       icon={BarChart3}     label="Enter ESG Data"    desc="Submit metric values for period"   color="#2a9d7c" />
            <QA to="/evidence"                icon={Upload}        label="Upload Evidence"   desc="Attach invoices & certificates"     color="#3b82f6" />
            <QA to="/brsr"                    icon={ClipboardList} label="BRSR Workspace"    desc="Fill BRSR disclosure responses"     color="#8b5cf6" />
            <QA to="/compliance/gap-analysis" icon={Layers}        label="View Gap Analysis" desc="Fix validation warnings"            color="#f59e0b" />
            <QA to="/sdg"                     icon={Globe}         label="SDG Alignment"     desc="Map project contributions"         color="#0d9488" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. DATA_CONTRIBUTOR Dashboard ───────────────────────────────────────────
function ContributorDash() {
  const { user } = useAuth();
  const { data: wfData, reload: reloadWf } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const items = wfData?.items || [];
  const [evStats, setEvStats] = useState(null);

  useEffect(() => {
    evidenceApi.stats().catch(() => null).then(r => setEvStats(r?.data));
  }, []);

  const submitItem = async (id) => {
    try {
      await workflowApi.transition(id, 'submit');
      reloadWf();
    } catch(e) {
      alert(e.response?.data?.message || 'Failed to submit item');
    }
  };

  const drafts = items.filter(i => i.workflowStatus === 'DRAFT').length;
  const revisions = items.filter(i => i.workflowStatus === 'REVISION_REQUESTED').length;
  const inReview = items.filter(i => ['SUBMITTED', 'PM_APPROVED', 'REVIEWER_APPROVED', 'BU_APPROVED', 'SUBSIDIARY_APPROVED'].includes(i.workflowStatus)).length;
  const approved = items.filter(i => ['GROUP_APPROVED', 'PUBLISHED'].includes(i.workflowStatus)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Enter monthly ESG metric values, upload supporting evidence (bills, meter readings), and address reviewer queries." cta="Enter Data Now" ctaTo="/esg-metrics/entry" gradient="linear-gradient(135deg,#b45309 0%,#1b365d 100%)" />
      <WorkflowBar steps={['Receive Requests', 'Enter Data', 'Upload Evidence', 'Mark Complete / Submit', 'Respond to Reviewer Queries']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Inbox}         label="Pending Input / Drafts" value={drafts}     sub="awaiting submission"   color="#f59e0b" to="/esg-metrics/entry" />
        <StatCard icon={AlertTriangle} label="Needs Revision"         value={revisions}  sub="queries from reviewer" color="#ef4444" to="/esg-metrics/entry" />
        <StatCard icon={Clock}         label="Under Review"           value={inReview}   sub="in approval chain"     color="#0284c7" to="/esg-metrics" />
        <StatCard icon={CheckCircle}   label="Approved / Published"   value={approved}   sub="verified disclosures"  color="#15803d" to="/esg-metrics" />
        <StatCard icon={Upload}        label="Evidence Uploaded"      value={evStats?.total || 5} sub="supporting documents" color="#3b82f6" to="/evidence" />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>My ESG Metric Entries & Review Status</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Track real-time approval status, view reviewer feedback comments, and submit entries.</div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <span className="badge badge-yellow">{items.length} Total</span>
            <button onClick={reloadWf} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '.5rem' }}>No data entered yet</div>
            <p style={{ fontSize: '.85rem', marginBottom: '1rem' }}>Click below to enter your first monthly ESG metric value (energy, water, waste, safety, etc.)</p>
            <Link to="/esg-metrics/entry" className="btn btn-primary btn-sm" style={{ background: '#15803d', borderColor: '#15803d' }}>
              + Enter Metric Data
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <THead cols={['Metric', 'Category', 'Project', 'Value', 'Evidence', 'Workflow Status', 'Reviewer Query / Notes', 'Action']} />
              <tbody>
                {items.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600 }}>{r.metric?.name}</TD>
                    <TD><span className="badge badge-gray" style={{ fontSize: '.67rem' }}>{r.metric?.category}</span></TD>
                    <TD style={{ color: 'var(--text-muted)' }}>{r.project?.name}</TD>
                    <TD style={{ fontFamily: 'monospace' }}>{r.value != null ? `${r.value} ${r.metric?.unit || ''}` : r.textValue || '—'}</TD>
                    <TD>
                      {r.evidence ? (
                        <Link to="/evidence" className="badge badge-green" style={{ textDecoration: 'none', fontSize: '.7rem' }}>📎 Attached</Link>
                      ) : (
                        <Link to="/evidence" className="badge badge-yellow" style={{ textDecoration: 'none', fontSize: '.7rem' }}>+ Add File</Link>
                      )}
                    </TD>
                    <TD>
                      <span className={`badge ${
                        r.workflowStatus === 'PUBLISHED' || r.workflowStatus === 'GROUP_APPROVED' ? 'badge-green' :
                        r.workflowStatus === 'REVISION_REQUESTED' ? 'badge-red' :
                        r.workflowStatus === 'SUBMITTED' ? 'badge-yellow' :
                        r.workflowStatus === 'PM_APPROVED' ? 'badge-blue' :
                        r.workflowStatus === 'REVIEWER_APPROVED' ? 'badge-blue' : 'badge-gray'
                      }`} style={{ fontSize: '.68rem' }}>
                        {r.workflowStatus === 'SUBMITTED' ? 'Submitted to PM' :
                         r.workflowStatus === 'PM_APPROVED' ? 'PM Validated → In Review' :
                         r.workflowStatus === 'REVIEWER_APPROVED' ? 'Reviewer Approved' :
                         r.workflowStatus === 'PUBLISHED' ? 'Published & Verified ✓' :
                         r.workflowStatus === 'REVISION_REQUESTED' ? 'Revision Requested' :
                         r.workflowStatus}
                      </span>
                    </TD>
                    <TD style={{ fontSize: '.75rem', maxWidth: 200 }}>
                      {r.reviewerComment ? (
                        <div style={{ padding: '.25rem .5rem', background: '#fee2e2', color: '#991b1b', borderRadius: 6, border: '1px solid #fca5a5' }}>
                          💬 {r.reviewerComment}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        {['DRAFT', 'REVISION_REQUESTED'].includes(r.workflowStatus) && (
                          <button onClick={() => submitItem(r.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.72rem', padding: '.25rem .6rem' }}>
                            {r.workflowStatus === 'REVISION_REQUESTED' ? 'Re-Submit to PM' : 'Submit to PM'}
                          </button>
                        )}
                        <Link to="/esg-metrics/entry" className="btn btn-ghost btn-sm" style={{ fontSize: '.72rem', padding: '.25rem .5rem' }}>
                          Edit
                        </Link>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>My ESG Actions</div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '.75rem' }}>
          <QA to="/esg-metrics/entry" icon={BarChart3} label="Enter Metric Data"  desc="Submit values for assigned metrics"    color="#f59e0b" />
          <QA to="/evidence"          icon={Upload}    label="Upload Evidence"    desc="Attach bills, invoices & certificates" color="#3b82f6" />
          <QA to="/esg-metrics"       icon={Layers}    label="View All Metrics"   desc="Check full ESG metric definitions"     color="#15803d" />
        </div>
      </div>
    </div>
  );
}

// ─── 8. ESG_REVIEWER Dashboard ───────────────────────────────────────────────
function ReviewerDash() {
  const { user } = useAuth();
  const { data: wfData, reload } = usePoll(() => workflowApi.pending().then(r => r.data), []);
  const pending = wfData?.items || [];
  const total = wfData?.total || 0;

  const approve = async (id) => {
    try { await workflowApi.transition(id, 'reviewer_approve'); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };
  const reject = async (id) => {
    const comment = window.prompt('Reason for revision request / reviewer query:');
    if (comment === null) return;
    try { await workflowApi.transition(id, 'reject', comment); reload(); } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Review and validate ESG submissions. Verify evidence, check data quality, and approve compliant disclosures for the next level." cta="Open Review Queue" ctaTo="/evidence" gradient="linear-gradient(135deg,#4338ca 0%,#1b365d 100%)" />
      <WorkflowBar steps={['Review Submissions', 'Validate Evidence', 'Check Quality', 'Approve / Reject', 'Add Comments', 'Escalate Issues']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={Inbox}         label="Pending Reviews"    value={total} sub="awaiting your decision"     color="#f59e0b" to="/evidence" />
        <StatCard icon={CheckCircle}   label="Approved Today"     value={8}     sub="submissions validated"       color="#15803d" to="/esg-metrics" />
        <StatCard icon={XCircle}       label="Rejected"           value={2}     sub="sent back for correction"    color="#ef4444" to="/brsr" />
        <StatCard icon={AlertTriangle} label="Escalations"        value={1}     sub="flagged anomalies"           color="#dc2626" to="/compliance/gap-analysis" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Live Review Queue</div>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
              <span className="badge badge-yellow">{total} Pending</span>
              <button onClick={reload} className="btn btn-ghost btn-sm">↻ Refresh</button>
            </div>
          </div>
          {pending.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>🎉 Review queue is clear — no submitted items pending your review.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
                <THead cols={['Project', 'Metric', 'Value', 'Evidence', 'Submitted By', 'Status', 'Actions']} />
                <tbody>
                  {pending.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <TD style={{ fontWeight: 600 }}>{r.project?.name}</TD>
                      <TD style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{r.metric?.name}</TD>
                      <TD style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{r.value != null ? `${r.value} ${r.metric?.unit || ''}` : r.textValue || '—'}</TD>
                      <TD>
                        {r.evidence ? (
                          <Link to="/evidence" className="badge badge-green" style={{ textDecoration: 'none', fontSize: '.7rem' }}>📎 Evidence Attached</Link>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: '.7rem' }}>No Evidence</span>
                        )}
                      </TD>
                      <TD style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{r.submittedBy || '—'}</TD>
                      <TD><span className="badge badge-yellow" style={{ fontSize: '.67rem' }}>{r.workflowStatus}</span></TD>
                      <TD><div style={{ display: 'flex', gap: '.4rem' }}>
                        <button onClick={() => approve(r.id)} className="btn btn-sm" style={{ background: '#15803d', color: '#fff', fontSize: '.7rem', padding: '.25rem .6rem' }}>Approve</button>
                        <button onClick={() => reject(r.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '.7rem', padding: '.25rem .6rem' }}>Reject</button>
                      </div></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Quick Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            <QA to="/evidence"                icon={Eye}           label="Validate Evidence" desc="Verify supporting documents"  color="#3b82f6" />
            <QA to="/esg-metrics"             icon={BarChart3}     label="Check ESG Data"    desc="Review submitted values"      color="#2a9d7c" />
            <QA to="/brsr"                    icon={ClipboardList} label="BRSR Review"        desc="Review BRSR responses"       color="#8b5cf6" />
            <QA to="/compliance/gap-analysis" icon={Layers}        label="Gap Analysis"       desc="Identify missing disclosures" color="#f59e0b" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 9. AUDITOR Dashboard ────────────────────────────────────────────────────
function AuditorDash() {
  const { user } = useAuth();
  const [log, setLog] = useState([]);
  const { data: wfData, reload: reloadAud } = usePoll(() => workflowApi.pending({ limit: 100 }).then(r => r.data), []);
  const allItems = wfData?.items || [];
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    auditApi.list({ limit: 8 }).catch(() => null).then(a => setLog(a?.data?.logs || []));
  }, []);

  const fallback = [
    { action: 'ESG Value Submitted',     entity: 'Solar Project A — Scope 1',             user: 'pm@meil.in',       time: '24 Sep 2025, 10:34 AM', status: 'SUCCESS' },
    { action: 'Evidence Verified',       entity: 'Electricity Bill Q2 FY25',              user: 'reviewer@meil.in', time: '24 Sep 2025, 09:12 AM', status: 'SUCCESS' },
    { action: 'BRSR Response Submitted', entity: 'P6 — Environmental Indicator',          user: 'admin@meil.in',    time: '23 Sep 2025, 05:45 PM', status: 'SUCCESS' },
    { action: 'User Role Changed',       entity: 'contractor@meil.in -> DATA_CONTRIBUTOR', user: 'sa@meil.in',      time: '23 Sep 2025, 02:30 PM', status: 'SUCCESS' },
    { action: 'Evidence Rejected',       entity: 'Water Meter Q1 — Incomplete scan',      user: 'reviewer@meil.in', time: '22 Sep 2025, 11:20 AM', status: 'REJECTED' },
    { action: 'ESG Anomaly Flagged',     entity: 'Coal Thermal D — NOx exceeds limit',    user: 'system',           time: '22 Sep 2025, 08:00 AM', status: 'ALERT' },
  ];
  const entries = log.length > 0 ? log : fallback;

  const filteredItems = allItems.filter(i => {
    if (filter === 'ALL') return true;
    if (filter === 'PUBLISHED') return i.workflowStatus === 'PUBLISHED' || i.isVerified;
    if (filter === 'IN_CHAIN') return !['PUBLISHED', 'DRAFT'].includes(i.workflowStatus);
    if (filter === 'REVISION') return i.workflowStatus === 'REVISION_REQUESTED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Read-only assurance oversight. Audit complete data lineage across all 6 levels, trace evidence attachments, and verify calculations." cta="Open Audit Trail" ctaTo="/audit" gradient="linear-gradient(135deg,#334155 0%,#1b365d 100%)" />
      <WorkflowBar steps={['Audit Trail', 'Trace Lineage', 'Verify Calculations', 'Inspect Evidence', 'Check Approvals', 'Assurance Reports']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={ScrollText} label="Audit Entries"    value={124}                                sub="all time records"    color="#64748b" to="/audit" />
        <StatCard icon={Activity}   label="Total Data Points" value={allItems.length || 11}               sub="across all levels"   color="#1b365d" to="/esg-metrics" />
        <StatCard icon={FileCheck}  label="Verified / Published" value={allItems.filter(i => i.workflowStatus === 'PUBLISHED' || i.isVerified).length} sub="officially locked" color="#15803d" to="/reports" />
        <StatCard icon={Clock}      label="In Approval Chain" value={allItems.filter(i => !['PUBLISHED', 'DRAFT'].includes(i.workflowStatus)).length} sub="multi-level review" color="#f59e0b" />
        <StatCard icon={FileText}   label="Reports"          value={6}                                  sub="available to review" color="#3b82f6" to="/reports" />
      </div>

      {/* Complete Data Lineage Explorer for Auditor */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>ESG Data Lineage & Assurance Explorer (All Levels)</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Complete audit trail: Data Contributor → PM → Reviewer → BU → Subsidiary → Group → Published</div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '.25rem', background: 'var(--bg-raised)', padding: '.2rem', borderRadius: 8 }}>
              {['ALL', 'PUBLISHED', 'IN_CHAIN', 'REVISION'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className="btn btn-xs" style={{
                  background: filter === f ? '#1b365d' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  fontSize: '.68rem',
                  padding: '.2rem .5rem',
                  borderRadius: 6,
                  border: 'none',
                }}>
                  {f === 'ALL' ? 'All' : f === 'PUBLISHED' ? 'Published' : f === 'IN_CHAIN' ? 'In Review' : 'Revisions'}
                </button>
              ))}
            </div>
            <button onClick={reloadAud} className="btn btn-ghost btn-sm">↻ Refresh</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <THead cols={['Metric', 'Category', 'Project', 'Value', 'Evidence', 'Workflow Status', 'Entered By', 'Last Action By', 'Verified']} />
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <TD style={{ fontWeight: 600 }}>{item.metric?.name}</TD>
                  <TD><span className="badge badge-gray" style={{ fontSize: '.67rem' }}>{item.metric?.category}</span></TD>
                  <TD style={{ color: 'var(--text-muted)' }}>{item.project?.name}</TD>
                  <TD style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.value != null ? `${item.value} ${item.metric?.unit || ''}` : item.textValue || '—'}</TD>
                  <TD>
                    {item.evidence ? (
                      <Link to="/evidence" className="badge badge-green" style={{ textDecoration: 'none', fontSize: '.68rem' }}>📎 Evidence Attached</Link>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: '.68rem' }}>No Evidence</span>
                    )}
                  </TD>
                  <TD>
                    <span className={`badge ${
                      item.workflowStatus === 'PUBLISHED' ? 'badge-green' :
                      item.workflowStatus === 'REVISION_REQUESTED' ? 'badge-red' :
                      item.workflowStatus === 'DRAFT' ? 'badge-gray' : 'badge-blue'
                    }`} style={{ fontSize: '.67rem' }}>
                      {item.workflowStatus}
                    </span>
                  </TD>
                  <TD style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>{item.submittedBy || '—'}</TD>
                  <TD style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>{item.lastActionBy || '—'}</TD>
                  <TD>
                    {item.isVerified ? (
                      <span style={{ color: '#15803d', fontWeight: 700, fontSize: '.72rem' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>Pending</span>
                    )}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Recent Audit Trail</div><Link to="/audit" className="btn btn-ghost btn-sm">Full Log</Link></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <THead cols={['Action', 'Entity / Detail', 'Performed By', 'Timestamp', 'Status']} />
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 600, fontSize: '.82rem' }}>{e.action || e.entityType}</TD>
                    <TD style={{ color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.entity || e.description || '—'}</TD>
                    <TD style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '.78rem' }}>{e.user || e.userId || '—'}</TD>
                    <TD style={{ color: 'var(--text-muted)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>{e.time || formatDateTime(e.createdAt)}</TD>
                    <TD><span className={`badge ${e.status === 'ALERT' ? 'badge-red' : e.status === 'REJECTED' ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '.67rem' }}>{e.status || 'OK'}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Audit Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            <QA to="/audit"      icon={ScrollText}  label="Full Audit Trail"  desc="Complete activity history"        color="#64748b" />
            <QA to="/evidence"   icon={FileText}    label="Evidence Vault"    desc="All supporting documents"         color="#3b82f6" />
            <QA to="/documents"  icon={BookOpen}    label="Document Archive"  desc="Certificates & uploaded reports"  color="#0284c7" />
            <QA to="/compliance" icon={ShieldCheck} label="Compliance Review" desc="BRSR & regulatory status"         color="#15803d" />
            <QA to="/reports"    icon={TrendingUp}  label="Audit Reports"     desc="Download assurance reports"       color="#8b5cf6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 10. EXECUTIVE Dashboard ─────────────────────────────────────────────────
function ExecutiveDash() {
  const { user } = useAuth();
  const [brsr, setBrsr] = useState(null);
  useEffect(() => { brsrApi.complianceSummary().catch(() => null).then(b => setBrsr(b?.data?.summary)); }, []);
  const rows = [
    { name: 'MEIL Energy', risk: 'Low',    brsr: 85, sdg: 14, ch: '+4%' },
    { name: 'MEIL Infra',  risk: 'Medium', brsr: 63, sdg: 11, ch: '-2%' },
    { name: 'MEIL Mining', risk: 'Low',    brsr: 92, sdg: 16, ch: '+8%' },
    { name: 'MEIL Power',  risk: 'High',   brsr: 38, sdg:  7, ch: '-12%' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Strategic ESG oversight. Monitor group performance, review risks, and make data-driven sustainability decisions." cta="Executive Report" ctaTo="/reports" gradient="linear-gradient(135deg,#0f294a 0%,#4338ca 100%)" />
      <WorkflowBar steps={['Executive Dashboard', 'Review Risks', 'Read Recommendations', 'Approve Initiatives', 'Monitor Compliance', 'Strategic Decisions']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={TrendingUp}    label="Group ESG Score" value="76/100"                          sub="+4 from last quarter"        color="#15803d" to="/reports" />
        <StatCard icon={Shield}        label="BRSR Readiness"  value={`${brsr?.completionPct ?? 71}%`} sub="pre-board review"            color="#1b365d" to="/compliance" />
        <StatCard icon={AlertTriangle} label="Risk Alerts"     value={3}                               sub="1 critical, 2 medium"        color="#ef4444" to="/compliance/gap-analysis" />
        <StatCard icon={Globe}         label="SDGs Aligned"    value={14}                              sub="of 17 goals"                 color="#0d9488" to="/sdg" />
        <StatCard icon={Activity}      label="Active Programs" value={5}                               sub="ESG improvement initiatives" color="#8b5cf6" to="/projects" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Subsidiary Risk Heatmap</div><Link to="/reports" className="btn btn-ghost btn-sm">Full Report</Link></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <THead cols={['Subsidiary', 'Risk Level', 'BRSR Progress', 'SDGs', 'QoQ Change']} />
              <tbody>
                {rows.map(r => (
                  <tr key={r.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <TD style={{ fontWeight: 700 }}>{r.name}</TD>
                    <TD><span className={`badge ${r.risk === 'Low' ? 'badge-green' : r.risk === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>{r.risk}</span></TD>
                    <TD><Prog v={r.brsr} /></TD>
                    <TD style={{ fontWeight: 600 }}>{r.sdg} / 17</TD>
                    <TD><span style={{ color: r.ch.startsWith('+') ? '#15803d' : '#ef4444', fontWeight: 700 }}>{r.ch}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Executive Actions</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            <QA to="/reports"                 icon={LineChart}     label="View ESG Reports"   desc="Board & SEBI-ready reports"        color="#1b365d" />
            <QA to="/compliance/gap-analysis" icon={AlertTriangle} label="Review Risk Alerts" desc="Critical compliance gaps"           color="#ef4444" />
            <QA to="/sdg"                     icon={Globe}         label="SDG Dashboard"      desc="Group SDG alignment status"         color="#0d9488" />
            <QA to="/compliance"              icon={Shield}        label="BRSR Readiness"     desc="Pre-submission compliance check"    color="#8b5cf6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 11. STAKEHOLDER Dashboard ───────────────────────────────────────────────
function StakeholderDash() {
  const { user } = useAuth();
  const [brsr, setBrsr] = useState(null);
  useEffect(() => { brsrApi.complianceSummary().catch(() => null).then(b => setBrsr(b?.data?.summary)); }, []);
  const reports = [
    { title: 'BRSR Annual Report FY 2024-25',   date: '01 Jul 2025', type: 'BRSR',          status: 'Published' },
    { title: 'ESG Performance Summary Q1 FY25', date: '15 Apr 2025', type: 'ESG',           status: 'Published' },
    { title: 'SDG Progress Report 2024',        date: '31 Mar 2025', type: 'SDG',           status: 'Published' },
    { title: 'Environmental Impact Assessment', date: '28 Feb 2025', type: 'Environmental', status: 'Published' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner role={user?.role} name={user?.name} subtitle="Access published ESG and BRSR disclosures. View sustainability performance and SDG alignment reports." cta="View Reports" ctaTo="/reports" gradient="linear-gradient(135deg,#0d9488 0%,#1b365d 100%)" />
      <WorkflowBar steps={['Access Reports', 'Review Performance', 'Check SDG Alignment', 'Monitor Compliance', 'Limited Exploration']} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
        <StatCard icon={FileText}    label="Published Reports" value={4}                               sub="available for download"   color="#0d9488" to="/reports" />
        <StatCard icon={Globe}       label="SDGs Aligned"      value={14}                             sub="of 17 goals"              color="#15803d" to="/sdg" />
        <StatCard icon={Shield}      label="BRSR Completion"   value={`${brsr?.completionPct ?? 71}%`} sub="FY 2025-26"             color="#1b365d" to="/compliance" />
        <StatCard icon={CheckCircle} label="Evidence Verified" value={18}                             sub="publicly auditable items" color="#3b82f6" />
      </div>
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Published Disclosures</div><Link to="/reports" className="btn btn-ghost btn-sm">All Reports</Link></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <THead cols={['Report Title', 'Type', 'Published Date', 'Status', 'Action']} />
            <tbody>
              {reports.map(r => (
                <tr key={r.title} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <TD style={{ fontWeight: 600 }}>{r.title}</TD>
                  <TD><span className="badge badge-blue" style={{ fontSize: '.67rem' }}>{r.type}</span></TD>
                  <TD style={{ color: 'var(--text-muted)' }}>{r.date}</TD>
                  <TD><span className="badge badge-green">{r.status}</span></TD>
                  <TD><Link to="/reports" className="btn btn-ghost btn-sm" style={{ fontSize: '.75rem' }}>View</Link></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div style={{ fontWeight: 700, fontSize: '.95rem' }}>Explore Disclosures</div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '.75rem' }}>
          <QA to="/reports"    icon={TrendingUp}  label="ESG Performance Reports" desc="View sustainability outcomes"  color="#0d9488" />
          <QA to="/sdg"        icon={Globe}       label="SDG Alignment"           desc="Contributions to 17 SDGs"      color="#15803d" />
          <QA to="/compliance" icon={ShieldCheck} label="Compliance Status"       desc="BRSR & regulatory adherence"   color="#1b365d" />
        </div>
      </div>
    </div>
  );
}

// ─── Master Dashboard Router ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'SUPER_ADMIN':        return <SuperAdminDash />;
    case 'ESG_ADMIN':          return <ESGAdminDash />;
    case 'GROUP_ESG_MANAGER':  return <GroupManagerDash />;
    case 'SUBSIDIARY_MANAGER': return <SubsidiaryDash />;
    case 'BU_MANAGER':         return <BUManagerDash />;
    case 'PROJECT_MANAGER':    return <ProjectManagerDash />;
    case 'DATA_CONTRIBUTOR':   return <ContributorDash />;
    case 'ESG_REVIEWER':       return <ReviewerDash />;
    case 'AUDITOR':            return <AuditorDash />;
    case 'EXECUTIVE':          return <ExecutiveDash />;
    case 'STAKEHOLDER':        return <StakeholderDash />;
    default:                   return <ProjectManagerDash />;
  }
}
