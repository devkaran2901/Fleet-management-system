import {
  LayoutDashboard,
  Award,
  Inbox,
  Truck,
  Navigation,
  Users,
  UserCheck,
  ShieldAlert,
  FileText,
  PlusCircle,
  CreditCard,
  Building,
  Bell,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface VendorModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
  planned?: string[];
}

export interface VendorNavGroup {
  label: string;
  modules: VendorModule[];
}

export const VENDOR_NAV: VendorNavGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/vendor/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        service: 'V-00',
        built: true,
        summary: 'Vendor Portal Command Center with real-time operational vitals.',
      },
      {
        to: '/vendor/scorecard',
        label: 'Vendor Scorecard',
        icon: Award,
        service: 'V-05',
        built: true,
        summary: 'Performance metrics, SLA compliance, quality rating, and spot share trend.',
      },
    ],
  },
  {
    label: 'Operations & Dispatch',
    modules: [
      {
        to: '/vendor/indents',
        label: 'Indent Inbox',
        icon: Inbox,
        service: 'V-01',
        built: true,
        summary: 'Assigned freight indents awaiting vehicle assignment or bidding.',
      },
      {
        to: '/vendor/placements',
        label: 'Placement Tracker',
        icon: Truck,
        service: 'V-02',
        built: true,
        summary: 'Track indents, compliance clearance, reporting, and gate entry status.',
      },
      {
        to: '/vendor/trips',
        label: 'Trip Tracking',
        icon: Navigation,
        service: 'V-07',
        built: true,
        summary: 'Real-time GPS movement, exception alerts, and milestone tracking.',
      },
    ],
  },
  {
    label: 'Fleet & Human Resources',
    modules: [
      {
        to: '/vendor/fleet',
        label: 'My Fleet & Docs',
        icon: Truck,
        service: 'V-03',
        built: true,
        summary: 'Fleet registry, document expiration status, and onboarding actions.',
      },
      {
        to: '/vendor/drivers',
        label: 'Drivers Roster',
        icon: Users,
        service: 'V-06',
        built: true,
        summary: 'Driver profiles, licensing, phone contact, and compliance state.',
      },
      {
        to: '/vendor/drivers/verification',
        label: 'Driver Verification',
        icon: UserCheck,
        service: 'V-06B',
        built: true,
        summary: 'License validation, background verification, and compliance checks.',
      },
      {
        to: '/vendor/compliance',
        label: 'Compliance Center',
        icon: ShieldAlert,
        service: 'V-08',
        built: true,
        summary: 'Document expiration alerts, hold reasons, and re-verification requests.',
      },
    ],
  },
  {
    label: 'Finance & Billing',
    modules: [
      {
        to: '/vendor/bills',
        label: 'Bills Workbench',
        icon: FileText,
        service: 'V-04',
        built: true,
        summary: 'Freight bill submissions, verification status, and deduction details.',
      },
      {
        to: '/vendor/bills/new',
        label: 'Submit New Bill',
        icon: PlusCircle,
        service: 'V-04B',
        built: true,
        summary: 'Create and submit freight bills with POD attachments.',
      },
      {
        to: '/vendor/payments',
        label: 'Payment Tracking',
        icon: CreditCard,
        service: 'V-09',
        built: true,
        summary: 'Payment release calendar, UTR receipts, and settlement history.',
      },
    ],
  },
  {
    label: 'Account & System',
    modules: [
      {
        to: '/vendor/profile',
        label: 'Profile & KYC 360°',
        icon: Building,
        service: 'V-10',
        built: true,
        summary: 'Vendor profile, bank account verification, GSTIN, and KYC status.',
      },
      {
        to: '/vendor/notifications',
        label: 'Notifications Center',
        icon: Bell,
        service: 'V-11',
        built: true,
        summary: 'Operational alerts, document warnings, and payment notifications.',
      },
      {
        to: '/vendor/settings',
        label: 'Portal Settings',
        icon: Settings,
        service: 'V-12',
        built: true,
        summary: 'System preferences, webhook integrations, and API key management.',
      },
    ],
  },
];

export function findVendorModule(pathname: string): VendorModule | undefined {
  for (const g of VENDOR_NAV) {
    for (const mod of g.modules) {
      if (mod.to === pathname || pathname.startsWith(mod.to + '/')) return mod;
    }
  }
  return undefined;
}

export function findVendorGroup(pathname: string): VendorNavGroup | undefined {
  for (const g of VENDOR_NAV) {
    for (const mod of g.modules) {
      if (mod.to === pathname || pathname.startsWith(mod.to + '/')) return g;
    }
  }
  return undefined;
}
