import { useState, useEffect } from 'react';
import { PlansApi } from '@/api/plans';
import type { ContributionPlan, PaymentPeriod } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { ListFilter, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export function ContributionPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState<ContributionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContributionPlan | null>(null);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<PaymentPeriod>('monthly');
  const [amountEtb, setAmountEtb] = useState<string>('250');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deletingPlan, setDeletingPlan] = useState<ContributionPlan | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const list = await PlansApi.list();
      setPlans(list);
    } catch {
      toast.error('Failed to load contribution plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setPeriod('monthly');
    setAmountEtb('250');
    setDescription('');
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: ContributionPlan) => {
    setEditingPlan(p);
    setName(p.name);
    setPeriod(p.period);
    setAmountEtb(String(p.amountEtb));
    setDescription(p.description || '');
    setActive(p.active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    const amt = parseFloat(amountEtb);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Valid positive ETB amount is required');
      return;
    }

    try {
      setSaving(true);
      if (editingPlan) {
        await PlansApi.update(editingPlan.id, {
          name: name.trim(),
          period,
          amountEtb: amt,
          description: description.trim() || undefined,
          active,
        });
        toast.success(`Plan "${name}" updated.`);
      } else {
        await PlansApi.create({
          name: name.trim(),
          period,
          amountEtb: amt,
          description: description.trim() || undefined,
          active,
        });
        toast.success(`Plan "${name}" created.`);
      }
      setModalOpen(false);
      fetchPlans();
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    try {
      await PlansApi.delete(deletingPlan.id);
      toast.success(`Plan "${deletingPlan.name}" deleted.`);
      setDeletingPlan(null);
      fetchPlans();
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Contribution &amp; Dues Plans
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure standard monthly, yearly, and institutional membership pricing rates.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>New Dues Plan</span>
        </button>
      </div>

      {/* Grid of Plans */}
      {loading ? (
        <LoadingSpinner text="Loading plans..." />
      ) : plans.length === 0 ? (
        <EmptyState title="No contribution plans configured" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                plan.active
                  ? 'border-slate-200 shadow-2xs'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 capitalize">
                    {plan.period} Plan
                  </span>
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                      plan.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {plan.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-2 text-2xl font-bold text-[#0B3D2E] tabular-nums">
                  ETB {plan.amountEtb.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    / {plan.period === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                {plan.description && (
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeletingPlan(plan)}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPlan ? 'Edit Contribution Plan' : 'Create Contribution Plan'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Professional Monthly Dues"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cadence / Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PaymentPeriod)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amountEtb}
                    onChange={(e) => setAmountEtb(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 tabular-nums font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of member tier eligibility..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-semibold text-slate-700">Active (Visible for payments)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white font-semibold hover:bg-[#14573F] transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingPlan && (
        <ConfirmModal
          isOpen={true}
          title={`Delete ${deletingPlan.name}?`}
          message="Are you sure you want to delete this contribution plan? This will not alter existing historical payment records."
          confirmLabel="Delete Plan"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
}
