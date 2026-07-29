import {
  LayoutDashboard,
  MapPin,
  FileText,
  ClipboardCheck,
  DollarSign,
  BookOpen,
  Bell,
  User,
  AlertTriangle,
  Star,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DriverModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
  planned?: string[];
}

export interface DriverNavGroup {
  label: string;
  modules: DriverModule[];
}

export const DRIVER_NAV: DriverNavGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/driver/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        service: 'D-00',
        built: true,
        summary: 'Driver Portal command centre with trip status and vitals.',
      },
      {
        to: '/driver/score-earnings',
        label: 'Score & Earnings',
        icon: Star,
        service: 'D-01',
        built: true,
        summary: 'Performance score, earnings summary, and incentive breakdown.',
      },
    ],
  },
  {
    label: 'Trips & Operations',
    modules: [
      {
        to: '/driver/trips',
        label: 'My Trips',
        icon: MapPin,
        service: 'D-02',
        built: true,
        summary: 'Active and historical trip log with route details.',
      },
      {
        to: '/driver/epod',
        label: 'Electronic POD',
        icon: Package,
        service: 'D-03',
        built: true,
        summary: 'Submit and view electronic proof of delivery for trips.',
      },
      {
        to: '/driver/inspection',
        label: 'Vehicle Inspection',
        icon: ClipboardCheck,
        service: 'D-04',
        built: true,
        summary: 'Pre-trip and post-trip vehicle inspection checklists.',
      },
    ],
  },
  {
    label: 'Finance',
    modules: [
      {
        to: '/driver/expenses',
        label: 'Expense Claims',
        icon: DollarSign,
        service: 'D-05',
        built: true,
        summary: 'Submit and track fuel, toll, and other trip expenses.',
      },
      {
        to: '/driver/khata',
        label: 'Khata Management',
        icon: BookOpen,
        service: 'D-06',
        built: true,
        summary: 'Driver ledger — advances, deductions, and outstanding balance.',
      },
    ],
  },
  {
    label: 'Documents & Account',
    modules: [
      {
        to: '/driver/documents',
        label: 'My Documents',
        icon: FileText,
        service: 'D-07',
        built: true,
        summary: 'License, RC, permits, and other compliance documents.',
      },
      {
        to: '/driver/profile',
        label: 'My Profile',
        icon: User,
        service: 'D-08',
        built: true,
        summary: 'Personal details, bank account, and contact information.',
      },
      {
        to: '/driver/notifications',
        label: 'Notifications',
        icon: Bell,
        service: 'D-09',
        built: true,
        summary: 'Trip alerts, document expiry reminders, and system messages.',
      },
      {
        to: '/driver/sos',
        label: 'SOS & Emergency',
        icon: AlertTriangle,
        service: 'D-10',
        built: true,
        summary: 'Emergency contacts, breakdown alerts, and SOS trigger.',
      },
    ],
  },
];

export function findDriverModule(pathname: string): DriverModule | undefined {
  for (const g of DRIVER_NAV) {
    for (const mod of g.modules) {
      if (mod.to === pathname || pathname.startsWith(mod.to + '/')) return mod;
    }
  }
  return undefined;
}

export function findDriverGroup(pathname: string): DriverNavGroup | undefined {
  for (const g of DRIVER_NAV) {
    for (const mod of g.modules) {
      if (mod.to === pathname || pathname.startsWith(mod.to + '/')) return g;
    }
  }
  return undefined;
}
