import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';

// App pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectCreate from './pages/projects/ProjectCreate';
import ESGMetrics from './pages/esg/ESGMetrics';
import ESGMetricEntry from './pages/esg/ESGMetricEntry';
import BRSRWorkspace from './pages/brsr/BRSRWorkspace';
import BRSRResponsePage from './pages/brsr/BRSRResponsePage';
import EvidenceCenter from './pages/evidence/EvidenceCenter';
import Documents from './pages/documents/Documents';
import Compliance from './pages/compliance/Compliance';
import GapAnalysis from './pages/compliance/GapAnalysis';
import SDGMapping from './pages/sdg/SDGMapping';
import Reports from './pages/reports/Reports';
import UserManagement from './pages/admin/UserManagement';
import OrganizationSetup from './pages/admin/OrganizationSetup';
import ReportingPeriods from './pages/admin/ReportingPeriods';
import Policies from './pages/admin/Policies';
import Targets from './pages/admin/Targets';
import AuditLog from './pages/audit/AuditLog';
import Profile from './pages/profile/Profile';

// Guards
import PrivateRoute from './components/guards/PrivateRoute';
import RoleGuard from './components/guards/RoleGuard';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
      <div className="spinner" style={{ width:48, height:48 }} />
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Projects */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<RoleGuard minRole="BU_MANAGER"><ProjectCreate /></RoleGuard>} />
          <Route path="/projects/:id" element={<ProjectDetail />} />

          {/* ESG Metrics */}
          <Route path="/esg-metrics" element={<ESGMetrics />} />
          <Route path="/esg-metrics/entry" element={<RoleGuard minRole="DATA_CONTRIBUTOR"><ESGMetricEntry /></RoleGuard>} />

          {/* BRSR Workspace */}
          <Route path="/brsr" element={<BRSRWorkspace />} />
          <Route path="/brsr/response/:id" element={<BRSRResponsePage />} />

          {/* Evidence */}
          <Route path="/evidence" element={<EvidenceCenter />} />

          {/* Documents */}
          <Route path="/documents" element={<Documents />} />

          {/* Compliance */}
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/compliance/gap-analysis" element={<GapAnalysis />} />

          {/* SDG */}
          <Route path="/sdg" element={<SDGMapping />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />

          {/* Admin */}
          <Route path="/admin/users" element={<RoleGuard minRole="ESG_ADMIN"><UserManagement /></RoleGuard>} />
          <Route path="/admin/organizations" element={<RoleGuard minRole="ESG_ADMIN"><OrganizationSetup /></RoleGuard>} />
          <Route path="/admin/periods" element={<RoleGuard minRole="ESG_ADMIN"><ReportingPeriods /></RoleGuard>} />
          <Route path="/admin/policies" element={<RoleGuard minRole="BU_MANAGER"><Policies /></RoleGuard>} />
          <Route path="/admin/targets" element={<RoleGuard minRole="BU_MANAGER"><Targets /></RoleGuard>} />

          {/* Audit */}
          <Route path="/audit" element={<RoleGuard minRole="AUDITOR"><AuditLog /></RoleGuard>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
