/**
 * Script di debug per verificare libri nel database
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carica variabili d'ambiente
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MANCANTE');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'OK' : 'MANCANTE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugBooks() {
  console.log('🔍 Verifica connessione a Supabase...\n');

  // Test 1: Connessione base
  try {
    const { data: healthCheck, error: healthError } = await supabase
      .from('books')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Errore di connessione:', healthError);
      return;
    }
    console.log('✅ Connessione al database OK\n');
  } catch (error) {
    console.error('❌ Errore critico:', error);
    return;
  }

  // Test 2: Conteggio totale libri
  const { count, error: countError } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Errore nel conteggio:', countError);
  } else {
    console.log(`📚 Totale libri nel database: ${count}\n`);
  }

  // Test 3: Primi 5 libri
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author, genre, language') // Corretto: 'genre' invece di 'genres'
    .limit(5);

  if (booksError) {
    console.error('❌ Errore nel recupero libri:', booksError);
  } else {
    console.log('📖 Primi 5 libri:');
    books?.forEach((book: any, index: number) => {
      console.log(`${index + 1}. "${book.title}" di ${book.author}`);
      console.log(`   ID: ${book.id}`);
      console.log(`   Generi: ${book.genre?.join(', ') || 'N/A'}`); // Corretto: 'genre' invece di 'genres'
      console.log(`   Lingua: ${book.language || 'N/A'}\n`);
    });
  }

  // Test 4: Conteggio book_lines
  const { count: linesCount, error: linesError } = await supabase
    .from('book_lines')
    .select('*', { count: 'exact', head: true });

  if (linesError) {
    console.error('❌ Errore nel conteggio righe:', linesError);
  } else {
    console.log(`📝 Totale righe nel database: ${linesCount}\n`);
  }

  // Test 5: Query casuale (come nell'app)
  const { data: randomBooks, error: randomError } = await supabase
    .from('books')
    .select('*')
    .limit(100);

  if (randomError) {
    console.error('❌ Errore nella query casuale:', randomError);
  } else {
    console.log(`🎲 Query casuale restituisce ${randomBooks?.length || 0} libri\n`);
    if (randomBooks && randomBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomBooks.length);
      const randomBook: any = randomBooks[randomIndex];
      console.log('✅ Libro casuale selezionato:');
      console.log(`   Titolo: ${randomBook.title}`);
      console.log(`   Autore: ${randomBook.author}`);
      console.log(`   ID: ${randomBook.id}\n`);
    }
  }

  console.log('✅ Debug completato!');
}

debugBooks().catch(console.error);
