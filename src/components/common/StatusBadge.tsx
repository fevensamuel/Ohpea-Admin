import type { RegistrationStatus, MembershipStatus, PaymentStatus } from '@/types/api';

interface StatusBadgeProps {
  type: 'registration' | 'membership' | 'payment';
  status: RegistrationStatus | MembershipStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, status, size = 'sm' }: StatusBadgeProps) {
  const s = String(status).toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (type === 'registration') {
    if (s === 'pending') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Pending Review';
    } else if (s === 'approved') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Approved';
    } else if (s === 'rejected') {
      colorClasses = 'bg-red-50 text-red-800 border-red-200';
      label = 'Rejected';
    }
  } else if (type === 'membership') {
    if (s === 'active') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Active Member';
    } else if (s === 'pending') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Pending Approval';
    } else if (s === 'inactive') {
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      label = 'Inactive';
    }
  } else if (type === 'payment') {
    if (s === 'paid') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Paid';
    } else if (s === 'unpaid') {
      colorClasses = 'bg-red-50 text-red-800 border-red-200';
      label = 'Unpaid';
    } else if (s === 'void') {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Void';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${colorClasses}`}
    >
      {label}
    </span>
  );
}
