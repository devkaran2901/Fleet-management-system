import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ADMIN_MODULES } from './pages/admin/adminModules';
import { ModuleStub } from './pages/admin/ModuleStub';

// Built modules, keyed by route path.
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrgTree } from './pages/admin/OrgTree';
import { CostCenters } from './pages/admin/CostCenters';
import { Users } from './pages/admin/Users';
import { Roles } from './pages/admin/Roles';
import { Permissions } from './pages/admin/Permissions';
import { Delegations } from './pages/admin/Delegations';
import { RulePacks } from './pages/admin/RulePacks';
import { ApprovalFlows } from './pages/admin/ApprovalFlows';
import { NotificationPolicies } from './pages/admin/NotificationPolicies';
import { Integrations } from './pages/admin/Integrations';
import { Imports } from './pages/admin/Imports';
import { Audit } from './pages/admin/Audit';
import { Lineage } from './pages/admin/Lineage';
import { SystemHealth } from './pages/admin/SystemHealth';

/**
 * Every module in the nav gets a route. Those with an implementation resolve to
 * it; the rest fall through to ModuleStub, so the IA is fully navigable without
 * any screen pretending to work.
 */
const BUILT_PAGES: Record<string, React.ComponentType> = {
  '/admin/dashboard': AdminDashboard,
  '/admin/org': OrgTree,
  '/admin/cost-centers': CostCenters,
  '/admin/users': Users,
  '/admin/roles': Roles,
  '/admin/permissions': Permissions,
  '/admin/delegations': Delegations,
  '/admin/rule-packs': RulePacks,
  '/admin/approval-flows': ApprovalFlows,
  '/admin/notification-policies': NotificationPolicies,
  '/admin/integrations': Integrations,
  '/admin/imports': Imports,
  '/admin/audit': Audit,
  '/admin/lineage': Lineage,
  '/admin/system-health': SystemHealth,
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin suite (S-35) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {ADMIN_MODULES.map((mod) => {
              const Page = BUILT_PAGES[mod.to] ?? ModuleStub;
              return (
                <Route
                  key={mod.to}
                  path={mod.to.replace('/admin/', '')}
                  element={<Page />}
                />
              );
            })}
          </Route>

          {/* The admin dashboard is the landing page. */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
