export const FEATURES = {
  payments: true,
  roles: true,
  exports: true,
  smsAndEmail: false,
  announcementsCms: true,
  // ⚠️ AR + FR are NOT in the backend yet. The `announcements` table only has
  // title/summary/body in en, om, am. Do NOT expose AR/FR inputs until the backend
  // migrations add those columns AND the public API returns them.
  multilingualContent: false, // when true → enable AR (RTL) + FR tabs in LocalizedFields
  memberPortal: false,
  growthModules: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
