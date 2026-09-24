import React, { useEffect, useState } from 'react';
import { esgApi, projectsApi, brsrApi, workflowApi } from '../../lib/api';
import { ArrowLeft, Save, CheckCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ESGMetricEntry() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState({ metricId: '', projectId: '', reportingPeriodId: '', value: '', textValue: '', unit: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([esgApi.listMetrics(), projectsApi.list({ limit: 100 }), brsrApi.getPeriods()])
      .then(([m, p, rp]) => {
        setMetrics(m.data.metrics);
        setProjects(p.data.projects);
        setPeriods(rp.data.periods);
        const curr = rp.data.periods.find(p => p.isCurrent) || rp.data.periods[0];
        if (curr) setForm(f => ({ ...f, reportingPeriodId: curr.id }));
      });
  }, []);

  const selectedMetric = metrics.find(m => m.id === form.metricId);

  const submit = async (andSubmit = false) => {
    if (!form.metricId || !form.projectId || !form.reportingPeriodId) { setError('Please select metric, project, and reporting period'); return; }
    if (!form.value && !form.textValue) { setError('Please enter a value'); return; }
    setSaving(true); setError('');
    try {
      const res = await esgApi.submitValue({
        ...form,
        value: form.value !== '' && form.value !== null ? Number(form.value) : undefined,
        evidenceId: form.evidenceId || null,
        submitForReview: andSubmit,
      });
      // If 'Submit for Review' was clicked, ensure workflow transition is recorded
      if (andSubmit && res.data?.metricValue?.id) {
        try {
          await workflowApi.transition(res.data.metricValue.id, 'submit');
        } catch (wfErr) {
          // Already transitioned to SUBMITTED by backend upsert
        }
      }
      setSuccess(andSubmit ? 'Data submitted for review!' : 'Data saved as draft!');
      setTimeout(() => setSuccess(false), 3500);
      setForm(f => ({ ...f, value: '', textValue: '', notes: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button onClick={() => navigate('/esg-metrics')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Enter ESG Metric Data</h2>
        <p className="text-secondary" style={{ fontSize: '.875rem' }}>Submit metric values for a specific project and reporting period</p>
      </div>

      <div className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={16} /> {typeof success === 'string' ? success : 'Data submitted successfully!'}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label form-required">Metric</label>
              <select className="form-select" value={form.metricId} onChange={e => setForm(f => ({ ...f, metricId: e.target.value }))}>
                <option value="">Select metric…</option>
                {metrics.map(m => <option key={m.id} value={m.id}>[{m.category}] {m.name} ({m.unit || 'no unit'})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-required">Project</label>
              <select className="form-select" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select project…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label form-required">Reporting Period</label>
              <select className="form-select" value={form.reportingPeriodId} onChange={e => setForm(f => ({ ...f, reportingPeriodId: e.target.value }))}>
                {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {selectedMetric && (
            <div style={{ padding: '1rem', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: '.375rem' }}>{selectedMetric.name}</div>
              {selectedMetric.description && <p className="text-secondary" style={{ fontSize: '.8rem', lineHeight: 1.6 }}>{selectedMetric.description}</p>}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.5rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
                <span>Category: <strong>{selectedMetric.category}</strong></span>
                <span>Unit: <strong>{selectedMetric.unit || '—'}</strong></span>
                <span>Type: <strong>{selectedMetric.dataType}</strong></span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {(!selectedMetric || selectedMetric.dataType !== 'TEXT') && (
              <div className="form-group">
                <label className="form-label">Numeric Value</label>
                <input type="number" className="form-input" placeholder="e.g. 1250.5" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} step="any" />
              </div>
            )}
            {selectedMetric?.dataType === 'TEXT' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Text Value</label>
                <textarea className="form-textarea" rows={2} value={form.textValue} onChange={e => setForm(f => ({ ...f, textValue: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Unit Override</label>
              <input className="form-input" placeholder={selectedMetric?.unit || 'e.g. tCO₂e'} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
              <div className="form-hint">Leave blank to use metric default</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Methodology</label>
            <textarea className="form-textarea" rows={2} placeholder="Describe calculation method, data source, or any caveats…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
          <button onClick={() => navigate('/esg-metrics')} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={() => submit(false)} className="btn btn-ghost btn-md" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={16} />}
            Save Draft
          </button>
          <button onClick={() => submit(true)} className="btn btn-primary btn-md" disabled={saving}
            style={{ background: '#15803d', borderColor: '#15803d', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            {saving ? <span className="spinner spinner-sm" /> : <Send size={16} />}
            {saving ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
