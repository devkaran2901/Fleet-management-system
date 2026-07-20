import {
  LayoutDashboard, Truck, UserCog, Calendar, Activity, ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FleetModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
  planned?: string[];
}

export interface FleetGroup {
  label: string;
  modules: FleetModule[];
}

export const FLEET_NAV: FleetGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/fleet/dashboard',
        label: 'Fleet Dashboard',
        icon: LayoutDashboard,
        service: 'S-01',
        built: true,
        summary: 'Strategic fleet console: operational metrics, renewals tracker, and active exceptions.',
      },
    ],
  },
  {
    label: 'Assets',
    modules: [
      {
        to: '/fleet/vehicles',
        label: 'Vehicles (360°)',
        icon: Truck,
        service: 'S-27',
        built: true,
        summary: 'Complete vehicle master with compliance status, fuel trends, and maintenance counters.',
      },
      {
        to: '/fleet/drivers',
        label: 'Drivers (360°)',
        icon: UserCog,
        service: 'S-28',
        built: true,
        summary: 'Driver workforce registry: license validity checkpoints, scorecards, and duty ledgers.',
      },
    ],
  },
  {
    label: 'Operations',
    modules: [
      {
        to: '/fleet/maintenance',
        label: 'PM Planner',
        icon: Calendar,
        service: 'S-11',
        built: true,
        summary: 'Preventive maintenance schedule planner and workshop repair board.',
      },
      {
        to: '/fleet/devices',
        label: 'Device Health',
        icon: Activity,
        service: 'S-30',
        built: true,
        summary: 'Live tracker diagnostic console: signal health, ping ages, and battery alerts.',
      },
    ],
  },
  {
    label: 'Compliance',
    modules: [
      {
        to: '/fleet/compliance',
        label: 'Compliance Center',
        icon: ShieldCheck,
        service: 'S-22',
        built: true,
        summary: 'Document expiration matrix, OCR verification pipelines, and challan workbenches.',
      },
    ],
  },
];

export const FLEET_MODULES: FleetModule[] = FLEET_NAV.flatMap((group) => group.modules);

export const findFleetModule = (pathname: string): FleetModule | undefined =>
  FLEET_MODULES.find((m) => pathname.startsWith(m.to));

export const findFleetGroup = (pathname: string): FleetGroup | undefined =>
  FLEET_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
