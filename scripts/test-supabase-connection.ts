/**
 * Script per testare la connessione a Supabase
 * Eseguire con: npm run test:db
 */

// Carica variabili d'ambiente dal file .env
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica .env dalla root del progetto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Crea client Supabase per Node.js (senza AsyncStorage)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in .env file!');
  console.log('\n📋 Please check your .env file contains:');
  console.log('   EXPO_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disabilita session storage per Node.js
  },
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Connessione base
    console.log('1️⃣ Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('books')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      throw new Error(`Connection failed: ${healthError.message}`);
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Conteggio libri
    console.log('2️⃣ Counting books in database...');
    const { count, error: countError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Count failed: ${countError.message}`);
    }
    console.log(`✅ Found ${count} books in database\n`);

    if (count === 0) {
      console.log('⚠️  Database is empty!');
      console.log('📝 Please run the seed SQL file:');
      console.log('   - supabase/seed.sql\n');
      return;
    }

    // Test 3: Fetch primo libro
    console.log('3️⃣ Fetching first book...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .limit(1)
      .single();

    if (booksError) {
      throw new Error(`Fetch failed: ${booksError.message}`);
    }

    console.log('✅ Book fetched successfully:');
    console.log(`   Title: ${books.title}`);
    console.log(`   Author: ${books.author}`);
    console.log(`   Genres: ${books.genres?.join(', ') || 'N/A'}\n`);

    // Test 4: Fetch prima riga
    console.log('4️⃣ Fetching first book line...');
    const { data: bookLine, error: lineError } = await supabase
      .from('book_lines')
      .select('*')
      .eq('book_id', books.id)
      .single();

    if (lineError) {
      console.log('⚠️  No book line found for this book');
      console.log('   Consider adding book lines in the database\n');
    } else {
      console.log('✅ Book line fetched successfully:');
      console.log(`   "${bookLine.line_text}"\n`);
    }

    console.log('🎉 All tests passed! Your Supabase connection is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check your .env file contains correct Supabase credentials');
    console.log('2. Verify your Supabase project is active');
    console.log('3. Run the migration SQL file (supabase/migrations/...)');
    console.log('4. Run the seed SQL file (supabase/seed.sql)\n');
    process.exit(1);
  }
}

testConnection();
