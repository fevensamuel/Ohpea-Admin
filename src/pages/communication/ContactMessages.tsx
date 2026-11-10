import { useState, useEffect } from 'react';
import { MessagesApi } from '@/api/messages';
import type { ContactMessageItem, MessageStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/context/ToastContext';
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  X,
} from 'lucide-react';

export function ContactMessages() {
  const toast = useToast();
  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 10);
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | ''>('');
  const [loading, setLoading] = useState(true);

  // Active message inspection modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await MessagesApi.list({
        status: statusFilter || undefined,
        page,
        pageSize,
      });
      setMessages(res.data);
      updateMeta(res.meta);
    } catch {
      toast.error('Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize, statusFilter]);

  const handleUpdateStatus = async (id: string, status: MessageStatus) => {
    try {
      const updated = await MessagesApi.updateStatus(id, status);
      toast.success(`Message status marked as ${status.replace('_', ' ')}.`);
      if (selectedMessage?.id === id) {
        setSelectedMessage(updated);
      }
      fetchMessages();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusMap: Record<MessageStatus, { label: string; color: string }> = {
    new: { label: 'New Inquiry', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    read: { label: 'Read / Viewed', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    resolved: { label: 'Resolved', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Public Contact Inquiries &amp; Messages
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inbound inquiries from visitors, hotel managers, and potential corporate affiliates.
          </p>
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as MessageStatus | '');
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="new">New Inquiries</option>
            <option value="read">Read</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Messages List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving inbox..." />
        ) : messages.length === 0 ? (
          <EmptyState title="No contact messages found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Sender</th>
                  <th className="py-3 px-3 font-semibold">Subject &amp; Snippet</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Date Received</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === 'new') {
                        handleUpdateStatus(msg.id, 'read');
                      }
                    }}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      msg.status === 'new' ? 'bg-emerald-50/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-slate-900">{msg.fullName}</p>
                      <p className="text-2xs text-slate-400 font-normal">{msg.email}</p>
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <p className="text-slate-900 truncate">{msg.subject}</p>
                      <p className="text-2xs text-slate-500 font-normal truncate">{msg.message}</p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-2xs font-bold border ${
                          statusMap[msg.status]?.color || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusMap[msg.status]?.label || msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === 'new') handleUpdateStatus(msg.id, 'read');
                          }}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {msg.status !== 'resolved' ? (
                          <button
                            onClick={() => handleUpdateStatus(msg.id, 'resolved')}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-2xs"
                          >
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(msg.id, 'in_progress')}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-2xs"
                          >
                            Re-open
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

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B3D2E]" />
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p>
                  <strong>From:</strong> {selectedMessage.fullName} (
                  <a href={`mailto:${selectedMessage.email}`} className="text-[#14573F] hover:underline">
                    {selectedMessage.email}
                  </a>
                  )
                </p>
                {selectedMessage.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedMessage.phone}
                  </p>
                )}
                <p className="text-slate-500 tabular-nums">
                  <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-2xs mb-2">
                  Message Content
                </h4>
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status transition buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['new', 'read', 'in_progress', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedMessage.id, st)}
                      className={`px-2.5 py-1 rounded text-2xs font-semibold capitalize border ${
                        selectedMessage.status === st
                          ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
