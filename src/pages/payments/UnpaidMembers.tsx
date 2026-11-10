import { useState, useEffect } from 'react';
import { PaymentsApi } from '@/api/payments';
import type { MemberSummary } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ExportButton } from '@/components/common/ExportButton';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { useToast } from '@/context/ToastContext';
import { AlertCircle, PlusCircle, Lock, Phone, Mail } from 'lucide-react';

export function UnpaidMembers() {
  const toast = useToast();
  const [unpaidMembers, setUnpaidMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const fetchUnpaid = async () => {
    try {
      setLoading(true);
      const list = await PaymentsApi.getUnpaid();
      setUnpaidMembers(list);
    } catch {
      toast.error('Failed to load unpaid members roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaid();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Outstanding Dues &amp; Arrears Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active professional members with unpaid contributions for the current billing cycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            onExport={() => PaymentsApi.export({ status: 'unpaid' })}
            filename="OHPEA-Unpaid-Members.csv"
            label="Export Unpaid Roster"
          />
          <button
            onClick={() => toast.info('Automated Payment Reminders will ship in Phase 2.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Send Reminders (Soon)</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Checking accounts in arrears..." />
        ) : unpaidMembers.length === 0 ? (
          <EmptyState title="All member accounts are fully settled" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-3 font-semibold">Contact Details</th>
                  <th className="py-3 px-3 font-semibold">Region &amp; Sector</th>
                  <th className="py-3 px-3 font-semibold">Last Recorded Payment</th>
                  <th className="py-3 px-3 font-semibold">Outstanding Dues</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{m.fullName}</p>
                      <p className="text-2xs text-slate-400 font-mono">{m.memberNo}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <p className="flex items-center gap-1 tabular-nums">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {m.phone}
                      </p>
                      <p className="flex items-center gap-1 text-2xs text-slate-400">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {m.email}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <p className="font-medium text-slate-800">{m.regionName}</p>
                      <p className="text-2xs text-slate-400">{m.sectorName}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">
                      {m.lastPaymentDate ? (
                        <span>
                          {m.lastPaymentDate} (ETB {m.lastPaymentAmount})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No prior deposit</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-red-50 text-red-800 border border-red-200">
                        1 Cycle Overdue
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedMemberId(m.id);
                          setRecordModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B3D2E] text-white hover:bg-[#14573F] text-2xs font-semibold"
                      >
                        <PlusCircle className="w-3 h-3 text-[#C9A24A]" />
                        <span>Record Payment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {recordModalOpen && (
        <RecordPaymentModal
          isOpen={true}
          preselectedMemberId={selectedMemberId}
          onClose={() => setRecordModalOpen(false)}
          onSuccess={() => {
            fetchUnpaid();
          }}
        />
      )}
    </div>
  );
}
