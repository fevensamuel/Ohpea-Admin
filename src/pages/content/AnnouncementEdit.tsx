import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnnouncementsApi } from '@/api/announcements';
import { ApiError, type AnnouncementType, type AnnouncementStatus, type LocalizedString } from '@/types/api';
import { LocalizedFields } from '@/components/forms/LocalizedFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Save, Send, Archive, Trash2 } from 'lucide-react';

export function AnnouncementEdit() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form fields
  const [type, setType] = useState<AnnouncementType>('news');
  const [status, setStatus] = useState<AnnouncementStatus>('draft');
  const [title, setTitle] = useState<LocalizedString>({ en: '', om: '', am: '' });
  const [summary, setSummary] = useState<LocalizedString>({ en: '', om: '', am: '' });
  const [body, setBody] = useState<LocalizedString>({ en: '', om: '', am: '' });
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [externalLink, setExternalLink] = useState('');

  useEffect(() => {
    if (!isEditing || !id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const item = await AnnouncementsApi.get(id);
        setType(item.type);
        setStatus(item.status);
        setTitle(item.title || { en: '', om: '', am: '' });
        setSummary(item.summary || { en: '', om: '', am: '' });
        setBody(item.body || { en: '', om: '', am: '' });
        setOrganization(item.organization || '');
        setLocation(item.location || '');
        setDeadline(item.deadline ? item.deadline.slice(0, 16) : '');
        setExternalLink(item.externalLink || '');
      } catch {
        toast.error('Failed to load announcement');
        navigate('/content/announcements');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing, navigate, toast]);

  const handleSubmit = async (targetStatus?: AnnouncementStatus) => {
    if (!title.en.trim()) {
      toast.error('English title is required');
      return;
    }

    setFieldErrors({});

    try {
      setSaving(true);
      const payload = {
        type,
        status: targetStatus || status,
        title,
        summary,
        body,
        organization: organization.trim() || undefined,
        location: location.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        externalLink: externalLink.trim() || undefined,
      };

      if (isEditing && id) {
        await AnnouncementsApi.update(id, payload);
        toast.success('Announcement updated successfully.');
      } else {
        await AnnouncementsApi.create(payload);
        toast.success('Announcement drafted successfully.');
      }
      navigate('/content/announcements');
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving announcement..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/content/announcements')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Announcements</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white text-xs font-semibold hover:bg-[#14573F] transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-[#C9A24A]" />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {isEditing ? 'Edit Announcement Post' : 'Compose New Announcement'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Content publishes simultaneously across the public portal in English, Afaan Oromoo, and Amharic.
          </p>
        </div>

        {/* Classification grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Category <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
            >
              <option value="news">News &amp; Press Release</option>
              <option value="event">Summit, Conference &amp; Event</option>
              <option value="vacancy">Job Vacancy &amp; Career Opportunity</option>
              <option value="proposal">RFP &amp; Project Proposal</option>
              <option value="research">Tourism &amp; Eco-Study Research</option>
            </select>
            {fieldErrors.type && <p className="text-2xs text-red-600 mt-1">{fieldErrors.type}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Live Publicly)</option>
              <option value="archived">Archived (Stored in records)</option>
            </select>
            {fieldErrors.status && <p className="text-2xs text-red-600 mt-1">{fieldErrors.status}</p>}
          </div>
        </div>

        {/* Multilingual Title (EN | OM | AM) */}
        <div>
          <LocalizedFields
            label="Headline Title"
            value={title}
            onChange={setTitle}
            required={true}
            placeholder={{
              en: 'e.g. 2nd Annual Oromia Hospitality & Tourism Summit 2026',
              om: 'e.g. Yaa’ii Waggaa 2ffaa Tuuriizimii fi Hoteelaa Oromiyaa',
              am: 'e.g. 2ኛው ዓመታዊ የኦሮሚያ ሆስፒታሊቲ እና ቱሪዝም ጉባኤ',
            }}
          />
          {(fieldErrors.title || fieldErrors['title.en']) && (
            <p className="text-2xs text-red-600 mt-1">{fieldErrors.title || fieldErrors['title.en']}</p>
          )}
        </div>

        {/* Multilingual Summary (EN | OM | AM) */}
        <LocalizedFields
          label="Executive Summary / Lead Paragraph"
          value={summary}
          onChange={setSummary}
          multiline={true}
          rows={2}
          placeholder={{
            en: 'Brief 2-3 sentence overview for news card preview and social cards...',
            om: 'Gabaasa gabaabaa beeksisaaf ta’u...',
            am: 'አጭር ማጠቃለያ...',
          }}
        />

        {/* Multilingual Full Body (EN | OM | AM) */}
        <LocalizedFields
          label="Full Notice Description &amp; Terms"
          value={body}
          onChange={setBody}
          multiline={true}
          rows={6}
          placeholder={{
            en: 'Detailed agenda, qualifications, requirements, or submission guidelines...',
            om: 'Bal’ina waraqaa waamichaa fi ulaagaalee...',
            am: 'ሙሉ ዝርዝር መረጃና መመዘኛዎች...',
          }}
        />

        {/* Logistics & Meta Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Host Organization / Desk
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. OHPEA Executive Council / Oromia Tourism Bureau"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Aba Gada Hall, Adama or Finfinnee"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deadline / Event Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 tabular-nums"
            />
            {fieldErrors.deadline && <p className="text-2xs text-red-600 mt-1">{fieldErrors.deadline}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              External Registration / Application Link
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-2xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/content/announcements')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className="px-4 py-2 bg-[#0B3D2E] text-white text-xs font-semibold rounded-lg hover:bg-[#14573F] transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
