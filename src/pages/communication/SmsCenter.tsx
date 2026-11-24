import { useEffect, useState } from 'react';
import { SmsApi } from '@/api/sms';
import type { SmsCampaignItem, SmsLogItem } from '@/types/api';
import { MessageSquare, ShieldAlert, Send, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

type SmsStatus = { configured: boolean; enabled: boolean; provider: string; featureEnabled: boolean; message: string };

export function SmsCenter() {
  const toast = useToast();
  const [status, setStatus] = useState<SmsStatus | null>(null);
  const [templates, setTemplates] = useState<Array<{ key: string; label: string; message: string }>>([]);
  const [campaigns, setCampaigns] = useState<SmsCampaignItem[]>([]);
  const [logs, setLogs] = useState<SmsLogItem[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t, c, l] = await Promise.all([
        SmsApi.getStatus(), SmsApi.getTemplates(), SmsApi.getCampaigns({ page: 1, pageSize: 8 }), SmsApi.getLogs({ page: 1, pageSize: 8 }),
      ]);
      setStatus(s);
      setTemplates(t);
      setCampaigns(c.data || []);
      setLogs(l.data || []);
    } catch {
      toast.error('Could not load SMS settings and activity');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSaving(true);
    try {
      const result = await SmsApi.createCampaign({ name: name.trim(), message: message.trim(), audienceFilter: {} });
      toast.success(`Campaign saved for ${result.targetCount} members. It will wait until a provider is configured.`);
      setName(''); setMessage(''); await load();
    } catch { toast.error('Could not save SMS campaign'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-bold text-slate-900">SMS Center</h1><p className="mt-1 text-sm text-slate-500">Manage message templates, campaigns and delivery activity.</p></div>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><RefreshCw className="h-3.5 w-3.5"/>Refresh</button>
    </div>

    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"/><div className="min-w-0"><h2 className="font-semibold text-amber-950">Provider setup</h2><p className="mt-1 text-sm leading-6 text-amber-900">{status?.message || 'Checking provider status…'} No SMS messages will be sent until OHPEA selects and configures a provider. Campaigns can be prepared now and will remain queued.</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900">Provider: {status?.provider || 'Checking'}</span><span className="rounded-full border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900">Sending: {status?.enabled ? 'Enabled' : 'Disabled'}</span></div></div></div>
    </section>

    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={createCampaign} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-emerald-800"/><h2 className="font-semibold text-slate-900">Prepare a campaign</h2></div>
        <label className="block text-xs font-semibold text-slate-700">Campaign name<input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. Annual membership reminder"/></label>
        <label className="block text-xs font-semibold text-slate-700">Message<textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={5} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Write the message. You can use {{fullName}} and {{memberNo}}."/></label>
        <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Saved campaigns wait for provider setup.</p><button disabled={saving || !name.trim() || !message.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#103f34] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Send className="h-3.5 w-3.5"/>{saving ? 'Saving…' : 'Save campaign'}</button></div>
      </form>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Message templates</h2><p className="mt-1 text-xs text-slate-500">Starter templates for future provider activation.</p><div className="mt-4 space-y-3">{templates.map(t=><div key={t.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-800">{t.label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{t.message}</p></div>)}</div></section>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Recent campaigns</h2>{loading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : campaigns.length ? <div className="mt-3 divide-y divide-slate-100">{campaigns.map(c=><div key={c.id} className="py-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-800">{c.name}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{c.status}</span></div><p className="mt-1 text-xs text-slate-500">Target: {c.recipientCount ?? 0}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No campaigns yet.</p>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Recent delivery activity</h2>{loading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : logs.length ? <div className="mt-3 divide-y divide-slate-100">{logs.map((l)=><div key={l.id} className="py-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-800">{l.recipientName || l.recipientPhone}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{l.status}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate-500">{l.message}</p>{l.errorMessage && <p className="mt-1 text-xs text-rose-600">{l.errorMessage}</p>}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No SMS activity recorded.</p>}</section>
    </div>
  </div>;
}
