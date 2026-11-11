import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib';
import type { AdminUser } from '@/types/api';

const TOKEN_KEY = 'ohpea_admin_token';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = adminApi.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await adminApi.me();
      setUser(userData);
    } catch {
      adminApi.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const unsubscribe = adminApi.onAuthError(() => {
      setUser(null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (usernameOrEmail: string, password: string): Promise<AdminUser> => {
      setLoading(true);
      try {
        const res = await adminApi.login(usernameOrEmail, password);
        setUser(res.user);
        return res.user;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await adminApi.logout();
    } catch {
      // Clear client state even if network fails
      adminApi.setToken(null);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string) => {
      return adminApi.changePassword(currentPassword, nextPassword);
    },
    []
  );

  const hasPermission = useCallback(
    (key: string): boolean => {
      if (!user) return false;
      if (user.role === 'SuperAdmin') return true;
      if (user.permissions.includes('*')) return true;
      return user.permissions.includes(key);
    },
    [user]
  );

  const isSuperAdmin = user?.role === 'SuperAdmin';

  return {
    user,
    loading,
    login,
    logout,
    changePassword,
    hasPermission,
    isSuperAdmin,
    mustChangePassword: user?.mustChangePassword ?? false,
    refetchUser: fetchCurrentUser,
  };
}
