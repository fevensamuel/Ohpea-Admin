import { useState, useEffect } from 'react';
import { SettingsApi } from '@/api/settings';
import { ApiError } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { Sliders, Save, Building, ShieldCheck } from 'lucide-react';

interface BrandingSettings {
  orgName: string;
  orgNameOm: string;
  tagline: string;
  mission: string;
  vision: string;
  supportEmail: string;
  supportPhone: string;
}

export function SiteSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<BrandingSettings>({
    orgName: '',
    orgNameOm: '',
    tagline: '',
    mission: '',
    vision: '',
    supportEmail: '',
    supportPhone: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await SettingsApi.get<BrandingSettings>('branding');
        if (data) setSettings(data);
      } catch {
        toast.error('Failed to load branding settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      setSaving(true);
      await SettingsApi.update('branding', settings);
      toast.success('Site branding and mission statements updated successfully.');
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading site parameters..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Site &amp; Organizational Branding
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global association name, Oromo title, tagline, mission, and public portal identity.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-[#14573F]" />
            Association Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Name (English)
              </label>
              <input
                type="text"
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                required
              />
              {fieldErrors.orgName && <p className="text-2xs text-red-600 mt-1">{fieldErrors.orgName}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Name (Afaan Oromoo)
              </label>
              <input
                type="text"
                value={settings.orgNameOm}
                onChange={(e) => setSettings({ ...settings, orgNameOm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                required
              />
              {fieldErrors.orgNameOm && <p className="text-2xs text-red-600 mt-1">{fieldErrors.orgNameOm}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            {fieldErrors.tagline && <p className="text-2xs text-red-600 mt-1">{fieldErrors.tagline}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#14573F]" />
            Mission &amp; Vision Statements
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mission Statement</label>
            <textarea
              rows={3}
              value={settings.mission}
              onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            {fieldErrors.mission && <p className="text-2xs text-red-600 mt-1">{fieldErrors.mission}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vision Statement</label>
            <textarea
              rows={3}
              value={settings.vision}
              onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            {fieldErrors.vision && <p className="text-2xs text-red-600 mt-1">{fieldErrors.vision}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C9A24A]" />
            <span>{saving ? 'Saving...' : 'Save Branding Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
