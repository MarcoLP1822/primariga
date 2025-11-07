import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { AdminGuard } from '../../infrastructure/auth/AdminGuard';
import { useAppStore } from '../../infrastructure/store/store';
import type { UserRole } from '../../domain/entities/UserProfile';

/**
 * Hook per verificare se l'utente corrente è admin
 * 
 * @returns {
 *   isAdmin: boolean - true se utente è admin o super_admin
 *   isSuperAdmin: boolean - true se utente è super_admin
 *   userRole: UserRole | null - ruolo corrente dell'utente
 *   loading: boolean - true durante il caricamento
 * }
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { isAdmin, loading } = useAdmin();
 * 
 *   if (loading) return <ActivityIndicator />;
 *   if (!isAdmin) return <Text>Accesso negato</Text>;
 * 
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = useAppStore((state) => state.userId);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      // Se non autenticato, resetta tutto
      if (!isAuthenticated || !userId) {
        if (isMounted) {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        // Ottieni il ruolo dell'utente
        const role = await AdminGuard.getCurrentUserRole();

        if (!isMounted) return;

        setUserRole(role);
        setIsAdmin(role === 'admin' || role === 'super_admin');
        setIsSuperAdmin(role === 'super_admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [userId, isAuthenticated]);

  return {
    isAdmin,
    isSuperAdmin,
    userRole,
    loading,
  };
}

/**
 * Hook per richiedere privilegi admin
 * Reindirizza alla home se l'utente non è admin
 * 
 * @example
 * ```tsx
 * function AdminOnlyScreen() {
 *   const { loading } = useRequireAdmin();
 * 
 *   if (loading) return <ActivityIndicator />;
 * 
 *   // A questo punto l'utente è sicuramente admin
 *   return <AdminContent />;
 * }
 * ```
 */
export function useRequireAdmin() {
  const { isAdmin, loading } = useAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Reindirizza alla home se non admin
      router.replace('/');
    }
  }, [isAdmin, loading]);

  return { loading };
}
