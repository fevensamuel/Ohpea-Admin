import { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useUiStore } from '@/store/useUiStore';
import { DashboardApi } from '@/api/dashboard';
import { localized } from '@/lib/i18n';
import { MembersApi } from '@/api/members';
import { RegionsApi } from '@/api/regions';
import type {
  DashboardSummary,
  DashboardDimensionItem,
  ContributionSnapshot,
  RecentActivityItem,
  MemberSummary,
  RegionItem,
} from '@/types/api';
import { StatsCard } from '@/components/common/StatsCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { LineAreaChart } from '@/components/charts/LineAreaChart';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { RejectReasonModal } from '@/components/modals/RejectReasonModal';
import { MemberDetailModal } from '@/components/modals/MemberDetailModal';
import { useToast } from '@/context/ToastContext';
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Briefcase,
  PiggyBank,
  ArrowUpRight,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export function Dashboard() {
  const { user, hasPermission } = useAuthContext();
  const { selectedRegionId, setSelectedRegionId } = useUiStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [genderData, setGenderData] = useState<DashboardDimensionItem[]>([]);
  const [sectorData, setSectorData] = useState<DashboardDimensionItem[]>([]);
  const [fieldData, setFieldData] = useState<DashboardDimensionItem[]>([]);
  const [occupationData, setOccupationData] = useState<DashboardDimensionItem[]>([]);
  const [graduationData, setGraduationData] = useState<DashboardDimensionItem[]>([]);
  const [regionStats, setRegionStats] = useState<DashboardDimensionItem[]>([]);
  const [contributions, setContributions] = useState<ContributionSnapshot | null>(null);
  const [contributionRange, setContributionRange] = useState<'3m' | '6m' | '12m'>('6m');
  const [recentRegistrations, setRecentRegistrations] = useState<MemberSummary[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);

  // Action modals
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [rejectingMember, setRejectingMember] = useState<{ id: string; name: string } | null>(null);

  const safeSummary: DashboardSummary = {
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    pendingMembers: 0,
    femaleMembers: 0,
    maleMembers: 0,
    governmentSector: 0,
    privateSector: 0,
    totalCollectedThisYear: 0,
    totalCollectedThisMonth: 0,
    unpaidMembersCount: 0,
    pendingRegistrations: 0,
    governmentMembers: 0,
    privateMembers: 0,
    otherMembers: 0,
    newThisMonth: 0,
    ...(summary ?? {}),
  };
  const safeRegions = Array.isArray(regions) ? regions : [];
  const safeGenderChart = Array.isArray(genderData) ? genderData : [];
  const safeSectorChart = Array.isArray(sectorData) ? sectorData : [];
  const safeFieldChart = Array.isArray(fieldData) ? fieldData : [];
  const safeOccupationChart = Array.isArray(occupationData) ? occupationData : [];
  const safeGraduationChart = Array.isArray(graduationData) ? graduationData : [];
  const safeRegionChart = Array.isArray(regionStats) ? regionStats : [];
  const safeRecentActivity = Array.isArray(activities) ? activities : [];
  const safeRecentMembers = Array.isArray(recentRegistrations) ? recentRegistrations : [];
  const safeContributions =
    contributions && typeof contributions === 'object'
      ? contributions
      : {
          totalYear: 0,
          totalMonth: 0,
          paidCount: 0,
          unpaidCount: 0,
          timeline: [],
          methodDistribution: [],
          byRegion: [],
        };
  const safeContribSeries = Array.isArray(safeContributions.timeline)
    ? safeContributions.timeline
    : [];
  const safeContribMethods = Array.isArray(safeContributions.methodDistribution)
    ? safeContributions.methodDistribution
    : [];
  const contributionRanges: readonly ('3m' | '6m' | '12m')[] = ['3m', '6m', '12m'];

  // RegionalAdmin is locked to their region
  const effectiveRegionId = user?.role === 'RegionalAdmin' ? user.regionId : selectedRegionId;

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        sumRes,
        regList,
        genRes,
        secRes,
        fldRes,
        occRes,
        grdRes,
        rgnRes,
        recRes,
        actRes,
      ] = await Promise.all([
        DashboardApi.getSummary({ regionId: effectiveRegionId }),
        RegionsApi.list(),
        DashboardApi.getMembersBy({ dimension: 'gender', lang: 'en', regionId: effectiveRegionId }),
        DashboardApi.getMembersBy({ dimension: 'sector', lang: 'en', regionId: effectiveRegionId }),
        DashboardApi.getMembersBy({ dimension: 'field', lang: 'en', regionId: effectiveRegionId }),
        DashboardApi.getMembersBy({ dimension: 'occupation', lang: 'en', regionId: effectiveRegionId }),
        DashboardApi.getMembersBy({ dimension: 'graduationLevel', lang: 'en', regionId: effectiveRegionId }),
        DashboardApi.getMembersBy({ dimension: 'region', lang: 'en' }),
        MembersApi.list({ pageSize: 5, sort: 'newest' }),
        DashboardApi.getRecentActivity(),
      ]);

      setSummary(sumRes);
      setRegions(Array.isArray(regList) ? regList : []);
      setGenderData(Array.isArray(genRes) ? genRes : []);
      setSectorData(Array.isArray(secRes) ? secRes : []);
      setFieldData(Array.isArray(fldRes) ? fldRes : []);
      setOccupationData(Array.isArray(occRes) ? occRes : []);
      setGraduationData(Array.isArray(grdRes) ? grdRes : []);
      setRegionStats(Array.isArray(rgnRes) ? rgnRes : []);
      setRecentRegistrations(Array.isArray(recRes?.data) ? recRes.data : []);
      setActivities(Array.isArray(actRes) ? actRes : []);

      if (hasPermission('contributions.dashboard')) {
        const contribRes = await DashboardApi.getContributions({
          range: contributionRange,
          regionId: effectiveRegionId,
        });
        setContributions({
          totalYear: contribRes?.totalYear ?? sumRes.totalCollectedThisYear ?? 0,
          totalMonth: contribRes?.totalMonth ?? 0,
          paidCount: contribRes?.paidCount ?? 0,
          unpaidCount: contribRes?.unpaidCount ?? 0,
          timeline: Array.isArray(contribRes?.timeline) ? contribRes.timeline : [],
          methodDistribution: Array.isArray(contribRes?.methodDistribution)
            ? contribRes.methodDistribution
            : [],
          byRegion: Array.isArray(contribRes?.byRegion) ? contribRes.byRegion : [],
        });
      }
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [effectiveRegionId, contributionRange]);

  const handleApprove = async (id: string, name: string) => {
    try {
      await MembersApi.approve(id);
      toast.success(`Approved application for ${name}`);
      loadDashboardData();
    } catch {
      toast.error('Failed to approve application');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingMember) return;
    try {
      await MembersApi.reject(rejectingMember.id, reason);
      toast.success(`Rejected registration for ${rejectingMember.name}`);
      setRejectingMember(null);
      loadDashboardData();
    } catch {
      toast.error('Failed to reject registration');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Administrator'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time association telemetry across Oromia tourism corridors.
          </p>
        </div>

        {/* Region Filter - Hidden for RegionalAdmin */}
        {user?.role !== 'RegionalAdmin' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              aria-label="Filter dashboard by regional cluster"
            >
              <option value="">All Oromia Clusters</option>
              {safeRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  {localized(r.name)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && !summary ? (
        <LoadingSpinner text="Aggregating registry metrics..." size="lg" />
      ) : summary || !loading ? (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatsCard
              title="Total"
              value={(safeSummary.totalMembers ?? 0).toLocaleString()}
              icon={<Users className="w-4 h-4" />}
              accentColor="#0B3D2E"
              onClick={() => navigate('/members')}
              ctaText="Directory"
            />
            <StatsCard
              title="Active"
              value={(safeSummary.activeMembers ?? 0).toLocaleString()}
              icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
              accentColor="#1F7A57"
              badge={{ text: 'Verified', variant: 'positive' }}
              onClick={() => navigate('/members?membershipStatus=active')}
            />
            <StatsCard
              title="Pending"
              value={safeSummary.pendingMembers ?? 0}
              icon={<Clock className="w-4 h-4 text-[#E8772E]" />}
              accentColor="#E8772E"
              badge={{ text: 'Review', variant: 'warning' }}
              onClick={() => navigate('/members/pending')}
              ctaText="Review"
              active={(safeSummary.pendingMembers ?? 0) > 0}
            />
            <StatsCard
              title="Inactive"
              value={(safeSummary.inactiveMembers ?? 0).toLocaleString()}
              icon={<UserX className="w-4 h-4 text-slate-400" />}
              accentColor="#718096"
              onClick={() => navigate('/members?membershipStatus=inactive')}
            />
            <StatsCard
              title="Female"
              value={(safeSummary.femaleMembers ?? 0).toLocaleString()}
              subtext={`${Math.round(
                ((safeSummary.femaleMembers ?? 0) / (safeSummary.totalMembers || 1)) * 100
              )}%`}
              accentColor="#C9A24A"
              onClick={() => navigate('/members?gender=female')}
            />
            <StatsCard
              title="Male"
              value={(safeSummary.maleMembers ?? 0).toLocaleString()}
              subtext={`${Math.round(
                ((safeSummary.maleMembers ?? 0) / (safeSummary.totalMembers || 1)) * 100
              )}%`}
              accentColor="#14573F"
              onClick={() => navigate('/members?gender=male')}
            />
            <StatsCard
              title="Gov Sector"
              value={(safeSummary.governmentSector ?? 0).toLocaleString()}
              icon={<Building2 className="w-4 h-4" />}
              accentColor="#2F6FB5"
              onClick={() => navigate('/members')}
            />
            <StatsCard
              title="Private"
              value={(safeSummary.privateSector ?? 0).toLocaleString()}
              icon={<Briefcase className="w-4 h-4" />}
              accentColor="#0B3D2E"
              onClick={() => navigate('/members')}
            />
          </div>

          {/* Section 1: Demographics & Specialization Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Distribution Donut */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Gender Representation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Male &amp; female hospitality professionals
              </p>
              <DonutChart
                data={safeGenderChart.map((d) => ({
                  name: localized(d.label),
                  value: d.value,
                  color: d.color,
                }))}
                totalLabel="Total Members"
                height={210}
              />
            </div>

            {/* Sector Breakdown Bar Chart */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Distribution by Hospitality Sector
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hotels, tour operators, culinary institutes &amp; government desks
                  </p>
                </div>
                <button
                  onClick={() => navigate('/members')}
                  className="text-xs font-semibold text-[#14573F] hover:underline flex items-center gap-1"
                >
                  View Table <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <BarChartCard
                data={safeSectorChart.map((d) => ({
                  label: localized(d.label),
                  value: d.value,
                  color: d.color,
                }))}
                horizontal={true}
                height={220}
              />
            </div>
          </div>

          {/* Section 2: Education, Fields of Study & Regional Clusters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field of Study */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Core Fields of Study
              </h3>
              <p className="text-xs text-slate-500 mb-4">Specialization distribution</p>
              <BarChartCard
                data={safeFieldChart.map((d) => ({
                  label: localized(d.label).split(' / ')[0].split(' & ')[0],
                  value: d.value,
                  color: d.color,
                }))}
                horizontal={false}
                height={220}
              />
            </div>

            {/* Occupation Type Donut */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Enterprise vs Public Sector
              </h3>
              <p className="text-xs text-slate-500 mb-4">Employment classification</p>
              <DonutChart
                data={safeOccupationChart.map((d) => ({
                  name: localized(d.label),
                  value: d.value,
                  color: d.color,
                }))}
                totalLabel="Classified"
                height={210}
              />
            </div>

            {/* Regional Clusters (Hidden for Regional Admin) */}
            {user?.role !== 'RegionalAdmin' ? (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Regional Office Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-4">Member density across Oromia</p>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {safeRegionChart.map((r, i) => (
                    <div key={localized(r.label)} className="text-xs space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700 truncate max-w-[180px]">
                          {localized(r.label)}
                        </span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {r.value} members
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#14573F] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (r.value / (regionStats[0]?.value || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* If regional admin, show Graduation level bar */
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Graduation Levels
                </h3>
                <p className="text-xs text-slate-500 mb-4">Educational credential benchmarks</p>
                <BarChartCard
                  data={safeGraduationChart.map((d) => ({
                    label: localized(d.label).split(' ')[0],
                    value: d.value,
                    color: d.color,
                  }))}
                  horizontal={false}
                  height={210}
                />
              </div>
            )}
          </div>

          {/* Section 3: Financial Contributions Snapshot */}
          {hasPermission('contributions.dashboard') && contributions && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-[#0B3D2E]" />
                    <h3 className="text-base font-bold text-slate-900">
                      Contributions &amp; Financial Snapshot
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Annual collections, payment compliance, and regional revenue channels
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
                    {contributionRanges.map((r) => (
                      <button
                        key={r}
                        onClick={() => setContributionRange(r)}
                        className={`px-3 py-1 font-semibold rounded-md transition-all uppercase ${
                          contributionRange === r
                            ? 'bg-white text-[#0B3D2E] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/contributions/dashboard')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
                  >
                    Financial Hub <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Strip KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Collected This Year
                  </span>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                    ETB {(safeContributions.totalYear ?? 0).toLocaleString()}
                  </p>
                  <span className="text-2xs text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +14.2% YoY Growth
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Collected This Month
                  </span>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                    ETB {(safeContributions.totalMonth ?? 0).toLocaleString()}
                  </p>
                  <span className="text-2xs text-slate-500">October 2026</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Compliant (Paid)
                  </span>
                  <p className="mt-1 text-xl font-bold text-emerald-800 tabular-nums">
                    {(safeContributions.paidCount ?? 0).toLocaleString()}
                  </p>
                  <span className="text-2xs text-slate-500">
                    {Math.round(
                      ((safeContributions.paidCount ?? 0) /
                        ((safeContributions.paidCount ?? 0) + (safeContributions.unpaidCount ?? 0) || 1)) *
                        100
                    )}
                    % Collection Rate
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Outstanding (Unpaid)
                  </span>
                  <p className="mt-1 text-xl font-bold text-red-700 tabular-nums">
                    {(safeContributions.unpaidCount ?? 0).toLocaleString()}
                  </p>
                  <button
                    onClick={() => navigate('/payments/unpaid')}
                    className="text-2xs font-semibold text-[#1F7A57] hover:underline"
                  >
                    View Unpaid Roster →
                  </button>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Contribution Collections Over Time
                  </h4>
                  <LineAreaChart data={safeContribSeries} height={230} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Channel Distribution
                  </h4>
                  <DonutChart
                    data={safeContribMethods.map((m) => ({
                      name: localized(m.method).split(' ')[0],
                      value: m.amount,
                    }))}
                    totalLabel="Deposited"
                    formatValue={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
                    height={200}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Recent Registrations & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Registrations Table */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Member Registrations
                  </h3>
                  <p className="text-xs text-slate-500">Latest submissions awaiting processing</p>
                </div>
                <button
                  onClick={() => navigate('/members/pending')}
                  className="text-xs font-semibold text-[#14573F] hover:underline flex items-center gap-1"
                >
                  Pending ({safeSummary.pendingMembers}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Applicant</th>
                      <th className="py-2.5 px-3 font-semibold">Region</th>
                      <th className="py-2.5 px-3 font-semibold">Sector</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeRecentMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedMemberId(m.id)}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                              {m.fullName[0]}
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 truncate">{m.fullName}</p>
                              <p className="text-2xs text-slate-400 font-mono">{m.memberNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]">
                          {m.regionName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]">
                          {m.sectorName}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge type="registration" status={m.registrationStatus} />
                        </td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {m.registrationStatus === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprove(m.id, m.fullName)}
                                className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Approve applicant"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setRejectingMember({ id: m.id, name: m.fullName })
                                }
                                className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                title="Reject applicant"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-2xs text-slate-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Audit / Activity Feed */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Recent Administrative Activity
              </h3>
              <p className="text-xs text-slate-500 mb-4">Official staff audit trail</p>

              <div className="space-y-3.5">
                {safeRecentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#14573F] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-tight">
                        {localized(act.title)}
                      </p>
                      <p className="text-2xs text-slate-500 mt-0.5 leading-normal">
                        {act.description}
                      </p>
                      <span className="text-2xs text-slate-400 font-mono mt-1 block">
                        {act.timestamp} · {act.actor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Member Detail Modal */}
      {selectedMemberId && (
        <MemberDetailModal
          isOpen={true}
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          onStatusUpdated={loadDashboardData}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingMember && (
        <RejectReasonModal
          isOpen={true}
          memberId={rejectingMember.id}
          memberName={rejectingMember.name}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingMember(null)}
        />
      )}
    </div>
  );
}
