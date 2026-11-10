import { useUiStore } from '@/store/useUiStore';
import { isDemoMode } from '@/lib/demoMode';
import { Info, X } from 'lucide-react';

export function DemoBanner() {
  const { demoBannerDismissed, dismissDemoBanner } = useUiStore();

  if (!isDemoMode() || demoBannerDismissed) return null;

  return (
    <div
      role="status"
      className="bg-[#0B3D2E] text-[#F1E3B8] px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 border-b border-[#C9A24A]/30"
    >
      <div className="flex items-center gap-2 truncate">
        <Info className="w-4 h-4 text-[#C9A24A] shrink-0" />
        <span className="truncate">
          <strong>Demo mode</strong> — numbers are hardcoded samples, not live data.
        </span>
      </div>
      <button
        onClick={dismissDemoBanner}
        className="shrink-0 text-[#F1E3B8]/70 hover:text-white p-0.5 rounded transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
