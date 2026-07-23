export interface Indent {
  id: string;
  customer: string;
  route: string;
  pickupLocation: string;
  deliveryLocation: string;
  vehicleTypeRequired: string;
  capacityRequired: string;
  reportingTime: string;
  expectedTripValue: number;
  remainingSeconds: number;
  status: 'AWAITING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  assignedVehicle?: string;
  assignedDriver?: string;
}

export interface Placement {
  id: string;
  indentId: string;
  customer: string;
  route: string;
  status: 'Indent Received' | 'Accepted' | 'Vehicle Assigned' | 'Driver Assigned' | 'Compliance Verification' | 'Approved' | 'Reported' | 'Trip Started' | 'Delivered' | 'Closed';
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  documentStatus: 'Valid' | 'Expired Document' | 'Verification Pending' | 'Action Needed';
  complianceHold: boolean;
  rejectionReason?: string;
  missingDocumentName?: string;
  reportingTime: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: string;
  capacity: string;
  model: string;
  fitnessExpiry: string;
  permitExpiry: string;
  insuranceExpiry: string;
  pucExpiry: string;
  ais140Status: 'ACTIVE' | 'OFFLINE' | 'NO_DEVICE';
  overallStatus: 'Valid' | 'Expiring Soon' | 'Expired' | 'Rejected';
  documents: {
    rc: 'Valid' | 'Expiring Soon' | 'Expired';
    insurance: 'Valid' | 'Expiring Soon' | 'Expired';
    fitness: 'Valid' | 'Expiring Soon' | 'Expired';
    permit: 'Valid' | 'Expiring Soon' | 'Expired';
    tax: 'Valid' | 'Expiring Soon' | 'Expired';
    puc: 'Valid' | 'Expiring Soon' | 'Expired';
    ais140Cert: 'Valid' | 'Expiring Soon' | 'Expired';
  };
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  assignedVehicle?: string;
  documents: {
    dl: string; // Expiry
    aadhaarStatus: 'Verified' | 'Pending' | 'Rejected';
    medicalCertStatus: 'Verified' | 'Pending' | 'Rejected';
  };
  rejectionNotes?: string;
}

export interface Bill {
  id: string;
  tripId: string;
  customer: string;
  vehicleNumber: string;
  driverName: string;
  route: string;
  contractRate: number;
  distanceKm: number;
  expectedAmount: number;
  submittedAmount: number;
  difference: number;
  status: 'Draft' | 'Submitted' | 'Under Verification' | 'Deviation Found' | 'Approved' | 'Paid';
  verificationRemarks?: string;
  podUploaded: boolean;
  invoicePdfUploaded: boolean;
  submissionDate: string;
}

export interface PaymentItem {
  id: string;
  billNumber: string;
  customer: string;
  status: 'Pending Verification' | 'Approved' | 'Scheduled' | 'Disbursed' | 'Failed';
  grossAmount: number;
  debitNotes: number;
  tdsAmount: number;
  netPayable: number;
  payoutDate?: string;
  referenceNumber?: string;
}

export const initialIndents: Indent[] = [
  {
    id: 'IND-9012',
    customer: 'Amazon Transportation India',
    route: 'Bhiwandi (MH) -> Chakan, Pune (MH)',
    pickupLocation: 'Hub 4, Bhiwandi Logistics Park',
    deliveryLocation: 'Chakan FC-02',
    vehicleTypeRequired: '32 FT Multi-Axle Container',
    capacityRequired: '18 MT',
    reportingTime: 'Today at 14:00 PM',
    expectedTripValue: 48500,
    remainingSeconds: 840,
    status: 'AWAITING',
  },
  {
    id: 'IND-9015',
    customer: 'Reliance Retail Logistics',
    route: 'Navi Mumbai -> Ahmedabad (GJ)',
    pickupLocation: 'Taloja Industrial Area',
    deliveryLocation: 'Sanand Retail Hub',
    vehicleTypeRequired: '24 FT Open Body',
    capacityRequired: '12 MT',
    reportingTime: 'Today at 16:30 PM',
    expectedTripValue: 62000,
    remainingSeconds: 1420,
    status: 'AWAITING',
  },
  {
    id: 'IND-9018',
    customer: 'Delhivery Supply Chain',
    route: 'Bengaluru (KA) -> Chennai (TN)',
    pickupLocation: 'Nelamangala Gateway FC',
    deliveryLocation: 'Sriperumbudur Hub',
    vehicleTypeRequired: '32 FT Single Axle',
    capacityRequired: '15 MT',
    reportingTime: 'Tomorrow at 08:00 AM',
    expectedTripValue: 39000,
    remainingSeconds: 2900,
    status: 'AWAITING',
  },
  {
    id: 'IND-8990',
    customer: 'Tata Motors Freight',
    route: 'Pune (MH) -> Gurgaon (HR)',
    pickupLocation: 'Pimpri Warehouse',
    deliveryLocation: 'Gurgaon Auto Yard',
    vehicleTypeRequired: '40 FT Trailer',
    capacityRequired: '22 MT',
    reportingTime: 'Yesterday at 10:00 AM',
    expectedTripValue: 110000,
    remainingSeconds: 0,
    status: 'ACCEPTED',
    assignedVehicle: 'MH-12-PQ-9988',
    assignedDriver: 'Ramesh Kumar',
  },
];

export const initialPlacements: Placement[] = [
  {
    id: 'PLC-501',
    indentId: 'IND-8990',
    customer: 'Tata Motors Freight',
    route: 'Pune (MH) -> Gurgaon (HR)',
    status: 'Compliance Verification',
    vehicleNumber: 'MH-12-PQ-9988',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    documentStatus: 'Expired Document',
    complianceHold: true,
    rejectionReason: 'Vehicle Insurance expired on 18th July 2026. Needs renewal upload.',
    missingDocumentName: 'Insurance Certificate',
    reportingTime: 'Today at 14:00 PM',
  },
  {
    id: 'PLC-502',
    indentId: 'IND-8975',
    customer: 'Mahindra Logistics',
    route: 'Chakan -> Chakan Line Supply',
    status: 'Reported',
    vehicleNumber: 'KA-01-AB-1234',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98220 11223',
    documentStatus: 'Valid',
    complianceHold: false,
    reportingTime: 'Today at 09:30 AM',
  },
  {
    id: 'PLC-503',
    indentId: 'IND-8960',
    customer: 'Nestle India',
    route: 'Bhiwandi -> Nagpur',
    status: 'Trip Started',
    vehicleNumber: 'HR-26-DQ-7711',
    driverName: 'Vijay Singh',
    driverPhone: '+91 97110 33445',
    documentStatus: 'Valid',
    complianceHold: false,
    reportingTime: 'Yesterday at 18:00 PM',
  },
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'V-01',
    registrationNumber: 'MH-12-PQ-9988',
    vehicleType: '32 FT Multi-Axle Container',
    capacity: '18 MT',
    model: 'Tata Signa 2823.K (2023)',
    fitnessExpiry: '2027-03-15',
    permitExpiry: '2026-11-20',
    insuranceExpiry: '2026-07-18', // Expired
    pucExpiry: '2026-08-10',
    ais140Status: 'ACTIVE',
    overallStatus: 'Expired',
    documents: {
      rc: 'Valid',
      insurance: 'Expired',
      fitness: 'Valid',
      permit: 'Valid',
      tax: 'Valid',
      puc: 'Expiring Soon',
      ais140Cert: 'Valid',
    },
  },
  {
    id: 'V-02',
    registrationNumber: 'KA-01-AB-1234',
    vehicleType: '32 FT Single Axle',
    capacity: '15 MT',
    model: 'Ashok Leyland Ecomet 1615 (2022)',
    fitnessExpiry: '2027-01-10',
    permitExpiry: '2027-05-12',
    insuranceExpiry: '2026-12-01',
    pucExpiry: '2026-09-30',
    ais140Status: 'ACTIVE',
    overallStatus: 'Valid',
    documents: {
      rc: 'Valid',
      insurance: 'Valid',
      fitness: 'Valid',
      permit: 'Valid',
      tax: 'Valid',
      puc: 'Valid',
      ais140Cert: 'Valid',
    },
  },
  {
    id: 'V-03',
    registrationNumber: 'HR-26-DQ-7711',
    vehicleType: '40 FT Trailer',
    capacity: '22 MT',
    model: 'BharatBenz 3528T (2024)',
    fitnessExpiry: '2028-06-25',
    permitExpiry: '2027-08-14',
    insuranceExpiry: '2026-08-05', // T-15 expiry
    pucExpiry: '2026-08-01', // T-7 expiry
    ais140Status: 'ACTIVE',
    overallStatus: 'Expiring Soon',
    documents: {
      rc: 'Valid',
      insurance: 'Expiring Soon',
      fitness: 'Valid',
      permit: 'Valid',
      tax: 'Valid',
      puc: 'Expiring Soon',
      ais140Cert: 'Valid',
    },
  },
];

export const initialDrivers: Driver[] = [
  {
    id: 'D-01',
    name: 'Ramesh Kumar',
    licenseNumber: 'MH-1220180098441',
    phone: '+91 98765 43210',
    verificationStatus: 'Verified',
    assignedVehicle: 'MH-12-PQ-9988',
    documents: {
      dl: '2028-10-15',
      aadhaarStatus: 'Verified',
      medicalCertStatus: 'Verified',
    },
  },
  {
    id: 'D-02',
    name: 'Suresh Yadav',
    licenseNumber: 'KA-0120190044321',
    phone: '+91 98220 11223',
    verificationStatus: 'Verified',
    assignedVehicle: 'KA-01-AB-1234',
    documents: {
      dl: '2027-04-20',
      aadhaarStatus: 'Verified',
      medicalCertStatus: 'Verified',
    },
  },
  {
    id: 'D-03',
    name: 'Vijay Singh',
    licenseNumber: 'DL-0420210088990',
    phone: '+91 97110 33445',
    verificationStatus: 'Verified',
    assignedVehicle: 'HR-26-DQ-7711',
    documents: {
      dl: '2029-01-11',
      aadhaarStatus: 'Verified',
      medicalCertStatus: 'Verified',
    },
  },
  {
    id: 'D-04',
    name: 'Manish Sharma',
    licenseNumber: 'UP-1420230011223',
    phone: '+91 99554 43322',
    verificationStatus: 'Pending',
    documents: {
      dl: '2028-09-01',
      aadhaarStatus: 'Pending',
      medicalCertStatus: 'Verified',
    },
    rejectionNotes: 'Aadhaar copy is blurry. Please upload clear scan.',
  },
];

export const initialBills: Bill[] = [
  {
    id: 'BILL-8801',
    tripId: 'TRIP-4011',
    customer: 'Amazon Transportation India',
    vehicleNumber: 'KA-01-AB-1234',
    driverName: 'Suresh Yadav',
    route: 'Bhiwandi -> Pune',
    contractRate: 48500,
    distanceKm: 165,
    expectedAmount: 48500,
    submittedAmount: 48500,
    difference: 0,
    status: 'Approved',
    podUploaded: true,
    invoicePdfUploaded: true,
    submissionDate: '2026-07-21',
    verificationRemarks: 'POD verified cleanly. Standard rate matched.',
  },
  {
    id: 'BILL-8802',
    tripId: 'TRIP-4012',
    customer: 'Delhivery Supply Chain',
    vehicleNumber: 'HR-26-DQ-7711',
    driverName: 'Vijay Singh',
    route: 'Bengaluru -> Chennai',
    contractRate: 39000,
    distanceKm: 340,
    expectedAmount: 39000,
    submittedAmount: 42500,
    difference: 3500,
    status: 'Deviation Found',
    podUploaded: true,
    invoicePdfUploaded: true,
    submissionDate: '2026-07-22',
    verificationRemarks: 'Submitted amount exceeds contract rate by ₹3,500. Detaining charges claimed without approval slip.',
  },
  {
    id: 'BILL-8803',
    tripId: 'TRIP-4019',
    customer: 'Reliance Retail',
    vehicleNumber: 'MH-12-PQ-9988',
    driverName: 'Ramesh Kumar',
    route: 'Navi Mumbai -> Ahmedabad',
    contractRate: 62000,
    distanceKm: 530,
    expectedAmount: 62000,
    submittedAmount: 62000,
    difference: 0,
    status: 'Under Verification',
    podUploaded: true,
    invoicePdfUploaded: true,
    submissionDate: '2026-07-23',
    verificationRemarks: 'OCR verification in progress...',
  },
];

export const initialPayments: PaymentItem[] = [
  {
    id: 'PAY-1001',
    billNumber: 'BILL-8801',
    customer: 'Amazon Transportation India',
    status: 'Disbursed',
    grossAmount: 48500,
    debitNotes: 500, // Late reporting penalty
    tdsAmount: 970, // 2% TDS
    netPayable: 47030,
    payoutDate: '2026-07-22',
    referenceNumber: 'HDFC-UTR-9982310492',
  },
  {
    id: 'PAY-1002',
    billNumber: 'BILL-8804',
    customer: 'Tata Motors Freight',
    status: 'Scheduled',
    grossAmount: 110000,
    debitNotes: 0,
    tdsAmount: 2200,
    netPayable: 107800,
    payoutDate: '2026-07-25',
    referenceNumber: 'SCHEDULED-REF-7712',
  },
  {
    id: 'PAY-1003',
    billNumber: 'BILL-8803',
    customer: 'Reliance Retail',
    status: 'Pending Verification',
    grossAmount: 62000,
    debitNotes: 0,
    tdsAmount: 1240,
    netPayable: 60760,
  },
];
