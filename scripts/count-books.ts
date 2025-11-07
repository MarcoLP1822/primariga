import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carica le variabili d'ambiente
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countBooks() {
  try {
    console.log('🔍 Counting books in database...\n');

    // Conta i libri
    const { count, error: countError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`📚 Total books in database: ${count}\n`);

    // Ottieni tutti i libri con titolo e autore
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, publication_year')
      .order('title');

    if (booksError) {
      throw booksError;
    }

    if (books && books.length > 0) {
      console.log('📖 List of all books:\n');
      books.forEach((book, index) => {
        console.log(`${index + 1}. "${book.title}" - ${book.author} (${book.publication_year})`);
      });
    }

    console.log(`\n✅ Total: ${books?.length || 0} books found`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

countBooks();
