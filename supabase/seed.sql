-- Seed data per testare l'app Primariga
-- Inserisce 20 libri di esempio con le loro prime righe

-- Nota: Esegui prima la migration principale (20251105000000_initial_schema.sql)

-- Inserimento libri di esempio
INSERT INTO books (title, author, genres, language, description, publication_year, page_count, amazon_link, created_at, updated_at) VALUES
(
  'Il nome della rosa',
  'Umberto Eco',
  ARRAY['Giallo', 'Storico', 'Filosofico'],
  'it',
  'In un''abbazia benedettina nel 1327, una serie di misteriosi omicidi turba la quiete monastica. Il frate francescano Guglielmo da Baskerville e il suo allievo Adso da Melk indagano su questi delitti, scoprendo una verità che cambierà per sempre la loro visione del mondo.',
  1980,
  503,
  'https://www.amazon.it/nome-della-rosa-Umberto-Eco/dp/8858123050',
  NOW(),
  NOW()
),
(
  '1984',
  'George Orwell',
  ARRAY['Distopico', 'Fantascienza', 'Politico'],
  'it',
  'In un futuro totalitario, Winston Smith lavora al Ministero della Verità, dove riscrive la storia secondo le direttive del Partito. La sua vita cambia quando inizia una relazione proibita con Julia, sfidando il Grande Fratello che tutto vede.',
  1949,
  328,
  'https://www.amazon.it/1984-George-Orwell/dp/8804668857',
  NOW(),
  NOW()
),
(
  'Orgoglio e pregiudizio',
  'Jane Austen',
  ARRAY['Romantico', 'Classico'],
  'it',
  'La storia di Elizabeth Bennet e Mr. Darcy è un classico senza tempo che esplora temi di classe sociale, orgoglio e pregiudizio nell''Inghilterra del XIX secolo.',
  1813,
  416,
  'https://www.amazon.it/Orgoglio-pregiudizio-Jane-Austen/dp/8854176842',
  NOW(),
  NOW()
),
(
  'Il piccolo principe',
  'Antoine de Saint-Exupéry',
  ARRAY['Favola', 'Filosofico'],
  'it',
  'La storia di un giovane principe che viaggia di pianeta in pianeta, incontrando personaggi bizzarri e imparando lezioni preziose sull''amore, l''amicizia e il senso della vita.',
  1943,
  96,
  'https://www.amazon.it/piccolo-principe-Antoine-Saint-Exupéry/dp/8845292762',
  NOW(),
  NOW()
),
(
  'Cent''anni di solitudine',
  'Gabriel García Márquez',
  ARRAY['Realismo magico', 'Epico'],
  'it',
  'La saga della famiglia Buendía attraverso sette generazioni nella città immaginaria di Macondo, tra realtà e magia, amore e solitudine.',
  1967,
  448,
  'https://www.amazon.it/Centanni-solitudine-Gabriel-García-Márquez/dp/8804668695',
  NOW(),
  NOW()
),
(
  'Il Signore degli Anelli - La Compagnia dell''Anello',
  'J.R.R. Tolkien',
  ARRAY['Fantasy', 'Avventura', 'Epico'],
  'it',
  'L''inizio del viaggio epico di Frodo Baggins per distruggere l''Anello del Potere. Con l''aiuto della Compagnia dell''Anello, dovrà attraversare la Terra di Mezzo per salvare il mondo dal Male.',
  1954,
  576,
  'https://www.amazon.it/Signore-degli-Anelli-Compagnia-dellAnello/dp/8845292894',
  NOW(),
  NOW()
),
(
  'Harry Potter e la Pietra Filosofale',
  'J.K. Rowling',
  ARRAY['Fantasy', 'Avventura', 'Young Adult'],
  'it',
  'Harry Potter scopre di essere un mago nel suo undicesimo compleanno e inizia la sua avventura alla Scuola di Magia e Stregoneria di Hogwarts, dove dovrà affrontare il suo passato e il suo destino.',
  1997,
  302,
  'https://www.amazon.it/Harry-Potter-Pietra-Filosofale-Vol/dp/8831003380',
  NOW(),
  NOW()
),
(
  'Il Gattopardo',
  'Giuseppe Tomasi di Lampedusa',
  ARRAY['Storico', 'Classico'],
  'it',
  'La Sicilia durante il Risorgimento vista attraverso gli occhi del Principe di Salina. Un affresco storico che racconta il declino dell''aristocrazia e l''ascesa della nuova borghesia.',
  1958,
  288,
  'https://www.amazon.it/Gattopardo-Giuseppe-Tomasi-Lampedusa/dp/8807901730',
  NOW(),
  NOW()
),
(
  'Le avventure di Pinocchio',
  'Carlo Collodi',
  ARRAY['Favola', 'Classico', 'Avventura'],
  'it',
  'Le peripezie di un burattino di legno che sogna di diventare un bambino vero. Un classico della letteratura italiana che ha incantato generazioni di lettori.',
  1883,
  256,
  'https://www.amazon.it/avventure-Pinocchio-Carlo-Collodi/dp/8811688493',
  NOW(),
  NOW()
),
(
  'La coscienza di Zeno',
  'Italo Svevo',
  ARRAY['Psicologico', 'Classico'],
  'it',
  'Le memorie autobiografiche di Zeno Cosini, scritte su consiglio del suo psicanalista. Un capolavoro della letteratura italiana che esplora le contraddizioni della psiche umana.',
  1923,
  448,
  'https://www.amazon.it/coscienza-Zeno-Italo-Svevo/dp/8807901749',
  NOW(),
  NOW()
),
(
  'Se questo è un uomo',
  'Primo Levi',
  ARRAY['Memoir', 'Storico', 'Testimonianza'],
  'it',
  'La testimonianza diretta di Primo Levi sulla sua deportazione e prigionia ad Auschwitz. Un documento fondamentale per comprendere l''orrore dell''Olocausto.',
  1947,
  174,
  'https://www.amazon.it/questo-uomo-Primo-Levi/dp/8806225561',
  NOW(),
  NOW()
),
(
  'I promessi sposi',
  'Alessandro Manzoni',
  ARRAY['Romanzo storico', 'Classico'],
  'it',
  'La storia d''amore tra Renzo e Lucia, ostacolata dal prepotente Don Rodrigo, sullo sfondo della Lombardia del Seicento. Il più importante romanzo della letteratura italiana.',
  1827,
  720,
  'https://www.amazon.it/promessi-sposi-Alessandro-Manzoni/dp/8817126667',
  NOW(),
  NOW()
),
(
  'Il barone rampante',
  'Italo Calvino',
  ARRAY['Fantasy', 'Filosofico', 'Avventura'],
  'it',
  'La storia di Cosimo Piovasco di Rondò che all''età di dodici anni decide di salire sugli alberi e di non scenderne mai più. Una favola filosofica sulla libertà e la ribellione.',
  1957,
  280,
  'https://www.amazon.it/barone-rampante-Italo-Calvino/dp/8804668709',
  NOW(),
  NOW()
),
(
  'Il deserto dei Tartari',
  'Dino Buzzati',
  ARRAY['Filosofico', 'Esistenziale'],
  'it',
  'Giovanni Drogo arriva alla fortezza Bastiani, un avamposto militare ai confini del deserto, dove trascorrerà la vita in attesa di un nemico che forse non arriverà mai.',
  1940,
  256,
  'https://www.amazon.it/deserto-dei-Tartari-Dino-Buzzati/dp/8804668717',
  NOW(),
  NOW()
),
(
  'Il giardino dei Finzi-Contini',
  'Giorgio Bassani',
  ARRAY['Storico', 'Romantico', 'Drammatico'],
  'it',
  'L''amore impossibile tra il narratore e Micòl Finzi-Contini nella Ferrara degli anni Trenta, mentre le leggi razziali fasciste cambiano per sempre le loro vite.',
  1962,
  246,
  'https://www.amazon.it/giardino-Finzi-Contini-Giorgio-Bassani/dp/8807901757',
  NOW(),
  NOW()
),
(
  'Il processo',
  'Franz Kafka',
  ARRAY['Filosofico', 'Esistenziale', 'Surrealista'],
  'it',
  'Josef K. viene arrestato una mattina senza sapere di quale crimine sia accusato. Inizia così un processo kafkiano che lo condurrà attraverso i meandri di una burocrazia assurda.',
  1925,
  304,
  'https://www.amazon.it/processo-Franz-Kafka/dp/8807901765',
  NOW(),
  NOW()
),
(
  'Il conte di Montecristo',
  'Alexandre Dumas',
  ARRAY['Avventura', 'Classico', 'Storico'],
  'it',
  'La storia di Edmond Dantès, ingiustamente imprigionato, che fugge e trova un tesoro. Tornato come Conte di Montecristo, orchestrerà una vendetta elaborata contro chi lo ha tradito.',
  1844,
  1312,
  'https://www.amazon.it/conte-Montecristo-Alexandre-Dumas/dp/8811688507',
  NOW(),
  NOW()
),
(
  'Madame Bovary',
  'Gustave Flaubert',
  ARRAY['Classico', 'Romantico', 'Drammatico'],
  'it',
  'Emma Bovary, sposata a un medico di provincia, cerca di fuggire dalla noia della vita quotidiana attraverso relazioni adulterine e acquisti compulsivi, con conseguenze tragiche.',
  1857,
  432,
  'https://www.amazon.it/Madame-Bovary-Gustave-Flaubert/dp/8807901773',
  NOW(),
  NOW()
),
(
  'La metamorfosi',
  'Franz Kafka',
  ARRAY['Filosofico', 'Surrealista', 'Esistenziale'],
  'it',
  'Gregor Samsa si sveglia una mattina trasformato in un enorme insetto. Questo racconto esplora temi di alienazione, identità e isolamento nella società moderna.',
  1915,
  96,
  'https://www.amazon.it/metamorfosi-Franz-Kafka/dp/8807901781',
  NOW(),
  NOW()
),
(
  'Delitto e castigo',
  'Fëdor Dostoevskij',
  ARRAY['Filosofico', 'Psicologico', 'Classico'],
  'it',
  'Raskolnikov, uno studente povero di San Pietroburgo, commette un omicidio per mettere alla prova la sua teoria sul diritto dei grandi uomini di infrangere le leggi morali.',
  1866,
  671,
  'https://www.amazon.it/Delitto-castigo-Fëdor-Dostoevskij/dp/8806230867',
  NOW(),
  NOW()
);

-- Inserimento prime righe dei libri
INSERT INTO book_lines (book_id, line_text, line_number, created_at) VALUES
(
  (SELECT id FROM books WHERE title = 'Il nome della rosa'),
  'Naturalmente un manoscritto.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = '1984'),
  'Era una fredda giornata d''aprile, e gli orologi battevano tredici colpi.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Orgoglio e pregiudizio'),
  'È una verità universalmente riconosciuta che uno scapolo in possesso di un''ingente fortuna debba essere in cerca di moglie.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il piccolo principe'),
  'Un tempo lontano, quando avevo sei anni, in un libro sulle foreste primordiali, intitolato "Storie vissute della natura", vidi un magnifico disegno.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Cent''anni di solitudine'),
  'Molti anni dopo, di fronte al plotone di esecuzione, il colonnello Aureliano Buendía si sarebbe ricordato di quel remoto pomeriggio in cui suo padre lo aveva condotto a conoscere il ghiaccio.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il Signore degli Anelli - La Compagnia dell''Anello'),
  'Quando Mr. Bilbo Baggins di Casa Baggins annunciò che avrebbe presto celebrato il suo centoundicesimo compleanno con una festa sontuosissima, vi fu grande eccitazione a Hobbiville, e tutta la città ne parlò.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Harry Potter e la Pietra Filosofale'),
  'Mr. e Mrs. Dursley, di Privet Drive numero 4, erano orgogliosi di poter affermare che erano perfettamente normali, e grazie tante.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il Gattopardo'),
  '«Nunc et in hora mortis nostrae. Amen.»',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Le avventure di Pinocchio'),
  'C''era una volta... - Un re! - diranno subito i miei piccoli lettori. - No, ragazzi, avete sbagliato. C''era una volta un pezzo di legno.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'La coscienza di Zeno'),
  'Il dottor S. mi ha ordinato di scrivere la mia autobiografia, con la speranza che con essa io mi prepari a quel processo psicoanalitico col quale si dice possa curare la mia malattia.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Se questo è un uomo'),
  'È stato il mio buon destino di essere deportato ad Auschwitz solo nel 1944, dopo che il governo tedesco, data la crescente scarsità di mano d''opera, aveva stabilito di allungare la vita media dei prigionieri da eliminarsi.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'I promessi sposi'),
  'Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene non interrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il barone rampante'),
  'Fu il 15 giugno del 1767 che Cosimo Piovasco di Rondò, mio fratello, sedette per l''ultima volta in mezzo a noi.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il deserto dei Tartari'),
  'Nel tardo pomeriggio di settembre il tenente Giovanni Drogo raggiunse la Fortezza Bastiani, sua prima destinazione come ufficiale.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il giardino dei Finzi-Contini'),
  'Da molti anni desideravo scrivere dei Finzi-Contini - di Micòl e di Alberto, del professor Ermanno e della signora Olga - e di quanti altri abitavano o come me frequentavano la casa di corso Ercole I d''Este, a Ferrara, poco prima che scoppiasse l''ultima guerra.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il processo'),
  'Qualcuno doveva aver calunniato Josef K. perché, senza che avesse fatto nulla di male, una mattina venne arrestato.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Il conte di Montecristo'),
  'Il 24 febbraio 1815 la vedetta di Notre-Dame de la Garde segnalò l''arrivo del tre alberi Pharaon, venendo da Smirne, Trieste e Napoli.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Madame Bovary'),
  'Eravamo in sala studio, quando entrò il Preside seguito da un nuovo vestito in borghese e da un inserviente che portava un grande banco.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'La metamorfosi'),
  'Una mattina Gregor Samsa, destandosi da sogni inquieti, si trovò trasformato in un insetto mostruoso.',
  1,
  NOW()
),
(
  (SELECT id FROM books WHERE title = 'Delitto e castigo'),
  'Verso sera, in una giornata straordinariamente calda all''inizio di luglio, un giovane uscì dalla stanzetta che affittava in via S., scese in strada e si avviò, lento e quasi indeciso, verso il ponte di K.',
  1,
  NOW()
);

-- Verifica inserimento
SELECT 
  b.title, 
  b.author, 
  b.genres, 
  bl.line_text as "Prima Riga"
FROM books b
LEFT JOIN book_lines bl ON b.id = bl.book_id
ORDER BY b.created_at DESC;
