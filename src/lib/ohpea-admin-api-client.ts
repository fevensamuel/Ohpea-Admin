import {
  ApiError,
  type ApiEnvelope,
  type Paginated,
  type AdminUser,
  type MemberSummary,
  type MemberDetail,
  type PaymentRecord,
  type ContributionPlan,
  type AnnouncementItem,
  type ProgramItem,
  type ObjectiveItem,
  type PartnerItem,
  type ActivityItem,
  type RegionItem,
  type LookupItem,
  type ContactMessageItem,
  type SubscriberItem,
  type SmsCampaignItem,
  type SmsLogItem,
  type AuditLogItem,
  type DashboardSummary,
  type DashboardDimensionItem,
  type ContributionSnapshot,
  type RecentActivityItem,
  type MembershipStatus,
  type MessageStatus,
} from '@/types/api';

const TOKEN_KEY = 'ohpea_admin_token';
const DEFAULT_API_URL = 'http://localhost:3000/api';

class OhpeaAdminApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onAuthErrorCallbacks: (() => void)[] = [];

  constructor(rawBase?: string) {
    const configuredBase = rawBase ?? import.meta.env.VITE_API_URL ?? '';
    const base = configuredBase.trim() || DEFAULT_API_URL;
    this.baseUrl = base.replace(/\/+$/, '');
    if (!configuredBase.trim()) {
      console.warn(`[ohpea-admin-api] VITE_API_URL is unset; using ${DEFAULT_API_URL}.`);
    }
    if (!/^https?:\/\//.test(this.baseUrl)) {
      console.error(`[ohpea-admin-api] VITE_API_URL is "${this.baseUrl}" — expected absolute URL. Requests will fail.`);
    }
    try {
      this.token = localStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  private url(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(`${this.baseUrl}/${cleanPath}`).toString();
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  public onAuthError(cb: () => void): () => void {
    this.onAuthErrorCallbacks.push(cb);
    return () => {
      this.onAuthErrorCallbacks = this.onAuthErrorCallbacks.filter((c) => c !== cb);
    };
  }

  private triggerAuthError(): void {
    this.setToken(null);
    this.onAuthErrorCallbacks.forEach((cb) => cb());
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.url(endpoint);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.triggerAuthError();
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = (await response.json()) as ApiEnvelope<T>;
        if (!response.ok || json.success === false) {
          throw new ApiError(
            json.error || `Request failed with status ${response.status}`,
            response.status,
            json.fields
          );
        }
        if (json.meta !== undefined) {
          const data = json.data;
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            return {
              ...(data as Record<string, unknown>),
              meta: json.meta,
            } as T;
          }
          return { data, meta: json.meta } as T;
        }
        return (json.data !== undefined ? json.data : (json as unknown as T));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new ApiError(
          text || `Request to ${url} failed with status ${response.status}. Configure VITE_API_URL to point to your backend.`,
          response.status
        );
      }

      return (await response.text()) as unknown as T;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err instanceof Error ? err.message : 'Network request failed. Please check your connection.',
        500
      );
    }
  }

  private async requestBlob(endpoint: string): Promise<Blob> {
    const url = this.url(endpoint);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { headers });
      if (response.status === 401) {
        this.triggerAuthError();
        throw new ApiError('Session expired', 401);
      }
      if (!response.ok) {
        throw new ApiError(`Failed to fetch file: ${response.statusText}`, response.status);
      }
      return await response.blob();
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err instanceof Error ? err.message : 'Failed to download file',
        500
      );
    }
  }

  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------

  public async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ token: string; user: AdminUser }> {
    const res = await this.request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async me(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/me', { method: 'GET' });
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------------------------

  public async getDashboardSummary(params?: { regionId?: string }): Promise<DashboardSummary> {
    const q = params?.regionId ? `?regionId=${encodeURIComponent(params.regionId)}` : '';
    return this.request(`/admin/dashboard/summary${q}`, { method: 'GET' });
  }

  public async getDashboardMembersBy(params: {
    dimension: 'gender' | 'sector' | 'field' | 'occupation' | 'region' | 'graduationLevel';
    lang?: 'en' | 'om' | 'am';
    regionId?: string;
  }): Promise<DashboardDimensionItem[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('dimension', params.dimension);
    if (params.lang) searchParams.set('lang', params.lang);
    if (params.regionId) searchParams.set('regionId', params.regionId);
    return this.request(`/admin/dashboard/members-by?${searchParams.toString()}`, { method: 'GET' });
  }

  public async getDashboardContributions(params?: {
    range?: '3m' | '6m' | '12m';
    group?: 'week' | 'month' | 'year';
    regionId?: string;
  }): Promise<ContributionSnapshot> {
    const q = new URLSearchParams();
    if (params?.range) q.set('range', params.range);
    if (params?.group) q.set('group', params.group);
    if (params?.regionId) q.set('regionId', params.regionId);
    const qs = q.toString();
    return this.request(`/admin/dashboard/contributions${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async getRecentActivity(): Promise<RecentActivityItem[]> {
    return this.request('/admin/dashboard/recent-activity', { method: 'GET' });
  }

  // ---------------------------------------------------------------------------
  // MEMBERS
  // ---------------------------------------------------------------------------

  public async getMembers(
    query: Record<string, unknown> = {}
  ): Promise<Paginated<MemberSummary[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, String(v));
      }
    });
    const qs = searchParams.toString();
    return this.request(`/admin/members${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async getMember(id: string): Promise<MemberDetail> {
    return this.request(`/admin/members/${id}`, { method: 'GET' });
  }

  public async createMember(data: unknown): Promise<MemberDetail> {
    return this.request('/admin/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateMember(id: string, data: unknown): Promise<MemberDetail> {
    return this.request(`/admin/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async updateMemberStatus(
    id: string,
    membershipStatus: MembershipStatus
  ): Promise<MemberDetail> {
    return this.request(`/admin/members/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ membershipStatus }),
    });
  }

  public async approveMember(id: string): Promise<MemberDetail> {
    return this.request(`/admin/members/${id}/approve`, {
      method: 'POST',
    });
  }

  public async rejectMember(id: string, reason: string): Promise<MemberDetail> {
    return this.request(`/admin/members/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async deleteMember(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/members/${id}`, { method: 'DELETE' });
  }

  public async getPendingCount(): Promise<{ pendingCount: number }> {
    return this.request('/admin/registrations/pending-count', { method: 'GET' });
  }

  public async exportMembers(query: Record<string, unknown> = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    return this.requestBlob(`/admin/members/export${qs ? `?${qs}` : ''}`);
  }

  public async getMemberDocumentBlobUrl(memberId: string, docId: string): Promise<string> {
    const blob = await this.requestBlob(`/admin/members/${memberId}/documents/${docId}`);
    return URL.createObjectURL(blob);
  }

  public async downloadMemberDocument(memberId: string, docId: string): Promise<Blob> {
    return this.requestBlob(`/admin/members/${memberId}/documents/${docId}`);
  }

  public async getMemberPayments(memberId: string): Promise<PaymentRecord[]> {
    return this.request(`/admin/members/${memberId}/payments`, { method: 'GET' });
  }

  // ---------------------------------------------------------------------------
  // PAYMENTS & CONTRIBUTIONS
  // ---------------------------------------------------------------------------

  public async getPayments(
    query: Record<string, unknown> = {}
  ): Promise<Paginated<PaymentRecord[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    return this.request(`/admin/payments${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async createPayment(data: unknown): Promise<PaymentRecord> {
    return this.request('/admin/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getPayment(id: string): Promise<PaymentRecord> {
    return this.request(`/admin/payments/${id}`, { method: 'GET' });
  }

  public async voidPayment(id: string, note: string): Promise<PaymentRecord> {
    return this.request(`/admin/payments/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  public async downloadReceipt(id: string): Promise<Blob> {
    return this.requestBlob(`/admin/payments/${id}/receipt?format=pdf`);
  }

  public async getUnpaidMembers(params?: {
    period?: string;
    date?: string;
  }): Promise<MemberSummary[]> {
    const q = new URLSearchParams();
    if (params?.period) q.set('period', params.period);
    if (params?.date) q.set('date', params.date);
    const qs = q.toString();
    return this.request(`/admin/payments/unpaid${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async exportPayments(query: Record<string, unknown> = {}): Promise<Blob> {
    const q = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    q.set('format', 'xlsx');
    return this.requestBlob(`/admin/payments/export?${q.toString()}`);
  }

  public async sendPaymentReminders(params: {
    period: string;
    date: string;
  }): Promise<{ queuedCount: number }> {
    return this.request('/admin/payments/reminders', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ---------------------------------------------------------------------------
  // CONTRIBUTION PLANS
  // ---------------------------------------------------------------------------

  public async getContributionPlans(): Promise<ContributionPlan[]> {
    return this.request('/admin/contribution-plans', { method: 'GET' });
  }

  public async createContributionPlan(data: unknown): Promise<ContributionPlan> {
    return this.request('/admin/contribution-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateContributionPlan(id: string, data: unknown): Promise<ContributionPlan> {
    return this.request(`/admin/contribution-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteContributionPlan(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/contribution-plans/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // ANNOUNCEMENTS
  // ---------------------------------------------------------------------------

  public async getAnnouncements(query: Record<string, unknown> = {}): Promise<AnnouncementItem[]> {
    const q = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return this.request(`/admin/announcements${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async getAnnouncement(id: string): Promise<AnnouncementItem> {
    return this.request(`/admin/announcements/${id}`, { method: 'GET' });
  }

  public async createAnnouncement(data: unknown): Promise<AnnouncementItem> {
    return this.request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateAnnouncement(id: string, data: unknown): Promise<AnnouncementItem> {
    return this.request(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async publishAnnouncement(id: string): Promise<AnnouncementItem> {
    return this.request(`/admin/announcements/${id}/publish`, { method: 'PATCH' });
  }

  public async archiveAnnouncement(id: string): Promise<AnnouncementItem> {
    return this.request(`/admin/announcements/${id}/archive`, { method: 'PATCH' });
  }

  public async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/announcements/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // PROGRAMS, OBJECTIVES, PARTNERS, ACTIVITIES
  // ---------------------------------------------------------------------------

  public async getPrograms(): Promise<ProgramItem[]> {
    return this.request('/admin/programs', { method: 'GET' });
  }

  public async createProgram(data: unknown): Promise<ProgramItem> {
    return this.request('/admin/programs', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updateProgram(id: string, data: unknown): Promise<ProgramItem> {
    return this.request(`/admin/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async deleteProgram(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/programs/${id}`, { method: 'DELETE' });
  }

  public async getObjectives(): Promise<ObjectiveItem[]> {
    return this.request('/admin/objectives', { method: 'GET' });
  }

  public async createObjective(data: unknown): Promise<ObjectiveItem> {
    return this.request('/admin/objectives', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updateObjective(id: string, data: unknown): Promise<ObjectiveItem> {
    return this.request(`/admin/objectives/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async deleteObjective(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/objectives/${id}`, { method: 'DELETE' });
  }

  public async getPartners(): Promise<PartnerItem[]> {
    return this.request('/admin/partners', { method: 'GET' });
  }

  public async createPartner(data: unknown): Promise<PartnerItem> {
    return this.request('/admin/partners', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updatePartner(id: string, data: unknown): Promise<PartnerItem> {
    return this.request(`/admin/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async deletePartner(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/partners/${id}`, { method: 'DELETE' });
  }

  public async getActivities(): Promise<ActivityItem[]> {
    return this.request('/admin/activities', { method: 'GET' });
  }

  public async createActivity(data: unknown): Promise<ActivityItem> {
    return this.request('/admin/activities', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updateActivity(id: string, data: unknown): Promise<ActivityItem> {
    return this.request(`/admin/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async deleteActivity(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/activities/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // SETTINGS, REGIONS, LOOKUPS
  // ---------------------------------------------------------------------------

  public async getSetting<T = unknown>(key: string): Promise<T> {
    return this.request(`/admin/settings/${key}`, { method: 'GET' });
  }

  public async updateSetting(key: string, value: unknown): Promise<{ success: boolean }> {
    return this.request(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  public async getRegions(): Promise<RegionItem[]> {
    return this.request('/admin/regions', { method: 'GET' });
  }

  public async createRegion(data: unknown): Promise<RegionItem> {
    return this.request('/admin/regions', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updateRegion(id: string, data: unknown): Promise<RegionItem> {
    return this.request(`/admin/regions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async getLookups(type: 'sectors' | 'fields' | 'graduation-levels'): Promise<LookupItem[]> {
    return this.request(`/admin/lookups/${type}`, { method: 'GET' });
  }

  // ---------------------------------------------------------------------------
  // MESSAGES & SUBSCRIBERS
  // ---------------------------------------------------------------------------

  public async getMessages(
    params: { status?: MessageStatus; page?: number; pageSize?: number } = {}
  ): Promise<Paginated<ContactMessageItem[]>> {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return this.request(`/admin/messages${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async updateMessageStatus(id: string, status: MessageStatus): Promise<ContactMessageItem> {
    return this.request(`/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async getSubscribers(
    params: { page?: number; pageSize?: number } = {}
  ): Promise<Paginated<SubscriberItem[]>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return this.request(`/admin/subscribers${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async deleteSubscriber(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/subscribers/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // SMS (Campaigns & Logs)
  // ---------------------------------------------------------------------------

  public async sendSms(data: { memberId?: string; phone?: string; message: string }): Promise<{ success: boolean }> {
    return this.request('/admin/sms/send', { method: 'POST', body: JSON.stringify(data) });
  }

  public async createSmsCampaign(data: unknown): Promise<SmsCampaignItem> {
    return this.request('/admin/sms/campaigns', { method: 'POST', body: JSON.stringify(data) });
  }

  public async getSmsCampaigns(params: Record<string, unknown> = {}): Promise<Paginated<SmsCampaignItem[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return this.request(`/admin/sms/campaigns${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async getSmsLogs(params: Record<string, unknown> = {}): Promise<Paginated<SmsLogItem[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return this.request(`/admin/sms/logs${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async getSmsBalance(): Promise<{ balance: number }> {
    return this.request('/admin/sms/balance', { method: 'GET' });
  }

  // ---------------------------------------------------------------------------
  // ADMIN USERS, PERMISSIONS & AUDIT
  // ---------------------------------------------------------------------------

  public async getPermissions(): Promise<string[]> {
    return this.request('/admin/meta/permissions', { method: 'GET' });
  }

  public async getUsers(params: Record<string, unknown> = {}): Promise<Paginated<AdminUser[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return this.request(`/admin/users${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  public async createUser(data: unknown): Promise<AdminUser> {
    return this.request('/admin/users', { method: 'POST', body: JSON.stringify(data) });
  }

  public async updateUser(id: string, data: unknown): Promise<AdminUser> {
    return this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public async setUserActive(id: string, active: boolean): Promise<AdminUser> {
    return this.request(`/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) });
  }

  public async resetUserPassword(id: string): Promise<{ success: boolean; tempPassword?: string }> {
    return this.request(`/admin/users/${id}/reset-password`, { method: 'POST' });
  }

  public async getAuditLogs(params: Record<string, unknown> = {}): Promise<Paginated<AuditLogItem[]>> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return this.request(`/admin/audit-logs${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }
}

export const adminApi = new OhpeaAdminApiClient();
