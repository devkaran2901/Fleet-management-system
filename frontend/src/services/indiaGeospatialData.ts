export interface GeospatialPoint {
  id: string;
  name: string;
  category: 'depot' | 'warehouse' | 'toll_plaza' | 'fuel_station' | 'service_center';
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  details?: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'polygon' | 'circle';
  center?: { lat: number; lng: number };
  radiusMeters?: number;
  coordinates?: { lat: number; lng: number }[];
  color: string;
  category: 'logistics_hub' | 'port' | 'industrial_zone' | 'restricted_zone';
}

export interface DetailedVehicleTelemetry {
  id: string;
  vehicleNumber: string;
  category: 'Owned' | 'Vendor';
  status: 'In Transit' | 'Idle' | 'Available' | 'Maintenance' | 'Blocked';
  driverName: string;
  driverPhone: string;
  currentLocation: string;
  lat: number;
  lng: number;
  heading: number; // 0 - 360 degrees
  speedKmH: number;
  fuelLevel: number; // 0 - 100%
  batteryLevel: number; // 0 - 100%
  ignition: 'ON' | 'OFF';
  lastPing: string;
  source: string;
  destination: string;
  eta: string;
  site: string;
  routeHistory?: { lat: number; lng: number; time: string; speed: number }[];
  diagnostics: {
    engineTempC: number;
    coolantLevel: string;
    oilPressurePsi: number;
    tirePressurePsi: number;
    faultCodes: string[];
    odometerKm: number;
    batteryVoltageV: number;
  };
}

// Major Indian Infrastructure Landmarks
export const INDIA_DEPOTS_AND_INFRA: GeospatialPoint[] = [
  // Depots & Warehouses
  {
    id: 'depot-delhi-1',
    name: 'Delhi Cargo & Logistics Terminal',
    category: 'depot',
    lat: 28.5355,
    lng: 77.1010,
    address: 'Near IGI Cargo Complex, NH-48',
    city: 'New Delhi',
    state: 'Delhi',
    details: 'Primary North Zone Distribution Center (Capacity: 250 Trucks)',
  },
  {
    id: 'depot-bhiwandi-1',
    name: 'Bhiwandi Mega Logistics Park',
    category: 'warehouse',
    lat: 19.2812,
    lng: 73.0482,
    address: 'Mumbai-Nashik Highway, Bhiwandi',
    city: 'Thane',
    state: 'Maharashtra',
    details: 'West Zone Hub for Container Freight',
  },
  {
    id: 'depot-bangalore-1',
    name: 'Electronic City Freight Terminal',
    category: 'depot',
    lat: 12.8452,
    lng: 77.6602,
    address: 'Phase 2 Industrial Corridor',
    city: 'Bengaluru',
    state: 'Karnataka',
    details: 'South Zone Central Hub (Cold Storage & General Cargo)',
  },
  {
    id: 'depot-kolkata-1',
    name: 'Dankuni Inland Container Depot',
    category: 'warehouse',
    lat: 22.6854,
    lng: 88.2974,
    address: 'Dankuni Freight Complex, NH-19',
    city: 'Kolkata',
    state: 'West Bengal',
    details: 'East Zone Multimodal Hub',
  },
  {
    id: 'depot-sanand-1',
    name: 'Sanand Industrial Fleet Depot',
    category: 'depot',
    lat: 22.9868,
    lng: 72.3802,
    address: 'GIDC Industrial Estate, Sanand',
    city: 'Ahmedabad',
    state: 'Gujarat',
    details: 'Auto & Heavy Equipment Logistics Depot',
  },
  {
    id: 'depot-chennai-1',
    name: 'Sriperumbudur Freight Park',
    category: 'warehouse',
    lat: 12.9698,
    lng: 79.9405,
    address: 'Chennai-Bengaluru Highway, Sriperumbudur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    details: 'Automotive Freight Dispatch Depot',
  },

  // Toll Plazas
  {
    id: 'toll-gurugram-1',
    name: 'Kherki Daula Toll Plaza (NH-48)',
    category: 'toll_plaza',
    lat: 28.3976,
    lng: 76.9744,
    address: 'NH-48 Delhi-Gurugram Expressway',
    city: 'Gurugram',
    state: 'Haryana',
    details: 'FASTag Lane 12 - Automated Weight Sensor Active',
  },
  {
    id: 'toll-mumbai-pune-1',
    name: 'Urse Toll Plaza (Mumbai-Pune Exp)',
    category: 'toll_plaza',
    lat: 18.7368,
    lng: 73.6542,
    address: 'Mumbai-Pune Expressway, Urse',
    city: 'Pune',
    state: 'Maharashtra',
    details: 'Heavy Vehicle Checkpoint',
  },
  {
    id: 'toll-attibele-1',
    name: 'Attibele Toll Plaza (NH-44)',
    category: 'toll_plaza',
    lat: 12.7788,
    lng: 77.7712,
    address: 'Hosur-Bengaluru Border NH-44',
    city: 'Bengaluru',
    state: 'Karnataka',
    details: 'Interstate Commercial Permit Verification Center',
  },

  // Fuel Stations
  {
    id: 'fuel-ioc-nh48',
    name: 'IndianOil Swadeshi Highway Hub',
    category: 'fuel_station',
    lat: 27.8974,
    lng: 76.2854,
    address: 'NH-48 KM 124, Behror',
    city: 'Alwar',
    state: 'Rajasthan',
    details: 'High-speed Diesel Bunkers & Driver Rest Area',
  },
  {
    id: 'fuel-hp-bhiwandi',
    name: 'HPCL Commercial Freight Station',
    category: 'fuel_station',
    lat: 19.3142,
    lng: 73.0655,
    address: 'NH-160 Bypass',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    details: 'AdBlue Bulk Dispenser & LNG Refueling',
  },

  // Service Centers
  {
    id: 'svc-tata-delhi',
    name: 'Tata Motors Prolife Commercial Hub',
    category: 'service_center',
    lat: 28.5012,
    lng: 77.0854,
    address: 'Udyog Vihar Phase 5',
    city: 'Gurugram',
    state: 'Haryana',
    details: '24x7 Heavy Commercial Breakdown & Service Center',
  },
  {
    id: 'svc-al-bangalore',
    name: 'Ashok Leyland Service Touchpoint',
    category: 'service_center',
    lat: 12.9102,
    lng: 77.6254,
    address: 'Bommanahalli Industrial Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    details: 'Telemetry ECU & Engine Workshop',
  }
];

// Major Indian Geofence Zones
export const INDIA_GEOFENCES: GeofenceZone[] = [
  {
    id: 'gf-delhi-hub',
    name: 'NCR Logistics Corridor Geofence',
    type: 'circle',
    center: { lat: 28.4595, lng: 77.0266 },
    radiusMeters: 12000,
    color: '#38bdf8',
    category: 'logistics_hub',
  },
  {
    id: 'gf-bhiwandi-port',
    name: 'Bhiwandi Freight Hub Zone',
    type: 'circle',
    center: { lat: 19.2812, lng: 73.0482 },
    radiusMeters: 15000,
    color: '#22c55e',
    category: 'port',
  },
  {
    id: 'gf-bangalore-ecity',
    name: 'Bengaluru E-City Logistics Zone',
    type: 'circle',
    center: { lat: 12.8452, lng: 77.6602 },
    radiusMeters: 10000,
    color: '#a855f7',
    category: 'industrial_zone',
  },
  {
    id: 'gf-kolkata-icd',
    name: 'Dankuni Freight Geofence',
    type: 'circle',
    center: { lat: 22.6854, lng: 88.2974 },
    radiusMeters: 8000,
    color: '#f59e0b',
    category: 'logistics_hub',
  }
];

// Core Initial Fleet Telemetry (Active Fleet Vehicles across India)
export const INITIAL_FLEET_VEHICLES: DetailedVehicleTelemetry[] = [
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
    source: 'Delhi Depot (IGI)',
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

/**
 * Generate 1000+ Large Fleet Dataset distributed across India high-density corridors
 * for real-time marker clustering & stress testing.
 */
export function generateLargeFleetDataset(count: number = 1000): DetailedVehicleTelemetry[] {
  const result: DetailedVehicleTelemetry[] = [...INITIAL_FLEET_VEHICLES];

  // Core Indian Freight Corridors
  const corridors = [
    { name: 'NH-48 Delhi-Mumbai', startLat: 28.5355, startLng: 77.1010, endLat: 19.0760, endLng: 72.8777 },
    { name: 'NH-44 Delhi-Chennai', startLat: 28.5355, startLng: 77.1010, endLat: 13.0827, endLng: 80.2707 },
    { name: 'NH-19 Delhi-Kolkata', startLat: 28.5355, startLng: 77.1010, endLat: 22.5726, endLng: 88.3639 },
    { name: 'NH-65 Pune-Hyderabad', startLat: 18.5204, startLng: 73.8567, endLat: 17.3850, endLng: 78.4867 },
    { name: 'NH-48 Bangalore-Chennai', startLat: 12.9716, startLng: 77.5946, endLat: 13.0827, endLng: 80.2707 },
    { name: 'NH-27 Ahmedabad-Guwahati', startLat: 23.0225, startLng: 72.5714, endLat: 26.1445, endLng: 91.7362 },
  ];

  const states = ['DL', 'MH', 'KA', 'HR', 'WB', 'GJ', 'TN', 'RJ', 'UP', 'TS', 'MP', 'AP'];
  const drivers = ['Ramesh', 'Suresh', 'Amit', 'Deepak', 'Manoj', 'Sunil', 'Vijay', 'Pankaj', 'Dinesh', 'Sanjay', 'Arun', 'Vikas'];
  const statuses: DetailedVehicleTelemetry['status'][] = ['In Transit', 'In Transit', 'In Transit', 'Available', 'Idle', 'Maintenance', 'Blocked'];

  for (let i = INITIAL_FLEET_VEHICLES.length; i < count; i++) {
    const corridor = corridors[i % corridors.length];
    const progress = (Math.random() * 0.95);
    const lat = corridor.startLat + (corridor.endLat - corridor.startLat) * progress + (Math.random() - 0.5) * 0.15;
    const lng = corridor.startLng + (corridor.endLng - corridor.startLng) * progress + (Math.random() - 0.5) * 0.15;
    const state = states[Math.floor(Math.random() * states.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const speed = status === 'In Transit' ? Math.floor(40 + Math.random() * 45) : 0;
    const category = Math.random() > 0.4 ? 'Owned' : 'Vendor';
    const driverName = `${drivers[Math.floor(Math.random() * drivers.length)]} ${drivers[Math.floor(Math.random() * drivers.length)]}`;
    const heading = Math.floor(Math.random() * 360);

    result.push({
      id: `v-fleet-${i + 1}`,
      vehicleNumber: `${state} ${Math.floor(1 + Math.random() * 99).toString().padStart(2, '0')} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${num}`,
      category,
      status,
      driverName,
      driverPhone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      currentLocation: `${corridor.name} (KM ${Math.floor(progress * 800)})`,
      lat,
      lng,
      heading,
      speedKmH: speed,
      fuelLevel: Math.floor(20 + Math.random() * 78),
      batteryLevel: Math.floor(70 + Math.random() * 30),
      ignition: speed > 0 ? 'ON' : (Math.random() > 0.5 ? 'ON' : 'OFF'),
      lastPing: `${Math.floor(1 + Math.random() * 30)}s ago`,
      source: corridor.name.split(' ')[1] ? corridor.name.split(' ')[1].split('-')[0] + ' Hub' : 'Regional Origin',
      destination: corridor.name.split(' ')[1] ? corridor.name.split(' ')[1].split('-')[1] + ' Terminal' : 'Destination Depot',
      eta: `Today, ${Math.floor(1 + Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`,
      site: `${corridor.name.split(' ')[0]} Fleet Zone`,
      diagnostics: {
        engineTempC: Math.floor(75 + Math.random() * 18),
        coolantLevel: 'Normal (85%)',
        oilPressurePsi: Math.floor(40 + Math.random() * 15),
        tirePressurePsi: Math.floor(105 + Math.random() * 12),
        faultCodes: [],
        odometerKm: Math.floor(20000 + Math.random() * 300000),
        batteryVoltageV: 24.2,
      },
    });
  }

  return result;
}
