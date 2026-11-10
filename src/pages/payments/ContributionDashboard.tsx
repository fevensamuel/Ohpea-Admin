import { useState, useEffect } from 'react';
import { DashboardApi } from '@/api/dashboard';
import { PaymentsApi } from '@/api/payments';
import type { ContributionSnapshot, MemberSummary } from '@/types/api';
import { StatsCard } from '@/components/common/StatsCard';
import { LineAreaChart } from '@/components/charts/LineAreaChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExportButton } from '@/components/common/ExportButton';
import { useToast } from '@/context/ToastContext';
import {
  PiggyBank,
  TrendingUp,
  Percent,
  AlertCircle,
  Building,
  Users,
} from 'lucide-react';

export function ContributionDashboard() {
  const toast = useToast();
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('6m');
  const [group, setGroup] = useState<'week' | 'month' | 'year'>('month');
  const [snapshot, setSnapshot] = useState<ContributionSnapshot | null>(null);
  const [unpaidMembers, setUnpaidMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContributionData = async () => {
    try {
      setLoading(true);
      const [snap, unpaid] = await Promise.all([
        DashboardApi.getContributions({ range, group }),
        PaymentsApi.getUnpaid(),
      ]);
      setSnapshot(snap);
      setUnpaidMembers(unpaid);
    } catch {
      toast.error('Failed to load contribution metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributionData();
  }, [range, group]);

  if (loading && !snapshot) {
    return <LoadingSpinner text="Compiling financial telemetry..." size="lg" />;
  }

  const totalMembers = (snapshot?.paidCount || 0) + (snapshot?.unpaidCount || 0);
  const collectionRate = totalMembers > 0 ? Math.round(((snapshot?.paidCount || 0) / totalMembers) * 100) : 0;
  const avgPerMember = totalMembers > 0 ? Math.round((snapshot?.totalYear || 0) / (snapshot?.paidCount || 1)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Contribution &amp; Financial Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revenue trajectory, collection rates, and regional fiscal compliance.
          </p>
        </div>

        {/* Range and Group switches */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            {(['3m', '6m', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 font-semibold rounded-md transition-all uppercase ${
                  range === r
                    ? 'bg-white text-[#0B3D2E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            {(['month', 'year'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`px-3 py-1 font-semibold rounded-md transition-all capitalize ${
                  group === g
                    ? 'bg-white text-[#0B3D2E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}ly
              </button>
            ))}
          </div>
        </div>
      </div>

      {snapshot && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Year Revenue"
              value={`ETB ${snapshot.totalYear.toLocaleString()}`}
              icon={<TrendingUp className="w-4 h-4 text-emerald-700" />}
              subtext="Aggregated membership dues"
              accentColor="#0B3D2E"
            />
            <StatsCard
              title="Average per Active Member"
              value={`ETB ${avgPerMember.toLocaleString()}`}
              icon={<Users className="w-4 h-4 text-[#C9A24A]" />}
              subtext="Annualized fee baseline"
              accentColor="#C9A24A"
            />
            <StatsCard
              title="Collection Compliance Rate"
              value={`${collectionRate}%`}
              icon={<Percent className="w-4 h-4 text-[#1F7A57]" />}
              subtext={`${snapshot.paidCount} paid / ${snapshot.unpaidCount} unpaid`}
              accentColor="#1F7A57"
              badge={{ text: 'Target 90%', variant: 'positive' }}
            />
            <StatsCard
              title="Unpaid Arrears Members"
              value={unpaidMembers.length}
              icon={<AlertCircle className="w-4 h-4 text-[#E8772E]" />}
              subtext="Pending monthly settlement"
              accentColor="#E8772E"
              badge={{ text: 'Action required', variant: 'warning' }}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Historical Collection Trajectory
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Monthly ETB volume deposited across all accounts
              </p>
              <LineAreaChart data={snapshot.timeline} height={240} />
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Banking Channel Share
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Siinqee Bank, CBE and Telebirr distribution
              </p>
              <DonutChart
                data={snapshot.methodDistribution.map((m) => ({
                  name: m.method.split(' ')[0],
                  value: m.amount,
                }))}
                totalLabel="Total Dep."
                formatValue={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
                height={220}
              />
            </div>
          </div>

          {/* Charts Row 2: Regional Performance */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Regional Cluster Contribution Volume
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Revenue generation and member compliance by regional office
            </p>
            <BarChartCard
              data={snapshot.byRegion.map((r) => ({
                label: r.region.split(' ')[0],
                value: r.amount,
                color: '#14573F',
              }))}
              height={230}
              formatValue={(v) => `ETB ${v.toLocaleString()}`}
            />
          </div>

          {/* Unpaid Members Roster Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Outstanding Member Accounts ({unpaidMembers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Members with unpaid dues for the current evaluation period
                </p>
              </div>
              <ExportButton
                onExport={() => PaymentsApi.export({ status: 'unpaid' })}
                filename="OHPEA-Unpaid-Members.csv"
                label="Export Unpaid List"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Member</th>
                    <th className="py-2.5 px-3 font-semibold">Phone</th>
                    <th className="py-2.5 px-3 font-semibold">Region</th>
                    <th className="py-2.5 px-3 font-semibold">Sector</th>
                    <th className="py-2.5 px-3 font-semibold">Last Payment</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unpaidMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{m.fullName}</span>
                        <span className="text-2xs text-slate-400 block font-mono">{m.memberNo}</span>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-600">{m.phone}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.regionName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.sectorName}</td>
                      <td className="py-2.5 px-3 text-slate-600 tabular-nums">
                        {m.lastPaymentDate || 'Never'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          Arrears
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
