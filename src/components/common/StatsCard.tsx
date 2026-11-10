import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtext?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'neutral' | 'danger';
  };
  onClick?: () => void;
  accentColor?: string;
  ctaText?: string;
  active?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  subtext,
  badge,
  onClick,
  accentColor,
  ctaText,
  active = false,
}: StatsCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative p-5 rounded-xl border bg-white transition-all text-left group ${
        active
          ? 'border-[#0B3D2E] ring-2 ring-[#0B3D2E]/20 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      } ${isClickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: accentColor ? `${accentColor}15` : '#F1F5F9',
              color: accentColor || '#14573F',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-medium ${
              badge.variant === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : badge.variant === 'danger'
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {(subtext || ctaText) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {ctaText && (
            <span className="font-semibold text-[#1F7A57] group-hover:underline">
              {ctaText} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
