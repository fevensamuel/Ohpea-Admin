// src/lib/contract.ts
export interface BackendContract {
  version: number;
  endpoints: {
    public: Record<string, unknown>;
    auth: Record<string, unknown>;
    admin: Record<string, unknown>;
  };
  enums: Record<string, string[]>;
  localizedFields: string[];
}

const EXPECTED_VERSION = Number((import.meta as any).env?.VITE_CONTRACT_VERSION ?? '1');

// The endpoint paths this admin portal's client expects to work against.
const REQUIRED_ADMIN_ENDPOINTS = [
  'GET /api/admin/dashboard/summary',
  'GET /api/admin/dashboard/members-by',
  'GET /api/admin/members',
  'GET /api/admin/members/:id',
  'POST /api/admin/members/:id/approve',
  'POST /api/admin/members/:id/reject',
  'GET /api/admin/registrations/pending-count',
  'GET /api/admin/payments',
  'POST /api/admin/payments',
  'POST /api/admin/payments/:id/void',
  'GET /api/admin/announcements',
  'POST /api/admin/announcements',
  'GET /api/admin/messages',
  'PATCH /api/admin/messages/:id',
  'GET /api/admin/settings/:key',
  'PUT /api/admin/settings/:key',
  'GET /api/admin/users',
  'POST /api/admin/users',
  'GET /api/admin/audit-logs',
  'GET /api/admin/meta/permissions',
];

export interface ContractCheck {
  ok: boolean;
  version: number | null;
  expectedVersion: number;
  missingEndpoints: string[];
  reason?: string;
}

export async function validateBackendContract(baseUrl: string): Promise<ContractCheck> {
  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/contract.json`;
    const res = await fetch(url);
    if (!res.ok) {
      return {
        ok: false,
        version: null,
        expectedVersion: EXPECTED_VERSION,
        missingEndpoints: [],
        reason: `HTTP ${res.status} fetching /contract.json`,
      };
    }
    const contract: BackendContract = await res.json();
    if (contract.version !== EXPECTED_VERSION) {
      return {
        ok: false,
        version: contract.version,
        expectedVersion: EXPECTED_VERSION,
        missingEndpoints: [],
        reason: `Backend contract v${contract.version}, portal expects v${EXPECTED_VERSION}`,
      };
    }
    const admin = contract.endpoints?.admin ?? {};
    const missingEndpoints = REQUIRED_ADMIN_ENDPOINTS.filter((k) => !(k in admin));
    return {
      ok: missingEndpoints.length === 0,
      version: contract.version,
      expectedVersion: EXPECTED_VERSION,
      missingEndpoints,
      reason: missingEndpoints.length ? `Missing ${missingEndpoints.length} endpoints` : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      version: null,
      expectedVersion: EXPECTED_VERSION,
      missingEndpoints: [],
      reason: (e as Error).message,
    };
  }
}
