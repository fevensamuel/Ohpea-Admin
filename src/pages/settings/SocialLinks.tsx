import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { SettingsApi } from '@/api/settings';
import { useToast } from '@/context/ToastContext';

type SocialItem = { id: string; platform: string; label: string; url: string; enabled: boolean; sortOrder: number };
const PLATFORMS = [
  ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['x', 'X (Twitter)'],
  ['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'], ['youtube', 'YouTube'],
  ['tiktok', 'TikTok'], ['linkedin', 'LinkedIn'], ['threads', 'Threads'],
  ['pinterest', 'Pinterest'], ['snapchat', 'Snapchat'], ['discord', 'Discord'],
  ['reddit', 'Reddit'], ['github', 'GitHub'], ['vimeo', 'Vimeo'], ['wechat', 'WeChat'], ['website', 'Website / Other'],
] as const;
const slug: Record<string, string> = { twitter: 'x', x: 'x', facebook: 'facebook', instagram: 'instagram', whatsapp: 'whatsapp', telegram: 'telegram', youtube: 'youtube', tiktok: 'tiktok', linkedin: 'linkedin', threads: 'threads', pinterest: 'pinterest', snapchat: 'snapchat', discord: 'discord', reddit: 'reddit', github: 'github', vimeo: 'vimeo', wechat: 'wechat' };
const iconUrl = (platform: string) => slug[platform] ? `https://cdn.simpleicons.org/${slug[platform]}` : '';

export function SocialLinks() {
  const toast = useToast();
  const [items, setItems] = useState<SocialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    SettingsApi.get<any>('socials').then((value) => {
      const list = Array.isArray(value) ? value : Object.entries(value || {}).filter(([,url]) => !!url).map(([platform,url],i) => ({ platform, url, label: platform, enabled: true, sortOrder: i }));
      setItems(list.map((x: any, i: number) => ({ id: String(x.id || `${x.platform}-${i}`), platform: String(x.platform || 'website'), label: String(x.label || x.platform || ''), url: String(x.url || ''), enabled: x.enabled !== false, sortOrder: Number(x.sortOrder ?? i) })));
    }).catch(() => toast.error('Failed to load social media links')).finally(() => setLoading(false));
  }, []);
  const update = (id: string, patch: Partial<SocialItem>) => setItems(old => old.map(x => x.id === id ? { ...x, ...patch } : x));
  const add = () => setItems(old => [...old, { id: crypto.randomUUID(), platform: 'instagram', label: 'Instagram', url: '', enabled: true, sortOrder: old.length }]);
  const save = async () => {
    if (items.some(x => x.url.trim() && !/^https?:\/\//i.test(x.url.trim()))) { toast.error('Each social URL must start with https:// or http://'); return; }
    const clean = items.filter(x => x.url.trim()).map((x, i) => ({ ...x, url: x.url.trim(), sortOrder: i }));
    try { setSaving(true); await SettingsApi.update('socials', clean); setItems(clean); toast.success('Social media links saved. They will appear on the public website.'); }
    catch { toast.error('Could not save social media links'); } finally { setSaving(false); }
  };
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading social media settings…</div>;
  return <div className="max-w-5xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-slate-900">Social Media Links</h1><p className="mt-1 text-sm text-slate-500">Manage the platforms shown in the public website footer. Only enabled links are published.</p></div><div className="flex gap-2"><button onClick={add} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"><Plus size={16}/> Add platform</button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#103f34] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? 'Saving…' : 'Save changes'}</button></div></div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[36px_1fr_1.5fr_2fr_90px_40px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span/><span>Platform</span><span>Display name</span><span>Profile URL</span><span>Visible</span><span/></div>
      {items.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No social media links added yet.</p>}
      {items.map((item, index) => <div key={item.id} className="grid grid-cols-[36px_1fr_1.5fr_2fr_90px_40px] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
        <div className="flex flex-col"><button type="button" aria-label="Move up" disabled={index===0} onClick={()=>setItems(old=>{const next=[...old]; [next[index-1],next[index]]=[next[index],next[index-1]]; return next;})} className="text-slate-400 disabled:opacity-20"><ArrowUp size={13}/></button><button type="button" aria-label="Move down" disabled={index===items.length-1} onClick={()=>setItems(old=>{const next=[...old]; [next[index+1],next[index]]=[next[index],next[index+1]]; return next;})} className="text-slate-400 disabled:opacity-20"><ArrowDown size={13}/></button></div>
        <div className="flex min-w-0 items-center gap-2">{iconUrl(item.platform) ? <img src={iconUrl(item.platform)} className="h-5 w-5" alt=""/> : <ExternalLink size={18}/>}<select aria-label="Platform" value={item.platform} onChange={e => update(item.id,{ platform:e.target.value, label: PLATFORMS.find(p=>p[0]===e.target.value)?.[1] || e.target.value })} className="min-w-0 w-full rounded-md border border-slate-200 px-2 py-2 text-sm">{PLATFORMS.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></div>
        <input aria-label="Display name" value={item.label} onChange={e=>update(item.id,{label:e.target.value})} className="min-w-0 rounded-md border border-slate-200 px-2 py-2 text-sm"/>
        <input aria-label="Profile URL" type="url" value={item.url} onChange={e=>update(item.id,{url:e.target.value})} placeholder="https://…" className="min-w-0 rounded-md border border-slate-200 px-2 py-2 text-sm"/>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.enabled} onChange={e=>update(item.id,{enabled:e.target.checked})}/> Show</label>
        <button aria-label="Remove link" onClick={()=>setItems(old=>old.filter(x=>x.id!==item.id))} className="rounded p-2 text-red-500 hover:bg-red-50"><Trash2 size={16}/></button>
      </div>)}
    </div>
    <p className="text-xs text-slate-500">Brand icons are rendered using Simple Icons. Links open in a new tab. Empty URLs are not published.</p>
  </div>;
}
