export interface PermissionDefinition {
  key: string;
  label: string;
  group: string;
  description?: string;
  superAdminOnly?: boolean;
}

export const PERMISSION_GROUPS = [
  {
    group: 'Main',
    permissions: [
      { key: 'dashboard', label: 'View Dashboard & Analytics' },
    ],
  },
  {
    group: 'Members',
    permissions: [
      { key: 'members', label: 'View Member Directory' },
      { key: 'members.approve', label: 'Approve & Reject Applications' },
      { key: 'members.edit', label: 'Edit Member Details & Status' },
      { key: 'members.export', label: 'Export Member Data (CSV/Excel)' },
    ],
  },
  {
    group: 'Contributions & Finance',
    permissions: [
      { key: 'payments', label: 'View Contributions & Receipts' },
      { key: 'payments.record', label: 'Record Member Payments' },
      { key: 'payments.void', label: 'Void Incorrect Payment Slips' },
      { key: 'contributions.dashboard', label: 'Access Financial Analytics & Plans' },
    ],
  },
  {
    group: 'Content & CMS',
    permissions: [
      { key: 'announcements', label: 'Manage Announcements, Events & Vacancies' },
      { key: 'programs', label: 'Manage Association Pillars & Programs' },
      { key: 'partners', label: 'Manage Institutional Partners' },
      { key: 'activities', label: 'Manage Public Activity Feed' },
    ],
  },
  {
    group: 'Communication',
    permissions: [
      { key: 'sms', label: 'Broadcast SMS Campaigns & Logs' },
      { key: 'messages', label: 'Manage Public Contact Messages' },
      { key: 'subscribers', label: 'Manage Newsletter Subscribers' },
    ],
  },
  {
    group: 'Settings & Master Data',
    permissions: [
      { key: 'settings.site', label: 'Update Site & Branding Settings' },
      { key: 'settings.contact', label: 'Update Contact Info & Office Addresses' },
      { key: 'regions', label: 'Manage Regional Branches & Clusters' },
      { key: 'lookups', label: 'Manage Sectors & Graduation Lookups' },
      { key: 'translations', label: 'Manage Multilingual Translations' },
    ],
  },
  {
    group: 'System Administration',
    permissions: [
      { key: 'admin.users', label: 'Manage Admin Users & Roles', superAdminOnly: true },
      { key: 'audit.logs', label: 'View System Audit Trail', superAdminOnly: true },
    ],
  },
  {
    group: 'Phase 4 Future Modules',
    permissions: [
      { key: 'jobs', label: 'Hospitality Job Board & Talent Pool' },
      { key: 'b2b', label: 'B2B Hospitality Marketplace' },
      { key: 'investments', label: 'Tourism Investment Bridge' },
      { key: 'resources', label: 'Research & Study Repository' },
      { key: 'international', label: 'International Relations' },
      { key: 'region-resources', label: 'Regional Resource Allocation' },
    ],
  },
] as const;

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => ({ ...p, group: g.group }))
);
