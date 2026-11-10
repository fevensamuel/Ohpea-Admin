import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useUiStore } from '@/store/useUiStore';
import { MembersApi } from '@/api/members';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  PiggyBank,
  FileText,
  Bookmark,
  Handshake,
  CalendarCheck,
  MessageSquare,
  Mail,
  Sliders,
  MapPin,
  ListFilter,
  UserCog,
  History,
  Lock,
  ChevronDown,
  X,
  Compass,
  Briefcase,
  Globe2,
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
  locked?: boolean;
  phasePill?: string;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar() {
  const { hasPermission, isSuperAdmin } = useAuthContext();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUiStore();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Poll or fetch pending count for badge
  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const res = await MembersApi.getPendingCount();
        if (isMounted) setPendingCount(res.pendingCount);
      } catch {
        // quiet fallback
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const navGroups: NavGroup[] = [
    {
      group: 'MAIN',
      items: [
        {
          title: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          permission: 'dashboard',
        },
      ],
    },
    {
      group: 'MEMBERSHIP',
      items: [
        {
          title: 'All Members',
          path: '/members',
          icon: Users,
          permission: 'members',
        },
        {
          title: 'Pending Registrations',
          path: '/members/pending',
          icon: UserCheck,
          permission: 'members.approve',
          badge: pendingCount,
        },
      ],
    },
    {
      group: 'CONTRIBUTIONS & FINANCE',
      items: [
        {
          title: 'Payment Status',
          path: '/payments/status',
          icon: CreditCard,
          permission: 'payments',
        },
        {
          title: 'Payment Records',
          path: '/payments',
          icon: Receipt,
          permission: 'payments',
        },
        {
          title: 'Contribution Analytics',
          path: '/contributions/dashboard',
          icon: PiggyBank,
          permission: 'contributions.dashboard',
        },
        {
          title: 'Contribution Plans',
          path: '/contributions/plans',
          icon: ListFilter,
          permission: 'contributions.dashboard',
        },
      ],
    },
    {
      group: 'CONTENT MANAGEMENT',
      items: [
        {
          title: 'Announcements & News',
          path: '/content/announcements',
          icon: FileText,
          permission: 'announcements',
        },
        {
          title: 'Programs & Pillars',
          path: '/content/programs',
          icon: Bookmark,
          permission: 'programs',
        },
        {
          title: 'Objectives',
          path: '/content/objectives',
          icon: Compass,
          permission: 'programs',
        },
        {
          title: 'Strategic Partners',
          path: '/content/partners',
          icon: Handshake,
          permission: 'partners',
        },
        {
          title: 'Public Activities',
          path: '/content/activities',
          icon: CalendarCheck,
          permission: 'activities',
        },
      ],
    },
    {
      group: 'COMMUNICATION',
      items: [
        {
          title: 'Contact Messages',
          path: '/communication/messages',
          icon: MessageSquare,
          permission: 'messages',
        },
        {
          title: 'Newsletter Subscribers',
          path: '/communication/subscribers',
          icon: Mail,
          permission: 'subscribers',
        },
        {
          title: 'SMS Broadcasts',
          path: '/coming-soon?module=sms',
          icon: MessageSquare,
          locked: true,
          phasePill: 'Soon',
        },
      ],
    },
    {
      group: 'SYSTEM SETTINGS',
      items: [
        {
          title: 'Site & Branding',
          path: '/settings/site',
          icon: Sliders,
          permission: 'settings.site',
        },
        {
          title: 'Contact Information',
          path: '/settings/contact',
          icon: Mail,
          permission: 'settings.contact',
        },
        {
          title: 'Regional Clusters',
          path: '/settings/regions',
          icon: MapPin,
          permission: 'regions',
        },
        {
          title: 'Lookup Tables',
          path: '/settings/lookups',
          icon: ListFilter,
          permission: 'lookups',
        },
        {
          title: 'Admin Users & Roles',
          path: '/settings/users',
          icon: UserCog,
          permission: 'admin.users',
        },
        {
          title: 'System Audit Logs',
          path: '/settings/audit',
          icon: History,
          permission: 'audit.logs',
        },
      ],
    },
    {
      group: 'FUTURE PHASES (ROADMAP)',
      items: [
        {
          title: 'Jobs & Talent Bridge',
          path: '/coming-soon?module=jobs',
          icon: Briefcase,
          locked: true,
          phasePill: 'Phase 4',
        },
        {
          title: 'International Relations',
          path: '/coming-soon?module=international',
          icon: Globe2,
          locked: true,
          phasePill: 'Phase 4',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0B3D2E] text-slate-200 transition-all duration-300 ease-in-out border-r border-[#14573F] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-68'} w-72`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#14573F] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Emblem */}
            <div className="w-9 h-9 rounded-lg bg-[#C9A24A] text-[#0B3D2E] font-extrabold flex items-center justify-center shrink-0 shadow-sm border border-[#F1E3B8]">
              <span className="text-sm tracking-wider">OH</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-white truncate">
                  OHPEA ADMIN
                </span>
                <span className="text-2xs text-[#C9A24A] font-medium tracking-wide truncate">
                  Oromia Hospitality &amp; Tourism
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-300 hover:text-white p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => {
            // Filter by permission
            const visibleItems = group.items.filter((item) => {
              if (item.locked) return true;
              if (!item.permission) return true;
              return hasPermission(item.permission);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-2xs font-bold tracking-wider text-emerald-400/60 uppercase">
                    {group.group}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isLocked = item.locked;

                  if (isLocked) {
                    return (
                      <NavLink
                        key={item.title}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group opacity-75 hover:opacity-100 ${
                            isActive
                              ? 'bg-[#14573F] text-white'
                              : 'text-slate-300 hover:bg-[#14573F]/50 hover:text-white'
                          }`
                        }
                        title={sidebarCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                        </div>
                        {!sidebarCollapsed && item.phasePill && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold bg-[#C9A24A]/20 text-[#F1E3B8] border border-[#C9A24A]/30">
                            <Lock className="w-2.5 h-2.5" />
                            {item.phasePill}
                          </span>
                        )}
                      </NavLink>
                    );
                  }

                  return (
                    <NavLink
                      key={item.title}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#14573F] text-white shadow-xs font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#C9A24A] before:rounded-r'
                            : 'text-slate-300 hover:bg-[#14573F]/60 hover:text-white'
                        }`
                      }
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-emerald-300 shrink-0 group-hover:text-[#C9A24A] transition-colors" />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-[#E8772E] text-white tabular-nums animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#14573F] shrink-0 text-2xs text-emerald-300/70">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-2">
              <span>OHPEA Portal v2.0</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                Prod-Ready
              </span>
            </div>
          ) : (
            <div className="text-center font-mono">v2</div>
          )}
        </div>
      </aside>
    </>
  );
}
