import { MapPin } from 'lucide-react';

export function RegionBadge({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14573F]/10 text-[#0B3D2E] border border-[#14573F]/20">
      <MapPin className="w-3.5 h-3.5 text-[#1F7A57]" />
      <span>{name}</span>
    </div>
  );
}
