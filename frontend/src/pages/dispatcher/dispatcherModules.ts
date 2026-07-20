import {
  LayoutDashboard, Truck, UserCog, ClipboardList, Route, DoorOpen, AlertTriangle, BarChart3
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DispatcherModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
  planned?: string[];
}

export interface DispatcherGroup {
  label: string;
  modules: DispatcherModule[];
}

export const DISPATCHER_NAV: DispatcherGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/dispatcher/dashboard',
        label: 'Dispatch Board',
        icon: LayoutDashboard,
        service: 'P-11',
        built: true,
        summary: 'Primary dispatch board: demand lane, timeline scheduler, context panel, live map, and exception feed.',
      },
    ],
  },
  {
    label: 'Execution',
    modules: [
      {
        to: '/dispatcher/requests',
        label: 'Transport Requests',
        icon: ClipboardList,
        service: 'P-12',
        built: true,
        summary: 'Intake and complete transport requests before allocating them to owned or vendor fleets.',
      },
      {
        to: '/dispatcher/trips',
        label: 'Trip Management',
        icon: Route,
        service: 'P-13',
        built: true,
        summary: 'Manage runs, view active trips, upload PODs, track fuel, toll expenses, and audit logs.',
      },
      {
        to: '/dispatcher/gate-queue',
        label: 'Gate Queue',
        icon: DoorOpen,
        service: 'P-14',
        built: true,
        summary: 'Expected, waiting, and yard-entered vehicles queue with ANPR verifications and detention timers.',
      },
    ],
  },
  {
    label: 'Capacity',
    modules: [
      {
        to: '/dispatcher/drivers',
        label: 'Drivers',
        icon: UserCog,
        service: 'P-15',
        built: true,
        summary: 'Roster and availability metrics: duty hours, rest limits, KYC DL records, and safety scores.',
      },
      {
        to: '/dispatcher/vehicles',
        label: 'Vehicles',
        icon: Truck,
        service: 'P-16',
        built: true,
        summary: 'Asset checklist status: PM interval locks, FASTag balance, GPS telemetry status, and fitness permits.',
      },
    ],
  },
  {
    label: 'Monitoring',
    modules: [
      {
        to: '/dispatcher/exceptions',
        label: 'Exception Center',
        icon: AlertTriangle,
        service: 'P-17',
        built: true,
        summary: 'Unified telemetry alerts: overspeeds, breakdowns, route deviations, and geo-fence breaches.',
      },
    ],
  },
  {
    label: 'Analysis',
    modules: [
      {
        to: '/dispatcher/reports',
        label: 'Reports',
        icon: BarChart3,
        service: 'P-18',
        built: true,
        summary: 'Operational metrics: plan stability scores, driver utilization, vendor failures, and summary logs.',
      },
    ],
  },
];

export const DISPATCHER_MODULES: DispatcherModule[] = DISPATCHER_NAV.flatMap((group) => group.modules);

export const findDispatcherModule = (pathname: string): DispatcherModule | undefined =>
  DISPATCHER_MODULES.find((m) => pathname.startsWith(m.to));

export const findDispatcherGroup = (pathname: string): DispatcherGroup | undefined =>
  DISPATCHER_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
