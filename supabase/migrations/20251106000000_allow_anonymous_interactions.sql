-- Migration: Allow Anonymous User Interactions
-- Description: Permette agli utenti anonimi (senza auth) di salvare interazioni
-- Per l'MVP senza autenticazione Supabase

-- Rimuovi la foreign key constraint verso profiles
ALTER TABLE public.user_interactions 
  DROP CONSTRAINT IF EXISTS user_interactions_user_id_fkey;

-- Rimuovi le vecchie policies
DROP POLICY IF EXISTS "Users can view own interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON public.user_interactions;

-- Crea nuove policies che permettono accesso pubblico
-- Tutti possono vedere le proprie interazioni (basato su user_id, non auth)
CREATE POLICY "Anyone can view interactions"
  ON public.user_interactions FOR SELECT
  USING (true);

-- Tutti possono inserire interazioni
CREATE POLICY "Anyone can insert interactions"
  ON public.user_interactions FOR INSERT
  WITH CHECK (true);

-- Tutti possono aggiornare interazioni
CREATE POLICY "Anyone can update interactions"
  ON public.user_interactions FOR UPDATE
  USING (true);

-- Tutti possono cancellare interazioni
CREATE POLICY "Anyone can delete interactions"
  ON public.user_interactions FOR DELETE
  USING (true);

-- Nota: In produzione, quando implementeremo l'autenticazione Supabase,
-- dovremo ripristinare le policy basate su auth.uid()
