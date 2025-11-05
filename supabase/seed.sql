-- Seed data per testare l'app Primariga
-- Inserisce libri di esempio con le loro prime righe

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
