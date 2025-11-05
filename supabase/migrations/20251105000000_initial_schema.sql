-- Primariga Database Schema
-- Migration: Initial Schema
-- Description: Crea le tabelle principali per l'app Primariga

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Estende la tabella auth.users di Supabase
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies per profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- BOOKS TABLE
-- =====================================================
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  cover_image_url TEXT,
  publisher TEXT,
  publication_year INTEGER,
  genre TEXT[],
  description TEXT,
  page_count INTEGER,
  language TEXT DEFAULT 'it',
  amazon_link TEXT,
  ibs_link TEXT,
  mondadori_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per ricerche rapide
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_books_genre ON public.books USING GIN(genre);
CREATE INDEX idx_books_title ON public.books(title);

-- RLS Policies per books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone"
  ON public.books FOR SELECT
  USING (true);

-- Solo admin possono modificare libri (aggiungeremo ruoli dopo)
CREATE POLICY "Only admins can insert books"
  ON public.books FOR INSERT
  WITH CHECK (false); -- Temporaneo, aggiungeremo ruolo admin

CREATE POLICY "Only admins can update books"
  ON public.books FOR UPDATE
  USING (false);

-- =====================================================
-- BOOK_LINES TABLE (Prima riga dei libri)
-- =====================================================
CREATE TABLE public.book_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  line_text TEXT NOT NULL,
  line_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(book_id, line_number)
);

-- Indice per query rapide
CREATE INDEX idx_book_lines_book_id ON public.book_lines(book_id);

-- RLS Policies
ALTER TABLE public.book_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Book lines are viewable by everyone"
  ON public.book_lines FOR SELECT
  USING (true);

-- =====================================================
-- USER_INTERACTIONS TABLE
-- =====================================================
-- Traccia like/dislike e acquisti
CREATE TYPE interaction_type AS ENUM ('like', 'dislike', 'skip', 'purchase');

CREATE TABLE public.user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utente può avere solo un'interazione per libro
  UNIQUE(user_id, book_id)
);

-- Indici per query rapide
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_book_id ON public.user_interactions(book_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);

-- RLS Policies
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON public.user_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON public.user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON public.user_interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER_READING_HISTORY TABLE
-- =====================================================
-- Storico completo delle prime righe lette
CREATE TABLE public.user_reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  reading_duration_seconds INTEGER -- Tempo di lettura in secondi
);

-- Indici per query rapide
CREATE INDEX idx_reading_history_user_id ON public.user_reading_history(user_id);
CREATE INDEX idx_reading_history_read_at ON public.user_reading_history(read_at DESC);

-- RLS Policies
ALTER TABLE public.user_reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading history"
  ON public.user_reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading history"
  ON public.user_reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per books
CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNZIONE: Crea profilo automaticamente dopo signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare profilo automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VIEWS UTILI
-- =====================================================

-- Vista: Libri con statistiche
CREATE VIEW public.books_with_stats AS
SELECT 
  b.*,
  COUNT(DISTINCT ui.user_id) FILTER (WHERE ui.interaction_type = 'like') as likes_count,
  COUNT(DISTINCT ui.user_id) FILTER (WHERE ui.interaction_type = 'dislike') as dislikes_count,
  COUNT(DISTINCT ui.user_id) FILTER (WHERE ui.interaction_type = 'purchase') as purchases_count,
  COUNT(DISTINCT rh.user_id) as views_count
FROM public.books b
LEFT JOIN public.user_interactions ui ON b.id = ui.book_id
LEFT JOIN public.user_reading_history rh ON b.id = rh.book_id
GROUP BY b.id;

-- RLS per la view
ALTER VIEW public.books_with_stats SET (security_invoker = true);

-- =====================================================
-- DATI INIZIALI DI TEST
-- =====================================================

-- Inserimento di alcuni libri di esempio
INSERT INTO public.books (title, author, isbn, genre, description, publication_year, language) VALUES
  (
    'Il nome della rosa',
    'Umberto Eco',
    '9788845292613',
    ARRAY['Giallo', 'Storico'],
    'Un romanzo storico che mescola suspense, filosofia e erudizione medievale.',
    1980,
    'it'
  ),
  (
    '1984',
    'George Orwell',
    '9788804668572',
    ARRAY['Distopico', 'Fantascienza'],
    'Un romanzo distopico che esplora i pericoli del totalitarismo.',
    1949,
    'it'
  ),
  (
    'La solitudine dei numeri primi',
    'Paolo Giordano',
    '9788804587293',
    ARRAY['Romanzo', 'Contemporaneo'],
    'La storia di due anime solitarie che si cercano e si respingono.',
    2008,
    'it'
  );

-- Inserimento prime righe per i libri di esempio
INSERT INTO public.book_lines (book_id, line_text, line_number)
SELECT 
  id,
  CASE 
    WHEN title = 'Il nome della rosa' THEN 'Nel principio era il Verbo e il Verbo era presso Dio, e il Verbo era Dio.'
    WHEN title = '1984' THEN 'Era una luminosa e fredda giornata d''aprile e gli orologi battevano tredici colpi.'
    WHEN title = 'La solitudine dei numeri primi' THEN 'Alice Della Rocca odiava la scuola di sci.'
  END,
  1
FROM public.books
WHERE title IN ('Il nome della rosa', '1984', 'La solitudine dei numeri primi');

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Profili utente estesi collegati ad auth.users';
COMMENT ON TABLE public.books IS 'Catalogo completo dei libri disponibili';
COMMENT ON TABLE public.book_lines IS 'Prime righe dei libri (testo mostrato agli utenti)';
COMMENT ON TABLE public.user_interactions IS 'Traccia like/dislike/skip/purchase degli utenti';
COMMENT ON TABLE public.user_reading_history IS 'Storico completo delle letture degli utenti';
