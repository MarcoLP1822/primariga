-- Migration: Add Admin Roles System
-- Description: Aggiunge il sistema di ruoli (user, admin, super_admin) e audit logging

-- =====================================================
-- STEP 1: Aggiungi colonna role alla tabella profiles
-- =====================================================

-- Tipo ENUM per i ruoli
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Aggiungi colonna role con default 'user'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Indice per performance (query frequenti su role)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- STEP 2: Aggiorna RLS Policies per Books (admin può gestire)
-- =====================================================

-- Rimuovi le vecchie policy restrittive
DROP POLICY IF EXISTS "Only admins can insert books" ON public.books;
DROP POLICY IF EXISTS "Only admins can update books" ON public.books;

-- Policy: Admin e Super Admin possono inserire libri
CREATE POLICY "Admins can insert books"
ON public.books FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Admin e Super Admin possono aggiornare libri
CREATE POLICY "Admins can update books"
ON public.books FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Solo Super Admin può eliminare libri
CREATE POLICY "Super admins can delete books"
ON public.books FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- =====================================================
-- STEP 3: RLS Policies per Book Lines
-- =====================================================

-- Policy: Admin possono inserire book lines
CREATE POLICY "Admins can insert book lines"
ON public.book_lines FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Admin possono aggiornare book lines
CREATE POLICY "Admins can update book lines"
ON public.book_lines FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Solo Super Admin può eliminare book lines
CREATE POLICY "Super admins can delete book lines"
ON public.book_lines FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- =====================================================
-- STEP 4: RLS Policies per Profiles (admin possono vedere tutti)
-- =====================================================

-- Policy: Admin possono vedere tutti i profili
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id  -- Utenti vedono il proprio
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Solo Super Admin può modificare ruoli
CREATE POLICY "Super admins can update roles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id  -- User può aggiornare il proprio profilo
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  -- Se stai modificando il ruolo, devi essere super_admin
  (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- =====================================================
-- STEP 5: Tabella Admin Audit Log
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query rapide
CREATE INDEX idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.admin_audit_log(action);

-- RLS per audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admin possono vedere i log
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Solo il sistema può inserire log (via service role o function)
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- STEP 6: Funzione Helper per Logging Admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Verifica che l'utente sia admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
  END IF;

  -- Inserisci il log
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- =====================================================
-- STEP 7: Vista per Statistiche Admin
-- =====================================================

CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  -- Conteggio libri
  (SELECT COUNT(*) FROM public.books) as total_books,
  (SELECT COUNT(*) FROM public.books WHERE created_at > NOW() - INTERVAL '7 days') as books_last_week,
  
  -- Conteggio utenti
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '7 days') as users_last_week,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_count,
  
  -- Interazioni
  (SELECT COUNT(*) FROM public.user_interactions) as total_interactions,
  (SELECT COUNT(*) FROM public.user_interactions WHERE interaction_type = 'like') as total_likes,
  (SELECT COUNT(*) FROM public.user_interactions WHERE interaction_type = 'purchase') as total_purchases,
  
  -- Letture
  (SELECT COUNT(*) FROM public.user_reading_history) as total_reads,
  (SELECT COUNT(DISTINCT user_id) FROM public.user_reading_history) as active_readers;

-- Le views ereditano le RLS policies dalle tabelle sottostanti
-- Quindi admin_stats sarà accessibile solo se l'utente può accedere alle tabelle usate

-- =====================================================
-- COMMENTI
-- =====================================================

COMMENT ON COLUMN public.profiles.role IS 'Ruolo utente: user (default), admin, super_admin';
COMMENT ON TABLE public.admin_audit_log IS 'Log delle azioni amministrative per sicurezza e compliance';
COMMENT ON FUNCTION public.log_admin_action IS 'Registra un azione amministrativa nel log di audit';
COMMENT ON VIEW public.admin_stats IS 'Statistiche aggregate per dashboard admin (solo visibile ad admin)';

-- =====================================================
-- DATI INIZIALI: Promuovi primo utente a super_admin
-- =====================================================

-- IMPORTANTE: Sostituisci questo UUID con l'ID del tuo utente dopo la prima registrazione
-- Oppure esegui manualmente dopo il primo signup:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'tua-email@example.com';

-- Per ora creiamo solo un commento con le istruzioni
COMMENT ON TABLE public.profiles IS 
'Per promuovere un utente a super_admin, esegui:
UPDATE public.profiles SET role = ''super_admin'' WHERE id = ''YOUR_USER_ID'';

Oppure tramite SQL Editor:
UPDATE public.profiles SET role = ''super_admin'' WHERE username = ''tuo-username'';';
