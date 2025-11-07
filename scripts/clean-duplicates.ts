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

async function cleanDuplicates() {
  try {
    console.log('🔍 Searching for duplicates...\n');

    // Ottieni tutti i libri
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .order('title, created_at');

    if (booksError) {
      throw booksError;
    }

    if (!books || books.length === 0) {
      console.log('No books found');
      return;
    }

    console.log(`📚 Found ${books.length} total books`);

    // Raggruppa per titolo e autore
    const bookGroups = new Map<string, any[]>();
    books.forEach(book => {
      const key = `${book.title}|${book.author}`;
      if (!bookGroups.has(key)) {
        bookGroups.set(key, []);
      }
      bookGroups.get(key)!.push(book);
    });

    console.log(`📖 Found ${bookGroups.size} unique books\n`);

    // Identifica duplicati
    const toDelete: string[] = [];
    bookGroups.forEach((group, key) => {
      if (group.length > 1) {
        const [title, author] = key.split('|');
        console.log(`🔄 "${title}" by ${author}: ${group.length} copies`);
        
        // Mantieni il primo (più vecchio), elimina gli altri
        const [keep, ...duplicates] = group;
        duplicates.forEach(dup => {
          toDelete.push(dup.id);
        });
      }
    });

    if (toDelete.length === 0) {
      console.log('\n✅ No duplicates found!');
      return;
    }

    console.log(`\n🗑️  Deleting ${toDelete.length} duplicate books...`);

    // Prima elimina le book_lines associate
    const { error: linesError } = await supabase
      .from('book_lines')
      .delete()
      .in('book_id', toDelete);

    if (linesError) {
      console.error('Error deleting book_lines:', linesError);
    } else {
      console.log('✅ Deleted associated book_lines');
    }

    // Poi elimina i libri duplicati
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .in('id', toDelete);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Deleted duplicate books');

    // Verifica finale
    const { count, error: countError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`\n✅ Cleanup complete! Now you have ${count} unique books in the database`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanDuplicates();
