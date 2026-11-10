import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

export function LockedFeature({
  title,
  description,
  phase = 'Phase 2',
  children,
}: {
  title: string;
  description?: string;
  phase?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative p-8 rounded-2xl border border-slate-200 bg-white overflow-hidden text-center max-w-lg mx-auto my-8 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
        <Lock className="w-5 h-5" />
      </div>
      <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1E3B8] text-[#0B3D2E] mb-2">
        {phase} Roadmap
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
        {description ||
          'This module is slated for release in the upcoming phase of the OHPEA member enterprise ecosystem.'}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
