import { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle, Download, Search } from 'lucide-react';
import { PaymentsApi } from '@/api/payments';
import { localized } from '@/lib/i18n';
import { MembersApi } from '@/api/members';
import { PlansApi } from '@/api/plans';
import { ApiError, type MemberSummary, type ContributionPlan, type PaymentMethod, type PaymentPeriod } from '@/types/api';
import { useToast } from '@/context/ToastContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  preselectedMemberId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordPaymentModal({
  isOpen,
  preselectedMemberId,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [plans, setPlans] = useState<ContributionPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);

  // Form states
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [amountEtb, setAmountEtb] = useState<string>('600');
  const [period, setPeriod] = useState<PaymentPeriod>('monthly');
  const [paidForDate, setPaidForDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [bank, setBank] = useState<string>('Siinqee Bank');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [recordedPaymentId, setRecordedPaymentId] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [memRes, planList] = await Promise.all([
          MembersApi.list({ pageSize: 50, membershipStatus: 'active' }),
          PlansApi.list(),
        ]);
        setMembers(memRes.data);
        setPlans(planList);

        if (preselectedMemberId) {
          const match = memRes.data.find((m) => m.id === preselectedMemberId);
          if (match) setSelectedMember(match);
        }
      } catch {
        // quiet fallback
      }
    };
    loadData();
  }, [isOpen, preselectedMemberId]);

  if (!isOpen) return null;

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    if (!planId) return;
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setAmountEtb(String(plan.amountEtb));
      setPeriod(plan.period);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error('Please select an active member to record this payment.');
      return;
    }

    const amt = parseFloat(amountEtb);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please specify a valid contribution amount in ETB.');
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      const newPay = await PaymentsApi.create({
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        amountEtb: amt,
        period,
        paidForDate,
        method,
        bank: method === 'cash' ? 'Direct Regional Desk' : bank,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast.success(`Payment recorded successfully: ${newPay.receiptNo}`);
      setRecordedPaymentId(newPay.id);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!recordedPaymentId) return;
    try {
      const blob = await PaymentsApi.downloadReceipt(recordedPaymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${recordedPaymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Official PDF receipt downloaded.');
    } catch {
      toast.error('Could not generate receipt PDF.');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B3D2E] text-[#F1E3B8] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Record Member Contribution</h3>
              <p className="text-xs text-slate-500">Official OHPEA financial ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success screen if recorded */}
        {recordedPaymentId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Payment Successfully Recorded!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              The contribution payment has been credited to {selectedMember?.fullName} (
              {selectedMember?.memberNo}). You can download the official authenticated PDF receipt
              now.
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-[#C9A24A]" />
                Download Receipt (PDF)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Member Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Member <span className="text-red-500">*</span>
              </label>

              {selectedMember ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 text-xs">
                  <div>
                    <span className="font-bold text-emerald-950">{selectedMember.fullName}</span>
                    <span className="ml-2 font-mono text-emerald-800">
                      ({selectedMember.memberNo})
                    </span>
                    <p className="text-2xs text-emerald-700">
                      {localized(selectedMember.regionName)} · {localized(selectedMember.sectorName)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-xs font-semibold text-emerald-900 hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search member by name, number, or phone..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{m.fullName}</span>
                            <span className="ml-2 text-2xs text-slate-500 font-mono">
                              {m.memberNo}
                            </span>
                          </div>
                          <span className="text-2xs text-slate-400">{localized(m.regionName)}</span>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-2xs text-slate-400 text-center">No active members match search.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plan selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preset Contribution Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => handlePlanSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="">-- Custom Amount --</option>
                  {plans.map((pln) => (
                    <option key={pln.id} value={pln.id}>
                      {localized(pln.name)} (ETB {pln.amountEtb})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount in ETB <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={amountEtb}
                  onChange={(e) => setAmountEtb(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 tabular-nums font-semibold"
                  required
                />
                {fieldErrors.amountEtb && <p className="text-2xs text-red-600 mt-1">{fieldErrors.amountEtb}</p>}
              </div>
            </div>

            {/* Period & Paid For Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Period Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PaymentPeriod)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly / Annual</option>
                  <option value="weekly">Weekly</option>
                </select>
                {fieldErrors.period && <p className="text-2xs text-red-600 mt-1">{fieldErrors.period}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paid For Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paidForDate}
                  onChange={(e) => setPaidForDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 tabular-nums"
                  required
                />
                {fieldErrors.paidForDate && <p className="text-2xs text-red-600 mt-1">{fieldErrors.paidForDate}</p>}
              </div>
            </div>

            {/* Method & Bank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="bank_transfer">Bank Transfer (Deposit / Mobile App)</option>
                  <option value="mobile_money">Mobile Money (Telebirr / CBE Birr)</option>
                  <option value="cash">Cash (Regional Desk)</option>
                  <option value="other">Other / Cheque</option>
                </select>
                {fieldErrors.method && <p className="text-2xs text-red-600 mt-1">{fieldErrors.method}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank / Channel
                </label>
                <input
                  type="text"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="e.g. Siinqee Bank, CBE, Telebirr"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Reference & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Reference / Slip No
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. SQ-TXN-129381 or TB-8839"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
                {fieldErrors.reference && <p className="text-2xs text-red-600 mt-1">{fieldErrors.reference}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Ledger Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Cleared at Adama branch"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMember}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3D2E] hover:bg-[#14573F] rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Record &amp; Issue Receipt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
