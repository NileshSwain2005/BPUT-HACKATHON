import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, orgsApi } from '../../lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '', location: '', state: '', sector: '', subsector: '', startDate: '', endDate: '', budget: '', organizationId: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { orgsApi.list().then(r => setOrgs(r.data.organizations)); }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    if (!form.organizationId) errs.organizationId = 'Organization is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await projectsApi.create({ ...form, budget: form.budget ? Number(form.budget) : undefined });
      navigate('/projects');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project';
      setErrors(e => ({ ...e, form: msg }));
    } finally { setSaving(false); }
  };

  const SECTORS = ['Water & Sanitation','Renewable Energy','Infrastructure','Roads & Highways','Power Transmission','Urban Development','Industrial','Healthcare','Education','Agriculture','Mining','Manufacturing','IT/Technology','Other'];
  const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

  const Field = ({ label, name, type = 'text', placeholder, required, options, span }) => (
    <div style={span ? { gridColumn: 'span 2' } : {}}>
      <div className="form-group">
        <label className={`form-label ${required ? 'form-required' : ''}`}>{label}</label>
        {options ? (
          <select className={`form-select ${errors[name] ? 'error' : ''}`} value={form[name]} onChange={e => set(name, e.target.value)}>
            <option value="">Select {label}</option>
            {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input type={type} className={`form-input ${errors[name] ? 'error' : ''}`} placeholder={placeholder} value={form[name]} onChange={e => set(name, e.target.value)} />
        )}
        {errors[name] && <div className="form-error">{errors[name]}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button onClick={() => navigate('/projects')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Create New Project</h2>
        <p className="text-secondary" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>Add a project to start tracking ESG metrics and BRSR evidence</p>
      </div>

      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Project Details</h3></div>
        <div className="card-body">
          {errors.form && <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>{errors.form}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Project Name" name="name" placeholder="e.g. Odisha Water Supply Project" required span />
            <Field label="Project Code" name="code" placeholder="e.g. MEIL-OD-001" />
            <Field label="Organization" name="organizationId" required options={orgs.map(o => ({ value: o.id, label: `${o.name} (${o.type})` }))} />
            <Field label="Sector" name="sector" options={SECTORS} />
            <Field label="Sub-sector" name="subsector" placeholder="e.g. Rural Water Supply" />
            <Field label="Location / City" name="location" placeholder="e.g. Bhubaneswar" />
            <Field label="State" name="state" options={STATES} />
            <Field label="Start Date" name="startDate" type="date" />
            <Field label="Expected End Date" name="endDate" type="date" />
            <Field label="Budget (₹)" name="budget" type="number" placeholder="e.g. 250000000" />
            <div style={{ gridColumn: 'span 2' }}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Brief description of the project scope, objectives and coverage…" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
          <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={submit} className="btn btn-primary btn-md" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Save size={16} />}
            {saving ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
