import { useState, useEffect } from 'react';
import { AuditApi } from '@/api/audit';
import { text } from '@/lib/normalize';
import type { AuditLogItem } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/context/ToastContext';
import { History } from 'lucide-react';

const fmtDateTime = (d: unknown): string => {
  if (!d) return '—';
  const dt = new Date(String(d));
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleString();
};

export function AuditLogs() {
  const toast = useToast();
  const { page, pageSize, meta, setPage, setPageSize, updateMeta } = usePagination(1, 15);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await AuditApi.list({ page, pageSize });
      setLogs(Array.isArray(res?.data) ? res.data : []);
      updateMeta(res?.meta);
    } catch {
      toast.error('Failed to load system audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              System Audit Trail &amp; Access Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all administrative actions, member approvals, status overrides, and financial entries.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving security audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState title="No audit entries recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp (EAT)</th>
                  <th className="py-3 px-3 font-semibold">Administrator</th>
                  <th className="py-3 px-3 font-semibold">Action</th>
                  <th className="py-3 px-3 font-semibold">Entity &amp; ID</th>
                  <th className="py-3 px-3 font-semibold">Details</th>
                  <th className="py-3 px-4 font-semibold text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-500">
                      {fmtDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {text(log.adminName) || 'System'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-2xs px-2 py-0.5 rounded bg-slate-100 text-[#0B3D2E] border border-slate-200">
                        {text(log.action) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {text(log.entity)}
                      {log.entityId && (
                        <code className="text-2xs text-slate-400 ml-1">({text(log.entityId)})</code>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-sm truncate">
                      {text(log.details) || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-2xs text-slate-400">
                      {text(log.ipAddress) || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
    </div>
  );
}