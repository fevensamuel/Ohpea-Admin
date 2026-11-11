import { useState, useEffect } from 'react';
import { LookupsApi } from '@/api/lookups';
import { localized } from '@/lib/i18n';
import { ApiError, type LookupItem } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { ListFilter, Plus, X } from 'lucide-react';

type LookupType = 'sectors' | 'fields' | 'graduation-levels';

export function Lookups() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<LookupType>('sectors');
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameOm, setNameOm] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchLookups = async (type: LookupType) => {
    try {
      setLoading(true);
      const data = await LookupsApi.get(type);
      setItems(data);
    } catch {
      toast.error('Failed to load lookup categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups(activeTab);
  }, [activeTab]);

  const handleOpenCreate = () => {
    setCode('');
    setName('');
    setNameOm('');
    setNameAm('');
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!code.trim() || !name.trim()) {
      setFieldErrors({
        code: !code.trim() ? 'Taxonomy code is required' : '',
        name: !name.trim() ? 'English name is required' : '',
      });
      return;
    }

    try {
      setSaving(true);
      // Simulates creating/updating taxonomy classification
      const newItem: LookupItem = {
        id: `lkp_${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        nameOm: nameOm.trim() || undefined,
        nameAm: nameAm.trim() || undefined,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success(`Taxonomy classification "${name}" saved.`);
      setModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save lookup taxonomy');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: LookupType; label: string; desc: string }[] = [
    { id: 'sectors', label: 'Hospitality Sectors', desc: 'Hotels, tour operators, culinary, bureaus' },
    { id: 'fields', label: 'Fields of Study', desc: 'Tourism management, culinary arts, ecotourism, MICE' },
    { id: 'graduation-levels', label: 'Graduation Levels', desc: 'Doctorate, Master’s, Bachelor’s, Higher Diploma' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              System Lookups &amp; Classifications
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard taxonomy utilized during member registration and reporting audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0B3D2E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A24A]" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-2xs">
            {tabs.find((t) => t.id === activeTab)?.desc} ({items.length})
          </span>
          <span className="text-2xs text-slate-400">Standard Taxonomy</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving category lookups..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-24">Code</th>
                  <th className="py-3 px-3 font-semibold">Classification (English)</th>
                  <th className="py-3 px-3 font-semibold">Afaan Oromoo</th>
                  <th className="py-3 px-3 font-semibold">Amharic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {localized(item.name)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {localized(item.nameOm, 'om') || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {localized(item.nameAm, 'am') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Taxonomy Classification</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Taxonomy Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HTL, MICE, PHD"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono uppercase"
                  required
                />
                {fieldErrors.code && <p className="text-2xs text-red-600 mt-1">{fieldErrors.code}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classification Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hotel & Resort Management"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  required
                />
                {fieldErrors.name && <p className="text-2xs text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name in Afaan Oromoo</label>
                <input
                  type="text"
                  value={nameOm}
                  onChange={(e) => setNameOm(e.target.value)}
                  placeholder="Maqaa Afaan Oromootiin"
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
                  placeholder="ስም በአማርኛ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
                {fieldErrors.nameAm && <p className="text-2xs text-red-600 mt-1">{fieldErrors.nameAm}</p>}
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
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
