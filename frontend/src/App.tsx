import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ADMIN_MODULES } from './pages/admin/adminModules';
import { ModuleStub } from './pages/admin/ModuleStub';

// Vendor Portal suite
import { VendorLayout } from './pages/vendor/VendorLayout';
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { IndentInbox } from './pages/vendor/IndentInbox';
import { PlacementTracker } from './pages/vendor/PlacementTracker';
import { FleetList } from './pages/vendor/FleetList';
import { VehicleDetails } from './pages/vendor/VehicleDetails';
import { VehicleDocumentManagement } from './pages/vendor/VehicleDocumentManagement';
import { DriverList } from './pages/vendor/DriverList';
import { DriverDetails } from './pages/vendor/DriverDetails';
import { DriverVerification } from './pages/vendor/DriverVerification';
import { ComplianceCenter } from './pages/vendor/ComplianceCenter';
import { BillsList } from './pages/vendor/BillsList';
import { BillSubmission } from './pages/vendor/BillSubmission';
import { BillDetails } from './pages/vendor/BillDetails';
import { Payments } from './pages/vendor/Payments';
import { Scorecard } from './pages/vendor/Scorecard';
import { ProfileKYC } from './pages/vendor/ProfileKYC';
import { NotificationsCenter } from './pages/vendor/NotificationsCenter';
import { VendorTripTracking } from './pages/vendor/VendorTripTracking';
import { VendorSettings } from './pages/vendor/VendorSettings';

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
import { AdminVehicles } from './pages/admin/Vehicles';
import { AdminDrivers } from './pages/admin/Drivers';
import { AdminRoutes } from './pages/admin/Routes';
import { AdminVendors } from './pages/admin/AdminVendors';

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

// Built Workshop modules (R-06)
import { WorkshopLayout } from './pages/workshop/WorkshopLayout';
import { WORKSHOP_MODULES } from './pages/workshop/workshopModules';
import { WorkshopDashboard } from './pages/workshop/WorkshopDashboard';
import { JobCards } from './pages/workshop/JobCards';
import { WorkshopBoard } from './pages/workshop/WorkshopBoard';
import { PMDueList } from './pages/workshop/PMDueList';
import { Estimates } from './pages/workshop/Estimates';
import { PartsDemand } from './pages/workshop/PartsDemand';
import { MechanicRoster } from './pages/workshop/MechanicRoster';
import { WorkshopReports } from './pages/workshop/WorkshopReports';

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
  '/admin/vehicles': AdminVehicles,
  '/admin/drivers': AdminDrivers,
  '/admin/routes': AdminRoutes,
  '/admin/vendors': AdminVendors,
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

const BUILT_WORKSHOP_PAGES: Record<string, React.ComponentType> = {
  '/workshop/dashboard': WorkshopDashboard,
  '/workshop/job-cards': JobCards,
  '/workshop/board': WorkshopBoard,
  '/workshop/pm-due': PMDueList,
  '/workshop/estimates': Estimates,
  '/workshop/parts-demand': PartsDemand,
  '/workshop/mechanics': MechanicRoster,
  '/workshop/reports': WorkshopReports,
};

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.roles?.includes('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.roles?.includes('VENDOR')) {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  if (user?.roles?.includes('WORKSHOP_MANAGER') || user?.roles?.includes('R-06')) {
    return <Navigate to="/workshop/dashboard" replace />;
  }
  if (user?.roles?.includes('DISPATCHER')) {
    return <Navigate to="/dispatcher/dashboard" replace />;
  }
  if (user?.roles?.includes('FLEET_MANAGER') || user?.roles?.includes('FLEET')) {
    return <Navigate to="/fleet/dashboard" replace />;
  }
  if (user?.roles?.includes('COMPLIANCE_MANAGER') || user?.roles?.includes('COMPLIANCE') || user?.roles?.includes('S-22')) {
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
              <ProtectedRoute allowedRoles={['COMPLIANCE_MANAGER', 'COMPLIANCE', 'S-22', 'ADMIN']}>
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

          {/* Workshop Manager suite (R-06) */}
          <Route
            path="/workshop"
            element={
              <ProtectedRoute allowedRoles={['WORKSHOP_MANAGER', 'R-06', 'ADMIN']}>
                <WorkshopLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/workshop/dashboard" replace />} />
            {WORKSHOP_MODULES.map((mod) => {
              const Page = BUILT_WORKSHOP_PAGES[mod.to] ?? ModuleStub;
              return (
                <Route
                  key={mod.to}
                  path={mod.to.replace('/workshop/', '')}
                  element={<Page />}
                />
              );
            })}
          </Route>

          {/* Vendor Portal suite */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="indents" element={<IndentInbox />} />
            <Route path="placements" element={<PlacementTracker />} />
            <Route path="trips" element={<VendorTripTracking />} />
            <Route path="fleet" element={<FleetList />} />
            <Route path="fleet/:id" element={<VehicleDetails />} />
            <Route path="fleet/documents" element={<VehicleDocumentManagement />} />
            <Route path="drivers" element={<DriverList />} />
            <Route path="drivers/:id" element={<DriverDetails />} />
            <Route path="drivers/verification" element={<DriverVerification />} />
            <Route path="compliance" element={<ComplianceCenter />} />
            <Route path="bills" element={<BillsList />} />
            <Route path="bills/new" element={<BillSubmission />} />
            <Route path="bills/:id" element={<BillDetails />} />
            <Route path="payments" element={<Payments />} />
            <Route path="scorecard" element={<Scorecard />} />
            <Route path="profile" element={<ProfileKYC />} />
            <Route path="notifications" element={<NotificationsCenter />} />
            <Route path="settings" element={<VendorSettings />} />
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
