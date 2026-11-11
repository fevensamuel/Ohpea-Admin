// src/lib/normalize.ts
import { localized, type LocalizedText } from '@/lib/i18n';
import type { Paginated, PaginationMeta } from '@/types/api';

export type Localized = LocalizedText;

/** Extract a display string from a localized object using the preferred language. */
export function pickLang(v: Localized, lang: 'en' | 'om' | 'am' = 'en'): string {
  return localized(v, lang);
}

/** Coerce anything to a finite number. Returns `fallback` on null/undefined/NaN. */
export function asNumber(v: unknown, fallback = 0): number {
  if (v == null || v === '') return fallback;
  const number = Number(v);
  return Number.isFinite(number) ? number : fallback;
}

/** Coerce anything to an array. Returns [] when input is not an array. */
export function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Best-effort array extraction from a backend response that might be:
 *   - a raw array
 *   - { data: [...] }
 *   - { data: { data: [...] } }  (double-wrapped)
 *   - { items: [...] }
 * Returns [] if none of those match.
 */
export function normalizeList<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];

  const response = value as Record<string, unknown>;
  if (Array.isArray(response.data)) return response.data as T[];
  if (response.data && typeof response.data === 'object') {
    const nested = normalizeList<T>(response.data);
    if (nested.length > 0) return nested;
  }
  return Array.isArray(response.items) ? (response.items as T[]) : [];
}

/**
 * Coerce anything to a string. Localized objects collapse to the preferred language.
 * Use this for **non-JSX** contexts (labels passed to charts, keys, comparisons).
 * For JSX text rendering, prefer `text()` which handles nulls more gracefully.
 */
export function asString(v: unknown, lang: 'en' | 'om' | 'am' = 'en'): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return pickLang(v as Localized, lang);
}

/**
 * Universal text renderer for JSX. Safely converts ANYTHING to a string:
 *   <td>{text(member.regionName)}</td>       // regionName may be { en, om, am }
 *   <p>{text(activity.description)}</p>       // description may be undefined
 *   <span>{text(42)}</span>                   // number → "42"
 *
 * Never throws. Never returns a React-incompatible value.
 */
export function text(v: unknown, lang: 'en' | 'om' | 'am' = 'en'): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') return pickLang(v as Localized, lang);
  return '';
}

/** First character of a name, safely. Returns '?' for empty names. */
export function firstChar(v: unknown, fallback = '?'): string {
  const s = text(v).trim();
  return s.length > 0 ? s.charAt(0).toUpperCase() : fallback;
}

/** Normalize a pagination meta object into a guaranteed-complete shape. */
export function normalizeMeta(
  meta: unknown,
  defaults: Partial<PaginationMeta> = {}
): PaginationMeta {
  const value =
    meta && typeof meta === 'object' ? (meta as Record<string, unknown>) : {};
  const pageSize = asNumber(value.pageSize, defaults.pageSize ?? 10) || 10;
  const total = asNumber(value.total, defaults.total ?? 0);

  return {
    page: asNumber(value.page, defaults.page ?? 1) || 1,
    pageSize,
    total,
    totalPages:
      asNumber(value.totalPages, 0) || Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Normalize a paginated response: { data: [], meta: {...} }. */
export function normalizePaginated<T>(
  value: unknown,
  defaults: Partial<PaginationMeta> = {}
): Paginated<T[]> {
  const response =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const nested =
    response.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? (response.data as Record<string, unknown>)
      : {};
  const data = normalizeList<T>(value);
  const meta = response.meta ?? nested.meta ?? response.pagination ?? nested.pagination;

  return {
    data: data as T[],
    meta: normalizeMeta(meta, defaults),
  };
}

/**
 * Deep-normalize an object. Localized leaf objects become strings.
 * Useful before passing data to libraries that expect plain JSON.
 */
export function deepNormalize<T = unknown>(value: unknown): T {
  if (value == null) return value as T;
  if (Array.isArray(value)) return value.map((item) => deepNormalize(item)) as T;
  if (typeof value !== 'object') return value as T;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      const localizedValue = child as Record<string, unknown>;
      if ('en' in localizedValue || 'om' in localizedValue || 'am' in localizedValue) {
        output[key] = pickLang(localizedValue);
      } else {
        output[key] = deepNormalize(child);
      }
    } else {
      output[key] = child;
    }
  }
  return output as T;
}

/** Normalized chart point — the shape every chart consumer can rely on. */
export interface NormalizedChartPoint {
  key: string;
  label: string;
  count: number;
  percent: number;
  value: number;
  color?: string;
}

/**
 * Normalize a single chart point. Accepts many backend shapes:
 *   { key, label, count, percent }
 *   { label, value }
 *   { method, amount }
 *   { bucket, totalEtb }
 * ... and returns the canonical NormalizedChartPoint.
 */
export function normalizeChartPoint(value: unknown): NormalizedChartPoint {
  const point =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const count = asNumber(point.count ?? point.value ?? point.amount, 0);
  const key = asString(point.key);
  const label =
    pickLang(point.label as Localized) ||
    asString(point.method ?? point.region ?? point.bucket) ||
    key ||
    asString(point.label);

  return {
    key,
    label,
    count,
    percent: asNumber(point.percent, 0),
    value: count,
    ...(typeof point.color === 'string' ? { color: point.color } : {}),
  };
}

/** Normalize an array of chart points. Returns [] if input is not an array. */
export function normalizeChartArray(value: unknown): NormalizedChartPoint[] {
  return normalizeList(value).filter((point) => point != null).map(normalizeChartPoint);
}