import React, { useEffect, useState } from 'react';
import { auditApi } from '../../lib/api';
import { formatDate, formatRole } from '../../lib/utils';
import { ShieldAlert, Filter, Search, ChevronLeft, ChevronRight, Activity, Database, Lock } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    auditApi.list({
      action: actionFilter || undefined,
      entityType: entityFilter || undefined,
      page,
      limit: 20,
    })
      .then(res => {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, actionFilter, entityFilter]);

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATE') || action.includes('APPROVED')) return 'badge-success';
    if (action.includes('UPDATE') || action.includes('SUBMIT')) return 'badge-info';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'badge-danger';
    return 'badge-neutral';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>System Audit Trail</h2>
          <p className="text-secondary" style={{ fontSize: '.875rem' }}>
            Immutable compliance event log tracking data modifications, reviews, approvals, and access
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--bg-raised)', padding: '.4rem .8rem', borderRadius: 8, fontSize: '.85rem' }}>
          <Lock size={15} className="text-brand" />
          <span style={{ fontWeight: 600 }}>Tamper-Evident Ledger</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Filter size={16} className="text-secondary" />
            <span className="text-secondary" style={{ fontSize: '.85rem' }}>Action:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Actions</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="ORG_CREATED">ORG_CREATED</option>
              <option value="RESPONSE_SUBMITTED">RESPONSE_SUBMITTED</option>
              <option value="RESPONSE_REVIEWED">RESPONSE_REVIEWED</option>
              <option value="EVIDENCE_VERIFIED">EVIDENCE_VERIFIED</option>
              <option value="METRIC_SUBMITTED">METRIC_SUBMITTED</option>
              <option value="METRIC_VERIFIED">METRIC_VERIFIED</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Database size={16} className="text-secondary" />
            <span className="text-secondary" style={{ fontSize: '.85rem' }}>Entity:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.4rem .8rem', fontSize: '.85rem' }}
              value={entityFilter}
              onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Organization">Organization</option>
              <option value="BRSRResponse">BRSR Response</option>
              <option value="Evidence">Evidence</option>
              <option value="ESGMetricValue">ESG Metric Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Recorded Events ({total})</div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
            Page {page} of {pages}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit log entries match the selected criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '.8rem', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '.75rem 1rem' }}>Entity</th>
                  <th style={{ padding: '.75rem 1rem' }}>Details / Description</th>
                  <th style={{ padding: '.75rem 1rem' }}>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '.85rem' }}>
                    <td style={{ padding: '.75rem 1rem', whiteSpace: 'nowrap' }} className="text-secondary">
                      {formatDate(log.createdAt)}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      {log.user ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{log.user.name}</div>
                          <div className="text-secondary" style={{ fontSize: '.75rem' }}>{formatRole(log.user.role)}</div>
                        </div>
                      ) : (
                        <span className="text-secondary">System</span>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div>{log.entityType}</div>
                      {log.entityId && (
                        <div className="text-secondary" style={{ fontSize: '.7rem', fontFamily: 'monospace' }}>
                          {log.entityId.slice(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '.75rem 1rem', maxWidth: '300px' }}>
                      <span style={{ wordBreak: 'break-word' }}>{log.description || '-'}</span>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }} className="text-secondary">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '.85rem', padding: '0 .5rem' }}>{page} / {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="btn btn-secondary btn-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
