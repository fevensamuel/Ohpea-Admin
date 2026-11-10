import { useState, useEffect } from 'react';
import { ObjectivesApi } from '@/api/objectives';
import { ApiError, type ObjectiveItem } from '@/types/api';
import { LocalizedFields } from '@/components/forms/LocalizedFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { Compass, Plus, Edit2, Trash2, X } from 'lucide-react';

export function Objectives() {
  const toast = useToast();
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ObjectiveItem | null>(null);
  const [category, setCategory] = useState<'General' | 'Official' | 'Main' | 'Specific'>('General');
  const [title, setTitle] = useState({ en: '', om: '', am: '' });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingItem, setDeletingItem] = useState<ObjectiveItem | null>(null);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const res = await ObjectivesApi.list();
      setObjectives(res);
    } catch {
      toast.error('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setCategory('General');
    setTitle({ en: '', om: '', am: '' });
    setModalOpen(true);
  };

  const openEdit = (obj: ObjectiveItem) => {
    setEditingItem(obj);
    setCategory(obj.category);
    setTitle(obj.title);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title.en.trim()) {
      toast.error('English objective title is required');
      return;
    }
    try {
      setSaving(true);
      if (editingItem) {
        await ObjectivesApi.update(editingItem.id, { category, title });
        toast.success('Objective statement updated.');
      } else {
        await ObjectivesApi.create({
          category,
          order: objectives.length + 1,
          title,
        });
        toast.success('New objective added.');
      }
      setModalOpen(false);
      fetchObjectives();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save objective');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await ObjectivesApi.delete(deletingItem.id);
      toast.success('Objective statement removed.');
      setDeletingItem(null);
      fetchObjectives();
    } catch {
      toast.error('Failed to delete objective');
    }
  };

  const categories = ['General', 'Official', 'Main', 'Specific'] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Association Objectives &amp; Mandates
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grouped by legal constitution: General, Official, Main, and Specific Objectives.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>Add Objective</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving objectives..." />
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const list = objectives.filter((o) => o.category === cat);
            if (list.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {cat} Objectives ({list.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {list.map((obj, i) => (
                    <div
                      key={obj.id}
                      className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#14573F]/10 text-[#0B3D2E] font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 leading-relaxed">
                            {obj.title.en}
                          </p>
                          {obj.title.om && (
                            <p className="text-slate-600 font-medium">{obj.title.om}</p>
                          )}
                          {obj.title.am && <p className="text-slate-500">{obj.title.am}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openEdit(obj)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(obj)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? 'Edit Objective' : 'New Objective Statement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Objective Classification
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                >
                  <option value="General">General Objective</option>
                  <option value="Official">Official Mandate</option>
                  <option value="Main">Main Association Objective</option>
                  <option value="Specific">Specific Operational Objective</option>
                </select>
                {fieldErrors.category && <p className="text-2xs text-red-600 mt-1">{fieldErrors.category}</p>}
              </div>

              <div>
                <LocalizedFields
                  label="Objective Statement"
                  value={title}
                  onChange={setTitle}
                  multiline={true}
                  rows={3}
                  required={true}
                />
                {(fieldErrors.title || fieldErrors['title.en']) && (
                  <p className="text-2xs text-red-600 mt-1">{fieldErrors.title || fieldErrors['title.en']}</p>
                )}
              </div>

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
                  {saving ? 'Saving...' : 'Save Objective'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deletingItem && (
        <ConfirmModal
          isOpen={true}
          title="Delete Objective Statement?"
          message="Are you sure you want to delete this constitutional objective from the records?"
          confirmLabel="Delete Objective"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}
