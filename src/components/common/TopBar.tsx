import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useUiStore } from '@/store/useUiStore';
import { RegionBadge } from './RegionBadge';
import {
  Menu,
  ChevronDown,
  KeyRound,
  LogOut,
  User as UserIcon,
  Shield,
  Calendar,
} from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuthContext();
  const { toggleSidebarOpen, toggleSidebarCollapsed, sidebarCollapsed } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format current date in Addis Ababa (EAT)
  const [addisDate, setAddisDate] = useState<string>('');
  useEffect(() => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Addis_Ababa',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(now);
      setAddisDate(`${formatted} · Addis Ababa`);
    } catch {
      setAddisDate(new Date().toDateString());
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  // Breadcrumb generation based on pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0
    ? pathParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Dashboard';

  return (
    <header className="h-16 px-4 lg:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left zone: Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebarOpen}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="font-semibold text-slate-900 text-sm tracking-tight">{breadcrumb}</span>
        </div>
      </div>

      {/* Right zone: Regional badge, Addis Ababa Time, User Profile */}
      <div className="flex items-center gap-3">
        {/* Regional Admin Badge */}
        {user?.role === 'RegionalAdmin' && user.regionName && (
          <RegionBadge name={user.regionName} />
        )}

        {/* Date Time Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{addisDate}</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B3D2E] text-[#F1E3B8] font-bold text-xs flex items-center justify-center border border-[#14573F] shadow-2xs">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.fullName || 'Administrator'}
              </span>
              <span className="text-2xs text-slate-500 font-medium">
                {user?.role || 'SuperAdmin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-2xs font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                  <Shield className="w-2.5 h-2.5" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/change-password');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Change Password</span>
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
