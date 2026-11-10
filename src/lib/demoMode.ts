/**
 * Demo mode detection and fallback utility.
 * Enforces explicit opt-in only.
 */
export const isDemoMode = (): boolean =>
  String((import.meta as any).env?.VITE_DEMO_MODE ?? '').toLowerCase() === 'true';

export function realOrDemo<T>(label: string, real: T | undefined | null, demo: T): T {
  if (real !== undefined && real !== null) return real;
  if (isDemoMode()) return demo;
  throw new Error(
    `[ohpea-admin] Missing required field "${label}" from backend. ` +
    `Set VITE_DEMO_MODE=true in this environment's .env to run in demo mode.`
  );
}
