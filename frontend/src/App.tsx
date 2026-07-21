import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ADMIN_MODULES } from './pages/admin/adminModules';
import { ModuleStub } from './pages/admin/ModuleStub';

// Built admin modules
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

// Built dispatcher modules
import { DispatcherLayout } from './pages/dispatcher/DispatcherLayout';
import { DISPATCHER_MODULES } from './pages/dispatcher/dispatcherModules';
import { DispatcherDashboard } from './pages/dispatcher/DispatcherDashboard';
import { TransportRequests } from './pages/dispatcher/TransportRequests';
import { TripManagement } from './pages/dispatcher/TripManagement';
import { DriverAssignment } from './pages/dispatcher/DriverAssignment';
import { VehicleAssignment } from './pages/dispatcher/VehicleAssignment';
import { GateQueue } from './pages/dispatcher/GateQueue';
import { ExceptionCenter } from './pages/dispatcher/ExceptionCenter';
import { Reports } from './pages/dispatcher/Reports';

// Built Fleet Manager modules
import { FleetLayout } from './pages/fleet/FleetLayout';
import { FLEET_MODULES } from './pages/fleet/fleetModules';
import { FleetDashboard } from './pages/fleet/FleetDashboard';
import { FleetVehicles } from './pages/fleet/FleetVehicles';
import { FleetDrivers } from './pages/fleet/FleetDrivers';
import { FleetCompliance } from './pages/fleet/FleetCompliance';
import { FleetMaintenance } from './pages/fleet/FleetMaintenance';
import { FleetDevices } from './pages/fleet/FleetDevices';

// Built Compliance modules
import { ComplianceLayout } from './pages/compliance/ComplianceLayout';
import { COMPLIANCE_MODULES } from './pages/compliance/complianceModules';
import { ComplianceDashboard } from './pages/compliance/ComplianceDashboard';
import { RenewalTasks } from './pages/compliance/RenewalTasks';
import { OCRVerification } from './pages/compliance/OCRVerification';
import { ChallanDashboard } from './pages/compliance/ChallanDashboard';
import { ChallanWorkbench } from './pages/compliance/ChallanWorkbench';
import { InsuranceClaims } from './pages/compliance/InsuranceClaims';
import { Incident360 } from './pages/compliance/Incident360';
import { ComplianceReports } from './pages/compliance/ComplianceReports';

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

const BUILT_DISPATCHER_PAGES: Record<string, React.ComponentType> = {
  '/dispatcher/dashboard': DispatcherDashboard,
  '/dispatcher/requests': TransportRequests,
  '/dispatcher/trips': TripManagement,
  '/dispatcher/gate-queue': GateQueue,
  '/dispatcher/drivers': DriverAssignment,
  '/dispatcher/vehicles': VehicleAssignment,
  '/dispatcher/exceptions': ExceptionCenter,
  '/dispatcher/reports': Reports,
};

const BUILT_FLEET_PAGES: Record<string, React.ComponentType> = {
  '/fleet/dashboard': FleetDashboard,
  '/fleet/vehicles': FleetVehicles,
  '/fleet/drivers': FleetDrivers,
  '/fleet/compliance': FleetCompliance,
  '/fleet/maintenance': FleetMaintenance,
  '/fleet/devices': FleetDevices,
};

const BUILT_COMPLIANCE_PAGES: Record<string, React.ComponentType> = {
  '/compliance/dashboard': ComplianceDashboard,
  '/compliance/renewals/tasks': RenewalTasks,
  '/compliance/renewals/ocr': OCRVerification,
  '/compliance/challans/dashboard': ChallanDashboard,
  '/compliance/challans/workbench': ChallanWorkbench,
  '/compliance/insurance/policies': InsuranceClaims,
  '/compliance/insurance/claims': InsuranceClaims,
  '/compliance/insurance/claim-360': InsuranceClaims,
  '/compliance/incidents/dashboard': Incident360,
  '/compliance/incidents/360': Incident360,
  '/compliance/reports': ComplianceReports,
};

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.roles?.includes('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.roles?.includes('DISPATCHER')) {
    return <Navigate to="/dispatcher/dashboard" replace />;
  }
  if (user?.roles?.includes('FLEET_MANAGER') || user?.roles?.includes('FLEET')) {
    return <Navigate to="/fleet/dashboard" replace />;
  }
  if (user?.roles?.includes('COMPLIANCE_MANAGER')) {
    return <Navigate to="/compliance/dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
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
              <ProtectedRoute allowedRoles={['ADMIN']}>
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

          {/* Dispatcher suite (P-11) */}
          <Route
            path="/dispatcher"
            element={
              <ProtectedRoute allowedRoles={['DISPATCHER', 'ADMIN']}>
                <DispatcherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dispatcher/dashboard" replace />} />
            {DISPATCHER_MODULES.map((mod) => {
              const Page = BUILT_DISPATCHER_PAGES[mod.to] ?? ModuleStub;
              return (
                <Route
                  key={mod.to}
                  path={mod.to.replace('/dispatcher/', '')}
                  element={<Page />}
                />
              );
            })}
          </Route>

          {/* Fleet suite */}
          <Route
            path="/fleet"
            element={
              <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
                <FleetLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/fleet/dashboard" replace />} />
            {FLEET_MODULES.map((mod) => {
              const Page = BUILT_FLEET_PAGES[mod.to] ?? ModuleStub;
              return (
                <Route
                  key={mod.to}
                  path={mod.to.replace('/fleet/', '')}
                  element={<Page />}
                />
              );
            })}
          </Route>

          {/* Compliance suite (S-22 to S-26) */}
          <Route
            path="/compliance"
            element={
              <ProtectedRoute allowedRoles={['COMPLIANCE_MANAGER', 'ADMIN']}>
                <ComplianceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/compliance/dashboard" replace />} />
            {COMPLIANCE_MODULES.map((mod) => {
              const Page = BUILT_COMPLIANCE_PAGES[mod.to] ?? ModuleStub;
              return (
                <Route
                  key={mod.to}
                  path={mod.to.replace('/compliance/', '')}
                  element={<Page />}
                />
              );
            })}
          </Route>

          {/* Landing page redirects */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
