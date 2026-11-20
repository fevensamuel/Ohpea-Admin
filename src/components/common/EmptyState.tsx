import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center rounded-lg border border-[#e1e6df] bg-white">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f4f5f0] text-[#718078] mb-4">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-[#203a32]">{title}</h3>
      {description && <p className="mt-2 text-sm text-[#718078] max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
