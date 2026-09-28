import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { brsrApi, evidenceApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { RESPONSE_STATUS_COLORS, REVIEWER_ROLES } from '../../lib/utils';

export default function BRSRResponsePage() {
  const { id: questionId } = useParams();
  const [searchParams] = useSearchParams();
  const periodId = searchParams.get('periodId');
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [question, setQuestion] = useState(null);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [text, setText] = useState('');
  const [notApplicable, setNotApplicable] = useState(false);
  const [naReason, setNaReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [showReview, setShowReview] = useState(false);

  const isReviewer = hasRole(...REVIEWER_ROLES);

  useEffect(() => {
    brsrApi.getQuestions({ search: '' }).then(r => {
      const q = r.data.questions.find(q => q.id === questionId);
      setQuestion(q);
    });
    brsrApi.getResponses({ questionId, reportingPeriodId: periodId }).then(r => {
      const resp = r.data.responses[0];
      setResponse(resp);
      if (resp) { setText(resp.response || ''); setNotApplicable(resp.applicability === false); setNaReason(resp.naReason || ''); }
    });
    evidenceApi.list({ limit: 100 }).then(r => setEvidenceList(r.data.evidence));
    setLoading(false);
  }, [questionId, periodId]);

  const save = async () => {
    setSaving(true);
    try {
      await brsrApi.saveResponse({ questionId, reportingPeriodId: periodId, response: text, applicability: !notApplicable, naReason: notApplicable ? naReason : undefined });
      navigate(-1);
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const submit = async () => {
    if (!response?.id) { await save(); return; }
    setSaving(true);
    try {
      await brsrApi.submitResponse(response.id);
      navigate(-1);
    } catch (err) { alert(err.response?.data?.message || 'Submit failed'); }
    finally { setSaving(false); }
  };

  const review = async (action) => {
    setSaving(true);
    try {
      await brsrApi.reviewResponse(response.id, action, reviewNote);
      navigate(-1);
    } catch (err) { alert(err.response?.data?.message || 'Review action failed'); }
    finally { setSaving(false); }
  };

  if (loading || !question) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back to Workspace</button>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '.8rem', color: 'var(--color-brand-600)', background: 'var(--color-brand-100)', padding: '.25rem .75rem', borderRadius: 6, flexShrink: 0, marginTop: 4 }}>
            {question.questionCode}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>{question.text}</h3>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-brand">{question.section?.name}</span>
              {question.principle && <span className="badge badge-blue">{question.principle?.code} — {question.principle?.name}</span>}
              {question.isMandatory && <span className="badge badge-red">Essential Indicator</span>}
              {question.indicatorType && <span className="badge badge-gray">{question.indicatorType.replace('_', ' ')}</span>}
              {response && <span className={`badge ${RESPONSE_STATUS_COLORS[response.status]}`}>{response.status}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Response form */}
      <div className="card">
        <div className="card-header">
          <h4 style={{ fontWeight: 700, fontSize: '.95rem' }}>Response</h4>
          {question.isMandatory && <span className="badge badge-red">Required</span>}
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.875rem', fontWeight: 500 }}>
              <input type="checkbox" checked={notApplicable} onChange={e => setNotApplicable(e.target.checked)} />
              Mark as Not Applicable
            </label>
          </div>
          {notApplicable ? (
            <div className="form-group">
              <label className="form-label">Reason for Non-Applicability</label>
              <textarea className="form-textarea" rows={2} value={naReason} onChange={e => setNaReason(e.target.value)} placeholder="Explain why this indicator does not apply…" />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label form-required">Response</label>
              <textarea
                className="form-textarea"
                rows={8}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter your complete response to this indicator. Be specific, quantitative where possible, and reference evidence…"
              />
            </div>
          )}
        </div>

        {/* Reviewer section */}
        {isReviewer && response && (
          <div style={{ margin: '0 1.5rem 1.25rem', padding: '1rem', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '.875rem', marginBottom: '.875rem' }}>Review Actions</div>
            <div className="form-group" style={{ marginBottom: '.875rem' }}>
              <label className="form-label">Reviewer Notes</label>
              <textarea className="form-textarea" rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add review notes or feedback…" />
            </div>
            <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
              <button onClick={() => review('APPROVED')} className="btn btn-sm" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }} disabled={saving}>
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => review('REJECTED')} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }} disabled={saving}>
                <XCircle size={14} /> Reject
              </button>
              <button onClick={() => review('REVISION_REQUESTED')} className="btn btn-sm" style={{ background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' }} disabled={saving}>
                <RotateCcw size={14} /> Request Revision
              </button>
              <button onClick={() => review('VERIFIED')} className="btn btn-sm" style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)', border: '1px solid var(--color-brand-300)' }} disabled={saving}>
                <CheckCircle size={14} /> Verify & Finalize
              </button>
            </div>
          </div>
        )}

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={save} className="btn btn-secondary btn-md" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={15} />}
            Save Draft
          </button>
          <button onClick={submit} className="btn btn-primary btn-md" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Send size={15} />}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
