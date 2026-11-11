export type LocalizedText =
  | string
  | { en?: string; om?: string; am?: string; [key: string]: unknown }
  | null
  | undefined;

export function localized(v: LocalizedText, lang: 'en' | 'om' | 'am' = 'en'): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const candidate = v[lang] ?? v.en ?? v.om ?? v.am;
    if (typeof candidate === 'string') return candidate;
    const first = Object.values(v).find((value) => typeof value === 'string');
    return typeof first === 'string' ? first : '';
  }
  return String(v);
}
