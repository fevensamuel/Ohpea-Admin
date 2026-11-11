import { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { DemoBanner } from '@/components/common/DemoBanner';
import { AccessDenied } from '@/components/common/AccessDenied';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useUiStore } from '@/store/useUiStore';

// Pages
import { Login } from '@/pages/Login';
import { ChangePassword } from '@/pages/ChangePassword';
import { Dashboard } from '@/pages/Dashboard';
import { MemberList } from '@/pages/members/MemberList';
import { PendingRegistrations } from '@/pages/members/PendingRegistrations';
import { MemberEdit } from '@/pages/members/MemberEdit';
import { PaymentStatus } from '@/pages/payments/PaymentStatus';
import { PaymentList } from '@/pages/payments/PaymentList';
import { ContributionDashboard } from '@/pages/payments/ContributionDashboard';
import { ContributionPlans } from '@/pages/payments/ContributionPlans';
import { UnpaidMembers } from '@/pages/payments/UnpaidMembers';
import { Announcements } from '@/pages/content/Announcements';
import { AnnouncementEdit } from '@/pages/content/AnnouncementEdit';
import { Programs } from '@/pages/content/Programs';
import { Objectives } from '@/pages/content/Objectives';
import { Partners } from '@/pages/content/Partners';
import { Activities } from '@/pages/content/Activities';
import { ContactMessages } from '@/pages/communication/ContactMessages';
import { Subscribers } from '@/pages/communication/Subscribers';
import { SiteSettings } from '@/pages/settings/SiteSettings';
import { ContactSettings } from '@/pages/settings/ContactSettings';
import { Regions } from '@/pages/settings/Regions';
import { Lookups } from '@/pages/settings/Lookups';
import { AdminUsers } from '@/pages/settings/AdminUsers';
import { AuditLogs } from '@/pages/settings/AuditLogs';
import { ComingSoon } from '@/pages/coming-soon/ComingSoon';

import { ContractDriftBanner } from '@/components/common/ContractDriftBanner';
import { useContractGuard } from '@/context/ContractContext';
import { ContractMismatch } from '@/pages/ContractMismatch';

// Protected layout with hard guards
export function ProtectedLayout() {
  const { user, loading } = useAuthContext();
  const { ok } = useContractGuard();
  const { sidebarCollapsed } = useUiStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7]">
        <LoadingSpinner text="Authenticating administrative session..." size="lg" />
      </div>
    );
  }

  // 1. If no user/token -> redirect /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Contract drift guard: once logged in, if !ok, redirect to /contract-mismatch
  if (!ok && location.pathname !== '/contract-mismatch') {
    return <Navigate to="/contract-mismatch" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-slate-800">
      <ContractDriftBanner />
      <DemoBanner />
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-68'
        }`}
      >
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Permission Guard component
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { hasPermission } = useAuthContext();
  if (!hasPermission(permission)) {
    return <AccessDenied permission={permission} />;
  }
  return <>{children}</>;
}

export {
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
};
