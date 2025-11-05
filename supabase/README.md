# 🚀 Setup Supabase per Primariga

## 📋 Prerequisiti

- Account Supabase (gratuito): [supabase.com](https://supabase.com)

## 1️⃣ Crea il Progetto Supabase

1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clicca **"New Project"**
3. Compila i campi:
   - **Name**: `primariga`
   - **Database Password**: scegli una password forte e salvala
   - **Region**: `Europe West` (Frankfurt) per l'Italia
   - **Pricing Plan**: `Free` (gratuito)
4. Clicca **"Create new project"** e attendi 2-3 minuti

## 2️⃣ Esegui la Migration del Database

1. Vai nella dashboard del progetto
2. Clicca su **"SQL Editor"** nella sidebar sinistra
3. Clicca **"New query"**
4. Copia e incolla tutto il contenuto del file:
   ```
   supabase/migrations/20251105000000_initial_schema.sql
   ```
5. Clicca **"Run"** (o premi Ctrl/Cmd + Enter)
6. Verifica che appaia il messaggio di successo ✅

## 3️⃣ Ottieni le Chiavi API

1. Vai su **"Settings"** (icona ingranaggio in basso a sinistra)
2. Clicca su **"API"**
3. Copia questi valori:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: la chiave più lunga che inizia con `eyJ...`

## 4️⃣ Configura le Variabili d'Ambiente

1. Nel progetto, copia il file `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Apri `.env` e compila con i valori copiati:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 5️⃣ Verifica l'Installazione

1. Vai su **"Table Editor"** nella dashboard Supabase
2. Dovresti vedere queste tabelle:
   - ✅ `profiles`
   - ✅ `books`
   - ✅ `book_lines`
   - ✅ `user_interactions`
   - ✅ `user_reading_history`

3. Verifica i dati di test:
   - Clicca su `books` → dovresti vedere 3 libri di esempio
   - Clicca su `book_lines` → dovresti vedere 3 prime righe

## 📊 Schema del Database

### Tabelle Principali

#### `profiles`
Profili utente estesi (collegati ad `auth.users`)
- `id`: UUID (riferimento a auth.users)
- `username`: TEXT
- `full_name`: TEXT
- `avatar_url`: TEXT
- `bio`: TEXT

#### `books`
Catalogo libri
- `id`: UUID
- `title`, `author`, `isbn`
- `cover_image_url`, `publisher`, `publication_year`
- `genre`: TEXT[] (array)
- `description`, `page_count`, `language`
- Link store: `amazon_link`, `ibs_link`, `mondadori_link`

#### `book_lines`
Prime righe dei libri
- `id`: UUID
- `book_id`: UUID → books
- `line_text`: TEXT (la prima riga del libro)
- `line_number`: INTEGER (default 1)

#### `user_interactions`
Traccia like/dislike/skip/purchase
- `user_id`: UUID → profiles
- `book_id`: UUID → books
- `interaction_type`: ENUM ('like', 'dislike', 'skip', 'purchase')

#### `user_reading_history`
Storico letture
- `user_id`: UUID → profiles
- `book_id`: UUID → books
- `read_at`: TIMESTAMP
- `reading_duration_seconds`: INTEGER

## 🔒 Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato:
- ✅ Gli utenti possono leggere i propri dati
- ✅ Gli utenti possono modificare solo i propri dati
- ✅ I libri sono pubblici (read-only per tutti)
- ✅ Le prime righe sono pubbliche

## 🎯 Next Steps

Dopo aver completato il setup:
1. ✅ Riavvia il server Expo per caricare le nuove variabili d'ambiente
2. ✅ Testa la connessione con: `npm start`
3. ✅ Procedi con l'implementazione del Core Domain Layer

## 🆘 Troubleshooting

### "Error: Missing environment variables"
→ Verifica che `.env` esista e contenga i valori corretti

### "Error: Invalid API key"
→ Assicurati di aver copiato la chiave `anon public` (non `service_role`)

### "Error: Connection refused"
→ Verifica che il Project URL sia corretto e che il progetto sia attivo

### "Migration failed"
→ Vai su SQL Editor > History e controlla gli errori specifici
