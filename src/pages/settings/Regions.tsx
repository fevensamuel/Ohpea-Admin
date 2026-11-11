import { useState, useEffect } from 'react';
import { RegionsApi } from '@/api/regions';
import { localized } from '@/lib/i18n';
import { ApiError, type RegionItem } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/context/ToastContext';
import { MapPin, Plus, Edit2, CheckCircle2, X } from 'lucide-react';

export function Regions() {
  const toast = useToast();
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<RegionItem | null>(null);
  const [name, setName] = useState('');
  const [nameOm, setNameOm] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [code, setCode] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const list = await RegionsApi.list();
      setRegions(list);
    } catch {
      toast.error('Failed to load regional branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const openCreate = () => {
    setEditingRegion(null);
    setName('');
    setNameOm('');
    setNameAm('');
    setCode('');
    setActive(true);
    setModalOpen(true);
  };

  const openEdit = (r: RegionItem) => {
    setEditingRegion(r);
    setName(localized(r.name));
    setNameOm(localized(r.nameOm, 'om'));
    setNameAm(localized(r.nameAm, 'am'));
    setCode(r.code);
    setActive(r.active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!name.trim() || !code.trim()) {
      toast.error('Region name and 3-letter code are required');
      return;
    }

    try {
      setSaving(true);
      if (editingRegion) {
        await RegionsApi.update(editingRegion.id, {
          name: name.trim(),
          nameOm: nameOm.trim() || undefined,
          nameAm: nameAm.trim() || undefined,
          code: code.trim().toUpperCase(),
          active,
        });
        toast.success(`Regional branch "${name}" updated.`);
      } else {
        await RegionsApi.create({
          name: name.trim(),
          nameOm: nameOm.trim() || undefined,
          nameAm: nameAm.trim() || undefined,
          code: code.trim().toUpperCase(),
          active,
        });
        toast.success(`Regional branch "${name}" created.`);
      }
      setModalOpen(false);
      fetchRegions();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save regional branch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Regional Branches &amp; Clusters
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zonal tourism desks and administrative clusters across Oromia region.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>Add Regional Branch</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading regional desks..." />
        ) : regions.length === 0 ? (
          <EmptyState title="No regions configured" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Cluster Code</th>
                  <th className="py-3 px-3 font-semibold">Branch Name (English)</th>
                  <th className="py-3 px-3 font-semibold">Afaan Oromoo</th>
                  <th className="py-3 px-3 font-semibold">Amharic</th>
                  <th className="py-3 px-3 font-semibold text-right">Enrolled Members</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {localized(r.name)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {localized(r.nameOm, 'om') || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {localized(r.nameAm, 'am') || '-'}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-800">
                      {r.memberCount || 0}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                          r.active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded"
                        title="Edit region"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingRegion ? 'Edit Regional Branch' : 'Add Regional Branch'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SHG"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-center uppercase"
                    required
                  />
                  {fieldErrors.code && <p className="text-2xs text-red-600 mt-1">{fieldErrors.code}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Branch Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sheger & Finfinnee Area"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                  {fieldErrors.name && <p className="text-2xs text-red-600 mt-1">{fieldErrors.name}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name in Afaan Oromoo</label>
                <input
                  type="text"
                  value={nameOm}
                  onChange={(e) => setNameOm(e.target.value)}
                  placeholder="Magaalaa Sheger fi Finfinnee"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
                {fieldErrors.nameOm && <p className="text-2xs text-red-600 mt-1">{fieldErrors.nameOm}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name in Amharic</label>
                <input
                  type="text"
                  value={nameAm}
                  onChange={(e) => setNameAm(e.target.value)}
                  placeholder="ሸገር እና ፊንፊኔ ዙሪያ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
                {fieldErrors.nameAm && <p className="text-2xs text-red-600 mt-1">{fieldErrors.nameAm}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span className="font-semibold text-slate-700">Active Regional Branch</span>
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
                  {saving ? 'Saving...' : 'Save Region'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
