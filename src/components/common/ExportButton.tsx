import { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ExportButtonProps {
  onExport: () => Promise<Blob>;
  filename: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function ExportButton({
  onExport,
  filename,
  label = 'Export',
  variant = 'secondary',
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      const blob = await onExport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`${label} file ready for download`);
    } catch {
      toast.error('Failed to export file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
        variant === 'primary'
          ? 'bg-[#0B3D2E] text-white hover:bg-[#14573F] disabled:bg-slate-300'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50'
      }`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>{label}</span>
    </button>
  );
}
