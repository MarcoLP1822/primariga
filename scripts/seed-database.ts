import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Per il seeding usiamo la service role key per bypassare le RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (o EXPO_PUBLIC_SUPABASE_ANON_KEY) devono essere definiti nel file .env');
  console.error('💡 Per inserire dati nel database, è necessaria la SUPABASE_SERVICE_ROLE_KEY');
  console.error('   La trovi in: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Book {
  title: string;
  author: string;
  genre: string[];
  language: string;
  description: string;
  publication_year: number;
  page_count: number;
  amazon_link: string;
}

interface BookLine {
  book_title: string;
  line_text: string;
  line_number: number;
}

const books: Book[] = [
  {
    title: 'Il nome della rosa',
    author: 'Umberto Eco',
    genre: ['Giallo', 'Storico', 'Filosofico'],
    language: 'it',
    description: 'In un\'abbazia benedettina nel 1327, una serie di misteriosi omicidi turba la quiete monastica. Il frate francescano Guglielmo da Baskerville e il suo allievo Adso da Melk indagano su questi delitti, scoprendo una verità che cambierà per sempre la loro visione del mondo.',
    publication_year: 1980,
    page_count: 503,
    amazon_link: 'https://www.amazon.it/nome-della-rosa-Umberto-Eco/dp/8858123050'
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: ['Distopico', 'Fantascienza', 'Politico'],
    language: 'it',
    description: 'In un futuro totalitario, Winston Smith lavora al Ministero della Verità, dove riscrive la storia secondo le direttive del Partito. La sua vita cambia quando inizia una relazione proibita con Julia, sfidando il Grande Fratello che tutto vede.',
    publication_year: 1949,
    page_count: 328,
    amazon_link: 'https://www.amazon.it/1984-George-Orwell/dp/8804668857'
  },
  {
    title: 'Orgoglio e pregiudizio',
    author: 'Jane Austen',
    genre: ['Romantico', 'Classico'],
    language: 'it',
    description: 'La storia di Elizabeth Bennet e Mr. Darcy è un classico senza tempo che esplora temi di classe sociale, orgoglio e pregiudizio nell\'Inghilterra del XIX secolo.',
    publication_year: 1813,
    page_count: 416,
    amazon_link: 'https://www.amazon.it/Orgoglio-pregiudizio-Jane-Austen/dp/8854176842'
  },
  {
    title: 'Il piccolo principe',
    author: 'Antoine de Saint-Exupéry',
    genre: ['Favola', 'Filosofico'],
    language: 'it',
    description: 'La storia di un giovane principe che viaggia di pianeta in pianeta, incontrando personaggi bizzarri e imparando lezioni preziose sull\'amore, l\'amicizia e il senso della vita.',
    publication_year: 1943,
    page_count: 96,
    amazon_link: 'https://www.amazon.it/piccolo-principe-Antoine-Saint-Exupéry/dp/8845292762'
  },
  {
    title: 'Cent\'anni di solitudine',
    author: 'Gabriel García Márquez',
    genre: ['Realismo magico', 'Epico'],
    language: 'it',
    description: 'La saga della famiglia Buendía attraverso sette generazioni nella città immaginaria di Macondo, tra realtà e magia, amore e solitudine.',
    publication_year: 1967,
    page_count: 448,
    amazon_link: 'https://www.amazon.it/Centanni-solitudine-Gabriel-García-Márquez/dp/8804668695'
  },
  {
    title: 'Il Signore degli Anelli - La Compagnia dell\'Anello',
    author: 'J.R.R. Tolkien',
    genre: ['Fantasy', 'Avventura', 'Epico'],
    language: 'it',
    description: 'L\'inizio del viaggio epico di Frodo Baggins per distruggere l\'Anello del Potere. Con l\'aiuto della Compagnia dell\'Anello, dovrà attraversare la Terra di Mezzo per salvare il mondo dal Male.',
    publication_year: 1954,
    page_count: 576,
    amazon_link: 'https://www.amazon.it/Signore-degli-Anelli-Compagnia-dellAnello/dp/8845292894'
  },
  {
    title: 'Harry Potter e la Pietra Filosofale',
    author: 'J.K. Rowling',
    genre: ['Fantasy', 'Avventura', 'Young Adult'],
    language: 'it',
    description: 'Harry Potter scopre di essere un mago nel suo undicesimo compleanno e inizia la sua avventura alla Scuola di Magia e Stregoneria di Hogwarts, dove dovrà affrontare il suo passato e il suo destino.',
    publication_year: 1997,
    page_count: 302,
    amazon_link: 'https://www.amazon.it/Harry-Potter-Pietra-Filosofale-Vol/dp/8831003380'
  },
  {
    title: 'Il Gattopardo',
    author: 'Giuseppe Tomasi di Lampedusa',
    genre: ['Storico', 'Classico'],
    language: 'it',
    description: 'La Sicilia durante il Risorgimento vista attraverso gli occhi del Principe di Salina. Un affresco storico che racconta il declino dell\'aristocrazia e l\'ascesa della nuova borghesia.',
    publication_year: 1958,
    page_count: 288,
    amazon_link: 'https://www.amazon.it/Gattopardo-Giuseppe-Tomasi-Lampedusa/dp/8807901730'
  },
  {
    title: 'Le avventure di Pinocchio',
    author: 'Carlo Collodi',
    genre: ['Favola', 'Classico', 'Avventura'],
    language: 'it',
    description: 'Le peripezie di un burattino di legno che sogna di diventare un bambino vero. Un classico della letteratura italiana che ha incantato generazioni di lettori.',
    publication_year: 1883,
    page_count: 256,
    amazon_link: 'https://www.amazon.it/avventure-Pinocchio-Carlo-Collodi/dp/8811688493'
  },
  {
    title: 'La coscienza di Zeno',
    author: 'Italo Svevo',
    genre: ['Psicologico', 'Classico'],
    language: 'it',
    description: 'Le memorie autobiografiche di Zeno Cosini, scritte su consiglio del suo psicanalista. Un capolavoro della letteratura italiana che esplora le contraddizioni della psiche umana.',
    publication_year: 1923,
    page_count: 448,
    amazon_link: 'https://www.amazon.it/coscienza-Zeno-Italo-Svevo/dp/8807901749'
  },
  {
    title: 'Se questo è un uomo',
    author: 'Primo Levi',
    genre: ['Memoir', 'Storico', 'Testimonianza'],
    language: 'it',
    description: 'La testimonianza diretta di Primo Levi sulla sua deportazione e prigionia ad Auschwitz. Un documento fondamentale per comprendere l\'orrore dell\'Olocausto.',
    publication_year: 1947,
    page_count: 174,
    amazon_link: 'https://www.amazon.it/questo-uomo-Primo-Levi/dp/8806225561'
  },
  {
    title: 'I promessi sposi',
    author: 'Alessandro Manzoni',
    genre: ['Romanzo storico', 'Classico'],
    language: 'it',
    description: 'La storia d\'amore tra Renzo e Lucia, ostacolata dal prepotente Don Rodrigo, sullo sfondo della Lombardia del Seicento. Il più importante romanzo della letteratura italiana.',
    publication_year: 1827,
    page_count: 720,
    amazon_link: 'https://www.amazon.it/promessi-sposi-Alessandro-Manzoni/dp/8817126667'
  },
  {
    title: 'Il barone rampante',
    author: 'Italo Calvino',
    genre: ['Fantasy', 'Filosofico', 'Avventura'],
    language: 'it',
    description: 'La storia di Cosimo Piovasco di Rondò che all\'età di dodici anni decide di salire sugli alberi e di non scenderne mai più. Una favola filosofica sulla libertà e la ribellione.',
    publication_year: 1957,
    page_count: 280,
    amazon_link: 'https://www.amazon.it/barone-rampante-Italo-Calvino/dp/8804668709'
  },
  {
    title: 'Il deserto dei Tartari',
    author: 'Dino Buzzati',
    genre: ['Filosofico', 'Esistenziale'],
    language: 'it',
    description: 'Giovanni Drogo arriva alla fortezza Bastiani, un avamposto militare ai confini del deserto, dove trascorrerà la vita in attesa di un nemico che forse non arriverà mai.',
    publication_year: 1940,
    page_count: 256,
    amazon_link: 'https://www.amazon.it/deserto-dei-Tartari-Dino-Buzzati/dp/8804668717'
  },
  {
    title: 'Il giardino dei Finzi-Contini',
    author: 'Giorgio Bassani',
    genre: ['Storico', 'Romantico', 'Drammatico'],
    language: 'it',
    description: 'L\'amore impossibile tra il narratore e Micòl Finzi-Contini nella Ferrara degli anni Trenta, mentre le leggi razziali fasciste cambiano per sempre le loro vite.',
    publication_year: 1962,
    page_count: 246,
    amazon_link: 'https://www.amazon.it/giardino-Finzi-Contini-Giorgio-Bassani/dp/8807901757'
  },
  {
    title: 'Il processo',
    author: 'Franz Kafka',
    genre: ['Filosofico', 'Esistenziale', 'Surrealista'],
    language: 'it',
    description: 'Josef K. viene arrestato una mattina senza sapere di quale crimine sia accusato. Inizia così un processo kafkiano che lo condurrà attraverso i meandri di una burocrazia assurda.',
    publication_year: 1925,
    page_count: 304,
    amazon_link: 'https://www.amazon.it/processo-Franz-Kafka/dp/8807901765'
  },
  {
    title: 'Il conte di Montecristo',
    author: 'Alexandre Dumas',
    genre: ['Avventura', 'Classico', 'Storico'],
    language: 'it',
    description: 'La storia di Edmond Dantès, ingiustamente imprigionato, che fugge e trova un tesoro. Tornato come Conte di Montecristo, orchestrerà una vendetta elaborata contro chi lo ha tradito.',
    publication_year: 1844,
    page_count: 1312,
    amazon_link: 'https://www.amazon.it/conte-Montecristo-Alexandre-Dumas/dp/8811688507'
  },
  {
    title: 'Madame Bovary',
    author: 'Gustave Flaubert',
    genre: ['Classico', 'Romantico', 'Drammatico'],
    language: 'it',
    description: 'Emma Bovary, sposata a un medico di provincia, cerca di fuggire dalla noia della vita quotidiana attraverso relazioni adulterine e acquisti compulsivi, con conseguenze tragiche.',
    publication_year: 1857,
    page_count: 432,
    amazon_link: 'https://www.amazon.it/Madame-Bovary-Gustave-Flaubert/dp/8807901773'
  },
  {
    title: 'La metamorfosi',
    author: 'Franz Kafka',
    genre: ['Filosofico', 'Surrealista', 'Esistenziale'],
    language: 'it',
    description: 'Gregor Samsa si sveglia una mattina trasformato in un enorme insetto. Questo racconto esplora temi di alienazione, identità e isolamento nella società moderna.',
    publication_year: 1915,
    page_count: 96,
    amazon_link: 'https://www.amazon.it/metamorfosi-Franz-Kafka/dp/8807901781'
  },
  {
    title: 'Delitto e castigo',
    author: 'Fëdor Dostoevskij',
    genre: ['Filosofico', 'Psicologico', 'Classico'],
    language: 'it',
    description: 'Raskolnikov, uno studente povero di San Pietroburgo, commette un omicidio per mettere alla prova la sua teoria sul diritto dei grandi uomini di infrangere le leggi morali.',
    publication_year: 1866,
    page_count: 671,
    amazon_link: 'https://www.amazon.it/Delitto-castigo-Fëdor-Dostoevskij/dp/8806230867'
  }
];

const bookLines: BookLine[] = [
  { book_title: 'Il nome della rosa', line_text: 'Naturalmente un manoscritto.', line_number: 1 },
  { book_title: '1984', line_text: 'Era una fredda giornata d\'aprile, e gli orologi battevano tredici colpi.', line_number: 1 },
  { book_title: 'Orgoglio e pregiudizio', line_text: 'È una verità universalmente riconosciuta che uno scapolo in possesso di un\'ingente fortuna debba essere in cerca di moglie.', line_number: 1 },
  { book_title: 'Il piccolo principe', line_text: 'Un tempo lontano, quando avevo sei anni, in un libro sulle foreste primordiali, intitolato "Storie vissute della natura", vidi un magnifico disegno.', line_number: 1 },
  { book_title: 'Cent\'anni di solitudine', line_text: 'Molti anni dopo, di fronte al plotone di esecuzione, il colonnello Aureliano Buendía si sarebbe ricordato di quel remoto pomeriggio in cui suo padre lo aveva condotto a conoscere il ghiaccio.', line_number: 1 },
  { book_title: 'Il Signore degli Anelli - La Compagnia dell\'Anello', line_text: 'Quando Mr. Bilbo Baggins di Casa Baggins annunciò che avrebbe presto celebrato il suo centoundicesimo compleanno con una festa sontuosissima, vi fu grande eccitazione a Hobbiville, e tutta la città ne parlò.', line_number: 1 },
  { book_title: 'Harry Potter e la Pietra Filosofale', line_text: 'Mr. e Mrs. Dursley, di Privet Drive numero 4, erano orgogliosi di poter affermare che erano perfettamente normali, e grazie tante.', line_number: 1 },
  { book_title: 'Il Gattopardo', line_text: '«Nunc et in hora mortis nostrae. Amen.»', line_number: 1 },
  { book_title: 'Le avventure di Pinocchio', line_text: 'C\'era una volta... - Un re! - diranno subito i miei piccoli lettori. - No, ragazzi, avete sbagliato. C\'era una volta un pezzo di legno.', line_number: 1 },
  { book_title: 'La coscienza di Zeno', line_text: 'Il dottor S. mi ha ordinato di scrivere la mia autobiografia, con la speranza che con essa io mi prepari a quel processo psicoanalitico col quale si dice possa curare la mia malattia.', line_number: 1 },
  { book_title: 'Se questo è un uomo', line_text: 'È stato il mio buon destino di essere deportato ad Auschwitz solo nel 1944, dopo che il governo tedesco, data la crescente scarsità di mano d\'opera, aveva stabilito di allungare la vita media dei prigionieri da eliminarsi.', line_number: 1 },
  { book_title: 'I promessi sposi', line_text: 'Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene non interrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi.', line_number: 1 },
  { book_title: 'Il barone rampante', line_text: 'Fu il 15 giugno del 1767 che Cosimo Piovasco di Rondò, mio fratello, sedette per l\'ultima volta in mezzo a noi.', line_number: 1 },
  { book_title: 'Il deserto dei Tartari', line_text: 'Nel tardo pomeriggio di settembre il tenente Giovanni Drogo raggiunse la Fortezza Bastiani, sua prima destinazione come ufficiale.', line_number: 1 },
  { book_title: 'Il giardino dei Finzi-Contini', line_text: 'Da molti anni desideravo scrivere dei Finzi-Contini - di Micòl e di Alberto, del professor Ermanno e della signora Olga - e di quanti altri abitavano o come me frequentavano la casa di corso Ercole I d\'Este, a Ferrara, poco prima che scoppiasse l\'ultima guerra.', line_number: 1 },
  { book_title: 'Il processo', line_text: 'Qualcuno doveva aver calunniato Josef K. perché, senza che avesse fatto nulla di male, una mattina venne arrestato.', line_number: 1 },
  { book_title: 'Il conte di Montecristo', line_text: 'Il 24 febbraio 1815 la vedetta di Notre-Dame de la Garde segnalò l\'arrivo del tre alberi Pharaon, venendo da Smirne, Trieste e Napoli.', line_number: 1 },
  { book_title: 'Madame Bovary', line_text: 'Eravamo in sala studio, quando entrò il Preside seguito da un nuovo vestito in borghese e da un inserviente che portava un grande banco.', line_number: 1 },
  { book_title: 'La metamorfosi', line_text: 'Una mattina Gregor Samsa, destandosi da sogni inquieti, si trovò trasformato in un insetto mostruoso.', line_number: 1 },
  { book_title: 'Delitto e castigo', line_text: 'Verso sera, in una giornata straordinariamente calda all\'inizio di luglio, un giovane uscì dalla stanzetta che affittava in via S., scese in strada e si avviò, lento e quasi indeciso, verso il ponte di K.', line_number: 1 }
];

async function seedDatabase() {
  console.log('🌱 Inizio popolamento database...\n');

  try {
    // 1. Inserisci i libri
    console.log('📚 Inserimento libri...');
    const { data: insertedBooks, error: booksError } = await supabase
      .from('books')
      .insert(books)
      .select();

    if (booksError) {
      throw new Error(`Errore durante l'inserimento dei libri: ${booksError.message}`);
    }

    console.log(`✅ ${insertedBooks?.length || 0} libri inseriti con successo!\n`);

    // 2. Crea una mappa titolo -> id
    const bookIdMap = new Map<string, string>();
    insertedBooks?.forEach(book => {
      bookIdMap.set(book.title, book.id);
    });

    // 3. Inserisci le prime righe
    console.log('📝 Inserimento prime righe...');
    const bookLinesWithIds = bookLines.map(line => ({
      book_id: bookIdMap.get(line.book_title),
      line_text: line.line_text,
      line_number: line.line_number
    }));

    const { data: insertedLines, error: linesError } = await supabase
      .from('book_lines')
      .insert(bookLinesWithIds)
      .select();

    if (linesError) {
      throw new Error(`Errore durante l'inserimento delle prime righe: ${linesError.message}`);
    }

    console.log(`✅ ${insertedLines?.length || 0} prime righe inserite con successo!\n`);

    // 4. Verifica finale
    console.log('🔍 Verifica finale...');
    const { data: verification, error: verifyError } = await supabase
      .from('books')
      .select(`
        title,
        author,
        genre,
        book_lines (
          line_text
        )
      `)
      .limit(5);

    if (verifyError) {
      throw new Error(`Errore durante la verifica: ${verifyError.message}`);
    }

    console.log('\n📖 Primi 5 libri inseriti:');
    verification?.forEach((book: any) => {
      console.log(`\n- ${book.title} di ${book.author}`);
      console.log(`  Generi: ${book.genre.join(', ')}`);
      console.log(`  Prima riga: "${book.book_lines[0]?.line_text.substring(0, 80)}..."`);
    });

    console.log('\n\n🎉 Database popolato con successo!');
    console.log(`📚 Totale libri: ${insertedBooks?.length || 0}`);
    console.log(`📝 Totale prime righe: ${insertedLines?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Errore durante il popolamento del database:', error);
    process.exit(1);
  }
}

// Esegui lo script
seedDatabase();
