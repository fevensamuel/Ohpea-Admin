import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnnouncementsApi } from '@/api/announcements';
import type { AnnouncementItem, AnnouncementType, AnnouncementStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import {
  FileText,
  Plus,
  Eye,
  Edit2,
  Archive,
  Send,
  Trash2,
  Calendar,
  MapPin,
  X,
  ExternalLink,
} from 'lucide-react';

export function Announcements() {
  const navigate = useNavigate();
  const toast = useToast();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const list = await AnnouncementsApi.list({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setAnnouncements(list);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [typeFilter, statusFilter]);

  const handlePublish = async (id: string, title: string) => {
    try {
      await AnnouncementsApi.publish(id);
      toast.success(`"${title}" is now published publicly.`);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to publish announcement');
    }
  };

  const handleArchive = async (id: string, title: string) => {
    try {
      await AnnouncementsApi.archive(id);
      toast.success(`"${title}" has been archived.`);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to archive announcement');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await AnnouncementsApi.delete(deletingItem.id);
      toast.success(`Deleted announcement "${deletingItem.title.en}".`);
      setDeletingItem(null);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const typeColorMap: Record<AnnouncementType, string> = {
    news: 'bg-blue-50 text-blue-800 border-blue-200',
    event: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    vacancy: 'bg-amber-50 text-amber-800 border-amber-200',
    proposal: 'bg-purple-50 text-purple-800 border-purple-200',
    research: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Announcements, Vacancies &amp; Events CMS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish official updates, job postings, tourism summits, and research RFPs.
          </p>
        </div>

        <button
          onClick={() => navigate('/content/announcements/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-slate-500">Filter by Type:</span>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="news">News</option>
          <option value="event">Events</option>
          <option value="vacancy">Vacancies &amp; Jobs</option>
          <option value="proposal">Proposals (RFP)</option>
          <option value="research">Research Studies</option>
        </select>

        <span className="font-semibold text-slate-500 ml-2">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </select>

        {(typeFilter || statusFilter) && (
          <button
            onClick={() => {
              setTypeFilter('');
              setStatusFilter('');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No announcements match filter criteria"
            action={
              <button
                onClick={() => navigate('/content/announcements/new')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3D2E] rounded-lg"
              >
                Create Announcement
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title (English / Oromo / Amharic)</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Deadline / Event</th>
                  <th className="py-3 px-3 font-semibold">Published At</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900 truncate">{item.title.en}</p>
                      <p className="text-2xs text-slate-500 truncate">{item.summary.en}</p>
                      <div className="mt-1 flex items-center gap-2 text-2xs text-slate-400">
                        {item.organization && <span>{item.organization}</span>}
                        {item.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider border ${
                          typeColorMap[item.type] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold capitalize ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums text-slate-600">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums text-slate-500">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : 'Unpublished'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
                          title="Preview in public layout"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/content/announcements/edit/${item.id}`)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
                          title="Edit announcement"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {item.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(item.id, item.title.en)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md"
                            title="Publish immediately"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {item.status === 'published' && (
                          <button
                            onClick={() => handleArchive(item.id, item.title.en)}
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded-md"
                            title="Archive post"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Public Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                Public Site Reader View
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <span
                  className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${
                    typeColorMap[previewItem.type]
                  }`}
                >
                  {previewItem.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{previewItem.title.en}</h3>
                <p className="text-xs font-semibold text-emerald-800">{previewItem.title.om}</p>
                <p className="text-xs text-slate-600">{previewItem.title.am}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600">
                {previewItem.organization && (
                  <p>
                    <strong>Host / Org:</strong> {previewItem.organization}
                  </p>
                )}
                {previewItem.location && (
                  <p>
                    <strong>Location:</strong> {previewItem.location}
                  </p>
                )}
                {previewItem.deadline && (
                  <p>
                    <strong>Deadline / Event Date:</strong>{' '}
                    {new Date(previewItem.deadline).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Summary</h4>
                <p className="text-slate-700 leading-relaxed">{previewItem.summary.en}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Full Notice</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {previewItem.body.en}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-[#0B3D2E] text-white rounded-lg font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmModal
          isOpen={true}
          title={`Delete "${deletingItem.title.en}"?`}
          message="Are you sure you want to permanently delete this announcement? This action will remove it from the public website."
          confirmLabel="Delete Notice"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}
