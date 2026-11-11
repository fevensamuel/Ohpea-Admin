import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateBackendContract, type ContractCheck } from '@/lib/contract';
import { isDemoMode } from '@/lib/demoMode';

interface ContractContextValue {
  ok: boolean;
  check: ContractCheck | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ContractContext = createContext<ContractContextValue>({
  ok: true,
  check: null,
  loading: false,
  refetch: async () => {},
});

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [check, setCheck] = useState<ContractCheck | null>(null);

  const runCheck = async () => {
    // If running in explicit demo mode, contract drift is bypassed
    if (isDemoMode()) {
      setCheck({
        ok: true,
        version: 1,
        expectedVersion: 1,
        missingEndpoints: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    // Keep /api in the base URL so the contract is fetched from /api/contract.json.
    const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
    const baseUrl = rawApiUrl.replace(/\/+$/, '') || 'http://localhost:3000/api';

    const result = await validateBackendContract(baseUrl);
    setCheck(result);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const ok = check ? check.ok : true;

  return (
    <ContractContext.Provider value={{ ok, check, loading, refetch: runCheck }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractGuard(): ContractContextValue {
  return useContext(ContractContext);
}
