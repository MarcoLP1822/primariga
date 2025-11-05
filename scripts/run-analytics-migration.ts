import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔧 Running analytics migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251105120000_analytics_functions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split SQL statements (basic split by semicolon + newline)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).single();
      
      if (error) {
        // If exec_sql doesn't exist, we need to run via REST API
        // This is a fallback - normally you'd use Supabase CLI or Dashboard
        console.warn(`⚠️  Could not execute via RPC. Please run migration manually in Supabase Dashboard.`);
        console.log('\n📋 Copy and paste this SQL in Supabase SQL Editor:\n');
        console.log('─'.repeat(80));
        console.log(migrationSQL);
        console.log('─'.repeat(80));
        return;
      }
    }

    console.log('\n✅ Analytics migration completed successfully!\n');
    
    // Test the functions
    console.log('🧪 Testing analytics functions...\n');
    
    // Get a random book
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id')
      .limit(1);
    
    if (booksError || !books || books.length === 0) {
      console.log('⚠️  No books found to test with');
      return;
    }

    const testBookId = books[0].id;
    console.log(`Testing with book ID: ${testBookId}`);

    // Test increment_book_view
    const { error: viewError } = await supabase.rpc('increment_book_view', { book_id: testBookId });
    
    if (viewError) {
      console.error('❌ increment_book_view failed:', viewError.message);
    } else {
      console.log('✅ increment_book_view works!');
    }

    // Test increment_book_click
    const { error: clickError } = await supabase.rpc('increment_book_click', { book_id: testBookId });
    
    if (clickError) {
      console.error('❌ increment_book_click failed:', clickError.message);
    } else {
      console.log('✅ increment_book_click works!');
    }

    // Verify counts
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('views_count, clicks_count')
      .eq('id', testBookId)
      .single();

    if (!bookError && book) {
      console.log(`\n📊 Test book stats:`);
      console.log(`   Views: ${book.views_count || 0}`);
      console.log(`   Clicks: ${book.clicks_count || 0}`);
    }

    console.log('\n🎉 Migration and tests completed!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
