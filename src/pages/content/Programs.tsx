import { useState, useEffect } from 'react';
import { ProgramsApi } from '@/api/programs';
import { ApiError, type ProgramItem } from '@/types/api';
import { text } from '@/lib/normalize';
import { LocalizedFields } from '@/components/forms/LocalizedFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import {
  Bookmark,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export function Programs() {
  const toast = useToast();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState({ en: '', om: '', am: '' });
  const [description, setDescription] = useState({ en: '', om: '', am: '' });
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deletingProgram, setDeletingProgram] = useState<ProgramItem | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await ProgramsApi.list();
      const list = Array.isArray(res) ? res : [];
      setPrograms(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch {
      toast.error('Failed to load association programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= programs.length) return;

    const copy = [...programs];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    copy.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setPrograms([...copy]);
    try {
      await Promise.all([
        ProgramsApi.update(copy[index].id, { order: copy[index].order }),
        ProgramsApi.update(copy[targetIndex].id, { order: copy[targetIndex].order }),
      ]);
      toast.success('Program order updated');
    } catch {
      // quiet fallback
    }
  };

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setCode('PRG');
    setTitle({ en: '', om: '', am: '' });
    setDescription({ en: '', om: '', am: '' });
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProgramItem) => {
    setEditingProgram(p);
    setCode(text(p.code));
    setTitle({
      en: text(p.title?.en) || text(p.title),
      om: text(p.title?.om),
      am: text(p.title?.am),
    });
    setDescription({
      en: text(p.description?.en) || text(p.description),
      om: text(p.description?.om),
      am: text(p.description?.am),
    });
    setActive(p.active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title.en.trim()) {
      toast.error('English title is required');
      return;
    }
    try {
      setSaving(true);
      if (editingProgram) {
        await ProgramsApi.update(editingProgram.id, {
          code: code.trim(),
          title,
          description,
          active,
        });
        toast.success('Program pillar updated');
      } else {
        await ProgramsApi.create({
          code: code.trim() || 'PRG',
          icon: 'Bookmark',
          order: programs.length + 1,
          title,
          description,
          active,
        });
        toast.success('New program pillar created');
      }
      setModalOpen(false);
      fetchPrograms();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProgram) return;
    try {
      await ProgramsApi.delete(deletingProgram.id);
      toast.success(`Deleted program "${text(deletingProgram.title) || deletingProgram.id}".`);
      setDeletingProgram(null);
      fetchPrograms();
    } catch {
      toast.error('Failed to delete program');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Association Pillars &amp; Core Programs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage the institutional areas of focus shown across the public portal.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>Add Program Pillar</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving programs..." />
      ) : programs.length === 0 ? (
        <EmptyState title="No programs defined yet" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {programs.map((program, idx) => (
            <div
              key={program.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => moveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                    title="Move higher"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-500 tabular-nums">
                    #{program.order ?? idx + 1}
                  </span>
                  <button
                    onClick={() => moveOrder(idx, 'down')}
                    disabled={idx === programs.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                    title="Move lower"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {text(program.code) || '—'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {text(program.title) || '(untitled)'}
                    </h3>
                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                        program.active
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {program.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    {text(program.description)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEdit(program)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeletingProgram(program)}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProgram ? 'Edit Program Pillar' : 'New Program Pillar'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pillar Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CPD, ECO, STD"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  required
                />
                {fieldErrors.code && <p className="text-2xs text-red-600 mt-1">{fieldErrors.code}</p>}
              </div>

              <div>
                <LocalizedFields
                  label="Pillar Title"
                  value={title}
                  onChange={setTitle}
                  required={true}
                />
                {(fieldErrors.title || fieldErrors['title.en']) && (
                  <p className="text-2xs text-red-600 mt-1">
                    {fieldErrors.title || fieldErrors['title.en']}
                  </p>
                )}
              </div>

              <LocalizedFields
                label="Pillar Description"
                value={description}
                onChange={setDescription}
                multiline={true}
                rows={3}
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-semibold text-slate-700">Display on Public Website</span>
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
                  {saving ? 'Saving...' : 'Save Pillar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingProgram && (
        <ConfirmModal
          isOpen={true}
          title={`Delete "${text(deletingProgram.title) || 'this program'}"?`}
          message="Are you sure you want to remove this pillar from the association programs list?"
          confirmLabel="Delete Pillar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProgram(null)}
        />
      )}
    </div>
  );
}