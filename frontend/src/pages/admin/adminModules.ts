import { Bell, FileStack, GitBranch, Network, Plug, ScrollText, Upload } from 'lucide-react';

/**
 * The Admin nav group from the Phase 5 IA spec (§3), one entry per S-35 module.
 * Kept in its own file so both AppSidebar and the admin pages can import it
 * without a circular dependency through AdminLayout.
 */
export const ADMIN_MODULES = [
  { to: '/admin/org', label: 'Org / Users / Roles', icon: Network, service: 'P-01' },
  { to: '/admin/rule-packs', label: 'Rule Packs', icon: FileStack, service: 'M-21' },
  { to: '/admin/approval-flows', label: 'Approval Flows', icon: GitBranch, service: 'P-02' },
  { to: '/admin/notification-policies', label: 'Notification Policies', icon: Bell, service: 'P-03' },
  { to: '/admin/integrations', label: 'Integrations', icon: Plug, service: 'P-06' },
  { to: '/admin/imports', label: 'Imports', icon: Upload, service: 'P-06' },
  { to: '/admin/audit', label: 'Audit', icon: ScrollText, service: 'P-05' },
];
