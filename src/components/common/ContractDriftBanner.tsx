import { useContractGuard } from '@/context/ContractContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ContractDriftBanner() {
  const { ok, check, loading, refetch } = useContractGuard();

  if (loading || ok || !check) {
    return null;
  }

  const rawApiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

  let message = '';
  if (check.version !== null && check.version !== check.expectedVersion) {
    message = `Backend is v${check.version}. Portal requires v${check.expectedVersion}. Update the portal or roll back the backend.`;
  } else if (check.missingEndpoints && check.missingEndpoints.length > 0) {
    message = `Backend is missing ${check.missingEndpoints.length} required admin endpoints: ${check.missingEndpoints.slice(0, 3).join(', ')}${check.missingEndpoints.length > 3 ? '...' : ''}.`;
  } else {
    message = `Cannot reach /contract.json at ${rawApiUrl.replace(/\/api\/?$/, '')}. Backend may be down.`;
  }

  return (
    <div
      role="alert"
      className="w-full bg-red-600 text-white text-xs font-medium px-4 py-2.5 flex items-center justify-between shadow-md relative z-50 border-b border-red-700"
    >
      <div className="flex items-center gap-2 max-w-4xl">
        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
        <span className="font-semibold tracking-wide uppercase text-2xs bg-red-800 px-2 py-0.5 rounded">
          Contract Error
        </span>
        <span className="truncate">{message}</span>
      </div>

      <button
        onClick={() => refetch()}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-2xs font-semibold transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry Check</span>
      </button>
    </div>
  );
}
