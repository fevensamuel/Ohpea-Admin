import { MapPin } from 'lucide-react';

export function RegionBadge({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#246b55]/10 text-[#103f34] border border-[#246b55]/20">
      <MapPin className="w-3.5 h-3.5 text-[#3b8069]" />
      <span>{name}</span>
    </div>
  );
}
