import { useState, useEffect } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { usePagination } from '@/hooks/usePagination';
import { MembersApi } from '@/api/members';
import { PaymentsApi } from '@/api/payments';
import type { MemberSummary } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { MemberDetailModal } from '@/components/modals/MemberDetailModal';
import { ExportButton } from '@/components/common/ExportButton';
import { useToast } from '@/context/ToastContext';
import {
  CreditCard,
  PlusCircle,
  Bell,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
} from 'lucide-react';

export function PaymentStatus() {
  const { params, setParam } = useQueryParams();
  const toast = useToast();

  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriodDate, setSelectedPeriodDate] = useState<string>('2026-10');

  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 10);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [preselectedMemberId, setPreselectedMemberId] = useState<string | undefined>(undefined);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  const fetchMembersStatus = async () => {
    try {
      setLoading(true);
      const res = await MembersApi.list({
        page,
        pageSize,
        paid: params.paid || undefined,
        q: params.q || undefined,
      });
      setMembers(res.data);
      updateMeta(res.meta);
    } catch {
      toast.error('Failed to load member payment statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersStatus();
  }, [page, pageSize, params.paid, params.q]);

  const paidCount = members.filter((m) => m.hasPaidRecentPeriod).length;
  const unpaidCount = members.filter((m) => !m.hasPaidRecentPeriod).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Member Payment &amp; Contribution Status
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking monthly dues compliance, arrears, and regional collection rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPreselectedMemberId(undefined);
              setRecordModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-[#C9A24A]" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Total In Roster
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{meta.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Paid (Compliant)
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-800 tabular-nums">
            {paidCount} on page
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Arrears / Unpaid
          </span>
          <p className="mt-1 text-2xl font-bold text-red-700 tabular-nums">
            {unpaidCount} on page
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Automated SMS Reminders
          </span>
          <button
            onClick={() => toast.info('Automated Payment Reminders will ship in Phase 2.')}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
          >
            <Lock className="w-3 h-3" /> Send Reminders (Soon)
          </button>
        </div>
      </div>

      {/* Filter strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Target Period:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                periodType === 'monthly' ? 'bg-white text-[#0B3D2E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                periodType === 'yearly' ? 'bg-white text-[#0B3D2E] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Yearly
            </button>
          </div>

          <input
            type={periodType === 'monthly' ? 'month' : 'number'}
            value={selectedPeriodDate}
            onChange={(e) => setSelectedPeriodDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 tabular-nums focus:outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setParam('paid', null)}
            className={`px-3 py-1 rounded-lg font-semibold border ${
              !params.paid
                ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setParam('paid', 'true')}
            className={`px-3 py-1 rounded-lg font-semibold border ${
              params.paid === 'true'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            Paid Only
          </button>
          <button
            onClick={() => setParam('paid', 'false')}
            className={`px-3 py-1 rounded-lg font-semibold border ${
              params.paid === 'false'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            Unpaid Only
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Checking member ledger statuses..." />
        ) : members.length === 0 ? (
          <EmptyState title="No members match payment status filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-3 font-semibold">Region</th>
                  <th className="py-3 px-3 font-semibold">Membership</th>
                  <th className="py-3 px-3 font-semibold">Selected Period</th>
                  <th className="py-3 px-3 font-semibold">Last Payment Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount (ETB)</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{m.fullName}</p>
                      <p className="text-2xs text-slate-400 font-mono">{m.memberNo}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.regionName}</td>
                    <td className="py-3 px-3">
                      <StatusBadge type="membership" status={m.membershipStatus} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {m.hasPaidRecentPeriod ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-800 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">
                      {m.lastPaymentDate || 'No record'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900">
                      {m.lastPaymentAmount
                        ? m.lastPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPreselectedMemberId(m.id);
                            setRecordModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0B3D2E] text-white hover:bg-[#14573F] font-semibold text-2xs transition-colors"
                        >
                          Record Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailModalId(m.id)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="View member dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <RecordPaymentModal
          isOpen={true}
          preselectedMemberId={preselectedMemberId}
          onClose={() => setRecordModalOpen(false)}
          onSuccess={() => {
            fetchMembersStatus();
          }}
        />
      )}

      {/* Member Detail Modal */}
      {detailModalId && (
        <MemberDetailModal
          isOpen={true}
          memberId={detailModalId}
          onClose={() => setDetailModalId(null)}
          onStatusUpdated={fetchMembersStatus}
        />
      )}
    </div>
  );
}
