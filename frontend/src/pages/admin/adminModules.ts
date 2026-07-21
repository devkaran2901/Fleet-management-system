import {
  Bell, BellRing, Boxes, Building2, ClipboardList, Cpu, FileBadge,
  FileStack, FileSignature, Fuel, GitBranch, Globe, Handshake, HardDrive, KeyRound,
  LayoutDashboard, ListTree, Network, Palette, Plug, RefreshCcw, Route, ScrollText,
  Settings2, ShieldCheck, Timer, Truck, Upload, UserCog, Users, Wallet, Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminModule {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Backing platform service from the Phase 3 PRD, shown as a chip in the rail. */
  service: string;
  /** False when the screen is a stub: the IA exists, the module does not yet. */
  built: boolean;
  /** One-line purpose, used by stub screens and tooltips. */
  summary: string;
  /** Planned capabilities, listed on the stub so the intent is legible. */
  planned?: string[];
}

export interface AdminGroup {
  label: string;
  modules: AdminModule[];
}

export const ADMIN_NAV: AdminGroup[] = [
  {
    label: 'Overview',
    modules: [
      {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        service: 'P-00',
        built: true,
        summary: 'Admin landing page: system, user, workflow and governance vitals.',
      },
    ],
  },
  {
    label: 'Organization',
    modules: [
      {
        to: '/admin/org',
        label: 'Org Tree',
        icon: Network,
        service: 'P-01',
        built: true,
        summary: 'The company hierarchy — regions, hubs, depots and teams.',
      },
      {
        to: '/admin/cost-centers',
        label: 'Cost Centers',
        icon: Wallet,
        service: 'P-01',
        built: true,
        summary: 'Budget owners attached to the org tree, with utilisation tracking.',
      },
    ],
  },
  {
    label: 'User Access',
    modules: [
      {
        to: '/admin/users',
        label: 'Users',
        icon: Users,
        service: 'P-01',
        built: true,
        summary: 'People, their stacked roles and account status.',
      },
      {
        to: '/admin/roles',
        label: 'Roles',
        icon: ShieldCheck,
        service: 'P-01',
        built: true,
        summary: 'Role builder — capability × scope matrix with a segregation validator.',
      },
      {
        to: '/admin/permissions',
        label: 'Permissions',
        icon: UserCog,
        service: 'P-01',
        built: true,
        summary: 'Effective access resolution and a "can user X do Y?" simulator.',
      },
      {
        to: '/admin/delegations',
        label: 'Delegations',
        icon: Handshake,
        service: 'P-01',
        built: true,
        summary: 'Time-boxed hand-off of approval authority during leave.',
      },
    ],
  },
  {
    label: 'Workflow',
    modules: [
      {
        to: '/admin/rule-packs',
        label: 'Rule Packs',
        icon: FileStack,
        service: 'M-21',
        built: true,
        summary: 'Versioned, effective-dated compliance rules with simulation.',
      },
      {
        to: '/admin/approval-flows',
        label: 'Approval Flows',
        icon: GitBranch,
        service: 'P-02',
        built: true,
        summary: 'Visual chain builder with threshold nodes and SLA timers.',
      },
      {
        to: '/admin/notification-policies',
        label: 'Notifications',
        icon: Bell,
        service: 'P-03',
        built: true,
        summary: 'Event catalog routed to channels, with quiet hours and digests.',
      },
    ],
  },
  {
    label: 'Master Data',
    modules: [
      {
        to: '/admin/vehicles',
        label: 'Vehicles',
        icon: Truck,
        service: 'M-01',
        built: true,
        summary: 'The vehicle master — registration, VIN, model, capacity, ownership.',
        planned: [
          'Vehicle master with registration number, VIN, model, capacity, fuel type and ownership',
          'Vehicle categories and models as reference data',
          'Lifecycle states: Active, Maintenance, Disposed, Blocked',
          'Bulk upload and import/export (wire into the existing Import Wizard)',
        ],
      },
      {
        to: '/admin/drivers',
        label: 'Drivers',
        icon: UserCog,
        service: 'M-02',
        built: true,
        summary: 'The driver master — licences, eligibility and documents.',
        planned: [
          'Driver master: name, DL number, licence type, joining date',
          'Licence verification against the KYC aggregator connector',
          'Eligibility matrix mapping licence class to vehicle category',
          'Driver categories, blacklist management and document management',
        ],
      },
      {
        to: '/admin/routes',
        label: 'Routes',
        icon: Route,
        service: 'M-03',
        built: true,
        summary: 'Corridors, stops, distances and restrictions.',
        planned: [
          'Route creation with origin/destination and intermediate stops',
          'Distance matrix between stops',
          'Geofence assignment per stop',
          'Route restrictions: no-entry windows, height and weight limits',
        ],
      },
      {
        to: '/admin/fuel-stations',
        label: 'Fuel Stations',
        icon: Fuel,
        service: 'M-04',
        built: false,
        summary: 'Station master, tank inventory and pricing.',
        planned: [
          'Station master: name, location, owner',
          'Tank inventory tracking',
          'Fuel pricing with effective dates',
          'Station contacts',
        ],
      },
      {
        to: '/admin/parts',
        label: 'Parts',
        icon: Boxes,
        service: 'M-05',
        built: false,
        summary: 'Parts catalogue with stock thresholds.',
        planned: [
          'Parts master: part number, category, vendor',
          'Cross-references between equivalent parts',
          'Min–max stock levels and reorder points',
        ],
      },
      {
        to: '/admin/vendors',
        label: 'Vendors',
        icon: Building2,
        service: 'M-06',
        built: false,
        summary: 'Vendor profiles, KYC and ratings.',
        planned: [
          'Vendor profile with KYC and document store',
          'Vendor rating feeding the allocation rules in Rule Packs',
          'Vendor categories and contacts',
          'Vendor-owned fleet registry',
        ],
      },
      {
        to: '/admin/contracts',
        label: 'Contracts',
        icon: FileSignature,
        service: 'M-07',
        built: false,
        summary: 'Rate cards, escalation formulae and versioning.',
        planned: [
          'Contract details with parties and validity window',
          'Rate cards per route or vehicle class',
          'Escalation formula (e.g. indexed to fuel price)',
          'Version control and an approval workflow via the Approvals Engine',
        ],
      },
    ],
  },
  {
    label: 'Integrations',
    modules: [
      {
        to: '/admin/integrations',
        label: 'Connectors',
        icon: Plug,
        service: 'P-06',
        built: true,
        summary: 'Connector cards with health status and configuration.',
      },
      {
        to: '/admin/webhooks',
        label: 'Webhooks',
        icon: Webhook,
        service: 'P-06',
        built: false,
        summary: 'Outbound event delivery to external systems.',
        planned: [
          'Create a webhook against an event, target URL and signing secret',
          'Retry policy with backoff',
          'Failure logs and delivery history per endpoint',
        ],
      },
      {
        to: '/admin/api-keys',
        label: 'API Keys',
        icon: KeyRound,
        service: 'P-06',
        built: false,
        summary: 'Scoped tokens for programmatic access.',
        planned: [
          'Generate and revoke keys with an expiry date',
          'Scope a key to specific capabilities (reuses the RBAC capability set)',
          'Usage analytics and per-key rate limits',
        ],
      },
      {
        to: '/admin/sync-logs',
        label: 'Sync Logs',
        icon: RefreshCcw,
        service: 'P-06',
        built: false,
        summary: 'Per-connector sync outcomes.',
        planned: [
          'Success and failure logs per connector run',
          'Retry a failed sync',
          'Download error reports',
        ],
      },
    ],
  },
  {
    label: 'Operations',
    modules: [
      {
        to: '/admin/imports',
        label: 'Imports',
        icon: Upload,
        service: 'P-06',
        built: true,
        summary: 'Upload → map → validate → preview → commit.',
      },
      {
        to: '/admin/jobs',
        label: 'Jobs',
        icon: ClipboardList,
        service: 'P-07',
        built: false,
        summary: 'Business jobs such as OCR, invoicing and fuel reconciliation.',
        planned: [
          'Job list with status, duration and triggering actor',
          'Retry and cancel a job',
          'Per-job logs',
        ],
      },
      {
        to: '/admin/background-tasks',
        label: 'Background Tasks',
        icon: Timer,
        service: 'P-07',
        built: false,
        summary: 'Scheduled system tasks.',
        planned: [
          'Nightly backups, cleanup jobs and report generation',
          'Schedule (cron) management and next-run preview',
          'Run history with outcomes',
        ],
      },
    ],
  },
  {
    label: 'Monitoring',
    modules: [
      {
        to: '/admin/system-health',
        label: 'System Health',
        icon: Cpu,
        service: 'P-08',
        built: true,
        summary: 'Live service, process and memory health for the API.',
      },
      {
        to: '/admin/device-health',
        label: 'Device Health',
        icon: HardDrive,
        service: 'P-08',
        built: false,
        summary: 'GPS device fleet status.',
        planned: [
          'Device status: Online, Offline, Tampered',
          'Last ping, battery status and signal strength',
          'Requires a telemetry ingest pipeline — none exists yet',
        ],
      },
      {
        to: '/admin/notification-health',
        label: 'Notification Health',
        icon: BellRing,
        service: 'P-03',
        built: false,
        summary: 'Delivery performance per channel.',
        planned: [
          'Delivery success percentage and failed notifications',
          'Channel performance comparison across Email, SMS and WhatsApp',
          'Requires a delivery-tracking table — policies currently define routing only',
        ],
      },
    ],
  },
  {
    label: 'Audit',
    modules: [
      {
        to: '/admin/audit',
        label: 'Audit Events',
        icon: ScrollText,
        service: 'P-05',
        built: true,
        summary: 'Append-only, tamper-evident event timeline.',
      },
      {
        to: '/admin/lineage',
        label: 'Lineage Explorer',
        icon: ListTree,
        service: 'P-05',
        built: true,
        summary: 'Trace any record back through the chain to its originating request.',
      },
      {
        to: '/admin/override-register',
        label: 'Override Register',
        icon: FileBadge,
        service: 'P-05',
        built: false,
        summary: 'Every rule bypass, who did it and who approved it.',
        planned: [
          'Record each rule-pack override with the blocked rule and justification',
          'Capture the overriding user and the approver',
          'Requires dispatch-time rule enforcement to exist first',
        ],
      },
    ],
  },
  {
    label: 'Settings',
    modules: [
      {
        to: '/admin/document-types',
        label: 'Document Types',
        icon: FileBadge,
        service: 'P-09',
        built: false,
        summary: 'Insurance, fitness, permit, PUC and their rules.',
        planned: [
          'Create document types such as Insurance, Fitness, Permit and PUC',
          'Expiry rules driving the document-expiring notification event',
          'Validation rules and OCR extraction rules',
        ],
      },
      {
        to: '/admin/localization',
        label: 'Localization',
        icon: Globe,
        service: 'P-09',
        built: false,
        summary: 'Languages, translations and regional formats.',
        planned: [
          'Language catalogue (English, Hindi, Tamil, …)',
          'Translation management per key',
          'Date and currency format profiles',
        ],
      },
      {
        to: '/admin/branding',
        label: 'Branding',
        icon: Palette,
        service: 'P-09',
        built: false,
        summary: 'Tenant look and feel.',
        planned: [
          'Logo and company name',
          'Theme colours (would drive the CSS custom properties this UI already uses)',
          'Login page and email branding',
        ],
      },
      {
        to: '/admin/tenant-settings',
        label: 'Tenant Settings',
        icon: Settings2,
        service: 'P-09',
        built: false,
        summary: 'Per-tenant security, limits and feature toggles.',
        planned: [
          'Password and MFA policies',
          'Storage and user limits, billing plan',
          'Feature toggles and data-retention policies',
          'Requires a Tenant model — the system is currently single-tenant',
        ],
      },
    ],
  },
];

/** Flat list of every module, for route generation and lookups. */
export const ADMIN_MODULES: AdminModule[] = ADMIN_NAV.flatMap((group) => group.modules);

export const findModule = (pathname: string): AdminModule | undefined =>
  ADMIN_MODULES.find((m) => pathname.startsWith(m.to));

export const findGroup = (pathname: string): AdminGroup | undefined =>
  ADMIN_NAV.find((g) => g.modules.some((m) => pathname.startsWith(m.to)));
