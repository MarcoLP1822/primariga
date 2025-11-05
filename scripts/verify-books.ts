import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBooks() {
  console.log('🔍 Verifica libri nel database...\n');

  // Conta i libri
  const { count: bookCount, error: countError } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Errore nel conteggio:', countError.message);
    process.exit(1);
  }

  console.log(`📚 Totale libri nel database: ${bookCount}\n`);

  // Mostra alcuni libri
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select(`
      title,
      author,
      genre,
      publication_year,
      book_lines (
        line_text
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (booksError) {
    console.error('❌ Errore nel recupero libri:', booksError.message);
    process.exit(1);
  }

  console.log('📖 Ultimi 10 libri inseriti:\n');
  books?.forEach((book: any, index: number) => {
    console.log(`${index + 1}. "${book.title}" di ${book.author} (${book.publication_year})`);
    console.log(`   Generi: ${book.genre.join(', ')}`);
    if (book.book_lines && book.book_lines.length > 0) {
      const linePreview = book.book_lines[0].line_text.length > 80 
        ? book.book_lines[0].line_text.substring(0, 80) + '...'
        : book.book_lines[0].line_text;
      console.log(`   Prima riga: "${linePreview}"`);
    }
    console.log('');
  });

  console.log('✅ Verifica completata!');
}

verifyBooks();
