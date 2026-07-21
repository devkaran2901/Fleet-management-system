import {
  LayoutDashboard,
  CalendarCheck,
  FileSearch,
  Scale,
  Shield,
  FileWarning,
  Activity,
  AlertTriangle,
  FileText,
  Video
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ComplianceModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
  planned?: string[];
}

export interface ComplianceGroup {
  label: string;
  modules: ComplianceModule[];
}

export const COMPLIANCE_NAV: ComplianceGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/compliance/dashboard',
        label: 'Compliance Dashboard',
        icon: LayoutDashboard,
        service: 'S-22',
        built: true,
        summary: 'Statutory compliance dashboard, vehicle document heatmap, and holds active console.',
      },
    ],
  },
  {
    label: 'Renewals',
    modules: [
      {
        to: '/compliance/renewals/tasks',
        label: 'Renewal Tasks',
        icon: CalendarCheck,
        service: 'S-23',
        built: true,
        summary: 'Track vehicle document renewals, checklists, fee splits, and schedule appointments.',
      },
      {
        to: '/compliance/renewals/ocr',
        label: 'OCR Verification',
        icon: FileSearch,
        service: 'S-23',
        built: true,
        summary: 'OCR extraction engine and verification checklist comparing manual vs parsed documents.',
      },
    ],
  },
  {
    label: 'Challans',
    modules: [
      {
        to: '/compliance/challans/dashboard',
        label: 'Challan Dashboard',
        icon: FileWarning,
        service: 'S-24',
        built: true,
        summary: 'Analytical overview of traffic violations, overdue balances, and site trends.',
      },
      {
        to: '/compliance/challans/workbench',
        label: 'Challan Workbench',
        icon: Scale,
        service: 'S-24',
        built: true,
        summary: 'Challan resolution workbench: evidence review, responsibility allocation, and payment gateway.',
      },
    ],
  },
  {
    label: 'Insurance',
    modules: [
      {
        to: '/compliance/insurance/policies',
        label: 'Policies',
        icon: Shield,
        service: 'S-25',
        built: true,
        summary: 'Active fleet policy schedule grid and endorsement lag monitor.',
      },
      {
        to: '/compliance/insurance/claims',
        label: 'Claims',
        icon: FileText,
        service: 'S-25',
        built: true,
        summary: 'Claim filing dashboard, status ledger, and documentation tracker.',
      },
      {
        to: '/compliance/insurance/claim-360',
        label: 'Claim 360',
        icon: Activity,
        service: 'S-25',
        built: true,
        summary: 'Claim settlement milestone stepper, SLA timers, and surveyor progress tracking.',
      },
    ],
  },
  {
    label: 'Incidents',
    modules: [
      {
        to: '/compliance/incidents/dashboard',
        label: 'Incident Dashboard',
        icon: AlertTriangle,
        service: 'S-26',
        built: true,
        summary: 'Fleet incident monitoring console: breakdowns, severity counts, and avg resolution SLA.',
      },
      {
        to: '/compliance/incidents/360',
        label: 'Incident 360',
        icon: Video,
        service: 'S-26',
        built: true,
        summary: 'Real-time telemetry timeline, dashcam clip review, and 4-track emergency dispatch board.',
      },
    ],
  },
  {
    label: 'Reports',
    modules: [
      {
        to: '/compliance/reports',
        label: 'Reports Dashboard',
        icon: FileText,
        service: 'S-34',
        built: true,
        summary: 'Export statutory compliance registers and ledger spreadsheets.',
      },
    ],
  },
];

export const COMPLIANCE_MODULES: ComplianceModule[] = COMPLIANCE_NAV.flatMap((group) => group.modules);

export const findComplianceModule = (pathname: string): ComplianceModule | undefined =>
  COMPLIANCE_MODULES.find((m) => pathname.startsWith(m.to));

export const findComplianceGroup = (pathname: string): ComplianceGroup | undefined =>
  COMPLIANCE_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
