// Driver Portal Data Store & State Management

export interface DriverDuty {
  dutyId: string;
  vehicleNumber: string;
  vehicleType: string;
  route: string;
  reportingLocation: string;
  reportingTime: string;
  dispatcherName: string;
  dispatcherContact: string;
  isOnDuty: boolean;
  dutyStartedAt?: string;
}

export type TripState = 
  | 'Assigned' 
  | 'Reported' 
  | 'Started' 
  | 'Pickup Reached' 
  | 'Loaded' 
  | 'In Transit' 
  | 'Delivery Reached' 
  | 'POD Submitted' 
  | 'Closed'
  | 'Cancelled';

export interface TripTimelineStep {
  stage: TripState;
  completed: boolean;
  timestamp?: string;
  location?: string;
}

export interface DriverTrip {
  id: string;
  tripNumber: string;
  route: string;
  customer: string;
  vehicle: string;
  driver: string;
  status: TripState;
  eta: string;
  pickupLocation: string;
  deliveryLocation: string;
  startDate: string;
  endDate?: string;
  podStatus: 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
  timeline: TripTimelineStep[];
  attachments: {
    lr?: string;
    ewb?: string;
    invoice?: string;
    deliveryNotes?: string;
  };
}

export interface VehicleInspectionItem {
  id: string;
  name: string;
  category: 'Exterior' | 'Interior' | 'Safety';
  passed: boolean;
  remarks?: string;
}

export interface VehicleInspectionRecord {
  id: string;
  inspectionId: string;
  vehicleNumber: string;
  date: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Requires Attention';
  checklist: VehicleInspectionItem[];
  overallRemarks: string;
  photoUrl?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: string;
}

export interface EPODRecord {
  id: string;
  tripId: string;
  customer: string;
  podStatus: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  submissionDate: string;
  podPhotoUrl?: string;
  signedPodUrl?: string;
  deliveryDocUrl?: string;
  exceptionType?: 'None' | 'Damage' | 'Short Delivery' | 'Refused Delivery';
  evidencePhotos: string[];
  remarks: string;
  timestamp: string;
  geoLocation: string;
}

export interface KhataTransaction {
  id: string;
  date: string;
  transactionType: 'Advance' | 'Expense Claim' | 'Settlement' | 'Deduction';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  supportingFiles: string[];
  approvalStatus: 'Approved' | 'Pending' | 'Disputed';
  disputeNotes?: string;
}

export interface ExpenseClaim {
  id: string;
  expenseId: string;
  type: 'Fuel' | 'Toll' | 'Parking' | 'Food' | 'Repair' | 'Miscellaneous';
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DriverDocument {
  id: string;
  title: string;
  type: 'Driver' | 'Vehicle' | 'Trip';
  documentName: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileUrl: string;
}

export interface NotificationItem {
  id: string;
  type: 'Duty Assigned' | 'Trip Updates' | 'POD Rejected' | 'Expense Approved' | 'Khata Settlement' | 'License Expiry' | 'SOS Updates';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkedRecordId?: string;
  linkedRecordType?: string;
}

export interface SOSEvent {
  id: string;
  emergencyType: 'Breakdown' | 'Accident' | 'Medical' | 'Security Threat';
  description: string;
  photoUrl?: string;
  location: string;
  timestamp: string;
  driverName: string;
  vehicleNumber: string;
  currentTripId: string;
  status: 'Alert Sent' | 'Acknowledged' | 'Resolved';
  notifiedRoles: string[];
}

export interface DriverProfile {
  name: string;
  employeeId: string;
  mobile: string;
  address: string;
  licenseNumber: string;
  bloodGroup: string;
  emergencyContact: string;
  currentVehicle: string;
  assignedFleet: string;
  language: string;
  isFirstLogin: boolean;
  acceptedTerms: boolean;
}

// Initial Mock Data
export const initialDuty: DriverDuty = {
  dutyId: 'DUTY-8842',
  vehicleNumber: 'MH-12-PQ-9021',
  vehicleType: '32FT Multi-Axle Container',
  route: 'Mumbai (Bhiwandi Hub) → Bengaluru (Nelamangala Hub)',
  reportingLocation: 'Bhiwandi Logistics Park Gate 4',
  reportingTime: '06:30 AM',
  dispatcherName: 'Ramesh Sharma',
  dispatcherContact: '+91 98201 44510',
  isOnDuty: true,
  dutyStartedAt: '2026-07-24 06:28 AM',
};

export const initialTrips: DriverTrip[] = [
  {
    id: 'TRIP-9041',
    tripNumber: 'TRIP-9041',
    route: 'Mumbai → Bengaluru Express',
    customer: 'Flipkart Logistics Pvt Ltd',
    vehicle: 'MH-12-PQ-9021',
    driver: 'Rajesh Kumar (DRV-401)',
    status: 'In Transit',
    eta: 'Today, 08:30 PM',
    pickupLocation: 'Bhiwandi DC Warehouse 12',
    deliveryLocation: 'Nelamangala Hub Gate 2, Bengaluru',
    startDate: '2026-07-24 07:15 AM',
    podStatus: 'Pending',
    timeline: [
      { stage: 'Assigned', completed: true, timestamp: '2026-07-23 04:00 PM', location: 'System Auto-Assign' },
      { stage: 'Reported', completed: true, timestamp: '2026-07-24 06:28 AM', location: 'Bhiwandi Hub Gate 4' },
      { stage: 'Started', completed: true, timestamp: '2026-07-24 06:45 AM', location: 'Yard Pre-Check' },
      { stage: 'Pickup Reached', completed: true, timestamp: '2026-07-24 07:10 AM', location: 'Dock 14, Bhiwandi' },
      { stage: 'Loaded', completed: true, timestamp: '2026-07-24 08:30 AM', location: 'Consignment Sealed' },
      { stage: 'In Transit', completed: true, timestamp: '2026-07-24 09:00 AM', location: 'NH-48 Km 142' },
      { stage: 'Delivery Reached', completed: false },
      { stage: 'POD Submitted', completed: false },
      { stage: 'Closed', completed: false },
    ],
    attachments: {
      lr: 'LR-88204-Bhiwandi.pdf',
      ewb: 'EWB-392019482.pdf',
      invoice: 'INV-2026-9481.pdf',
      deliveryNotes: 'Gate-Pass-Copy.pdf',
    },
  },
  {
    id: 'TRIP-8980',
    tripNumber: 'TRIP-8980',
    route: 'Pune → Hyderabad Freight Corridor',
    customer: 'Amazon Transportation Services',
    vehicle: 'MH-12-PQ-9021',
    driver: 'Rajesh Kumar (DRV-401)',
    status: 'Closed',
    eta: 'Completed',
    pickupLocation: 'Chakan Industrial Area, Pune',
    deliveryLocation: 'Shamshabad FC, Hyderabad',
    startDate: '2026-07-20 08:00 AM',
    endDate: '2026-07-21 04:30 PM',
    podStatus: 'Verified',
    timeline: [
      { stage: 'Assigned', completed: true, timestamp: '2026-07-19' },
      { stage: 'Reported', completed: true, timestamp: '2026-07-20 07:30 AM' },
      { stage: 'Started', completed: true, timestamp: '2026-07-20 08:00 AM' },
      { stage: 'Pickup Reached', completed: true, timestamp: '2026-07-20 08:45 AM' },
      { stage: 'Loaded', completed: true, timestamp: '2026-07-20 10:30 AM' },
      { stage: 'In Transit', completed: true, timestamp: '2026-07-20 11:00 AM' },
      { stage: 'Delivery Reached', completed: true, timestamp: '2026-07-21 02:00 PM' },
      { stage: 'POD Submitted', completed: true, timestamp: '2026-07-21 03:15 PM' },
      { stage: 'Closed', completed: true, timestamp: '2026-07-21 04:30 PM' },
    ],
    attachments: {
      lr: 'LR-87102-Chakan.pdf',
      ewb: 'EWB-2819024.pdf',
      invoice: 'INV-2026-8102.pdf',
    },
  },
];

export const initialInspections: VehicleInspectionRecord[] = [
  {
    id: 'INSP-904',
    inspectionId: 'INSP-904',
    vehicleNumber: 'MH-12-PQ-9021',
    date: '2026-07-24 06:35 AM',
    status: 'Approved',
    checklist: [
      { id: 'ext-1', name: 'Tyres Pressure & Tread Depth', category: 'Exterior', passed: true },
      { id: 'ext-2', name: 'Headlights & High Beams', category: 'Exterior', passed: true },
      { id: 'ext-3', name: 'Indicators & Brake Lights', category: 'Exterior', passed: true },
      { id: 'ext-4', name: 'Side Mirrors & Rearview Visibility', category: 'Exterior', passed: true },
      { id: 'ext-5', name: 'Body Damage / Scratches', category: 'Exterior', passed: true },
      { id: 'int-1', name: 'Dashboard Gauges & Telematics Console', category: 'Interior', passed: true },
      { id: 'int-2', name: 'Dual Air Horn', category: 'Interior', passed: true },
      { id: 'int-3', name: 'Air-Suspension Seat Adjustment', category: 'Interior', passed: true },
      { id: 'int-4', name: 'Seatbelt Lock & Tensioner', category: 'Interior', passed: true },
      { id: 'saf-1', name: 'ABC Dry Powder Fire Extinguisher (2kg)', category: 'Safety', passed: true },
      { id: 'saf-2', name: 'Sealed First Aid Kit', category: 'Safety', passed: true },
      { id: 'saf-3', name: 'Reflective Emergency Warning Triangles', category: 'Safety', passed: true },
    ],
    overallRemarks: 'All pre-trip safety checks passed cleanly. Vehicle cleared for interstate haul.',
    photoUrl: 'pretrip-front-grille.jpg',
    voiceNoteUrl: 'voice-note-inspection-904.mp3',
    voiceNoteDuration: '0:24',
  },
];

export const initialEPODs: EPODRecord[] = [
  {
    id: 'POD-9041',
    tripId: 'TRIP-9041',
    customer: 'Flipkart Logistics Pvt Ltd',
    podStatus: 'Pending',
    submissionDate: 'Pending Arrival',
    evidencePhotos: [],
    remarks: 'Awaiting arrival at Nelamangala Hub for consignee stamp and signature.',
    timestamp: '2026-07-24 09:00 AM',
    geoLocation: '19.0760° N, 72.8777° E (Mumbai DC)',
  },
  {
    id: 'POD-8980',
    tripId: 'TRIP-8980',
    customer: 'Amazon Transportation Services',
    podStatus: 'Approved',
    submissionDate: '2026-07-21 03:15 PM',
    podPhotoUrl: 'POD-8980-Stamp-Verified.pdf',
    signedPodUrl: 'Signed-LR-8980.png',
    deliveryDocUrl: 'Gate-Pass-Hyd.pdf',
    exceptionType: 'None',
    evidencePhotos: ['cargo-unloaded-dock3.jpg', 'seal-broken-verified.jpg'],
    remarks: 'Delivered 420 cartons in prime condition. Zero damages recorded.',
    timestamp: '2026-07-21 03:15 PM IST',
    geoLocation: '17.2403° N, 78.4294° E (Shamshabad Hub)',
  },
];

export const initialKhataTransactions: KhataTransaction[] = [
  {
    id: 'TXN-701',
    date: '2026-07-24',
    transactionType: 'Advance',
    description: 'Fuel & Toll Cash Advance - Trip TRIP-9041',
    debit: 0,
    credit: 5000,
    balance: 7850,
    supportingFiles: ['Bank-Transfer-UTR-99201.pdf'],
    approvalStatus: 'Approved',
  },
  {
    id: 'TXN-700',
    date: '2026-07-22',
    transactionType: 'Expense Claim',
    description: 'Emergency Tyre Puncture & Valve Replacement (Chakan)',
    debit: 650,
    credit: 0,
    balance: 2850,
    supportingFiles: ['Receipt-Puncture-Shop.jpg'],
    approvalStatus: 'Approved',
  },
  {
    id: 'TXN-699',
    date: '2026-07-20',
    transactionType: 'Advance',
    description: 'Trip Start Advance - TRIP-8980',
    debit: 0,
    credit: 3500,
    balance: 3500,
    supportingFiles: ['UPI-Payment-Confirmation.pdf'],
    approvalStatus: 'Approved',
  },
];

export const initialExpenseClaims: ExpenseClaim[] = [
  {
    id: 'EXP-401',
    expenseId: 'EXP-401',
    type: 'Fuel',
    amount: 4500,
    date: '2026-07-24',
    description: 'Diesel Fill 50 Litres at HPCL Bhiwandi Pump #4',
    receiptUrl: 'hpcl-diesel-bill-24jul.jpg',
    status: 'Approved',
  },
  {
    id: 'EXP-402',
    expenseId: 'EXP-402',
    type: 'Toll',
    amount: 850,
    date: '2026-07-24',
    description: 'Mumbai-Pune Expressway Toll Plaza Cash Adjustment',
    receiptUrl: 'toll-receipt-mumbai-pune.pdf',
    status: 'Approved',
  },
  {
    id: 'EXP-403',
    expenseId: 'EXP-403',
    type: 'Repair',
    amount: 650,
    date: '2026-07-22',
    description: 'Tyre Puncture Repair & Valve Change at Chakan',
    receiptUrl: 'puncture-bill.jpg',
    status: 'Approved',
  },
];

export const initialDocuments: DriverDocument[] = [
  {
    id: 'DOC-101',
    title: 'Heavy Commercial Driving License (HMV)',
    type: 'Driver',
    documentName: 'DL-MH12-2018-948201.pdf',
    expiryDate: '2028-11-15',
    status: 'Valid',
    fileUrl: '/docs/DL-RajeshKumar.pdf',
  },
  {
    id: 'DOC-102',
    title: 'Driver Aadhaar Identification Card',
    type: 'Driver',
    documentName: 'Aadhaar-Rajesh-Kumar.pdf',
    expiryDate: 'N/A (Permanent)',
    status: 'Valid',
    fileUrl: '/docs/Aadhaar.pdf',
  },
  {
    id: 'DOC-103',
    title: 'Annual Driver Medical & Fitness Certificate',
    type: 'Driver',
    documentName: 'Medical-Certificate-2026.pdf',
    expiryDate: '2026-09-30',
    status: 'Expiring Soon',
    fileUrl: '/docs/Medical.pdf',
  },
  {
    id: 'DOC-104',
    title: 'Hazmat & Defensive Driving Training Badge',
    type: 'Driver',
    documentName: 'Hazmat-Cert-Level2.pdf',
    expiryDate: '2027-04-12',
    status: 'Valid',
    fileUrl: '/docs/Hazmat.pdf',
  },
  {
    id: 'DOC-201',
    title: 'Vehicle Registration Certificate (RC)',
    type: 'Vehicle',
    documentName: 'RC-MH-12-PQ-9021.pdf',
    expiryDate: '2030-05-20',
    status: 'Valid',
    fileUrl: '/docs/RC-MH12.pdf',
  },
  {
    id: 'DOC-202',
    title: 'Commercial Vehicle Goods Insurance Policy',
    type: 'Vehicle',
    documentName: 'Insurance-Policy-ICICI-2026.pdf',
    expiryDate: '2027-02-28',
    status: 'Valid',
    fileUrl: '/docs/Insurance.pdf',
  },
  {
    id: 'DOC-203',
    title: 'All India National Goods Permit (NP)',
    type: 'Vehicle',
    documentName: 'National-Permit-MH12.pdf',
    expiryDate: '2027-01-10',
    status: 'Valid',
    fileUrl: '/docs/Permit.pdf',
  },
  {
    id: 'DOC-204',
    title: 'RTO Vehicle Fitness Certificate',
    type: 'Vehicle',
    documentName: 'Fitness-Cert-2026.pdf',
    expiryDate: '2026-08-15',
    status: 'Expiring Soon',
    fileUrl: '/docs/Fitness.pdf',
  },
  {
    id: 'DOC-205',
    title: 'Pollution Under Control (PUC) Certificate',
    type: 'Vehicle',
    documentName: 'PUC-Certificate-MH12.pdf',
    expiryDate: '2026-12-01',
    status: 'Valid',
    fileUrl: '/docs/PUC.pdf',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-301',
    type: 'Duty Assigned',
    title: 'New Inter-State Duty Assigned',
    message: 'You have been assigned Duty DUTY-8842 on Vehicle MH-12-PQ-9021 for Mumbai → Bengaluru route.',
    timestamp: 'Today at 06:15 AM',
    read: false,
    linkedRecordId: 'DUTY-8842',
    linkedRecordType: 'Duty',
  },
  {
    id: 'NOTIF-302',
    type: 'Trip Updates',
    title: 'Consignment Sealed & Waybill Generated',
    message: 'Flipkart DC Warehouse 12 loaded cargo. E-Way Bill EWB-392019482 verified.',
    timestamp: 'Today at 08:32 AM',
    read: false,
    linkedRecordId: 'TRIP-9041',
    linkedRecordType: 'Trip',
  },
  {
    id: 'NOTIF-303',
    type: 'Expense Approved',
    title: 'Fuel Advance Claim EXP-401 Approved',
    message: 'Finance department approved your ₹4,500 Diesel expense claim.',
    timestamp: 'Yesterday at 05:40 PM',
    read: true,
    linkedRecordId: 'EXP-401',
    linkedRecordType: 'Expense',
  },
  {
    id: 'NOTIF-304',
    type: 'Khata Settlement',
    title: 'Weekly Khata Payout Transferred',
    message: '₹3,500 advance successfully credited to your registered bank account.',
    timestamp: '2026-07-21 at 11:20 AM',
    read: true,
    linkedRecordId: 'TXN-699',
    linkedRecordType: 'Khata',
  },
];

export const initialProfile: DriverProfile = {
  name: 'Rajesh Kumar',
  employeeId: 'DRV-401',
  mobile: '+91 98765 43210',
  address: 'Flat 304, Green Heights, Nigdi, Pune, Maharashtra - 411044',
  licenseNumber: 'MH-1220180094820',
  bloodGroup: 'O +ve',
  emergencyContact: '+91 98220 11982 (Sunita Kumar - Spouse)',
  currentVehicle: 'MH-12-PQ-9021',
  assignedFleet: 'Western Heavy Commercial Container Fleet',
  language: 'English',
  isFirstLogin: false,
  acceptedTerms: true,
};
