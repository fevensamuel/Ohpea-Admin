# OHPEA Admin Portal (v2) — Internal Management System

Internal administrative portal for staff and officers of the **Oromia Hospitality & Tourism Professionals Association (OHPEA)** / **Waldaa Ogeessota Tuuriizimii fi Hoteelaa Oromiyaa**.

---

## 1. Brand Tokens & Design System

- **Primary Brand Green**:
  - Deep Forest Ink: `#0B3D2E` (`--brand-green-900`)
  - Mid Brand Green: `#14573F` (`--brand-green-700`)
  - Accent Emerald: `#1F7A57` (`--brand-green-500`)
- **Accent Gold**:
  - Metallic Gold: `#C9A24A` (`--brand-gold`)
  - Light Champagne: `#F1E3B8` (`--brand-gold-light`)
- **Status Orange**:
  - Alert / Pending: `#E8772E` (`--brand-orange`)
  - Soft Orange Pill: `#FCE5D3` (`--brand-orange-light`)
- **Neutrals**:
  - Ink: `#14231D`
  - Text: `#2D3748`
  - Muted: `#718096`
  - Border: `#E2E8F0`
  - App Canvas: `#F6F8F7`
  - Card Surface: `#FFFFFF`
- **Typography**: Inter / Plus Jakarta Sans, `Noto Sans Ethiopic` for Afaan Oromoo & Amharic scripts, JetBrains Mono for codes/tokens.

---

## 2. Roles & Permissions Matrix

All access control is governed by `src/config/permissions.ts` and enforced via `useAuth.hasPermission(key)` and `<RequirePermission>` route guards:

| Permission Group | Permission Key | Description | Assignable Roles |
|---|---|---|---|
| **Main** | `dashboard` | View dashboard & KPI analytics | All Roles |
| **Members** | `members` | View member directory & profiles | SuperAdmin, RegionalAdmin, Finance, Editor |
| | `members.approve` | Approve & reject pending registrations | SuperAdmin, RegionalAdmin |
| | `members.edit` | Edit member details & status | SuperAdmin, RegionalAdmin |
| | `members.export` | Export members to CSV / Excel | SuperAdmin, RegionalAdmin |
| **Contributions** | `payments` | View contribution records & ledger | SuperAdmin, Finance, RegionalAdmin |
| | `payments.record` | Record new member payment slips | SuperAdmin, Finance |
| | `payments.void` | Void incorrect payment transactions | SuperAdmin, Finance |
| | `contributions.dashboard` | Access financial trends & plans | SuperAdmin, Finance |
| **Content & CMS** | `announcements` | Manage news, events, vacancies | SuperAdmin, Editor |
| | `programs` | Manage 7 pillars & objectives | SuperAdmin, Editor |
| | `partners` | Manage institutional partners | SuperAdmin, Editor |
| | `activities` | Manage public activity feed | SuperAdmin, Editor |
| **Communication** | `sms` | Broadcast SMS campaigns (Phase 3) | SuperAdmin |
| | `messages` | Manage contact inquiries | SuperAdmin, Editor |
| | `subscribers` | View newsletter subscribers | SuperAdmin, Editor |
| **Settings** | `settings.site` | Site branding & logo settings | SuperAdmin |
| | `settings.contact` | Contact info & coordinates | SuperAdmin |
| | `regions` | Manage regional branch offices | SuperAdmin |
| | `lookups` | Manage sectors, degrees, fields | SuperAdmin |
| **SuperAdmin Only** | `admin.users` | Manage admin staff & permissions | SuperAdmin Only |
| | `audit.logs` | View immutable system audit logs | SuperAdmin Only |
| **Phase 4 Locked** | `jobs`, `b2b`, `investments`, `resources`, `international`, `region-resources` | Future expansion modules | Locked ("Soon") |

*Note for `RegionalAdmin`: TopBar displays their assigned region; all member and payment listings automatically scope to their branch.*

---

## 3. Environment Variables

Create `.env` (or `.env.local` for local development):

```env
# Base URL for backend API (defaults to local backend)
VITE_API_URL=http://localhost:3000/api

# Explicit Demo Mode toggle (MUST be false in staging and production)
VITE_DEMO_MODE=false

# Expected backend contract schema version
VITE_CONTRACT_VERSION=1
```

---

## 4. Folder Structure

```
src/
  App.tsx                            # Root application shell with providers & router
  main.tsx                           # DOM entrypoint
  routes.tsx                         # Protected application layout and permission guards
  index.css                          # Brand tokens, CSS variables, Ethiopic font rules
  types/
    api.ts                           # Authoritative TypeScript interfaces & DTOs
  api/                               # Thin typed facades over adminApi (10-30 lines each)
    auth.ts members.ts dashboard.ts payments.ts plans.ts announcements.ts
    programs.ts objectives.ts partners.ts activities.ts regions.ts lookups.ts
    sms.ts settings.ts messages.ts subscribers.ts users.ts audit.ts
  config/
    permissions.ts                   # Permission definitions and groups
    features.ts                      # Phase feature flags
  context/
    AuthContext.tsx                  # Hydrated user session & auth dispatchers
    ToastContext.tsx                 # Success / error notification toasts
    ContractContext.tsx              # Boot-time /contract.json schema validator
  hooks/
    useAuth.ts                       # Immutable auth hook
    useDebounce.ts                   # Search query debounce (300ms)
    useQueryParams.ts                # URL query parameter synchronization
    usePagination.ts                 # Page/pageSize pagination state
    useContractGuard.ts              # Contract drift access hook
  lib/
    ohpea-admin-api-client.ts        # The ONLY network client (fetch, envelope, Bearer)
    index.ts                         # Barrel re-exporting adminApi, ApiError, DTOs
    demoMode.ts                      # Explicit opt-in demo mode utility
    contract.ts                      # Contract validation logic
  components/
    common/                          # Sidebar, TopBar, StatsCard, Pagination, DemoBanner, ContractDriftBanner, etc.
    charts/                          # DonutChart, BarChartCard, LineAreaChart (Recharts)
    forms/                           # LocalizedFields (EN/OM/AM)
    modals/                          # MemberDetailModal, RejectReasonModal, RecordPaymentModal, DocumentViewerModal
  pages/
    Login.tsx ChangePassword.tsx Dashboard.tsx
    members/                         # MemberList, PendingRegistrations, MemberEdit
    payments/                        # PaymentStatus, PaymentList, ContributionDashboard, ContributionPlans, UnpaidMembers
    content/                         # Announcements, AnnouncementEdit, Programs, Objectives, Partners, Activities
    communication/                   # ContactMessages, Subscribers
    settings/                        # SiteSettings, ContactSettings, Regions, Lookups, AdminUsers, AuditLogs
    coming-soon/                     # ComingSoon roadmap page
  demo/
    demoMembers.ts                   # 20 Oromia member fixtures
    demoPayments.ts                  # 12 months payment ledger
    demoAnnouncements.ts             # 8 announcements across 5 types & 3 statuses
    fixtures.ts                      # Complete in-memory master fixtures
```

---

## 5. Development & Build Scripts

```bash
# Start local development server
npm run dev

# Run TypeScript type check
npm run lint

# Production build
npm run build
```

## Building on Windows

If `npm run build` fails with a memory-allocation error on Windows, run:

```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## 6. How to Prove It's Wired to the Real Backend

Follow these 8 verification steps in your browser DevTools (Network tab):

1. **Boot Contract Check**:
   - URL: `GET /contract.json` (or `http://localhost:3000/contract.json`)
   - Expected: `200 OK` with `{ "version": 1, "endpoints": { ... } }`.
   - Result: `<ContractDriftBanner />` does NOT appear.

2. **Staff Login**:
   - URL: `POST /api/auth/login`
   - Body: `{"usernameOrEmail":"admin@ohpea.org","password":"..."}`
   - Expected: `200 OK` with `{ "token": "...", "user": { ... } }`.
   - Result: `localStorage.getItem('ohpea_admin_token')` is populated; redirect to `/dashboard`.

3. **Dashboard Metrics**:
   - URL: `GET /api/admin/dashboard/summary`
   - Expected: `200 OK` with member and revenue counts.
   - Result: KPI cards and charts populate.

4. **Paginated Member Directory**:
   - URL: `GET /api/admin/members?page=1&pageSize=25`
   - Expected: `200 OK` with `{ "data": [...], "meta": { "page": 1, "pageSize": 25, "total": 150, "totalPages": 6 } }`.
   - Result: Table renders 25 rows; paginator reflects `meta.totalPages`.

5. **Approve a Pending Member**:
   - Action: Click "Approve" on a pending registration.
   - URL: `POST /api/admin/members/:id/approve`
   - Expected: `200 OK`.
   - Result: Toast appears; member removed from pending queue; pending badge count drops.

6. **Reject with Reason**:
   - Action: Click "Reject" on a pending registration and enter reason.
   - URL: `POST /api/admin/members/:id/reject`
   - Body: `{"reason": "Incomplete academic transcript"}`
   - Expected: `200 OK`.

7. **Download Receipt / Export**:
   - Action: Click "Download Receipt (PDF)" on a payment slip.
   - Request: Authenticated `GET /api/admin/payments/:id/receipt` via `adminApi.downloadReceipt()`.
   - Expected: Blob response with `application/pdf`.
   - Result: Browser save dialog; no token appears in the browser URL.

8. **Session Expiry & Auto-Logout**:
   - Action: In DevTools Console run: `localStorage.setItem('ohpea_admin_token', 'invalid_token')` and refresh.
   - Request: Returns `401 Unauthorized`.
   - Result: Client clears `ohpea_admin_token` and automatically redirects to `/login` with "Session expired. Please log in again."

---

## 7. Contract Drift Verification

1. **Simulate Outdated / Down Backend**:
   - Stop your backend (or set `VITE_CONTRACT_VERSION=99` in `.env.local`).
   - Reload the admin portal.
   - The red `<ContractDriftBanner />` immediately docks to the top:
     `Backend is v1. Portal requires v99. Update the portal or roll back the backend.`
   - Once logged in, navigating anywhere automatically guards to `/contract-mismatch`.
2. **Restore Backend**:
   - Restore `VITE_CONTRACT_VERSION=1`.
   - Click **Retry Check** on the banner.
   - Banner disappears and all modules restore.

---

## Contract guard and demo mode

The portal features a boot-time contract guard (`ContractContext`) that validates the running backend against the expected schema version:

- **Validation Flow**:
  1. On application startup, the portal fetches `/contract.json` (or `${VITE_API_URL}/../contract.json`).
  2. It compares the returned contract `version` against `VITE_CONTRACT_VERSION` (default `1`).
  3. If the backend is unreachable or the version does not match, a `<ContractDriftBanner />` is rendered at the top of the interface, and authenticated navigation is redirected to `/contract-mismatch` to prevent invalid mutations against an incompatible backend.

- **Demo Mode Bypass (`VITE_DEMO_MODE=true`)**:
  - When `VITE_DEMO_MODE=true` is set in the environment, the contract guard bypasses the remote `/contract.json` network check.
  - In demo mode, the application runs entirely standalone using the local fixture data in `src/demo/fixtures.ts` without failing boot-time contract validation or requiring a live backend service.
  - Setting `VITE_DEMO_MODE=false` (the default for staging and production) restores full remote contract enforcement and real API communication.

  ## First login and password changes

  The backend seed may set `mustChangePassword: true` for its SuperAdmin account. The portal no longer forces a password-change redirect; users can open **TopBar → Change Password** whenever they choose. After a successful password change, the current session is cleared and the user must sign in again. Use the temporary credentials configured by the backend seed and do not store them in this repository.
