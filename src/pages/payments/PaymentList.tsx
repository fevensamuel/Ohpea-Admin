import { useState, useEffect } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { PaymentsApi } from '@/api/payments';
import type { PaymentRecord } from '@/types/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ExportButton } from '@/components/common/ExportButton';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import {
  Receipt,
  Download,
  Ban,
  PlusCircle,
  Search,
  Filter,
} from 'lucide-react';

export function PaymentList() {
  const toast = useToast();
  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 10);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [voidingPayment, setVoidingPayment] = useState<PaymentRecord | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await PaymentsApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
        method: methodFilter || undefined,
      });
      setPayments(res.data);
      updateMeta(res.meta);
    } catch {
      toast.error('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize, statusFilter, methodFilter]);

  const handleDownloadReceipt = async (id: string, receiptNo: string) => {
    try {
      const blob = await PaymentsApi.downloadReceipt(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OHPEA-${receiptNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Receipt ${receiptNo} downloaded.`);
    } catch {
      toast.error('Could not download receipt PDF.');
    }
  };

  const handleConfirmVoid = async () => {
    if (!voidingPayment) return;
    try {
      setVoidLoading(true);
      await PaymentsApi.void(voidingPayment.id, voidReason || 'Voided by administrative officer');
      toast.success(`Payment slip ${voidingPayment.receiptNo} has been marked as void.`);
      setVoidingPayment(null);
      setVoidReason('');
      fetchPayments();
    } catch {
      toast.error('Failed to void payment.');
    } finally {
      setVoidLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Contribution Payment Records
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official ledger of verified payments, member receipts, and banking audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            onExport={() => PaymentsApi.export({ status: statusFilter })}
            filename={`OHPEA-Payments-${new Date().toISOString().slice(0, 10)}.csv`}
            label="Export Ledger"
          />
          <button
            onClick={() => setRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-[#C9A24A]" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid Only</option>
          <option value="void">Voided Slips</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Payment Methods</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="cash">Cash (Desk)</option>
        </select>

        {(statusFilter || methodFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setMethodFilter('');
              setPage(1);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching financial records..." />
        ) : payments.length === 0 ? (
          <EmptyState title="No payment records match filter criteria" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Receipt No</th>
                  <th className="py-3 px-3 font-semibold">Member</th>
                  <th className="py-3 px-3 font-semibold">Region</th>
                  <th className="py-3 px-3 font-semibold">Period &amp; Date</th>
                  <th className="py-3 px-3 font-semibold">Method &amp; Bank</th>
                  <th className="py-3 px-3 font-semibold">Reference</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount (ETB)</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {p.receiptNo}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{p.memberName}</p>
                      <p className="text-2xs text-slate-400 font-mono">{p.memberNo}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[130px]">
                      {p.regionName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <span className="font-medium capitalize">{p.period}</span>
                      <span className="text-2xs text-slate-400 block tabular-nums">
                        {p.paidForDate}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="capitalize">{p.method.replace('_', ' ')}</span>
                      {p.bank && (
                        <span className="text-2xs text-slate-400 block truncate max-w-[120px]">
                          {p.bank}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-2xs truncate max-w-[120px]">
                      {p.reference || '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900">
                      {p.amountEtb.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="payment" status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(p.id, p.receiptNo)}
                          className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Download receipt PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {p.status === 'paid' && (
                          <button
                            type="button"
                            onClick={() => setVoidingPayment(p)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            title="Void this payment"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
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
          onClose={() => setRecordModalOpen(false)}
          onSuccess={fetchPayments}
        />
      )}

      {/* Void Modal */}
      {voidingPayment && (
        <ConfirmModal
          isOpen={true}
          title={`Void Payment Slip ${voidingPayment.receiptNo}?`}
          message={`Are you sure you want to void the contribution payment of ETB ${voidingPayment.amountEtb} for ${voidingPayment.memberName}? This action is recorded in the financial audit trail.`}
          confirmLabel="Void Payment"
          isDestructive={true}
          isLoading={voidLoading}
          onConfirm={handleConfirmVoid}
          onCancel={() => setVoidingPayment(null)}
        />
      )}
    </div>
  );
}
