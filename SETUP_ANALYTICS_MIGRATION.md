# 🔧 Setup Completo Supabase Analytics - AZIONE RICHIESTA

## ⚠️ Azione Necessaria

Per abilitare l'analytics tracking (view count e click count), devi eseguire una migration SQL su Supabase.

---

## 📋 Step da Seguire

### 1. Apri Supabase SQL Editor

Vai su: https://supabase.com/dashboard/project/iemgtcjtkiupanayjlpp/sql/new

### 2. Copia e Incolla questo SQL

```sql
-- Analytics RPC Functions for Primariga
-- Run this in Supabase SQL Editor to enable view/click tracking

-- Function to increment book view count
CREATE OR REPLACE FUNCTION increment_book_view(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET
    views_count = COALESCE(views_count, 0) + 1,
    updated_at = NOW()
  WHERE id = book_id;
END;
$$;

-- Function to increment book click count (purchase link clicks)
CREATE OR REPLACE FUNCTION increment_book_click(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET
    clicks_count = COALESCE(clicks_count, 0) + 1,
    updated_at = NOW()
  WHERE id = book_id;
END;
$$;

-- Add columns if they don't exist
ALTER TABLE books
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count integer DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_views_count ON books(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_clicks_count ON books(clicks_count DESC);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_book_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_book_click(uuid) TO anon, authenticated;
```

### 3. Esegui la Query

Clicca su "RUN" o premi `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 4. Verifica Successo

Dovresti vedere:
```
Success. No rows returned
```

---

## ✅ Cosa Fa Questa Migration

1. **Crea funzione `increment_book_view`**
   - Incrementa il contatore views ogni volta che un utente visualizza un libro

2. **Crea funzione `increment_book_click`**
   - Incrementa il contatore clicks quando un utente clicca sul link acquisto

3. **Aggiunge colonne alla tabella books**
   - `views_count`: numero di visualizzazioni
   - `clicks_count`: numero di click sul link acquisto

4. **Crea indici per performance**
   - Permette query veloci ordinate per popolarità

5. **Imposta permessi**
   - Utenti anonimi e autenticati possono eseguire queste funzioni

---

## 🧪 Test dopo Migration

Dopo aver eseguito la migration:

1. **Ricarica l'app** su iPhone (shake → reload)
2. **Visualizza alcuni libri** nel feed
3. **Nessun errore** dovrebbe apparire in console
4. **Verifica contatori** in Supabase:

```sql
SELECT title, views_count, clicks_count 
FROM books 
WHERE views_count > 0 OR clicks_count > 0
ORDER BY views_count DESC;
```

---

## 🚨 Se Non Esegui questa Migration

L'app **funzionerà comunque** ma:
- ❌ Vedrai errori in console: "Could not find the function..."
- ❌ Non traccerai analytics (views/clicks)
- ⚠️ Non potrai vedere quali libri sono più popolari

---

## 📞 Problemi?

**Error: permission denied for table books**
→ Usa il Service Role Key invece della Anon Key (solo per admin)

**Error: function already exists**
→ La migration è già stata eseguita, tutto ok! ✅

**Error: column already exists**
→ Le colonne esistono già, tutto ok! ✅

---

## 🎯 Dopo la Migration

Una volta eseguita:

1. ✅ Ricarica l'app su iPhone
2. ✅ Testa il feed (scorri, visualizza libri)
3. ✅ Verifica che non ci siano errori
4. ✅ Continua con il testing seguendo `TESTING_CHECKLIST_IOS.md`

---

**Status**: ⏸️ In attesa di esecuzione migration
**File SQL**: `supabase/migrations/20251105120000_analytics_functions.sql`
