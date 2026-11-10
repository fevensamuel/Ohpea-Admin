import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ApiError } from '@/types/api';

interface RejectReasonModalProps {
  isOpen: boolean;
  memberId: string;
  memberName: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}

const TEMPLATE_REASONS = [
  'Incomplete or unreadable scanned diploma / degree certificate.',
  'Missing accredited institution verification or official registrar stamp.',
  'National ID (Fayda / Kebele / Passport) expired or mismatched full name.',
  'Work experience in hospitality/tourism does not meet minimum professional threshold.',
  'Duplicate submission detected with existing registered member ID.',
];

export function RejectReasonModal({
  isOpen,
  memberId,
  memberName,
  isLoading = false,
  onConfirm,
  onCancel,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!reason.trim()) {
      setError('A specific rejection reason is mandatory for applicant feedback.');
      return;
    }
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to reject applicant');
    }
  };

  const handleTemplateClick = (tpl: string) => {
    setReason(tpl);
    setError('');
    setFieldErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="reject-modal-title" className="text-sm font-bold text-slate-900">
                Reject Registration Application
              </h3>
              <p className="text-xs text-slate-500">Applicant: {memberName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick template reasons */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Standard Rejection Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_REASONS.map((tpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleTemplateClick(tpl)}
                  className="text-left text-2xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  {tpl.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Reason for Applicant <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
                if (fieldErrors.reason) setFieldErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="Provide a clear, respectful explanation for why the registration cannot be approved..."
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                error || fieldErrors.reason ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {fieldErrors.reason && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.reason}</p>}
            {error && !fieldErrors.reason && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
