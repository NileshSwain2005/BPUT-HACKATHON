import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldOff } from 'lucide-react';

export default function RoleGuard({ children, minRole, roles }) {
  const { user, hasRole, hasMinRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const allowed = minRole ? hasMinRole(minRole) : (roles ? hasRole(...roles) : true);
  if (!allowed) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--color-danger)', width: 72, height: 72 }}>
          <ShieldOff size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '.5rem' }}>Access Denied</h3>
          <p className="text-secondary">You don't have permission to view this page.</p>
          <p className="text-muted" style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
            Your role: <strong>{user.role}</strong>
            {minRole && <> · Required: <strong>{minRole}</strong> or higher</>}
          </p>
        </div>
      </div>
    );
  }
  return children;
}
