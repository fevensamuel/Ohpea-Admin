/**
 * Core API types and DTOs for OHPEA Admin Portal.
 */

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  fields?: Record<string, string>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T;
  meta: PaginationMeta;
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  code?: string;

  constructor(message: string, status = 500, fields?: Record<string, string>, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export type RoleType = 'SuperAdmin' | 'RegionalAdmin' | 'Finance' | 'Editor';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: RoleType;
  regionId?: string;
  regionName?: string;
  permissions: string[];
  active: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type MembershipStatus = 'active' | 'inactive' | 'pending';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
export type PaymentStatus = 'paid' | 'void';
export type PaymentPeriod = 'weekly' | 'monthly' | 'yearly';
export type AnnouncementType = 'news' | 'event' | 'vacancy' | 'proposal' | 'research';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type MessageStatus = 'new' | 'read' | 'in_progress' | 'resolved';
export type MemberGender = 'male' | 'female';
export type MemberIdType = 'fayda' | 'passport' | 'kebele' | 'driver';

export interface LocalizedString {
  en: string;
  om: string;
  am: string;
}

export interface MemberDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface MemberSummary {
  id: string;
  memberNo: string;
  fullName: string;
  phone: string;
  email: string;
  gender: MemberGender;
  regionId: string;
  regionName: string;
  sectorId: string;
  sectorName: string;
  fieldId: string;
  fieldName: string;
  occupationType: string;
  graduationLevel: string;
  institution?: string;
  registrationStatus: RegistrationStatus;
  membershipStatus: MembershipStatus;
  hasPaidRecentPeriod: boolean;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  registeredAt: string;
  duplicateOf?: string;
}

export interface MemberDetail extends MemberSummary {
  birthDate?: string;
  idType: MemberIdType;
  idNumber: string;
  address?: string;
  subCityZone?: string;
  woreda?: string;
  houseNo?: string;
  employer?: string;
  jobTitle?: string;
  yearsOfExperience?: number;
  documents: MemberDocument[];
  notes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  memberPhone?: string;
  regionId: string;
  regionName: string;
  amountEtb: number;
  period: PaymentPeriod;
  paidForDate: string; // YYYY-MM-DD
  method: PaymentMethod;
  bank?: string;
  reference?: string;
  note?: string;
  status: PaymentStatus;
  voidReason?: string;
  voidedAt?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ContributionPlan {
  id: string;
  name: string;
  period: PaymentPeriod;
  amountEtb: number;
  active: boolean;
  description?: string;
  createdAt?: string;
}

export interface AnnouncementItem {
  id: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  title: LocalizedString;
  summary: LocalizedString;
  body: LocalizedString;
  organization?: string;
  location?: string;
  deadline?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  externalLink?: string;
  coverImageUrl?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface ProgramItem {
  id: string;
  code: string;
  icon: string;
  order: number;
  title: LocalizedString;
  description: LocalizedString;
  active: boolean;
}

export interface ObjectiveItem {
  id: string;
  category: 'General' | 'Official' | 'Main' | 'Specific';
  order: number;
  title: LocalizedString;
  description?: LocalizedString;
}

export interface PartnerItem {
  id: string;
  name: string;
  type: string;
  logoUrl?: string;
  website?: string;
  order: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  imageUrl?: string;
  isPublic: boolean;
  location?: string;
}

export interface RegionItem {
  id: string;
  code: string;
  name: string;
  nameOm?: string;
  nameAm?: string;
  active: boolean;
  memberCount?: number;
}

export interface LookupItem {
  id: string;
  code: string;
  name: string;
  nameOm?: string;
  nameAm?: string;
}

export interface ContactMessageItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface SubscriberItem {
  id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
}

export interface SmsCampaignItem {
  id: string;
  name: string;
  message: string;
  audienceFilter: Record<string, unknown>;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  createdAt: string;
}

export interface SmsLogItem {
  id: string;
  recipientPhone: string;
  recipientName?: string;
  message: string;
  status: 'delivered' | 'sent' | 'failed';
  errorMessage?: string;
  sentAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  inactiveMembers: number;
  femaleMembers: number;
  maleMembers: number;
  governmentSector: number;
  privateSector: number;
  totalCollectedThisYear: number;
  totalCollectedThisMonth: number;
  unpaidMembersCount: number;
}

export interface DashboardDimensionItem {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface ContributionSnapshot {
  totalYear: number;
  totalMonth: number;
  paidCount: number;
  unpaidCount: number;
  timeline: { period: string; amount: number; target?: number }[];
  methodDistribution: { method: string; amount: number }[];
  byRegion: { region: string; amount: number; unpaid: number }[];
}

export interface RecentActivityItem {
  id: string;
  type: 'registration' | 'approval' | 'payment' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}
