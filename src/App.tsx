import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ContractProvider } from '@/context/ContractContext';
import { ContractDriftBanner } from '@/components/common/ContractDriftBanner';
import { DashboardErrorBoundary } from '@/components/common/DashboardErrorBoundary';
import {
  ProtectedLayout,
  RequirePermission,
  Login,
  ChangePassword,
  Dashboard,
  MemberList,
  PendingRegistrations,
  MemberEdit,
  PaymentStatus,
  PaymentList,
  ContributionDashboard,
  ContributionPlans,
  UnpaidMembers,
  Announcements,
  AnnouncementEdit,
  Programs,
  Objectives,
  Partners,
  Activities,
  ContactMessages,
  Subscribers,
  SiteSettings,
  ContactSettings,
  Regions,
  Lookups,
  AdminUsers,
  AuditLogs,
  ComingSoon,
  ContractMismatch,
} from './routes';

export default function App() {
  const basename = "/admin";

  return (
    <ContractProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter basename={basename}>
            <ContractDriftBanner />
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              <Route path="/contract-mismatch" element={<ContractMismatch />} />

              {/* Authenticated Application Shell */}
              <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route
                path="/dashboard"
                element={
                  <RequirePermission permission="dashboard">
                    <DashboardErrorBoundary>
                      <Dashboard />
                    </DashboardErrorBoundary>
                  </RequirePermission>
                }
              />

              {/* Members */}
              <Route
                path="/members"
                element={
                  <RequirePermission permission="members">
                    <MemberList />
                  </RequirePermission>
                }
              />
              <Route
                path="/members/pending"
                element={
                  <RequirePermission permission="members.approve">
                    <PendingRegistrations />
                  </RequirePermission>
                }
              />
              <Route
                path="/members/edit/:id"
                element={
                  <RequirePermission permission="members.edit">
                    <MemberEdit />
                  </RequirePermission>
                }
              />

              {/* Payments & Contributions */}
              <Route
                path="/payments/status"
                element={
                  <RequirePermission permission="payments">
                    <PaymentStatus />
                  </RequirePermission>
                }
              />
              <Route
                path="/payments"
                element={
                  <RequirePermission permission="payments">
                    <PaymentList />
                  </RequirePermission>
                }
              />
              <Route
                path="/contributions/dashboard"
                element={
                  <RequirePermission permission="contributions.dashboard">
                    <ContributionDashboard />
                  </RequirePermission>
                }
              />
              <Route
                path="/contributions/plans"
                element={
                  <RequirePermission permission="contributions.dashboard">
                    <ContributionPlans />
                  </RequirePermission>
                }
              />
              <Route
                path="/payments/unpaid"
                element={
                  <RequirePermission permission="payments">
                    <UnpaidMembers />
                  </RequirePermission>
                }
              />

              {/* Content & Announcements CMS */}
              <Route
                path="/content/announcements"
                element={
                  <RequirePermission permission="announcements">
                    <Announcements />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/announcements/new"
                element={
                  <RequirePermission permission="announcements">
                    <AnnouncementEdit />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/announcements/edit/:id"
                element={
                  <RequirePermission permission="announcements">
                    <AnnouncementEdit />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/programs"
                element={
                  <RequirePermission permission="programs">
                    <Programs />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/objectives"
                element={
                  <RequirePermission permission="programs">
                    <Objectives />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/partners"
                element={
                  <RequirePermission permission="partners">
                    <Partners />
                  </RequirePermission>
                }
              />
              <Route
                path="/content/activities"
                element={
                  <RequirePermission permission="activities">
                    <Activities />
                  </RequirePermission>
                }
              />

              {/* Communication */}
              <Route
                path="/communication/messages"
                element={
                  <RequirePermission permission="messages">
                    <ContactMessages />
                  </RequirePermission>
                }
              />
              <Route
                path="/communication/subscribers"
                element={
                  <RequirePermission permission="subscribers">
                    <Subscribers />
                  </RequirePermission>
                }
              />

              {/* Settings */}
              <Route
                path="/settings/site"
                element={
                  <RequirePermission permission="settings.site">
                    <SiteSettings />
                  </RequirePermission>
                }
              />
              <Route
                path="/settings/contact"
                element={
                  <RequirePermission permission="settings.contact">
                    <ContactSettings />
                  </RequirePermission>
                }
              />
              <Route
                path="/settings/regions"
                element={
                  <RequirePermission permission="regions">
                    <Regions />
                  </RequirePermission>
                }
              />
              <Route
                path="/settings/lookups"
                element={
                  <RequirePermission permission="lookups">
                    <Lookups />
                  </RequirePermission>
                }
              />
              <Route
                path="/settings/users"
                element={
                  <RequirePermission permission="admin.users">
                    <AdminUsers />
                  </RequirePermission>
                }
              />
              <Route
                path="/settings/audit"
                element={
                  <RequirePermission permission="audit.logs">
                    <AuditLogs />
                  </RequirePermission>
                }
              />

              {/* Coming Soon roadmap */}
              <Route path="/coming-soon" element={<ComingSoon />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </ContractProvider>
  );
}
