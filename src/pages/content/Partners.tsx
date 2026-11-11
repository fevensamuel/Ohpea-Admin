import { useState, useEffect } from 'react';
import { PartnersApi } from '@/api/partners';
import { ApiError, type PartnerItem } from '@/types/api';
import { text } from '@/lib/normalize';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { Handshake, Plus, Edit2, Trash2, Globe, X } from 'lucide-react';

export function Partners() {
  const toast = useToast();
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Government Authority');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingPartner, setDeletingPartner] = useState<PartnerItem | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await PartnersApi.list();
      const list = Array.isArray(res) ? res : [];
      setPartners(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openCreate = () => {
    setEditingPartner(null);
    setName('');
    setType('Government Authority');
    setWebsite('');
    setModalOpen(true);
  };

  const openEdit = (p: PartnerItem) => {
    setEditingPartner(p);
    setName(text(p.name));
    setType(text(p.type) || 'Government Authority');
    setWebsite(text(p.website));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!name.trim()) {
      toast.error('Partner institution name is required');
      return;
    }
    try {
      setSaving(true);
      if (editingPartner) {
        await PartnersApi.update(editingPartner.id, {
          name: name.trim(),
          type,
          website: website.trim() || undefined,
        });
        toast.success(`Partner "${name}" updated.`);
      } else {
        await PartnersApi.create({
          name: name.trim(),
          type,
          website: website.trim() || undefined,
          order: partners.length + 1,
        });
        toast.success(`Partner "${name}" added.`);
      }
      setModalOpen(false);
      fetchPartners();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPartner) return;
    try {
      await PartnersApi.delete(deletingPartner.id);
      toast.success(`Removed partner "${text(deletingPartner.name)}".`);
      setDeletingPartner(null);
      fetchPartners();
    } catch {
      toast.error('Failed to remove partner');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Institutional Partners &amp; Alliances
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Culture and Tourism, Oromia Tourism Bureau, Siinqee Bank, and technical hubs.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4 text-[#C9A24A]" />
          <span>Add Partner</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading partners..." />
      ) : partners.length === 0 ? (
        <EmptyState title="No partners configured" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((partner) => {
            const partnerName = text(partner.name) || '(unnamed)';
            return (
              <div
                key={partner.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0B3D2E]/10 text-[#0B3D2E] font-bold text-xs flex items-center justify-center mb-3">
                    {partnerName.charAt(0).toUpperCase() || '?'}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{partnerName}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-700">
                    {text(partner.type) || 'Partner'}
                  </span>

                  {partner.website && (
                    <a
                      href={text(partner.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 text-xs text-[#14573F] hover:underline flex items-center gap-1 font-mono text-2xs truncate"
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {text(partner.website).replace('https://', '')}
                      </span>
                    </a>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEdit(partner)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingPartner(partner)}
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
                {editingPartner ? 'Edit Partner' : 'Add Strategic Partner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Partner / Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siinqee Bank S.C."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  required
                />
                {fieldErrors.name && <p className="text-2xs text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliation Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                >
                  <option value="Government Authority">Government Authority / Ministry</option>
                  <option value="Financial & Banking Partner">Financial &amp; Banking Partner</option>
                  <option value="Hospitality Association">Hospitality Association / Chamber</option>
                  <option value="Academic Institution">Academic Institution / University</option>
                  <option value="Technology Partner">Technology Partner</option>
                </select>
                {fieldErrors.type && <p className="text-2xs text-red-600 mt-1">{fieldErrors.type}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-2xs"
                />
                {fieldErrors.website && <p className="text-2xs text-red-600 mt-1">{fieldErrors.website}</p>}
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
                  {saving ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingPartner && (
        <ConfirmModal
          isOpen={true}
          title={`Remove ${text(deletingPartner.name) || 'partner'}?`}
          message="Are you sure you want to remove this partner from the alliance index?"
          confirmLabel="Remove Partner"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingPartner(null)}
        />
      )}
    </div>
  );
}