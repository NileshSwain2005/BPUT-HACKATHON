import React, { useEffect, useRef, useState } from 'react';
import { documentsApi, projectsApi } from '../../lib/api';
import { formatDate, formatFileSize } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, Trash2, Search } from 'lucide-react';

const DOC_TYPES = ['ANNUAL_REPORT','SUSTAINABILITY_REPORT','BOARD_RESOLUTION','POLICY_DOCUMENT','AUDIT_REPORT','BRSR_DRAFT','PROJECT_REPORT','FINANCIAL_STATEMENT','CERTIFICATE','OTHER'];

export default function Documents() {
  const { hasMinRole } = useAuth();
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef();
  const [uploadForm, setUploadForm] = useState({ name: '', projectId: '', documentType: 'OTHER', description: '', reportingYear: '' });

  const load = () => {
    documentsApi.list({ search: search || undefined, projectId: projectFilter || undefined, documentType: typeFilter || undefined })
      .then(r => setDocs(r.data.documents)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, projectFilter, typeFilter]);
  useEffect(() => { projectsApi.list({ limit: 100 }).then(r => setProjects(r.data.projects)); }, []);

  const uploadFile = async () => {
    if (!fileRef.current?.files[0]) return;
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    Object.entries(uploadForm).forEach(([k, v]) => v && fd.append(k, v));
    setUploading(true);
    try {
      await documentsApi.upload(fd);
      setShowUpload(false);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document?')) return;
    await documentsApi.delete(id);
    load();
  };

  const MIME_ICONS = { 'application/pdf': '📄', 'image/': '🖼️', 'application/msword': '📝', 'application/vnd': '📊', 'text/': '📃' };
  const getIcon = (mime) => Object.entries(MIME_ICONS).find(([k]) => mime?.startsWith(k))?.[1] || '📁';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Documents</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>Source documents and evidence repository</p>
        </div>
        {hasMinRole('DATA_CONTRIBUTOR') && (
          <button onClick={() => setShowUpload(true)} className="btn btn-primary btn-md"><Upload size={17} /> Upload Document</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="form-select" style={{ maxWidth: 200 }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: 200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1' }}><div className="empty-state"><FileText size={40} style={{ color: 'var(--text-muted)' }} /><div><h3>No documents</h3><p className="text-secondary">Upload your first document to get started</p></div></div></div>
        ) : (
          docs.map(d => (
            <div key={d.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{getIcon(d.mimeType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', lineHeight: 1.4 }} className="truncate-2">{d.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{formatFileSize(d.fileSize)} · {d.documentType.replace(/_/g, ' ')}</div>
                    {d.project && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{d.project.name}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.875rem', paddingTop: '.875rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{formatDate(d.createdAt)}</span>
                  <div style={{ display: 'flex', gap: '.375rem' }}>
                    <span className="badge badge-gray">{d._count?.evidence || 0} evidence</span>
                    {hasMinRole('SUBSIDIARY_MANAGER') && (
                      <button onClick={() => deleteDoc(d.id)} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showUpload && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Upload Document</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label form-required">File</label>
                <input type="file" ref={fileRef} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" className="form-input" style={{ padding: '.5rem' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" placeholder="Leave blank to use filename" value={uploadForm.name} onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select className="form-select" value={uploadForm.documentType} onChange={e => setUploadForm(f => ({ ...f, documentType: e.target.value }))}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reporting Year</label>
                  <input className="form-input" placeholder="e.g. FY 2025-26" value={uploadForm.reportingYear} onChange={e => setUploadForm(f => ({ ...f, reportingYear: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-select" value={uploadForm.projectId} onChange={e => setUploadForm(f => ({ ...f, projectId: e.target.value }))}>
                  <option value="">Not project-specific</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowUpload(false)} className="btn btn-secondary btn-md">Cancel</button>
              <button onClick={uploadFile} className="btn btn-primary btn-md" disabled={uploading}>
                {uploading ? <span className="spinner spinner-sm" /> : <Upload size={15} />}
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
