import React, { useEffect, useState } from 'react';
import { reportsApi, brsrApi, projectsApi } from '../../lib/api';
import { formatNumber, formatDate } from '../../lib/utils';
import { FileText, Download, Printer, Filter, CheckCircle2, Clock, AlertCircle, BarChart3, TrendingUp, Layers } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('brsr'); // 'brsr' | 'kpi'
  const [periods, setPeriods] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  
  const [brsrData, setBrsrData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load periods & projects
  useEffect(() => {
    Promise.all([
      brsrApi.getPeriods(),
      projectsApi.list({ limit: 100 })
    ]).then(([pRes, projRes]) => {
      const pers = pRes.data.periods || [];
      setPeriods(pers);
      const current = pers.find(p => p.isCurrent) || pers[0];
      if (current) setSelectedPeriod(current.id);
      setProjects(projRes.data.projects || []);
    }).catch(console.error);
  }, []);

  // Fetch report data when filter or tab changes
  useEffect(() => {
    if (!selectedPeriod) return;
    setLoading(true);

    if (activeTab === 'brsr') {
      reportsApi.brsrSummary({ reportingPeriodId: selectedPeriod })
        .then(res => setBrsrData(res.data.report))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      reportsApi.esgKpi({ reportingPeriodId: selectedPeriod, projectId: selectedProject || undefined })
        .then(res => setKpiData(res.data.report))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedPeriod, selectedProject]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (activeTab === 'brsr' && brsrData) {
      let rows = [['Section', 'Question Code', 'Question', 'Status', 'Response Value']];
      Object.entries(brsrData.bySection || {}).forEach(([sec, list]) => {
        list.forEach(r => {
          rows.push([
            sec,
            r.question?.questionCode || '',
            `"${(r.question?.text || '').replace(/"/g, '""')}"`,
            r.status,
            `"${(r.responseValue || '').replace(/"/g, '""')}"`
          ]);
        });
      });
      const csv = rows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BRSR_Report_${selectedPeriod}.csv`;
      a.click();
    } else if (activeTab === 'kpi' && kpiData) {
      let rows = [['Category', 'Metric Code', 'Metric Name', 'Project', 'Value', 'Unit', 'Verified']];
      (kpiData.values || []).forEach(v => {
        rows.push([
          v.metric?.category || '',
          v.metric?.code || '',
          `"${(v.metric?.name || '').replace(/"/g, '""')}"`,
          `"${(v.project?.name || 'All').replace(/"/g, '""')}"`,
          v.numericValue ?? v.stringValue ?? '',
          v.metric?.unit || '',
          v.isVerified ? 'Yes' : 'No'
        ]);
      });
      const csv = rows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESG_KPI_Report_${selectedPeriod}.csv`;
      a.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>ESG & BRSR Reports</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Generate formal regulatory disclosures, stakeholder summaries, and ESG performance metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print this report">
            <Printer size={16} /> Print
          </button>
          <button onClick={exportCSV} className="btn btn-primary btn-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Subheader Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('brsr')}
              style={{
                padding: '.5rem 1rem',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === 'brsr' ? 700 : 500,
                color: activeTab === 'brsr' ? 'var(--color-brand-500)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'brsr' ? '3px solid var(--color-brand-500)' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                fontSize: '.9rem',
              }}
            >
              <FileText size={16} /> BRSR Disclosure Report
            </button>
            <button
              onClick={() => setActiveTab('kpi')}
              style={{
                padding: '.5rem 1rem',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === 'kpi' ? 700 : 500,
                color: activeTab === 'kpi' ? 'var(--color-brand-500)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'kpi' ? '3px solid var(--color-brand-500)' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                fontSize: '.9rem',
              }}
            >
              <BarChart3 size={16} /> ESG Performance KPIs
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span className="text-secondary" style={{ fontSize: '.85rem' }}>Reporting Period:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'kpi' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span className="text-secondary" style={{ fontSize: '.85rem' }}>Project:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'brsr' ? (
        /* BRSR Report View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {brsrData?.period && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{brsrData.period.organization?.name}</h3>
                  <div className="text-secondary" style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
                    Reporting Period: <strong>{brsrData.period.name}</strong> ({formatDate(brsrData.period.startDate)} - {formatDate(brsrData.period.endDate)})
                  </div>
                  <div className="text-secondary" style={{ fontSize: '.85rem' }}>
                    Boundary: {brsrData.period.boundary || 'Standalone'} | Generated on {formatDate(brsrData.generatedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', background: 'var(--bg-raised)', padding: '.75rem 1.25rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-500)' }}>
                      {Object.values(brsrData.bySection || {}).flat().length}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '.75rem' }}>Disclosed Items</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-raised)', padding: '.75rem 1.25rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                      {Object.values(brsrData.bySection || {}).flat().filter(r => r.status === 'APPROVED').length}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '.75rem' }}>Approved</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {Object.entries(brsrData?.bySection || {}).map(([secKey, items]) => (
            <div key={secKey} className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header" style={{ background: 'var(--bg-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Section {secKey}: {secKey === 'A' ? 'General Disclosures' : secKey === 'B' ? 'Management & Process Disclosures' : 'Principle-wise Performance'}
                </div>
                <span className="badge badge-neutral">{items.length} questions</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '.75rem 1rem', width: '120px' }}>Code</th>
                      <th style={{ padding: '.75rem 1rem' }}>Question</th>
                      <th style={{ padding: '.75rem 1rem' }}>Response</th>
                      <th style={{ padding: '.75rem 1rem', width: '120px' }}>Status</th>
                      <th style={{ padding: '.75rem 1rem', width: '100px' }}>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                        <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>{r.question?.questionCode}</td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          <div>{r.question?.text}</div>
                          {r.question?.principle && (
                            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>P{r.question.principle.number}: {r.question.principle.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '.75rem 1rem', maxWidth: '300px' }}>
                          <span style={{ wordBreak: 'break-word' }}>{r.responseValue || <em className="text-secondary">Not provided</em>}</span>
                        </td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          <span className={`badge ${
                            r.status === 'APPROVED' ? 'badge-success' :
                            r.status === 'UNDER_REVIEW' ? 'badge-warning' :
                            r.status === 'SUBMITTED' ? 'badge-info' : 'badge-neutral'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          {r.evidenceLinks?.length > 0 ? (
                            <span className="badge badge-success">{r.evidenceLinks.length} files</span>
                          ) : (
                            <span className="text-secondary" style={{ fontSize: '.8rem' }}>None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ESG KPI View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].map(cat => {
            const list = kpiData?.byCategory?.[cat] || [];
            const catColor = cat === 'ENVIRONMENTAL' ? '#10b981' : cat === 'SOCIAL' ? '#3b82f6' : '#8b5cf6';
            return (
              <div key={cat} className="card" style={{ overflow: 'hidden' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor }} />
                    <span style={{ fontWeight: 700 }}>{cat} PILLAR METRICS</span>
                  </div>
                  <span className="badge badge-neutral">{list.length} recorded</span>
                </div>
                {list.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recorded metric values in {cat} pillar for this selection.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '.75rem 1rem' }}>Metric Code</th>
                          <th style={{ padding: '.75rem 1rem' }}>Metric Name</th>
                          <th style={{ padding: '.75rem 1rem' }}>Project</th>
                          <th style={{ padding: '.75rem 1rem' }}>Value</th>
                          <th style={{ padding: '.75rem 1rem' }}>Unit</th>
                          <th style={{ padding: '.75rem 1rem' }}>Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map(v => (
                          <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                            <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>{v.metric?.code}</td>
                            <td style={{ padding: '.75rem 1rem' }}>{v.metric?.name}</td>
                            <td style={{ padding: '.75rem 1rem' }}>{v.project?.name || 'Corporate'}</td>
                            <td style={{ padding: '.75rem 1rem', fontWeight: 700 }}>
                              {v.numericValue !== null ? formatNumber(v.numericValue) : (v.stringValue || '-')}
                            </td>
                            <td style={{ padding: '.75rem 1rem' }} className="text-secondary">{v.metric?.unit || '-'}</td>
                            <td style={{ padding: '.75rem 1rem' }}>
                              {v.isVerified ? (
                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                                  <CheckCircle2 size={12} /> Verified
                                </span>
                              ) : (
                                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                                  <Clock size={12} /> Unverified
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
