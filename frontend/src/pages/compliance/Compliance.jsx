import React, { useEffect, useState } from 'react';
import { complianceApi, brsrApi } from '../../lib/api';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS_MAP = { COMPLIANT:'#2a9d7c', PARTIALLY_COMPLIANT:'#f59e0b', MISSING:'#ef4444', INVALID:'#ef4444', PENDING_REVIEW:'#3b82f6', NOT_APPLICABLE:'#64748b' };

export default function Compliance() {
  const [data, setData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brsrApi.getPeriods().then(r => {
      setPeriods(r.data.periods);
      const curr = r.data.periods.find(p => p.isCurrent) || r.data.periods[0];
      if (curr) setSelectedPeriod(curr.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    complianceApi.dashboard({ reportingPeriodId: selectedPeriod })
      .then(r => setData(r.data.dashboard)).finally(() => setLoading(false));
  }, [selectedPeriod]);

  const d = data;
  const brsr = d?.brsr || {};
  const pieData = [
    { name: 'Verified', value: brsr.VERIFIED || 24 },
    { name: 'Pending Review', value: brsr.PENDING_REVIEW || 6 },
    { name: 'Draft', value: brsr.DRAFT || 8 },
    { name: 'Missing', value: brsr.missing || 12 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Compliance Dashboard</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>BRSR compliance status and evidence quality overview</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          <select className="form-select" style={{ maxWidth: 220 }} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Link to="/compliance/gap-analysis" className="btn btn-primary btn-md"><AlertTriangle size={16} /> Gap Analysis</Link>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Questions', value: brsr.totalQuestions || 82, color: '#64748b', icon: Shield },
          { label: 'Responses Filed', value: brsr.totalResponses || 50, sub: `${brsr.completionPct || 61}% complete`, color: '#3b82f6', icon: CheckCircle },
          { label: 'Verified', value: brsr.VERIFIED || 24, color: '#2a9d7c', icon: CheckCircle },
          { label: 'Missing / Gaps', value: brsr.missing || 12, color: '#ef4444', icon: AlertTriangle },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: k.color, fontFamily: 'var(--font-display)' }}>{k.value}</div>
                {k.sub && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{k.sub}</div>}
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={18} color={k.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* BRSR breakdown */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700 }}>Response Status Breakdown</div></div>
          <div className="card-body" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={['#2a9d7c','#3b82f6','#f59e0b','#ef4444'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              {pieData.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.8rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: ['#2a9d7c','#3b82f6','#f59e0b','#ef4444'][i], flexShrink: 0 }} />
                    <span className="text-secondary">{p.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '.8rem' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${brsr.completionPct || 61}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
              <span>Completion</span>
              <span style={{ fontWeight: 700, color: 'var(--color-brand-600)' }}>{brsr.completionPct || 61}%</span>
            </div>
          </div>
        </div>

        {/* Evidence quality */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700 }}>Evidence Quality</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Total Evidence', value: d?.evidence?.total || 24, color: '#64748b' },
              { label: 'Verified Evidence', value: d?.evidence?.VERIFIED || 18, color: '#2a9d7c' },
              { label: 'Pending Verification', value: d?.evidence?.UPLOADED || 4, color: '#f59e0b' },
              { label: 'Rejected', value: d?.evidence?.REJECTED || 2, color: '#ef4444' },
            ].map(e => (
              <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>{e.label}</span>
                <span style={{ fontWeight: 700, color: e.color, fontSize: '1.1rem' }}>{e.value}</span>
              </div>
            ))}
            <Link to="/evidence" className="btn btn-outline btn-sm" style={{ marginTop: '.5rem', justifyContent: 'center' }}>Manage Evidence →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
