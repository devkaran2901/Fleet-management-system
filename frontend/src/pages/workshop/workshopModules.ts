import {
  LayoutDashboard,
  Wrench,
  Kanban,
  CalendarClock,
  Calculator,
  PackageCheck,
  Users,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WorkshopModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
}

export interface WorkshopGroup {
  label: string;
  modules: WorkshopModule[];
}

export const WORKSHOP_NAV: WorkshopGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/workshop/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        service: 'R-06',
        built: true,
        summary: 'Role workspace: KPI cards, Bay board summary, parts demand, estimate queue, and QC queue.',
      },
    ],
  },
  {
    label: 'Operations',
    modules: [
      {
        to: '/workshop/job-cards',
        label: 'Job Cards',
        icon: Wrench,
        service: 'R-06',
        built: true,
        summary: 'Job Card lifecycle (Draft → Cost Posted), tasks, complaints, mechanic assignments, and costs.',
      },
      {
        to: '/workshop/board',
        label: 'Workshop Board',
        icon: Kanban,
        service: 'R-06',
        built: true,
        summary: 'Kanban view of job cards across all active workshop stages.',
      },
      {
        to: '/workshop/pm-due',
        label: 'PM Due List',
        icon: CalendarClock,
        service: 'R-06',
        built: true,
        summary: 'Multi-trigger PM schedule, slot negotiation, maintenance grace/lock, and auto job card creation.',
      },
    ],
  },
  {
    label: 'Planning & Demand',
    modules: [
      {
        to: '/workshop/estimates',
        label: 'Estimates',
        icon: Calculator,
        service: 'R-06',
        built: true,
        summary: 'Estimate Builder with AF-05 threshold rules and parallel technical approval.',
      },
      {
        to: '/workshop/parts-demand',
        label: 'Parts Demand',
        icon: PackageCheck,
        service: 'R-06',
        built: true,
        summary: 'Parts demand per job card, availability check, and stock reservation.',
      },
      {
        to: '/workshop/mechanics',
        label: 'Mechanic Roster',
        icon: Users,
        service: 'R-06',
        built: true,
        summary: 'Mechanic skills, assigned bays, job card assignments, and productivity metrics.',
      },
    ],
  },
  {
    label: 'Analytics',
    modules: [
      {
        to: '/workshop/reports',
        label: 'Reports',
        icon: BarChart3,
        service: 'R-06',
        built: true,
        summary: 'Downtime by Vehicle, Job Cost vs Estimate, Waiting Parts Aging, and Warranty Recovered.',
      },
    ],
  },
];

export const WORKSHOP_MODULES: WorkshopModule[] = WORKSHOP_NAV.flatMap((group) => group.modules);

export const findWorkshopModule = (pathname: string): WorkshopModule | undefined =>
  WORKSHOP_MODULES.find((m) => pathname.startsWith(m.to));

export const findWorkshopGroup = (pathname: string): WorkshopGroup | undefined =>
  WORKSHOP_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
