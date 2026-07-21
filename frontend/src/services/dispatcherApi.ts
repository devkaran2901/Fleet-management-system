import api from './api';

const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export interface DispatcherKPIs {
  todayTrips: number;
  activeTrips: number;
  vehiclesAvailable: number;
  vehiclesInTransit: number;
  pendingRequests: number;
  unassignedRequests: number;
  exceptions: number;
  gateQueue: number;
  activeDrivers: number;
}

export interface TransportRequest {
  id: string;
  customer: string;
  pickup: string;
  destination: string;
  vehicleType: string;
  capacityRequired: string;
  timeWindow: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  approvalStatus: 'APPROVED' | 'PENDING' | 'HOLD';
  tripType: string;
  status: 'Unassigned' | 'Assigned' | 'Deferred' | 'Hold' | 'Merged' | 'Split';
  date: string;
  distance: number;
  eta: string;
  ineligibleReasons?: string; // stringified JSON
}

export interface Vehicle {
  id: string;
  photo?: string;
  vehicleNumber: string;
  capacity: string;
  currentLocation: string;
  currentTripId?: string | null;
  fuel: number;
  status: 'Available' | 'In Transit' | 'Maintenance' | 'Blocked';
  complianceFASTag: boolean;
  compliancePM: boolean;
  complianceGPS: boolean;
  complianceInspection: boolean;
  complianceInsurance: boolean;
  complianceFitness: boolean;
  compliancePermit: boolean;
  utilization: number;
  category: 'Owned' | 'Vendor';
  vendorName?: string | null;
  gpsDeviceStatus: 'Online' | 'Offline' | 'Tampered';
  lastPingAge: string;
  site: string;
  class: string;
  alerts: string; // stringified JSON array
}

export interface Driver {
  id: string;
  photo?: string;
  name: string;
  license: string;
  licenseType: string;
  dutyHours: number;
  restHours: number;
  safetyScore: number;
  currentTripId?: string | null;
  status: 'Available' | 'On Duty' | 'Off Duty' | 'Suspended';
  warnings: string; // stringified JSON array
  site: string;
}

export interface Route {
  id: string;
  code: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  eta: string;
  stops: string; // JSON stringified array of stops
  restrictions: string; // JSON stringified array of restrictions
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  tripId: string;
  vehicleId?: string | null;
  vehicleNumber?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  status: 'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled';
  routeName: string;
  pickup: string;
  destination: string;
  eta: string;
  distance: number;
  startDateTime?: string | null;
  endDateTime?: string | null;
  cost: number;
  vendorName?: string | null;
  documents: string; // JSON
  expenses: string; // JSON
  fuelEntries: string; // JSON
  gateEvents: string; // JSON
  stateTimeline: string; // JSON
  auditTrail: string; // JSON
  timeline: string; // JSON
}

export interface GateQueueEntry {
  id: string;
  vehicleNumber: string;
  status: 'Expected' | 'Waiting' | 'Entered' | 'Exited' | 'Blocked';
  gatePassNumber: string;
  eta: string;
  enteredAt?: string | null;
  exitedAt?: string | null;
  detentionTimer?: number | null;
  checklistPhotos: string; // JSON
}

export interface ExceptionAlert {
  id: string;
  type: string;
  vehicleNumber: string;
  driverName: string;
  tripId?: string | null;
  timestamp: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  details: string;
}

export interface ReportsSummary {
  dailyDispatch: { date: string; ownedCount: number; vendorCount: number; total: number }[];
  planStability: {
    totalPlanned: number;
    swappedVehicles: number;
    swappedDrivers: number;
    cancelledTrips: number;
    vendorTransfers: number;
    stabilityScore: number;
  };
  exceptionSummary: { type: string; count: number; critical: number }[];
  vendorFailures: { vendor: string; indentsSent: number; accepted: number; placementFailures: number; placementRate: number }[];
}

export const dispatcherApi = {
  // KPIs
  kpis: () => unwrap<DispatcherKPIs>(api.get('/dispatcher/kpis')),

  // Transport Requests
  requests: () => unwrap<TransportRequest[]>(api.get('/dispatcher/requests')),
  createRequest: (body: Partial<TransportRequest>) => unwrap<TransportRequest>(api.post('/dispatcher/requests', body)),
  assignRequest: (requestId: string, vehicleId: string, driverId: string) =>
    unwrap<Trip>(api.post(`/dispatcher/requests/${requestId}/assign`, { vehicleId, driverId })),
  splitRequest: (requestId: string) => unwrap<TransportRequest[]>(api.post(`/dispatcher/requests/${requestId}/split`, {})),
  mergeRequests: (requestIds: string[]) => unwrap<TransportRequest>(api.post('/dispatcher/requests/merge', { requestIds })),
  vendorSpill: (requestId: string, vendorId: string) => unwrap<Trip>(api.post(`/dispatcher/requests/${requestId}/vendor-spill`, { vendorId })),

  // Vehicles & Drivers
  vehicles: () => unwrap<Vehicle[]>(api.get('/dispatcher/vehicles')),
  drivers: () => unwrap<Driver[]>(api.get('/dispatcher/drivers')),

  // Trips
  trips: () => unwrap<Trip[]>(api.get('/dispatcher/trips')),
  getTrip: (id: string) => unwrap<Trip>(api.get(`/dispatcher/trips/${id}`)),
  createTrip: (body: Partial<Trip>) => unwrap<Trip>(api.post('/dispatcher/trips', body)),
  updateTrip: (id: string, body: Partial<Trip>) => unwrap<Trip>(api.patch(`/dispatcher/trips/${id}`, body)),
  replanTrip: (tripId: string, body: { action: string; vehicleId?: string; driverId?: string; notes?: string }) =>
    unwrap<Trip>(api.post(`/dispatcher/trips/${tripId}/replan`, body)),

  // Gate Queue
  gateQueue: () => unwrap<GateQueueEntry[]>(api.get('/dispatcher/gate-queue')),
  updateGateQueueEntry: (id: string, body: Partial<GateQueueEntry>) =>
    unwrap<GateQueueEntry>(api.patch(`/dispatcher/gate-queue/${id}`, body)),

  // Exception Center
  exceptions: () => unwrap<ExceptionAlert[]>(api.get('/dispatcher/exceptions')),
  resolveException: (id: string) => unwrap<ExceptionAlert>(api.post(`/dispatcher/exceptions/${id}/resolve`, {})),

  // Reports
  reports: () => unwrap<ReportsSummary>(api.get('/dispatcher/reports')),

  // Routes
  routes: () => unwrap<Route[]>(api.get('/dispatcher/routes')),

  // Updates for Fleet / Dispatcher connection
  updateVehicle: (id: string, data: Partial<Vehicle>) => unwrap<Vehicle>(api.patch(`/dispatcher/vehicles/${id}`, data)),
  updateDriver: (id: string, data: Partial<Driver>) => unwrap<Driver>(api.patch(`/dispatcher/drivers/${id}`, data)),
};
