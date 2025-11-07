-- Script per rimuovere i duplicati dal database Primariga
-- Da eseguire nel SQL Editor di Supabase

-- STEP 1: Verifica la situazione attuale
SELECT 
  title, 
  author, 
  COUNT(*) as count
FROM books
GROUP BY title, author
HAVING COUNT(*) > 1
ORDER BY count DESC, title;

-- STEP 2: Crea una tabella temporanea con gli ID da mantenere (il più vecchio di ogni gruppo)
CREATE TEMP TABLE books_to_keep AS
SELECT DISTINCT ON (title, author)
  id
FROM books
ORDER BY title, author, created_at ASC;

-- STEP 3: Identifica gli ID da eliminare
CREATE TEMP TABLE books_to_delete AS
SELECT id
FROM books
WHERE id NOT IN (SELECT id FROM books_to_keep);

-- STEP 4: Verifica quanti libri saranno eliminati
SELECT 
  'Books to keep' as status, 
  COUNT(*) as count 
FROM books_to_keep
UNION ALL
SELECT 
  'Books to delete' as status, 
  COUNT(*) as count 
FROM books_to_delete;

-- STEP 5: Elimina le book_lines associate ai libri duplicati
DELETE FROM book_lines
WHERE book_id IN (SELECT id FROM books_to_delete);

-- STEP 6: Elimina i libri duplicati
DELETE FROM books
WHERE id IN (SELECT id FROM books_to_delete);

-- STEP 7: Verifica finale - dovrebbero rimanere solo libri unici
SELECT 
  title, 
  author, 
  COUNT(*) as count
FROM books
GROUP BY title, author
HAVING COUNT(*) > 1;

-- STEP 8: Conta i libri finali
SELECT COUNT(*) as total_books FROM books;

-- STEP 9: Mostra tutti i libri rimasti
SELECT 
  title, 
  author, 
  publication_year,
  created_at
FROM books
ORDER BY title;
