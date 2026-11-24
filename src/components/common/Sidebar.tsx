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
  Smartphone,
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
  Globe,
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
          title: 'SMS Center',
          path: '/communication/sms',
          icon: Smartphone,
          permission: 'sms',
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
          permission: 'settings.site',
        },
        {
          title: 'Social Media Links',
          path: '/settings/socials',
          icon: Globe,
          permission: 'settings.site',
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
          permission: 'audit',
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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#103f34] text-slate-200 transition-all duration-300 ease-in-out border-r border-[#246b55] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-60'} w-72`}
      >
        {/* Brand Header */}
        <div className="min-h-[158px] flex flex-col items-start justify-center gap-4 px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/ohpea-mark.png" alt="OHPEA emblem" className="h-12 w-12 rounded-lg bg-white p-1 object-contain shrink-0 border border-white/70" />
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-lg font-semibold tracking-tight text-white truncate">
                  OHPEA
                </span>
                <span className="text-[9px] text-white/70 font-semibold tracking-[.12em] truncate">
                  ADMIN PORTAL
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
        {!sidebarCollapsed && (
          <div className="px-5 py-3 text-[11px] leading-relaxed text-white/65 border-b border-white/10">
            Oromia Hospitality Professionals<br />and Entrepreneurs Association
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
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
                  <div className="px-3 text-[9px] font-bold tracking-[.12em] text-white/50 uppercase">
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
                        end
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group opacity-75 hover:opacity-100 ${
                            isActive
                              ? 'bg-[#246b55] text-white'
                              : 'text-slate-300 hover:bg-[#246b55]/50 hover:text-white'
                          }`
                        }
                        title={sidebarCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                        </div>
                        {!sidebarCollapsed && item.phasePill && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold bg-[#b49a5a]/20 text-[#eee5ce] border border-[#b49a5a]/30">
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
                      end
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#285b4b] text-white font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`
                      }
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-emerald-300 shrink-0 group-hover:text-[#b49a5a] transition-colors" />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-[#b85b2b] text-white tabular-nums animate-pulse">
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
        <div className="p-4 border-t border-white/10 shrink-0 text-[10px] text-white/65">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-white/[.07] px-3 py-3">
                <div className="text-[9px] font-bold tracking-wider text-[#d0b66e]">SANDBOX</div>
                <div className="mt-1 text-xs text-white/75">Fictional data only</div>
              </div>
              <div className="px-1">Help &amp; documentation ↗</div>
            </div>
          ) : (
            <div className="text-center font-mono">v2</div>
          )}
        </div>
      </aside>
    </>
  );
}
