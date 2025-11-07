import { supabase } from '../../data/supabaseClient';
import { UserRole } from '../../domain/entities/UserProfile';
import { success, failure } from '../../core/errors/Result';
import type { Result } from '../../core/errors/Result';
import { AppError, AuthenticationError, AuthorizationError } from '../../core/errors/AppError';

/**
 * Admin Guard
 * 
 * Utility per verificare permessi admin e autorizzazioni
 */

export class AdminGuard {
  /**
   * Verifica se un utente è admin o super_admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      const profile = data as { role: UserRole };
      return profile.role === 'admin' || profile.role === 'super_admin';
    } catch {
      return false;
    }
  }

  /**
   * Verifica se un utente è super_admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      const profile = data as { role: UserRole };
      return profile.role === 'super_admin';
    } catch {
      return false;
    }
  }

  /**
   * Ottiene il ruolo dell'utente corrente
   */
  static async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return null;
      }

      const profile = data as { role: UserRole };
      return profile.role;
    } catch {
      return null;
    }
  }

  /**
   * Richiede che l'utente corrente sia admin (throw se non lo è)
   * Usa questa funzione all'inizio di operazioni che richiedono privilegi admin
   */
  static async requireAdmin(): Promise<Result<void, AppError>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return failure(new AuthenticationError('Autenticazione richiesta'));
    }

    const isUserAdmin = await AdminGuard.isAdmin(user.id);

    if (!isUserAdmin) {
      return failure(
        new AuthorizationError('Permessi insufficienti. Richiesti privilegi admin.')
      );
    }

    return success(undefined);
  }

  /**
   * Richiede che l'utente corrente sia super_admin
   */
  static async requireSuperAdmin(): Promise<Result<void, AppError>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return failure(new AuthenticationError('Autenticazione richiesta'));
    }

    const isUserSuperAdmin = await AdminGuard.isSuperAdmin(user.id);

    if (!isUserSuperAdmin) {
      return failure(
        new AuthorizationError('Permessi insufficienti. Richiesti privilegi super admin.')
      );
    }

    return success(undefined);
  }

  /**
   * Logga un'azione admin nell'audit log
   * 
   * Nota: Per ora implementazione semplificata.
   * Può essere estesa per usare la tabella admin_audit_log quando i types sono aggiornati.
   */
  static async logAdminAction(params: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const { action, resourceType, resourceId, metadata } = params;
      
      // Per ora loggiamo, estendibile con tabella DB
      // eslint-disable-next-line no-console
      console.log('[ADMIN ACTION]', {
        action,
        resourceType,
        resourceId,
        metadata,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Inserisci in admin_audit_log quando i types sono aggiornati
      // await supabase.from('admin_audit_log').insert({...})
    } catch (error) {
      // Silent failure - non bloccare operazioni per logging
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('Failed to log admin action:', error);
      }
    }
  }
}
