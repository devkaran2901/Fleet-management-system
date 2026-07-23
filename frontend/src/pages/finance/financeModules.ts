import {
  LayoutDashboard,
  PieChart,
  Receipt,
  FileText,
  CreditCard,
  UserCheck,
  CheckSquare,
  BarChart3,
  Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FinanceModule {
  to: string;
  label: string;
  icon: LucideIcon;
  service: string;
  built: boolean;
  summary: string;
}

export interface FinanceGroup {
  label: string;
  modules: FinanceModule[];
}

export const FINANCE_NAV: FinanceGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/finance/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        service: 'R-14',
        built: true,
        summary: 'Role workspace: KPI cards, Budget vs Actual, Payment & Approval Queues, Close Blockers.',
      },
    ],
  },
  {
    label: 'Budget & Spend',
    modules: [
      {
        to: '/finance/budget',
        label: 'Budget',
        icon: PieChart,
        service: 'R-14',
        built: true,
        summary: 'Budget monitoring, commitments, AF-11 exceptions, and cost-center variance analysis.',
      },
      {
        to: '/finance/vendor-bills',
        label: 'Vendor Bills',
        icon: Receipt,
        service: 'R-14',
        built: true,
        summary: '3-Way match verification, rate engine escalation, detention, penalties, and AF-07 approval.',
      },
      {
        to: '/finance/customer-invoices',
        label: 'Customer Invoices',
        icon: FileText,
        service: 'R-14',
        built: true,
        summary: 'Customer invoicing with POD triggers, invoice annexure, disputed lines, and GST fields.',
      },
    ],
  },
  {
    label: 'Disbursements',
    modules: [
      {
        to: '/finance/payments',
        label: 'Payments',
        icon: CreditCard,
        service: 'R-14',
        built: true,
        summary: 'Payment runs, Maker-Checker release, UPI batch, FASTag ledger, and Fuel Card ledger.',
      },
      {
        to: '/finance/driver-settlements',
        label: 'Driver Settlements',
        icon: UserCheck,
        service: 'R-14',
        built: true,
        summary: 'Driver trip settlements, advance, bhatta, recovery, incentive, and payroll export status.',
      },
      {
        to: '/finance/approvals',
        label: 'Approvals',
        icon: CheckSquare,
        service: 'R-14',
        built: true,
        summary: 'Financial approval queue for AF-07 (Vendor Bills) and AF-11 (Budget Exceptions).',
      },
    ],
  },
  {
    label: 'Reporting & Data',
    modules: [
      {
        to: '/finance/reports',
        label: 'Reports',
        icon: BarChart3,
        service: 'R-14',
        built: true,
        summary: 'Financial reports: Budget vs Actual, Cost/KM, Working Capital Cycle, Cost Traceability.',
      },
      {
        to: '/finance/exports',
        label: 'Exports',
        icon: Download,
        service: 'R-14',
        built: true,
        summary: 'ERP exports for SAP, Oracle, Tally, Excel, CSV, and PDF formats with audit history.',
      },
    ],
  },
];

export const FINANCE_MODULES: FinanceModule[] = FINANCE_NAV.flatMap((g) => g.modules);

export function findFinanceModule(pathname: string): FinanceModule | undefined {
  return FINANCE_MODULES.find(
    (m) => pathname === m.to || (m.to !== '/finance' && pathname.startsWith(m.to)),
  );
}

export function findFinanceGroup(pathname: string): FinanceGroup | undefined {
  return FINANCE_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
}
