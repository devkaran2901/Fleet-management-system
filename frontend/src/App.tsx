import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { OrgUsersRoles } from './pages/admin/OrgUsersRoles';
import { RulePacks } from './pages/admin/RulePacks';
import { ApprovalFlows } from './pages/admin/ApprovalFlows';
import { NotificationPolicies } from './pages/admin/NotificationPolicies';
import { Integrations } from './pages/admin/Integrations';
import { Imports } from './pages/admin/Imports';
import { Audit } from './pages/admin/Audit';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin suite (S-35) — one nested route per module in the Phase 5 IA */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/org" replace />} />
            <Route path="org" element={<OrgUsersRoles />} />
            <Route path="rule-packs" element={<RulePacks />} />
            <Route path="approval-flows" element={<ApprovalFlows />} />
            <Route path="notification-policies" element={<NotificationPolicies />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="imports" element={<Imports />} />
            <Route path="audit" element={<Audit />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
