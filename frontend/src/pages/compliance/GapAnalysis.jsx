import React, { useEffect, useState } from 'react';
import { complianceApi, brsrApi } from '../../lib/api';
import { COMPLIANCE_STATUS_COLORS } from '../../lib/utils';
import { AlertTriangle, CheckCircle, Clock, Search, Filter } from 'lucide-react';

const STATUS_ICONS = { COMPLIANT: CheckCircle, PARTIALLY_COMPLIANT: Clock, MISSING: AlertTriangle, INVALID: AlertTriangle };

export default function GapAnalysis() {
  const [gaps, setGaps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
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
    setLoading(true);
    complianceApi.gapAnalysis({ reportingPeriodId: selectedPeriod })
      .then(r => { setGaps(r.data.gaps); setSummary(r.data.summary); })
      .finally(() => setLoading(false));
  }, [selectedPeriod]);

  const filtered = gaps.filter(g => {
    if (statusFilter && g.complianceStatus !== statusFilter) return false;
    if (search && !g.questionText?.toLowerCase().includes(search.toLowerCase()) && !g.questionCode?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Gap Analysis</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>Identify missing and incomplete BRSR disclosures</p>
        </div>
        <select className="form-select" style={{ maxWidth: 220 }} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
          {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Summary chips */}
      {summary && (
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          {Object.entries({ COMPLIANT: summary.COMPLIANT, PARTIALLY_COMPLIANT: summary.PARTIALLY_COMPLIANT, MISSING: summary.MISSING, PENDING_REVIEW: summary.PENDING_REVIEW }).map(([status, count]) => (
            <button key={status}
              onClick={() => setStatusFilter(s => s === status ? '' : status)}
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                padding: '.5rem 1rem', borderRadius: 99, cursor: 'pointer',
                border: `1.5px solid ${statusFilter === status ? 'currentColor' : 'transparent'}`,
                background: statusFilter === status ? 'transparent' : 'var(--bg-raised)',
                fontWeight: 600, fontSize: '.8rem', transition: 'all .2s',
              }}
              className={COMPLIANCE_STATUS_COLORS[status]?.replace('badge-', 'text-')}
            >
              <span className={`badge ${COMPLIANCE_STATUS_COLORS[status]}`} style={{ fontSize: '.65rem' }}>{status.replace('_', ' ')}</span>
              <span style={{ fontWeight: 700 }}>{count}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
            Completion: <strong style={{ color: 'var(--color-brand-600)' }}>{summary.completionPct}%</strong>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search indicators…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      {/* Gap list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtered.length === 0 ? (
            <div className="card"><div className="empty-state"><CheckCircle size={40} style={{ color: '#2a9d7c' }} /><div><h3>No gaps found</h3><p className="text-secondary">All disclosures match current filter criteria</p></div></div></div>
          ) : (
            filtered.map(g => {
              const Icon = STATUS_ICONS[g.complianceStatus] || AlertTriangle;
              return (
                <div key={g.questionId} className="card">
                  <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <span className={`badge ${COMPLIANCE_STATUS_COLORS[g.complianceStatus] || 'badge-gray'}`}>
                        {g.complianceStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.375rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.72rem', color: 'var(--color-brand-600)', background: 'var(--color-brand-100)', padding: '.15rem .5rem', borderRadius: 4 }}>{g.questionCode}</span>
                        {g.section && <span className="badge badge-gray" style={{ fontSize: '.65rem' }}>{g.section}</span>}
                        {g.principle && <span className="badge badge-blue" style={{ fontSize: '.65rem' }}>{g.principle}</span>}
                        {g.isMandatory && <span className="badge badge-red" style={{ fontSize: '.65rem' }}>ESSENTIAL</span>}
                        {g.indicatorType && <span className="badge badge-gray" style={{ fontSize: '.65rem' }}>{g.indicatorType}</span>}
                      </div>
                      <p style={{ fontSize: '.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{g.questionText}</p>
                      {g.gapReason && (
                        <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <AlertTriangle size={13} color="#f59e0b" />
                          <span style={{ fontSize: '.775rem', color: 'var(--text-muted)' }}>{g.gapReason}</span>
                        </div>
                      )}
                    </div>
                    {g.evidenceStatus && (
                      <div style={{ flexShrink: 0, textAlign: 'right', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                        Evidence: {g.evidenceStatus.verified}/{g.evidenceStatus.total}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
