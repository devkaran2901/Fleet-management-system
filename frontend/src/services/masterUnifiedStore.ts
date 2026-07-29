import type { DetailedVehicleTelemetry } from './indiaGeospatialData';

export interface SharedTripRecord {
  id: string;
  tripNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Scheduled' | 'Completed' | 'Delayed';
  progressPct: number;
  eta: string;
  cargoWeightTons: number;
  freightCharge: number;
}

export interface SharedJobCardRecord {
  id: string;
  jobCardNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  driverName: string;
  issueDescription: string;
  stage: 'INSPECTION' | 'ESTIMATION' | 'WORK_IN_PROGRESS' | 'PARTS_WAITING' | 'QUALITY_CHECK' | 'READY_FOR_DELIVERY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedCost: number;
  assignedMechanic: string;
}

export interface SharedVendorBillRecord {
  id: string;
  billNumber: string;
  vendorName: string;
  vehicleNumber: string;
  amount: number;
  dueDate: string;
  status: 'Pending Verification' | 'Verified' | 'Approved' | 'Disbursed' | 'Rejected';
  tripId: string;
  serviceCategory: string;
}

export interface SharedComplianceChallan {
  id: string;
  challanNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  offense: string;
  fineAmount: number;
  location: string;
  date: string;
  status: 'PENDING_REVIEW' | 'PAID' | 'DISPUTED' | 'EXPIRED';
}

// Canonical 8 Unified Vehicles Master
const CANONICAL_VEHICLES: DetailedVehicleTelemetry[] = [
  {
    id: 'v-101',
    vehicleNumber: 'DL 01 AB 1234',
    category: 'Owned',
    status: 'In Transit',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    currentLocation: 'NH-48, KM 42 near Kherki Daula Toll, Gurugram',
    lat: 28.3976,
    lng: 76.9744,
    heading: 215,
    speedKmH: 68,
    fuelLevel: 78,
    batteryLevel: 94,
    ignition: 'ON',
    lastPing: '2s ago',
    source: 'Delhi Cargo Terminal (IGI)',
    destination: 'Jaipur Logistics Hub',
    eta: 'Today, 05:30 PM (180 km remaining)',
    site: 'Delhi Depot',
    routeHistory: [
      { lat: 28.5355, lng: 77.1010, time: '09:00 AM', speed: 45 },
      { lat: 28.4800, lng: 77.0700, time: '09:30 AM', speed: 60 },
      { lat: 28.4595, lng: 77.0266, time: '10:00 AM', speed: 65 },
      { lat: 28.3976, lng: 76.9744, time: '10:20 AM', speed: 68 },
    ],
    diagnostics: {
      engineTempC: 84,
      coolantLevel: 'Normal (92%)',
      oilPressurePsi: 48,
      tirePressurePsi: 112,
      faultCodes: [],
      odometerKm: 142850,
      batteryVoltageV: 24.2,
    },
  },
  {
    id: 'v-102',
    vehicleNumber: 'MH 04 CD 5678',
    category: 'Vendor',
    status: 'Available',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98123 98765',
    currentLocation: 'Bhiwandi Freight Hub Gate 2, Thane',
    lat: 19.2812,
    lng: 73.0482,
    heading: 90,
    speedKmH: 0,
    fuelLevel: 88,
    batteryLevel: 99,
    ignition: 'OFF',
    lastPing: '45s ago',
    source: 'Mumbai Port Hub',
    destination: 'Unassigned / Staging Bay 4',
    eta: 'Idle at Staging Bay',
    site: 'Mumbai Port Hub',
    routeHistory: [
      { lat: 19.0176, lng: 72.8561, time: '06:00 AM', speed: 50 },
      { lat: 19.1800, lng: 72.9600, time: '07:15 AM', speed: 40 },
      { lat: 19.2812, lng: 73.0482, time: '08:00 AM', speed: 0 },
    ],
    diagnostics: {
      engineTempC: 32,
      coolantLevel: 'Optimal (98%)',
      oilPressurePsi: 0,
      tirePressurePsi: 110,
      faultCodes: [],
      odometerKm: 98400,
      batteryVoltageV: 24.8,
    },
  },
  {
    id: 'v-103',
    vehicleNumber: 'KA 03 EF 9012',
    category: 'Owned',
    status: 'In Transit',
    driverName: 'Anil Reddy',
    driverPhone: '+91 97400 11223',
    currentLocation: 'NH-44 Attibele Border Flyover, Bengaluru',
    lat: 12.7788,
    lng: 77.7712,
    heading: 135,
    speedKmH: 56,
    fuelLevel: 45,
    batteryLevel: 82,
    ignition: 'ON',
    lastPing: '1s ago',
    source: 'Bangalore Electronic City Hub',
    destination: 'Chennai Port Container Terminal',
    eta: 'Tomorrow, 06:00 AM (310 km remaining)',
    site: 'Bangalore Depot',
    routeHistory: [
      { lat: 12.8452, lng: 77.6602, time: '08:30 AM', speed: 30 },
      { lat: 12.8100, lng: 77.7200, time: '09:00 AM', speed: 52 },
      { lat: 12.7788, lng: 77.7712, time: '09:25 AM', speed: 56 },
    ],
    diagnostics: {
      engineTempC: 88,
      coolantLevel: 'Warning: Low (65%)',
      oilPressurePsi: 44,
      tirePressurePsi: 108,
      faultCodes: ['P0117 - Engine Coolant Low'],
      odometerKm: 210450,
      batteryVoltageV: 23.9,
    },
  },
  {
    id: 'v-104',
    vehicleNumber: 'HR 55 GH 3456',
    category: 'Owned',
    status: 'Maintenance',
    driverName: 'Suresh Verma',
    driverPhone: '+91 99887 76655',
    currentLocation: 'Workshop Bay 3, Delhi Logistics Hub',
    lat: 28.5012,
    lng: 77.0854,
    heading: 0,
    speedKmH: 0,
    fuelLevel: 30,
    batteryLevel: 65,
    ignition: 'OFF',
    lastPing: '3m ago',
    source: 'Delhi Depot',
    destination: 'Service Bay Maintenance',
    eta: 'Under Repair (Est completion: 4h)',
    site: 'Delhi Depot',
    diagnostics: {
      engineTempC: 28,
      coolantLevel: 'Flushed (0%)',
      oilPressurePsi: 0,
      tirePressurePsi: 95,
      faultCodes: ['P0300 - Engine Misfire', 'C0035 - ABS Wheel Sensor'],
      odometerKm: 345200,
      batteryVoltageV: 22.8,
    },
  },
  {
    id: 'v-105',
    vehicleNumber: 'WB 02 JK 7890',
    category: 'Vendor',
    status: 'Blocked',
    driverName: 'Pradeep Das',
    driverPhone: '+91 93300 44556',
    currentLocation: 'Dankuni Checkpost Inspection Bay, Kolkata',
    lat: 22.6854,
    lng: 88.2974,
    heading: 180,
    speedKmH: 0,
    fuelLevel: 60,
    batteryLevel: 40,
    ignition: 'OFF',
    lastPing: '8m ago',
    source: 'Kolkata Depot',
    destination: 'Blocked - Expired PUC & Insurance',
    eta: 'On Hold by Compliance Officer',
    site: 'Kolkata Depot',
    diagnostics: {
      engineTempC: 30,
      coolantLevel: 'Normal (88%)',
      oilPressurePsi: 0,
      tirePressurePsi: 105,
      faultCodes: ['COMPLIANCE_LOCK_ACTIVE'],
      odometerKm: 189300,
      batteryVoltageV: 24.1,
    },
  },
  {
    id: 'v-106',
    vehicleNumber: 'GJ 01 LM 4321',
    category: 'Vendor',
    status: 'In Transit',
    driverName: 'Mukesh Patel',
    driverPhone: '+91 94260 88776',
    currentLocation: 'National Expressway 1, KM 45 near Nadiad',
    lat: 22.6916,
    lng: 72.8634,
    heading: 150,
    speedKmH: 74,
    fuelLevel: 82,
    batteryLevel: 98,
    ignition: 'ON',
    lastPing: '1s ago',
    source: 'Sanand Industrial Depot, Ahmedabad',
    destination: 'Vadodara Logistics Hub',
    eta: 'Today, 02:15 PM (65 km remaining)',
    site: 'Gujarat West Hub',
    routeHistory: [
      { lat: 22.9868, lng: 72.3802, time: '11:00 AM', speed: 50 },
      { lat: 23.0225, lng: 72.5714, time: '11:30 AM', speed: 70 },
      { lat: 22.6916, lng: 72.8634, time: '12:10 PM', speed: 74 },
    ],
    diagnostics: {
      engineTempC: 82,
      coolantLevel: 'Optimal (95%)',
      oilPressurePsi: 52,
      tirePressurePsi: 115,
      faultCodes: [],
      odometerKm: 76400,
      batteryVoltageV: 24.6,
    },
  },
  {
    id: 'v-107',
    vehicleNumber: 'MH 12 PQ 9988',
    category: 'Owned',
    status: 'In Transit',
    driverName: 'Ganesh Joshi',
    driverPhone: '+91 98220 55443',
    currentLocation: 'Mumbai-Pune Expressway near Lonavala Ghat',
    lat: 18.7557,
    lng: 73.4091,
    heading: 120,
    speedKmH: 62,
    fuelLevel: 71,
    batteryLevel: 90,
    ignition: 'ON',
    lastPing: '3s ago',
    source: 'Bhiwandi Hub',
    destination: 'Pune Chakan Industrial Hub',
    eta: 'Today, 03:45 PM (52 km remaining)',
    site: 'Mumbai Port Hub',
    diagnostics: {
      engineTempC: 86,
      coolantLevel: 'Normal (90%)',
      oilPressurePsi: 50,
      tirePressurePsi: 110,
      faultCodes: [],
      odometerKm: 124000,
      batteryVoltageV: 24.4,
    },
  },
  {
    id: 'v-108',
    vehicleNumber: 'TN 09 XY 7711',
    category: 'Vendor',
    status: 'Idle',
    driverName: 'Karthik Subramanian',
    driverPhone: '+91 94440 33221',
    currentLocation: 'Sriperumbudur Industrial Yard Gate 3',
    lat: 12.9698,
    lng: 79.9405,
    heading: 270,
    speedKmH: 0,
    fuelLevel: 94,
    batteryLevel: 96,
    ignition: 'ON',
    lastPing: '10s ago',
    source: 'Chennai Port',
    destination: 'Awaiting Loading Clearance',
    eta: 'Scheduled Departure: 04:00 PM',
    site: 'Chennai Hub',
    diagnostics: {
      engineTempC: 45,
      coolantLevel: 'Normal (94%)',
      oilPressurePsi: 12,
      tirePressurePsi: 114,
      faultCodes: [],
      odometerKm: 62300,
      batteryVoltageV: 24.5,
    },
  }
];

// Linked Canonical Trips
const CANONICAL_TRIPS: SharedTripRecord[] = [
  { id: 'trip-101', tripNumber: 'TRP-2026-001', vehicleId: 'v-101', vehicleNumber: 'DL 01 AB 1234', driverName: 'Rajesh Kumar', driverPhone: '+91 98765 43210', origin: 'Delhi Cargo Terminal', destination: 'Jaipur Logistics Hub', status: 'In Transit', progressPct: 65, eta: 'Today, 05:30 PM', cargoWeightTons: 18.5, freightCharge: 42000 },
  { id: 'trip-103', tripNumber: 'TRP-2026-003', vehicleId: 'v-103', vehicleNumber: 'KA 03 EF 9012', driverName: 'Anil Reddy', driverPhone: '+91 97400 11223', origin: 'Bangalore E-City Hub', destination: 'Chennai Container Terminal', status: 'In Transit', progressPct: 40, eta: 'Tomorrow, 06:00 AM', cargoWeightTons: 22.0, freightCharge: 58000 },
  { id: 'trip-106', tripNumber: 'TRP-2026-006', vehicleId: 'v-106', vehicleNumber: 'GJ 01 LM 4321', driverName: 'Mukesh Patel', driverPhone: '+91 94260 88776', origin: 'Sanand Depot, Ahmedabad', destination: 'Vadodara Logistics Hub', status: 'In Transit', progressPct: 75, eta: 'Today, 02:15 PM', cargoWeightTons: 15.0, freightCharge: 29000 },
  { id: 'trip-107', tripNumber: 'TRP-2026-007', vehicleId: 'v-107', vehicleNumber: 'MH 12 PQ 9988', driverName: 'Ganesh Joshi', driverPhone: '+91 98220 55443', origin: 'Bhiwandi Hub', destination: 'Pune Chakan Industrial Hub', status: 'In Transit', progressPct: 80, eta: 'Today, 03:45 PM', cargoWeightTons: 19.8, freightCharge: 36000 },
];

// Linked Canonical Job Cards
const CANONICAL_JOB_CARDS: SharedJobCardRecord[] = [
  { id: 'jc-104', jobCardNumber: 'JC-2026-004', vehicleId: 'v-104', vehicleNumber: 'HR 55 GH 3456', driverName: 'Suresh Verma', issueDescription: 'Engine Misfire & ABS Sensor Fault', stage: 'WORK_IN_PROGRESS', priority: 'HIGH', estimatedCost: 18500, assignedMechanic: 'Ramesh Sharma (Senior Technician)' },
  { id: 'jc-103', jobCardNumber: 'JC-2026-003', vehicleId: 'v-103', vehicleNumber: 'KA 03 EF 9012', driverName: 'Anil Reddy', issueDescription: 'Coolant Hose Minor Leak Check', stage: 'PARTS_WAITING', priority: 'MEDIUM', estimatedCost: 4500, assignedMechanic: 'Sunil Verma' },
];

// Linked Canonical Vendor Bills
const CANONICAL_VENDOR_BILLS: SharedVendorBillRecord[] = [
  { id: 'bill-201', billNumber: 'BILL-88901', vendorName: 'Apex Freight Systems', vehicleNumber: 'MH 04 CD 5678', amount: 48500, dueDate: '2026-08-10', status: 'Approved', tripId: 'TRP-2026-002', serviceCategory: 'Long-haul Freight Transport' },
  { id: 'bill-202', billNumber: 'BILL-88902', vendorName: 'VRL Logistics Partner', vehicleNumber: 'GJ 01 LM 4321', amount: 29000, dueDate: '2026-08-15', status: 'Pending Verification', tripId: 'TRP-2026-006', serviceCategory: 'Container Freight' },
  { id: 'bill-203', billNumber: 'BILL-88903', vendorName: 'Mahindra Logistics Partner', vehicleNumber: 'WB 02 JK 7890', amount: 62000, dueDate: '2026-08-05', status: 'Verified', tripId: 'TRP-2026-005', serviceCategory: 'Interstate Heavy Freight' },
];

// Linked Canonical Compliance Challans
const CANONICAL_CHALLANS: SharedComplianceChallan[] = [
  { id: 'ch-301', challanNumber: 'CH-99210', vehicleId: 'v-105', vehicleNumber: 'WB 02 JK 7890', offense: 'Expired PUC & Insurance Certificate', fineAmount: 5000, location: 'Dankuni Checkpost, Kolkata', date: '2026-07-28', status: 'PENDING_REVIEW' },
  { id: 'ch-302', challanNumber: 'CH-99211', vehicleId: 'v-101', vehicleNumber: 'DL 01 AB 1234', offense: 'Minor Lane Deviation near Toll', fineAmount: 1000, location: 'Kherki Daula Toll, Gurugram', date: '2026-07-29', status: 'PAID' },
];

class MasterUnifiedFleetStore {
  private vehicles: DetailedVehicleTelemetry[] = [];
  private trips: SharedTripRecord[] = [];
  private jobCards: SharedJobCardRecord[] = [];
  private vendorBills: SharedVendorBillRecord[] = [];
  private challans: SharedComplianceChallan[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    if (typeof window !== 'undefined' && localStorage.getItem('fms_unified_vehicles')) {
      try {
        this.vehicles = JSON.parse(localStorage.getItem('fms_unified_vehicles')!);
        this.trips = JSON.parse(localStorage.getItem('fms_unified_trips')!);
        this.jobCards = JSON.parse(localStorage.getItem('fms_unified_job_cards')!);
        this.vendorBills = JSON.parse(localStorage.getItem('fms_unified_bills')!);
        this.challans = JSON.parse(localStorage.getItem('fms_unified_challans')!);
        return;
      } catch (e) {
        console.warn('Failed to parse cached unified store, resetting to canonical baseline.');
      }
    }

    this.vehicles = [...CANONICAL_VEHICLES];
    this.trips = [...CANONICAL_TRIPS];
    this.jobCards = [...CANONICAL_JOB_CARDS];
    this.vendorBills = [...CANONICAL_VENDOR_BILLS];
    this.challans = [...CANONICAL_CHALLANS];
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fms_unified_vehicles', JSON.stringify(this.vehicles));
      localStorage.setItem('fms_unified_trips', JSON.stringify(this.trips));
      localStorage.setItem('fms_unified_job_cards', JSON.stringify(this.jobCards));
      localStorage.setItem('fms_unified_bills', JSON.stringify(this.vendorBills));
      localStorage.setItem('fms_unified_challans', JSON.stringify(this.challans));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.save();
    this.listeners.forEach((fn) => fn());
  }

  // Getters
  public getVehicles(): DetailedVehicleTelemetry[] {
    return [...this.vehicles];
  }

  public getVehicleById(id: string): DetailedVehicleTelemetry | undefined {
    return this.vehicles.find((v) => v.id === id || v.vehicleNumber === id);
  }

  public getTrips(): SharedTripRecord[] {
    return [...this.trips];
  }

  public getJobCards(): SharedJobCardRecord[] {
    return [...this.jobCards];
  }

  public getVendorBills(): SharedVendorBillRecord[] {
    return [...this.vendorBills];
  }

  public getChallans(): SharedComplianceChallan[] {
    return [...this.challans];
  }

  // Mutations
  public updateVehicleStatus(id: string, status: DetailedVehicleTelemetry['status'], location?: string) {
    this.vehicles = this.vehicles.map((v) => {
      if (v.id === id || v.vehicleNumber === id) {
        return {
          ...v,
          status,
          currentLocation: location || v.currentLocation,
          lastPing: 'just now',
        };
      }
      return v;
    });
    this.notify();
  }

  public updateVehicleTelemetry(id: string, update: Partial<DetailedVehicleTelemetry>) {
    this.vehicles = this.vehicles.map((v) => {
      if (v.id === id || v.vehicleNumber === id) {
        return { ...v, ...update, lastPing: 'just now' };
      }
      return v;
    });
    this.notify();
  }

  public updateJobCardStage(id: string, stage: SharedJobCardRecord['stage']) {
    this.jobCards = this.jobCards.map((jc) => {
      if (jc.id === id || jc.jobCardNumber === id) {
        return { ...jc, stage };
      }
      return jc;
    });
    // If job card becomes READY_FOR_DELIVERY, release vehicle from maintenance to Available
    const target = this.jobCards.find((jc) => jc.id === id || jc.jobCardNumber === id);
    if (target && stage === 'READY_FOR_DELIVERY') {
      this.updateVehicleStatus(target.vehicleId, 'Available');
    }
    this.notify();
  }

  public updateBillStatus(id: string, status: SharedVendorBillRecord['status']) {
    this.vendorBills = this.vendorBills.map((b) => {
      if (b.id === id || b.billNumber === id) {
        return { ...b, status };
      }
      return b;
    });
    this.notify();
  }

  public resolveChallan(id: string) {
    this.challans = this.challans.map((ch) => {
      if (ch.id === id || ch.challanNumber === id) {
        return { ...ch, status: 'PAID' };
      }
      return ch;
    });
    // If blocked vehicle has all challans resolved, unblock vehicle
    const target = this.challans.find((ch) => ch.id === id || ch.challanNumber === id);
    if (target) {
      const remainingUnpaid = this.challans.filter((c) => c.vehicleId === target.vehicleId && c.status !== 'PAID');
      if (remainingUnpaid.length === 0) {
        this.updateVehicleStatus(target.vehicleId, 'Available');
      }
    }
    this.notify();
  }
}

export const masterUnifiedStore = new MasterUnifiedFleetStore();
