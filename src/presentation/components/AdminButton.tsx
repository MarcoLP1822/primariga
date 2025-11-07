/**
 * Admin Button Component
 * 
 * Esempio di componente che mostra/nasconde UI basandosi sul ruolo admin
 * Copia e adatta questo pattern per la tua UI
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAdmin } from '../hooks/useAdmin';

interface AdminButtonProps {
  onPress: () => void;
  title: string;
  requireSuperAdmin?: boolean; // Se true, mostra solo a super_admin
}

/**
 * Bottone visibile solo agli admin
 * 
 * @example
 * ```tsx
 * <AdminButton 
 *   title="Delete Book" 
 *   onPress={handleDelete}
 *   requireSuperAdmin={true}
 * />
 * ```
 */
export function AdminButton({ onPress, title, requireSuperAdmin = false }: AdminButtonProps) {
  const { isAdmin, isSuperAdmin, loading } = useAdmin();

  // Non mostrare durante il caricamento
  if (loading) {
    return null;
  }

  // Se richiede super admin, verifica quello
  if (requireSuperAdmin && !isSuperAdmin) {
    return null;
  }

  // Altrimenti verifica admin generico
  if (!isAdmin) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

/**
 * Badge che mostra il ruolo dell'utente (solo se admin)
 */
export function AdminBadge() {
  const { userRole, loading } = useAdmin();

  if (loading || userRole === 'user') {
    return null;
  }

  const label = userRole === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN';
  const backgroundColor = userRole === 'super_admin' ? '#FF6B6B' : '#4ECDC4';

  return (
    <Text style={[styles.badge, { backgroundColor }]}>
      {label}
    </Text>
  );
}

/**
 * Componente wrapper che mostra contenuto solo agli admin
 * 
 * @example
 * ```tsx
 * <AdminOnly requireSuperAdmin={false}>
 *   <AdminDashboard />
 * </AdminOnly>
 * ```
 */
interface AdminOnlyProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, requireSuperAdmin = false, fallback = null }: AdminOnlyProps) {
  const { isAdmin, isSuperAdmin, loading } = useAdmin();

  if (loading) {
    return <ActivityIndicator />;
  }

  // Verifica permessi
  const hasPermission = requireSuperAdmin ? isSuperAdmin : isAdmin;

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
