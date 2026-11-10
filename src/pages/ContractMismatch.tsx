import { useContractGuard } from '@/context/ContractContext';
import { AlertOctagon, RefreshCw, Terminal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ContractMismatch() {
  const { check, refetch, loading } = useContractGuard();
  const rawApiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 space-y-6">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Backend Contract Drift Detected</h1>
            <p className="text-xs text-red-600 font-medium">Contract Validation Gate</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-2">
          {check?.reason && <p className="font-semibold">{check.reason}</p>}
          <p className="text-red-700 leading-relaxed">
            The admin portal cannot safely operate against an incompatible backend API contract.
            Please update the portal to match the backend version or roll back breaking API changes.
          </p>
        </div>

        {check?.missingEndpoints && check.missingEndpoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Missing Required Endpoints ({check.missingEndpoints.length}):</span>
            </div>
            <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-2xs space-y-1 max-h-48 overflow-y-auto">
              {check.missingEndpoints.map((ep) => (
                <div key={ep} className="text-red-400">
                  ✗ {ep}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>

          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Revalidate Contract</span>
          </button>
        </div>
      </div>
    </div>
  );
}
