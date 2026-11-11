import { useState, useEffect } from 'react';
import { ActivitiesApi } from '@/api/activities';
import { ApiError, type ActivityItem } from '@/types/api';
import { text } from '@/lib/normalize';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { CalendarCheck, Plus, Edit2, Trash2, MapPin, Eye, EyeOff, X } from 'lucide-react';

const fmtDate = (d: unknown): string => {
  if (!d) return '—';
  const dt = new Date(String(d));
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString();
};

/** Handle both `{en, om, am}` objects and plain strings */
function fromLocalized(v: any, field: 'en' | 'om' | 'am' = 'en'): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return text(v[field]) || text(v.en) || text(v.om) || text(v.am);
  return String(v);
}

export function Activities() {
  const toast = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingActivity, setDeletingActivity] = useState<ActivityItem | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await ActivitiesApi.list();
      setActivities(Array.isArray(res) ? res : []);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const openCreate = () => {
    setEditingActivity(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setLocation('');
    setIsPublic(true);
    setModalOpen(true);
  };

  const openEdit = (act: ActivityItem) => {
    setEditingActivity(act);
    setTitle(fromLocalized(act.title, 'en'));
    setDescription(fromLocalized((act as any).description, 'en'));
    // date may be stored as ISO with time — trim to YYYY-MM-DD for <input type="date">
    const rawDate = text(act.date);
    setDate(rawDate ? rawDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setLocation(fromLocalized((act as any).location, 'en'));
    setIsPublic(!!act.isPublic);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      setSaving(true);
      if (editingActivity) {
        await ActivitiesApi.update(editingActivity.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          location: location.trim() || undefined,
          isPublic,
        });
        toast.success('Activity updated.');
      } else {
        await ActivitiesApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          location: location.trim() || undefined,
          isPublic,
        });
        toast.success('New activity added to public feed.');
      }
      setModalOpen(false);
      fetchActivities();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingActivity) return;
    try {
      await ActivitiesApi.delete(deletingActivity.id);
      toast.success('Activity deleted.');
      setDeletingActivity(null);
      fetchActivities();
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Public Activities &amp; Field Work Feed
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish completed association workshops, hotel audits, and park inspections.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>Log Activity</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading activities..." />
      ) : activities.length === 0 ? (
        <EmptyState title="No public activities logged yet" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {activities.map((act) => {
            const titleStr = fromLocalized(act.title, 'en');
            const descStr = fromLocalized((act as any).description, 'en');
            const locStr = fromLocalized((act as any).location, 'en');
            return (
              <div
                key={act.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {titleStr || '(untitled)'}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold ${
                        act.isPublic
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {act.isPublic ? 'Public' : 'Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 tabular-nums">
                    <span>{fmtDate(act.date)}</span>
                    {locStr && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {locStr}
                      </span>
                    )}
                  </div>

                  {descStr && (
                    <p className="text-slate-600 mt-1 max-w-2xl">{descStr}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(act)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingActivity(act)}
                    className="p-1.5 text-red-500 hover:text-red-700 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingActivity ? 'Edit Activity' : 'Log Field Activity'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Adama Hotel Staff Quality Audit Workshop"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  required
                />
                {fieldErrors.title && <p className="text-2xs text-red-600 mt-1">{fieldErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                  {fieldErrors.date && <p className="text-2xs text-red-600 mt-1">{fieldErrors.date}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Adama, Bale, Jimma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                  {fieldErrors.location && <p className="text-2xs text-red-600 mt-1">{fieldErrors.location}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of outcomes and participant impact..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
                {fieldErrors.description && <p className="text-2xs text-red-600 mt-1">{fieldErrors.description}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-semibold text-slate-700">Display on Public Activity Timeline</span>
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
                  {saving ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingActivity && (
        <ConfirmModal
          isOpen={true}
          title={`Delete activity "${fromLocalized(deletingActivity.title, 'en') || 'this activity'}"?`}
          message="Are you sure you want to delete this activity log from the public feed?"
          confirmLabel="Delete Activity"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingActivity(null)}
        />
      )}
    </div>
  );
}