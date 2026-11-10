import { useState, useEffect } from 'react';
import { SettingsApi } from '@/api/settings';
import { ApiError } from '@/types/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { Mail, Save, Phone, MapPin, Clock } from 'lucide-react';

interface ContactSettingsData {
  phonePrimary: string;
  phoneSecondary: string;
  emailGeneral: string;
  emailSupport: string;
  address: string;
  workingHours: string;
  mapCoordinates: string;
}

export function ContactSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [contact, setContact] = useState<ContactSettingsData>({
    phonePrimary: '',
    phoneSecondary: '',
    emailGeneral: '',
    emailSupport: '',
    address: '',
    workingHours: '',
    mapCoordinates: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await SettingsApi.get<ContactSettingsData>('contact');
        if (data) setContact(data);
      } catch {
        toast.error('Failed to load contact information');
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
      await SettingsApi.update('contact', contact);
      toast.success('Official contact information and office location saved.');
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving headquarters contact..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0B3D2E]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Headquarters &amp; Contact Information
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central liaison numbers, support emails, office hours, and Finfinnee location.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#14573F]" />
            Telephone &amp; Email Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Hotline</label>
              <input
                type="text"
                value={contact.phonePrimary}
                onChange={(e) => setContact({ ...contact, phonePrimary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums"
                required
              />
              {fieldErrors.phonePrimary && <p className="text-2xs text-red-600 mt-1">{fieldErrors.phonePrimary}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Secondary Mobile</label>
              <input
                type="text"
                value={contact.phoneSecondary}
                onChange={(e) => setContact({ ...contact, phoneSecondary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums"
              />
              {fieldErrors.phoneSecondary && <p className="text-2xs text-red-600 mt-1">{fieldErrors.phoneSecondary}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">General Inquiries Email</label>
              <input
                type="email"
                value={contact.emailGeneral}
                onChange={(e) => setContact({ ...contact, emailGeneral: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
                required
              />
              {fieldErrors.emailGeneral && <p className="text-2xs text-red-600 mt-1">{fieldErrors.emailGeneral}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Member Support Desk Email</label>
              <input
                type="email"
                value={contact.emailSupport}
                onChange={(e) => setContact({ ...contact, emailSupport: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
              {fieldErrors.emailSupport && <p className="text-2xs text-red-600 mt-1">{fieldErrors.emailSupport}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#14573F]" />
            Physical Headquarters &amp; Operating Hours
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Street Address</label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
              required
            />
            {fieldErrors.address && <p className="text-2xs text-red-600 mt-1">{fieldErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Working Hours</label>
              <input
                type="text"
                value={contact.workingHours}
                onChange={(e) => setContact({ ...contact, workingHours: e.target.value })}
                placeholder="e.g. Monday - Friday: 8:30 AM - 5:30 PM (EAT)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
              {fieldErrors.workingHours && <p className="text-2xs text-red-600 mt-1">{fieldErrors.workingHours}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Map Coordinates (Lat, Long)</label>
              <input
                type="text"
                value={contact.mapCoordinates}
                onChange={(e) => setContact({ ...contact, mapCoordinates: e.target.value })}
                placeholder="9.0012, 38.7891"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-2xs"
              />
              {fieldErrors.mapCoordinates && <p className="text-2xs text-red-600 mt-1">{fieldErrors.mapCoordinates}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B3D2E] text-white hover:bg-[#14573F] transition-colors shadow-2xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C9A24A]" />
            <span>{saving ? 'Saving...' : 'Save Contact Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
