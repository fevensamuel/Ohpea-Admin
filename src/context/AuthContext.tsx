import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AdminUser } from '@/types/api';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<{ success: boolean; message: string }>;
  hasPermission: (key: string) => boolean;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
