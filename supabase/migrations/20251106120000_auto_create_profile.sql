-- Migration: Auto-create user profile on signup
-- Description: Trigger che crea automaticamente un record in public.profiles
--              quando un nuovo utente si registra in auth.users

-- =====================================================
-- FUNCTION: handle_new_user
-- =====================================================
-- Questa funzione viene chiamata automaticamente quando viene
-- creato un nuovo utente in auth.users via Supabase Auth
--
-- Crea un record corrispondente in public.profiles con:
-- - id: stesso UUID dell'utente (FK a auth.users.id)
-- - username: ricavato da email (parte prima di @) o da metadata
-- - full_name: ricavato da metadata se presente
-- - created_at: timestamp registrazione

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, created_at)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'full_name',
    new.created_at
  );
  RETURN new;
END;
$$;

-- =====================================================
-- TRIGGER: on_auth_user_created
-- =====================================================
-- Si attiva DOPO ogni INSERT in auth.users
-- Chiama handle_new_user() per creare il profilo

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMMENTI
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user IS 
  'Crea automaticamente un profilo in public.profiles quando un utente si registra';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Trigger che chiama handle_new_user() dopo ogni registrazione utente';
