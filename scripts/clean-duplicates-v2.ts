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

async function cleanDuplicatesV2() {
  try {
    console.log('🔍 Finding duplicates to remove...\n');

    // Ottieni tutti i libri ordinati
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, created_at')
      .order('title, author, created_at');

    if (booksError) {
      throw booksError;
    }

    if (!books || books.length === 0) {
      console.log('No books found');
      return;
    }

    console.log(`📚 Found ${books.length} total books`);

    // Identifica quali mantenere (il primo di ogni gruppo) e quali eliminare
    const seen = new Set<string>();
    const toKeep: string[] = [];
    const toDelete: string[] = [];

    books.forEach(book => {
      const key = `${book.title}|${book.author}`;
      if (!seen.has(key)) {
        seen.add(key);
        toKeep.push(book.id);
        console.log(`✅ Keep: "${book.title}" by ${book.author}`);
      } else {
        toDelete.push(book.id);
        console.log(`❌ Delete duplicate: "${book.title}" by ${book.author}`);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Books to keep: ${toKeep.length}`);
    console.log(`   Books to delete: ${toDelete.length}\n`);

    if (toDelete.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Elimina uno alla volta per evitare problemi
    console.log('🗑️  Deleting duplicates...');
    let deleted = 0;
    
    for (const id of toDelete) {
      // Prima elimina book_lines
      const { error: linesError } = await supabase
        .from('book_lines')
        .delete()
        .eq('book_id', id);

      if (linesError) {
        console.error(`Error deleting book_lines for ${id}:`, linesError.message);
        continue;
      }

      // Poi elimina il libro
      const { error: bookError } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (bookError) {
        console.error(`Error deleting book ${id}:`, bookError.message);
      } else {
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`   Deleted ${deleted}/${toDelete.length}...`);
        }
      }
    }

    console.log(`\n✅ Deleted ${deleted} duplicate books`);

    // Verifica finale
    const { count, error: countError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`✅ Now you have ${count} unique books in the database`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanDuplicatesV2();
