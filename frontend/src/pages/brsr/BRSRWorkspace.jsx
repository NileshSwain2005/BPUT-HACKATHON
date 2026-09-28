import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brsrApi, projectsApi } from '../../lib/api';
import { RESPONSE_STATUS_COLORS } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Search, ChevronRight, Filter } from 'lucide-react';

export default function BRSRWorkspace() {
  const { hasMinRole } = useAuth();
  const [sections, setSections] = useState([]);
  const [principles, setPrinciples] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [activePrinciple, setActivePrinciple] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([brsrApi.getSections(), brsrApi.getPrinciples(), brsrApi.getPeriods()])
      .then(([s, p, rp]) => {
        setSections(s.data.sections);
        setPrinciples(p.data.principles);
        setPeriods(rp.data.periods);
        const curr = rp.data.periods.find(x => x.isCurrent) || rp.data.periods[0];
        if (curr) setSelectedPeriod(curr.id);
        if (s.data.sections.length > 0) setActiveSection(s.data.sections[0].id);
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeSection) return;
    const params = { sectionId: activeSection, principleId: activePrinciple || undefined, search: search || undefined };
    brsrApi.getQuestions(params).then(r => setQuestions(r.data.questions));
  }, [activeSection, activePrinciple, search]);

  useEffect(() => {
    if (!selectedPeriod) return;
    brsrApi.getResponses({ reportingPeriodId: selectedPeriod, sectionId: activeSection || undefined, limit: 200 })
      .then(r => setResponses(r.data.responses));
  }, [selectedPeriod, activeSection]);

  const getResponse = (questionId) => responses.find(r => r.questionId === questionId);

  const sectionPrinciples = principles.filter(p => {
    const sec = sections.find(s => s.id === activeSection);
    return sec?.code === 'C' ? true : !p;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>BRSR Workspace</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>Business Responsibility & Sustainability Reporting — structured response entry</p>
        </div>
        <select className="form-select" style={{ maxWidth: 240 }} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
          {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left nav */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <div style={{ padding: '.875rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '.875rem' }}>Sections</div>
          <nav style={{ padding: '.5rem' }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); setActivePrinciple(''); }}
                className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '.8rem' }}
              >
                <span style={{ fontWeight: 800, color: 'var(--color-brand-600)', fontSize: '.7rem' }}>{s.code}</span>
                {s.name}
              </button>
            ))}
          </nav>

          {sections.find(s => s.id === activeSection)?.code === 'C' && (
            <>
              <div style={{ padding: '.875rem 1rem .5rem', borderTop: '1px solid var(--border-color)', fontWeight: 700, fontSize: '.8rem', color: 'var(--text-muted)' }}>Principles</div>
              <nav style={{ padding: '.5rem' }}>
                <button onClick={() => setActivePrinciple('')} className={`nav-item ${!activePrinciple ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start', fontSize: '.75rem' }}>All Principles</button>
                {principles.map(p => (
                  <button key={p.id} onClick={() => setActivePrinciple(p.id)} className={`nav-item ${activePrinciple === p.id ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start', fontSize: '.75rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-brand-600)', fontSize: '.65rem' }}>{p.code}</span>
                    {p.name}
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Right content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search indicators…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>

          {questions.length === 0 ? (
            <div className="card"><div className="empty-state"><ClipboardList size={36} style={{ color: 'var(--text-muted)' }} /><p className="text-secondary">No questions found for selected filters</p></div></div>
          ) : (
            questions.map(q => {
              const resp = getResponse(q.id);
              const status = resp?.status || 'MISSING';
              return (
                <div key={q.id} className="card" style={{ transition: 'transform .15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.7rem', color: 'var(--color-brand-600)', background: 'var(--color-brand-100)', padding: '.15rem .5rem', borderRadius: 4 }}>
                          {q.questionCode}
                        </div>
                        {q.isMandatory && <div style={{ fontSize: '.6rem', color: 'var(--color-danger)', fontWeight: 700, marginTop: 4, textAlign: 'center' }}>ESSENTIAL</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '.875rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>{q.text}</p>
                        {resp?.response && (
                          <div style={{ marginTop: '.625rem', padding: '.75rem', background: 'var(--bg-raised)', borderRadius: 8, borderLeft: '3px solid var(--color-brand-500)', fontSize: '.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {resp.response}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
                        <span className={`badge ${RESPONSE_STATUS_COLORS[status] || 'badge-gray'}`}>{status.replace('_', ' ')}</span>
                        {hasMinRole('DATA_CONTRIBUTOR') && (
                          <Link to={`/brsr/response/${q.id}?periodId=${selectedPeriod}`} className="btn btn-outline btn-sm">
                            {resp ? 'Edit' : 'Respond'} <ChevronRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                    {resp?.evidenceLinks?.length > 0 && (
                      <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Evidence: </span>
                        {resp.evidenceLinks.map(l => (
                          <span key={l.evidenceId} className={`badge ${l.evidence?.status === 'VERIFIED' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '.65rem' }}>
                            {l.evidence?.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
