import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Carica le variabili d'ambiente
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('⚠️  You need to add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('   You can find it in: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function askConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('⚠️  This will DELETE 42 duplicate books. Continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function cleanDuplicatesAdmin() {
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

    // Identifica quali mantenere e quali eliminare
    const seen = new Set<string>();
    const toKeep: string[] = [];
    const toDelete: string[] = [];

    books.forEach(book => {
      const key = `${book.title}|${book.author}`;
      if (!seen.has(key)) {
        seen.add(key);
        toKeep.push(book.id);
      } else {
        toDelete.push(book.id);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Unique books: ${toKeep.length}`);
    console.log(`   Duplicates to delete: ${toDelete.length}\n`);

    if (toDelete.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Chiedi conferma
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log('❌ Operation cancelled');
      return;
    }

    // Elimina tutti i duplicati in una singola query
    console.log('\n🗑️  Deleting book_lines for duplicate books...');
    const { error: linesError } = await supabase
      .from('book_lines')
      .delete()
      .in('book_id', toDelete);

    if (linesError) {
      console.error('Error deleting book_lines:', linesError);
      throw linesError;
    }
    console.log('✅ Deleted book_lines');

    console.log('🗑️  Deleting duplicate books...');
    const { error: booksDeleteError } = await supabase
      .from('books')
      .delete()
      .in('id', toDelete);

    if (booksDeleteError) {
      console.error('Error deleting books:', booksDeleteError);
      throw booksDeleteError;
    }

    console.log(`✅ Deleted ${toDelete.length} duplicate books`);

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

cleanDuplicatesAdmin();
