import { useState, useEffect } from 'react';
import { SubscribersApi } from '@/api/subscribers';
import type { SubscriberItem } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ExportButton } from '@/components/common/ExportButton';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/context/ToastContext';
import { Mail, Trash2 } from 'lucide-react';

export function Subscribers() {
  const toast = useToast();
  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 10);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSubscriber, setDeletingSubscriber] = useState<SubscriberItem | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await SubscribersApi.list({ page, pageSize });
      setSubscribers(res.data);
      updateMeta(res.meta);
    } catch {
      toast.error('Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!deletingSubscriber) return;
    try {
      await SubscribersApi.delete(deletingSubscriber.id);
      toast.success(`Removed ${deletingSubscriber.email} from mailing list.`);
      setDeletingSubscriber(null);
      fetchSubscribers();
    } catch {
      toast.error('Failed to remove subscriber');
    }
  };

  const handleExport = async (): Promise<Blob> => {
    const csv =
      'Email,Status,SubscribedAt\n' +
      subscribers
        .map((s) => `"${s.email}","${s.active ? 'Active' : 'Unsubscribed'}","${s.subscribedAt}"`)
        .join('\n');
    return new Blob([csv], { type: 'text/csv' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Newsletter &amp; Bulletin Subscribers
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Opt-in subscribers receiving hospitality industry digests, events, and circulars.
          </p>
        </div>

        <ExportButton
          onExport={handleExport}
          filename="OHPEA-Subscribers.csv"
          label="Export Subscriber CSV"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading subscribers..." />
        ) : subscribers.length === 0 ? (
          <EmptyState title="No subscribers registered yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subscriber Email</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Subscription Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-slate-500">
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeletingSubscriber(s)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>

      {deletingSubscriber && (
        <ConfirmModal
          isOpen={true}
          title="Unsubscribe User?"
          message={`Are you sure you want to remove ${deletingSubscriber.email} from the mailing distribution list?`}
          confirmLabel="Unsubscribe"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingSubscriber(null)}
        />
      )}
    </div>
  );
}
